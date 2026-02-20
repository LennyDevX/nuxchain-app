import React from 'react';
import Footer from '../components/layout/footer';
import { motion } from 'framer-motion';
import '../styles/maintenance.css';

const ColabMaintenance: React.FC = () => {
  return (
    <div className="maintenance-wrapper">
      {/* Background blobs for visual interest */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="maintenance-container">
        <div className="maintenance-content">
          {/* Dragon Image with light animation */}
          <motion.div
            className="mb-8 relative z-10 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.img
                src="/NuxCoin.png"
                alt="NUX Token Colab"
                className="w-56 h-56 md:w-72 md:h-72 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, 0, -1, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 italic tracking-tight">
              COLAB PORTAL UPGRADE
            </h1>

            <div className="maintenance-message mb-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                We are currently <span className="text-purple-400 font-bold">upgrading the Colab Portal</span> with enhanced collaboration tools and builder reward systems. Back very soon.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                🚀 What's Coming to Colab
              </h2>
              <div className="maintenance-grid">
                <div className="grid-item">
                  <span className="icon">🤝</span>
                  <p className="text-sm">Enhanced collaboration tools</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🏆</span>
                  <p className="text-sm">Upgraded builder rewards</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🎨</span>
                  <p className="text-sm">New badge customization</p>
                </div>
                <div className="grid-item">
                  <span className="icon">⚡</span>
                  <p className="text-sm">Faster minting & recognition</p>
                </div>
              </div>
            </div>

            <div className="py-4 px-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl mb-8">
              <p className="text-white font-black italic tracking-wider">
                ✨ BUILDERS PROGRAM: <span className="text-purple-400 uppercase">Next phase launching soon</span>
              </p>
            </div>

            <div className="maintenance-action">
              <button
                className="refresh-button w-full mb-3"
                onClick={() => window.location.reload()}
              >
                <span>Check Updates</span>
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
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ColabMaintenance;
