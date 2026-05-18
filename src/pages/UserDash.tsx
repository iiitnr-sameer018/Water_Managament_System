import React, { useState } from 'react';
import { Star, Bell, Filter, User as UserIcon, LogOut, MapPin, Calendar, MessageSquare, ChevronRight, ImageIcon } from 'lucide-react';
import { useAuth, useData } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { color: string; bg: string; badge: string }> = {
    'Submitted': { color: 'var(--primary)', bg: 'var(--primary-light)', badge: 'badge-primary' },
    'Verified': { color: '#0369a1', bg: 'var(--info-light)', badge: 'badge-info' },
    'In Progress': { color: '#92400e', bg: 'var(--warning-light)', badge: 'badge-warning' },
    'Completed': { color: 'var(--success)', bg: 'var(--success-light)', badge: 'badge-success' },
};

const UserDash: React.FC = () => {
    const { user, logout } = useAuth();
    const { complaints, ratings, rateComplaint } = useData();
    const navigate = useNavigate();
    const [ratingState, setRatingState] = useState<{ [key: string]: { rate: number; hover: number; feedback: string; showUI: boolean } }>({});

    if (!user) return null;

    const myComplaints = complaints.filter(c => c.userId === user.id).sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
    const notifications = myComplaints.filter(c => c.status !== 'Submitted').slice(0, 5);

    const handleRatingSubmit = (id: string) => {
        const d = ratingState[id];
        if (d?.rate > 0) { rateComplaint(id, d.rate, d.feedback); setRatingState(p => ({ ...p, [id]: { ...p[id], showUI: false } })); }
    };

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 120px)', padding: '32px 0 64px' }}>
            <div className="container">
                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white', borderRadius: 'var(--radius-xl)', padding: '24px 28px',
                        display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px',
                        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--slate-200)', flexWrap: 'wrap'
                    }}
                >
                    <div style={{
                        background: 'var(--grad-blue)', width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)', flexShrink: 0
                    }}>
                        <UserIcon size={28} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '1.25rem' }}>{user.name}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</p>
                        <span className="badge badge-primary mt-2">Verified Citizen</span>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                    {/* Main Content */}
                    <div>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-3">
                                <div style={{ width: '4px', height: '28px', background: 'var(--grad-blue)', borderRadius: '2px' }} />
                                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.375rem' }}>My Complaints ({myComplaints.length})</h2>
                            </div>
                        </div>

                        {/* Empty State */}
                        {myComplaints.length === 0 ? (
                            <div className="card-static text-center" style={{ padding: '64px 32px' }}>
                                <MessageSquare size={48} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
                                <h3 style={{ fontWeight: 700, margin: '0 0 8px' }}>No complaints yet</h3>
                                <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>Report your first water issue to get started</p>
                                <button onClick={() => navigate('/register')} className="btn btn-primary">Report Issue</button>
                            </div>
                        ) : (
                            <div className="flex-col gap-4">
                                {myComplaints.map(comp => {
                                    const cfg = statusConfig[comp.status] || statusConfig['Submitted'];
                                    const isCompleted = comp.status === 'Completed';
                                    const compRating = ratings.find(r => r.complaint_id === comp.id);
                                    const rs = ratingState[comp.id];

                                    return (
                                        <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px',
                                                boxShadow: 'var(--shadow-xs)', border: '1px solid var(--slate-200)',
                                                borderLeft: `4px solid ${cfg.color}`, transition: 'box-shadow 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-xs)'}
                                        >
                                            {/* Title Row */}
                                            <div className="flex justify-between items-start mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                                                        #{comp.id} — {comp.type.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <div className="flex items-center gap-4 mt-1" style={{ flexWrap: 'wrap' }}>
                                                        <span className="flex items-center gap-1 text-sm text-muted"><MapPin size={14} /> {comp.location}</span>
                                                        <span className="flex items-center gap-1 text-sm text-muted"><Calendar size={14} /> {new Date(comp.dateSubmitted).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className={`badge ${cfg.badge}`}>{comp.status}</span>
                                            </div>

                                            {/* Uploaded Photo */}
                                            {comp.imageUrl && (
                                                <div style={{ marginBottom: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--slate-200)' }}>
                                                        <ImageIcon size={13} /> Uploaded Photo
                                                    </div>
                                                    <img src={comp.imageUrl} alt="Complaint evidence"
                                                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                                        onClick={() => window.open(comp.imageUrl, '_blank')}
                                                    />
                                                </div>
                                            )}

                                            {/* Work Notes */}
                                            {comp.workNotes && (
                                                <div style={{ padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '12px', borderLeft: '3px solid var(--primary)' }}>
                                                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px', fontSize: '0.75rem' }}>Latest Update:</strong>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{comp.workNotes}</span>
                                                </div>
                                            )}

                                            {/* Rating CTA */}
                                            {isCompleted && !compRating && !rs?.showUI && (
                                                <button onClick={() => setRatingState(p => ({ ...p, [comp.id]: { rate: 0, hover: 0, feedback: '', showUI: true } }))}
                                                    className="btn btn-outline btn-sm mt-2" style={{ gap: '6px' }}
                                                >
                                                    <Star size={16} /> Give Feedback
                                                </button>
                                            )}

                                            {/* Rating UI */}
                                            {isCompleted && !compRating && rs?.showUI && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                    style={{ background: 'var(--slate-50)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)', marginTop: '12px' }}
                                                >
                                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: '0 0 12px' }}>Rate your experience</p>
                                                    <div className="flex gap-2 mb-4">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={32}
                                                                style={{ cursor: 'pointer', transition: 'all 0.15s ease', transform: (rs.hover || rs.rate) >= s ? 'scale(1.15)' : 'scale(1)' }}
                                                                fill={(rs.hover || rs.rate) >= s ? '#fbbf24' : 'none'}
                                                                color={(rs.hover || rs.rate) >= s ? '#fbbf24' : 'var(--slate-300)'}
                                                                onMouseEnter={() => setRatingState(p => ({ ...p, [comp.id]: { ...p[comp.id], hover: s } }))}
                                                                onMouseLeave={() => setRatingState(p => ({ ...p, [comp.id]: { ...p[comp.id], hover: 0 } }))}
                                                                onClick={() => setRatingState(p => ({ ...p, [comp.id]: { ...p[comp.id], rate: s } }))}
                                                            />
                                                        ))}
                                                    </div>
                                                    <textarea className="form-control mb-3" rows={2} placeholder="Share your feedback (optional)..."
                                                        value={rs.feedback} onChange={e => setRatingState(p => ({ ...p, [comp.id]: { ...p[comp.id], feedback: e.target.value } }))}
                                                        style={{ resize: 'none' }}
                                                    />
                                                    <div className="flex gap-3">
                                                        <button className="btn btn-primary btn-sm flex-1" onClick={() => handleRatingSubmit(comp.id)} disabled={rs.rate === 0}>Submit</button>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => setRatingState(p => ({ ...p, [comp.id]: { ...p[comp.id], showUI: false } }))}>Cancel</button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Existing Rating */}
                                            {compRating && (
                                                <div style={{ marginTop: '12px', background: 'var(--success-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(22,163,74,0.15)' }}>
                                                    <div className="flex justify-between items-center">
                                                        <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8125rem' }}>Thank you for your feedback!</span>
                                                        <div className="flex gap-1">{Array(compRating.rating).fill(0).map((_, i) => <Star key={i} size={14} fill="#eab308" color="#eab308" />)}</div>
                                                    </div>
                                                    {compRating.feedback_text && <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--success)', fontStyle: 'italic' }}>"{compRating.feedback_text}"</p>}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="flex-col gap-5 hide-mobile">
                        {/* Notifications */}
                        <div className="card-static" style={{ padding: '20px' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="flex items-center gap-2 m-0" style={{ fontSize: '0.9375rem', fontWeight: 700 }}><Bell size={18} color="var(--primary)" /> Notifications</h4>
                                {notifications.length > 0 && <span className="badge badge-error" style={{ fontSize: '0.6875rem' }}>{notifications.length}</span>}
                            </div>
                            {notifications.length === 0 ? (
                                <p className="text-muted text-sm text-center" style={{ padding: '20px 0' }}>No new updates</p>
                            ) : (
                                <div className="flex-col gap-2">
                                    {notifications.map(n => (
                                        <div key={`n-${n.id}`} style={{
                                            borderLeft: `3px solid ${statusConfig[n.status]?.color || 'var(--primary)'}`,
                                            padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                                        }}>
                                            <h5 style={{ margin: '0 0 2px', fontSize: '0.8125rem', fontWeight: 700 }}>#{n.id}</h5>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {n.status}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Helpline */}
                        <div style={{
                            background: 'var(--grad-dark)', borderRadius: 'var(--radius-lg)', padding: '24px', color: 'white'
                        }}>
                            <h4 style={{ color: 'white', margin: '0 0 8px', fontWeight: 800, fontSize: '1rem' }}>Need Help?</h4>
                            <p style={{ fontSize: '0.8125rem', margin: '0 0 16px', color: 'var(--slate-400)' }}>24/7 helpline for water emergencies</p>
                            <button className="btn w-full" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, border: 'none' }}>
                                Call 1916
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    div[style*="grid-template-columns: 1fr 320px"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default UserDash;
