import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useSolanaWallet } from '../../hooks/web3/useSolanaWallet';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface NuxWelcomeUniverseProps {
  onClose?: () => void;
}

export default function NuxWelcomeUniverse({ onClose }: NuxWelcomeUniverseProps) {
  const { address } = useAccount();
  const { address: solanaAddress, wallet: solanaWalletName } = useSolanaWallet();
  const isMobile = useIsMobile();

  const formatAddress = (addr: string | null | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-8 gap-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Large Animated Logo with Glow Effect */}
      <motion.div
        className={`relative ${isMobile ? 'w-24 h-24' : 'w-32 h-32'}`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/40 to-purple-500/40 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-full blur-xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        
        {/* Logo Container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          <img
            src="/assets/tokens/NuxLogo.png"
            alt="NUX"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>

      {/* Welcome Title with Staggered Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center"
      >
        <h2 className={`jersey-15-regular text-gradient text-center ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
          Welcome to the NuxChain Universe!
        </h2>
        <p className={`jersey-20-regular text-white/60 text-center mt-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
          Your wallets are now linked and ready for rewards
        </p>
      </motion.div>

      {/* Success Badge with Pulse Effect */}
      <motion.div
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.span 
          className="text-emerald-400 text-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          ✓
        </motion.span>
        <span className="jersey-20-regular text-emerald-400 text-lg">Registration Complete</span>
      </motion.div>

      {/* Linked Wallets Card */}
      <motion.div
        className="w-full p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <p className="jersey-15-regular text-white/80 text-xl mb-4 text-center">🔗 Linked Wallets</p>
        
        {/* Polygon Wallet */}
        <motion.div 
          className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
        >
          <motion.div 
            className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-purple-400 text-xl">⬡</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="jersey-20-regular text-purple-400 text-sm">Polygon Wallet</p>
            <p className="jersey-20-regular text-white/70 font-mono text-base truncate">
              {formatAddress(address)}
            </p>
          </div>
          <motion.span 
            className="text-emerald-400 text-2xl flex-shrink-0"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ✓
          </motion.span>
        </motion.div>

        {/* Solana Wallet */}
        <motion.div 
          className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
        >
          <motion.div 
            className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-emerald-400 text-xl">◎</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="jersey-20-regular text-emerald-400 text-sm">
              Solana {solanaWalletName && `(${solanaWalletName})`}
            </p>
            <p className="jersey-20-regular text-white/70 font-mono text-base truncate">
              {formatAddress(solanaAddress)}
            </p>
          </div>
          <motion.span 
            className="text-emerald-400 text-2xl flex-shrink-0"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ✓
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Rewards Info */}
      <motion.div
        className="w-full p-5 rounded-xl bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-amber-500/5 border border-amber-500/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <p className="jersey-15-regular text-amber-400 text-xl mb-4">🎁 Your Rewards Await</p>
        <div className="space-y-3">
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.span 
              className="text-amber-400 text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              🎁
            </motion.span>
            <p className="jersey-20-regular text-white/70 text-base">
              Up to <span className="text-amber-400 font-bold">40,000 NUX</span> in vesting
            </p>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.span 
              className="text-emerald-400 text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ✓
            </motion.span>
            <p className="jersey-20-regular text-white/70 text-base">
              Whitelist access for presale
            </p>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.span 
              className="text-blue-400 text-2xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              🚀
            </motion.span>
            <p className="jersey-20-regular text-white/70 text-base">
              Priority ecosystem rewards
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-500/15 to-cyan-500/10 border border-blue-500/30 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <p className="jersey-20-regular text-blue-300 text-base text-center">
          🔗 Your activity on Polygon will determine your NUX allocation on Solana
        </p>
      </motion.div>

      {/* Close Button */}
      {onClose && (
        <motion.button
          onClick={onClose}
          className="btn-primary px-8 py-3 rounded-xl jersey-20-regular text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 Continue Exploring
        </motion.button>
      )}
    </motion.div>
  );
}
