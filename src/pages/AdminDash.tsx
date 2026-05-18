import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Users, Map, ShieldAlert, FileSpreadsheet, ShieldCheck, ClipboardList, Clock, CheckCircle, LogOut, Search, TrendingUp, UserPlus, Trash2, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HeatmapMap from '../components/HeatmapMap';
import { useData, useAuth } from '../context/AppContext';
import { motion } from 'framer-motion';


const AdminDash = () => {
    const { complaints, users, ratings, assignStaff, addStaffMember, removeStaffMember } = useData();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'analytics' | 'complaints' | 'staff' | 'management'>('analytics');
    const [searchQuery, setSearchQuery] = useState('');
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffPhone, setNewStaffPhone] = useState('');
    const [staffLoading, setStaffLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    if (!user) return null;

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Completed').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Verified').length;
    const staffList = users.filter(u => u.role === 'staff');
    const avgRating = ratings.length ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1) : '0';

    const categoryData = [
        { name: 'Leakage', count: complaints.filter(c => c.type === 'leakage').length },
        { name: 'No Water', count: complaints.filter(c => c.type === 'no_water').length },
        { name: 'Dirty Water', count: complaints.filter(c => c.type === 'dirty_water').length },
        { name: 'Low Pressure', count: complaints.filter(c => c.type === 'low_pressure').length },
    ];

    const statusData = [
        { name: 'Submitted', value: complaints.filter(c => c.status === 'Submitted').length },
        { name: 'Verified', value: complaints.filter(c => c.status === 'Verified').length },
        { name: 'In Progress', value: inProgress },
        { name: 'Completed', value: resolved },
    ];

    const trendData = [
        { date: 'Week 1', count: Math.max(0, total - 8) },
        { date: 'Week 2', count: Math.max(0, total - 5) },
        { date: 'Week 3', count: Math.max(0, total - 2) },
        { date: 'Week 4', count: total },
    ];

    const COLORS = ['#3b82f6', '#0ea5e9', '#f97316', '#16a34a'];

    const filteredComplaints = searchQuery
        ? complaints.filter(c => c.id.includes(searchQuery) || c.location.toLowerCase().includes(searchQuery.toLowerCase()) || c.type.toLowerCase().includes(searchQuery.toLowerCase()))
        : complaints;

    const handleAddStaff = async () => {
        if (!newStaffName.trim() || !newStaffEmail.trim()) { 
            alert('Please fill in both name and email.'); 
            return; 
        }
        setStaffLoading(true);
        try {
            await addStaffMember(newStaffName.trim(), newStaffEmail.trim(), newStaffPhone.trim() || undefined);
            setNewStaffName(''); 
            setNewStaffEmail(''); 
            setNewStaffPhone('');
            alert('✅ Staff member added successfully!');
        } catch (err: any) { 
            console.error("Staff addition error:", err);
            const msg = err?.message || 'Failed to add staff'; 
            alert(`❌ Error: ${msg}\n\nNote: This might be due to a database schema mismatch. Please ensure all tables are updated.`); 
        }
        setStaffLoading(false);
    };

    const handleRemoveStaff = async (staffId: string) => {
        setStaffLoading(true);
        try {
            await removeStaffMember(staffId);
            setConfirmDelete(null);
            alert('Staff member removed.');
        } catch (err: unknown) { const msg = err instanceof Error ? err.message : 'Failed to remove staff'; alert(msg); }
        setStaffLoading(false);
    };

    const tabs = [
        { key: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
        { key: 'complaints', label: 'Complaints', icon: <ClipboardList size={16} /> },
        { key: 'staff', label: 'Staff Management', icon: <Users size={16} /> },
        { key: 'management', label: 'Live Map', icon: <Map size={16} /> },
    ];

    const kpiCards = [
        { label: 'Total Complaints', value: total, icon: <ClipboardList size={20} />, color: 'var(--primary)', bg: 'var(--primary-light)', trend: '↑ 12%', trendColor: 'var(--success)' },
        { label: 'Pending', value: pending, icon: <Clock size={20} />, color: '#ea580c', bg: 'var(--secondary-light)', trend: `${pending} awaiting`, trendColor: 'var(--text-muted)' },
        { label: 'Resolved', value: resolved, icon: <CheckCircle size={20} />, color: 'var(--success)', bg: 'var(--success-light)', trend: `${total ? Math.round((resolved / total) * 100) : 0}% rate`, trendColor: 'var(--success)' },
        { label: 'Avg. Rating', value: avgRating, icon: <Users size={20} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', trend: `${ratings.length} reviews`, trendColor: 'var(--text-muted)' },
    ];

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 120px)', padding: '32px 0 64px' }}>
            <div className="container">
                {/* Admin Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}
                >
                    <div className="flex items-center gap-4">
                        <div style={{ background: 'var(--grad-blue)', width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)' }}>
                            <ShieldCheck size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem' }}>Admin Console</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {user.name} • System Administrator
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn btn-outline btn-sm" style={{ gap: '6px' }}><FileSpreadsheet size={16} /> Export</button>
                        <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm" style={{ gap: '6px', color: 'var(--error)' }}><LogOut size={16} /> Logout</button>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {kpiCards.map((kpi, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--slate-200)', borderTop: `3px solid ${kpi.color}` }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</span>
                                <div style={{ background: kpi.bg, padding: '6px', borderRadius: 'var(--radius-sm)', color: kpi.color }}>{kpi.icon}</div>
                            </div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>{kpi.value}</h3>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: kpi.trendColor }}>{kpi.trend}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Tab Nav */}
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '4px', marginBottom: '24px', boxShadow: 'var(--shadow-xs)', border: '1px solid var(--slate-200)', display: 'flex', gap: '4px' }}>
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)}
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none',
                                background: activeTab === t.key ? 'var(--primary)' : 'transparent',
                                color: activeTab === t.key ? 'white' : 'var(--text-muted)',
                                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Analytics */}
                {activeTab === 'analytics' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                        <div className="card-static" style={{ padding: '24px' }}>
                            <h4 style={{ fontWeight: 700, margin: '0 0 20px', fontSize: '0.9375rem' }}>Issues by Category</h4>
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-100)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-muted)' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-lg)' }} />
                                        <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={36} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card-static" style={{ padding: '24px' }}>
                            <h4 style={{ fontWeight: 700, margin: '0 0 20px', fontSize: '0.9375rem' }}>Status Distribution</h4>
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                                            {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-lg)' }} />
                                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card-static" style={{ padding: '24px', gridColumn: '1 / -1' }}>
                            <h4 style={{ fontWeight: 700, margin: '0 0 20px', fontSize: '0.9375rem' }}>Reporting Trends</h4>
                            <div style={{ height: '260px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate-100)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-muted)' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-lg)' }} />
                                        <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#cGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complaints Table */}
                {activeTab === 'complaints' && (
                    <div className="card-static" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <h4 style={{ margin: 0, fontWeight: 700 }}>All Complaints</h4>
                            <div className="flex gap-3">
                                <div className="flex items-center" style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: '0 12px', border: '1px solid var(--slate-200)' }}>
                                    <Search size={16} color="var(--text-muted)" />
                                    <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        style={{ border: 'none', outline: 'none', padding: '8px', background: 'transparent', fontSize: '0.8125rem', width: '160px' }}
                                    />
                                </div>
                                <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
                            </div>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Type</th><th>Location</th><th>Status</th><th>Assigned Staff</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredComplaints.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{c.id}</td>
                                            <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{c.type.replace('_', ' ')}</td>
                                            <td style={{ color: 'var(--text-muted)', maxWidth: '200px' }} className="truncate">{c.location}</td>
                                            <td><span className={`badge ${c.status === 'Completed' ? 'badge-success' : c.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`}>{c.status}</span></td>
                                            <td>
                                                <select className="form-control" style={{ padding: '6px 8px', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)', width: 'auto' }}
                                                    value={c.assignedStaffId || ""} onChange={e => assignStaff(c.id, e.target.value)}
                                                >
                                                    <option value="" disabled>Unassigned</option>
                                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Staff Management */}
                {activeTab === 'staff' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
                        {/* Add Staff Form */}
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card-static" style={{ padding: '28px', alignSelf: 'start' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div style={{ background: 'var(--grad-green)', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserPlus size={20} color="white" />
                                </div>
                                <h4 style={{ margin: 0, fontWeight: 700 }}>Add New Staff</h4>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-control" type="text" placeholder="e.g. Rahul Sharma" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><Mail size={14} /> Email Address</label>
                                <input className="form-control" type="email" placeholder="e.g. rahul@example.com" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><Phone size={14} /> Mobile Number</label>
                                <input className="form-control" type="tel" placeholder="e.g. 9876543210" value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)} maxLength={10} />
                            </div>
                            <button className="btn btn-primary w-full" onClick={handleAddStaff} disabled={staffLoading} style={{ gap: '8px' }}>
                                <UserPlus size={16} /> {staffLoading ? 'Adding...' : 'Add Staff Member'}
                            </button>
                        </motion.div>

                        {/* Staff List */}
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card-static" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--slate-200)' }} className="flex justify-between items-center">
                                <h4 className="flex items-center gap-2" style={{ margin: 0, fontWeight: 700 }}><Users size={18} color="var(--primary)" /> Current Staff ({staffList.length})</h4>
                            </div>
                            {staffList.length === 0 ? (
                                <div className="text-center" style={{ padding: '48px' }}>
                                    <Users size={40} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No staff members yet. Add one to get started.</p>
                                </div>
                            ) : (
                                <div>
                                    {staffList.map(s => {
                                        const assignedCount = complaints.filter(c => c.assignedStaffId === s.id && c.status !== 'Completed').length;
                                        const resolvedCount = complaints.filter(c => c.assignedStaffId === s.id && c.status === 'Completed').length;
                                        return (
                                            <div key={s.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-50)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ background: 'var(--grad-blue)', width: '44px', height: '44px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                                                    {(s.name || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>{s.name}</div>
                                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{s.email}{s.phone ? ` • 📱 ${s.phone}` : ''}</div>
                                                    <div className="flex gap-3 mt-1">
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{assignedCount} active</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>{resolvedCount} resolved</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Score: {s.performance_score ?? 100}%</span>
                                                    </div>
                                                </div>
                                                {confirmDelete === s.id ? (
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-sm" style={{ background: 'var(--error)', color: 'white', border: 'none', gap: '4px', fontSize: '0.75rem' }} onClick={() => handleRemoveStaff(s.id)} disabled={staffLoading}>
                                                            Confirm
                                                        </button>
                                                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)} style={{ fontSize: '0.75rem' }}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', gap: '4px' }} onClick={() => setConfirmDelete(s.id)}>
                                                        <Trash2 size={15} /> Remove
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* Management / Map */}
                {activeTab === 'management' && (
                    <div>
                        <div className="card-static mb-5" style={{ padding: '24px' }}>
                            <h4 className="flex items-center gap-2 mb-4" style={{ fontWeight: 700, margin: '0 0 16px' }}><Map size={18} color="var(--primary)" /> Live Complaint Heatmap</h4>
                            <HeatmapMap showHeatmap={true} showPins={true} height="500px" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div className="card-static" style={{ padding: '24px' }}>
                                <h4 className="flex items-center gap-2" style={{ fontWeight: 700, margin: '0 0 16px' }}><Users size={18} color="var(--primary)" /> Maintenance Crew</h4>
                                {staffList.map(s => (
                                    <div key={s.id} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--slate-100)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                                        </div>
                                        <span className="badge badge-success">Active</span>
                                    </div>
                                ))}
                            </div>
                            <div className="card-static" style={{ padding: '24px' }}>
                                <h4 className="flex items-center gap-2" style={{ fontWeight: 700, margin: '0 0 16px' }}><ShieldAlert size={18} color="var(--secondary)" /> Alerts</h4>
                                <div className="flex-col gap-3">
                                    <div style={{ background: 'var(--warning-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--warning)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>High Volume Warning</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 reports in Rohini area within 1 hour</div>
                                    </div>
                                    <div style={{ background: 'var(--info-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--info)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Staff Re-assignment</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff #210 back online</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDash;
