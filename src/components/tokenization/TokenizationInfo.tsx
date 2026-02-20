export default function TokenizationInfo() {
  return (
    <div className="space-y-6">
      

      {/* Technical Details */}
      <div className="card-unified">
        <h2 className="jersey-15-regular text-2xl md:text-3xl font-bold text-white mb-4 text-center">
          🔧 Technical Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className="card-unified p-3">
              <h3 className="jersey-15-regular text-white font-medium text-base md:text-lg mb-1 flex items-center gap-2">
                <span>🌐</span> IPFS Storage
              </h3>
              <p className="jersey-20-regular text-white/60 text-sm">
                Decentralized storage ensures your NFT data is permanent and accessible worldwide, 
                even if our platform goes offline.
              </p>
            </div>
            
            <div className="card-unified p-3">
              <h3 className="jersey-15-regular text-white font-medium text-base md:text-lg mb-1 flex items-center gap-2">
                <span>⚡</span> Polygon Network
              </h3>
              <p className="jersey-20-regular text-white/60 text-sm">
                Low-cost, fast transactions with full Ethereum compatibility. 
                Your NFTs can be traded on any Polygon-compatible marketplace.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="card-unified p-3">
              <h3 className="jersey-15-regular text-white font-medium text-base md:text-lg mb-1 flex items-center gap-2">
                <span>💰</span> Smart Royalties
              </h3>
              <p className="jersey-20-regular text-white/60 text-sm">
                Royalties are built into the smart contract, ensuring you automatically 
                receive payments on every future sale.
              </p>
            </div>
            
            <div className="card-unified p-3">
              <h3 className="jersey-15-regular text-white font-medium text-base md:text-lg mb-1 flex items-center gap-2">
                <span>🔒</span> True Ownership
              </h3>
              <p className="jersey-20-regular text-white/60 text-sm">
                You maintain full ownership and control. Transfer, sell, or hold your NFTs 
                across any compatible platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card-unified">
        <h2 className="jersey-15-regular text-2xl md:text-3xl font-bold text-white mb-4 text-center">
          ❓ Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="jersey-20-regular text-white font-medium text-base">Why does my wallet show "Unknown" initially?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 jersey-20-regular text-white/60 text-sm">
              This is normal! Wallets need time to fetch and cache the metadata from IPFS. 
              The NFT is safely stored on the blockchain, and the image will appear within 2-5 minutes.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="jersey-20-regular text-white font-medium text-base">Can I edit my NFT after creation?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 jersey-20-regular text-white/60 text-sm">
              No, NFTs are immutable once created. This ensures authenticity and prevents fraud. 
              Make sure all details are correct before minting.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="jersey-20-regular text-white font-medium text-base">What happens if IPFS goes down?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 jersey-20-regular text-white/60 text-sm">
              IPFS is decentralized with thousands of nodes worldwide. Your content is replicated 
              across multiple nodes, making it extremely resilient to outages.
            </div>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between p-3 card-unified cursor-pointer hover:bg-white/10 transition-colors">
              <span className="jersey-20-regular text-white font-medium text-base">How do royalties work?</span>
              <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-3 jersey-20-regular text-white/60 text-sm">
              Royalties are automatically paid to you every time your NFT is resold. 
              The percentage you set (0-10%) is enforced by the smart contract.
            </div>
          </details>
        </div>
      </div>

      {/* Security Notice */}
      
    </div>
  );
}