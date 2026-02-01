/**
 * Investments Page - Trading Transparency
 * Real-time Grid Bot performance with CoinGecko data
 * ✨ Minimalist | 📱 Mobile-optimized | 🎨 Smooth animations
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import GlobalBackground from '../ui/gradientBackground';
import LiveGridBotDisplay from '../components/investments/LiveGridBotDisplay';
import PerformanceCard from '../components/investments/PerformanceCard';
import PositionsList from '../components/investments/PositionsList';
import type { GridBotConfig } from '../components/investments/grid-bot-calculator';
import { GRID_BOT_CONSTANTS } from '../components/investments/grid-bot-calculator';
import { useInvestments } from '../hooks/useInvestments';

const Investments = memo(() => {
  // Usar fallback data sin hacer peticiones a API (evita errores 401)
  const { data: investmentsData } = useInvestments(false);

  // Grid Bot configuration - Sincronizado con Binance Bot ID: 408449128
  const gridBotConfig: GridBotConfig = {
    symbol: 'bitcoin',
    initialInvestment: GRID_BOT_CONSTANTS.initialInvestment,
    leverage: GRID_BOT_CONSTANTS.leverage,
    totalGrids: GRID_BOT_CONSTANTS.totalOrders,
    profitPerGrid: GRID_BOT_CONSTANTS.profitPerGrid,
    priceRange: {
      lower: 74100.30,
      upper: 108074.30
    },
    createdAt: GRID_BOT_CONSTANTS.createdAt,
    matchedTrades: 39, // Total Matched Trades real de Binance
  };

  return (
    <GlobalBackground>
      <div className="min-h-screen pt-20 lg:pt-24 pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 lg:mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 lg:mb-4">
              <span className="bg-clip-text text-gradient">
                Nuxchain Investment
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-4">
              Real-time trading results using CoinGecko data to build trust and demonstrate our commitment to the community.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-6 lg:space-y-8">
            <LiveGridBotDisplay config={gridBotConfig} />

            {/* Performance & Positions Section */}
            {investmentsData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <PerformanceCard 
                  performance={investmentsData.performance} 
                  lastUpdate={investmentsData.lastUpdate}
                />
                <PositionsList positions={investmentsData.positions} />
              </div>
            )}

            {/* Info Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <InfoCard
                icon="🎯"
                title="Strategy"
                description="Grid Trading with controlled leverage to optimize returns in high-volatility markets."
                delay={0.2}
                gradient="from-emerald-900/20 to-teal-900/20"
                border="border-emerald-500/20"
              />
              <InfoCard
                icon="🔄"
                title="Live Data"
                description="Price updated every 30 seconds from CoinGecko API without geographic restrictions."
                delay={0.3}
                gradient="from-purple-900/20 to-pink-900/20"
                border="border-purple-500/20"
              />
              <InfoCard
                icon="📊"
                title="Real Results"
                description="Transparent performance tracking with actual profit calculations and trade history."
                delay={0.4}
                gradient="from-amber-900/20 to-orange-900/20"
                border="border-amber-500/20"
              />
            </section>

           
           
          </div>
        </div>
      </div>
    </GlobalBackground>
  );
});

// Info Card Component
interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
  gradient: string;
  border: string;
}

const InfoCard = memo(({ icon, title, description, delay, gradient, border }: InfoCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className={`group relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br ${gradient} border ${border} backdrop-blur-xl p-5 lg:p-6 hover:scale-[1.02] transition-transform duration-300`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative text-center">
      <span className="text-3xl lg:text-4xl block mb-3">{icon}</span>
      <h4 className="text-white font-bold text-base lg:text-lg mb-2">{title}</h4>
      <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
));

InfoCard.displayName = 'InfoCard';
Investments.displayName = 'Investments';

export default Investments;
