import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBottomNavbar } from '../../hooks/mobile';
import { useChatNavbar } from '../../hooks/mobile/useChatNavbar';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import WalletConnect from '../web3/WalletConnect.tsx';
import { isMaintenanceMode } from '../../config/maintenance';

// Iconos SVG
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const StakingIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NFTIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MarketplaceIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-pink-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MenuIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-pink-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Icono de Store enfocado en Skills (estrella)
const StoreIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.75L6.16 21l1.12-6.54L2 9.75l6.58-.96L12 3.5l3.42 5.29 6.58.96-5.28 4.71 1.12 6.54z" />
  </svg>
);


interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ isActive: boolean }>;
}

const MobileBottomNavbar: React.FC = () => {
  const location = useLocation();
  const isInChat = location.pathname === '/chat';
  const bottomNavbar = useBottomNavbar();
  const chatNavbar = useChatNavbar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✅ Haptic feedback
  const triggerHaptic = useTapFeedback();

  // Usar el hook apropiado según la página
  const { isVisible, isMobile } = isInChat ? chatNavbar : bottomNavbar;
  const hideNavbar = isInChat ? chatNavbar.hideNavbar : undefined;

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/staking', label: 'Staking', icon: StakingIcon },
    { path: '/nfts', label: 'NFTs', icon: NFTIcon },
    { path: '/marketplace', label: 'Market', icon: MarketplaceIcon },
    { path: '/store', label: 'Store', icon: StoreIcon }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // No renderizar si no es móvil
  if (!isMobile) {
    return null;
  }

  return (
    <>
      <motion.nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 ${isVisible ? '' : 'pointer-events-none'
          }`}
        initial={{ y: isVisible ? 0 : 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8
        }}
      >
        <div className="flex items-center justify-around px-4 py-3 safe-area-bottom">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <Link
                  to={item.path}
                  onClick={() => {
                    triggerHaptic('light');
                    if (isInChat) hideNavbar?.();
                  }}
                  className={`flex flex-col items-center justify-center min-w-0 flex-1 py-3 px-2 rounded-xl transition-all duration-200 active:scale-95 ${active
                    ? 'bg-pink-500/20 scale-105 shadow-lg shadow-pink-500/20'
                    : 'hover:bg-white/5'
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent rounded-xl"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}

                  <motion.div
                    className={`p-1 rounded-lg transition-all duration-200 relative z-10 ${active ? 'bg-pink-500/30' : ''
                      }`}
                    animate={{
                      scale: active ? 1.1 : 1,
                      rotate: active ? 5 : 0
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    <IconComponent isActive={active} />
                  </motion.div>

                  <motion.span
                    className={`jersey-20-regular text-lg mt-2 font-medium truncate max-w-full transition-colors duration-200 relative z-10 ${active ? 'text-pink-400' : 'text-gray-400'
                      }`}
                    animate={{
                      scale: active ? 1.05 : 1,
                      opacity: active ? 1 : 0.7
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              </motion.div>
            );
          })}

          {/* Botón de menú hamburguesa */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: navItems.length * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <motion.button
              onClick={() => {
                triggerHaptic('light');
                setIsMenuOpen(true);
              }}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-3 px-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="p-1 rounded-lg transition-all duration-200"
                animate={{ rotate: 0 }}
              >
                <MenuIcon isActive={false} />
              </motion.div>
              <span className="jersey-20-regular text-base mt-2  truncate max-w-full text-gray-400 transition-colors duration-200">
                Menú
              </span>
              {/* Indicador de notificación dinámico */}
              {(isMaintenanceMode('airdrop') || isMaintenanceMode('tokenomics') || isMaintenanceMode('nfts') || isMaintenanceMode('marketplace')) && (
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Indicador de página activa */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        />
      </motion.nav>

      {/* Mobile Menu Overlay with AnimatePresence */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop with blur */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                const walletOpen = document.querySelector('.wallet-dropdown');
                if (!walletOpen) setIsMenuOpen(false);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Menu Panel */}
            <motion.div
              className="relative w-full bg-black/90 backdrop-blur-md border-t border-white/20 rounded-t-3xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 500, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 500, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.5
              }}
            >
              <div className="p-6 space-y-6">
                {/* Close button */}
                <motion.div
                  className="flex justify-between items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="jersey-20-regular text-white text-2xl">Menu</span>
                  </div>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Menu Items */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, staggerChildren: 0.05 }}
                >
                  {/* Connect Wallet */}
                  <motion.div
                    className="flex justify-center p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WalletConnect />
                  </motion.div>

                  {/* Profile Link */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="jersey-20-regular text-white text-2xl">Profile</span>
                      <span className="ml-auto jersey-20-regular text-xl text-gradient">All My Data</span>
                    </Link>
                  </motion.div>

                  {/* Airdrop */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/airdrop"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
                    >
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <span className="jersey-20-regular text-white text-xl">Airdrops</span>
                      {!isMaintenanceMode('airdrop') && (
                        <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <span className="jersey-20-regular text-emerald-400 text-xl">LIVE</span>
                        </span>
                      )}
                      {isMaintenanceMode('airdrop') && (
                        <motion.div
                          className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50 ml-auto"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </Link>
                  </motion.div>

                  {/* AI Chat */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Link
                      to="/chat"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="jersey-20-regular text-white text-xl">AI Chat</span>
                      <motion.span
                        className="ml-auto jersey-20-regular text-xl text-gradient"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Try Now!
                      </motion.span>
                    </Link>
                  </motion.div>

                  {/* Launchpad */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.38 }}
                  >
                    <Link
                      to="/launchpad"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors relative"
                    >
                      <span className="text-xl">🚀</span>
                      <span className="jersey-20-regular text-purple-400 text-xl">Launchpad</span>
                      <motion.span
                        className="ml-auto jersey-20-regular text-xl px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        NEW
                      </motion.span>
                    </Link>
                  </motion.div>

                  {/* NUX Token */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      to="/nux"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors relative"
                    >
                      <span className="text-xl">🪙</span>
                      <span className="jersey-20-regular text-amber-400 text-xl">NUX Token</span>
                      <motion.div
                        className="w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)] ml-auto"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </Link>
                  </motion.div>

                  {/* Tokenomics */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <Link
                      to="/tokenomics"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
                    >
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="jersey-20-regular text-white text-xl">Tokenomics</span>
                      {isMaintenanceMode('tokenomics') && (
                        <motion.div
                          className="w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)] ml-auto"
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNavbar;