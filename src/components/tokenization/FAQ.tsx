import { memo } from 'react';

// ✅ React 19 Best Practice: Memoize static content component
function FAQ() {
  return (
    <div className="space-y-6">
      {/* FAQ */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          ❓ Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white font-medium text-sm">Why does my wallet show "Unknown" initially?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 text-white/60 text-xs">
              This is normal! Wallets need time to fetch and cache the metadata from IPFS. 
              The NFT is safely stored on the blockchain, and the image will appear within 2-5 minutes.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white font-medium text-sm">Can I edit my NFT after creation?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 text-white/60 text-xs">
              No, NFTs are immutable once created. This ensures authenticity and prevents fraud. 
              Make sure all details are correct before minting.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white font-medium text-sm">What happens if IPFS goes down?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 text-white/60 text-xs">
              IPFS is decentralized with thousands of nodes worldwide. Your content is replicated 
              across multiple nodes, making it extremely resilient to outages.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-white font-medium text-sm">How do royalties work?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 text-white/60 text-xs">
              Royalties are automatically paid to you every time your NFT is resold. 
              The percentage you set (0-10%) is enforced by the smart contract.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

// ✅ React 19 Best Practice: Export memoized component
export default memo(FAQ);