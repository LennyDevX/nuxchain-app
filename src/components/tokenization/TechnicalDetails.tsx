import { memo } from 'react';

// ✅ React 19 Best Practice: Memoize static content component
function TechnicalDetails() {
  return (
    <div className="space-y-6">
      {/* Technical Details */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          🔧 Technical Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className="card-unified p-3">
              <h3 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                <span>🌐</span> IPFS Storage
              </h3>
              <p className="text-white/60 text-xs">
                Decentralized storage ensures your NFT data is permanent and accessible worldwide, 
                even if our platform goes offline.
              </p>
            </div>
            
            <div className="card-unified p-3">
              <h3 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                <span>⚡</span> Polygon Network
              </h3>
              <p className="text-white/60 text-xs">
                Low-cost, fast transactions with full Ethereum compatibility. 
                Your NFTs can be traded on any Polygon-compatible marketplace.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="card-unified p-3">
              <h3 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                <span>💰</span> Smart Royalties
              </h3>
              <p className="text-white/60 text-xs">
                Royalties are built into the smart contract, ensuring you automatically 
                receive payments on every future sale.
              </p>
            </div>
            
            <div className="card-unified p-3">
              <h3 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                <span>🔒</span> True Ownership
              </h3>
              <p className="text-white/60 text-xs">
                You maintain full ownership and control. Transfer, sell, or hold your NFTs 
                across any compatible platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ React 19 Best Practice: Export memoized component
export default memo(TechnicalDetails);