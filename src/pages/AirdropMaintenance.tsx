import React from 'react';
import Footer from '../components/layout/footer';
import '../styles/maintenance.css';

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  message = 'We are currently performing system maintenance to improve security and user experience.'
}) => {
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
            <h1>System Maintenance</h1>
            <p className="maintenance-subtitle">Airdrop Registration Temporarily Unavailable</p>
          </div>

          {/* Message */}
          <div className="maintenance-message">
            <p>{message}</p>
          </div>

          {/* Status Section */}
          <div className="maintenance-status-badge">
            <span className="pulse-dot"></span>
            Status: Under Maintenance
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
                <span className="icon">🤖</span>
                <p>Removing bot accounts</p>
              </div>
              <div className="grid-item">
                <span className="icon">✨</span>
                <p>Ensuring fairness</p>
              </div>
              <div className="grid-item">
                <span className="icon">⚡</span>
                <p>Optimizing performance</p>
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
              We're purging bot accounts and invalid registrations to ensure the airdrop reaches 
              <strong> genuine community members</strong>. Thank you for your patience!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MaintenancePage;
