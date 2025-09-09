import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900/50 to-black border-t border-gray-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/Nuxchain-logo.jpg" alt="Nuxchain" className="w-10 h-10" />
              <h3 className="text-2xl font-bold text-gradient">
                Nuxchain
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The leading Web3 platform for innovation and reliability. 
              Discover cutting-edge DeFi microservices, smart contracts, and AI integration.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                Beta v6.0
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#staking" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Staking</a></li>
              <li><a href="#nfts" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">NFTs</a></li>
              <li><a href="#marketplace" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Marketplace</a></li>
              <li><a href="#tokenization" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Tokenization</a></li>
              <li><a href="#airdrops" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Airdrops</a></li>
            </ul>
          </div>

          {/* AI & Tools */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">AI & Tools</h4>
            <ul className="space-y-2">
              <li><a href="#chat" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Nuxchain AI</a></li>
              <li><a href="#analytics" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Market Analysis</a></li>
              <li><a href="#recommendations" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Smart Recommendations</a></li>
              <li><a href="#portfolio" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Portfolio Tracker</a></li>
            </ul>
          </div>

          {/* Social & Community */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Community</h4>
            <div className="flex space-x-4">
              {/* X (Twitter) */}
              <a 
                href="https://x.com/nuxchain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-3 bg-gray-800/50 hover:bg-blue-500/20 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Telegram */}
              <a 
                href="https://t.me/nuvoNFT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-3 bg-gray-800/50 hover:bg-blue-400/20 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              
              {/* Discord */}
              <a 
                href="https://discord.gg/nuxchain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group p-3 bg-gray-800/50 hover:bg-indigo-500/20 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Join our community</p>
              <div className="flex flex-col space-y-1 text-xs text-gray-400">
                <span>📧 support@nuxchain.com</span>
                <span>🌐 www.nuxchain.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>© 2025 Nuxchain. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <a href="#privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              <span className="hidden md:inline">•</span>
              <a href="#terms" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Powered by</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                <span className="font-semibold">Blockchain Technology</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </footer>
  );
};

export default Footer;