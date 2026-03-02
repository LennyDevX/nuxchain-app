import React, { lazy, Suspense } from 'react';
import Footer from '../components/layout/footer';
import { getMaintenanceConfig, isMaintenanceMode } from '../config/maintenance';
import '../styles/maintenance.css';

// Lazy load the actual Tokenomics component
const TokenomicsPage = lazy(() => import('./Tokenomics'));

interface MaintenancePageProps {
    message?: string;
}

const TokenomicsMaintenance: React.FC<MaintenancePageProps> = ({
    message
}) => {
    const isMaintenance = isMaintenanceMode('tokenomics');
    const config = getMaintenanceConfig('tokenomics');
    const displayMessage = message || config.message;

    if (!isMaintenance) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <TokenomicsPage />
            </Suspense>
        );
    }

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
                                <img 
                                    src="/assets/tokens/NuxLogo.png" 
                                    alt="NUX Token" 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                            <div className="icon-glow"></div>
                        </div>
                        <h1>Tokenomics 2.0</h1>
                        <p className="maintenance-subtitle">Economic Protocol Upgrade</p>
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
