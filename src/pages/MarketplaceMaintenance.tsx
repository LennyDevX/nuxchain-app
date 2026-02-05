import React from 'react';
import Footer from '../components/layout/footer';
import { getMaintenanceConfig } from '../config/maintenance';
import '../styles/maintenance.css';

const MarketplaceMaintenance: React.FC = () => {
  const config = getMaintenanceConfig('marketplace');

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
                  <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <div className="icon-glow"></div>
            </div>
            <h1>Marketplace Optimization</h1>
            <p className="maintenance-subtitle">Marketplace under maintenance</p>
          </div>

          {/* Message */}
          <div className="maintenance-message">
            <p>{config.message}</p>
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
                <span className="icon">⚡</span>
                <p>Improving performance</p>
              </div>
              <div className="grid-item">
                <span className="icon">💎</span>
                <p>Enhancing user experience</p>
              </div>
              <div className="grid-item">
                <span className="icon">🔒</span>
                <p>Strengthening security</p>
              </div>
              <div className="grid-item">
                <span className="icon">🚀</span>
                <p>Optimizing features</p>
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
              We're making important improvements to the marketplace to ensure <strong>better performance and user satisfaction</strong>. Thank you for your patience!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceMaintenance;
