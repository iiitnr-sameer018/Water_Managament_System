import React, { useState } from 'react';
import { CheckCircle, LogIn, Upload, MapPin, Droplet, Zap, CloudRain, AlertTriangle, Navigation, Camera } from 'lucide-react';
import { useAuth, useData } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { uploadImage } from '../utils/uploadImage';
import { motion } from 'framer-motion';

const complaintTypes = [
    { value: 'leakage', label: 'Pipe Leakage', icon: <Droplet size={20} />, color: '#0EA5E9' },
    { value: 'no_water', label: 'No Water Supply', icon: <CloudRain size={20} />, color: '#DC2626' },
    { value: 'dirty_water', label: 'Dirty / Contaminated', icon: <AlertTriangle size={20} />, color: '#EAB308' },
    { value: 'low_pressure', label: 'Low Pressure', icon: <Zap size={20} />, color: '#F97316' },
];

const RegisterComplaint: React.FC = () => {
    const { user } = useAuth();
    const { addComplaint } = useData();

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [trackingId, setTrackingId] = useState('');
    const [type, setType] = useState('leakage');
    const [description, setDescription] = useState('');
    const [pincode, setPincode] = useState('');
    const [area, setArea] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [stateField, setStateField] = useState('');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude.toString()); setLon(longitude.toString());
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                if (data?.address) {
                    setArea(data.address.suburb || data.address.neighbourhood || data.address.village || '');
                    setCity(data.address.city || data.address.town || '');
                    setDistrict(data.address.state_district || data.address.county || '');
                    setStateField(data.address.state || '');
                    if (data.address.postcode) setPincode(data.address.postcode);
                }
            } catch (err) { console.error("Geocoding failed", err); }
        }, () => { alert('Unable to retrieve location.'); });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const checkDuplicate = async (type: string, userId: string) => {
        const { data, error } = await supabase.from("complaints").select("*")
            .eq("type", type).eq("userId", userId)
            .gte("dateSubmitted", new Date(Date.now() - 60 * 60 * 1000).toISOString());
        if (error) throw new Error(error.message);
        return data && data.length > 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user || !imageFile) return;
        setShowConfirm(false);
        setStatus('submitting');
        try {
            const isDuplicate = await checkDuplicate(type, user.id);
            if (isDuplicate) { alert("You already submitted a similar complaint recently."); setStatus('idle'); return; }
            const imageUrl = await uploadImage(imageFile);
            const fullLocation = [address, area, city, stateField, pincode].filter(Boolean).join(', ');
            const newId = await addComplaint({
                userId: user.id, type, description, pincode,
                location: fullLocation || 'Unknown Location',
                lat: parseFloat(lat) || undefined, lon: parseFloat(lon) || undefined,
                imageUrl
            });
            setTrackingId(newId); setStatus('success');
        } catch (error: any) {
            console.error("Submission failed", error);
            alert(`Failed: ${error.message || 'Unknown error'}`);
            setStatus('idle');
        }
    };

    // Not logged in
    if (!user) return (
        <div style={{ minHeight:'calc(100vh - 120px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
            <div className="animate-fadeIn" style={{ maxWidth:'480px', width:'100%', background:'white', borderRadius:'var(--radius-2xl)', padding:'48px 32px', boxShadow:'var(--shadow-xl)', border:'1px solid var(--slate-200)', textAlign:'center' }}>
                <div style={{ background:'var(--info-light)', width:'72px', height:'72px', borderRadius:'var(--radius-xl)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                    <LogIn size={36} color="var(--highlight)" />
                </div>
                <h2 style={{ fontWeight:800, margin:'0 0 8px' }}>Authentication Required</h2>
                <p style={{ color:'var(--text-muted)', marginBottom:'24px', fontSize:'0.9375rem' }}>Login as a citizen to register complaints and track status updates.</p>
                <div className="flex justify-center gap-3">
                    <Link to="/login" className="btn btn-primary" style={{ padding:'10px 24px' }}>Login Now</Link>
                    <Link to="/register-user" className="btn btn-outline" style={{ padding:'10px 24px' }}>Create Account</Link>
                </div>
            </div>
        </div>
    );

    // Success
    if (status === 'success') return (
        <div style={{ minHeight:'calc(100vh - 120px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                style={{ maxWidth:'480px', width:'100%', background:'white', borderRadius:'var(--radius-2xl)', padding:'48px 32px', boxShadow:'var(--shadow-xl)', border:'1px solid var(--slate-200)', textAlign:'center' }}
            >
                <div style={{ background:'var(--success-light)', width:'80px', height:'80px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                    <CheckCircle size={44} color="var(--success)" />
                </div>
                <h2 style={{ color:'var(--success)', fontWeight:800, margin:'0 0 8px' }}>Complaint Submitted!</h2>
                <p style={{ color:'var(--text-muted)', marginBottom:'20px' }}>Your tracking ID is:</p>
                <div style={{
                    background:'var(--success-light)', padding:'16px 32px', display:'inline-block',
                    fontSize:'2.25rem', fontWeight:800, borderRadius:'var(--radius-lg)',
                    color:'var(--success)', letterSpacing:'6px', border:'1px solid rgba(22,163,74,0.15)',
                    fontFamily:'var(--font-display)'
                }}>
                    {trackingId}
                </div>
                <p style={{ color:'var(--text-muted)', margin:'20px 0', fontSize:'0.875rem' }}>A confirmation has been recorded. Track your complaint anytime.</p>
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ padding:'12px 32px' }}>Go to Dashboard</Link>
            </motion.div>
        </div>
    );

    // Form
    return (
        <div style={{ background:'var(--bg-main)', minHeight:'calc(100vh - 120px)', padding:'32px 0' }}>
            <div className="container">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div style={{ width:'4px', height:'28px', background:'var(--grad-blue)', borderRadius:'2px' }} />
                    <h2 style={{ margin:0, fontWeight:800, fontSize:'1.5rem' }}>Register Complaint</h2>
                </div>

                <div style={{ background:'white', borderRadius:'var(--radius-xl)', border:'1px solid var(--slate-200)', overflow:'hidden', boxShadow:'var(--shadow-md)' }}>
                    <form onSubmit={e => { e.preventDefault(); setShowConfirm(true); }} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0' }}>
                        {/* Left - Complaint Details */}
                        <div style={{ padding:'32px', borderRight:'1px solid var(--slate-100)' }}>
                            <h3 style={{ margin:'0 0 24px', fontSize:'1rem', fontWeight:700, color:'var(--text-main)' }}>Complaint Details</h3>

                            {/* Type Selector */}
                            <div className="form-group">
                                <label className="form-label">Complaint Type</label>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                                    {complaintTypes.map(ct => (
                                        <button key={ct.value} type="button" onClick={() => setType(ct.value)}
                                            style={{
                                                display:'flex', alignItems:'center', gap:'10px',
                                                padding:'12px 14px', borderRadius:'var(--radius-md)',
                                                border: type===ct.value ? `2px solid ${ct.color}` : '1.5px solid var(--slate-200)',
                                                background: type===ct.value ? `${ct.color}08` : 'white',
                                                cursor:'pointer', transition:'all 0.2s ease',
                                                color: type===ct.value ? ct.color : 'var(--text-secondary)',
                                                fontWeight: type===ct.value ? 700 : 500,
                                                fontSize:'0.8125rem'
                                            }}
                                        >
                                            <span style={{ color:ct.color }}>{ct.icon}</span>
                                            {ct.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)}
                                    rows={4} placeholder="Describe the issue clearly (landmark, urgency, etc.)" required
                                    style={{ minHeight:'120px' }}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label className="form-label"><Camera size={16} /> Photo Evidence (mandatory)</label>
                                <div
                                    style={{
                                        border: imagePreview ? '2px solid var(--success)' : '2px dashed var(--slate-300)',
                                        borderRadius:'var(--radius-lg)', padding:'24px', textAlign:'center',
                                        background: imagePreview ? 'var(--success-light)' : 'var(--slate-50)',
                                        cursor:'pointer', transition:'all 0.2s ease', position:'relative', overflow:'hidden'
                                    }}
                                    onClick={() => document.getElementById('file-input')?.click()}
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='var(--primary)'; }}
                                    onDragLeave={e => { e.currentTarget.style.borderColor='var(--slate-300)'; }}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) { setImageFile(file); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result as string); r.readAsDataURL(file); }
                                    }}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" style={{ maxHeight:'120px', borderRadius:'var(--radius-sm)', margin:'0 auto' }} />
                                    ) : (
                                        <>
                                            <Upload size={32} color="var(--slate-400)" style={{ margin:'0 auto 8px' }} />
                                            <p style={{ margin:0, fontWeight:600, color:'var(--text-muted)', fontSize:'0.875rem' }}>
                                                Drag & drop or click to upload
                                            </p>
                                            <p style={{ margin:'4px 0 0', fontSize:'0.75rem', color:'var(--text-light)' }}>JPG, PNG up to 5MB</p>
                                        </>
                                    )}
                                    <input id="file-input" type="file" accept="image/*" capture="environment"
                                        onChange={handleImageUpload} required style={{ display:'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right - Location */}
                        <div style={{ padding:'32px' }}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 style={{ margin:0, fontSize:'1rem', fontWeight:700, color:'var(--text-main)' }}>
                                    <MapPin size={18} style={{ display:'inline', marginRight:'6px', verticalAlign:'text-bottom' }} />
                                    Location Details
                                </h3>
                                <button type="button" onClick={handleDetectLocation}
                                    className="btn btn-sm btn-outline" style={{ gap:'4px', fontSize:'0.75rem', padding:'6px 12px' }}
                                >
                                    <Navigation size={14} /> Auto-detect
                                </button>
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                                <div className="form-group" style={{ marginBottom:'16px' }}>
                                    <label className="form-label">Pincode</label>
                                    <input className="form-control" type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 493661" />
                                </div>
                                <div className="form-group" style={{ marginBottom:'16px' }}>
                                    <label className="form-label">Area</label>
                                    <input className="form-control" type="text" value={area} onChange={e => setArea(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom:'16px' }}>
                                    <label className="form-label">City</label>
                                    <input className="form-control" type="text" value={city} onChange={e => setCity(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom:'16px' }}>
                                    <label className="form-label">District</label>
                                    <input className="form-control" type="text" value={district} onChange={e => setDistrict(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom:'16px' }}>
                                    <label className="form-label">State</label>
                                    <input className="form-control" type="text" value={stateField} onChange={e => setStateField(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom:'16px', gridColumn:'1/-1' }}>
                                    <label className="form-label">Address / Landmark</label>
                                    <input className="form-control" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Near landmark..." />
                                </div>
                                <div className="form-group" style={{ marginBottom:'0' }}>
                                    <label className="form-label">Latitude</label>
                                    <input className="form-control" type="text" value={lat} readOnly style={{ background:'var(--slate-50)' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom:'0' }}>
                                    <label className="form-label">Longitude</label>
                                    <input className="form-control" type="text" value={lon} readOnly style={{ background:'var(--slate-50)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Submit Bar */}
                        <div style={{
                            gridColumn:'1/-1', padding:'20px 32px',
                            borderTop:'1px solid var(--slate-100)',
                            background:'var(--slate-50)',
                            display:'flex', justifyContent:'flex-end', gap:'12px'
                        }}>
                            <button type="submit" disabled={status === 'submitting' || !imageFile}
                                className="btn btn-primary btn-lg"
                                style={{ opacity:(status==='submitting'||!imageFile)?0.5:1, cursor:(status==='submitting'||!imageFile)?'not-allowed':'pointer' }}
                            >
                                {status === 'submitting' ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div style={{
                    position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000,
                    display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'
                }} onClick={() => setShowConfirm(false)}>
                    <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                        style={{ background:'white', borderRadius:'var(--radius-xl)', padding:'32px', maxWidth:'400px', width:'100%', boxShadow:'var(--shadow-2xl)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin:'0 0 8px', fontWeight:800, fontSize:'1.25rem' }}>Confirm Submission?</h3>
                        <p style={{ color:'var(--text-muted)', margin:'0 0 24px', fontSize:'0.875rem' }}>
                            Please verify all details are correct. Once submitted, a tracking ID will be generated.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowConfirm(false)} className="btn btn-ghost">Cancel</button>
                            <button onClick={() => handleSubmit()} className="btn btn-primary">Confirm & Submit</button>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    form[style] { grid-template-columns: 1fr !important; }
                    form > div:first-child { border-right: none !important; border-bottom: 1px solid var(--slate-100) !important; }
                }
            `}</style>
        </div>
    );
};

export default RegisterComplaint;
