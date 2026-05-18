import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useData } from '../context/AppContext';
import { getSLAStatus } from '../services/slaService';

const L = window.L;

const createCustomIcon = (status: string, priority: string) => {
    if (!L) return undefined;
    const colors: Record<string, string> = {
        'Completed': '#10b981',
        'In Progress': '#f59e0b',
        'Verified': '#3b82f6',
        'Submitted': '#ef4444',
    };
    const borderColors: Record<string, string> = {
        'CRITICAL': '#dc2626', 'HIGH': '#ea580c', 'NORMAL': '#ffffff', 'LOW': '#94a3b8'
    };
    const bg = colors[status] || '#ef4444';
    const border = borderColors[priority] || '#ffffff';

    return new L.DivIcon({
        className: 'custom-map-marker',
        html: `<div style="
            background:${bg}; width:28px; height:28px; border-radius:50%;
            border:3px solid ${border}; box-shadow:0 4px 8px rgba(0,0,0,0.3);
            display:flex; align-items:center; justify-content:center;
            transition:transform 0.2s;
        "><div style="width:8px;height:8px;background:white;border-radius:50%;"></div></div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
    });
};

// Heatmap layer component
const HeatmapLayer: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
    const map = useMap();
    const layerRef = useRef<L.Layer | null>(null);

    useEffect(() => {
        if (!L || !L.heatLayer) return;
        if (layerRef.current) map.removeLayer(layerRef.current);

        const heat = L.heatLayer(points, {
            radius: 35, blur: 25, maxZoom: 17, max: 1.0,
            gradient: { 0.2: '#3b82f6', 0.4: '#06b6d4', 0.6: '#fbbf24', 0.8: '#f97316', 1.0: '#ef4444' }
        });
        heat.addTo(map);
        layerRef.current = heat;

        return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
    }, [points, map]);

    return null;
};

interface Props {
    showHeatmap?: boolean;
    showPins?: boolean;
    height?: string;
}

const HeatmapMap: React.FC<Props> = ({ showHeatmap = true, showPins = true, height = '500px' }) => {
    const { complaints } = useData();
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    useEffect(() => {
        if (window.L) setLeafletLoaded(true);
        else { const t = setTimeout(() => setLeafletLoaded(true), 200); return () => clearTimeout(t); }
    }, []);

    const geoComplaints = complaints.filter(c => c.lat && c.lon);
    const heatPoints: [number, number, number][] = geoComplaints.map(c => {
        const intensity = c.status === 'Completed' ? 0.3 : c.priority === 'CRITICAL' ? 1.0 : c.priority === 'HIGH' ? 0.8 : 0.5;
        return [c.lat!, c.lon!, intensity];
    });

    // Center on Naya Raipur
    const center: [number, number] = geoComplaints.length > 0
        ? [geoComplaints.reduce((s, c) => s + c.lat!, 0) / geoComplaints.length, geoComplaints.reduce((s, c) => s + c.lon!, 0) / geoComplaints.length]
        : [21.1610, 81.7870];

    // Area aggregation
    const areaStats: Record<string, { count: number; active: number }> = {};
    geoComplaints.forEach(c => {
        const area = c.location?.split(',')[0]?.trim() || 'Unknown';
        if (!areaStats[area]) areaStats[area] = { count: 0, active: 0 };
        areaStats[area].count++;
        if (c.status !== 'Completed') areaStats[area].active++;
    });
    const hotZones = Object.entries(areaStats).filter(([, d]) => d.active >= 2).sort((a, b) => b[1].active - a[1].active);

    return (
        <div>
            <div style={{ height, width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--slate-200)', position: 'relative', zIndex: 0 }}>
                <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    {leafletLoaded && showHeatmap && <HeatmapLayer points={heatPoints} />}
                    {leafletLoaded && showPins && geoComplaints.map(c => {
                        const sla = getSLAStatus(c);
                        return (
                            <Marker key={c.id} position={[c.lat!, c.lon!]} icon={createCustomIcon(c.status, c.priority)}>
                                <Popup>
                                    <div style={{ minWidth: '200px', padding: '4px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9375rem', marginBottom: '4px' }}>#{c.id}</div>
                                        <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '4px' }}>{c.type.replace('_', ' ')}</div>
                                        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '8px' }}>{c.location}</div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ background: c.status === 'Completed' ? '#dcfce7' : '#fee2e2', color: c.status === 'Completed' ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{c.status}</span>
                                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: c.priority === 'CRITICAL' ? '#dc2626' : c.priority === 'HIGH' ? '#ea580c' : '#64748b' }}>{c.priority}</span>
                                        </div>
                                        {sla.status !== 'safe' && c.status !== 'Completed' && (
                                            <div style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, color: sla.color }}>⏰ SLA: {sla.label}</div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Hot Zone Alerts */}
            {hotZones.length > 0 && (
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {hotZones.map(([area, data]) => (
                        <div key={area} style={{
                            background: data.active >= 3 ? 'var(--error-light)' : 'var(--warning-light)',
                            padding: '12px 16px', borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${data.active >= 3 ? 'var(--error)' : 'var(--warning)'}`,
                        }}>
                            <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: data.active >= 3 ? 'var(--error)' : '#92400e' }}>
                                🔥 {area}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {data.active} active / {data.count} total
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeatmapMap;
