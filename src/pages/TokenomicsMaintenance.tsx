import React, { useState, useEffect, lazy, Suspense } from 'react';
import Footer from '../components/layout/footer';
import { getMaintenanceTimeRemaining, getMaintenanceConfig, isMaintenanceMode } from '../config/maintenance';
import '../styles/maintenance.css';

// Lazy load the actual Tokenomics component
const TokenomicsPage = lazy(() => import('./Tokenomics'));

interface MaintenancePageProps {
    message?: string;
}

const TokenomicsMaintenance: React.FC<MaintenancePageProps> = ({
    message
}) => {
    const [isMaintenance, setIsMaintenance] = useState(isMaintenanceMode('tokenomics'));
    const [timeRemaining, setTimeRemaining] = useState(getMaintenanceTimeRemaining('tokenomics'));
    const config = getMaintenanceConfig('tokenomics');
    const displayMessage = message || config.message;

    useEffect(() => {
        let wasInMaintenance = isMaintenance;

        const interval = setInterval(() => {
            const currentMaintenanceStatus = isMaintenanceMode('tokenomics');
            const remaining = getMaintenanceTimeRemaining('tokenomics');

            setIsMaintenance(currentMaintenanceStatus);
            setTimeRemaining(remaining);

            if (remaining <= 0 && !currentMaintenanceStatus && wasInMaintenance) {
                clearInterval(interval);
                window.location.reload();
            }

            wasInMaintenance = currentMaintenanceStatus;
        }, 1000);

        return () => clearInterval(interval);
    }, [isMaintenance]);

    if (!isMaintenance) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <TokenomicsPage />
            </Suspense>
        );
    }

    const formatTime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return { days, hours, minutes, seconds: secs };
    };

    const time = formatTime(timeRemaining);

    return (
        <div className="maintenance-wrapper">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="maintenance-container">
                <div className="maintenance-content">
                    <div className="maintenance-header">
                        <div className="maintenance-icon-wrapper">
                            <div className="maintenance-icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div className="icon-glow"></div>
                        </div>
                        <h1>Tokenomics 2.0</h1>
                        <p className="maintenance-subtitle">Economic Protocol Upgrade</p>
                    </div>

                    <div className="countdown-container" style={{
                        margin: '1.5rem 0 2rem 0',
                        padding: 'clamp(1rem, 3vw, 2rem)',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                        borderRadius: '1rem',
                        border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}>
                        <h2 style={{
                            fontSize: 'clamp(1.125rem, 5vw, 1.5rem)',
                            fontWeight: '700',
                            marginBottom: '1.25rem',
                            background: 'linear-gradient(to right, #a78bfa, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center'
                        }}>
                            New distribution model arrives in:
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 'clamp(0.5rem, 2vw, 1rem)',
                        }}>
                            {[
                                { label: 'Days', val: time.days, color: '#a78bfa' },
                                { label: 'Hours', val: time.hours, color: '#60a5fa' },
                                { label: 'Minutes', val: time.minutes, color: '#ec4899' },
                                { label: 'Seconds', val: time.seconds, color: '#34d399' }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    textAlign: 'center',
                                    padding: 'clamp(0.5rem, 2vw, 1rem)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <div style={{
                                        fontSize: 'clamp(1.25rem, 5vw, 2rem)',
                                        fontWeight: '700',
                                        color: item.color,
                                        lineHeight: '1'
                                    }}>{item.val}</div>
                                    <div style={{
                                        fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
                                        color: '#9ca3af',
                                        marginTop: '0.25rem',
                                        textTransform: 'uppercase'
                                    }}>{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="maintenance-message">
                        <p className="text-lg leading-relaxed">{displayMessage}</p>
                    </div>

                    <div className="maintenance-status-badge">
                        <span className="pulse-dot" style={{ backgroundColor: '#ef4444' }}></span>
                        Important Event: Governance Update
                    </div>

                    <div className="maintenance-details" style={{ marginTop: '2.5rem' }}>
                        <h2 className="text-xl font-bold mb-6 text-white text-center">Protocol Enhancements</h2>
                        <div className="maintenance-grid">
                            {[
                                { icon: '📉', text: 'Deflationary Burn Mechanisms' },
                                { icon: '💎', text: 'Long-term Staking Yields' },
                                { icon: '⚖️', text: 'Fixed 1B Supply Cap' },
                                { icon: '🤝', text: 'Governance Rights Distribution' }
                            ].map((item, idx) => (
                                <div key={idx} className="grid-item">
                                    <span className="icon">{item.icon}</span>
                                    <p>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="maintenance-action">
                        <button
                            className="refresh-button w-full mb-3"
                            onClick={() => window.location.reload()}
                        >
                            <span>Verify Status</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
                            </svg>
                        </button>
                        <button
                            className="staking-button w-full"
                            onClick={() => window.location.href = '/staking'}
                        >
                            <span>Go to Staking</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="maintenance-importance" style={{ borderLeftColor: '#ef4444' }}>
                        <p>
                            We are restructuring the project economy to ensure the long-term value of $NUX.
                            <strong> These changes are vital for the next phase of the NuxChain ecosystem.</strong>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TokenomicsMaintenance;
