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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop Minimalista Ultra-Blur */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal Content - Glassmorphism Design - Optimized for mobile */}
                    <motion.div
                        className="relative w-full max-w-sm sm:max-w-lg bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                    >
                        {/* Glow circular de fondo */}
                        <div className="absolute -top-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                        <div className="relative p-6 sm:p-10 pt-10 sm:pt-14">
                            {/* Logo flotante minimalista */}
                            <motion.div 
                                className="flex justify-center mb-8"
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
                                    <img src="/favicon1.png" alt="NuxChain" className="w-12 h-12" />
                                </div>
                            </motion.div>

                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="text-center mb-6 sm:mb-10">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1 sm:mb-2">
                                    Ultimate Security 🔐
                                </h2>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-[0.2em]">
                                    Public Beta v2.5
                                </p>
                            </div>

                            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                                <motion.div 
                                    className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-xs sm:text-sm font-bold">Ultra-Secure Airdrop</h4>
                                        <p className="text-slate-400 text-xs">Advanced protection and validation.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-xs sm:text-sm font-bold">Stable AI Chat</h4>
                                        <p className="text-slate-400 text-xs">Faster responses and context.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-xs sm:text-sm font-bold">Solana Integrated</h4>
                                        <p className="text-slate-400 text-xs">Optimized wallet connection.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-xs sm:text-sm font-bold">Optimized Contracts</h4>
                                        <p className="text-slate-400 text-xs">Better performance and efficiency.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-xs sm:text-sm font-bold">Complete Tutorial</h4>
                                        <p className="text-slate-400 text-xs">Discover NuxChain.</p>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAirdropAction}
                                className="w-full py-3 sm:py-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all shadow-lg hover:shadow-blue-500/10 hover:bg-blue-600/30 mb-2 sm:mb-3"
                            >
                                Claim Airdrop Now
                            </motion.button>
                            
                            <button
                                onClick={handleClose}
                                className="w-full py-2 text-slate-500 text-xs sm:text-sm font-medium hover:text-slate-300 transition-colors"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementModal;
