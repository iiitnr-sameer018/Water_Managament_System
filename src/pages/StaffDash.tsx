import React, { useState } from 'react';
import { Camera, ClipboardList, Clock, CheckCircle, User as UserIcon, LogOut, MapPin, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData } from '../context/AppContext';
import type { ComplaintStatus } from '../context/mockData';
import { motion } from 'framer-motion';

const statusConfig: Record<string, { badge: string }> = {
    'Submitted': { badge: 'badge-primary' },
    'Verified': { badge: 'badge-info' },
    'In Progress': { badge: 'badge-warning' },
    'Completed': { badge: 'badge-success' },
};

const StaffDash: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { complaints, ratings, updateComplaintStatus, addWorkNotes, updateETA, addStaffPhoto } = useData();
    const [notesState, setNotesState] = useState<{ [key: string]: string }>({});
    const [etaState, setEtaState] = useState<{ [key: string]: string }>({});
    const [staffImages, setStaffImages] = useState<{ [key: string]: string }>({});

    if (!user) return null;

    const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setStaffImages(prev => ({ ...prev, [id]: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const myTasks = complaints.filter(c => c.assignedStaffId === user.id);
    const activeTasks = myTasks.filter(c => c.status !== 'Completed').length;
    const resolvedTasks = myTasks.filter(c => c.status === 'Completed').length;
    const myComplaintIds = myTasks.map(t => t.id);
    const staffRatings = ratings.filter(r => myComplaintIds.includes(r.complaint_id));
    const avgRating = staffRatings.length ? staffRatings.reduce((a, r) => a + r.rating, 0) / staffRatings.length : 0;
    const baseScore = myTasks.length ? (resolvedTasks / myTasks.length) * 80 : 100;
    const performanceScore = Math.min(100, Math.round(baseScore + (avgRating * 4)));

    const handleSaveUpdates = (id: string) => {
        if (notesState[id]) addWorkNotes(id, notesState[id]);
        if (etaState[id]) updateETA(id, etaState[id]);
        if (staffImages[id]) addStaffPhoto(id, staffImages[id]);
        alert('Updates saved successfully!');
    };

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 120px)', padding: '32px 0 64px' }}>
            <div className="container">
                {/* Header Card */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'var(--grad-dark)', borderRadius: 'var(--radius-xl)', padding: '32px',
                        color: 'white', marginBottom: '24px', boxShadow: 'var(--shadow-2xl)', position: 'relative', overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                    <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 1 }}>
                        <div className="flex items-center gap-4">
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: 'var(--radius-lg)' }}>
                                <ClipboardList size={28} color="#38bdf8" />
                            </div>
                            <div>
                                <h2 style={{ color: 'white', margin: '0 0 4px', fontWeight: 800, fontSize: '1.375rem' }}>Staff Portal</h2>
                                <p style={{ margin: 0, color: 'var(--slate-400)', fontSize: '0.875rem' }}>{user.name} • {user.email}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--slate-300)' }}>Performance:</span>
                                    <span style={{
                                        background: performanceScore > 80 ? 'rgba(74,222,128,0.15)' : 'rgba(250,204,21,0.15)',
                                        color: performanceScore > 80 ? '#4ade80' : '#facc15',
                                        padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700
                                    }}>
                                        {performanceScore}% • {performanceScore > 80 ? 'EXCELLENT' : 'GOOD'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-8" style={{ textAlign: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '2rem', color: '#38bdf8', fontWeight: 800 }}>{activeTasks}</h3>
                                <p style={{ margin: 0, color: 'var(--slate-400)', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Active</p>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '2rem', color: '#4ade80', fontWeight: 800 }}>{resolvedTasks}</h3>
                                <p style={{ margin: 0, color: 'var(--slate-400)', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Resolved</p>
                            </div>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', gap: '6px' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </motion.div>

                {/* Section Title */}
                <div className="flex items-center gap-3 mb-5">
                    <div style={{ width: '4px', height: '28px', background: 'var(--grad-saffron)', borderRadius: '2px' }} />
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.375rem' }}>Assigned Complaints ({myTasks.length})</h2>
                </div>

                {myTasks.length === 0 ? (
                    <div className="card-static text-center" style={{ padding: '64px 32px' }}>
                        <ClipboardList size={48} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontWeight: 700, margin: '0 0 8px' }}>No tasks assigned</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Check back later for new assignments</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
                        {myTasks.map(task => {
                            const isCompleted = task.status === 'Completed';
                            const cfg = statusConfig[task.status] || statusConfig['Submitted'];
                            const taskRating = ratings.find(r => r.complaint_id === task.id);

                            return (
                                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                                        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--slate-200)',
                                        opacity: isCompleted ? 0.85 : 1
                                    }}
                                >
                                    {/* Task Header */}
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-100)' }}>
                                        <div className="flex justify-between items-center">
                                            <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-main)' }}>#{task.id}</span>
                                            <span className={`badge ${cfg.badge}`}>{task.status}</span>
                                        </div>
                                        <p style={{ fontWeight: 700, margin: '8px 0 4px', fontSize: '0.9375rem', textTransform: 'capitalize' }}>{task.type.replace('_', ' ')}</p>
                                        <p className="flex items-center gap-1 text-sm text-muted" style={{ margin: 0 }}><MapPin size={14} /> {task.location}</p>
                                    </div>

                                    {/* Description */}
                                    <div style={{ padding: '16px 24px', background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-100)' }}>
                                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>"{task.description}"</p>
                                    </div>

                                    {/* Image */}
                                    {task.imageUrl && (
                                        <div style={{ position: 'relative' }}>
                                            <img src={task.imageUrl} alt="Complaint" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                            <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.6875rem', fontWeight: 600 }}>Reported Photo</span>
                                        </div>
                                    )}

                                    {/* Action Area */}
                                    <div style={{ padding: '20px 24px' }}>
                                        {!isCompleted ? (
                                            <div className="flex-col gap-4">
                                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                                    <label className="form-label">Update Status</label>
                                                    <select className="form-control" value={task.status}
                                                        onChange={e => updateComplaintStatus(task.id, e.target.value as ComplaintStatus)}
                                                    >
                                                        <option value="Verified">Verified</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </div>
                                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                                    <label className="form-label"><Clock size={14} /> ETA</label>
                                                    <input className="form-control" type="text" placeholder="e.g. 24 hours"
                                                        value={etaState[task.id] !== undefined ? etaState[task.id] : (task.eta || '')}
                                                        onChange={e => setEtaState({ ...etaState, [task.id]: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                                    <label className="form-label">Work Notes</label>
                                                    <textarea className="form-control" rows={2} placeholder="Progress notes..."
                                                        value={notesState[task.id] !== undefined ? notesState[task.id] : (task.workNotes || '')}
                                                        onChange={e => setNotesState({ ...notesState, [task.id]: e.target.value })}
                                                        style={{ resize: 'none' }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '16px' }}>
                                                    <div>
                                                        <input type="file" id={`photo-${task.id}`} accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handlePhotoUpload(task.id, e)} />
                                                        <label htmlFor={`photo-${task.id}`} className="btn btn-outline btn-sm" style={{ cursor: 'pointer', gap: '4px' }}>
                                                            <Camera size={14} /> {staffImages[task.id] ? '✓ Photo' : 'Proof Photo'}
                                                        </label>
                                                    </div>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveUpdates(task.id)} style={{ gap: '4px' }}>
                                                        <ClipboardList size={14} /> Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--success-light)', borderRadius: 'var(--radius-md)' }}>
                                                <div className="flex items-center justify-center gap-2 mb-2" style={{ color: 'var(--success)', fontWeight: 800 }}>
                                                    <CheckCircle size={20} /> Task Resolved
                                                </div>
                                                {taskRating && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <div className="flex items-center justify-center gap-1" style={{ color: '#eab308' }}>
                                                            {Array(taskRating.rating).fill(0).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>User Rating: {taskRating.rating}/5</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffDash;
