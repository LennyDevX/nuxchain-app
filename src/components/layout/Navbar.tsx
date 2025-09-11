import { Link, useLocation } from 'react-router-dom'
import WalletConnect from '../web3/WalletConnect'
import { useIsMobile } from '../../hooks/mobile'

function Navbar() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/staking', label: 'Staking' },
    { path: '/nfts', label: 'NFTs' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/airdrops', label: 'Airdrops' },
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
    <nav className="backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-xl">NUX</span>
              </div>
             
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center">
            <WalletConnect />
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar