export default function Benefits() {
  const benefits = [
    {
      icon: '🎨',
      title: 'Own Your Art',
      description: 'True digital ownership with blockchain verification',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '💰',
      title: 'Earn Royalties',
      description: 'Get paid every time your NFT is resold',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🌍',
      title: 'Global Marketplace',
      description: 'Reach collectors worldwide instantly',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🔒',
      title: 'Secure & Permanent',
      description: 'Stored on IPFS and Polygon blockchain forever',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '⚡',
      title: 'Low Fees',
      description: 'Mint on Polygon for minimal gas costs',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '🚀',
      title: 'Instant Listing',
      description: 'List for sale immediately after creation',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { label: 'NFTs Created', value: '10,000+', icon: '🎯' },
    { label: 'Total Volume', value: '$2.5M+', icon: '💎' },
    { label: 'Active Creators', value: '5,000+', icon: '👨‍🎨' },
    { label: 'Avg. Sale Time', value: '2.3 days', icon: '⏱️' }
  ];

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

      {/* Platform Stats */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          📊 Platform Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="text-lg mb-1">
                {stat.icon}
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-white/60 text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          🏆 Creator Success Stories
        </h2>
        
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">🎨</div>
              <span className="text-white font-medium text-sm">Digital Artist</span>
              <span className="text-green-400 text-xs">+$15,000 earned</span>
            </div>
            <p className="text-white/60 text-xs">
              "Sold my first NFT collection in 3 days. The royalty system keeps paying me as my art appreciates!"
            </p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">📸</div>
              <span className="text-white font-medium text-sm">Photographer</span>
              <span className="text-green-400 text-xs">+$8,500 earned</span>
            </div>
            <p className="text-white/60 text-xs">
              "Finally found a way to monetize my photography. Each sale brings in royalties for years!"
            </p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">🎵</div>
              <span className="text-white font-medium text-sm">Music Producer</span>
              <span className="text-green-400 text-xs">+$22,000 earned</span>
            </div>
            <p className="text-white/60 text-xs">
              "My beats are now collectible NFTs. Fans love owning exclusive music content!"
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started Tips */}
      <div className="card-unified">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          💡 Pro Tips for Success
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">High-Quality Images</h4>
                <p className="text-white/60 text-xs">Use high-resolution images (at least 1000x1000px) for better presentation</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Compelling Descriptions</h4>
                <p className="text-white/60 text-xs">Tell the story behind your art to connect with collectors</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Smart Pricing</h4>
                <p className="text-white/60 text-xs">Research similar NFTs and price competitively for your first sales</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">4</div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Use Attributes</h4>
                <p className="text-white/60 text-xs">Add meaningful attributes to make your NFT more discoverable</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">5</div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Set Royalties</h4>
                <p className="text-white/60 text-xs">2.5-10% royalties ensure you earn from future sales</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">6</div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">Promote Your Work</h4>
                <p className="text-white/60 text-xs">Share on social media to reach more potential collectors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}