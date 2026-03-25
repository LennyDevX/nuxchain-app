import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AnnouncementModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

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

    const handleGiveawayAction = () => {
        setIsOpen(false);
        navigate('/giveaway');
    };

    const features = [
        {
            title: "Nuxbee AI 2.0",
            desc: "Advanced AI • Real-time knowledge base • Multi-chain insights",
            icon: "🤖",
            color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
            badge: "★ NEW"
        },
        {
            title: "Deep Bug Fixes",
            desc: "200+ edge cases resolved • Zero-crash stability • Hardened flow",
            icon: "🐛",
            color: "bg-red-500/15 text-red-400 border-red-500/30",
            badge: "★ FIXED"
        },
        {
            title: "Performance+",
            desc: "60% faster cold start • Bundle optimized • Lazy loading tuned",
            icon: "⚡",
            color: "bg-amber-500/15 text-amber-400 border-amber-500/30"
        },
        {
            title: "UI Polish",
            desc: "Pixel-perfect spacing • Smoother transitions • Better contrast",
            icon: "✨",
            color: "bg-purple-500/15 text-purple-400 border-purple-500/30"
        },
        {
            title: "Smart Staking 3.0",
            desc: "Advanced pooling • Dynamic APY • Enhanced gamification",
            icon: "📊",
            color: "bg-blue-500/15 text-blue-400 border-blue-500/30"
        },
        {
            title: "Mobile UX",
            desc: "Better touch targets • Improved readability • Responsive fixes",
            icon: "📱",
            color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
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
                        className="relative w-full max-w-sm bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Glow Effects */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative px-4 py-4 overflow-y-auto max-h-[90vh]">
                            {/* Close Button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClose}
                                className="absolute top-3 right-3 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>

                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center gap-2 mb-3"
                            >
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
                                    <span className="text-xl">🚀</span>
                                </div>
                                <div>
                                    <h2 className="jersey-15-regular text-white font-bold text-3xl leading-tight">
                                        Wave <span className="text-gradient">4.6</span>
                                    </h2>
                                    <p className="jersey-20-regular text-white/60 text-[13px] font-semibold leading-tight">Nuxchain Ecosystem Update</p>
                                </div>
                            </motion.div>

                            {/* AI Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="relative rounded-xl p-2.5 overflow-hidden border border-cyan-500/30 mb-2"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.12)'
                                }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/50"
                                        style={{ boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)' }}
                                    >
                                        <span className="text-2xl block">🤖</span>
                                    </motion.div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="jersey-15-regular text-cyan-300 font-bold text-xl leading-tight">Nuxbee AI 2.0</h3>
                                            <motion.span
                                                animate={{ scale: [1, 1.08, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold text-[10px] whitespace-nowrap"
                                            >
                                                ★ FEATURED
                                            </motion.span>
                                        </div>
                                        <p className="jersey-20-regular text-white/70 text-[13px] leading-tight font-semibold">
                                            Advanced AI • Multi-chain insights
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Giveaway Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.22 }}
                                className="relative rounded-xl p-2.5 overflow-hidden border border-[#9945FF]/40 mb-3 cursor-pointer"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.12) 0%, rgba(20, 241, 149, 0.06) 100%)',
                                    boxShadow: '0 0 20px rgba(153, 69, 255, 0.15)'
                                }}
                                onClick={handleGiveawayAction}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-[#9945FF]/30 to-[#14F195]/20 border border-[#9945FF]/50"
                                        style={{ boxShadow: '0 0 15px rgba(153, 69, 255, 0.3)' }}
                                    >
                                        <span className="text-xl block">🎁</span>
                                    </motion.div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h3 className="jersey-15-regular font-bold text-xl leading-tight" style={{ color: '#c084fc' }}>
                                                Giveaway Program
                                            </h3>
                                            <motion.span
                                                animate={{ opacity: [1, 0.6, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="px-1.5 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap"
                                                style={{ background: 'rgba(20, 241, 149, 0.15)', color: '#14F195', border: '1px solid rgba(20, 241, 149, 0.4)' }}
                                            >
                                                📅 COMING SOON
                                            </motion.span>
                                        </div>
                                        <p className="jersey-20-regular text-white/70 text-[13px] leading-tight font-semibold">
                                            Exclusive rewards for community members
                                        </p>
                                    </div>
                                    <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + idx * 0.05 }}
                                        whileHover={{ scale: 1.02, translateY: -1 }}
                                        className={`group relative p-2 rounded-lg bg-white/[0.03] border ${feature.color} hover:bg-white/[0.07] transition-all duration-200 cursor-default`}
                                    >
                                        <div className="flex items-start gap-1.5">
                                            <span className="flex-shrink-0 text-lg group-hover:scale-110 transition-transform">{feature.icon}</span>
                                            <div className="min-w-0">
                                                {feature.badge && (
                                                    <div className="text-[10px] font-bold text-cyan-400 mb-0.5">{feature.badge}</div>
                                                )}
                                                <h3 className="jersey-15-regular text-white text-[14px] font-bold leading-tight mb-0.5">{feature.title}</h3>
                                                <p className="jersey-20-regular text-white/50 text-[12px] leading-snug font-medium">{feature.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats Row */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className="grid grid-cols-3 gap-2 mb-3"
                            >
                                {[
                                    { val: '200+', label: 'Fixes', color: 'text-red-400' },
                                    { val: '60%+', label: 'Faster', color: 'text-amber-400' },
                                    { val: 'Polished', label: 'Quality', color: 'text-purple-400' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.04 }}
                                        className="text-center p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                                    >
                                        <div className={`jersey-15-regular ${stat.color} text-sm font-bold leading-tight`}>{stat.val}</div>
                                        <div className="jersey-20-regular text-white/40 text-[12px] font-semibold leading-tight">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="flex flex-col gap-2"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(34, 211, 238, 0.4)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleAIAction}
                                    className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white jersey-20-regular rounded-xl transition-all shadow-lg shadow-cyan-500/30 py-2.5 text-[14px] font-bold"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        🤖 Try Nuxbee AI 2.0
                                    </span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(153, 69, 255, 0.4)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleGiveawayAction}
                                    className="w-full relative overflow-hidden rounded-xl transition-all py-2.5 text-[14px] font-bold jersey-20-regular text-white"
                                    style={{
                                        background: 'linear-gradient(135deg, #9945FF, #14F195)',
                                        boxShadow: '0 4px 15px rgba(153, 69, 255, 0.3)'
                                    }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        <motion.span
                                            className="text-xl block flex-shrink-0"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            🎁
                                        </motion.span>
                                        <span>Explore Giveaway Program</span>
                                    </span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleClose}
                                    className="text-white/40 jersey-20-regular hover:text-white/70 transition-colors text-[12px] font-semibold py-1"
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
