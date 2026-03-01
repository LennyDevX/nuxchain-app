import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AVATAR_SLOTS, type AvatarSlot, getRarityColor, TOTAL_AVATAR_SLOTS } from '../../data/AvatarData';
import useAvatarAvailability from '../../hooks/colab/useAvatarAvailability';

// Inline icons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const WalletIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

interface AvatarGalleryProps {
  onSelectAvatar: (avatar: AvatarSlot) => void;
  selectedAvatar?: AvatarSlot | null;
}

export default function AvatarGallery({ onSelectAvatar, selectedAvatar }: AvatarGalleryProps) {
  const { isConnected } = useAccount();
  const { availability, availableCount, mintedCount, isLoading, refresh } = useAvatarAvailability();
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null);

  const getAvatarStatus = (tokenId: number) => {
    return availability.find(a => a.tokenId === tokenId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="jersey-15-regular text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Avatar</span>
        </h2>
        <p className="jersey-20-regular text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
          12 exclusive collaborator slots. Each avatar is unique and can only be minted once. 
          Select an available avatar to join the NuxChain ecosystem.
        </p>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <UsersIcon className="w-4 h-4 text-purple-400" />
            <span className="jersey-15-regular text-gray-400 text-sm">Total Slots:</span>
            <span className="jersey-20-regular text-white">{TOTAL_AVATAR_SLOTS}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
            <CheckIcon className="w-4 h-4 text-green-400" />
            <span className="jersey-15-regular text-gray-400 text-sm">Available:</span>
            <span className="jersey-20-regular text-green-400">{availableCount}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 rounded-xl border border-gray-500/20">
            <LockIcon className="w-4 h-4 text-gray-400" />
            <span className="jersey-15-regular text-gray-400 text-sm">Minted:</span>
            <span className="jersey-20-regular text-gray-400">{mintedCount}</span>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="jersey-20-regular px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-purple-400 text-sm uppercase tracking-wide transition-all disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Wallet Warning */}
      {!isConnected && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center gap-3">
          <WalletIcon className="w-5 h-5 text-amber-400" />
          <span className="jersey-20-regular text-amber-400 text-sm">
            Connect your wallet to check avatar availability and mint
          </span>
        </div>
      )}

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {AVATAR_SLOTS.map((avatar) => {
          const status = getAvatarStatus(avatar.id);
          const isMinted = status?.isMinted || false;
          const isSelected = selectedAvatar?.id === avatar.id;
          const isHovered = hoveredAvatar === avatar.id;
          const rarityColor = getRarityColor(avatar.rarity);

          return (
            <div
              key={avatar.id}
              onClick={() => !isMinted && onSelectAvatar(avatar)}
              onMouseEnter={() => setHoveredAvatar(avatar.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
              className={`
                relative group flex flex-col items-center transition-all duration-300
                ${isMinted 
                  ? 'opacity-60 cursor-not-allowed grayscale' 
                  : 'cursor-pointer hover:scale-[1.05]'
                }
              `}
            >
              {/* Circular Avatar Container */}
              <div className="relative">
                {/* Glow effect on hover/selected */}
                <div 
                  className={`
                    absolute inset-0 rounded-full blur-xl transition-all duration-300
                    ${isSelected ? 'opacity-100 scale-110' : isHovered && !isMinted ? 'opacity-70 scale-105' : 'opacity-0'}
                  `}
                  style={{ backgroundColor: rarityColor }}
                />
                
                {/* Main circular avatar */}
                <div className={`
                  relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden
                  border-4 ${isMinted ? 'border-gray-700' : 'border-white/20'}
                  transition-all duration-300
                  ${isSelected ? 'ring-4 ring-green-500 scale-105' : ''}
                  ${isHovered && !isMinted ? `ring-4` : ''}
                `}
                style={{ 
                  borderColor: isSelected ? '#22c55e' : isHovered && !isMinted ? rarityColor : isMinted ? undefined : 'rgba(255,255,255,0.2)',
                  boxShadow: isHovered && !isMinted ? `0 0 30px ${rarityColor}60` : '0 4px 20px rgba(0,0,0,0.4)'
                }}
                >
                  {/* Avatar Image */}
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay for minted */}
                  {isMinted && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                      <LockIcon className="w-10 h-10 text-gray-500 mb-1" />
                      <span className="jersey-15-regular text-gray-400 uppercase text-[10px] tracking-wider">
                        Minted
                      </span>
                    </div>
                  )}

                  {/* Selected Overlay */}
                  {isSelected && !isMinted && (
                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <CheckIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Slot Number Badge - positioned on the circle edge */}
                  <div 
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full border border-white/20"
                  >
                    <span className="jersey-20-regular text-white text-xs">#{avatar.id}</span>
                  </div>
                </div>

                {/* Rarity Badge - floating */}
                <div 
                  className="jersey-15-regular absolute -top-2 -right-2 px-2 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-lg"
                  style={{ 
                    backgroundColor: `${rarityColor}`,
                    color: '#000',
                    border: `2px solid rgba(0,0,0,0.5)`
                  }}
                >
                  {avatar.rarityName}
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-4 text-center">
                <h3 className={`jersey-15-regular text-sm md:text-base uppercase tracking-wide mb-1 transition-colors ${
                  isSelected ? 'text-green-400' : 'text-white'
                }`}>
                  {avatar.name}
                </h3>
                <p className="jersey-20-regular text-gray-500 text-xs md:text-sm mb-2">{avatar.role}</p>
                {isMinted ? (
                  <span className="jersey-15-regular inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-full text-gray-500 text-[10px] uppercase">
                    <LockIcon className="w-3 h-3" />
                    Unavailable
                  </span>
                ) : isSelected ? (
                  <span className="jersey-15-regular inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-[10px] uppercase">
                    <CheckIcon className="w-3 h-3" />
                    Selected
                  </span>
                ) : (
                  <span 
                    className="jersey-15-regular inline-block px-3 py-1 rounded-full text-[10px] uppercase transition-all"
                    style={{ 
                      backgroundColor: `${rarityColor}20`,
                      color: rarityColor,
                      border: `1px solid ${rarityColor}40`
                    }}
                  >
                    Available
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="jersey-20-regular text-gray-400">Legendary (Slots 1-3)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
          <span className="jersey-20-regular text-gray-400">Epic (Slots 4-6)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          <span className="jersey-20-regular text-gray-400">Rare (Slots 7-9)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="jersey-20-regular text-gray-400">Uncommon (Slots 10-12)</span>
        </div>
      </div>
    </div>
  );
}
