import React, { useState, useEffect, lazy, Suspense } from 'react';
import Footer from '../components/layout/footer';
import { getMaintenanceTimeRemaining, getMaintenanceConfig, isMaintenanceMode } from '../config/maintenance';
import '../styles/maintenance.css';

// Lazy load the actual Airdrop component
const AirdropPage = lazy(() => import('./Airdrop'));

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  message
}) => {
  const [isMaintenance, setIsMaintenance] = useState(isMaintenanceMode('airdrop'));
  const [timeRemaining, setTimeRemaining] = useState(getMaintenanceTimeRemaining('airdrop'));
  const config = getMaintenanceConfig('airdrop');
  const displayMessage = message || config.message;

  useEffect(() => {
    let wasInMaintenance = isMaintenance;

    const interval = setInterval(() => {
      const currentMaintenanceStatus = isMaintenanceMode('airdrop');
      const remaining = getMaintenanceTimeRemaining('airdrop');
      
      setIsMaintenance(currentMaintenanceStatus);
      setTimeRemaining(remaining);
      
      // Solo redirigir si el mantenimiento ESTABA activo y ahora terminó
      if (remaining <= 0 && !currentMaintenanceStatus && wasInMaintenance) {
        clearInterval(interval);
        window.location.reload();
      }
      
      wasInMaintenance = currentMaintenanceStatus;
    }, 1000);

    return () => clearInterval(interval);
  }, [isMaintenance]);

  // If maintenance is disabled or overridden, show the real airdrop page
  if (!isMaintenance) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AirdropPage />
      </Suspense>
    );
  }

  // Convertir segundos a días, horas, minutos, segundos
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
      {/* Background blobs for visual interest */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="maintenance-container">
        <div className="maintenance-content">
          {/* Header */}
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
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div className="icon-glow"></div>
            </div>
            <h1>System Optimization</h1>
            <p className="maintenance-subtitle">Airdrop temporarily unavailable</p>
          </div>

          {/* Countdown Timer */}
          <div className="countdown-container" style={{
            margin: '1.5rem 0 2rem 0',
            padding: 'clamp(1rem, 3vw, 2rem)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.125rem, 5vw, 1.5rem)',
              fontWeight: '700',
              marginBottom: '1.25rem',
              background: 'linear-gradient(to right, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}>
              Airdrop will be available in:
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              maxWidth: '100%'
            }}>
              <div style={{
                textAlign: 'center',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  fontWeight: '700',
                  color: '#a78bfa',
                  lineHeight: '1',
                  wordBreak: 'break-word'
                }}>{time.days}</div>
                <div style={{
                  fontSize: 'clamp(0.625rem, 2vw, 0.875rem)',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>Days</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  fontWeight: '700',
                  color: '#ec4899',
                  lineHeight: '1',
                  wordBreak: 'break-word'
                }}>{time.hours}</div>
                <div style={{
                  fontSize: 'clamp(0.625rem, 2vw, 0.875rem)',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>Hours</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  fontWeight: '700',
                  color: '#60a5fa',
                  lineHeight: '1',
                  wordBreak: 'break-word'
                }}>{time.minutes}</div>
                <div style={{
                  fontSize: 'clamp(0.625rem, 2vw, 0.875rem)',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>Minutes</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  fontWeight: '700',
                  color: '#34d399',
                  lineHeight: '1',
                  wordBreak: 'break-word'
                }}>{time.seconds}</div>
                <div style={{
                  fontSize: 'clamp(0.625rem, 2vw, 0.875rem)',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>Seconds</div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="maintenance-message">
            <p>{displayMessage}</p>
          </div>

          {/* Status Section */}
          <div className="maintenance-status-badge">
            <span className="pulse-dot"></span>
            Status: Under Optimization
          </div>

          {/* Details */}
          <div className="maintenance-details">
            <h2>What We're Doing</h2>
            <div className="maintenance-grid">
              <div className="grid-item">
                <span className="icon">🔐</span>
                <p>Enhancing security protocols</p>
              </div>
              <div className="grid-item">
                <span className="icon">⚡</span>
                <p>Optimizing performance</p>
              </div>
              <div className="grid-item">
                <span className="icon">🤖</span>
                <p>Removing bot accounts</p>
              </div>
              <div className="grid-item">
                <span className="icon">✨</span>
                <p>Ensuring fairness</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="maintenance-action">
            <button 
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              <span>Refresh Page</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
              </svg>
            </button>
            <button 
              className="staking-button"
              onClick={() => window.location.href = '/staking'}
            >
              <span>Go to Staking</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </button>
          </div>

          {/* Importance Info */}
          <div className="maintenance-importance">
            <p>
              We are optimizing the system to reduce resource consumption and improve your experience.
              <strong> All optimizations will benefit the community</strong>. Thank you for your patience!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MaintenancePage;
