import { useEffect } from 'react';
import Footer from '../components/layout/footer';

// ─── Inline SVG Icons (self-contained) ────────────────────────────────────────
const Icon = ({ d, size = 20, className = '' }: { d: string; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const FileText    = ({ size = 20, className = '' }: { size?: number; className?: string }) => <Icon size={size} className={className} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />;
const Download    = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const ExternalLink = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const Shield      = ({ size = 20 }) => <Icon size={size} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const Zap         = ({ size = 20 }) => <Icon size={size} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const Globe       = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const Coins       = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>;
const BarChart3   = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const Cpu         = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M9 2v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/></svg>;
const Lock        = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const Users       = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ArrowRight  = ({ size = 20, className = '' }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const Star        = ({ size = 20 }) => <Icon size={size} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const ChevronRight = ({ size = 20, className = '' }: { size?: number; className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"/></svg>;

const WHITEPAPER_PDF_URL = '/nuxchain-whitepaper.pdf';
const MINT_ADDRESS = 'FRnAMJ7p4bgTeAbkhq5cKAX8Xif86h71Nn3nHnXPedtp';

// ─── Section Components ────────────────────────────────────────────────────────

function SectionTag({ label }: { label: string }) {
  return (
    <span className="inline-block px-3 py-1 jersey-20-regular text-xl font-bold tracking-widest uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-4">
      {label}
    </span>
  );
}

function HighlightCard({
  icon: Icon,
  title,
  description,
  accent = 'purple',
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: 'purple' | 'amber' | 'cyan' | 'green' | 'pink';
}) {
  const colors = {
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-300',
    amber:  'from-amber-500/20  to-amber-500/5  border-amber-500/30  text-amber-300',
    cyan:   'from-cyan-500/20   to-cyan-500/5   border-cyan-500/30   text-cyan-300',
    green:  'from-green-500/20  to-green-500/5  border-green-500/30  text-green-300',
    pink:   'from-pink-500/20   to-pink-500/5   border-pink-500/30   text-pink-300',
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[accent]} border p-5 flex flex-col gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 ${colors[accent]}`}>
        <Icon size={20} />
      </div>
      <h4 className="jersey-15-regular text-white font-bold text-lg leading-snug">{title}</h4>
      <p className="text-white/60 text-lg leading-relaxed">{description}</p>
    </div>
  );
}

function TokenomicBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-base">
        <span className="jersey-20-regular text-white/70">{label}</span>
        <span className="jersey-15-regular text-white font-bold text-sm">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Whitepaper() {
  useEffect(() => {
    document.title = 'NuxChain | Whitepaper — Technical Overview';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-base text-white/60">
              <FileText size={14} className="text-purple-400" />
              <span className="jersey-20-regular">Whitepaper v1.0 — February 2026</span>
            </div>

            <h1 className="jersey-15-regular text-5xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="text-white">Nuxchain</span>{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Protocol
              </span>
            </h1>
            <p className="jersey-20-regular text-white/60 text-lg sm:text-xl max-w-2xl leading-relaxed">
              A cross-chain DeFi ecosystem combining staking, gamified NFT marketplace, AI-powered analytics, 
              and the NUX utility token — built for the emerging agentic era.
            </p>

            {/* Download button */}
            <div className="flex flex-wrap text-xl gap-3 justify-center mt-2">
              <a
                href={WHITEPAPER_PDF_URL}
                download="nuxchain-whitepaper.pdf"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 jersey-20-regular font-bold transition-all shadow-lg shadow-purple-900/30"
              >
                <Download size={18} />
                Download Full PDF
              </a>
              <a
                href={`https://solscan.io/token/${MINT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 jersey-20-regular font-bold transition-all"
              >
                <ExternalLink size={18} />
                View Token On-Chain
              </a>
            </div>

            {/* Metadata strip */}
            <div className="flex flex-wrap gap-6 justify-center mt-4 jersey-20-regular text-lg text-white/40">
              <span>100M NUX Fixed Supply</span>
              <span>·</span>
              <span>Polygon + Solana</span>
              <span>·</span>
              <span>Non-mintable · Non-freezable</span>
              <span>·</span>
              <span>Fully On-Chain Metadata</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Table of Contents ── */}
      <section className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="jersey-20-regular text-sm tracking-widest uppercase text-white/30 mb-5 font-bold">Contents</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ['01', 'Abstract'],
              ['02', 'Problem Statement'],
              ['03', 'Platform Architecture'],
              ['04', 'SmartStaking v4.0'],
              ['05', 'NFT Marketplace'],
              ['06', 'NUX Token'],
              ['07', 'Tokenomics'],
              ['08', 'AI Integration'],
              ['09', 'Security'],
              ['10', 'Roadmap'],
              ['11', 'Team'],
              ['12', 'Risk Factors'],
            ].map(([num, title]) => (
              <div key={num} className="flex items-center gap-2 jersey-20-regular text-lg text-white/50 hover:text-white/80 transition-colors cursor-pointer group">
                <span className="text-purple-500/60 font-mono text-sm">{num}</span>
                <ChevronRight size={12} className="text-white/20 group-hover:text-purple-400 transition-colors" />
                {title}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ── 01 Abstract ── */}
        <section id="abstract">
          <SectionTag label="01 — Abstract" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">Executive Summary</h2>
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p className="jersey-20-regular text-lg">
              Nuxchain is a comprehensive decentralized finance (DeFi) ecosystem built on Polygon and Solana, combining 
              high-yield staking infrastructure, a gamified NFT marketplace, AI-powered analytics, and the NUX utility token. 
              The platform is designed for both retail and enterprise participants seeking verifiable, on-chain yield 
              generation with transparent governance.
            </p>
            <p className="jersey-20-regular text-lg">
              NUX is the native utility token of the NuxChain protocol — a fixed-supply, non-mintable SPL token deployed 
              on Solana mainnet with full on-chain Metaplex metadata. It enables incentives, governance, rewards, 
              and seamless interoperability across the platform's multi-chain architecture.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Supply',    value: '100M NUX' },
              { label: 'Blockchain',      value: 'Solana + Polygon' },
              { label: 'Token Standard',  value: 'SPL + ERC-20' },
              { label: 'Launch Phase',    value: 'Phase 1 — 2026' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="jersey-15-regular text-white font-bold text-2xl">{value}</div>
                <div className="jersey-20-regular text-white/40 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 02 Problem Statement ── */}
        <section id="problem">
          <SectionTag label="02 — Problem Statement" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">The Problem We Solve</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <HighlightCard
              icon={Lock}
              accent="pink"
              title="Fragmented DeFi Yields"
              description="Users must manage multiple protocols, wallets, and chains to optimize yield — creating friction, risk, and poor UX that excludes non-technical participants."
            />
            <HighlightCard
              icon={BarChart3}
              accent="amber"
              title="No Incentive for Engagement"
              description="Traditional staking is passive and offers no engagement layer. Users stake once and disengage, limiting platform growth and community development."
            />
            <HighlightCard
              icon={Globe}
              accent="cyan"
              title="Opaque NFT Markets"
              description="NFT marketplaces lack transparent rarity verification, skill-based utility, and integration with DeFi primitives, reducing long-term NFT value retention."
            />
          </div>
        </section>

        {/* ── 03 Architecture ── */}
        <section id="architecture">
          <SectionTag label="03 — Platform Architecture" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">Technical Architecture</h2>
          <p className="jersey-20-regular text-white/60 mb-8 text-lg leading-relaxed">
            Nuxchain operates on a multi-layer architecture combining on-chain smart contracts (Polygon/Solana), 
            serverless API infrastructure (Vercel Edge), and a real-time React frontend with AI integration.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <HighlightCard icon={Cpu} accent="purple" title="Frontend Layer" description="React 19 + Vite 7.1 + TypeScript 5.7 + TailwindCSS 4.0. Wagmi v2 + Viem 2.38 for EVM interactions. Mobile-first PWA with offline support and push notifications." />
            <HighlightCard icon={Shield} accent="green" title="Smart Contract Layer" description="EnhancedSmartStaking v4.0 on Polygon Mainnet with 9 modular contracts. GameifiedMarketplace v2.0 with 10 modules. Fully audited with gas-optimized upgradeable proxy pattern." />
            <HighlightCard icon={Zap} accent="amber" title="API / Backend Layer" description="Vercel Serverless Functions with TypeScript. Redis-backed rate limiting, distributed deduplicator, Firebase Admin for auth. Gemini AI integration for Nuxbee AI assistant." />
            <HighlightCard icon={Globe} accent="cyan" title="Blockchain Infrastructure" description="Polygon Mainnet for EVM contracts. Solana Mainnet for NUX SPL token. QuickNode RPC for low-latency blockchain data. IPFS (Pinata) for decentralized asset storage." />
          </div>
        </section>

        {/* ── 04 SmartStaking ── */}
        <section id="staking">
          <SectionTag label="04 — EnhancedSmartStaking v4.0" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">Staking Protocol</h2>
          <p className="jersey-20-regular text-white/60 text-lg leading-relaxed">
            The EnhancedSmartStaking v4.0 system is the core yield-generation engine. Users deposit POL tokens 
            and earn continuous rewards calculated hourly, with lockup multipliers providing enhanced APY for committed capital.
          </p>

          {/* APY Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden mb-8">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10">
              <h3 className="jersey-15-regular font-bold text-white text-lg">Lockup Tiers & APY</h3>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { period: 'Flexible (No Lockup)', rate: '0.005% / hr', apy: '43.8%',  multiplier: '1x',   accent: 'text-white/50' },
                { period: '30 Days',              rate: '0.010% / hr', apy: '87.6%',  multiplier: '2x',   accent: 'text-blue-400' },
                { period: '90 Days',              rate: '0.014% / hr', apy: '122.6%', multiplier: '2.8x', accent: 'text-cyan-400' },
                { period: '180 Days',             rate: '0.017% / hr', apy: '149.3%', multiplier: '3.4x', accent: 'text-purple-400' },
                { period: '365 Days',             rate: '0.025% / hr', apy: '219%',   multiplier: '5x',   accent: 'text-amber-400' },
              ].map((row) => (
                <div key={row.period} className="grid grid-cols-4 px-6 py-4 text-lg">
                  <span className="jersey-20-regular text-white/70">{row.period}</span>
                  <span className="jersey-20-regular text-white/60">{row.rate}</span>
                  <span className={`jersey-15-regular font-bold ${row.accent}`}>{row.apy} APY</span>
                  <span className={`jersey-15-regular font-bold ${row.accent}`}>{row.multiplier}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-lg">
            {[
              { label: 'Min. Deposit',      value: '10 POL' },
              { label: 'Max. per Deposit',  value: '100,000 POL' },
              { label: 'Max. Deposits',     value: '400 / user' },
              { label: 'Daily Withdrawal',  value: '2,000 POL limit' },
              { label: 'Platform Fee',      value: '6% on rewards' },
              { label: 'Compound',          value: 'Yes — any time' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                <span className="text-white/50">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 05 NFT Marketplace ── */}
        <section id="marketplace">
          <SectionTag label="05 — GameifiedMarketplace v2.0" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">NFT Marketplace</h2>
          <p className="jersey-20-regular text-white/60 mb-8 text-lg leading-relaxed">
            The GameifiedMarketplace v2.0 is a 10-module modular NFT platform with integrated Skills NFT system, 
            verifiable rarity tiers, referral mechanics, and cross-platform XP progression shared with the staking protocol.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <HighlightCard icon={Star} accent="amber" title="Skills NFT System" description="NFTs carry skill attributes that grant real utility: staking bonuses, marketplace fee reductions, quest multipliers, and exclusive access to platform features." />
            <HighlightCard icon={Users} accent="purple" title="Referral System" description="On-chain referral mechanics with transparent reward distribution. Referrers earn a percentage of fees from referred user transactions indefinitely." />
            <HighlightCard icon={BarChart3} accent="cyan" title="Statistics Module" description="Dedicated MarketplaceStatistics contract tracks all trades, volumes, top collections, and user analytics with on-chain verifiable data." />
            <HighlightCard icon={Globe} accent="green" title="Social Module" description="On-chain social layer enabling user follows, creator profiles, collection comments, and community building directly on Polygon." />
          </div>
        </section>

        {/* ── 06 NUX Token ── */}
        <section id="nux">
          <SectionTag label="06 — NUX Token" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">The NUX Utility Token</h2>
          <p className="jersey-20-regular text-white/60 mb-8 text-lg leading-relaxed">
            NUX is the native utility token of the NuxChain ecosystem. Deployed as an SPL token on Solana mainnet 
            with full on-chain Metaplex metadata, it is permanently non-mintable and non-freezable — ensuring 
            absolute supply certainty for token holders.
          </p>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-between text-lg">
              <div>
                <div className="text-white/40 mb-1">Token Address (Solana)</div>
                <code className="text-amber-300 text-sm font-mono break-all">{MINT_ADDRESS}</code>
              </div>
              <div className="text-right">
                <div className="text-white/40 mb-1">Verification</div>
                <a
                  href={`https://solscan.io/token/${MINT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm"
                >
                  Solscan <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <HighlightCard icon={Coins} accent="amber" title="Staking Rewards" description="NUX tokens are distributed as enhanced staking rewards on top of POL yield, creating a dual-reward staking model for long-term holders." />
            <HighlightCard icon={Shield} accent="purple" title="Governance Rights" description="NUX holders participate in platform governance: fee parameters, new feature prioritization, treasury allocation, and protocol upgrades." />
            <HighlightCard icon={Zap} accent="cyan" title="Marketplace Utility" description="Holding NUX reduces marketplace fees, unlocks premium Skills NFT tiers, and grants early access to new collections and launchpad slots." />
            <HighlightCard icon={Globe} accent="green" title="Cross-Chain Bridge" description="NUX will bridge between Solana and Polygon via a secure cross-chain bridge, enabling unified liquidity and DeFi composability." />
          </div>
        </section>

        {/* ── 07 Tokenomics ── */}
        <section id="tokenomics">
          <SectionTag label="07 — Tokenomics" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-8">Token Distribution</h2>

          <div className="grid sm:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <TokenomicBar label="Community & Ecosystem Rewards" pct={35} color="bg-purple-500" />
              <TokenomicBar label="Launchpad & Public Sale"       pct={20} color="bg-amber-500" />
              <TokenomicBar label="Team & Advisors (3yr vest)"    pct={15} color="bg-pink-500" />
              <TokenomicBar label="Treasury & DAO Reserve"        pct={15} color="bg-cyan-500" />
              <TokenomicBar label="Liquidity Provision"           pct={10} color="bg-green-500" />
              <TokenomicBar label="Marketing & Partnerships"      pct={5}  color="bg-blue-500" />
            </div>
            <div className="space-y-3 text-lg">
              {[
                { color: 'bg-purple-500', label: 'Community & Ecosystem',  pct: '35%', desc: '35M NUX — staking rewards, quests, achievements' },
                { color: 'bg-amber-500',  label: 'Launchpad / Public Sale', pct: '20%', desc: '20M NUX — initial liquidity & fundraising' },
                { color: 'bg-pink-500',   label: 'Team & Advisors',         pct: '15%', desc: '15M NUX — 3-year linear vesting' },
                { color: 'bg-cyan-500',   label: 'Treasury & DAO',          pct: '15%', desc: '15M NUX — governance-controlled reserve' },
                { color: 'bg-green-500',  label: 'Liquidity',               pct: '10%', desc: '10M NUX — DEX liquidity (50% locked)' },
                { color: 'bg-blue-500',   label: 'Marketing',               pct: '5%',  desc: '5M NUX — partnerships, campaigns' },
              ].map(({ color, label, pct, desc }) => (
                <div key={label} className="flex gap-3 items-start">
                  <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <span className="text-white font-medium">{label}</span>
                    <span className="text-white/40 ml-2">{pct}</span>
                    <p className="text-white/40 text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 08 AI Integration ── */}
        <section id="ai">
          <SectionTag label="08 — AI Integration" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">Nuxbee AI Platform</h2>
          <p className="jersey-20-regular text-white/60 mb-8 text-lg leading-relaxed">
            Nuxbee AI 1.0 is an integrated AI assistant powered by Google Gemini, providing contextual 
            platform guidance, staking strategy optimization, market analytics, and agentic automation — 
            representing Nuxchain's commitment to the emerging AI-native DeFi era.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <HighlightCard icon={Cpu} accent="purple" title="Contextual Knowledge Base" description="512-dimensional embeddings of the entire platform knowledge base enable semantic search and accurate platform-specific responses." />
            <HighlightCard icon={Zap} accent="cyan" title="Streaming Responses" description="Server-sent events (SSE) architecture delivers real-time streaming AI responses with sub-200ms first-token latency." />
            <HighlightCard icon={Shield} accent="green" title="Rate Limiting & Security" description="Redis-backed distributed rate limiter, context caching, and audit logging ensure secure, abuse-resistant AI access." />
          </div>
        </section>

        {/* ── 09 Security ── */}
        <section id="security">
          <SectionTag label="09 — Security" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">Security Framework</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <HighlightCard icon={Shield} accent="green" title="Smart Contract Audits" description="All Polygon smart contracts have been audited by recognized security firms. Gas optimization and latest Solidity version compliance verified." />
            <HighlightCard icon={Lock} accent="purple" title="Non-Custodial Architecture" description="Users maintain full custody of assets. The platform never holds private keys. All interactions are permissioned by on-chain transaction signing." />
            <HighlightCard icon={Zap} accent="amber" title="MEV Protection" description="Implemented front-running and sandwich attack protections via transaction sequencing controls and slippage parameters." />
            <HighlightCard icon={Shield} accent="cyan" title="Token Authority Revocation" description="NUX mint and freeze authorities are permanently revoked. Zero possibility of additional token creation or account freezing by any party." />
          </div>
        </section>

        {/* ── 10 Roadmap ── */}
        <section id="roadmap">
          <SectionTag label="10 — Roadmap" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-8">Development Roadmap</h2>
          <div className="space-y-4">
            {[
              {
                phase: 'Phase 1',
                status: 'COMPLETED',
                period: 'Q4 2024 – Q3 2025',
                color: 'border-green-500/40 bg-green-500/5',
                badge: 'bg-green-500/20 text-green-400',
                items: ['Nuxchain Platform Beta', 'SmartStaking v4.0 + Gamification', 'GameifiedMarketplace v2.0', 'Profile & Dashboard', 'Nuxbee AI 1.0', 'Roadmap Visualization'],
              },
              {
                phase: 'Phase 2',
                status: 'IN PROGRESS',
                period: 'Q4 2025 – Q1 2026',
                color: 'border-purple-500/40 bg-purple-500/5',
                badge: 'bg-purple-500/20 text-purple-400',
                items: ['NFT Analytics Dashboard', 'NUX Token Deployment ✅', 'Nuxbee AI Platform 2.0', 'Smart Contracts Update', 'Governance DAO Planning'],
              },
              {
                phase: 'Phase 3',
                status: 'PLANNED',
                period: 'Q2 2026 – Q4 2027',
                color: 'border-white/10 bg-white/3',
                badge: 'bg-white/10 text-white/50',
                items: ['Physical NFT Clothing Brand', 'Yield Farming & Liquidity Pools', 'Mini Games & Gamification', 'Mobile Apps (iOS/Android)', 'Enterprise Solutions Platform', 'Global Expansion & Multi-Currency'],
              },
            ].map(({ phase, status, period, color, badge, items }) => (
              <div key={phase} className={`rounded-2xl border ${color} p-6`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="jersey-15-regular text-white font-bold text-xl">{phase}</h3>
                  <span className={`jersey-20-regular px-2.5 py-0.5 text-sm font-bold rounded-full ${badge}`}>{status}</span>
                  <span className="jersey-20-regular text-white/40 text-lg ml-auto">{period}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-lg text-white/60">
                      <ArrowRight size={12} className="text-white/30 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 12 Risk Factors ── */}
        <section id="risks">
          <SectionTag label="12 — Risk Factors" />
          <h2 className="jersey-15-regular text-3xl font-bold mb-6">Risk Disclosure</h2>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-6 space-y-3 jersey-20-regular text-lg text-white/60 leading-relaxed">
            <p>
              <span className="text-white font-medium">Smart Contract Risk:</span>{' '}
              Despite security audits, smart contracts may contain undiscovered vulnerabilities. Users should only 
              deposit amounts they can afford to lose.
            </p>
            <p>
              <span className="text-white font-medium">Market Risk:</span>{' '}
              POL and NUX token prices are subject to high volatility. APY calculations are denominated in POL 
              and do not guarantee USD-equivalent returns.
            </p>
            <p>
              <span className="text-white font-medium">Lockup Risk:</span>{' '}
              Staked funds are locked for the chosen duration. Early withdrawal is not possible during an active 
              lockup period. Select lockup periods appropriate for your liquidity needs.
            </p>
            <p>
              <span className="text-white font-medium">Regulatory Risk:</span>{' '}
              The regulatory landscape for DeFi and digital assets is evolving. Users are responsible for 
              compliance with applicable laws in their jurisdictions.
            </p>
            <p className="text-white/30 text-sm pt-2">
              This document is for informational purposes only and does not constitute financial or investment advice. 
              Always conduct your own due diligence before participating in DeFi protocols.
            </p>
          </div>
        </section>

        {/* ── Download CTA ── */}
        <section className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-10 text-center">
          <h2 className="jersey-15-regular text-2xl font-bold mb-3">Download the Full Whitepaper</h2>
          <p className="jersey-20-regular text-white/50 mb-6 max-w-md mx-auto text-lg leading-relaxed">
            The complete PDF includes detailed smart contract specifications, full tokenomics models, 
            audit reports, and governance parameters.
          </p>
          <a
            href={WHITEPAPER_PDF_URL}
            download="nuxchain-whitepaper.pdf"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 jersey-20-regular font-bold transition-all shadow-lg shadow-purple-900/30"
          >
            <Download size={18} />
            Download PDF — v1.0
          </a>
          <div className="mt-4 jersey-20-regular text-sm text-white/30">
            nuxchain-whitepaper.pdf · February 2026 · English
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
