import { memo } from 'react';
import { NFT_BENEFITS } from '../../constants/benefits';

// ✅ React 19 Best Practice: Memoize to prevent re-renders from parent
function Benefits() {
  // ✅ React 19 Best Practice: Use centralized constants
  const benefits = NFT_BENEFITS;

  return (
    <div className="space-y-6">
      {/* Why Create NFTs */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          🌟 Why Create NFTs?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
}

// ✅ React 19 Best Practice: Export memoized component
export default memo(Benefits);