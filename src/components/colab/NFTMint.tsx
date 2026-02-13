import { useState } from 'react';
import { useAccount } from 'wagmi';
import useMintNFT from '../../hooks/nfts/useMintNFT';

const BADGE_OPTIONS = [
    {
        id: 'mods',
        role: 'Moderator',
        image: '/DragonixMods.png',
        description: 'Official identification for NuxChain Community Moderators.',
        skillType: 4, // COMMUNITY
        rarity: 3, // RARE
    },
    {
        id: 'influencer',
        role: 'Influencer',
        image: '/DragonixInfluencer.png',
        description: 'Exclusive badge for NuxChain Ambassadors and Influencers.',
        skillType: 2, // MARKETING
        rarity: 4, // EPIC/LEGENDARY
    },
    {
        id: 'vip',
        role: 'VIP Partner',
        image: '/DragonixVIP.png',
        description: 'Premium identification for NuxChain Strategic Partners.',
        skillType: 3, // TRADING
        rarity: 4,
    },
    {
        id: 'tester',
        role: 'Beta Tester',
        image: '/DragonixCientific.png',
        description: 'Special badge for our most active Beta Testers and Contributors.',
        skillType: 0, // CODING/TECHNICAL
        rarity: 2, // UNCOMMON
    },
];

export default function ModNFTMint() {
    const { isConnected } = useAccount();
    const { mintNFT, loading, error, success, txHash } = useMintNFT();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMinting, setIsMinting] = useState(false);

    const currentBadge = BADGE_OPTIONS[currentIndex];

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % BADGE_OPTIONS.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + BADGE_OPTIONS.length) % BADGE_OPTIONS.length);

    const handleMintBadge = async () => {
        if (!isConnected) return;
        setIsMinting(true);

        try {
            const response = await fetch(currentBadge.image);
            const blob = await response.blob();
            const file = new File([blob], `${currentBadge.id}_badge.png`, { type: "image/png" });

            await mintNFT({
                file,
                name: `NuxChain ${currentBadge.role} Badge`,
                description: `${currentBadge.description} Grants access to exclusive collaborator rewards.`,
                category: "utility",
                royalty: 0,
                skills: [
                    { skillType: currentBadge.skillType, rarity: currentBadge.rarity, level: 1 }
                ]
            });
        } catch (err) {
            console.error("Minting failed:", err);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            {/* Carousel Side */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="relative group perspective-1000 w-full max-w-[280px] md:max-w-sm mb-6 md:mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />

                    <div className="relative aspect-square rounded-2xl border border-white/10 bg-[#0a0a0a]/60 overflow-hidden shadow-2xl flex items-center justify-center">
                        <img
                            src={currentBadge.image}
                            alt={currentBadge.role}
                            className="w-full h-full object-contain animate-fadeIn p-4"
                            key={currentBadge.id}
                        />
                    </div>
                </div>

                {/* Combined Controls at bottom */}
                <div className="flex items-center gap-4 md:gap-6 bg-black/40 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-white/5 transform scale-90 md:scale-100">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-purple-600 transition-all active:scale-95"
                    >
                        ←
                    </button>

                    <div className="flex gap-2">
                        {BADGE_OPTIONS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-purple-500 w-5 md:w-6' : 'bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-purple-600 transition-all active:scale-95"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 uppercase tracking-tighter leading-none">
                        Claim <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 block md:inline mt-1 md:mt-0">{currentBadge.role}</span> Badge
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed">
                        {currentBadge.description} This NFT verifies your contribution to the NuxChain ecosystem.
                    </p>
                </div>

                <div className="space-y-4 text-left">
                    <div className="p-4 md:p-5 bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 rounded-r-xl">
                        <ul className="space-y-2 md:space-y-3">
                            <li className="flex items-center gap-3 text-gray-300 font-bold text-xs md:text-sm uppercase tracking-wide">
                                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] flex-shrink-0">✓</span>
                                Zero Cost Minting
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 font-bold text-xs md:text-sm uppercase tracking-wide">
                                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] flex-shrink-0">✓</span>
                                Verified On-Chain ID
                            </li>
                            <li className="flex items-center gap-3 text-gray-300 font-bold text-xs md:text-sm uppercase tracking-wide">
                                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[10px] flex-shrink-0">✓</span>
                                Revenue Share Eligible
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-2">
                    {!isConnected ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs md:text-sm font-black uppercase tracking-widest text-center">
                            Wallet Connection Required
                        </div>
                    ) : success ? (
                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl animate-scaleIn text-center">
                            <h3 className="text-green-500 font-black mb-3 uppercase tracking-widest">
                                Verification Success
                            </h3>
                            <a
                                href={`https://polygonscan.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-white text-xs font-black border border-white/10 transition-all uppercase tracking-widest"
                            >
                                View Receipt
                            </a>
                        </div>
                    ) : (
                        <button
                            onClick={handleMintBadge}
                            disabled={isMinting || loading}
                            className="w-full py-4 md:py-5 bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#ef4444] hover:opacity-90 text-white font-black text-lg md:text-xl uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {isMinting || loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Minting...
                                </span>
                            ) : `Mint ${currentBadge.role} Badge`}
                        </button>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center uppercase tracking-widest animate-shake">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
