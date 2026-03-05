import React, { lazy, Suspense } from 'react';
import Footer from '../components/layout/footer';
import { getMaintenanceConfig, isMaintenanceMode } from '../config/maintenance';
import '../styles/maintenance.css';

// Lazy load the actual Chat component
const ChatPage = lazy(() => import('./Chat'));

interface MaintenancePageProps {
  message?: string;
}

const ChatMaintenancePage: React.FC<MaintenancePageProps> = ({
  message
}) => {
  const isMaintenance = isMaintenanceMode('chat');
  const config = getMaintenanceConfig('chat');
  const displayMessage = message || config.message;

  // If maintenance is disabled, show the real chat page
  if (!isMaintenance) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ChatPage />
      </Suspense>
    );
  }

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
            <h1>Nuxbee AI Upgrade</h1>
            <p className="maintenance-subtitle">Chat temporarily unavailable</p>
          </div>

          {/* Message */}
          <div className="maintenance-message">
            <p>{displayMessage}</p>
          </div>

          {/* Status Section */}
          <div className="maintenance-status-badge">
            <span className="pulse-dot"></span>
            Status: System Upgrade in Progress
          </div>

          {/* Details */}
          <div className="maintenance-details">
            <h2>What We're Improving</h2>
            <div className="maintenance-grid">
              <div className="grid-item">
                <span className="icon">🧠</span>
                <p>Advanced AI capabilities</p>
              </div>
              <div className="grid-item">
                <span className="icon">💾</span>
                <p>Cloud conversation storage</p>
              </div>
              <div className="grid-item">
                <span className="icon">⚡</span>
                <p>Faster response times</p>
              </div>
              <div className="grid-item">
                <span className="icon">🔒</span>
                <p>Enhanced security & privacy</p>
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
              onClick={() => window.location.href = '/'}
            >
              <span>Go to Home</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          </div>

          {/* Importance Info */}
          <div className="maintenance-importance">
            <p>
              We're upgrading Nuxbee AI with enhanced features, better performance, and improved conversation history management.
              <strong> We appreciate your patience as we build the future of AI on NuxChain</strong>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChatMaintenancePage;
