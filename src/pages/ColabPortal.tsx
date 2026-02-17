import { useState } from 'react';
import ModNFTMint from '../components/colab/NFTMint';
import RewardDashboard from '../components/colab/RewardDashboard';
import Footer from '../components/layout/footer';
import GlobalBackground from '../ui/gradientBackground';

export default function ColabPortal() {
    const [activeTab, setActiveTab] = useState<'identification' | 'rewards'>('identification');

    return (
        <GlobalBackground>
            <div className="min-h-screen text-white selection:bg-purple-500/30">
                {/* Hero Section */}
                <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10 text-center">
                        <h1 className="text-4xl md:text-7xl font-black mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#ef4444] animate-gradient-text uppercase tracking-tighter">
                            Collaborator Portal
                        </h1>
                        <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 font-medium leading-relaxed">
                            Welcome, Moderator. This is your dedicated space to manage your identity within NuxChain and claim your rewards.
                        </p>

                        <div className="flex flex-row justify-center gap-3 md:gap-4 mb-8 md:mb-12 w-full max-w-md mx-auto">
                            <button
                                onClick={() => setActiveTab('identification')}
                                className={`flex-1 py-3 md:py-4 rounded-xl font-black uppercase tracking-wider text-xs md:text-base transition-all duration-300 ${activeTab === 'identification'
                                    ? 'bg-gradient-to-r from-[#8b5cf6] to-[#5b21b6] text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] scale-105'
                                    : 'bg-[#1a1a1a]/40 text-gray-400 border border-white/5 hover:border-purple-500/30'
                                    }`}
                            >
                                Identification
                            </button>
                            <button
                                onClick={() => setActiveTab('rewards')}
                                className={`flex-1 py-3 md:py-4 rounded-xl font-black uppercase tracking-wider text-xs md:text-base transition-all duration-300 ${activeTab === 'rewards'
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
                                <ModNFTMint />
                            ) : (
                                <RewardDashboard />
                            )}
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </GlobalBackground>
    );
}
