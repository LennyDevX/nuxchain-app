import React from 'react';
import Footer from '../components/layout/footer';
import { getMaintenanceConfig } from '../config/maintenance';
import { motion } from 'framer-motion';
import '../styles/maintenance.css';

const MarketplaceMaintenance: React.FC = () => {
  const config = getMaintenanceConfig('marketplace');

  return (
    <div className="maintenance-wrapper marketplace-theme">
      {/* Background blobs for visual interest */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="maintenance-container">
        <div className="maintenance-content">
          {/* Warrior Warrior Image with fire animation */}
          <motion.div
            className="mb-8 relative z-10 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.img
                src="/DragonixRed_Warrior.png"
                alt="Dragonix Warrior"
                className="w-64 h-auto md:w-80 drop-shadow-[0_0_35px_rgba(239,68,68,0.4)]"
                animate={{
                  y: [0, -8, 0],
                  filter: [
                    'drop-shadow(0 0 25px rgba(239,68,68,0.4))',
                    'drop-shadow(0 0 45px rgba(249,115,22,0.6))',
                    'drop-shadow(0 0 25px rgba(239,68,68,0.4))'
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-6 bg-red-600/20 blur-2xl rounded-full animate-pulse"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Header */}
            <div className="maintenance-header">
              <h1>Marketplace Evolution</h1>
              <p className="maintenance-subtitle text-red-400/80 font-bold uppercase tracking-widest text-[10px]">Strategic Upgrade in progress</p>
            </div>

            {/* Message */}
            <div className="maintenance-message">
              <p>{config.message}</p>
            </div>

            {/* Status Section */}
            <div className="maintenance-status-badge">
              <span className="pulse-dot"></span>
              Status: Reforging Marketplace
            </div>

            {/* Details */}
            <div className="maintenance-details">
              <h2 className="text-red-500/60">Expansion Protocol</h2>
              <div className="maintenance-grid">
                <div className="grid-item">
                  <span className="icon">🔥</span>
                  <p>Next-gen trading engine</p>
                </div>
                <div className="grid-item">
                  <span className="icon">⚔️</span>
                  <p>Enhanced security layer</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🛡️</span>
                  <p>Guild management tools</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🚀</span>
                  <p>Flash-fast transactions</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="maintenance-action">
              <button
                className="refresh-button w-full mb-3"
                onClick={() => window.location.reload()}
              >
                <span>Check Battlefield</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
                </svg>
              </button>
              <button
                className="staking-button w-full"
                onClick={() => window.location.href = '/staking'}
              >
                <span>Go to Staking Hub</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </button>
            </div>

            {/* Importance Info */}
            <div className="maintenance-importance">
              <p>
                We are reforging the marketplace to support <strong>massive trading volume and advanced features</strong>. The wait will be worth it.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MarketplaceMaintenance;
