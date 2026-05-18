import React from 'react';
import TopBar from './TopBar';
import Navbar from './Navbar';
import { Droplets, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer id="site-footer" style={{
            background: 'var(--slate-900)',
            color: 'var(--slate-400)',
            marginTop: 'auto',
        }}>
            {/* Main Footer */}
            <div style={{ padding: '48px 0 32px' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '40px',
                        marginBottom: '40px'
                    }}>
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div style={{
                                    background: 'var(--grad-blue)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Droplets size={20} color="white" />
                                </div>
                                <div>
                                    <h4 style={{
                                        margin: 0,
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        lineHeight: 1.2
                                    }}>
                                        Water Complaint &<br />Alert Management
                                    </h4>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--slate-500)', maxWidth: '280px' }}>
                                A Smart City initiative for transparent and efficient water complaint management. Empowering citizens with digital governance.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h5 style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Quick Links
                            </h5>
                            <div className="flex-col gap-3">
                                {[
                                    { to: '/', label: 'Home' },
                                    { to: '/register', label: 'Register Complaint' },
                                    { to: '/track', label: 'Track Complaint' },
                                    { to: '/dashboard', label: 'Dashboard' },
                                ].map(link => (
                                    <Link key={link.to} to={link.to} style={{
                                        color: 'var(--slate-400)',
                                        textDecoration: 'none',
                                        fontSize: '0.8125rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'color 0.2s'
                                    }}>
                                        <ExternalLink size={12} /> {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h5 style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Contact
                            </h5>
                            <div className="flex-col gap-3" style={{ fontSize: '0.8125rem' }}>
                                <span className="flex items-center gap-2">
                                    <Phone size={14} color="var(--highlight)" /> Helpline: 1916
                                </span>
                                <span className="flex items-center gap-2">
                                    <Mail size={14} color="var(--highlight)" /> support@aquaserver.gov.in
                                </span>
                                <span className="flex items-center gap-2" style={{ lineHeight: 1.5 }}>
                                    <MapPin size={14} color="var(--highlight)" style={{ flexShrink: 0 }} />
                                    <span>Dr. SPM IIIT, Naya Raipur, CG - 493661</span>
                                </span>
                            </div>
                        </div>

                        {/* Developers */}
                        <div>
                            <h5 style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Developed By
                            </h5>
                            <div className="flex-col gap-2" style={{ fontSize: '0.8125rem' }}>
                                <span style={{ color: 'var(--highlight)', fontWeight: 600 }}>Anish Kumar Painkra</span>
                                <span style={{ color: 'var(--highlight)', fontWeight: 600 }}>Sameer Lakra</span>
                                <span style={{ color: 'var(--highlight)', fontWeight: 600 }}>Vikas Kosma</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div style={{
                        borderTop: '1px solid var(--slate-800)',
                        paddingTop: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            © 2026 Water Complaint & Alert Management System. A Smart City Initiative.
                        </p>
                        <div className="flex items-center gap-4" style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                            <span>Accessibility</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <TopBar />
            <Navbar />
            <main style={{ flex: 1, padding: 0 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
