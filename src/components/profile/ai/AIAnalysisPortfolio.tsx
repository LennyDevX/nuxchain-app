/**
 * AIAnalysisPortfolio - Portfolio analysis with minimal professional UI
 * Displays diversification, risk levels, and rebalancing suggestions
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useAIPortfolioData } from './useAIAnalysis';
import { LineChartIcon, BarChart3Icon, CheckIcon, LockIcon } from '../../ui/CustomIcons';
import type { RebalancingSuggestion, BalanceRecommendation } from '../../../utils/ai/portfolioAnalyzer';

// Minimal stat card
const StatCard = memo(({ 
  label, 
  value, 
  unit, 
  color, 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  color: string; 
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      {unit && <span className="text-xs text-slate-500">{unit}</span>}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

// Risk level indicator
const RiskIndicator = memo(({ level }: { level: 'Low' | 'Medium' | 'High' }) => {
  const config = {
    Low: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    High: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  };
  
  const cfg = config[level];
  return (
    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
      {level} Risk
    </div>
  );
});
RiskIndicator.displayName = 'RiskIndicator';

// Distribution mini chart
const DistributionMini = memo(({ distribution }: {
  distribution: { flexible: number; short: number; medium: number; long: number };
}) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const items = [
    { name: 'Flex', value: distribution.flexible, color: '#22c55e' },
    { name: '30d', value: distribution.short, color: '#3b82f6' },
    { name: '90d', value: distribution.medium, color: '#f59e0b' },
    { name: '180+d', value: distribution.long, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.name} className="flex items-center gap-2">
          <div className="w-32">
            <div className="flex justify-between mb-0.5">
              <span className="text-xs text-slate-400">{item.name}</span>
              <span className="text-xs font-medium text-slate-300">{((item.value / total) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700/30 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ backgroundColor: item.color, width: `${(item.value / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
DistributionMini.displayName = 'DistributionMini';

// Rebalancing suggestion item
const RebalancingItem = memo(({ suggestion }: { suggestion: RebalancingSuggestion }) => {
  const getIcon = () => {
    switch (suggestion.action) {
      case 'add': return <span className="text-green-400 text-sm">▲</span>;
      case 'reduce': return <span className="text-red-400 text-sm">▼</span>;
      default: return <span className="text-slate-400 text-sm">─</span>;
    }
  };

  const lockupLabel = suggestion.lockupPeriod === 0 ? 'Flexible' : `${suggestion.lockupPeriod}d`;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-300">{lockupLabel}</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">{suggestion.currentPercentage.toFixed(0)}%</span>
            <span className="text-slate-600">→</span>
            <span className={suggestion.action === 'add' ? 'text-green-400' : suggestion.action === 'reduce' ? 'text-red-400' : 'text-slate-400'}>
              {suggestion.targetPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{suggestion.reason}</p>
      </div>
    </div>
  );
});
RebalancingItem.displayName = 'RebalancingItem';

// Main component
export const AIAnalysisPortfolio: React.FC = memo(() => {
  const { portfolioAnalysis, walletBalance, balanceRecommendations, opportunityScore, isLoading } = useAIPortfolioData();

  if (isLoading || !portfolioAnalysis) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3 h-20 animate-pulse" />
          ))}
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 h-40 animate-pulse" />
      </div>
    );
  }

  const { 
    diversificationScore, 
    riskLevel, 
    positionDistribution, 
    weightedAPY, 
    liquidityRatio,
    recommendations,
    rebalancingSuggestions,
    riskMetrics,
  } = portfolioAnalysis;

  return (
    <div className="space-y-4">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            label="Diversification"
            value={diversificationScore}
            unit="/100"
            color={diversificationScore >= 70 ? 'text-green-400' : diversificationScore >= 40 ? 'text-yellow-400' : 'text-red-400'}
            icon={BarChart3Icon}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Risk Level</span>
            </div>
            <RiskIndicator level={riskLevel} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            label="Weighted APY"
            value={weightedAPY.toFixed(1)}
            unit="%"
            color="text-emerald-400"
            icon={LineChartIcon}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            label="Liquidity"
            value={liquidityRatio.toFixed(0)}
            unit="%"
            color={liquidityRatio > 50 ? 'text-blue-400' : 'text-orange-400'}
            icon={LockIcon}
          />
        </motion.div>
      </div>

      {/* Distribution Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3Icon className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-slate-200">Position Distribution</h4>
        </div>
        <DistributionMini distribution={positionDistribution} />
      </motion.div>

      {/* Rebalancing Suggestions */}
      {rebalancingSuggestions && rebalancingSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3Icon className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-200">Rebalancing Suggestions</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {rebalancingSuggestions.map((suggestion: RebalancingSuggestion, index: number) => (
              <RebalancingItem key={index} suggestion={suggestion} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk Metrics Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
      >
        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <span>📊</span> Risk Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Concentration Risk</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-red-400/70"
                  style={{ width: `${riskMetrics.concentrationRisk}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300 w-8">{riskMetrics.concentrationRisk}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Lockup Risk</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700/30 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-yellow-400/70"
                  style={{ width: `${riskMetrics.lockupRisk}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-300 w-8">{riskMetrics.lockupRisk}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckIcon className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-slate-200">Optimization Tips</h4>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recommendations.map((rec, index) => (
              <div key={index} className="text-xs p-2 rounded bg-slate-700/30 border border-slate-600/30">
                <p className="text-slate-300 font-medium">{rec.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{rec.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Balance-Based Recommendations */}
      {walletBalance.canStake && balanceRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 rounded-lg p-4 border border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <h4 className="text-sm font-semibold text-slate-200">Investment Opportunities</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Available:</span>
              <span className="text-sm font-bold text-emerald-400">{walletBalance.availableForStaking.toFixed(2)} POL</span>
            </div>
          </div>

          {/* Opportunity Score */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-slate-700/30 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  opportunityScore >= 70 ? 'bg-green-400' :
                  opportunityScore >= 40 ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}
                style={{ width: `${opportunityScore}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-300 w-16">Score: {opportunityScore}</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {balanceRecommendations.map((rec: BalanceRecommendation, index: number) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border transition-all hover:scale-[1.01] ${
                  rec.priority === 'high' ? 'bg-green-500/10 border-green-500/30' :
                  rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">
                        {rec.action === 'stake' ? '📈' : rec.action === 'add-funds' ? '💳' : '⏳'}
                      </span>
                      <span className="text-sm font-medium text-slate-200">
                        {rec.suggestedLockup === 0 ? 'Flexible' : `${rec.suggestedLockup}-day Lock`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        rec.priority === 'high' ? 'bg-green-500/20 text-green-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{rec.reasoning}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{rec.suggestedAmount.toFixed(0)} POL</p>
                    {rec.expectedAPY > 0 && (
                      <p className="text-xs text-slate-500">{rec.expectedAPY.toFixed(1)}% APY</p>
                    )}
                    {rec.projectedMonthlyReward > 0 && (
                      <p className="text-xs text-green-400">+{rec.projectedMonthlyReward.toFixed(2)}/mo</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Low Balance Warning */}
      {!walletBalance.canStake && walletBalance.balanceFormatted > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="text-sm font-semibold text-orange-400">Insufficient Balance</h4>
              <p className="text-xs text-slate-400 mt-1">
                Current: {walletBalance.balanceFormatted.toFixed(4)} POL. 
                Need {(5 - walletBalance.availableForStaking).toFixed(2)} more POL to stake.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
});

AIAnalysisPortfolio.displayName = 'AIAnalysisPortfolio';

export default AIAnalysisPortfolio;