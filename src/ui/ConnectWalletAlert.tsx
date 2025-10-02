import React from 'react';
import GlobalBackground from './gradientBackground';

interface ConnectWalletProps {
  pageName: 'NFTs' | 'Staking' | 'Marketplace';
  showBackground?: boolean;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ 
  pageName, 
  showBackground = true 
}) => {
  const pageConfig = {
    NFTs: {
      title: 'My NFTs',
      subtitle: 'Connect your wallet to view your NFTs',
      description: 'Manage your collection of unique NFTs created on our platform',
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    Staking: {
      title: 'Staking Dashboard',
      subtitle: 'Connect your wallet to access staking',
      description: 'Earn automatic rewards by staking your POL tokens',
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    Marketplace: {
      title: 'NFT Marketplace',
      subtitle: 'Connect your wallet to buy NFTs',
      description: 'Discover, buy, and sell unique digital assets on our decentralized marketplace',
      icon: (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    }
  };

  const config = pageConfig[pageName];

  const content = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-6">
          {config.icon}
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          {config.title}
        </h1>
        
        {/* Description */}
        <p className="text-xl text-white/80 mb-8">
          {config.description}
        </p>
        
        {/* Connect Card */}
        <div className="card-unified p-8">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          
          <p className="text-white/60">
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  if (showBackground) {
    return (
      <GlobalBackground>
        {content}
      </GlobalBackground>
    );
  }

  return content;
};

export default ConnectWallet;