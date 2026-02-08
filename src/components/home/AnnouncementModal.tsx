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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal Content - Compact Vertical Card */}
                    <motion.div
                        className="relative w-full max-w-sm bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Accent Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                        <div className="relative p-6">
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header - Compact */}
                            <motion.div 
                                className="flex items-center gap-3 mb-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                    <img src="/favicon1.png" alt="NuxChain" className="w-8 h-8 sm:w-9 sm:h-9" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">Ultimate Security 🔐</h2>
                                    <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">v2.5</p>
                                </div>
                            </motion.div>

                            {/* Feature List - Single Column, Compact */}
                            <div className="space-y-2 sm:space-y-2.5 mb-4">
                                <motion.div 
                                    className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group cursor-default"
                                    initial={{ x: -15, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs sm:text-sm font-bold">Secure Airdrop</p>
                                        <p className="text-slate-500 text-[10px] sm:text-xs">Advanced protection</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group cursor-default"
                                    initial={{ x: -15, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-purple-500/15 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs sm:text-sm font-bold">Stable AI Chat</p>
                                        <p className="text-slate-500 text-[10px] sm:text-xs">Faster responses</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group cursor-default"
                                    initial={{ x: -15, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs sm:text-sm font-bold">Solana Sync</p>
                                        <p className="text-slate-500 text-[10px] sm:text-xs">Optimized wallets</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group cursor-default"
                                    initial={{ x: -15, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-xs sm:text-sm font-bold">Optimized Gas</p>
                                        <p className="text-slate-500 text-[10px] sm:text-xs">Better efficiency</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col gap-2 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAirdropAction}
                                    className="w-full py-2.5 bg-gradient-to-r from-blue-600/40 to-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-sm rounded-lg transition-all hover:from-blue-600/50 hover:to-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20"
                                >
                                    Claim Airdrop
                                </motion.button>
                                
                                <button
                                    onClick={handleClose}
                                    className="py-1.5 text-slate-500 text-xs font-medium hover:text-slate-300 transition-colors"
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