import React from 'react';
import { motion } from 'framer-motion';
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

    const data = {
        labels: ['Community & Ecosystem', 'Dev Team', 'Marketing', 'Staking Rewards'],
        datasets: [
            {
                label: 'Token Distribution',
                data: [55, 20, 15, 10],
                backgroundColor: [
                    'rgba(168, 85, 247, 0.7)', // Purple
                    'rgba(59, 130, 246, 0.7)', // Blue
                    'rgba(236, 72, 153, 0.7)', // Pink
                    'rgba(34, 197, 94, 0.7)',  // Green
                ],
                borderColor: [
                    'rgba(168, 85, 247, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(34, 197, 94, 1)',
                ],
                borderWidth: 2,
                hoverOffset: 15,
                spacing: 5,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        hover: {
            mode: 'nearest',
            intersect: true
        },
        plugins: {
            legend: {
                display: false, // Using custom legend
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.parsed}%`,
                },
            },
        },
        cutout: '75%',
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
                    <h1 className={`font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent leading-tight ${isMobile ? 'text-3xl' : 'text-6xl tracking-tight'}`}>
                        Tokenomics
                    </h1>
                    <p className={`text-slate-400 max-w-2xl mx-auto font-medium ${isMobile ? 'text-xs px-2' : 'text-lg'}`}>
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
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-blue-500/5 blur-3xl rounded-full scale-110" />

                            <Doughnut data={data} options={options} />

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className={`text-slate-500 font-bold uppercase tracking-[0.2em] mb-1 ${isMobile ? 'text-[8px]' : 'text-xs'}`}
                                >
                                    Total Supply
                                </motion.span>
                                <span className={`font-black text-white leading-none ${isMobile ? 'text-xl' : 'text-4xl'}`}>
                                    1,000,000,000
                                </span>
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold mt-1 ${isMobile ? 'text-[10px]' : 'text-xl'}`}>
                                    $NUX TOKENS
                                </span>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <div className={`grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[500px] ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                            {data.labels.map((label, idx) => (
                                <div key={idx} className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }} />
                                    <span className="text-slate-300 font-semibold truncate">{label}</span>
                                </div>
                            ))}
                        </div>
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
                            <TokenInfoCard icon={<CpuIcon />} title="Supply Cap" value="1B Fixed" gradient="from-pink-500/20 to-transparent" />
                        </div>

                        {/* Allocation Progress Bars */}
                        <div className={`card-unified relative overflow-hidden backdrop-blur-xl border-white/20 ${isMobile ? 'p-5 py-6' : 'p-8'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />
                            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-black text-white tracking-tight flex items-center gap-2 sm:gap-3`}>
                                Distribution <span className="text-xs sm:text-sm font-normal text-slate-500">Breakdown</span>
                            </h3>

                            <div className={`space-y-5 sm:y-6 ${isMobile ? 'mt-6' : 'mt-8'}`}>
                                <AllocationItem
                                    label="Community & Ecosystem"
                                    percentage={55}
                                    description="Airdrops, LP, User Rewards & NFTs"
                                    color="bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                />
                                <AllocationItem
                                    label="Dev Team"
                                    percentage={20}
                                    description="Core dev, R&D and platform growth"
                                    color="bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                />
                                <AllocationItem
                                    label="Marketing & Growth"
                                    percentage={15}
                                    description="Global outreach and partnerships"
                                    color="bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                                />
                                <AllocationItem
                                    label="Staking Rewards"
                                    percentage={10}
                                    description="Inflationary rewards for stakers"
                                    color="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                />
                            </div>
                        </div>

                        {/* CTA Box */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`rounded-3xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/20 flex flex-col items-center gap-3 sm:gap-4 text-center cursor-pointer ${isMobile ? 'p-5' : 'p-6'}`}
                            onClick={() => window.open('https://t.me/+ESghwuU2rCpiNmI5', '_blank')}
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <ZapIcon className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase text-xs sm:text-sm tracking-wider">Ready for the Airdrop?</h4>
                                <p className="text-slate-400 text-[10px] sm:text-xs">Join our community to stay updated on $NUX launch events.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </GlobalBackground>
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
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{title}</p>
            <p className="text-white font-black text-lg">{value}</p>
        </div>
    </motion.div>
);

const AllocationItem: React.FC<{ label: string; percentage: number; description: string; color: string }> = ({ label, percentage, description, color }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-end">
            <div>
                <span className="text-slate-200 font-bold block leading-none mb-1">{label}</span>
                <span className="text-slate-500 text-[11px] font-medium">{description}</span>
            </div>
            <span className="text-white font-black text-xl leading-none">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-white/5 p-[2px]">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`h-full rounded-full ${color}`}
            />
        </div>
    </div>
);

export default Tokenomics;
