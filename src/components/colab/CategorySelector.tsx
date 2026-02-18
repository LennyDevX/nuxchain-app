import { useState } from 'react';
import { AVATAR_SLOTS, type AvatarSlot, getRarityColor } from '../../data/AvatarData';
import useAvatarAvailability from '../../hooks/colab/useAvatarAvailability';
import RewardInfo from './RewardInfo';

// Inline SVG icons
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MegaphoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export interface BadgeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  gradient: string;
}

export type BadgeRole = AvatarSlot;

const CATEGORIES: BadgeCategory[] = [
  {
    id: 'community',
    name: 'Community',
    icon: <UsersIcon className="w-6 h-6" />,
    description: 'Build and nurture the NuxChain community through moderation, support, and engagement.',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'content',
    name: 'Content Creation',
    icon: <MegaphoneIcon className="w-6 h-6" />,
    description: 'Create compelling content, drive social engagement, and spread awareness.',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'technical',
    name: 'Technical Development',
    icon: <CodeIcon className="w-6 h-6" />,
    description: 'Contribute to technical development, testing, and security research.',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'business',
    name: 'Business Partnership',
    icon: <BriefcaseIcon className="w-6 h-6" />,
    description: 'Strategic partnerships, investments, and business development.',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600'
  }
];

const ROLES: AvatarSlot[] = AVATAR_SLOTS;

interface CategorySelectorProps {
  onSelectRole: (role: AvatarSlot) => void;
  selectedRole?: AvatarSlot | null;
  onContinue?: () => void;
}

export default function CategorySelector({ onSelectRole, selectedRole, onContinue }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { availability, availableCount, mintedCount } = useAvatarAvailability();

  const filteredRoles = selectedCategory 
    ? ROLES.filter(role => role.categoryId === selectedCategory)
    : [];

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

  const getAvatarStatus = (id: number) => availability.find(a => a.tokenId === id);

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Avatar</span>
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
          Select from 12 exclusive collaborator slots. Each avatar grants access to specific quest types.
          Complete quests to earn POL rewards, claimable with tiered fees (2% → 1% based on volume).
        </p>
        
        {/* Availability Stats */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-400">Available: <span className="text-green-400 font-bold">{availableCount}</span></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Minted: <span className="text-gray-400 font-bold">{mintedCount}</span></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Total: <span className="text-white font-bold">12</span></span>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedCategory === category.id
                ? 'bg-opacity-10'
                : 'border-white/10 bg-[#1a1a1a]/60 hover:border-white/30 hover:bg-[#1a1a1a]/80'
            }`}
            style={{ borderColor: selectedCategory === category.id ? category.color : undefined }}
          >
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                selectedCategory === category.id 
                  ? 'bg-white/20' 
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}
              style={{ color: category.color }}
            >
              {category.icon}
            </div>
            
            <h3 className={`font-black text-lg mb-2 uppercase tracking-wide transition-colors ${
              selectedCategory === category.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
            }`}>
              {category.name}
            </h3>
            
            <p className={`text-sm leading-relaxed transition-colors ${
              selectedCategory === category.id ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-400'
            }`}>
              {category.description}
            </p>

            {selectedCategory === category.id ? (
              <div className="absolute top-4 right-4">
                <CheckIcon className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full border border-white/20 bg-white/5 group-hover:border-white/40 group-hover:bg-white/10 flex items-center justify-center transition-all">
                <PlusIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Role Selection */}
      {selectedCategory && selectedCategoryData && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 text-white">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${selectedCategoryData.color}20`, color: selectedCategoryData.color }}
            >
              {selectedCategoryData.icon}
            </div>
            <div>
              <h3 className="font-black text-xl uppercase tracking-wide">{selectedCategoryData.name} Avatars</h3>
              <p className="text-gray-400 text-sm">Select an available avatar slot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => {
              const status = getAvatarStatus(role.id);
              const isMinted = status?.isMinted || false;
              const rarityColor = getRarityColor(role.rarity);

              return (
                <button
                  key={role.id}
                  onClick={() => !isMinted && onSelectRole(role)}
                  disabled={isMinted}
                  className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                    isMinted
                      ? 'border-gray-700 bg-gray-900/50 cursor-not-allowed opacity-60'
                      : selectedRole?.id === role.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-[#1a1a1a]/60 hover:border-purple-500/50 hover:bg-[#1a1a1a]/80'
                  }`}
                >
                  {isMinted && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gray-700 rounded-lg flex items-center gap-1">
                      <LockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400 text-[10px] font-bold uppercase">Minted</span>
                    </div>
                  )}

                  {!isMinted && selectedRole?.id === role.id && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-1">
                      <CheckIcon className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 text-[10px] font-bold uppercase">Selected</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    {/* Circular Avatar */}
                    <div 
                      className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2"
                      style={{ 
                        borderColor: isMinted ? '#374151' : rarityColor,
                        boxShadow: !isMinted ? `0 0 15px ${rarityColor}40` : 'none'
                      }}
                    >
                      <img 
                        src={role.image} 
                        alt={role.name}
                        className={`w-full h-full object-cover ${isMinted ? 'grayscale' : ''}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Slot #{role.id}</span>
                      <h4 className="font-black text-white uppercase tracking-wide text-sm mb-1 truncate">
                        {role.name}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ 
                            backgroundColor: `${rarityColor}20`,
                            color: rarityColor,
                            border: `1px solid ${rarityColor}40`
                          }}
                        >
                          {role.rarityName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {role.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {role.benefits.length} benefits
                    </div>
                    {!isMinted && (
                      <div className={`flex items-center gap-1 text-sm font-bold transition-all ${
                        selectedRole?.id === role.id 
                          ? 'text-purple-400' 
                          : 'text-gray-500 group-hover:text-purple-400'
                      }`}>
                        {selectedRole?.id === role.id ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Selected
                          </>
                        ) : (
                          <>
                            Select
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Role Details */}
      {selectedRole && (
        <div className="space-y-6">
          {/* Avatar Details Card */}
          <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Large Circular Avatar */}
              <div className="relative flex-shrink-0 mx-auto md:mx-0">
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-30"
                  style={{ backgroundColor: getRarityColor(selectedRole.rarity) }}
                />
                <div 
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4"
                  style={{ 
                    borderColor: `${getRarityColor(selectedRole.rarity)}60`,
                    boxShadow: `0 0 40px ${getRarityColor(selectedRole.rarity)}30`
                  }}
                >
                  <img 
                    src={selectedRole.image} 
                    alt={selectedRole.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Slot badge on image */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="text-white font-black text-xs">#{selectedRole.id}</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-sm font-bold uppercase">Slot #{selectedRole.id}</span>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{ 
                        backgroundColor: `${getRarityColor(selectedRole.rarity)}20`,
                        color: getRarityColor(selectedRole.rarity),
                        border: `1px solid ${getRarityColor(selectedRole.rarity)}40`
                      }}
                    >
                      {selectedRole.rarityName}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                    {selectedRole.name}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {selectedRole.description}
                  </p>
                </div>
                
                {/* Quest Access Info */}
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400 text-xs font-bold uppercase">Quest Access</span>
                  <p className="text-purple-400 text-sm font-medium">{selectedRole.questAccess}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {selectedRole.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-400 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-2">Benefits</h4>
                    <ul className="space-y-1">
                      {selectedRole.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-400 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Reward Info from Contract */}
          <RewardInfo />
        </div>
      )}
    </div>
  );
}

export { CATEGORIES, ROLES };

