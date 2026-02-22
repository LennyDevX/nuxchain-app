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

    const handleAirdropAction = () => {
        setIsOpen(false);
        navigate('/airdrop');
    };

    const features = [
        {
            title: "New Colab Page",
            desc: "Collaboration hub",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            color: "bg-blue-500/10 text-blue-400"
        },
        {
            title: "New Styles",
            desc: "Improved fonts and styles",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            ),
            color: "bg-purple-500/10 text-purple-400"
        },
        {
            title: "Bug Fixes",
            desc: "Errors resolved",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "bg-emerald-500/10 text-emerald-400"
        },
        {
            title: "Performance",
            desc: "Speed improvements",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8zm6 12h8m-4-4v4" />
                </svg>
            ),
            color: "bg-sky-500/10 text-sky-400"
        },
        {
            title: "Smart Staking v2.0",
            desc: "Enhanced staking",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4zm12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-9 7a1 1 0 0 1-1-1v-2l2-2 2 2 3-3 4 4v2a1 1 0 0 1-1 1H7z" />
                </svg>
            ),
            color: "bg-pink-500/10 text-pink-400"
        },
        {
            title: "Ecosystem",
            desc: "Better integration",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zm0 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2zM6 8h.01M6 16h.01" />
                </svg>
            ),
            color: "bg-amber-500/10 text-amber-400"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative w-full max-w-md bg-[#0B0F19]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Internal Glow Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative p-6 sm:p-8">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-5 sm:top-6 sm:right-8 p-1.5 sm:p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner shrink-0">
                                    <img src="/assets/unused/favicon1.png" alt="NuxChain" className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <div className="pt-0.5 sm:pt-1 min-w-0">
                                    <h2 className="jersey-15-regular text-4xl sm:text-5xl text-white flex items-center gap-2 truncate">
                                        Wave 4.0 <span className="text-3xl sm:text-4xl shrink-0">🚀</span>
                                    </h2>
                                    <p className="jersey-20-regular text-base sm:text-lg text-slate-500/80 mt-0.5 tracking-tight">V4.0.0</p>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8">
                                {features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        className="group relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-default"
                                    >
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shrink-0 ${feature.color} border border-white/5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                            <div className="scale-90 sm:scale-100">{feature.icon}</div>
                                        </div>
                                        <div className="min-w-0 w-full text-center sm:text-left">
                                            <h3 className="jersey-15-regular text-white text-base sm:text-lg leading-tight group-hover:text-blue-400 transition-colors truncate">{feature.title}</h3>
                                            <p className="jersey-20-regular text-slate-500 text-sm sm:text-base mt-1 leading-tight">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-center gap-3 sm:gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.01, translateY: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleAirdropAction}
                                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-900/40 to-blue-700/30 border border-blue-500/40 text-blue-100 jersey-20-regular text-xl sm:text-2xl rounded-2xl transition-all hover:from-blue-800/50 hover:to-blue-600/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] shadow-xl"
                                >
                                    Claim Airdrop
                                </motion.button>

                                <button
                                    onClick={handleClose}
                                    className="text-slate-500 jersey-20-regular text-base sm:text-lg font-semibold hover:text-slate-300 transition-colors"
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
