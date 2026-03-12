import { memo } from 'react';
import { isMaintenanceMode } from '../config/maintenance';
import NuxMaintenance from './NuxMaintenance';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import NuxHero from '../components/nux/NuxHero';
import NuxStatsBar from '../components/nux/NuxStatsBar';
import NuxUtilities from '../components/nux/NuxUtilities';
import NuxRewardsClaim from '../components/nux/NuxRewardsClaim';
import NuxPresale from '../components/nux/NuxPresale';
import NuxBridge from '../components/nux/NuxBridge';

const Nux = memo(() => {
  const isMobile = useIsMobile();

  if (isMaintenanceMode('nux')) return <NuxMaintenance />;

  return (
    <div className={`min-h-screen py-6 lg:py-10 ${isMobile ? 'pb-32' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <NuxHero />

        {/* Stats Bar */}
        <NuxStatsBar />

        {/* Rewards Claim — high priority, above the fold */}
        <NuxRewardsClaim />

        {/* Presale roadmap */}
        <NuxPresale />

        {/* Utilities */}
        <NuxUtilities />

        {/* Cross-Chain Bridge */}
        <NuxBridge />

        {/* Token live banner */}
        <div className="mt-12 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <p className="jersey-20-regular text-emerald-300 text-sm">
            🟢 <span className="text-emerald-200 font-semibold">NUX token is live on Solana Mainnet.</span>{' '}
            Mint: <a href="https://solscan.io/token/AV9fNPXeLhyqGangnEdBkL355mqDbAi3gWU4AfzDcPZK" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors font-mono">AV9fN...DcPZK</a>
            {' '}· Whitelist opens <span className="text-amber-300 font-semibold">Mar 2</span>.
            Follow{' '}
            <a href="https://x.com/nuxchain" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
              X / Twitter
            </a>{' '}
            and{' '}
            <a href="https://t.me/+ESghwuU2rCpiNmI5" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
              Telegram
            </a>{' '}
            for updates. All allocations subject to change.
          </p>
        </div>

      </div>
    </div>
  );
});

Nux.displayName = 'Nux';
export default Nux;
