import { useState } from 'react';
import { isMaintenanceMode } from '../config/maintenance';
import ColabMaintenance from './ColabMaintenance';
import { useAccount } from 'wagmi';
import AvatarGallery from '../components/colab/AvatarGallery';
import CategorySelector, { type BadgeRole } from '../components/colab/CategorySelector';
import BadgeCustomizer, { type BadgeCustomization } from '../components/colab/BadgeCustomizer';
import EnhancedRewardDashboard from '../components/colab/EnhancedRewardDashboard';
import { type AvatarSlot } from '../data/AvatarData';
import useMintNFT from '../hooks/nfts/useMintNFT';
import Footer from '../components/layout/footer';
import GlobalBackground from '../ui/gradientBackground';

type MintingStep = 'gallery' | 'selection' | 'customization' | 'success';

export default function ColabPortal() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'identification' | 'rewards'>('identification');
  const [mintingStep, setMintingStep] = useState<MintingStep>('gallery');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarSlot | null>(null);
  const [selectedRole, setSelectedRole] = useState<BadgeRole | null>(null);
  const [customization, setCustomization] = useState<BadgeCustomization | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const { mintNFT, loading: mintLoading, error: mintError } = useMintNFT();

  // Check maintenance mode after all hooks are called
  if (isMaintenanceMode('colab')) {
    return <ColabMaintenance />;
  }

  const handleAvatarSelect = (avatar: AvatarSlot) => {
    setSelectedAvatar(avatar);
    // Auto-fill role based on avatar selection
    const roleData = {
      id: String(avatar.id),
      role: avatar.role,
      image: avatar.image,
      description: avatar.description,
      skillType: avatar.skillType,
      rarity: avatar.rarity,
      categoryId: avatar.categoryId,
      requirements: avatar.requirements,
      benefits: avatar.benefits,
      name: avatar.name,
      rarityName: avatar.rarityName
    };
    setSelectedRole(roleData as unknown as BadgeRole);
  };

  const handleRoleSelect = (role: BadgeRole) => {
    setSelectedRole(role);
  };

  const handleCustomize = (custom: BadgeCustomization) => {
    setCustomization(custom);
  };

  const handleBackToGallery = () => {
    setMintingStep('gallery');
    setSelectedAvatar(null);
    setSelectedRole(null);
    setCustomization(null);
  };

  const handleBackToSelection = () => {
    setMintingStep('selection');
    setSelectedRole(null);
    setCustomization(null);
  };

  const handleStartOver = () => {
    setMintingStep('gallery');
    setSelectedAvatar(null);
    setSelectedRole(null);
    setCustomization(null);
    setMintSuccess(false);
    setTxHash(null);
  };

  const handleMint = async () => {
    if (!selectedAvatar || !selectedRole || !customization || !isConnected) return;

    setIsMinting(true);
    setMintSuccess(false);
    
    try {
      // Fetch the badge image
      const response = await fetch(selectedAvatar.image);
      const blob = await response.blob();
      const file = new File([blob], `Avatar${selectedAvatar.id}_badge.png`, { type: "image/png" });

      const result = await mintNFT({
        file,
        name: `NuxChain ${selectedAvatar.name} - ${customization.displayName}`,
        description: `${selectedAvatar.description}\n\nSlot #${selectedAvatar.id} of 12 | ${selectedAvatar.rarityName}\n\n${customization.bio || ''}`,
        category: "utility",
        royalty: 0,
        skills: [
          { skillType: selectedAvatar.skillType, rarity: selectedAvatar.rarity, level: 1 }
        ],
      });

      if (result && typeof result === 'string') {
        setTxHash(result);
        setMintSuccess(true);
        setMintingStep('success');
      }
    } catch (err) {
      console.error("Minting failed:", err);
    } finally {
      setIsMinting(false);
    }
  };


  const handleGoToRewards = () => {
    setActiveTab('rewards');
  };

  // Determine if we can proceed to next step
  const canProceedToSelection = selectedAvatar !== null;
  const canProceedToCustomization = selectedAvatar !== null && selectedRole !== null;

  // Progress indicator for minting flow
  const getStepNumber = () => {
    switch (mintingStep) {
      case 'gallery': return 1;
      case 'selection': return 2;
      case 'customization': return 3;
      case 'success': return 4;
      default: return 1;
    }
  };

  const getTotalSteps = () => 4;

    return (
        <GlobalBackground>
            <div className="min-h-screen text-white selection:bg-purple-500/30">
                {/* Hero Section */}
                <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10 text-center">
                        <h1 className="text-4xl md:text-7xl jersey-15-regular mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#ef4444] animate-gradient-text uppercase tracking-tighter">
                            Collaborator Portal
                        </h1>
                        <p className="jersey-20-regular text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
                            Welcome, Moderator. This is your dedicated space to manage your identity within NuxChain and claim your rewards.
                        </p>

                        {/* Minting Flow Steps Indicator */}
                {activeTab === 'identification' && (
                  <div className="max-w-md mx-auto mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="jersey-20-regular text-gray-400 text-xs uppercase tracking-wide">
                        Step {getStepNumber()} of {getTotalSteps()}
                      </span>
                      <span className="jersey-20-regular text-purple-400 text-xs uppercase tracking-wide">
                        {mintingStep === 'gallery' && 'Select Avatar'}
                        {mintingStep === 'selection' && 'Confirm Role'}
                        {mintingStep === 'customization' && 'Customize Badge'}
                        {mintingStep === 'success' && 'Complete'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-row justify-center gap-3 md:gap-4 mb-8 md:mb-12 w-full max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('identification')}
                        className={`flex-1 py-3 md:py-4 rounded-xl jersey-20-regular uppercase tracking-wider text-xs md:text-xl transition-all duration-300 ${activeTab === 'identification'
                            ? 'bg-gradient-to-r from-[#8b5cf6] to-[#5b21b6] text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] scale-105'
                            : 'bg-[#1a1a1a]/40 text-gray-400 border border-white/5 hover:border-purple-500/30'
                            }`}
                    >
                        {mintSuccess ? 'Badge Minted ✓' : 'Identification'}
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`flex-1 py-3 md:py-4 rounded-xl jersey-20-regular uppercase tracking-wider text-xs md:text-xl transition-all duration-300 ${activeTab === 'rewards'
                            ? 'bg-gradient-to-r from-[#8b5cf6] to-[#5b21b6] text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] scale-105'
                            : 'bg-[#1a1a1a]/40 text-gray-400 border border-white/5 hover:border-purple-500/30'
                            }`}
                    >
                        Rewards
                    </button>
                </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 pb-20 md:pb-32">
                    <div className="bg-[#0a0a0a]/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            {activeTab === 'identification' ? (
                                <>
                                    {mintingStep === 'gallery' && (
                                        <>
                                            <AvatarGallery 
                                                onSelectAvatar={handleAvatarSelect}
                                                selectedAvatar={selectedAvatar}
                                            />
                                            {canProceedToSelection && (
                                                <div className="mt-8 flex justify-center">
                                                    <button
                                                        onClick={() => setMintingStep('selection')}
                                                        className="px-12 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-90 text-white font-black text-lg jersey-20-regular uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(139,92,246,0.4)] transform hover:-translate-y-1 active:scale-[0.98]"
                                                    >
                                                        Continue to Role Selection →
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {mintingStep === 'selection' && selectedAvatar && (
                                        <>
                                            <div className="mb-6">
                                                <button
                                                    onClick={handleBackToGallery}
                                                    className="jersey-20-regular text-gray-400 hover:text-white text-sm uppercase tracking-wide flex items-center gap-2 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                        <path d="m12 19-7-7 7-7" />
                                                        <path d="M19 12H5" />
                                                    </svg>
                                                    Back to Gallery
                                                </button>
                                            </div>
                                            <CategorySelector 
                                                onSelectRole={handleRoleSelect}
                                                selectedRole={selectedRole}
                                            />
                                            <div className="mt-8 flex justify-center">
                                                <button
                                                    onClick={() => canProceedToCustomization && setMintingStep('customization')}
                                                    disabled={!canProceedToCustomization}
                                                    className={`px-12 py-4 jersey-20-regular text-lg uppercase tracking-[0.2em] rounded-2xl transition-all ${
                                                        canProceedToCustomization
                                                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-90 text-white shadow-[0_10px_30px_rgba(139,92,246,0.4)] transform hover:-translate-y-1 active:scale-[0.98] cursor-pointer'
                                                            : 'bg-white/5 border-2 border-dashed border-white/10 text-gray-600 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {canProceedToCustomization ? 'Continue to Customization →' : 'Select an Avatar to Continue'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    {mintingStep === 'customization' && selectedRole && (
                                        <BadgeCustomizer
                                            selectedRole={selectedRole}
                                            onCustomize={handleCustomize}
                                            onBack={handleBackToSelection}
                                            onMint={handleMint}
                                            isMinting={isMinting || mintLoading}
                                        />
                                    )}
                                    {mintingStep === 'success' && (
                                        <div className="text-center py-12">
                                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-green-400">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                                                Avatar Minted Successfully!
                                            </h3>
                                            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-8">
                                                Your {selectedAvatar?.name} (Slot #{selectedAvatar?.id}) has been minted and is now available in your wallet. 
                                                You can now access the Rewards dashboard to start earning.
                                            </p>
                                            
                                            {txHash && (
                                                <a
                                                    href={`https://polygonscan.com/tx/${txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mb-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
                                                >
                                                    View on PolygonScan
                                                </a>
                                            )}

                                            {mintError && (
                                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                                                    Error: {mintError}
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <button
                                                    onClick={handleGoToRewards}
                                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-90 text-white font-black text-lg uppercase tracking-[0.15em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(139,92,246,0.4)] transform hover:-translate-y-1 active:scale-[0.98]"
                                                >
                                                    Go to Rewards Dashboard →
                                                </button>
                                                <button
                                                    onClick={handleStartOver}
                                                    className="px-8 py-4 bg-[#1a1a1a]/60 hover:bg-[#1a1a1a]/80 border border-white/10 text-white font-bold text-lg uppercase tracking-[0.15em] rounded-2xl transition-all"
                                                >
                                                    Mint Another Badge
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EnhancedRewardDashboard />
                            )}
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </GlobalBackground>
    );
}
