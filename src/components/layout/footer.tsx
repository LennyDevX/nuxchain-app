import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900/50 to-black border-t border-gray-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/assets/unused/favicon1.png" alt="Nuxchain" className="w-10 h-10" />
              <h3 className="jersey-15-regular text-4xl font-bold text-gradient">
                Nuxchain
              </h3>
            </div>
            <p className="jersey-20-regular text-gray-400 text-base leading-relaxed">
              The leading Web3 platform for innovation and reliability.
              Discover cutting-edge DeFi microservices, smart contracts, and AI integration.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="jersey-20-regular px-2 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                Public Beta v4.1
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="jersey-15-regular text-2xl font-semibold text-white">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/staking" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Staking</Link></li>
              <li><Link to="/nfts" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">NFTs</Link></li>
              <li><Link to="/#" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Marketplace</Link></li>
              <li><Link to="/tokenization" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Tokenization</Link></li>
              <li><Link to="/airdrop" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Airdrops</Link></li>
              <li><Link to="/roadmap" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="jersey-15-regular text-2xl font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/#" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Blog</Link></li>
              <li><Link to="/#" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Dev Hub</Link>
                <span className="jersey-20-regular px-2 py-0.5  m-2 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">Coming Soon</span>
              </li>
              <li><Link to="#" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Labs</Link>
                <span className="jersey-20-regular px-2 py-0.5  m-2 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">Coming Soon</span>
              </li>
              <li><Link to="/whitepaper" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Whitepaper</Link></li>
            </ul>
          </div>

          {/* AI & Tools */}
          <div className="space-y-4">
            <h4 className="jersey-15-regular text-2xl font-semibold text-white">AI & Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/chat" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Nuxbee AI</Link>
              </li>
              <li>
                <Link to="/skills" className="jersey-20-regular text-gray-400 hover:text-purple-400 transition-colors text-base">Skill NFTs</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="jersey-20-regular text-gray-400 text-base">Market Analysis</span>
                <span className="jersey-20-regular px-2 py-0.5 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">Coming Soon</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="jersey-20-regular text-gray-400 text-base">Smart Recommendations</span>
                <span className="jersey-20-regular px-2 py-0.5  bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">Coming Soon</span>
              </li>
            </ul>
          </div>

          {/* Social & Community */}
          <div className="space-y-4">
            <h4 className="jersey-15-regular text-2xl font-semibold text-white">Community</h4>
            <div className="flex space-x-4">
              {/* X (Twitter) */}
              <a
                href="https://x.com/nuxchain"
                target="_blank"
                rel="noopener noreferrer"
                className="card-interactive group p-3 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/+ESghwuU2rCpiNmI5"
                target="_blank"
                rel="noopener noreferrer"
                className="card-interactive group p-3 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="jersey-20-regular flex items-center space-x-4 text-base text-gray-500">
              <span> 2026 Nuxchain. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <a href="#privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              <span className="hidden md:inline">•</span>
              <a href="#terms" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            </div>

           
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </footer>
  );
};

export default Footer;