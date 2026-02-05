import React from 'react';
import Footer from '../components/layout/footer';
import { motion } from 'framer-motion';
import '../styles/maintenance.css';

const MarketplaceMaintenance: React.FC = () => {
  return (
    <div className="maintenance-wrapper">
      {/* Background blobs for visual interest */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="maintenance-container">
        <div className="maintenance-content">
          {/* Marketplace Icon Animation */}
          <motion.div 
            className="mb-8 relative z-10 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.div
                className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-purple-500/30"
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <svg 
                  className="w-24 h-24 md:w-32 md:h-32 text-purple-400"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </motion.div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-6 bg-purple-500/20 blur-2xl rounded-full animate-pulse"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 italic tracking-tight">
              MARKETPLACE EN OPTIMIZACIÓN
            </h1>
            
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
              Estamos implementando mejoras significativas en el Marketplace para ofrecerte 
              una experiencia más rápida y eficiente. Estas optimizaciones reducirán el 
              consumo de recursos y mejorarán el rendimiento general.
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              <span className="text-sm font-medium text-purple-300">Optimizando Sistema</span>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div 
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-xs text-gray-400">Carga más rápida</div>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl mb-2">💎</div>
                <div className="text-xs text-gray-400">Mejor UX</div>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-xs text-gray-400">Mayor seguridad</div>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl mb-2">🚀</div>
                <div className="text-xs text-gray-400">Optimizado</div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <motion.button
                onClick={() => window.location.href = '/nfts'}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/50 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Explorar NFTs</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/staking'}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white border border-white/20 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Ir a Staking</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.button>
            </div>

            <p className="text-gray-500 text-sm">
              ¿Necesitas ayuda? Visita nuestro{' '}
              <a href="/chat" className="text-purple-400 hover:text-purple-300 underline">
                Chat de soporte
              </a>
            </p>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MarketplaceMaintenance;
