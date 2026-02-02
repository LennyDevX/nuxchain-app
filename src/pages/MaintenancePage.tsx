import React, { useState, useEffect } from 'react';
import Footer from '../components/layout/footer';
import '../styles/maintenance.css';

interface MaintenancePageProps {
  estimatedTime?: number; // in minutes
  message?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  estimatedTime = 30,
  message = 'We are currently performing system maintenance to improve security and user experience.'
}) => {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="maintenance-wrapper">
      <div className="maintenance-container">
        <div className="maintenance-content">
          {/* Header */}
          <div className="maintenance-header">
            <div className="maintenance-icon">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h1>System Maintenance</h1>
            <p className="maintenance-subtitle">Airdrop Registration Temporarily Unavailable</p>
          </div>

          {/* Message */}
          <div className="maintenance-message">
            <p>{message}</p>
          </div>

          {/* Status Section */}
          <div className="maintenance-status">
            <div className="status-item">
              <div className="status-label">Status</div>
              <div className="status-value status-maintenance">
                <span className="pulse-dot"></span>
                Under Maintenance
              </div>
            </div>

            <div className="status-item">
              <div className="status-label">Estimated Time</div>
              <div className="status-value">
                {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="maintenance-details">
            <h2>What We're Doing</h2>
            <ul className="maintenance-list">
              <li>
                <span className="icon">🔐</span>
                <span>Enhancing security protocols for wallet registrations</span>
              </li>
              <li>
                <span className="icon">🤖</span>
                <span>Removing bot accounts and fraudulent registrations</span>
              </li>
              <li>
                <span className="icon">✨</span>
                <span>Ensuring only legitimate users receive airdrops</span>
              </li>
              <li>
                <span className="icon">⚡</span>
                <span>Optimizing database performance</span>
              </li>
            </ul>
          </div>

          {/* Info Box */}
          <div className="maintenance-info">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h3>Why This Matters</h3>
              <p>
                We're purging bot accounts and invalid registrations to ensure the airdrop reaches genuine community members. 
                This maintenance improves fairness and security for everyone.
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="maintenance-action">
            <button 
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              <span>Refresh Page</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
              </svg>
            </button>
          </div>

          {/* Footer Text */}
          <div className="maintenance-footer-text">
            <p>Questions? Check our <a href="/blog">blog</a> for updates</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MaintenancePage;
