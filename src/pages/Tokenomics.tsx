import React, { useState } from 'react';
import { isMaintenanceMode } from '../config/maintenance';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    type ChartOptions
} from 'chart.js';
import GlobalBackground from '../ui/gradientBackground';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { ZapIcon, CpuIcon, GlobeIcon, BarChart3Icon } from '../components/ui/CustomIcons';

ChartJS.register(ArcElement, Tooltip, Legend);

const Tokenomics: React.FC = () => {
    const isMobile = useIsMobile();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Descriptions for tooltips
    const descriptions: Record<string, string> = {
        'Presale': 'Early investors & public sale',
        'Liquidity Pool': 'DEX liquidity provision',
        'Activity Rewards': 'NUX Rewards Hub — Monthly distribution based on Polygon activity',
        'Dev Team': 'Development & operations',
        'Marketing': 'Growth & partnerships',
        'Ecosystem': 'Treasury & ecosystem fund',
    };

    // Check maintenance mode (handled by TokenomicsMaintenance wrapper in router;
    // this guard prevents direct access bypassing the wrapper)
    if (isMaintenanceMode('tokenomics')) {
        return null;
    }

    const data = {
        labels: ['Presale', 'Liquidity Pool', 'Activity Rewards', 'Dev Team', 'Marketing', 'Ecosystem'],
        datasets: [
            {
                label: 'Token Distribution',
                data: [15, 15, 20, 15, 15, 20],
                backgroundColor: [
                    selectedIndex === null || selectedIndex === 0 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(251, 191, 36, 0.2)',
                    selectedIndex === null || selectedIndex === 1 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.2)',
                    selectedIndex === null || selectedIndex === 2 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.2)',
                    selectedIndex === null || selectedIndex === 3 ? 'rgba(236, 72, 153, 0.8)' : 'rgba(236, 72, 153, 0.2)',
                    selectedIndex === null || selectedIndex === 4 ? 'rgba(168, 85, 247, 0.8)' : 'rgba(168, 85, 247, 0.2)',
                    selectedIndex === null || selectedIndex === 5 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(6, 182, 212, 0.2)',
                ],
                hoverBackgroundColor: [
                    'rgba(251, 191, 36, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(6, 182, 212, 1)',
                ],
                borderColor: [
                    'rgba(251, 191, 36, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(6, 182, 212, 1)',
                ],
                borderWidth: selectedIndex !== null ? [3, 3, 3, 3, 3, 3] : [3, 3, 3, 3, 3, 3],
                hoverOffset: selectedIndex !== null ? 
                    [selectedIndex === 0 ? 30 : 0, selectedIndex === 1 ? 30 : 0, selectedIndex === 2 ? 30 : 0, selectedIndex === 3 ? 30 : 0, selectedIndex === 4 ? 30 : 0, selectedIndex === 5 ? 30 : 0] 
                    : [0, 0, 0, 0, 0, 0],
                spacing: 2,
                hoverBorderWidth: 4,
                hoverBorderColor: [
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.8)',
                ],
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000,
            easing: 'easeOutQuart',
        },
        hover: {
            mode: undefined,
        },
        onHover: undefined,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        cutout: '60%',
        radius: '90%',
        interaction: {
            mode: undefined,
        },
        elements: {
            arc: {
                borderWidth: 3,
                hoverBorderWidth: 6,
                hoverBorderColor: '#ffffff',
            },
        },
        layout: {
            padding: 20,
        },
    };

    return (
        <GlobalBackground>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-6 pb-20' : 'px-4 sm:px-6 lg:px-8 py-20'}`}>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 sm:mb-16 relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-purple-500/10 blur-[80px] sm:blur-[100px] rounded-full -z-10" />
                    <h1 className={`jersey-15-regular mb-4 text-gradient leading-tight ${isMobile ? 'text-4xl' : 'text-7xl md:text-8xl tracking-tight'}`}>
                        Treasury Manager
                    </h1>
                    <p className={`jersey-20-regular text-slate-400 max-w-2xl mx-auto ${isMobile ? 'text-sm px-2' : 'text-2xl md:text-3xl'}`}>
                        A community-first economy designed for sustainable growth and long-term utility on Solana.
                    </p>
                </motion.div>

                <div className={`flex flex-col lg:grid lg:grid-cols-12 gap-8 sm:gap-12 ${isMobile ? 'items-center' : 'items-start'}`}>

                    {/* Left Column: Chart Area */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:col-span-7 flex flex-col items-center"
                    >
                        {/* Chart Wrapper */}
                        <div className={`relative w-full aspect-square max-w-[320px] sm:max-w-[500px] group ${isMobile ? 'mb-6' : 'mb-12'}`}>
                            {/* Outer Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-3xl rounded-full scale-110 animate-pulse" />

                            <Doughnut data={data} options={options} />

                            {/* Center Logo */}
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                animate={{ 
                                    scale: hoveredIndex !== null ? 0.95 : 1,
                                    rotate: hoveredIndex !== null ? 5 : 0
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <img
                                    src="/assets/tokens/NuxLogo.png"
                                    alt="NUX Token"
                                    className={`${isMobile ? 'w-28 h-28' : 'w-36 h-36 md:w-44 md:h-44'} object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]`}
                                />
                            </motion.div>

                            {/* Selection indicator ring */}
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                    opacity: selectedIndex !== null ? 1 : 0,
                                    scale: selectedIndex !== null ? 1 : 0.8
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={`${isMobile ? 'w-32 h-32' : 'w-40 h-40 md:w-48 md:h-48'} rounded-full border-2 border-white/30`} />
                            </motion.div>

                            {/* Custom Floating Tooltip - appears when card is clicked */}
                            <AnimatePresence>
                                {selectedIndex !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                                    >
                                        <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: data.datasets[0].backgroundColor[selectedIndex] }}
                                                />
                                                <span className="jersey-15-regular text-white text-lg">
                                                    {data.labels[selectedIndex]}
                                                </span>
                                                <span className="jersey-15-regular text-white text-xl ml-auto">
                                                    {data.datasets[0].data[selectedIndex]}%
                                                </span>
                                            </div>
                                            <p className="jersey-20-regular text-slate-300 text-sm mb-2">
                                                {descriptions[data.labels[selectedIndex]]}
                                            </p>
                                            <p className="jersey-20-regular text-slate-400 text-xs">
                                                {(data.datasets[0].data[selectedIndex] * 1000000).toLocaleString()} NUX tokens
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Custom Legend - Click to show tooltip */}
                        <div className={`grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[500px] ${isMobile ? 'text-sm' : 'text-lg md:text-xl'}`}>
                            {data.labels.map((label, idx) => {
                                const isSelected = selectedIndex === idx;
                                const isHovered = hoveredIndex === idx;
                                return (
                                    <motion.div 
                                        key={idx} 
                                        className={`flex flex-col gap-1 bg-white/5 border p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-white/20 border-white/50 scale-105 ring-2 ring-white/30' 
                                                : isHovered
                                                    ? 'bg-white/10 border-white/30'
                                                    : 'border-white/10 hover:bg-white/8'
                                        }`}
                                        onClick={() => setSelectedIndex(isSelected ? null : idx)}
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <motion.div 
                                                className="w-3 h-3 sm:w-5 sm:h-5 rounded-full shrink-0" 
                                                style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}
                                                animate={{ scale: isSelected ? 1.4 : isHovered ? 1.2 : 1 }}
                                            />
                                            <span className={`jersey-15-regular truncate transition-colors ${isSelected ? 'text-white font-bold' : isHovered ? 'text-white' : 'text-slate-300'}`}>
                                                {label}
                                            </span>
                                            <span className={`jersey-15-regular ml-auto ${isSelected ? 'text-white font-bold' : isHovered ? 'text-white' : 'text-slate-400'}`}>
                                                {data.datasets[0].data[idx]}%
                                            </span>
                                        </div>
                                        <span className={`jersey-20-regular text-xs sm:text-sm truncate transition-colors ${isSelected ? 'text-slate-200' : isHovered ? 'text-slate-300' : 'text-slate-500'}`}>
                                            {descriptions[label]}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Total Supply Display */}
                        <motion.div 
                            className={`mt-6 text-center ${isMobile ? 'mb-4' : 'mb-8'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                                <span className={`jersey-20-regular text-slate-400 uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    Total Supply
                                </span>
                                <span className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`}>
                                    100,000,000
                                </span>
                                <span className={`jersey-15-regular text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                                    $NUX
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Cards & Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full lg:col-span-5 space-y-8"
                    >
                        {/* Quick Specs Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <TokenInfoCard icon={<BarChart3Icon />} title="Token ID" value="Nuxchain" gradient="from-purple-500/20 to-transparent" />
                            <TokenInfoCard icon={<ZapIcon />} title="Ticker" value="$NUX" gradient="from-blue-500/20 to-transparent" />
                            <TokenInfoCard icon={<GlobeIcon />} title="Network" value="Solana" gradient="from-emerald-500/20 to-transparent" />
                            <TokenInfoCard icon={<CpuIcon />} title="Supply Cap" value="100M Fixed" gradient="from-pink-500/20 to-transparent" />
                        </div>

                        {/* Allocation Progress Bars - 2x2 Grid Layout */}
                        <div className={`card-unified relative overflow-hidden backdrop-blur-xl border-white/20 ${isMobile ? 'p-4' : 'p-6'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
                            <h3 className={`jersey-15-regular text-white tracking-tight flex items-center gap-2 sm:gap-3 ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} mb-4`}>
                                Distribution <span className="jersey-20-regular text-xs sm:text-sm text-slate-500">Breakdown</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <AllocationItem
                                    label="Presale"
                                    percentage={15}
                                    description="Public & whitelist — 15M NUX"
                                    color="bg-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                                    index={0}
                                    isHovered={hoveredIndex === 0}
                                    onHover={setHoveredIndex}
                                    isMobile={isMobile}
                                />
                                <AllocationItem
                                    label="Liquidity Pool"
                                    percentage={15}
                                    description="Raydium LP — 15M NUX"
                                    color="bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                    index={1}
                                    isHovered={hoveredIndex === 1}
                                    onHover={setHoveredIndex}
                                    isMobile={isMobile}
                                />
                                <AllocationItem
                                    label="Activity Rewards"
                                    percentage={20}
                                    description="NUX Rewards Hub — Monthly to active users — 20M NUX"
                                    color="bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                    index={2}
                                    isHovered={hoveredIndex === 2}
                                    onHover={setHoveredIndex}
                                    isMobile={isMobile}
                                />
                                <AllocationItem
                                    label="Dev Team"
                                    percentage={15}
                                    description="Core dev & R&D — 15M NUX"
                                    color="bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                                    index={3}
                                    isHovered={hoveredIndex === 3}
                                    onHover={setHoveredIndex}
                                    isMobile={isMobile}
                                />
                                <AllocationItem
                                    label="Marketing & Growth"
                                    percentage={15}
                                    description="Global outreach — 15M NUX"
                                    color="bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                    index={4}
                                    isHovered={hoveredIndex === 4}
                                    onHover={setHoveredIndex}
                                    isMobile={isMobile}
                                />
                                <AllocationItem
                                    label="Ecosystem & Treasury"
                                    percentage={20}
                                    description="Skills, NFTs, AI — 20M NUX"
                                    color="bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                    index={5}
                                    isHovered={hoveredIndex === 5}
                                    onHover={setHoveredIndex}
                                    isMobile={isMobile}
                                />
                            </div>
                        </div>

                        
                    </motion.div>
                </div>

                {/* Polygon Economy Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className={`${isMobile ? 'mt-12' : 'mt-24'}`}
                >
                    <PolygonEconomySection isMobile={isMobile} />
                </motion.div>
            </div>
        </GlobalBackground>
    );
};

// ════════════════════════════════════════════════════════════════════════════════════════
// POLYGON ECONOMY SECTION COMPONENT
// ════════════════════════════════════════════════════════════════════════════════════════

interface EconomyFeature {
    id: string;
    title: string;
    description: string;
    metrics: { label: string; value: string; }[];
    gradient: string;
    icon: string;
}

const PolygonEconomySection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
    const [activeFeature, setActiveFeature] = useState<string>('staking');

    const economyFeatures: EconomyFeature[] = [
        {
            id: 'staking',
            title: 'Smart Staking',
            description: 'Stake POL tokens and earn rewards with skill-based multipliers',
            metrics: [
                { label: 'Platform Fee', value: '6%' },
                { label: 'Base APY', value: 'Dynamic' },
                { label: 'Max Boost', value: '+200%' },
            ],
            gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
            icon: '📈'
        },
        {
            id: 'marketplace',
            title: 'NFT Marketplace',
            description: 'Mint, buy, and sell NFTs with integrated XP and leveling system',
            metrics: [
                { label: 'Platform Fee', value: '6%' },
                { label: 'Royalties', value: 'Customizable' },
                { label: 'Max Level', value: '50' },
            ],
            gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
            icon: '🎨'
        },
        {
            id: 'skills',
            title: 'Skills System',
            description: 'Purchase and activate skills to enhance staking rewards and marketplace features',
            metrics: [
                { label: 'Skill Types', value: '17' },
                { label: 'Rarities', value: '5 Levels' },
                { label: 'Price Range', value: '50-286 POL' },
            ],
            gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
            icon: '⚡'
        },
        {
            id: 'quests',
            title: 'Quest Rewards',
            description: 'Complete quests to earn XP and level up your profile',
            metrics: [
                { label: 'Quest Types', value: '5' },
                { label: 'Max XP/Quest', value: '50,000' },
                { label: 'Duration', value: 'Ongoing' },
            ],
            gradient: 'from-pink-500/20 via-pink-500/10 to-transparent',
            icon: '🎯'
        },
    ];

    const revenueStreams = [
        { source: 'Staking Fees', percentage: 6, description: '6% fee on staking deposits', color: 'bg-purple-500' },
        { source: 'NFT Sales', percentage: 6, description: '6% platform fee on NFT transactions', color: 'bg-blue-500' },
        { source: 'Skills Sales', percentage: 'Variable', description: '50-286 POL per skill (17 types × 5 rarities)', color: 'bg-emerald-500' },
        { source: 'Premium NFTs', percentage: 'Market', description: 'NFTs with pre-applied skills and bonuses', color: 'bg-pink-500' },
    ];

    return (
        <div className="relative">
            {/* Section Header */}
            <div className="text-center mb-10 sm:mb-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 blur-[80px] sm:blur-[100px] rounded-full -z-10" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-block mb-4">
                        <span className={`jersey-15-regular px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 text-blue-300 uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
                            Polygon Network
                        </span>
                    </div>
                    <h2 className={`jersey-15-regular mb-4 text-gradient leading-tight ${isMobile ? 'text-3xl' : 'text-6xl md:text-7xl tracking-tight'}`}>
                        Ecosystem Economy
                    </h2>
                    <p className={`jersey-20-regular text-slate-400 max-w-2xl mx-auto ${isMobile ? 'text-sm px-4' : 'text-xl md:text-2xl'}`}>
                        A comprehensive DeFi and NFT ecosystem on Polygon with staking, marketplace, skills, and gamification
                    </p>
                </motion.div>
            </div>

            {/* Economy Features Grid */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'} mb-12`}>
                {economyFeatures.map((feature, idx) => (
                    <EconomyFeatureCard
                        key={feature.id}
                        feature={feature}
                        isActive={activeFeature === feature.id}
                        onClick={() => setActiveFeature(feature.id)}
                        delay={idx * 0.1}
                        isMobile={isMobile}
                    />
                ))}
            </div>

            {/* Feature Detail Panel */}
            <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`card-unified border-white/20 backdrop-blur-xl mb-12 ${isMobile ? 'p-6' : 'p-8'}`}
            >
                <EconomyDetail featureId={activeFeature} isMobile={isMobile} />
            </motion.div>

            {/* Revenue Streams */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`card-unified border-white/20 backdrop-blur-xl ${isMobile ? 'p-6' : 'p-8'}`}
            >
                <h3 className={`jersey-15-regular text-white mb-6 flex items-center gap-3 ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'}`}>
                    <span className="text-2xl">💰</span> Revenue Streams
                </h3>
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                    {revenueStreams.map((stream, idx) => (
                        <motion.div
                            key={stream.source}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className={`w-1 h-full ${stream.color} rounded-full`} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className={`jersey-15-regular text-white ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>{stream.source}</h4>
                                    <span className={`jersey-20-regular text-emerald-400 ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>{stream.percentage}{typeof stream.percentage === 'number' ? '%' : ''}</span>
                                </div>
                                <p className="jersey-20-regular text-slate-400 text-sm md:text-base">{stream.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════════════════
// ECONOMY FEATURE CARD
// ════════════════════════════════════════════════════════════════════════════════════════

const EconomyFeatureCard: React.FC<{
    feature: EconomyFeature;
    isActive: boolean;
    onClick: () => void;
    delay: number;
    isMobile: boolean;
}> = ({ feature, isActive, onClick, delay, isMobile }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`relative overflow-hidden p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
            isActive
                ? 'bg-white/10 border-white/30 shadow-lg shadow-white/10'
                : 'bg-white/5 border-white/10 hover:bg-white/8'
        }`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`} />
        <div className="relative z-10">
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className={`jersey-15-regular text-white mb-2 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>{feature.title}</h3>
            <p className="jersey-20-regular text-slate-400 text-sm md:text-base mb-4 line-clamp-2">{feature.description}</p>
            <div className="space-y-2">
                {feature.metrics.map((metric, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm md:text-base">
                        <span className="jersey-20-regular text-slate-500">{metric.label}</span>
                        <span className="jersey-15-regular text-white">{metric.value}</span>
                    </div>
                ))}
            </div>
            {/* See more indicator */}
            <div className="mt-4 pt-3 border-t border-white/10">
                <span className="jersey-20-regular text-sm text-purple-400 underline underline-offset-4 decoration-purple-400/50 hover:text-purple-300 hover:decoration-purple-300 transition-colors cursor-pointer">
                    See more...
                </span>
            </div>
        </div>
    </motion.div>
);

// ════════════════════════════════════════════════════════════════════════════════════════
// ECONOMY DETAIL PANEL
// ════════════════════════════════════════════════════════════════════════════════════════

const EconomyDetail: React.FC<{ featureId: string; isMobile: boolean }> = ({ featureId, isMobile }) => {
    const details: Record<string, { title: string; items: { icon: string; title: string; description: string; }[] }> = {
        staking: {
            title: 'Smart Staking Features',
            items: [
                { icon: '🔒', title: 'Flexible Lockup', description: 'Stake with customizable lockup durations for higher rewards' },
                { icon: '⚡', title: 'Skill Multipliers', description: 'Activate staking skills to boost rewards up to 200%' },
                { icon: '🔄', title: 'Auto-Compound', description: 'Enable auto-compounding skill for passive growth' },
                { icon: '💎', title: 'Fee Reduction', description: 'Reduce platform fees with premium skills' },
            ]
        },
        marketplace: {
            title: 'NFT Marketplace Features',
            items: [
                { icon: '🎨', title: 'NFT Minting', description: 'Create and mint unique NFTs with metadata and royalties' },
                { icon: '💰', title: 'Buy & Sell', description: 'Trade NFTs with 6% platform fee on all transactions' },
                { icon: '⭐', title: 'XP & Leveling', description: 'Earn XP from activities and level up to unlock features' },
                { icon: '🏆', title: 'Premium NFTs', description: 'Special NFTs with pre-applied skills and bonuses' },
            ]
        },
        skills: {
            title: 'Skills System Overview',
            items: [
                { icon: '📊', title: '17 Skill Types', description: '7 Staking Skills + 10 Active Skills for diverse strategies' },
                { icon: '🌟', title: '5 Rarity Tiers', description: 'Common (50 POL) to Legendary (286 POL)' },
                { icon: '⏰', title: '30-Day Duration', description: 'All skills expire after 30 days and can be renewed' },
                { icon: '🎁', title: 'Transferable', description: 'Gift skills to other users within the ecosystem' },
            ]
        },
        quests: {
            title: 'Quest & Rewards System',
            items: [
                { icon: '🛒', title: 'Purchase Quests', description: 'Buy NFTs to complete trading quests' },
                { icon: '✨', title: 'Creation Quests', description: 'Mint NFTs to unlock creator achievements' },
                { icon: '❤️', title: 'Social Quests', description: 'Like and comment to build community engagement' },
                { icon: '📈', title: 'Level Up Quests', description: 'Reach milestones to earn bonus XP' },
            ]
        },
    };

    const detail = details[featureId];

    return (
        <div>
            <h3 className={`jersey-15-regular text-white mb-6 ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>{detail.title}</h3>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                {detail.items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                        <div className="text-2xl shrink-0">{item.icon}</div>
                        <div>
                            <h4 className={`jersey-15-regular text-white mb-1 ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>{item.title}</h4>
                            <p className="jersey-20-regular text-slate-400 text-sm md:text-base">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const TokenInfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; gradient: string }> = ({ icon, title, value, gradient }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className={`relative overflow-hidden card-unified p-5 flex flex-col gap-3 group bg-gradient-to-br ${gradient} border-white/10`}
    >
        <div className="p-3 rounded-2xl bg-white/5 text-white group-hover:bg-white/10 transition-colors w-fit">
            {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: 'w-6 h-6' })}
        </div>
        <div>
            <p className="jersey-20-regular text-slate-400 text-xs uppercase tracking-widest">{title}</p>
            <p className="jersey-15-regular text-white text-xl md:text-2xl">{value}</p>
        </div>
    </motion.div>
);

const AllocationItem: React.FC<{ label: string; percentage: number; description: string; color: string; index: number; isHovered: boolean; onHover: (index: number | null) => void; isMobile: boolean }> = ({ label, percentage, description, color, index, isHovered, onHover, isMobile }) => (
    <motion.div 
        className={`space-y-2 p-3 sm:p-4 rounded-xl transition-all cursor-pointer border ${isHovered ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'}`}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
        whileHover={{ scale: 1.02, y: -2 }}
        title={`${label}: ${percentage}% - ${description}`}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                <span className={`jersey-15-regular block leading-tight mb-1 ${isMobile ? 'text-sm' : 'text-base md:text-lg'} ${isHovered ? 'text-white' : 'text-slate-200'}`}>{label}</span>
                <span className={`jersey-20-regular ${isMobile ? 'text-xs' : 'text-sm'} ${isHovered ? 'text-slate-300' : 'text-slate-400'} truncate block`}>{description}</span>
            </div>
            <motion.span 
                className={`jersey-15-regular text-white leading-none ml-2 ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}
                animate={{ scale: isHovered ? 1.15 : 1 }}
            >
                {percentage}%
            </motion.span>
        </div>
        <div className="w-full bg-slate-800/50 h-2.5 md:h-3 rounded-full overflow-hidden border border-white/5 p-[2px]">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`h-full rounded-full ${color}`}
                animate={{ 
                    filter: isHovered ? 'brightness(1.4) saturate(1.2)' : 'brightness(1)',
                    scale: isHovered ? 1.02 : 1,
                }}
            />
        </div>
    </motion.div>
);

export default Tokenomics;
