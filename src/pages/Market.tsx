/**
 * Market Page - Optimized
 * Real-time cryptocurrency market data from CoinGecko
 * ✨ Minimalist | 📱 Mobile-first | 🎨 Smooth animations
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import GlobalBackground from '../ui/gradientBackground';
import MarketOverview from '../components/market/MarketOverview';

const Market = memo(() => {

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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500">
                Market Overview
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-4">
              Real-time cryptocurrency market data from CoinGecko API. Updated every 60 seconds.
            </p>
          </motion.div>

          {/* Market Overview */}
          <MarketOverview />

          {/* Info Cards */}
          <section className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <InfoCard
              icon="🔍"
              title="Public Data"
              description="All information comes directly from CoinGecko's public API without authentication requirements."
              delay={0.4}
              gradient="from-emerald-900/20 to-teal-900/20"
              border="border-emerald-500/20"
            />
            <InfoCard
              icon="⚡"
              title="Auto-Update"
              description="Data refreshes automatically every 60 seconds to keep you informed without page reloads."
              delay={0.5}
              gradient="from-purple-900/20 to-pink-900/20"
              border="border-purple-500/20"
            />
            <InfoCard
              icon="🎯"
              title="Informed Decisions"
              description="Use this information to make more informed decisions about your cryptocurrency investments."
              delay={0.6}
              gradient="from-amber-900/20 to-orange-900/20"
              border="border-amber-500/20"
            />
          </section>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 lg:mt-8 rounded-xl lg:rounded-2xl border border-yellow-500/20 bg-yellow-900/10 backdrop-blur-xl p-4 lg:p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-4">
              <span className="text-2xl lg:text-3xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <h3 className="text-yellow-200 font-semibold text-sm lg:text-base mb-2">Important Disclaimer</h3>
                <p className="text-yellow-200/80 text-xs lg:text-sm leading-relaxed">
                  This information is for educational and informational purposes only. It does not constitute financial advice.
                  Always conduct your own research before making investment decisions.
                </p>
              </div>
            </div>
          </motion.div>
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
Market.displayName = 'Market';

export default Market;
