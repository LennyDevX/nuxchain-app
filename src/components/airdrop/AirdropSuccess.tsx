import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface AirdropSuccessProps {
  name: string;
  email: string;
  walletAddress: string;
  onSyncWallet?: () => void;
  onClose?: () => void;
}

export default function AirdropSuccess({ name, email, walletAddress, onSyncWallet }: AirdropSuccessProps) {
  const isMobile = useIsMobile();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSyncWallet = () => {
    if (onSyncWallet) {
      onSyncWallet();
    } else {
      // Default: navigate to Nux page
      window.location.href = '/nux';
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-4 gap-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Large Animated Logo with Glow Effect */}
      <motion.div
        className={`relative ${isMobile ? 'w-28 h-28' : 'w-36 h-36'}`}
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
            className="w-full h-full object-contain drop-shadow-2xl "
          />
        </motion.div>
      </motion.div>

      {/* Welcome Title with Staggered Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center mb-1"
      >
        <h2 className={`jersey-15-regular text-gradient text-center ${isMobile ? 'text-4xl' : 'text-6xl'}`}>
          Welcome to the Airdrop!
        </h2>
        <p className={`jersey-20-regular text-white/60 text-center mt-1 ${isMobile ? 'text-xl' : 'text-xl'}`}>
          Your registration has been confirmed
        </p>
      </motion.div>

      {/* Success Badge with Pulse Effect */}
      <motion.div
        className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 mb-1"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.span 
          className="text-emerald-400 text-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          ✓
        </motion.span>
        <span className="jersey-20-regular text-emerald-400 text-xl">Registration Complete</span>
      </motion.div>

      {/* Registration Details Grid 3x1 */}
      <motion.div
        className="w-full grid grid-cols-3 gap-2 p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {/* Name */}
        <motion.div 
          className="flex flex-col items-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-blue-400 text-xl mb-0.5">👤</span>
          <div className="flex items-center gap-1 mb-0.5">
            <p className="jersey-20-regular text-blue-400 text-xl">Full Name</p>
            <motion.span 
              className="text-emerald-400 text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ✓
            </motion.span>
          </div>
          <p className="jersey-20-regular text-white/70 text-xl truncate w-full">
            {name}
          </p>
        </motion.div>

        {/* Email */}
        <motion.div 
          className="flex flex-col items-center p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.85 }}
        >
          <span className="text-purple-400 text-xl mb-2">✉️</span>
          <div className="flex items-center gap-1 ">
            <p className="jersey-20-regular text-purple-400 text-xl">Email</p>
            <motion.span 
              className="text-emerald-400 text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ✓
            </motion.span>
          </div>
          <p className="jersey-20-regular text-white/70 text-xl truncate w-full">
            {email}
          </p>
        </motion.div>

        {/* Wallet */}
        <motion.div 
          className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span className="text-emerald-400 text-xl mb-0.5">🔐</span>
          <div className="flex items-center gap-1 mb-0.5">
            <p className="jersey-20-regular text-emerald-400 text-xl">Wallet Address</p>
            <motion.span 
              className="text-emerald-400 text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ✓
            </motion.span>
          </div>
          <p className="jersey-20-regular text-white/70 font-mono text-xl truncate w-full">
            {formatAddress(walletAddress)}
          </p>
        </motion.div>
      </motion.div>

      {/* Rewards Info - Compact Grid */}
      <motion.div
        className="w-full grid grid-cols-3 gap-2 p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.6 }}
      >
        <motion.div 
          className="flex flex-col items-center p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <motion.span 
            className="text-amber-400 text-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            🎁
          </motion.span>
          <p className="jersey-20-regular text-amber-400 text-xl  font-bold leading-tight">40,000 NUX</p>
          <p className="jersey-20-regular text-white/60 text-xl leading-tight">Tokens</p>
        </motion.div>

        <motion.div 
          className="flex flex-col items-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.05 }}
        >
          <motion.span 
            className="text-emerald-400 text-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ✓
          </motion.span>
          <p className="jersey-20-regular text-emerald-400 text-xl font-bold leading-tight">Polygon</p>
          <p className="jersey-20-regular text-white/60 text-xl leading-tight">Activity Based</p>
        </motion.div>

        <motion.div 
          className="flex flex-col items-center p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
        >
          <motion.span 
            className="text-blue-400 text-lg"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            🚀
          </motion.span>
          <p className="jersey-20-regular text-blue-400 text-xl font-bold leading-tight">3-Phase</p>
          <p className="jersey-20-regular text-white/60 text-xl leading-tight">Vesting</p>
        </motion.div>
      </motion.div>

      {/* Sync Wallet Button */}
      <motion.button
        onClick={handleSyncWallet}
        className="btn-primary px-6 py-2 rounded-xl jersey-20-regular text-xl w-full mt-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        🔗 Sync Wallet for Rewards
      </motion.button>
    </motion.div>
  );
}
