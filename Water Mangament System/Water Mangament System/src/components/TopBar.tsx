import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Wifi, WifiOff } from 'lucide-react';

const TopBar: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    };
    const dateStr = time.toLocaleDateString('en-IN', dateOptions);
    const timeStr = time.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });

    return (
        <div id="top-info-bar" style={{
            background: 'var(--slate-900)',
            color: 'var(--slate-300)',
            fontSize: '0.8rem',
            padding: '6px 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            zIndex: 200
        }}>
            <div className="container flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {/* Left: Location + Font Size */}
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1" style={{ color: 'var(--slate-400)' }}>
                        <MapPin size={13} />
                        <span style={{ fontWeight: 500 }}>India</span>
                    </span>
                    <span style={{ width: '1px', height: '14px', background: 'var(--slate-700)' }} />
                    <span className="flex items-center gap-1" style={{ color: 'var(--slate-400)' }}>
                        <Globe size={13} />
                        <span style={{ fontWeight: 500 }}>{dateStr}</span>
                        <span style={{ color: 'var(--slate-500)' }}>•</span>
                        <span style={{ fontWeight: 600, color: 'var(--slate-300)' }}>{timeStr}</span>
                    </span>
                </div>

                {/* Right: System Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2" style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${isOnline ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
                        background: isOnline ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                    }}>
                        {isOnline ? (
                            <>
                                <div style={{
                                    width: '6px', height: '6px',
                                    borderRadius: '50%',
                                    background: '#4ade80',
                                    boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }} />
                                <Wifi size={12} color="#4ade80" />
                                <span style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.75rem' }}>Online</span>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    width: '6px', height: '6px',
                                    borderRadius: '50%',
                                    background: '#f87171'
                                }} />
                                <WifiOff size={12} color="#f87171" />
                                <span style={{ fontWeight: 600, color: '#f87171', fontSize: '0.75rem' }}>Offline</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
