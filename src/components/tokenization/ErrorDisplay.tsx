import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function ErrorDisplay({ 
  error, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 8000 
}: ErrorDisplayProps) {
  // Directly derive visibility from error prop
  const isVisible = !!error;

  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Parse error title and message
  const parseError = (errorText: string) => {
    const parts = errorText.split(':');
    if (parts.length >= 2) {
      return {
        title: parts[0].trim(),
        message: parts.slice(1).join(':').trim()
      };
    }
    return {
      title: 'Error',
      message: errorText
    };
  };

  const { title, message } = error ? parseError(error) : { title: '', message: '' };

  // Get icon based on error title
  const getIcon = () => {
    if (title.includes('Cancel')) return '🚫';
    if (title.includes('Insufficient')) return '💰';
    if (title.includes('Upload')) return '☁️';
    if (title.includes('Network')) return '📡';
    if (title.includes('Configuration')) return '⚙️';
    if (title.includes('Wallet')) return '👛';
    return '⚠️';
  };

  // Get color scheme based on error type
  const getColorScheme = () => {
    if (title.includes('Cancel')) {
      return {
        bg: 'from-gray-500/20 to-gray-600/20',
        border: 'border-gray-500/30',
        text: 'text-gray-300',
        iconBg: 'bg-gray-500/20'
      };
    }
    if (title.includes('Insufficient')) {
      return {
        bg: 'from-yellow-500/20 to-orange-600/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-300',
        iconBg: 'bg-yellow-500/20'
      };
    }
    return {
      bg: 'from-red-500/20 to-pink-600/20',
      border: 'border-red-500/30',
      text: 'text-red-300',
      iconBg: 'bg-red-500/20'
    };
  };

  const colors = getColorScheme();

  return (
    <AnimatePresence>
      {isVisible && error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
        >
          <div className={`bg-gradient-to-r ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-2xl shadow-2xl overflow-hidden`}>
            {/* Progress bar */}
            {autoClose && (
              <motion.div
                className="h-1 bg-white/30"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
              />
            )}

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 25 }}
                  className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.iconBg} flex items-center justify-center text-2xl`}
                >
                  {getIcon()}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`jersey-15-regular text-lg md:text-xl font-bold ${colors.text} mb-2`}
                  >
                    {title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="jersey-20-regular text-white/80 text-sm md:text-base leading-relaxed whitespace-pre-line"
                  >
                    {message}
                  </motion.p>

                  {/* Actions */}
                  {title.includes('Cancel') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 flex gap-3"
                    >
                      <button
                        onClick={handleClose}
                        className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                      >
                        Got it
                      </button>
                    </motion.div>
                  )}

                  {title.includes('Insufficient Funds') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 flex gap-3"
                    >
                      <a
                        href="https://wallet.polygon.technology/polygon/bridge"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Get MATIC
                      </a>
                      <button
                        onClick={handleClose}
                        className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}

                  {title.includes('Staking') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 flex gap-3"
                    >
                      <a
                        href="/staking"
                        className="text-sm px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Go to Staking
                      </a>
                      <button
                        onClick={handleClose}
                        className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleClose}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/60 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
