import { motion, AnimatePresence } from 'framer-motion';

interface RequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequirementsModal({ isOpen, onClose }: RequirementsModalProps) {
  const requirementItems = [
    {
      id: 'personal',
      icon: '👤',
      title: 'Your Information',
      description: 'Tell us who you are',
      items: [
        'Name with at least 3 letters',
        'Real email address (for receiving tokens)'
      ]
    },
    {
      id: 'wallet',
      icon: '💰',
      title: 'Your Wallet',
      description: 'We need your Solana wallet',
      items: [
        'Valid Solana wallet address',
        'At least 0.001 SOL to verify you\'re real',
        'Not used in a previous airdrop'
      ]
    },
    {
      id: 'security',
      icon: '🔒',
      title: 'Your Safety',
      description: 'We protect real users',
      items: [
        'Exchange wallets (Coinbase, Kraken) get instant approval',
        'Old wallets (30+ days) have better chances',
        'We check for suspicious activity'
      ]
    },
    {
      id: 'rules',
      icon: '⚡',
      title: 'Quick Rules',
      description: 'Keep it fair for everyone',
      items: [
        'Registration takes at least 3 seconds (blocks bots)',
        'One email = one registration',
        'Pool limit is 10,000 people'
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal - Optimized for mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/20 rounded-2xl shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="sticky top-3 right-3 ml-auto z-10 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-2xl font-bold text-white mb-1">
                  ✨ What You Need
                </h2>
                <p className="text-sm text-gray-400">
                  Simple checklist to register and claim your 6,000 NUX tokens
                </p>
              </div>

              {/* Requirements Grid 2x2 on desktop, 1x1 on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {requirementItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm mb-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2">
                          {item.description}
                        </p>
                        <ul className="space-y-1">
                          {item.items.map((text, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                              <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                              <span>{text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pro Tip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6"
              >
                <p className="text-xs text-blue-300 font-medium">
                  💡 <strong>Pro tip:</strong> Use a wallet from Coinbase, Kraken or Binance for instant approval!
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                onClick={onClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
              >
                Ready to Register! 🚀
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default RequirementsModal;
