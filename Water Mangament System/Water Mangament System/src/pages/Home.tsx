import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, ArrowRight, Activity, Star, ShieldCheck, FileText, Search, LayoutDashboard, AlertTriangle, Phone } from 'lucide-react';
import { useData } from '../context/AppContext';
import StatsCounter from '../components/StatsCounter';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { ratings, users } = useData();
    const [trackId, setTrackId] = useState('');

    const handleTrackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackId) navigate(`/track?id=${trackId}`);
    };

    const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };
    const itemV = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    const quickActions = [
        { icon: <AlertTriangle size={24} />, title: 'Report Issue', desc: 'File a water complaint', color: '#DC2626', bg: 'var(--error-light)', to: '/register' },
        { icon: <Search size={24} />, title: 'Track Complaint', desc: 'Check real-time status', color: 'var(--primary)', bg: 'var(--primary-light)', to: '/track' },
        { icon: <Star size={24} />, title: 'Reviews', desc: 'Citizen feedback', color: '#eab308', bg: 'var(--warning-light)', to: '/#reviews' },
        { icon: <LayoutDashboard size={24} />, title: 'Dashboard', desc: 'View your complaints', color: 'var(--success)', bg: 'var(--success-light)', to: '/dashboard' },
    ];

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
            {/* ── HERO ── */}
            <motion.section
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
                style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'linear-gradient(145deg, #0f1b3d 0%, #1E3A8A 30%, #1e40af 55%, #0EA5E9 100%)',
                    minHeight: '90vh',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 'clamp(64px, 10vw, 120px) 0 clamp(80px, 12vw, 140px)',
                }}
            >
                {/* Pattern overlay */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10C30 10 40 20 40 30C40 35.52 35.52 40 30 40C24.48 40 20 35.52 20 30C20 20 30 10 30 10Z' fill='%23fff'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px'
                }} />
                {/* Glow orbs */}
                <div style={{ position:'absolute', top:'-15%', right:'-8%', width:'700px', height:'700px', background:'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 65%)', borderRadius:'50%' }} />
                <div style={{ position:'absolute', bottom:'-25%', left:'-8%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)', borderRadius:'50%' }} />
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'900px', height:'900px', background:'radial-gradient(circle, rgba(30,58,138,0.15) 0%, transparent 50%)', borderRadius:'50%' }} />

                <div style={{ position: 'relative', zIndex: 1, width:'100%', maxWidth:'1400px', margin:'0 auto', padding:'0 clamp(24px, 4vw, 64px)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 200px', alignItems:'center', gap:'clamp(24px, 4vw, 60px)' }}>

                        {/* LEFT — PM Card */}
                        <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5, duration:0.7 }}
                            style={{
                                display:'flex', flexDirection:'column', alignItems:'center',
                                background:'rgba(255,255,255,0.07)',
                                backdropFilter:'blur(20px) saturate(150%)',
                                WebkitBackdropFilter:'blur(20px) saturate(150%)',
                                border:'1px solid rgba(255,255,255,0.12)',
                                borderRadius:'var(--radius-2xl)',
                                padding:'28px 20px 24px',
                                boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
                                transition:'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                width:'110px', height:'110px', borderRadius:'50%',
                                padding:'3px', marginBottom:'16px',
                                background:'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                                boxShadow:'0 8px 24px rgba(0,0,0,0.2)'
                            }}>
                                <img src="/img/pm.jpg" alt="Shri Narendra Modi"
                                    style={{ width:'104px', height:'104px', borderRadius:'50%', objectFit:'cover', objectPosition:'top', background:'var(--slate-300)', display:'block' }}
                                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=PM+Modi&background=1e3a8a&color=fff&size=104&bold=true`; }}
                                />
                            </div>
                            <span style={{ color:'white', fontWeight:800, fontSize:'0.9375rem', textAlign:'center', marginBottom:'4px' }}>Shri Narendra Modi</span>
                            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', fontWeight:500, textAlign:'center', lineHeight:1.4 }}>Hon'ble Prime Minister of India</span>
                        </motion.div>

                        {/* CENTER — Main Content */}
                        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.7 }}
                            style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}
                        >
                            {/* Emblem */}
                            <div style={{ marginBottom:'28px' }}>
                                <div style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(12px)', borderRadius:'50%', padding:'14px', border:'1px solid rgba(255,255,255,0.12)', display:'inline-block' }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem"
                                        style={{ width:'64px', height:'auto', filter:'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' }}
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Badge */}
                            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, duration:0.5 }}
                                style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.08)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'var(--radius-full)', padding:'8px 20px', marginBottom:'24px', fontSize:'0.8125rem', fontWeight:600, color:'rgba(255,255,255,0.9)', letterSpacing:'0.5px' }}
                            >
                                <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 8px rgba(74,222,128,0.6)' }} />
                                Smart City Initiative • Digital India
                            </motion.div>

                            {/* Title */}
                            <h1 style={{
                                color:'white', fontSize:'clamp(1.75rem, 4.5vw, 3.25rem)', fontWeight:900,
                                lineHeight:1.1, letterSpacing:'-0.03em',
                                fontFamily:'var(--font-display)',
                                textShadow:'0 4px 12px rgba(0,0,0,0.2)',
                                margin:'0 0 24px'
                            }}>
                                Smart Water Complaint<br/>&amp; Alert Management System
                            </h1>

                            {/* Subtitle */}
                            <p style={{
                                color:'rgba(255,255,255,0.8)', fontSize:'clamp(0.95rem, 1.8vw, 1.2rem)',
                                maxWidth:'540px', margin:'0 auto 40px', lineHeight:1.8, fontWeight:400
                            }}>
                                Report water issues quickly with fast and transparent resolution.
                                Empowering citizens through digital governance.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex justify-center" style={{ gap:'20px', flexWrap:'wrap' }}>
                                <motion.button
                                    whileHover={{ scale:1.06, boxShadow:'0 16px 40px rgba(249,115,22,0.5)' }}
                                    whileTap={{ scale:0.96 }}
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background:'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color:'white',
                                        padding:'16px 40px', borderRadius:'var(--radius-xl)', fontWeight:700,
                                        border:'none', cursor:'pointer', fontSize:'1.05rem',
                                        display:'flex', alignItems:'center', gap:'12px',
                                        boxShadow:'0 8px 24px rgba(234,88,12,0.4)',
                                        fontFamily:'var(--font-display)', transition:'all 0.3s ease'
                                    }}
                                >
                                    Report Complaint <ArrowRight size={20} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale:1.06, background:'rgba(255,255,255,0.18)' }}
                                    whileTap={{ scale:0.96 }}
                                    onClick={() => { document.getElementById('track-section')?.scrollIntoView({ behavior:'smooth' }); }}
                                    style={{
                                        background:'rgba(255,255,255,0.1)', color:'white',
                                        padding:'16px 40px', borderRadius:'var(--radius-xl)', fontWeight:700,
                                        border:'1.5px solid rgba(255,255,255,0.25)', cursor:'pointer', fontSize:'1.05rem',
                                        backdropFilter:'blur(12px)', fontFamily:'var(--font-display)',
                                        transition:'all 0.3s ease', display:'flex', alignItems:'center', gap:'10px'
                                    }}
                                >
                                    <Search size={19} /> Track Complaint
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* RIGHT — CM Card */}
                        <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5, duration:0.7 }}
                            style={{
                                display:'flex', flexDirection:'column', alignItems:'center',
                                background:'rgba(255,255,255,0.07)',
                                backdropFilter:'blur(20px) saturate(150%)',
                                WebkitBackdropFilter:'blur(20px) saturate(150%)',
                                border:'1px solid rgba(255,255,255,0.12)',
                                borderRadius:'var(--radius-2xl)',
                                padding:'28px 20px 24px',
                                boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
                                transition:'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                width:'110px', height:'110px', borderRadius:'50%',
                                padding:'3px', marginBottom:'16px',
                                background:'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                                boxShadow:'0 8px 24px rgba(0,0,0,0.2)'
                            }}>
                                <img src="/img/cm.jpg" alt="Shri Vishnu Deo Sai"
                                    style={{ width:'104px', height:'104px', borderRadius:'50%', objectFit:'cover', objectPosition:'top', background:'var(--slate-300)', display:'block' }}
                                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=VD+Sai&background=1e3a8a&color=fff&size=104&bold=true`; }}
                                />
                            </div>
                            <span style={{ color:'white', fontWeight:800, fontSize:'0.9375rem', textAlign:'center', marginBottom:'4px' }}>Shri Vishnu Deo Sai</span>
                            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', fontWeight:500, textAlign:'center', lineHeight:1.4 }}>Hon'ble Chief Minister, Chhattisgarh</span>
                        </motion.div>

                    </div>
                </div>
            </motion.section>

            {/* ── QUICK ACTIONS ── */}
            <div className="container" style={{ transform:'translateY(-40px)' }}>
                <motion.div variants={containerV} initial="hidden" animate="visible"
                    style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px' }}
                >
                    {quickActions.map((a, i) => (
                        <motion.div key={i} variants={itemV}
                            onClick={() => a.to.startsWith('#') ? null : navigate(a.to)}
                            style={{
                                background:'white', borderRadius:'var(--radius-xl)', padding:'24px',
                                cursor:'pointer', boxShadow:'var(--shadow-md)', border:'1px solid var(--slate-200)',
                                transition:'all 0.25s ease', display:'flex', alignItems:'center', gap:'16px'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-xl)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
                        >
                            <div style={{ width:'48px', height:'48px', borderRadius:'var(--radius-md)', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}>
                                {a.icon}
                            </div>
                            <div>
                                <h4 style={{ margin:0, fontSize:'0.9375rem', fontWeight:700, color:'var(--text-main)' }}>{a.title}</h4>
                                <p style={{ margin:0, fontSize:'0.8125rem', color:'var(--text-muted)' }}>{a.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <div className="container" style={{ paddingBottom:'64px' }}>
                {/* ── STATS ── */}
                <motion.section initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
                    style={{ marginBottom:'48px' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ width:'4px', height:'28px', background:'var(--grad-blue)', borderRadius:'2px' }} />
                        <h2 style={{ margin:0, fontWeight:800, fontSize:'1.5rem' }}>Platform Statistics</h2>
                    </div>
                    <StatsCounter />
                </motion.section>

                {/* ── TRACK + AWARENESS ── */}
                <div id="track-section" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'24px', marginBottom:'48px' }}>
                    {/* Track Card */}
                    <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                        className="card-static" style={{ padding:'32px', borderTop:'4px solid var(--highlight)' }}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div style={{ background:'var(--highlight-light)', padding:'12px', borderRadius:'var(--radius-md)' }}>
                                <ShieldCheck size={24} color="var(--highlight)" />
                            </div>
                            <h3 style={{ margin:0, fontSize:'1.25rem' }}>Track Your Complaint</h3>
                        </div>
                        <p style={{ color:'var(--text-muted)', marginBottom:'24px', fontSize:'0.9rem' }}>
                            Enter your 6-digit Tracking ID for real-time status and updates.
                        </p>
                        <form onSubmit={handleTrackSubmit} className="flex-col gap-3">
                            <input id="track-input" type="text" placeholder="e.g. 123456"
                                value={trackId} onChange={e => setTrackId(e.target.value)}
                                className="form-control" style={{ fontSize:'1.1rem', fontWeight:600, letterSpacing:'3px', padding:'14px 16px' }}
                            />
                            <motion.button whileHover={trackId ? { scale:1.02 } : {}} whileTap={trackId ? { scale:0.98 } : {}}
                                type="submit" disabled={!trackId}
                                className="btn btn-primary w-full" style={{ padding:'14px', opacity:trackId?1:0.5, cursor:trackId?'pointer':'not-allowed' }}
                            >
                                <Search size={18} /> Track Status
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Awareness Card */}
                    <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                        style={{
                            background:'linear-gradient(135deg, #F97316, #FB923C)', borderRadius:'var(--radius-xl)',
                            padding:'32px', color:'white', display:'flex', flexDirection:'column', justifyContent:'center',
                            position:'relative', overflow:'hidden', boxShadow:'var(--shadow-saffron)'
                        }}
                    >
                        <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', background:'rgba(255,255,255,0.1)', borderRadius:'50%' }} />
                        <span style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', opacity:0.85, marginBottom:'12px' }}>National Awareness</span>
                        <div style={{ fontSize:'clamp(2rem, 5vw, 2.75rem)', fontWeight:900, lineHeight:1.15, marginBottom:'16px', fontFamily:'var(--font-display)', textShadow:'0 2px 4px rgba(0,0,0,0.1)' }}>
                            "जल है तो कल है"
                        </div>
                        <p style={{ fontSize:'1rem', opacity:0.9, lineHeight:1.7, margin:0, fontWeight:500 }}>
                            Preserving every drop for a sustainable Digital India. Together for clean, accessible water.
                        </p>
                    </motion.div>
                </div>

                {/* ── ANALYTICS CARD ── */}
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                    className="card-static" style={{ padding:'32px', background:'linear-gradient(135deg, #f0fdf4, #dcfce7)', border:'1px solid #bbf7d0', marginBottom:'48px' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ background:'var(--success)', padding:'10px', borderRadius:'var(--radius-md)' }}>
                            <Activity size={22} color="white" />
                        </div>
                        <h3 style={{ margin:0, color:'var(--success)' }}>Impact Analytics</h3>
                    </div>
                    <div className="flex-col gap-5">
                        {[{ label:'Resolution Rate', value:'94%', width:'94%' }, { label:'Active Response Time', value:'< 24 Hrs', width:'85%' }].map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-2" style={{ fontWeight:700, color:'#166534', fontSize:'0.875rem' }}>
                                    <span>{s.label}</span><span>{s.value}</span>
                                </div>
                                <div style={{ height:'8px', background:'rgba(22,163,74,0.15)', borderRadius:'4px', overflow:'hidden' }}>
                                    <motion.div initial={{ width:0 }} whileInView={{ width:s.width }} transition={{ duration:1.5, ease:'easeOut', delay:i*0.2 }}
                                        style={{ height:'100%', background:'var(--grad-green)', borderRadius:'4px' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── REVIEWS ── */}
                <motion.section id="reviews" initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                    style={{ marginBottom:'48px' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ width:'4px', height:'28px', background:'linear-gradient(135deg, #eab308, #f59e0b)', borderRadius:'2px' }} />
                        <h2 style={{ margin:0, fontWeight:800, fontSize:'1.5rem' }}>Citizen Feedback</h2>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px' }}>
                        {ratings.length === 0 ? (
                            <div className="card-static text-center" style={{ padding:'48px', gridColumn:'1/-1' }}>
                                <Star size={40} color="var(--slate-300)" style={{ margin:'0 auto 16px' }} />
                                <p style={{ color:'var(--text-muted)', fontStyle:'italic' }}>No feedback available yet. Be the first to share!</p>
                            </div>
                        ) : (
                            ratings.slice(-4).reverse().map((r, idx) => {
                                const u = users.find(u => u.id === r.user_id);
                                return (
                                    <motion.div key={r.id || idx} whileHover={{ y:-3 }}
                                        className="card-static" style={{ padding:'24px', borderLeft:'4px solid #eab308' }}
                                    >
                                        <div className="flex gap-1 mb-3" style={{ color:'#eab308' }}>
                                            {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                            {Array.from({ length: 5 - r.rating }).map((_, i) => <Star key={`e-${i}`} size={16} color="var(--slate-300)" />)}
                                        </div>
                                        <p style={{ margin:'0 0 12px', fontSize:'0.9rem', color:'var(--text-secondary)', fontStyle:'italic', lineHeight:1.6 }}>
                                            "{r.feedback_text || 'Great service.'}"
                                        </p>
                                        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600 }}>— {u?.name || 'Citizen'}</span>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </motion.section>

                {/* ── HELPLINE CTA ── */}
                <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                    style={{
                        background:'var(--grad-dark)', borderRadius:'var(--radius-xl)', padding:'40px',
                        display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'24px',
                        boxShadow:'var(--shadow-2xl)'
                    }}
                >
                    <div>
                        <h3 style={{ color:'white', margin:'0 0 8px', fontSize:'1.375rem', fontWeight:800 }}>Need Urgent Help?</h3>
                        <p style={{ color:'var(--slate-400)', margin:0, fontSize:'0.9375rem' }}>Our 24/7 helpline is available for water emergencies</p>
                    </div>
                    <button className="btn btn-lg" style={{ background:'white', color:'var(--primary)', fontWeight:700, border:'none', gap:'8px', boxShadow:'var(--shadow-lg)' }}>
                        <Phone size={20} /> Call 1916
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
