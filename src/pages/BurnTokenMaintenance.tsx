import React from 'react';
import Footer from '../components/layout/footer';
import { motion } from 'framer-motion';
import '../styles/maintenance.css';

const BurnTokenMaintenance: React.FC = () => {
    return (
        <div className="maintenance-wrapper">
            {/* Background blobs for visual interest */}
            <div className="blob blob-1 !bg-red-500/20"></div>
            <div className="blob blob-2 !bg-orange-600/20"></div>
            <div className="blob blob-3 !bg-amber-500/20"></div>

            <div className="maintenance-container">
                <div className="maintenance-content">
                    {/* Fire/Burn Image with light animation */}
                    <motion.div
                        className="mb-8 relative z-10 flex justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <motion.div
                                className="text-8xl md:text-9xl drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                                animate={{
                                    y: [0, -15, 0],
                                    scale: [1, 1.05, 1],
                                    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                🔥
                            </motion.div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-red-600/30 blur-2xl rounded-full animate-pulse"></div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent mb-4 italic tracking-tight">
                            BURN PROTOCOL UPGRADE
                        </h1>

                        <div className="maintenance-message mb-8">
                            <p className="text-gray-300 text-lg leading-relaxed">
                                We are currently <span className="text-red-400 font-bold">refining the deflationary mechanism</span> and optimizing the dashboard to ensure the most impactful token burn event in NuxChain history.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                                🔥 Deflation 2.0 Incoming
                            </h2>
                            <div className="maintenance-grid">
                                <div className="grid-item !border-red-500/30 hover:!bg-red-500/10">
                                    <span className="icon">💥</span>
                                    <p className="text-sm">Massive Burn Events</p>
                                </div>
                                <div className="grid-item !border-orange-500/30 hover:!bg-orange-500/10">
                                    <span className="icon">📈</span>
                                    <p className="text-sm">Real-time Deflation Stats</p>
                                </div>
                                <div className="grid-item !border-amber-500/30 hover:!bg-amber-500/10">
                                    <span className="icon">🛡️</span>
                                    <p className="text-sm">Verified Burn Proofs</p>
                                </div>
                                <div className="grid-item !border-red-400/30 hover:!bg-red-400/10">
                                    <span className="icon">🚀</span>
                                    <p className="text-sm">Value Accumulation</p>
                                </div>
                            </div>
                        </div>

                        <div className="maintenance-action">
                            <button
                                className="refresh-button w-full !bg-gradient-to-r !from-red-600 !to-orange-600 !hover:from-red-500 !hover:to-orange-500"
                                onClick={() => window.location.reload()}
                            >
                                <span>Check Status</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BurnTokenMaintenance;
