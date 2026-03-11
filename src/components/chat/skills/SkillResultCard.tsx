import { motion } from 'framer-motion';
import { SKILLS } from '../../../constants/subscription';

interface SkillResultCardProps {
  skillId: string;
  status: 'loading' | 'success' | 'error';
  data?: unknown;
  errorMessage?: string;
  onAnalyze?: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function riskColor(level: string): string {
  const l = (level || '').toLowerCase();
  if (l === 'low') return 'bg-green-500/20 text-green-300 border border-green-500/30';
  if (l === 'medium') return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
  if (l === 'high') return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
  if (l === 'critical') return 'bg-red-500/20 text-red-300 border border-red-500/30';
  return 'bg-white/10 text-white/60';
}

function gradeColor(grade: string): string {
  const g = (grade || '').toUpperCase();
  if (g === 'A') return 'bg-green-500/20 text-green-300';
  if (g === 'B') return 'bg-blue-500/20 text-blue-300';
  if (g === 'C') return 'bg-yellow-500/20 text-yellow-300';
  if (g === 'D') return 'bg-orange-500/20 text-orange-300';
  return 'bg-red-500/20 text-red-300';
}

function verdictColor(verdict: string): string {
  const v = (verdict || '').toLowerCase();
  if (v === 'ok') return 'bg-green-500/20 text-green-300 border border-green-500/30';
  if (v === 'spam') return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
  if (v === 'scam' || v === 'harmful') return 'bg-red-500/20 text-red-300 border border-red-500/30';
  return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;
  const color = score <= 30 ? '#22c55e' : score <= 60 ? '#eab308' : score <= 80 ? '#f97316' : '#ef4444';
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">
        {score}
      </text>
    </svg>
  );
}

// ─── Per-skill renderers ─────────────────────────────────────────────────────

