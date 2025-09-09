export default function TokenizationInfo() {
  return (
    <div className="space-y-6">
      {/* What to Expect */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          🚀 What to Expect During NFT Creation
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
            <div>
              <h3 className="text-white font-medium text-sm mb-1">📤 Upload to IPFS</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Your image and metadata will be uploaded to IPFS (InterPlanetary File System), 
                ensuring permanent, decentralized storage that can't be censored or taken down.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
            <div>
              <h3 className="text-white font-medium text-sm mb-1">⚡ Mint on Polygon</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Your NFT will be minted on the Polygon blockchain, providing fast transactions 
                and low fees while maintaining Ethereum compatibility.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
            <div>
              <h3 className="text-white font-medium text-sm mb-1">⏳ Wallet Display Delay</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Your wallet might initially show "Unknown" for the NFT image for 2-5 minutes 
                due to metadata propagation. This is completely normal!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
            <div>
              <h3 className="text-white font-medium text-sm mb-1">✅ Immediate Availability</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Your NFT will be immediately viewable in our app's NFTs section, 
                where you can manage, list for sale, or transfer it.
              </p>
            </div>
          </div>
        </div>
      </div>

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

      {/* Security Notice */}
      <div className="card-unified">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-sm">⚠️</div>
          <div>
            <h3 className="text-white font-medium text-sm mb-2">Important Security Notice</h3>
            <ul className="text-white/60 text-xs space-y-1 list-disc list-inside">
              <li>Never share your private keys or seed phrase with anyone</li>
              <li>Always verify contract addresses before signing transactions</li>
              <li>Be cautious of phishing websites and fake marketplaces</li>
              <li>Keep your wallet software updated for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}