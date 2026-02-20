/**
 * AIAnalysisOverview - Componente de vista general del análisis
 * Muestra score, breakdown y recomendaciones principales
 */

import React from 'react';
import { useAIAnalysis, useAIWalletBalance } from './useAIAnalysis';
import { apyToPercentage } from '../../../hooks/ai/useContractConstants';

const AIAnalysisOverview: React.FC = () => {
  const { 
    analysis,
    isMobile,
    getScoreLevelColor,
    getPriorityColor,
    getCategoryIcon,
    constants,
  } = useAIAnalysis();

  const { balance, recommendations: balanceRecs, opportunityScore } = useAIWalletBalance();

  // Real APY rates from contract (basis points -> %)
  const apyRates = {
    flexible: apyToPercentage(constants.apyRates.flexible),
    locked30: apyToPercentage(constants.apyRates.locked30),
    locked90: apyToPercentage(constants.apyRates.locked90),
    locked180: apyToPercentage(constants.apyRates.locked180),
    locked365: apyToPercentage(constants.apyRates.locked365),
  };

  const { overallScore, recommendations } = analysis;

  return (
    <>
      {/* Enhanced Score Card */}
      <div className="card-unified p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className={`relative grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'}`}>
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center">
            <div className={`relative w-${isMobile ? '40' : '48'} h-${isMobile ? '40' : '48'}`}>
              {/* Outer ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`text-transparent bg-gradient-to-r ${getScoreLevelColor(overallScore.scoreLevel)}`}
                  strokeWidth="8"
                  strokeDasharray={`${overallScore.overallScore * 2.64} 264`}
                  strokeLinecap="round"
                  stroke="url(#scoreGradient)"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`jersey-20-regular ${isMobile ? 'text-4xl' : 'text-5xl'} font-black text-white`}>
                  {overallScore.overallScore}
                </span>
                <span className="jersey-20-regular text-slate-400 text-base mt-1">/ 100</span>
              </div>
            </div>
            
            {/* Level badge */}
            <div className={`jersey-20-regular mt-4 px-4 py-2 rounded-full bg-gradient-to-r ${getScoreLevelColor(overallScore.scoreLevel)} text-white font-bold text-lg shadow-lg`}>
              {overallScore.scoreLevel} Staker
            </div>
            
            {/* Percentile */}
            {overallScore.percentile && (
              <p className="jersey-20-regular mt-2 text-slate-400 text-base">
                Top {100 - overallScore.percentile}% of all stakers
              </p>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="space-y-4">
            {/* Enhanced APY */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="jersey-20-regular text-slate-400 text-base">Enhanced APY</span>
                <span className="jersey-20-regular text-2xl font-bold text-green-400">
                  {analysis.enhancedAPY.toFixed(1)}%
                </span>
              </div>
              {analysis.skillAnalysis && analysis.skillAnalysis.totalSkillBoost > 0 && (
                <p className="jersey-20-regular text-sm text-green-400/60 mt-1">
                  +{(analysis.enhancedAPY - parseFloat(String(analysis.overallScore.breakdown.rewardsScore || '0'))).toFixed(1)}% from skills
                </p>
              )}
            </div>

            {/* Active Skills */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="jersey-20-regular text-slate-400 text-base">Active Skills</span>
                <span className="jersey-20-regular text-2xl font-bold text-purple-400">
                  {analysis.skillAnalysis?.activeSkills || 0}
                </span>
              </div>
              <p className="jersey-20-regular text-sm text-purple-400/60 mt-1">
                +{analysis.skillAnalysis?.totalSkillBoost || 0}% total boost
              </p>
            </div>

            {/* Level Progress */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/5 border border-pink-500/20">
              <div className="flex items-center justify-between">
                <span className="jersey-20-regular text-slate-400 text-base">Level</span>
                <span className="jersey-20-regular text-2xl font-bold text-pink-400">
                  {analysis.gamificationAnalysis?.levelProgress.currentLevel || 0}
                </span>
              </div>
              <p className="jersey-20-regular text-sm text-pink-400/60 mt-1">
                {analysis.gamificationAnalysis?.levelProgress.xpProgress.toFixed(0) || 0}% to next level
              </p>
            </div>

            {/* Portfolio Score */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="jersey-20-regular text-slate-400 text-base">Portfolio Health</span>
                <span className="jersey-20-regular text-2xl font-bold text-blue-400">
                  {analysis.portfolioAnalysis?.diversificationScore || 0}
                </span>
              </div>
              <p className="jersey-20-regular text-sm text-blue-400/60 mt-1">
                {analysis.portfolioAnalysis?.riskLevel || 'N/A'} risk level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Opportunity Card */}
      {balance.canStake && opportunityScore > 20 && (
        <div className="card-unified p-6 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className={`jersey-15-regular font-bold text-white flex items-center gap-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              <span>💰</span> Staking Opportunity
            </h3>
            <div className="flex items-center gap-2">
              <span className="jersey-20-regular text-sm text-slate-400">Opportunity Score</span>
              <span className={`jersey-20-regular px-3 py-1 rounded-full text-base font-bold ${
                opportunityScore >= 70 ? 'bg-green-500/20 text-green-400' :
                opportunityScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {opportunityScore}/100
              </span>
            </div>
          </div>

          {/* Wallet balance summary */}
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3 mb-5`}>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-emerald-500/20">
              <p className={`jersey-20-regular text-slate-400 mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>Wallet Balance</p>
              <p className={`jersey-20-regular font-bold text-emerald-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{balance.balanceFormatted.toFixed(2)}</p>
              <p className={`jersey-20-regular text-slate-500 ${isMobile ? 'text-sm' : 'text-base'}`}>{balance.symbol}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-blue-500/20">
              <p className={`jersey-20-regular text-slate-400 mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>Available to Stake</p>
              <p className={`jersey-20-regular font-bold text-blue-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{balance.availableForStaking.toFixed(2)}</p>
              <p className={`jersey-20-regular text-slate-500 ${isMobile ? 'text-sm' : 'text-base'}`}>after gas reserve</p>
            </div>
            {!isMobile && (
              <div className="bg-white/5 rounded-xl p-4 text-center border border-purple-500/20">
                <p className="jersey-20-regular text-slate-400 mb-1 text-lg">Max Monthly Yield</p>
                <p className="jersey-20-regular text-3xl font-bold text-purple-400">
                  +{((balance.availableForStaking * apyRates.locked365) / 100 / 12).toFixed(2)}
                </p>
                <p className="jersey-20-regular text-slate-500 text-base">at {apyRates.locked365.toFixed(1)}% APY</p>
              </div>
            )}
          </div>

          {/* APY Tiers Table */}
          <div className="mb-5">
            <p className="jersey-15-regular text-white font-bold text-xl mb-3">Live APY Rates from Contract</p>
            <div className="space-y-2">
              {(() => {
                const tiers = [
                  { label: 'Flexible',    days: 0,   apy: apyRates.flexible,  barColor: '#22c55e', textColor: '#4ade80' },
                  { label: '30-Day Lock', days: 30,  apy: apyRates.locked30,  barColor: '#3b82f6', textColor: '#60a5fa' },
                  { label: '90-Day Lock', days: 90,  apy: apyRates.locked90,  barColor: '#eab308', textColor: '#facc15' },
                  { label: '180-Day Lock',days: 180, apy: apyRates.locked180, barColor: '#f97316', textColor: '#fb923c' },
                  { label: '365-Day Lock',days: 365, apy: apyRates.locked365, barColor: '#ef4444', textColor: '#f87171' },
                ];
                const maxApy = Math.max(...tiers.map(t => t.apy), 1);
                return tiers.map((tier) => {
                  const barPct = Math.round((tier.apy / maxApy) * 100);
                  const monthlyYield = (balance.availableForStaking * tier.apy) / 100 / 12;
                  return (
                    <div key={tier.days} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      {/* Label */}
                      <div className={`flex-shrink-0 ${isMobile ? 'w-24' : 'w-32'}`}>
                        <p className={`jersey-20-regular text-slate-200 font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>{tier.label}</p>
                      </div>
                      {/* Progress bar */}
                      <div className="flex-1">
                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${barPct}%`, backgroundColor: tier.barColor }}
                          />
                        </div>
                      </div>
                      {/* APY */}
                      <div className={`text-right flex-shrink-0 ${isMobile ? 'w-24' : 'w-32'}`}>
                        <span
                          className={`jersey-20-regular font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}
                          style={{ color: tier.textColor }}
                        >
                          {tier.apy.toFixed(1)}% APY
                        </span>
                      </div>
                      {/* Monthly yield — desktop only */}
                      {!isMobile && (
                        <div className="text-right flex-shrink-0 w-36">
                          <span className="jersey-20-regular text-slate-400 text-base">+{monthlyYield.toFixed(2)} POL/mo</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Top Recommendation */}
          {balanceRecs.length > 0 && (
            <div className={`p-4 rounded-xl border ${
              balanceRecs[0].priority === 'high' ? 'border-green-500/30 bg-green-500/5' :
              balanceRecs[0].priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
              'border-blue-500/30 bg-blue-500/5'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {balanceRecs[0].action === 'stake' ? '📈' : balanceRecs[0].action === 'add-funds' ? '💳' : '⏳'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                    <h4 className="jersey-15-regular font-bold text-white text-xl">
                      {balanceRecs[0].action === 'stake' ? 'AI Recommended Stake' : 'Action Needed'}
                    </h4>
                    {balanceRecs[0].expectedAPY > 0 && (
                      <span className="jersey-20-regular text-emerald-400 font-bold text-lg">{balanceRecs[0].expectedAPY.toFixed(1)}% APY</span>
                    )}
                  </div>
                  <p className="jersey-20-regular text-slate-400 text-base mb-3">{balanceRecs[0].reasoning}</p>
                  {balanceRecs[0].suggestedAmount > 0 && (
                    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="jersey-20-regular text-slate-500 text-xs">Amount</p>
                        <p className="jersey-20-regular text-white font-bold text-base">{balanceRecs[0].suggestedAmount.toFixed(2)} POL</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="jersey-20-regular text-slate-500 text-xs">Lock Period</p>
                        <p className="jersey-20-regular text-white font-bold text-base">{balanceRecs[0].suggestedLockup === 0 ? 'Flexible' : `${balanceRecs[0].suggestedLockup} days`}</p>
                      </div>
                      {balanceRecs[0].projectedMonthlyReward > 0 && (
                        <div className="bg-emerald-500/10 rounded-lg p-2 text-center border border-emerald-500/20">
                          <p className="jersey-20-regular text-slate-500 text-xs">Monthly Yield</p>
                          <p className="jersey-20-regular text-emerald-400 font-bold text-base">+{balanceRecs[0].projectedMonthlyReward.toFixed(2)} POL</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All recommendations */}
          {balanceRecs.length > 1 && (
            <div className="mt-3 space-y-2">
              <p className="jersey-20-regular text-slate-500 text-sm">Other opportunities:</p>
              {balanceRecs.slice(1, 3).map((rec, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/8">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{rec.suggestedLockup === 0 ? '🟢' : rec.suggestedLockup <= 30 ? '🔵' : rec.suggestedLockup <= 90 ? '🟡' : rec.suggestedLockup <= 180 ? '🟠' : '🔴'}</span>
                    <div>
                      <p className="jersey-20-regular text-slate-300 text-sm">{rec.suggestedLockup === 0 ? 'Flexible' : `${rec.suggestedLockup}-day lock`} — {rec.suggestedAmount.toFixed(0)} POL</p>
                      <p className="jersey-20-regular text-slate-500 text-xs">{rec.reasoning.slice(0, 60)}...</p>
                    </div>
                  </div>
                  <span className={`jersey-20-regular font-bold text-sm flex-shrink-0 ${
                    rec.expectedAPY >= apyRates.locked180 ? 'text-orange-400' :
                    rec.expectedAPY >= apyRates.locked90 ? 'text-yellow-400' :
                    rec.expectedAPY >= apyRates.locked30 ? 'text-blue-400' : 'text-green-400'
                  }`}>{rec.expectedAPY.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Low Balance Alert */}
      {!balance.canStake && balance.balanceFormatted > 0 && (
        <div className="card-unified p-4 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="jersey-15-regular font-bold text-orange-400 text-xl">Low Wallet Balance</h4>
              <p className="jersey-20-regular text-slate-400 text-base">
                You have {balance.balanceFormatted.toFixed(4)} {balance.symbol}. Need at least 5 POL to stake. 
                Add {(5 - balance.availableForStaking).toFixed(2)} more POL to start earning rewards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score Breakdown — Donut Chart */}
      {(() => {
        const METRICS = [
          {
            key: 'amountScore',
            label: 'Amount Score',
            color: '#f97316',
            description: 'Based on total POL staked. Higher stakes earn more rewards and signal long-term commitment.',
          },
          {
            key: 'consistencyScore',
            label: 'Consistency Score',
            color: '#3b82f6',
            description: 'Measures how regularly you stake and claim rewards. Consistent activity boosts your ranking.',
          },
          {
            key: 'rewardsScore',
            label: 'Rewards Score',
            color: '#8b5cf6',
            description: 'Reflects pending and claimed rewards relative to your stake. Claim regularly to maximize.',
          },
          {
            key: 'diversificationScore',
            label: 'Diversification Score',
            color: '#22c55e',
            description: 'Rewards spreading funds across multiple lockup periods (flexible, 30d, 90d, 180d, 365d).',
          },
          {
            key: 'engagementScore',
            label: 'Engagement Score',
            color: '#ec4899',
            description: 'Tracks platform activity: quests, achievements, skills, and NFT interactions.',
          },
        ];

        const segments = METRICS.map((m) => {
          const raw = overallScore.breakdown[m.key as keyof typeof overallScore.breakdown];
          const val = isFinite(Number(raw)) ? Number(raw) : 0;
          return { ...m, value: val };
        });

        const total = segments.reduce((s, m) => s + m.value, 0);
        const maxTotal = 125; // 5 × 25

        // SVG donut params
        const R = 95;
        const cx = 120;
        const cy = 120;
        const strokeW = 22;
        const gap = 3; // degrees gap between segments

        // Build arc segments
        let currentAngle = -90; // start at top
        const arcs = segments.map((seg) => {
          const pct = total > 0 ? seg.value / maxTotal : 0;
          const degrees = pct * 360 - gap;
          const startAngle = currentAngle + gap / 2;
          currentAngle += pct * 360;

          const toRad = (d: number) => (d * Math.PI) / 180;
          const x1 = cx + R * Math.cos(toRad(startAngle));
          const y1 = cy + R * Math.sin(toRad(startAngle));
          const endAngle = startAngle + degrees;
          const x2 = cx + R * Math.cos(toRad(endAngle));
          const y2 = cy + R * Math.sin(toRad(endAngle));
          const largeArc = degrees > 180 ? 1 : 0;

          const pathD = degrees > 0
            ? `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`
            : '';

          return { ...seg, pathD };
        });

        const scorePct = Math.round((total / maxTotal) * 100);

        return (
          <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`jersey-15-regular font-bold text-white flex items-center gap-2 ${isMobile ? 'text-2xl mb-4' : 'text-3xl mb-6'}`}>
              <span>📊</span> Score Breakdown
            </h3>

            <div className={`flex ${isMobile ? 'flex-col items-center gap-6' : 'flex-row items-center gap-8'}`}>

              {/* Donut Chart */}
              <div className="flex-shrink-0 relative">
                <svg width="240" height="240" viewBox="0 0 240 240">
                  {/* Background ring */}
                  <circle
                    cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeW}
                  />
                  {/* Segments */}
                  {arcs.map((arc) =>
                    arc.pathD ? (
                      <path
                        key={arc.key}
                        d={arc.pathD}
                        fill="none"
                        stroke={arc.color}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 4px ${arc.color}60)` }}
                      />
                    ) : null
                  )}
                  {/* Center text */}
                  <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="inherit">
                    {total.toFixed(0)}
                  </text>
                  <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="inherit">
                    / {maxTotal} pts
                  </text>
                  <text x={cx} y={cy + 26} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="inherit">
                    {scorePct}% overall
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-3">
                {segments.map((seg) => {
                  const pct = Math.round((seg.value / 25) * 100);
                  return (
                    <div key={seg.key} className="flex items-start gap-3 group">
                      {/* Color dot + bar */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}80` }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Label row */}
                        <div className="flex items-center justify-between mb-1">
                          <span className={`jersey-20-regular font-bold text-slate-200 ${isMobile ? 'text-base' : 'text-lg'}`}>
                            {seg.label}
                          </span>
                          <span
                            className={`jersey-20-regular font-bold flex-shrink-0 ml-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                            style={{ color: seg.color }}
                          >
                            {seg.value.toFixed(1)}<span className="text-slate-500 font-normal">/25</span>
                          </span>
                        </div>
                        {/* Mini bar */}
                        <div className="w-full bg-slate-700/40 rounded-full h-1.5 mb-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: seg.color }}
                          />
                        </div>
                        {/* Description */}
                        <p className={`jersey-20-regular text-slate-500 leading-snug ${isMobile ? 'text-sm' : 'text-base'}`}>
                          {seg.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Recommendations */}
      <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}>
        <h3 className={`jersey-15-regular font-bold text-white flex items-center gap-2 ${isMobile ? 'text-2xl mb-4' : 'text-3xl mb-6'}`}>
          <span>🎯</span> Smart Recommendations
        </h3>
        
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="jersey-15-regular font-bold text-white text-lg truncate">{rec.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="jersey-20-regular text-slate-400 text-base line-clamp-2">{rec.description}</p>
                  {rec.impact && (
                    <p className="jersey-20-regular text-sm mt-2 text-green-400 font-medium">
                      Impact: {rec.impact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl">🎉</span>
            <p className="jersey-20-regular text-slate-400 text-lg mt-2">
              Great job! You're following best practices.
            </p>
          </div>
        )}
      </div>

      {/* Improvement Areas */}
      {overallScore.improvements.length > 0 && (
        <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'} border-orange-500/20`}>
          <h3 className={`jersey-15-regular font-bold text-white mb-4 flex items-center gap-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            <span>🚀</span> Areas for Growth
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 gap-3'}`}>
            {overallScore.improvements.map((improvement: string, idx: number) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
              >
                <span className="text-orange-400">💡</span>
                <span className="jersey-20-regular text-slate-300 text-base">{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAnalysisOverview;