function RiskAnalysisCard({ d }: { d: Record<string, unknown> }) {
  const factors = (d.riskFactors as Array<{ category: string; severity: string; description: string; mitigation: string }>) || [];
  const positives = (d.positiveFactors as string[]) || [];
  const recs = (d.recommendations as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <ScoreRing score={d.overallRiskScore as number || 0} />
        <div>
          <p className="text-white font-semibold text-base">{String(d.summary ?? '')}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge label={`Risk: ${String(d.riskLevel ?? '?')}`} color={riskColor(String(d.riskLevel ?? ''))} />
            <Badge label={String(d.investorProfile ?? '')} color="bg-white/10 text-white/60" />
          </div>
        </div>
      </div>
      {factors.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Risk Factors</p>
          <div className="flex flex-col gap-2">
            {factors.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/4 rounded-lg px-3 py-2">
                <Badge label={f.severity} color={riskColor(f.severity)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium">{f.category}: {f.description}</p>
                  {f.mitigation && <p className="text-xs text-white/40 mt-0.5">↳ {f.mitigation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {positives.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Positive Factors</p>
          <div className="flex flex-wrap gap-1.5">
            {positives.map((p, i) => <Badge key={i} label={p} color="bg-green-500/15 text-green-300" />)}
          </div>
        </div>
      )}
      {recs.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Recommendations</p>
          <ul className="space-y-1">
            {recs.map((r, i) => <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-purple-400">→</span>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function NftListingCard({ d }: { d: Record<string, unknown> }) {
  const tags = (d.tags as string[]) || [];
  const angles = (d.copywritingAngles as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-white font-semibold text-base leading-tight">{String(d.title ?? '')}</p>
        {!!d.estimatedRarity && <Badge label={String(d.estimatedRarity)} color="bg-purple-500/20 text-purple-300 border border-purple-500/30" />}
      </div>
      <p className="text-sm text-white/80 leading-relaxed">{String(d.longDescription ?? d.seoDescription ?? '')}</p>
      {!!d.marketingHeadline && (
        <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/8">
          <p className="text-xs text-white/40 mb-1">Marketing headline</p>
          <p className="text-sm text-white/90 font-medium italic">\"{String(d.marketingHeadline)}\"</p>
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => <Badge key={i} label={`#${t}`} color="bg-blue-500/15 text-blue-300" />)}
        </div>
      )}
      {angles.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Copywriting Angles</p>
          <ul className="space-y-1">
            {angles.map((a, i) => <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-yellow-400">✦</span>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function MarketAlphaCard({ d }: { d: Record<string, unknown> }) {
  type Opportunity = { type: string; description: string; timeframe: string; riskReward: string };
  const insights = (d.keyInsights as string[]) || [];
  const opps = (d.opportunities as Opportunity[]) || [];
  const condColor = { Bullish: 'text-green-400', Bearish: 'text-red-400', Neutral: 'text-white/60', Volatile: 'text-orange-400', Accumulation: 'text-blue-400' };
  const mc = String(d.marketCondition ?? '');
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${condColor[mc as keyof typeof condColor] || 'text-white'}`}>{mc}</span>
        {!!d.liquidityHealth && <Badge label={`Liquidity: ${String(d.liquidityHealth)}`} color="bg-white/10 text-white/60" />}
      </div>
      <p className="text-sm text-white/80 italic">\"{String(d.headline ?? '')}\"</p>
      {insights.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Key Insights</p>
          <ul className="space-y-1.5">
            {insights.map((ins, i) => <li key={i} className="text-sm text-white/80 flex gap-2"><span className="text-blue-400 flex-shrink-0">▸</span>{ins}</li>)}
          </ul>
        </div>
      )}
      {opps.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Opportunities</p>
          {opps.slice(0, 3).map((o, i) => (
            <div key={i} className="flex items-start gap-2 mb-2 bg-white/4 rounded-lg px-3 py-2">
              <Badge label={o.type} color="bg-blue-500/20 text-blue-300" />
              <div className="flex-1 text-sm text-white/75">{o.description} <span className="text-white/40">({o.timeframe})</span></div>
              <Badge label={o.riskReward} color={riskColor(o.riskReward)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentModerationCard({ d }: { d: Record<string, unknown> }) {
  const confidence = d.confidence as number || 0;
  const pct = Math.round(confidence * 100);
  const flags = (d.flags as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-3 min-w-[80px]">
          <span className="text-3xl font-bold text-white">{pct}%</span>
          <span className="text-xs text-white/40">confidence</span>
        </div>
        <div>
          <Badge label={String(d.verdict ?? '').toUpperCase()} color={verdictColor(String(d.verdict ?? ''))} />
          <p className="text-sm text-white/70 mt-1.5">{String(d.category ?? '')} — <span className={riskColor(String(d.severity ?? ''))} style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{String(d.severity ?? '')}</span></p>
        </div>
      </div>
      {!!d.reasoning && <p className="text-sm text-white/75 leading-relaxed bg-white/4 rounded-lg px-3 py-2">{String(d.reasoning)}</p>}
      {flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-white/40 self-center">Flags:</span>
          {flags.map((f, i) => <Badge key={i} label={f} color="bg-orange-500/15 text-orange-300" />)}
        </div>
      )}
      {!!d.recommendation && (
        <p className="text-sm text-white/60 font-medium">Recommendation: {String(d.recommendation)}</p>
      )}
    </div>
  );
}

function ContractAuditorCard({ d }: { d: Record<string, unknown> }) {
  type Vuln = { id: string; name: string; severity: string; category: string; description: string };
  const vulns = (d.vulnerabilities as Vuln[]) || [];
  const score = d.securityScore as number || 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <ScoreRing score={score} />
        <div>
          <p className="text-white font-semibold">{String(d.contractName ?? 'Contract')}</p>
          <div className="flex gap-2 mt-1">
            <Badge label={`Risk: ${String(d.overallRisk ?? '?')}`} color={riskColor(String(d.overallRisk ?? ''))} />
            <Badge label={`${vulns.length} vulnerabilities`} color="bg-white/10 text-white/60" />
          </div>
        </div>
      </div>
      {vulns.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Vulnerabilities</p>
          <div className="flex flex-col gap-2">
            {vulns.slice(0, 5).map((v, i) => (
              <div key={i} className="bg-white/4 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge label={v.severity} color={riskColor(v.severity)} />
                  <span className="text-sm text-white/80 font-medium">{v.name}</span>
                  <span className="text-xs text-white/30 ml-auto">{v.id}</span>
                </div>
                <p className="text-xs text-white/50">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WhaleTrackerCard({ d }: { d: Record<string, unknown> }) {
  const patterns = (d.behavioralPatterns as string[]) || [];
  const signals = (d.marketSignals as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge label={String(d.whaleClassification ?? 'Unknown')} color="bg-blue-500/20 text-blue-300 border border-blue-500/30" />
        {!!d.behavioralPattern && <Badge label={String(d.behavioralPattern)} color="bg-purple-500/20 text-purple-300" />}
      </div>
      {!!d.interpretation && <p className="text-sm text-white/80 leading-relaxed">{String(d.interpretation)}</p>}
      {patterns.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Behavioral Patterns</p>
          <ul className="space-y-1">
            {patterns.map((p, i) => <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-blue-400">◆</span>{p}</li>)}
          </ul>
        </div>
      )}
      {signals.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Market Signals</p>
          <ul className="space-y-1">
            {signals.map((s, i) => <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-yellow-400">⚡</span>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function PortfolioAnalyzerCard({ d }: { d: Record<string, unknown> }) {
  const recs = (d.recommendations as string[]) || [];
  const actions = (d.immediateActions as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className={`text-5xl font-bold w-14 h-14 rounded-2xl flex items-center justify-center ${gradeColor(String(d.portfolioGrade ?? ''))}`}>
          {String(d.portfolioGrade ?? '?')}
        </div>
        <div>
          <p className="text-white font-semibold">{String(d.riskProfile ?? '')}</p>
          <p className="text-sm text-white/50 mt-0.5">Diversification: {d.diversificationScore as number || 0}/100</p>
          {!!d.overallHealth && <Badge label={String(d.overallHealth)} color="bg-white/10 text-white/60 mt-1.5 inline-flex" />}
        </div>
      </div>
      {recs.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Recommendations</p>
          <ul className="space-y-1.5">
            {recs.map((r, i) => <li key={i} className="text-sm text-white/75 flex gap-2"><span className="text-purple-400">→</span>{r}</li>)}
          </ul>
        </div>
      )}
      {actions.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Immediate Actions</p>
          {actions.map((a, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/4 rounded-lg px-3 py-2 mb-1.5">
              <span className="text-green-400 font-bold text-sm">{i + 1}.</span>
              <span className="text-sm text-white/80">{a}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenResearchCard({ d }: { d: Record<string, unknown> }) {
  type Tokenomics = { supplyModel?: string; distributionFairness?: string; vestingRisks?: string; utilityStrength?: string; notes?: string };
  const tokenomics = (d.tokenomics as Tokenomics) || {};
  const competitors = (d.competitors as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-base">{String(d.tokenName ?? '')} ({String(d.symbol ?? '')})</p>
          <Badge label={`Research Grade: ${String(d.researchGrade ?? '?')}`} color={gradeColor(String(d.researchGrade ?? ''))} />
        </div>
      </div>
      {!!d.investmentThesis && (
        <div className="bg-green-500/8 border border-green-500/20 rounded-lg px-3 py-2.5">
          <p className="text-xs text-green-400 font-semibold mb-1">Bull Case</p>
          <p className="text-sm text-white/80">{String(d.investmentThesis)}</p>
        </div>
      )}
      {!!d.bearCase && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2.5">
          <p className="text-xs text-red-400 font-semibold mb-1">Bear Case</p>
          <p className="text-sm text-white/80">{String(d.bearCase)}</p>
        </div>
      )}
      {(tokenomics.supplyModel || tokenomics.utilityStrength) && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Tokenomics</p>
          <div className="flex flex-wrap gap-1.5">
            {tokenomics.supplyModel && <Badge label={`Supply: ${tokenomics.supplyModel}`} color="bg-white/10 text-white/60" />}
            {tokenomics.distributionFairness && <Badge label={`Distribution: ${tokenomics.distributionFairness}`} color={gradeColor(tokenomics.distributionFairness.charAt(0))} />}
            {tokenomics.vestingRisks && <Badge label={`Vesting Risk: ${tokenomics.vestingRisks}`} color={riskColor(tokenomics.vestingRisks)} />}
            {tokenomics.utilityStrength && <Badge label={`Utility: ${tokenomics.utilityStrength}`} color="bg-blue-500/20 text-blue-300" />}
          </div>
          {tokenomics.notes && <p className="text-xs text-white/40 mt-1.5">{tokenomics.notes}</p>}
        </div>
      )}
      {competitors.length > 0 && (
        <p className="text-xs text-white/40">vs. {competitors.join(', ')}</p>
      )}
    </div>
  );
}

function LiquidityAdvisorCard({ d }: { d: Record<string, unknown> }) {
  type PriceRange = { lower?: number; upper?: number; width?: string };
  const range = (d.optimalRange as PriceRange) || {};
  const steps = (d.steps as string[]) || [];
  const risks = (d.risks as string[]) || [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge label={String(d.strategyType ?? 'Unknown Strategy')} color="bg-blue-500/20 text-blue-300 border border-blue-500/30" />
        <Badge label={`IL Risk: ${String(d.impermanentLossRisk ?? '?')}`} color={riskColor(String(d.impermanentLossRisk ?? ''))} />
        {!!d.expectedFeeAPR && <Badge label={`Fee APR: ~${String(d.expectedFeeAPR)}%`} color="bg-green-500/20 text-green-300" />}
      </div>
      {(range.lower !== undefined || range.upper !== undefined) && (
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/8">
          <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Optimal Price Range</p>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-white/40">Lower</p>
              <p className="text-lg font-bold text-white">{range.lower ?? '—'}</p>
            </div>
            <div className="flex-1 mx-4 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <div className="text-center">
              <p className="text-xs text-white/40">Upper</p>
              <p className="text-lg font-bold text-white">{range.upper ?? '—'}</p>
            </div>
          </div>
          {range.width && <p className="text-xs text-white/40 text-center mt-1">{range.width}</p>}
        </div>
      )}
      {steps.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Steps</p>
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start mb-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-sm text-white/75">{s}</span>
            </div>
          ))}
        </div>
      )}
      {risks.length > 0 && (
        <div>
          <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5">Risks to Monitor</p>
          <ul className="space-y-1">
            {risks.map((r, i) => <li key={i} className="text-sm text-white/60 flex gap-2"><span className="text-orange-400">⚠</span>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function GenericResultCard({ d }: { d: unknown }) {
  return (
    <pre className="text-xs text-white/60 overflow-x-auto whitespace-pre-wrap break-all">
      {JSON.stringify(d, null, 2)}
    </pre>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function SkillResultCard({ skillId, status, data, errorMessage, onAnalyze }: SkillResultCardProps) {
  const skill = SKILLS[skillId as keyof typeof SKILLS];

  if (status === 'loading') {
    return (
      <motion.div
        className="bg-white/4 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className="text-2xl"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          {skill?.icon ?? '⚙️'}
        </motion.span>
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">Running {skill?.label ?? skillId}...</p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div
        className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <span className="text-xl mt-0.5">⚠️</span>
        <div>
          <p className="text-red-300 font-medium text-sm">{skill?.label ?? skillId} — Error</p>
          <p className="text-red-200/70 text-xs mt-1">{errorMessage}</p>
        </div>
      </motion.div>
    );
  }

  const d = (data ?? {}) as Record<string, unknown>;
  const hasRaw = d.raw;

  const renderContent = () => {
    if (hasRaw) return <GenericResultCard d={d.raw} />;
    switch (skillId) {
      case 'risk-analysis': return <RiskAnalysisCard d={d} />;
      case 'nft-listing': return <NftListingCard d={d} />;
      case 'market-alpha': return <MarketAlphaCard d={d} />;
      case 'content-moderation': return <ContentModerationCard d={d} />;
      case 'contract-auditor': return <ContractAuditorCard d={d} />;
      case 'whale-tracker': return <WhaleTrackerCard d={d} />;
      case 'portfolio-analyzer': return <PortfolioAnalyzerCard d={d} />;
      case 'token-research': return <TokenResearchCard d={d} />;
      case 'liquidity-advisor': return <LiquidityAdvisorCard d={d} />;
      default: return <GenericResultCard d={d} />;
    }
  };

  return (
    <motion.div
      className="bg-white/4 border border-white/10 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-white/3">
        <span className="text-lg">{skill?.icon ?? '⚙️'}</span>
        <p className="text-white/80 font-semibold text-sm">{skill?.label ?? skillId}</p>
        <Badge label="Result" color="bg-green-500/20 text-green-300" />
      </div>

      {/* Card body */}
      <div className="px-4 py-4">
        {renderContent()}
      </div>

      {/* Analyze button */}
      {onAnalyze && (
        <div className="px-4 pb-4">
          <button
            onClick={onAnalyze}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600/60 to-blue-600/60 hover:from-purple-600 hover:to-blue-600 border border-purple-500/30 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>🤖</span> Analyze with Nuxbee AI
          </button>
        </div>
      )}
    </motion.div>
  );
}
