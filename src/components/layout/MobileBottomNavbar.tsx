import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBottomNavbar } from '../../hooks/mobile';
import WalletConnect from '../web3/WalletConnect';

// Iconos SVG
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const StakingIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NFTIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MarketplaceIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MenuIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ isActive: boolean }>;
}

const MobileBottomNavbar: React.FC = () => {
  const location = useLocation();
  const { isVisible, isMobile } = useBottomNavbar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/staking', label: 'Staking', icon: StakingIcon },
    { path: '/nfts', label: 'NFTs', icon: NFTIcon },
    { path: '/marketplace', label: 'Market', icon: MarketplaceIcon }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // No renderizar si no es móvil o si estamos en la página de chat
  if (!isMobile || location.pathname === '/chat') {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-around px-4 py-3 safe-area-bottom">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-3 px-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-blue-500/20 scale-105 shadow-lg shadow-blue-500/20'
                    : 'hover:bg-white/5 active:scale-95'
                }`}
              >
                <div className={`p-1 rounded-lg transition-all duration-200 ${
                  active ? 'bg-blue-500/30' : ''
                }`}>
                  <IconComponent isActive={active} />
                </div>
                <span
                  className={`text-xs mt-2 font-medium truncate max-w-full transition-colors duration-200 ${
                    active ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Botón de menú hamburguesa */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-3 px-2 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-95 relative"
          >
            <div className="p-1 rounded-lg transition-all duration-200">
              <MenuIcon isActive={false} />
            </div>
            <span className="text-xs mt-2 font-medium truncate max-w-full text-gray-400 transition-colors duration-200">
              Menú
            </span>
            {/* Indicador de notificación */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        </div>
        
        {/* Indicador de página activa */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-end">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className={`relative w-full bg-black/90 backdrop-blur-md border-t border-white/20 rounded-t-3xl transform transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <div className="p-6 space-y-6">
              {/* Close button */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Menú</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-4">
                {/* Connect Wallet */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <WalletConnect />
                </div>

                {/* Airdrops */}
                <Link
                  to="/airdrops"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="text-white font-medium">Airdrops</span>
                </Link>

                {/* AI Chat */}
                <Link
                  to="/chat"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-white font-medium">AI Chat</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNavbar;