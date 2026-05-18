import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useData } from '../context/AppContext';

// We must dynamically load Leaflet directly for its L object styling
const L = window.L;

const createCustomIcon = (isResolved: boolean) => {
    if (!L) return undefined;

    // Create highly-visible modern circle markers using HTML DivIcon
    return new L.DivIcon({
        className: 'custom-map-marker',
        html: `<div style="
            background-color: ${isResolved ? '#10b981' : '#ef4444'};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const AdminMap: React.FC = () => {
    const { complaints } = useData();
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    useEffect(() => {
        // Wait for leaflet to be available globally (it gets mounted via react-leaflet)
        if (window.L) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLeafletLoaded(true);
        } else {
            const timer = setTimeout(() => setLeafletLoaded(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    // Center on Naya Raipur since our mock data features it
    const position: [number, number] = [21.1610, 81.7870];

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}>
            <MapContainer center={position} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {leafletLoaded && complaints.map((complaint) => {
                    if (complaint.lat && complaint.lon) {
                        const isResolved = complaint.status === 'Completed';
                        return (
                            <Marker
                                key={complaint.id}
                                position={[complaint.lat, complaint.lon]}
                                icon={createCustomIcon(isResolved)}
                            >
                                <Popup>
                                    <div style={{ textAlign: 'center' }}>
                                        <strong>#{complaint.id} - {complaint.type.replace('_', ' ').toUpperCase()}</strong>
                                        <div style={{ margin: '4px 0', fontSize: '0.85rem' }}>{complaint.location}</div>
                                        <span style={{
                                            background: isResolved ? 'var(--success)' : 'var(--error)',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {complaint.status}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
};

export default AdminMap;
