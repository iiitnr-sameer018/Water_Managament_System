import React, { useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useAuth, useData } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter: React.FC = () => {
    const { user } = useAuth();
    const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'complaint_created': return '📋';
            case 'assigned': return '👷';
            case 'status_changed': return '🔄';
            case 'completed': return '✅';
            case 'escalated': return '⚠️';
            case 'sla_warning': return '⏰';
            default: return '🔔';
        }
    };

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '8px', borderRadius: 'var(--radius-md)',
                    transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
                <Bell size={22} color="var(--text-secondary)" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '2px', right: '2px',
                        background: 'var(--error)', color: 'white',
                        borderRadius: 'var(--radius-full)', minWidth: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.625rem', fontWeight: 800, border: '2px solid white',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                                width: '380px', maxHeight: '480px', background: 'white',
                                borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-2xl)',
                                border: '1px solid var(--slate-200)', zIndex: 999,
                                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '16px 20px', borderBottom: '1px solid var(--slate-100)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Notifications</h4>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllNotificationsRead()}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                            }}
                                        >
                                            <CheckCheck size={14} /> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                        <X size={16} color="var(--text-muted)" />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Bell size={32} color="var(--slate-300)" style={{ margin: '0 auto 8px' }} />
                                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 20).map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => { if (!n.is_read) markNotificationRead(n.id); }}
                                            style={{
                                                padding: '14px 20px', borderBottom: '1px solid var(--slate-50)',
                                                background: n.is_read ? 'white' : 'var(--primary-light)',
                                                cursor: n.is_read ? 'default' : 'pointer',
                                                transition: 'background 0.2s',
                                                display: 'flex', gap: '12px', alignItems: 'flex-start',
                                            }}
                                        >
                                            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{getIcon(n.type)}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: n.is_read ? 600 : 800, fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                                                    {n.title}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                                                    {n.message}
                                                </div>
                                                <div style={{ fontSize: '0.6875rem', color: 'var(--text-light)', marginTop: '4px' }}>
                                                    {formatTime(n.created_at)}
                                                </div>
                                            </div>
                                            {!n.is_read && (
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
