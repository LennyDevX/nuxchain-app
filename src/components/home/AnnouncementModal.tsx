import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const AnnouncementModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleAirdropAction = () => {
        setIsOpen(false);
        navigate('/airdrop');
    };

    const handleRewardsAction = () => {
        setIsOpen(false);
        navigate('/rewards');
    };

    const features = [
        {
            title: "NUX Rewards Hub",
            desc: "Monthly NUX distribution based on your Polygon activity",
            icon: "🏆",
            color: "bg-amber-500/15 text-amber-400 border-amber-500/30"
        },
        {
            title: "Tokenomics",
            desc: "100M total supply • 20% rewards pool • Monthly drops",
            icon: "◎",
            color: "bg-purple-500/15 text-purple-400 border-purple-500/30"
        },
        {
            title: "Airdrop Security",
            desc: "Anti-bot protection • Wallet verification • Fair distribution",
            icon: "🔒",
            color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        },
        {
            title: "Smart Staking",
            desc: "Up to 118.3% APY • Skill boosts • Gamification rewards",
            icon: "📈",
            color: "bg-blue-500/15 text-blue-400 border-blue-500/30"
        },
        {
            title: "NFT Marketplace",
            desc: "Dragonix Avatars • Real utilities • Royalties forever",
            icon: "🎨",
            color: "bg-pink-500/15 text-pink-400 border-pink-500/30"
        },
        {
            title: "Cross-Chain",
            desc: "Polygon activity • Solana rewards • Zero gas for users",
            icon: "🔗",
            color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Glow Effects */}
                        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className={`relative ${isMobile ? 'p-3' : 'p-6'}`}>
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header */}
                            <div className={`flex items-center gap-3 ${isMobile ? 'mb-3' : 'mb-6'}`}>
                                <div className={`${isMobile ? 'p-2 rounded-xl' : 'p-3 rounded-2xl'} bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 shadow-lg`}>
                                    <span className={`${isMobile ? 'text-3xl' : 'text-4xl'}`}>🚀</span>
                                </div>
                                <div>
                                    <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                                        Wave <span className="text-gradient">4.1</span>
                                    </h2>
                                    <p className={`jersey-20-regular text-white/50 ${isMobile ? 'text-base' : 'text-lg'}`}>Nuxchain Ecosystem</p>
                                </div>
                            </div>

                            {/* Features Grid - 2x3 */}
                            <div className={`grid grid-cols-2 ${isMobile ? 'gap-2 mb-3' : 'gap-3 mb-6'}`}>
                                {features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        className={`group relative ${isMobile ? 'p-2 rounded-xl' : 'p-4 rounded-2xl'} bg-white/[0.03] border ${feature.color} hover:bg-white/[0.06] transition-all duration-300 cursor-default`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className={`flex-shrink-0 group-hover:scale-110 transition-transform ${isMobile ? 'text-xl' : 'text-2xl'}`}>{feature.icon}</span>
                                            <div className="min-w-0">
                                                <h3 className={`jersey-15-regular text-white leading-tight ${isMobile ? 'text-base mb-0.5' : 'text-lg mb-1'}`}>{feature.title}</h3>
                                                <p className={`jersey-20-regular text-white/50 leading-tight ${isMobile ? 'text-xs' : 'text-sm'}`}>{feature.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats Row */}
                            <div className={`grid grid-cols-3 ${isMobile ? 'gap-2 mb-3' : 'gap-3 mb-6'}`}>
                                <div className={`text-center ${isMobile ? 'p-2 rounded-lg' : 'p-3 rounded-xl'} bg-white/5 border border-white/5`}>
                                    <div className={`jersey-15-regular text-amber-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>100M</div>
                                    <div className={`jersey-20-regular text-white/40 ${isMobile ? 'text-xs' : 'text-sm'}`}>Supply</div>
                                </div>
                                <div className={`text-center ${isMobile ? 'p-2 rounded-lg' : 'p-3 rounded-xl'} bg-white/5 border border-white/5`}>
                                    <div className={`jersey-15-regular text-purple-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>20%</div>
                                    <div className={`jersey-20-regular text-white/40 ${isMobile ? 'text-xs' : 'text-sm'}`}>Rewards</div>
                                </div>
                                <div className={`text-center ${isMobile ? 'p-2 rounded-lg' : 'p-3 rounded-xl'} bg-white/5 border border-white/5`}>
                                    <div className={`jersey-15-regular text-emerald-400 ${isMobile ? 'text-lg' : 'text-xl'}`}>Monthly</div>
                                    <div className={`jersey-20-regular text-white/40 ${isMobile ? 'text-xs' : 'text-sm'}`}>Drops</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-3'}`}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAirdropAction}
                                    className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white jersey-20-regular rounded-2xl transition-all shadow-lg shadow-purple-500/25 ${isMobile ? 'py-3 text-lg' : 'py-4 text-xl'}`}
                                >
                                    🎁 Claim Airdrop
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRewardsAction}
                                    className={`w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white jersey-20-regular rounded-2xl transition-all ${isMobile ? 'py-2.5 text-base' : 'py-4 text-xl'}`}
                                >
                                    🏆 View Rewards Hub
                                </motion.button>

                                <button
                                    onClick={handleClose}
                                    className={`text-white/40 jersey-20-regular hover:text-white/70 transition-colors ${isMobile ? 'text-sm py-1' : 'text-lg'}`}
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementModal;
