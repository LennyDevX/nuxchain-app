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