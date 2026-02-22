import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AirdropModalsProps {
  showSuccess: boolean;
  setShowSuccess: (show: boolean) => void;
  tokensPerUser: number;
}

function AirdropModals({ showSuccess, setShowSuccess, tokensPerUser }: AirdropModalsProps) {
  const navigate = useNavigate();

  if (!showSuccess) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with extreme blur and dark tint */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn"
        onClick={() => setShowSuccess(false)}
      />
        
      <motion.div 
        className="relative bg-black/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-1 max-w-lg w-full shadow-[0_0_100px_-20px_rgba(147,51,234,0.3)] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Animated Glow backgrounds */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        
        {/* Decorative Corner Gradients */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-600/20 rounded-full blur-3xl"></div>
        
        <div className="p-8 sm:p-10 text-center relative z-10">
          {/* Nux Logo with Glow */}
          <motion.div 
            className="relative w-24 h-24 mx-auto mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/50 to-purple-600/50 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-amber-400/30 to-purple-500/30 rounded-full blur-xl"></div>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <img 
                src="/assets/tokens/NuxLogo.png" 
                alt="NUX" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          <motion.h2 
            className="jersey-15-regular text-3xl sm:text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to <br/>
            <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">The Universe</span>
          </motion.h2>
          
          <motion.p 
            className="jersey-15-regular text-sm sm:text-xl md:text-2xl text-gray-300 mb-6 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your presence in the Nuxchain ecosystem has been verified and registered.
          </motion.p>

          {/* Success Badge */}
          <motion.div 
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/40">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="jersey-20-regular text-emerald-400 text-lg">✓ Registration Complete</span>
            </div>
          </motion.div>

          {/* Allocation Box */}
          <motion.div
            className="relative group p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-amber-600/10 border border-amber-500/30 mb-6 overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-purple-500/5 animate-pulse"></div>
            <div className="relative z-10">
              <p className="text-amber-400/80 text-xs uppercase tracking-widest mb-2">Allocation Secured</p>
              <p className="jersey-15-regular text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                {tokensPerUser.toLocaleString()}
              </p>
              <p className="jersey-15-regular text-2xl text-amber-400">$NUX</p>
              
              {/* Vesting Info */}
              <div className="mt-3 flex justify-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">10K at TGE</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">20K +3mo</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs">10K +6mo</span>
              </div>
            </div>
          </motion.div>

          {/* Launch Dates */}
          <motion.div 
            className="grid grid-cols-3 gap-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-amber-400 text-xs font-bold">WHITELIST</p>
              <p className="text-white text-sm font-bold">0.000015</p>
              <p className="text-white/50 text-xs">Mar 2-14</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-blue-400 text-xs font-bold">PRESALE</p>
              <p className="text-white text-sm font-bold">0.000025</p>
              <p className="text-white/50 text-xs">Mar 2-22</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-emerald-400 text-xs font-bold">LP/TGE</p>
              <p className="text-white text-sm font-bold">0.00004</p>
              <p className="text-white/50 text-xs">Mar 24</p>
            </div>
          </motion.div>

          {/* Buttons Grid 2x2 */}
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={() => setShowSuccess(false)}
              className="jersey-20-regular py-3 sm:py-4 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:bg-gray-200 active:scale-95 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.2)]"
            >
              Close
            </button>

            <button
              onClick={() => navigate('/nux')}
              className="jersey-20-regular py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:from-purple-500 hover:to-pink-500 active:scale-95 shadow-[0_10px_30px_-10px_rgba(147,51,234,0.3)]"
            >
              Explore NUX
            </button>

            <button
              onClick={() => navigate('/staking')}
              className="jersey-20-regular py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:from-amber-500 hover:to-orange-500 active:scale-95 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)]"
            >
              Staking
            </button>

            <button
              onClick={() => navigate('/tokenomics')}
              className="jersey-20-regular py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)]"
            >
              Presale Info
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default AirdropModals;