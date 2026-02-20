import React, { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useSkillNFTs } from '../../hooks/staking/useSkillNFTs';
import { SKILL_TYPE_NAMES, type SkillType } from '../../types/contracts';

const ProfileSidebar: React.FC = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { activeSkills, isLoading: isLoadingSkills } = useSkillNFTs();
  const [username, setUsername] = useState('User');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const isMobile = useIsMobile();
  
  // Carousel state
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize username from localStorage only once
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded && address) {
      const savedUsername = localStorage.getItem(`username_${address}`);
      if (savedUsername) {
        setUsername(savedUsername);
      }
      setIsLoaded(true);
    }
  }, [address, isLoaded]);

  const handleSaveUsername = () => {
    if (tempUsername.trim() && address) {
      const newName = tempUsername.trim();
      setUsername(newName);
      localStorage.setItem(`username_${address}`, newName);
      setIsEditingName(false);
      setTempUsername('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setTempUsername('');
  };

  const handleStartEdit = () => {
    setTempUsername(username);
    setIsEditingName(true);
  };

  const items = [
    { key: 'overview', label: 'Overview', to: '/profile', icon: '📊' },
    { key: 'nfts', label: 'NFTs', to: '/profile/nfts', icon: '🖼️' },
    { key: 'staking', label: 'Staking', to: '/profile/staking', icon: '💰' },
    { key: 'rewards', label: 'Rewards', to: '/profile/rewards', icon: '💎' },
    { key: 'ai-analysis', label: 'AI', to: '/profile/ai-analysis', icon: '🤖' }
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle carousel scroll with passive listener
  const handleCarouselScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth;
    
    // Calculate which tab is in view
    const newActiveTab = Math.round(scrollLeft / itemWidth);
    setActiveTab(newActiveTab);
  }, []);

  // Snap carousel to clicked indicator
  const scrollToTab = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const itemWidth = container.offsetWidth;
    
    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
    setActiveTab(index);
  }, []);

  if (isMobile) {
    return (
      <div className="card-unified p-4">
        {/* Mobile Header: Avatar + Username */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-12 h-12 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 animate-pulse opacity-75"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white jersey-15-regular font-bold text-xl shadow-xl">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveUsername();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="w-full bg-white/10 border border-purple-500/50 rounded-lg px-3 py-1.5 text-white jersey-20-regular text-lg focus:outline-none focus:border-purple-400"
                  placeholder="Enter username"
                  maxLength={20}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-lg jersey-20-regular text-sm font-medium hover:from-green-500 hover:to-emerald-500 transition-all"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-white/10 text-gray-300 px-3 py-1 rounded-lg jersey-20-regular text-sm font-medium hover:bg-white/20 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="jersey-15-regular text-white font-bold text-xl truncate">{username}</h4>
                  <button
                    onClick={handleStartEdit}
                    className="flex-shrink-0 opacity-60 hover:opacity-100 active:opacity-100 transition-opacity p-1"
                  >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <p className="jersey-20-regular text-sm text-gray-400 font-mono truncate">
                  {isConnected && address ? formatAddress(address) : '@not_connected'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation: Optimized Carousel */}
        <div className="space-y-4">
          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleCarouselScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch' // Enable momentum scrolling on iOS
            }}
          >
            {items.map((it) => (
              <Link
                key={it.key}
                to={it.to}
                className="snap-start flex-shrink-0 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/50 active:scale-95"
              >
                <span className="text-2xl">{it.icon}</span>
                <div className="text-left">
                  <p className="jersey-15-regular text-white font-bold text-lg">{it.label}</p>
                  <p className="jersey-20-regular text-gray-400 text-sm">Tap to visit</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Progress Indicators - Smooth Animation */}
          <div className="flex justify-center items-center gap-2 py-2">
            {items.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => scrollToTab(index)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  activeTab === index
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-6 h-2 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-600 hover:bg-gray-500 w-2 h-2'
                }`}
                aria-label={`Go to ${items[index].label}`}
                aria-current={activeTab === index}
              />
            ))}
          </div>

          {/* Current Tab Label */}
          <div className="text-center">
            <p className="jersey-20-regular text-sm text-gray-400">
              {items[activeTab].label} <span className="text-gray-600">• {activeTab + 1}/{items.length}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout - Fixed height sidebar with scrollable content
  return (
    <aside className="card-unified h-screen overflow-hidden flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 mb-6 text-center pt-4">
        {/* Avatar with gradient border */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 animate-pulse opacity-75"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white jersey-15-regular font-bold text-4xl shadow-xl">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Username with edit functionality */}
        {isEditingName ? (
          <div className="space-y-2 px-4">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveUsername();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="w-full bg-white/10 border border-purple-500/50 rounded-lg px-3 py-2 text-white jersey-20-regular text-xl text-center focus:outline-none focus:border-purple-400"
              placeholder="Enter username"
              maxLength={20}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveUsername}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-lg jersey-20-regular text-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all"
              >
                ✓ Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg jersey-20-regular text-lg font-medium hover:bg-white/20 transition-all"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h4 className="jersey-15-regular text-white font-bold text-3xl">{username}</h4>
              <button
                onClick={handleStartEdit}
                className="opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                title="Edit username"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="jersey-20-regular text-base text-gray-400 font-mono bg-black/20 rounded-full px-3 py-1 inline-block">
              {isConnected && address ? formatAddress(address) : '@not_connected'}
            </p>
          </div>
        )}
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.map((it) => (
          <Link
            key={it.key}
            to={it.to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(it.to)
                ? 'bg-purple-600/20 text-white border border-purple-500/30'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-2xl">{it.icon}</span>
            <span className="jersey-15-regular font-medium text-xl">{it.label}</span>
          </Link>
        ))}

        {/* Active Skills NFTs Section */}
        {isConnected && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <h5 className="jersey-15-regular text-white/60 text-base font-semibold uppercase mb-3 px-2">
              🎯 Active Skills
            </h5>
            {isLoadingSkills ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : activeSkills && activeSkills.length > 0 ? (
              <div className="space-y-2">
                {activeSkills.map((skillType, index) => (
                  <div
                    key={`skill-${index}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
                  >
                    <span className="text-lg">
                      {skillType === 0n ? '⚡' :
                       skillType === 1n ? '🔒' :
                       skillType === 2n ? '🎯' :
                       skillType === 3n ? '💰' :
                       skillType === 4n ? '🛡️' :
                       skillType === 5n ? '⏱️' :
                       skillType === 6n ? '🎲' :
                       '🌟'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {SKILL_TYPE_NAMES[Number(skillType) as SkillType] || 'Unknown'}
                      </p>
                      <p className="text-white/40 text-xs">
                        Active
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 px-3">
                <p className="text-white/40 text-sm">No active skills</p>
                <Link
                  to="/staking"
                  className="text-purple-400 hover:text-purple-300 text-sm mt-1 inline-block"
                >
                  Stake to earn skills →
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
