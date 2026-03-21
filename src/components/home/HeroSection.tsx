import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function HeroSection() {
  return (
    <div className="relative text-white min-h-[60vh] sm:min-h-[70vh] lg:min-h-[85vh] flex flex-col overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Main Content Centered */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 sm:space-y-6"
        >
          

          <h1 className="jersey-15-regular text-5xl sm:text-7xl lg:text-9xl font-black mb-4 leading-tight">
            <span className="inline-block text-white drop-shadow-lg">Your Place</span>
            <br />
            <span className="inline-block text-gradient">
              TO MINT & SCALE
            </span>
          </h1>

          <p className="jersey-20-regular text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto px-2 sm:px-0">
            Empower creators and communities with an omni-chain DeFi ecosystem. Tokenize your work, monetize with NFTs, secure value with staking, all accelerated by Nuxbee AI.
          </p>

          {/* Minimalist Feature Tags */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 pt-1 sm:pt-2">
            <span className="jersey-15-regular text-slate-400 text-base sm:text-xl flex items-center gap-2">
              <span className="text-purple-400">⚡</span> Omni-chain
            </span>
            <span className="jersey-15-regular text-slate-400 text-base sm:text-xl flex items-center gap-2">
              <span className="text-pink-400">🤖</span> AI-Optimized
            </span>
            <span className="jersey-15-regular text-slate-400 text-base sm:text-xl flex items-center gap-2">
              <span className="text-amber-400">✨</span> Full Ownership
            </span>
          </div>
        </motion.div>

        {/* Buttons - Centered below content */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 w-full sm:w-auto px-4 sm:px-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link 
            to="/about" 
            className="jersey-20-regular group px-8 py-3 rounded-xl border border-white/10 hover:border-purple-500/40 bg-black/20 hover:bg-white/5 backdrop-blur-md text-white text-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-xl"
          >
            Explore Nuxchain
          </Link>
          <Link 
            to="/tokenization" 
            className="jersey-20-regular group px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            Start Creating
            <motion.span
              className="inline-block transition-transform group-hover:translate-x-1"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default HeroSection