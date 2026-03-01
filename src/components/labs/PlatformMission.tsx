/**
 * Platform Mission Component
 * Replaces InnovationShowcase — highlights NuxChain's core pillars:
 * AI + NFTs + Tokens, tools useful inside and outside the ecosystem.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface Pillar {
  id: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  tools: string[];
  gradient: string;
  accentColor: string;
  borderColor: string;
  dotColor: string;
  stat: string;
  statLabel: string;
}

const AIIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    <path d="M9 14s1 1 3 1 3-1 3-1" />
  </svg>
);

const NFTIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="8.5" x2="22" y2="8.5" />
    <line x1="2" y1="15.5" x2="22" y2="15.5" />
  </svg>
);

const TokenIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9m0 0h5" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const PILLARS: Pillar[] = [
  {
    id: 'ai',
    icon: <AIIcon />,
    label: 'Artificial Intelligence',
    title: 'AI-Powered Tools',
    description: 'Intelligent assistants and analytics that help users make smarter decisions — whether they\'re inside the NuxChain ecosystem or just exploring DeFi.',
    tools: ['Nuxbee AI Chat', 'Strategy Optimizer', 'Market Insights', 'Auto-Compound AI'],
    gradient: 'from-violet-600/20 to-purple-600/10',
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    dotColor: 'bg-violet-400',
    stat: '85%',
    statLabel: 'AI Accuracy Target',
  },
  {
    id: 'nfts',
    icon: <NFTIcon />,
    label: 'NFT Ecosystem',
    title: 'NFT Utility Layer',
    description: 'NFTs that go beyond art — they unlock staking boosts, governance rights, and exclusive access. Built to have real utility both on and off the platform.',
    tools: ['NFT Analytics', 'Rarity Explorer', 'Staking Boosts', 'Governance Badges'],
    gradient: 'from-pink-600/20 to-rose-600/10',
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    dotColor: 'bg-pink-400',
    stat: '10+',
    statLabel: 'NFT Collections',
  },
  {
    id: 'tokens',
    icon: <TokenIcon />,
    label: 'Token Infrastructure',
    title: 'Token Tools',
    description: 'From staking and liquidity to live price feeds powered by Uniswap — tools that make NUX and other tokens more useful in the real world.',
    tools: ['Live Price Feed', 'Smart Staking', 'Liquidity Pools', 'Swap Integration'],
    gradient: 'from-emerald-600/20 to-teal-600/10',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    dotColor: 'bg-emerald-400',
    stat: '25+',
    statLabel: 'Supported Chains',
  },
];

const PillarCard: React.FC<{ pillar: Pillar; isActive: boolean; onClick: () => void; isMobile: boolean }> = ({
  pillar, isActive, onClick, isMobile
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-2xl border transition-all duration-300 ${
      isMobile ? 'p-4' : 'p-6'
    } ${
      isActive
        ? `bg-gradient-to-br ${pillar.gradient} ${pillar.borderColor} shadow-lg`
        : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        isActive
          ? `bg-gradient-to-br ${pillar.gradient} ${pillar.borderColor} border ${pillar.accentColor}`
          : 'bg-white/5 border border-white/10 text-slate-400'
      }`}>
        {pillar.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold tracking-wider uppercase mb-1 transition-colors ${
          isActive ? pillar.accentColor : 'text-slate-600'
        }`}>
          {pillar.label}
        </p>
        <h3 className={`font-bold jersey-15-regular transition-colors ${
          isMobile ? 'text-xl' : 'text-2xl'
        } ${isActive ? 'text-white' : 'text-slate-400'}`}>
          {pillar.title}
        </h3>
      </div>
      {isActive && (
        <div className={`flex-shrink-0 text-right ${isMobile ? 'hidden' : ''}`}>
          <p className={`text-2xl font-bold jersey-20-regular ${pillar.accentColor}`}>{pillar.stat}</p>
          <p className="text-xs text-slate-500">{pillar.statLabel}</p>
        </div>
      )}
    </div>

    {isActive && (
      <div className="mt-4 space-y-3">
        <p className="text-slate-300 text-base leading-relaxed jersey-20-regular">{pillar.description}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {pillar.tools.map(tool => (
            <span
              key={tool}
              className={`text-xs px-2.5 py-1 rounded-full border ${pillar.borderColor} ${pillar.accentColor} bg-black/20 jersey-20-regular`}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    )}
    {!isActive && (
      <div className="mt-3">
        <p className={`text-sm font-semibold ${pillar.accentColor} underline decoration-2 underline-offset-2`}>
          See more →
        </p>
      </div>
    )}
  </button>
);

const PlatformMission: React.FC = () => {
  const [activePillar, setActivePillar] = useState<string>('ai');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const active = PILLARS.find(p => p.id === activePillar)!;

  return (
    <div className={`grid gap-8 ${isMobile ? '' : 'lg:grid-cols-5'}`}>

      {/* Left: Mission statement + pillars */}
      <div className={`space-y-4 ${isMobile ? '' : 'lg:col-span-3'}`}>
        <div className="mb-6">
          <p className={`text-slate-300 leading-relaxed text-base jersey-20-regular ${isMobile ? 'text-base' : 'text-lg'}`}>
            We build tools that are useful{' '}
            <span className="text-white font-semibold">inside and outside</span> the NuxChain ecosystem —
            combining AI intelligence, NFT utility, and token infrastructure into a single platform.
          </p>
        </div>

        <div className="space-y-3">
          {PILLARS.map(pillar => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              isActive={activePillar === pillar.id}
              onClick={() => setActivePillar(pillar.id)}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Right: Visual showcase */}
      {!isMobile && (
        <div className="lg:col-span-2 space-y-4">

          {/* Active pillar visual card */}
          <div className={`rounded-2xl border bg-gradient-to-br ${active.gradient} ${active.borderColor} p-6 h-64 flex flex-col justify-between relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, currentColor, transparent)` }}
            />
            <div className={`absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-5 ${active.accentColor}`} />

            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-black/20 border ${active.borderColor} ${active.accentColor}`}>
                {active.icon}
              </div>
              <h3 className="text-2xl font-bold text-white jersey-15-regular mb-2">{active.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{active.description}</p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold jersey-20-regular ${active.accentColor}`}>{active.stat}</p>
                <p className="text-xs text-slate-500">{active.statLabel}</p>
              </div>
              <div className="flex gap-1">
                {PILLARS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePillar(p.id)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      p.id === activePillar ? `w-6 ${p.dotColor}` : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <button
              onClick={() => navigate('/labs/price-feed')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-pink-500/20 hover:bg-black/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Live Price Feed</p>
                  <p className="text-xs text-slate-500">Powered by Uniswap API</p>
                </div>
              </div>
              <span className="text-slate-600 group-hover:text-pink-400 transition-colors">
                <ArrowIcon />
              </span>
            </button>

            <button
              onClick={() => navigate('/chat')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-violet-500/20 hover:bg-black/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Nuxbee AI Chat</p>
                  <p className="text-xs text-slate-500">Ask anything about DeFi</p>
                </div>
              </div>
              <span className="text-slate-600 group-hover:text-violet-400 transition-colors">
                <ArrowIcon />
              </span>
            </button>

            <button
              onClick={() => navigate('/staking')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-emerald-500/20 hover:bg-black/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Smart Staking</p>
                  <p className="text-xs text-slate-500">Earn rewards on NUX</p>
                </div>
              </div>
              <span className="text-slate-600 group-hover:text-emerald-400 transition-colors">
                <ArrowIcon />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile: quick links row */}
      {isMobile && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Price Feed', path: '/labs/price-feed', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
            { label: 'AI Chat', path: '/chat', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { label: 'Staking', path: '/staking', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-xl ${item.bg} border ${item.border} ${item.color} text-xs font-semibold text-center transition-all duration-200 hover:scale-105`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformMission;
