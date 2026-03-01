import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface AirdropSuccessProps {
  name: string;
  email: string;
  walletAddress: string;
}

export default function AirdropSuccess({ name, email, walletAddress }: AirdropSuccessProps) {
  const isMobile = useIsMobile();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-6 gap-4 w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section with Title Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center w-full"
      >
        <motion.h1 
          className={`jersey-15-regular text-gradient ${isMobile ? 'text-3xl' : 'text-5xl'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          WELCOME TO
        </motion.h1>
        <motion.h2 
          className={`jersey-15-regular bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ${isMobile ? 'text-4xl' : 'text-6xl'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          THE UNIVERSE
        </motion.h2>
        <motion.p 
          className={`jersey-20-regular text-white/60 mt-2 ${isMobile ? 'text-lg' : 'text-xl'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Your presence in the Nuxchain ecosystem has been verified and registered.
        </motion.p>
      </motion.div>

      {/* Success Badge with Enhanced Pulse */}
      <motion.div
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <motion.div
          className="w-3 h-3 bg-emerald-500 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="jersey-20-regular text-emerald-400 text-xl">✓ Registration Complete</span>
        <motion.span 
          className="text-emerald-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          ⭐
        </motion.span>
      </motion.div>

      {/* Main Content Grid: Left = 40k NUX, Right = Buttons 2x2 */}
      <div className={`w-full grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'} mt-4`}>
        
        {/* LEFT: 40,000 NUX Allocation */}
        <motion.div
          className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-amber-600/10 border border-amber-500/30 relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Background Animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-purple-500/5"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          {/* Token Icon */}
          <motion.div
            className="relative mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <img 
              src="/assets/tokens/NuxLogo.png" 
              alt="NUX" 
              className="w-16 h-16 object-contain"
            />
            <motion.div
              className="absolute -top-1 -right-1 text-2xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </motion.div>

          {/* Allocation Text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="relative z-10 text-center"
          >
            <p className="text-amber-400/80 text-sm uppercase tracking-widest mb-1">Allocation Secured</p>
            <motion.p 
              className="jersey-15-regular text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
              animate={{ textShadow: [
                '0 0 20px rgba(251, 191, 36, 0.3)',
                '0 0 40px rgba(251, 191, 36, 0.6)',
                '0 0 20px rgba(251, 191, 36, 0.3)'
              ]}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              40,000
            </motion.p>
            <p className="jersey-15-regular text-4xl text-amber-400">$NUX</p>
          </motion.div>

          {/* Vesting Info */}
          <motion.div 
            className="mt-4 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            </motion.div>
        </motion.div>

        {/* RIGHT: Buttons Grid 2x2 */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {/* Button 1: Sync Wallet */}
          <motion.a
            href="/nux"
            className="group relative p-4 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border border-purple-400/30 transition-all duration-300 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-3xl">🔗</span>
            <span className="jersey-20-regular text-white text-lg">Sync Wallet</span>
            <span className="text-xs text-purple-200/70">For Rewards</span>
          </motion.a>

          {/* Button 2: Explore NUX */}
          <motion.a
            href="/tokenomics"
            className="group relative p-4 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-400/30 transition-all duration-300 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-3xl">🚀</span>
            <span className="jersey-20-regular text-white text-lg">Explore NUX</span>
            <span className="text-xs text-amber-200/70">Token Info</span>
          </motion.a>

          {/* Button 3: Nuxbee AI */}
          <motion.a
            href="/chat"
            className="group relative p-4 rounded-xl bg-gradient-to-br from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600 border border-pink-400/30 transition-all duration-300 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-3xl">🤖</span>
            <span className="jersey-20-regular text-white text-lg">Nuxbee AI</span>
            <span className="text-xs text-pink-200/70">NUX AI</span>
          </motion.a>

          {/* Button 4: Profile */}
          <motion.a
            href="/profile"
            className="group relative p-4 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-gray-500/30 transition-all duration-300 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(156, 163, 175, 0.2)' }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, 15, 0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              👤
            </motion.span>
            <span className="jersey-20-regular text-white text-lg">Profile</span>
            <span className="text-xs text-gray-300/70">My Account</span>
          </motion.a>
        </motion.div>
      </div>

      {/* Registration Details Cards */}
      <motion.div
        className={`w-full grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3 mt-4`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        {/* Name Card */}
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-2xl">👤</span>
          <div className="flex-1 min-w-0">
            <p className="text-blue-400 text-xs uppercase">Full Name</p>
            <p className="jersey-20-regular text-white truncate">{name}</p>
          </div>
          <motion.span 
            className="text-emerald-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ✓
          </motion.span>
        </motion.div>

        {/* Email Card */}
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-2xl">✉️</span>
          <div className="flex-1 min-w-0">
            <p className="text-purple-400 text-xs uppercase">Email</p>
            <p className="jersey-20-regular text-white truncate">{email}</p>
          </div>
          <motion.span 
            className="text-emerald-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          >
            ✓
          </motion.span>
        </motion.div>

        {/* Wallet Card */}
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-2xl">🔐</span>
          <div className="flex-1 min-w-0">
            <p className="text-emerald-400 text-xs uppercase">Wallet</p>
            <p className="jersey-20-regular text-white font-mono truncate">{formatAddress(walletAddress)}</p>
          </div>
          <motion.span 
            className="text-emerald-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          >
            ✓
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
