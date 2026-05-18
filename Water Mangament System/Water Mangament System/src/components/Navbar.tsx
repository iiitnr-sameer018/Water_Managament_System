import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AppContext';
import {
    Home, FileText, Search, Star, LayoutDashboard, ShieldCheck,
    Menu, X, Droplets, ChevronDown, LogOut, User
} from 'lucide-react';

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { to: '/', label: t('home', 'Home'), icon: <Home size={18} /> },
        { to: '/register', label: t('register', 'Register Complaint'), icon: <FileText size={18} /> },
        { to: '/track', label: t('track', 'Track Complaint'), icon: <Search size={18} /> },
        { to: '/#reviews', label: t('reviews', 'Reviews'), icon: <Star size={18} />, isAnchor: true },
        { to: '/dashboard', label: t('dashboard', 'Dashboard'), icon: <LayoutDashboard size={18} /> },
        { to: '/admin', label: t('admin_login', 'Admin'), icon: <ShieldCheck size={18} /> },
    ];

    const linkStyle = (active: boolean): React.CSSProperties => ({
        textDecoration: 'none',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--primary-light)' : 'transparent',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
    });

    return (
        <header id="main-nav" style={{
            position: 'sticky',
            top: 0,
            zIndex: 150,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid var(--slate-200)',
            padding: '0',
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '64px',
                gap: '16px'
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexShrink: 0
                }}>
                    <div style={{
                        background: 'var(--grad-blue)',
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-primary)',
                    }}>
                        <Droplets size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '0.9375rem',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            lineHeight: 1.15,
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '-0.01em'
                        }}>
                            Water Complaint &<br />Alert Management
                        </h1>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hide-mobile" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {navLinks.map(link => (
                        link.isAnchor ? (
                            <a key={link.to} href={link.to} style={linkStyle(false)}>
                                {link.icon}
                                <span className="hide-tablet">{link.label}</span>
                            </a>
                        ) : (
                            <Link key={link.to} to={link.to} style={linkStyle(isActive(link.to))}>
                                {link.icon}
                                <span className="hide-tablet">{link.label}</span>
                            </Link>
                        )
                    ))}
                </nav>

                {/* Right Controls */}
                <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                    {/* Language Selector */}
                    <div style={{ position: 'relative' }}>
                        <select
                            value={i18n.language}
                            onChange={(e) => i18n.changeLanguage(e.target.value)}
                            style={{
                                background: 'var(--slate-50)',
                                border: '1.5px solid var(--slate-200)',
                                padding: '6px 32px 6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                transition: 'border-color 0.2s ease'
                            }}
                        >
                            <option value="en">EN</option>
                            <option value="hi">हि</option>
                        </select>
                    </div>

                    {/* User Menu / Login Button */}
                    {user ? (
                        <div className="flex items-center gap-2">
                            <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--grad-blue)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700
                            }}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={() => { logout(); }}
                                className="btn btn-ghost btn-sm hide-mobile"
                                style={{ color: 'var(--text-muted)', gap: '4px' }}
                            >
                                <LogOut size={15} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm hide-mobile" style={{
                            padding: '7px 16px',
                            fontSize: '0.8125rem'
                        }}>
                            <User size={15} /> Login
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                        }}
                        className="mobile-menu-btn"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease'
                }} onClick={() => setMobileOpen(false)}>
                    <nav style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '280px',
                        height: '100%',
                        background: 'white',
                        padding: '24px',
                        boxShadow: 'var(--shadow-2xl)',
                        animation: 'slideInRight 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Menu</h3>
                            <button onClick={() => setMobileOpen(false)} style={{
                                background: 'var(--slate-100)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px',
                                cursor: 'pointer'
                            }}>
                                <X size={20} color="var(--text-muted)" />
                            </button>
                        </div>
                        {navLinks.map(link => (
                            link.isAnchor ? (
                                <a
                                    key={link.to}
                                    href={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        ...linkStyle(false),
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    {link.icon} {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        ...linkStyle(isActive(link.to)),
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    {link.icon} {link.label}
                                </Link>
                            )
                        ))}

                        <div className="divider" />
                        {user ? (
                            <button
                                onClick={() => { logout(); setMobileOpen(false); }}
                                className="btn btn-outline w-full"
                                style={{ justifyContent: 'center' }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="btn btn-primary w-full"
                                style={{ justifyContent: 'center' }}
                            >
                                <User size={16} /> Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn { display: flex !important; }
                }
            `}</style>
        </header>
    );
};

export default Navbar;
