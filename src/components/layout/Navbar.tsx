import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import WalletConnect from '../web3/WalletConnect.tsx'
import { useIsMobile } from '../../hooks/mobile'
import { isMaintenanceMode } from '../../config/maintenance'

function Navbar() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const navLinks = [
    { path: '/staking', label: 'Staking' },
    { path: '/nfts', label: 'NFTs' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/store', label: 'Store' },
    { path: '/giveaway', label: 'Giveaway' },
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
      className="backdrop-blur-md shadow-lg border-b border-white/20 fixed top-0 left-0 right-0 z-50"
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
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <div className="relative w-10 h-10 mr-2 group">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg group-hover:bg-blue-500/40 transition-colors"></div>
                  <img
                    src="/assets/unused/favicon1.png"
                    alt="Nuxchain Logo"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                  />
                </div>
                <span className="text-4xl jersey-15-regular tracking-tighter uppercase italic bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-pink-400 transition-all duration-300 antialiased">
                  Nuxchain
                </span>
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
            <div className="ml-10 flex items-center space-x-0.5">
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
                      className={`jersey-20-regular inline-flex items-center gap-2 px-2 py-2 rounded-xl text-xl transition-all duration-200 relative ${isActive(link.path)
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {link.label}

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