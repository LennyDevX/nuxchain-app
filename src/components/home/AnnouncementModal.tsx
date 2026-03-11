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

    const handleAIAction = () => {
        setIsOpen(false);
        navigate('/chat');
    };

    const handleRewardsAction = () => {
        setIsOpen(false);
        navigate('/rewards');
    };

    const features = [
        {
            title: "Nuxbee AI 2.0",
            desc: "Advanced conversational AI • Real-time knowledge base • Multi-chain insights",
            icon: "🤖",
            color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
            badge: "★ NEW"
        },
        {
            title: "Style Polish",
            desc: "Refined animations • Improved visuals • Better UX components",
            icon: "✨",
            color: "bg-purple-500/15 text-purple-400 border-purple-500/30"
        },
        {
            title: "Bug Fixes",
            desc: "Enhanced stability • Critical fixes • Better error handling",
            icon: "🔧",
            color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        },
        {
            title: "Performance+",
            desc: "50% faster loads • Optimized rendering • Reduced memory footprint",
            icon: "⚡",
            color: "bg-amber-500/15 text-amber-400 border-amber-500/30"
        },
        {
            title: "Smart Staking 3.0",
            desc: "Advanced pooling • Dynamic APY • Enhanced gamification",
            icon: "📊",
            color: "bg-blue-500/15 text-blue-400 border-blue-500/30"
        },
        {
            title: "Ecosystem Growth",
            desc: "Polygon integration • Solana rewards • Cross-chain synergy",
            icon: "🌐",
            color: "bg-pink-500/15 text-pink-400 border-pink-500/30"
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

                    {/* Modal Content - Mejorado */}
                    <motion.div
                        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl mt-8"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Premium Glow Effects */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animation: 'pulse 6s ease-in-out infinite 1s' }} />
                        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animation: 'pulse 5s ease-in-out infinite 0.5s' }} />

                        <div className={`relative ${isMobile ? 'px-4 py-5' : 'px-6 py-4'}`}>
                            {/* Close Button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>

                            {/* Header - Wave 4.5 */}
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`flex items-center gap-2.5 ${isMobile ? 'mb-4' : 'mb-3'}`}
                            >
                                <div className={`${isMobile ? 'p-2.5 rounded-xl' : 'p-2.5 rounded-2xl'} bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 shadow-lg`}>
                                    <span className={`${isMobile ? 'text-3xl' : 'text-3xl'}`}>🚀</span>
                                </div>
                                <div className="min-w-0">
                                    <h2 className={`jersey-15-regular text-white font-bold ${isMobile ? 'text-3xl' : 'text-5xl'} leading-tight`}>
                                        Wave <span className="text-gradient">4.5</span>
                                    </h2>
                                    <p className={`jersey-20-regular text-white/60 leading-tight font-semibold ${isMobile ? 'text-sm' : 'text-xs'}`}>Nuxchain Ecosystem Update</p>
                                </div>
                            </motion.div>

                            {/* AI BANNER - Debajo del título */}
                            <motion.div
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className={`relative rounded-2xl p-3 overflow-hidden border border-cyan-500/30 ${isMobile ? 'mb-4' : 'mb-3'}`}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                                    boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), inset 0 0 30px rgba(34, 211, 238, 0.05)'
                                }}
                            >
                                {/* Animated border shimmer */}
                                <div 
                                    className="absolute inset-0 rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.3), transparent)',
                                        animation: 'shimmer 3s infinite',
                                        pointerEvents: 'none'
                                    }}
                                />

                                <div className="relative flex items-center gap-2.5">
                                    {/* AI Icon with pulsing glow */}
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.05, 1],
                                            rotate: [0, 2, -2, 0]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className={`flex-shrink-0 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/50 shadow-lg ${isMobile ? 'p-2.5' : 'p-2.5'}`}
                                        style={{
                                            boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)'
                                        }}
                                    >
                                        <span className={`${isMobile ? 'text-3xl' : 'text-3xl'} block`}>🤖</span>
                                    </motion.div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className={`jersey-15-regular text-cyan-300 font-bold leading-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                                Nuxbee AI 2.0
                                            </h3>
                                            <motion.span
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className={`px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold whitespace-nowrap ${isMobile ? 'text-xs' : 'text-xs'}`}
                                            >
                                                ★ FEATURED
                                            </motion.span>
                                        </div>
                                        <p className={`jersey-20-regular text-white/70 leading-tight font-semibold ${isMobile ? 'text-sm' : 'text-sm'}`}>
                                            Advanced AI • Multi-chain insights
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Features Grid - 2x3 Compacto */}
                            <div className={`grid grid-cols-2 ${isMobile ? 'gap-2.5 mb-4' : 'gap-2 mb-3'}`}>
                                {features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + idx * 0.05 }}
                                        whileHover={{ scale: 1.02, translateY: -2 }}
                                        className={`group relative ${isMobile ? 'p-2.5 rounded-lg' : 'p-2.5 rounded-lg'} bg-white/[0.03] border ${feature.color} hover:bg-white/[0.08] transition-all duration-300 cursor-default overflow-hidden`}
                                    >
                                        {/* Hover gradient overlay */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            style={{
                                                background: 'radial-gradient(circle at center, rgba(255,255,255,0.05), transparent)'
                                            }}
                                        />

                                        <div className="relative flex items-start gap-1.5">
                                            <motion.span 
                                                className={`flex-shrink-0 group-hover:scale-125 transition-transform ${isMobile ? 'text-2xl' : 'text-2xl'}`}
                                                animate={{ 
                                                    y: [0, -2, 0],
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                                            >
                                                {feature.icon}
                                            </motion.span>
                                            <div className="min-w-0">
                                                {feature.badge && (
                                                    <div className="text-xs font-bold text-cyan-400 mb-0.5">{feature.badge}</div>
                                                )}
                                                <h3 className={`jersey-15-regular text-white leading-tight font-bold ${isMobile ? 'text-base mb-0.5' : 'text-base mb-0.5'}`}>{feature.title}</h3>
                                                <p className={`jersey-20-regular text-white/50 leading-tight font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>{feature.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats Row - Compacta */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className={`grid grid-cols-3 ${isMobile ? 'gap-2.5 mb-4' : 'gap-2 mb-3'}`}
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className={`text-center ${isMobile ? 'p-2.5 rounded-lg' : 'p-2 rounded-lg'} bg-white/5 border border-white/5 hover:bg-white/10 transition-all`}
                                >
                                    <div className={`jersey-15-regular text-cyan-400 leading-tight font-bold ${isMobile ? 'text-xl' : 'text-lg'}`}>Next-Gen</div>
                                    <div className={`jersey-20-regular text-white/40 leading-tight font-semibold ${isMobile ? 'text-sm' : 'text-xs'}`}>AI Tech</div>
                                </motion.div>
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className={`text-center ${isMobile ? 'p-2.5 rounded-lg' : 'p-2 rounded-lg'} bg-white/5 border border-white/5 hover:bg-white/10 transition-all`}
                                >
                                    <div className={`jersey-15-regular text-purple-400 leading-tight font-bold ${isMobile ? 'text-xl' : 'text-lg'}`}>50%+</div>
                                    <div className={`jersey-20-regular text-white/40 leading-tight font-semibold ${isMobile ? 'text-sm' : 'text-xs'}`}>Faster</div>
                                </motion.div>
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    className={`text-center ${isMobile ? 'p-2.5 rounded-lg' : 'p-2 rounded-lg'} bg-white/5 border border-white/5 hover:bg-white/10 transition-all`}
                                >
                                    <div className={`jersey-15-regular text-emerald-400 leading-tight font-bold ${isMobile ? 'text-xl' : 'text-lg'}`}>Refined</div>
                                    <div className={`jersey-20-regular text-white/40 leading-tight font-semibold ${isMobile ? 'text-sm' : 'text-xs'}`}>Quality</div>
                                </motion.div>
                            </motion.div>

                            {/* Actions - Compactas */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className={`flex flex-col ${isMobile ? 'gap-2.5' : 'gap-2'}`}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleAIAction}
                                    className={`w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white jersey-20-regular rounded-xl transition-all shadow-lg shadow-cyan-500/30 ${isMobile ? 'py-3.5 text-lg' : 'py-3 text-base'} font-bold`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        🤖 Try Nuxbee AI 2.0
                                    </span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRewardsAction}
                                    className={`w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white jersey-20-regular rounded-xl transition-all ${isMobile ? 'py-3 text-base' : 'py-2.5 text-sm'} font-bold`}
                                >
                                    🏆 Explore Ecosystem
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleClose}
                                    className={`text-white/40 jersey-20-regular hover:text-white/70 transition-colors font-semibold ${isMobile ? 'text-sm py-2' : 'text-xs py-1.5'}`}
                                >
                                    Dismiss
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementModal;
