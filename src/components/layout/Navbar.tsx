import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import WalletConnect from '../web3/WalletConnect.tsx'
import { useIsMobile } from '../../hooks/mobile'

function Navbar() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/staking', label: 'Staking' },
    { path: '/nfts', label: 'NFTs' },
    { path: '/airdrop', label: 'Airdrop' },
    { path: '/store', label: 'Store' },
    { path: '/profile/ai-analysis', label: 'A.I' },
    { path: '/chat', label: 'Chat' }
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  // En móviles, no mostrar navbar superior
  if (isMobile) {
    return null;
  }

  return (
    <motion.nav 
      className="backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <motion.div 
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to="/" className="flex items-center group">
              <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mr-3 "
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
              <img src="/favicon1.png" alt="NuxChain" className="w-full h-full object-contain" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <motion.div 
            className="hidden md:block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, staggerChildren: 0.05 }}
          >
            <div className="ml-10 flex items-center space-x-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.15 + index * 0.05
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link
                      to={link.path}
                      className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                        isActive(link.path)
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                      {link.path === '/airdrop' && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-900"></span>
                        </span>
                      )}
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Wallet Connect + Profile */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link 
                to="/profile" 
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center group" 
                aria-label="Profile"
              >
                <svg className="w-7 h-7 text-white/80 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </motion.div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <WalletConnect />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar