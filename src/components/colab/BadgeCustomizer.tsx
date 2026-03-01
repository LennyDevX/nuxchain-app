import { useState } from 'react';
import type { BadgeRole } from './CategorySelector';

interface BadgeCustomizerProps {
  selectedRole: BadgeRole;
  onCustomize: (customization: BadgeCustomization) => void;
  onBack: () => void;
  onMint: () => void;
  isMinting: boolean;
}

export interface BadgeCustomization {
  displayName: string;
  bio: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  acceptTerms: boolean;
}

const RARITY_COLORS = {
  0: 'from-gray-500 to-gray-600',
  1: 'from-green-500 to-emerald-600',
  2: 'from-blue-500 to-cyan-600',
  3: 'from-purple-500 to-indigo-600',
  4: 'from-orange-500 to-amber-600'
};

const SKILL_NAMES = ['Coding', 'Design', 'Marketing', 'Trading', 'Community', 'Writing'];
const RARITY_NAMES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export default function BadgeCustomizer({
  selectedRole,
  onCustomize,
  onBack,
  onMint,
  isMinting
}: BadgeCustomizerProps) {
  const [customization, setCustomization] = useState<BadgeCustomization>({
    displayName: '',
    bio: '',
    socialLinks: {
      twitter: '',
      discord: '',
      telegram: ''
    },
    acceptTerms: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BadgeCustomization, string>>>({});

  const handleInputChange = (field: keyof BadgeCustomization, value: unknown) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialChange = (platform: keyof BadgeCustomization['socialLinks'], value: string) => {
    setCustomization(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BadgeCustomization, string>> = {};

    if (!customization.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (customization.displayName.length < 3) {
      newErrors.displayName = 'Display name must be at least 3 characters';
    }

    if (customization.bio && customization.bio.length > 200) {
      newErrors.bio = 'Bio must be less than 200 characters';
    }

    if (!customization.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMint = () => {
    if (validate()) {
      onCustomize(customization);
      onMint();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 jersey-15-regular text-gray-400 hover:text-white transition-colors uppercase text-sm tracking-wide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Selection
        </button>
        <div className="text-right">
          <span className="text-gray-500 text-sm">Step 2 of 2</span>
          <div className="w-32 h-1 bg-gray-800 rounded-full mt-1">
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <h2 className="jersey-15-regular text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
          Customize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Badge</span>
        </h2>
        <p className="jersey-20-regular text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
          Personalize your collaborator badge with your identity and social links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badge Preview */}
        <div className="space-y-6">
          <h3 className="jersey-15-regular font-black text-white uppercase tracking-wide text-lg">Badge Preview</h3>
          
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r ${RARITY_COLORS[selectedRole.rarity as keyof typeof RARITY_COLORS]} rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500`} />
            
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden">
              {/* Badge Header */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${RARITY_COLORS[selectedRole.rarity as keyof typeof RARITY_COLORS]}`} />
              
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Badge Image - Large Circular */}
                <div className="relative">
                  {/* Glow effect */}
                  <div 
                    className={`absolute inset-0 rounded-full blur-2xl opacity-40`}
                    style={{ background: `linear-gradient(135deg, ${selectedRole.rarity === 1 ? '#f59e0b' : selectedRole.rarity === 2 ? '#ec4899' : selectedRole.rarity === 3 ? '#8b5cf6' : '#10b981'}, transparent)` }}
                  />
                  
                  {/* Main circular avatar container */}
                  <div className={`
                    relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden
                    border-4 border-white/20
                    transition-all duration-300
                    shadow-2xl
                  `}
                  style={{ 
                    borderColor: selectedRole.rarity === 1 ? '#f59e0b50' : selectedRole.rarity === 2 ? '#ec489950' : selectedRole.rarity === 3 ? '#8b5cf650' : '#10b98150',
                    boxShadow: `0 0 60px ${selectedRole.rarity === 1 ? '#f59e0b30' : selectedRole.rarity === 2 ? '#ec489930' : selectedRole.rarity === 3 ? '#8b5cf630' : '#10b98130'}`
                  }}
                  >
                    {/* Avatar Image */}
                    <img 
                      src={selectedRole.image} 
                      alt={selectedRole.role}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Rarity Badge - floating */}
                  <div 
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg whitespace-nowrap`}
                    style={{ 
                      background: selectedRole.rarity === 1 ? '#f59e0b' : selectedRole.rarity === 2 ? '#ec4899' : selectedRole.rarity === 3 ? '#8b5cf6' : '#10b981',
                      color: '#fff',
                      border: `2px solid rgba(0,0,0,0.5)`
                    }}
                  >
                    {selectedRole.rarityName || RARITY_NAMES[selectedRole.rarity]}
                  </div>
                </div>

                {/* Badge Info */}
                <div className="space-y-2">
                  <h4 className="jersey-15-regular text-2xl text-white uppercase tracking-tighter">
                    {customization.displayName || selectedRole.role}
                  </h4>
                  <p className="jersey-20-regular text-purple-400 text-sm uppercase tracking-wide">
                    {selectedRole.role}
                  </p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="jersey-15-regular px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs uppercase">
                    {SKILL_NAMES[selectedRole.skillType]}
                  </span>
                  <span className={`jersey-15-regular px-3 py-1 rounded-full text-xs uppercase bg-gradient-to-r ${RARITY_COLORS[selectedRole.rarity as keyof typeof RARITY_COLORS]} text-white`}>
                    Level 1
                  </span>
                </div>

                {/* Bio Preview */}
                {customization.bio && (
                  <p className="jersey-20-regular text-gray-400 text-sm max-w-xs">
                    "{customization.bio}"
                  </p>
                )}

                {/* Social Links Preview */}
                {(customization.socialLinks.twitter || customization.socialLinks.discord || customization.socialLinks.telegram) && (
                  <div className="flex items-center gap-3">
                    {customization.socialLinks.twitter && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                    )}
                    {customization.socialLinks.discord && (
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      </div>
                    )}
                    {customization.socialLinks.telegram && (
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customization Form */}
        <div className="space-y-6">
          <h3 className="jersey-15-regular font-black text-white uppercase tracking-wide text-lg">Identity Details</h3>
          
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="jersey-15-regular block text-gray-400 text-sm uppercase tracking-wide mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customization.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your display name"
                className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                  errors.displayName 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
              {errors.displayName && (
                <p className="mt-1 text-red-400 text-xs">{errors.displayName}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="jersey-15-regular block text-gray-400 text-sm uppercase tracking-wide mb-2">
                Bio / Description
                <span className="jersey-20-regular text-gray-600 ml-2">
                  ({customization.bio.length}/200)
                </span>
              </label>
              <textarea
                value={customization.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself and your contribution to NuxChain..."
                rows={4}
                maxLength={200}
                className={`w-full px-4 py-3 bg-[#1a1a1a] border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.bio 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
              {errors.bio && (
                <p className="mt-1 text-red-400 text-xs">{errors.bio}</p>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <label className="jersey-15-regular block text-gray-400 text-sm uppercase tracking-wide">
                Social Links <span className="jersey-20-regular text-gray-600">(Optional)</span>
              </label>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={customization.socialLinks.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="@username or twitter.com/username"
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={customization.socialLinks.discord}
                  onChange={(e) => handleSocialChange('discord', e.target.value)}
                  placeholder="username#0000 or discord.gg/invite"
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={customization.socialLinks.telegram}
                  onChange={(e) => handleSocialChange('telegram', e.target.value)}
                  placeholder="@username or t.me/username"
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            {/* Terms */}
            <div className={`p-4 rounded-xl border ${errors.acceptTerms ? 'border-red-500 bg-red-500/5' : 'border-white/10 bg-[#1a1a1a]/50'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customization.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500/20 mt-0.5"
                />
                <span className="jersey-20-regular text-gray-400 text-sm leading-relaxed">
                  I understand that this badge NFT represents my role as a NuxChain collaborator and agree to the 
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a> and 
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline">Collaborator Agreement</a>.
                </span>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-400 text-xs">{errors.acceptTerms}</p>
            )}

            {/* Mint Button */}
            <button
              onClick={handleMint}
              disabled={isMinting}
              className="jersey-20-regular w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-90 text-white text-lg uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-[0.98]"
            >
              {isMinting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Minting Badge...
                </span>
              ) : (
                `Mint ${selectedRole.role} Badge`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
