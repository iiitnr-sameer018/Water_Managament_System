import React, { useEffect, useState, useRef } from 'react';
import { FileText, CheckCircle, Clock, Star } from 'lucide-react';

interface StatItemProps {
    end: number;
    title: string;
    icon: React.ReactNode;
    gradient: string;
    iconBg: string;
    suffix?: string;
    delay?: number;
}

const AnimatedCounter: React.FC<StatItemProps> = ({ end, title, icon, gradient, iconBg, suffix = '', delay = 0 }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            let startTime: number;
            const duration = 1800;

            const animate = (time: number) => {
                if (!startTime) startTime = time;
                const progress = Math.min((time - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

                setCount(Math.floor(end * eased));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setCount(end);
                }
            };

            requestAnimationFrame(animate);
        }, delay);

        return () => clearTimeout(timer);
    }, [isVisible, end, delay]);

    return (
        <div ref={ref} style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
            transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        >
            {/* Background gradient accent */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: gradient,
                borderRadius: '0 var(--radius-xl) 0 100%',
                opacity: 0.06,
            }} />

            <div className="flex items-center gap-4">
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    background: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
                <div>
                    <h3 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        margin: 0,
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.1,
                        fontFamily: 'var(--font-display)'
                    }}>
                        {count.toLocaleString()}{suffix}
                    </h3>
                    <p style={{
                        margin: '4px 0 0',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        letterSpacing: '0.02em'
                    }}>
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatsCounter: React.FC = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
        }}>
            <AnimatedCounter
                end={3421}
                title="Total Complaints"
                icon={<FileText size={24} color="var(--primary)" />}
                gradient="var(--grad-blue)"
                iconBg="var(--primary-light)"
                delay={0}
            />
            <AnimatedCounter
                end={2984}
                title="Resolved"
                icon={<CheckCircle size={24} color="var(--success)" />}
                gradient="var(--grad-green)"
                iconBg="var(--success-light)"
                delay={150}
            />
            <AnimatedCounter
                end={312}
                title="In Progress"
                icon={<Clock size={24} color="#ea580c" />}
                gradient="var(--grad-saffron)"
                iconBg="var(--secondary-light)"
                delay={300}
            />
            <AnimatedCounter
                end={4.6}
                title="Avg. Rating"
                icon={<Star size={24} color="#eab308" fill="#eab308" />}
                gradient="linear-gradient(135deg, #eab308, #f59e0b)"
                iconBg="var(--warning-light)"
                suffix="/5"
                delay={450}
            />
        </div>
    );
};

export default StatsCounter;
