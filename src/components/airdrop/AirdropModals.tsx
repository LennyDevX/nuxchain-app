import { useNavigate } from 'react-router-dom';

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
        
      <div className="relative bg-black/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-1 max-w-lg w-full shadow-[0_0_100px_-20px_rgba(147,51,234,0.3)] animate-scaleIn overflow-hidden">
        {/* Animated Glow backgrounds */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        
        <div className="p-8 sm:p-10 text-center relative z-10">
          {/* Success Icon with complex animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="relative bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full w-full h-full flex items-center justify-center shadow-lg border border-white/20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase leading-none">
            Welcome to <br/>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">The Universe</span>
          </h2>
          
          <p className="text-gray-400 text-lg mb-8 font-medium">
            Your presence in the Nuxchain ecosystem has been verified and registered.
          </p>

          <div className="relative group p-6 rounded-3xl bg-white/5 border border-white/10 mb-8 transition-transform duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Allocation Secured</p>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-white tracking-tighter">
                {tokensPerUser.toLocaleString()}
              </span>
              <span className="text-purple-400 font-black text-xl tracking-widest mt-1">$NUX</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-4 sm:py-5 bg-white text-black rounded-xl sm:rounded-2xl font-black text-base sm:text-lg uppercase tracking-widest transition-all duration-300 hover:bg-gray-200 active:scale-95 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
            >
              Close
            </button>

            <button
              onClick={() => navigate('/staking')}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg uppercase tracking-widest transition-all duration-300 hover:from-purple-500 hover:to-pink-500 active:scale-95 shadow-[0_20px_40px_-15px_rgba(147,51,234,0.3)]"
            >
              Staking
            </button>
          </div>
        </div>

        {/* Decorative Corner Gradients */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default AirdropModals;