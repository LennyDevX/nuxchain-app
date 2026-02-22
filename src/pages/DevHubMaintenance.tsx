import React from 'react';
import Footer from '../components/layout/footer';
import { motion } from 'framer-motion';
import '../styles/maintenance.css';

const DevHubMaintenance: React.FC = () => {
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
              <motion.div
                className="text-8xl md:text-9xl"
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                🛠️
              </motion.div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 italic tracking-tight">
              DEVELOPER HUB UPGRADE
            </h1>

            <div className="maintenance-message mb-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                We are rebuilding the <span className="text-blue-400 font-bold">Developer Hub</span> with improved documentation, new builder tools, and enhanced resources for the NuxChain ecosystem.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                🚀 What's Coming to DevHub
              </h2>
              <div className="maintenance-grid">
                <div className="grid-item">
                  <span className="icon">📚</span>
                  <p className="text-sm">Improved documentation</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🔧</span>
                  <p className="text-sm">New builder tools</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🏆</span>
                  <p className="text-sm">Enhanced builder rewards</p>
                </div>
                <div className="grid-item">
                  <span className="icon">🤝</span>
                  <p className="text-sm">Collaboration features</p>
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

export default DevHubMaintenance;
