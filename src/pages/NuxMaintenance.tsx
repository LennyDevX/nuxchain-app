import React from 'react';
import Footer from '../components/layout/footer';
import { motion } from 'framer-motion';
import '../styles/maintenance.css';

const NuxMaintenance: React.FC = () => {
  return (
    <div className="maintenance-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="maintenance-container">
        <div className="maintenance-content">
          <motion.div
            className="mb-8 relative z-10 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.img
                src="/assets/tokens/NuxLogo.png"
                alt="NUX Token"
                className="w-56 h-56 md:w-72 md:h-72 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]"
                animate={{ y: [0, -10, 0], rotate: [0, 1, 0, -1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4 italic tracking-tight">
              NUX TOKEN PAGE COMING SOON
            </h1>

            <div className="maintenance-message mb-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                We are finalizing the <span className="text-amber-400 font-bold">NUX Token</span> page with the latest tokenomics 2.0, presale details, cross-chain bridge access, and Polygon activity rewards.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                🪙 What's Coming with NUX
              </h2>
              <div className="maintenance-grid">
                <div className="grid-item">
                  <span className="icon">📊</span>
                  <p className="text-sm">Tokenomics 2.0</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🎁</span>
                  <p className="text-sm">Presale & airdrop details</p>
                </div>
                <div className="grid-item">
                  <span className="icon">⛓️</span>
                  <p className="text-sm">Cross-chain bridge access</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🏆</span>
                  <p className="text-sm">Polygon activity rewards</p>
                </div>
              </div>
            </div>

            <div className="maintenance-action">
              <button
                className="refresh-button w-full"
                onClick={() => window.location.reload()}
              >
                <span>Check Status</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NuxMaintenance;
