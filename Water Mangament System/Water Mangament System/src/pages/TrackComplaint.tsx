import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle, Clock, MapPin, Calendar, FileText, Loader2 } from 'lucide-react';
import { useData } from '../context/AppContext';
import type { ComplaintStatus, Complaint } from '../context/mockData';
import { motion } from 'framer-motion';

const steps = [
    { step: 'Submitted', desc: 'Complaint registered', icon: <FileText size={16} /> },
    { step: 'Verified', desc: 'Reviewed by local node', icon: <CheckCircle size={16} /> },
    { step: 'In Progress', desc: 'Staff dispatched', icon: <Clock size={16} /> },
    { step: 'Completed', desc: 'Resolved & closed', icon: <CheckCircle size={16} /> },
];

const TrackComplaint: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { complaints } = useData();
    const [trackingId, setTrackingId] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
    const [result, setResult] = useState<Complaint | null>(null);

    const handleSearch = (idToSearch: string) => {
        if (!idToSearch) return;
        setStatus('searching');
        setTimeout(() => {
            const found = complaints.find(c => c.id === idToSearch);
            if (found) { setResult(found); setStatus('found'); } else { setStatus('not-found'); }
        }, 600);
    };

    useEffect(() => {
        const id = new URLSearchParams(location.search).get('id');
        if (id) { setTrackingId(id); handleSearch(id); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const getPercentage = (s: ComplaintStatus) => ({ 'Submitted': 25, 'Verified': 50, 'In Progress': 75, 'Completed': 100 }[s] || 0);
    const percentage = result ? getPercentage(result.status as ComplaintStatus) : 0;

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 120px)', padding: '32px 0' }}>
            <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
                {/* Search Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white', borderRadius: 'var(--radius-xl)', padding: '40px 32px',
                        textAlign: 'center', boxShadow: 'var(--shadow-md)', border: '1px solid var(--slate-200)',
                        marginBottom: '24px', position: 'relative', overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--grad-blue)' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px' }}>{t('track_title', 'Track Your Complaint')}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0 0 28px', fontSize: '0.9375rem' }}>
                        {t('track_subtitle', 'Enter your tracking ID to view real-time status')}
                    </p>
                    <div className="flex justify-center">
                        <div className="flex" style={{
                            borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: '480px', width: '100%',
                            border: '2px solid var(--slate-200)', background: 'var(--slate-50)',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--slate-200)'}
                        >
                            <input type="text" placeholder={t('track_input_placeholder', 'Enter 6-digit ID')}
                                style={{ border: 'none', padding: '14px 20px', outline: 'none', flex: 1, fontSize: '1.1rem', letterSpacing: '3px', fontWeight: 700, background: 'transparent', color: 'var(--primary)' }}
                                value={trackingId} onChange={e => setTrackingId(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch(trackingId); }}
                            />
                            <button className="btn btn-primary" onClick={() => handleSearch(trackingId)}
                                disabled={status === 'searching' || !trackingId}
                                style={{ borderRadius: '0 10px 10px 0', padding: '14px 24px', margin: '4px' }}
                            >
                                {status === 'searching' ? <Loader2 className="animate-spin" size={22} /> : <Search size={22} />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Not Found */}
                {status === 'not-found' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="card-static text-center" style={{ padding: '48px' }}
                    >
                        <Search size={48} style={{ margin: '0 auto 16px', color: 'var(--slate-300)' }} />
                        <h3 style={{ margin: '0 0 8px' }}>No Records Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Please verify your tracking ID and try again.</p>
                    </motion.div>
                )}

                {/* Found */}
                {status === 'found' && result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--slate-200)' }}
                    >
                        {/* Top Section */}
                        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--slate-100)' }}>
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Tracking ID</span>
                                    <h2 style={{ margin: '4px 0 0', color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>#{result.id}</h2>
                                    <p style={{ margin: '4px 0 0', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{result.type.replace('_', ' ')}</p>
                                </div>
                                <span className={`badge ${percentage === 100 ? 'badge-success' : percentage >= 50 ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                                    {result.status}
                                </span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{ padding: '24px 32px', background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-100)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Location</span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-main)' }}>{result.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reported On</span>
                                        <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-main)' }}>{new Date(result.dateSubmitted).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                {result.eta && (
                                    <div className="flex items-start gap-3">
                                        <Clock size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expected Resolution</span>
                                            <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-main)' }}>{result.eta}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--slate-200)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Description</span>
                                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.description}</p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div style={{ padding: '28px 32px' }}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 style={{ margin: 0, fontWeight: 700 }}>Progress</h4>
                                <span style={{ fontWeight: 700, color: percentage === 100 ? 'var(--success)' : 'var(--primary)', fontSize: '0.875rem' }}>
                                    {percentage}%
                                </span>
                            </div>
                            <div className="progress-bar mb-8">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                                    className="progress-bar-fill" style={{ background: percentage === 100 ? 'var(--grad-green)' : 'var(--grad-blue)' }}
                                />
                            </div>

                            {/* Timeline */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
                                {steps.map((phase, i) => {
                                    const threshold = (i + 1) * 25;
                                    const isActive = percentage >= threshold;
                                    const isCurrent = percentage === threshold;
                                    return (
                                        <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                                            {i > 0 && (
                                                <div style={{
                                                    position: 'absolute', top: '18px', left: '-50%', right: '50%', height: '2px',
                                                    background: isActive ? 'var(--success)' : 'var(--slate-200)',
                                                    transition: 'background 0.3s'
                                                }} />
                                            )}
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: isActive ? 'var(--success)' : 'white',
                                                border: `2px solid ${isActive ? 'var(--success)' : 'var(--slate-300)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 10px', position: 'relative', zIndex: 1,
                                                color: isActive ? 'white' : 'var(--slate-400)',
                                                boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                {phase.icon}
                                            </div>
                                            <h5 style={{ margin: '0 0 2px', fontSize: '0.8125rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                                {phase.step}
                                            </h5>
                                            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-light)' }}>{phase.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Image */}
                        {result.imageUrl && (
                            <div style={{ padding: '0 32px 32px' }}>
                                <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '24px' }}>
                                    <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9375rem' }}>Attached Photo</h4>
                                    <img src={result.imageUrl} alt="evidence" style={{ maxWidth: '360px', width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', objectFit: 'cover' }} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TrackComplaint;
