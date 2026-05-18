import React, { useState } from 'react';
import { useAuth } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, Droplets, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (user.email) {
                await login(user.email, user.displayName || 'Unknown');
                navigate('/dashboard');
            } else {
                setError('Could not retrieve email from Google Account.');
            }
        } catch (err: any) {
            console.error('Google Sign-In Error:', err);
            setError(err.message || 'Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (email: string, name: string) => {
        setLoading(true);
        try {
            await login(email, name);
            navigate('/dashboard');
        } catch (err: any) {
            setError('Demo login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            background: 'linear-gradient(135deg, var(--slate-50) 0%, rgba(14,165,233,0.04) 50%, rgba(30,58,138,0.04) 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background orbs */}
            <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', borderRadius:'50%' }} />
            <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:'350px', height:'350px', background:'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />

            <div style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1 }}>
                <div className="animate-fadeIn" style={{
                    background: 'white',
                    borderRadius: 'var(--radius-2xl)',
                    padding: '40px 32px',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--slate-200)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            background: 'var(--grad-blue)',
                            width: '56px', height: '56px',
                            borderRadius: 'var(--radius-lg)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            boxShadow: 'var(--shadow-primary)',
                        }}>
                            <ShieldCheck size={28} color="white" />
                        </div>
                        <h2 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                            Sign in to manage your complaints
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'var(--error-light)',
                            color: 'var(--error)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '20px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            border: '1px solid rgba(220,38,38,0.15)',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'white',
                            color: '#3c4043',
                            border: '1.5px solid var(--slate-300)',
                            cursor: loading ? 'wait' : 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: 'var(--shadow-xs)',
                        }}
                        onMouseEnter={e => { if(!loading) { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--slate-300)'; e.currentTarget.style.boxShadow='var(--shadow-xs)'; }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' }}>
                        <div style={{ flex:1, height:'1px', background:'var(--slate-200)' }} />
                        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px' }}>Demo Access</span>
                        <div style={{ flex:1, height:'1px', background:'var(--slate-200)' }} />
                    </div>

                    {/* Demo Logins */}
                    <div style={{
                        background: 'var(--slate-50)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        border: '1px solid var(--slate-200)',
                    }}>
                        {[
                            { role: 'Citizen', email: 'citizen1@example.com', name: 'Ravi Kumar (Citizen)', badge: 'badge-info' },
                            { role: 'Staff', email: 'staff1@example.com', name: 'Sameer S. (Maintenance)', badge: 'badge-warning' },
                            { role: 'Admin', email: 'admin@example.com', name: 'Super Admin', badge: 'badge-error' },
                        ].map((d, i) => (
                            <div key={i} className="flex justify-between items-center" style={{
                                padding: '10px 0',
                                borderBottom: i < 2 ? '1px solid var(--slate-200)' : 'none'
                            }}>
                                <div className="flex items-center gap-3">
                                    <span className={`badge ${d.badge}`}>{d.role}</span>
                                </div>
                                <button
                                    onClick={() => handleDemoLogin(d.email, d.name)}
                                    disabled={loading}
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontWeight: 600, color: 'var(--primary)', gap: '4px', fontSize: '0.8125rem' }}
                                >
                                    Login <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RegisterUser: React.FC = () => {
    return <Login />;
};
