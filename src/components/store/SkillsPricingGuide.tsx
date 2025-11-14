import React from 'react';
import { motion } from 'framer-motion';
import { PRICING_TIERS } from './pricing-config';

export const SkillsPricingGuide: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto mb-12"
    >
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">💰 Pricing Guide</h3>
          <p className="text-gray-400">
            Staking skills have base pricing, Active skills include 30% markup
          </p>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-4 pr-4 text-gray-300 font-semibold">Rarity</th>
                <th className="pb-4 px-4 text-gray-300 font-semibold text-center">Staking Skills</th>
                <th className="pb-4 px-4 text-gray-300 font-semibold text-center">Active Skills</th>
                <th className="pb-4 pl-4 text-gray-300 font-semibold text-center">Markup</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TIERS.map((tier, index) => (
                <motion.tr
                  key={tier.rarity}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-800 last:border-0"
                >
                  {/* Rarity */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: tier.color }}
                      >
                        {tier.rarityName}
                      </span>
                    </div>
                  </td>

                  {/* Staking Price */}
                  <td className="py-4 px-4 text-center">
                    <span className="text-white font-bold text-lg">
                      {tier.stakingPrice} POL
                    </span>
                  </td>

                  {/* Active Price */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-orange-400 font-bold text-lg">
                        {tier.activePrice} POL
                      </span>
                      <span className="text-xs text-gray-500">
                        +{tier.markup}%
                      </span>
                    </div>
                  </td>

                  {/* Markup Badge */}
                  <td className="py-4 pl-4 text-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 font-semibold text-sm"
                    >
                      +{tier.markup}%
                    </motion.span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⛓️</span>
            <div>
              <h4 className="text-white font-semibold mb-1">Staking Skills (Types 1-7)</h4>
              <p className="text-sm text-gray-400">
                Boost your staking rewards and reduce fees
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h4 className="text-white font-semibold mb-1">Renewal Discount</h4>
              <p className="text-sm text-gray-400">
                Renew expired skills for 50% of original price
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
