import { memo } from 'react';
import { isMaintenanceMode } from '../config/maintenance';
import StakingMaintenance from './StakingMaintenance';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import NuxHero from '../components/nux/NuxHero';
import NuxStatsBar from '../components/nux/NuxStatsBar';
import NuxTokenomics from '../components/nux/NuxTokenomics';
import NuxUtilities from '../components/nux/NuxUtilities';
import NuxRewardsClaim from '../components/nux/NuxRewardsClaim';
import NuxPresale from '../components/nux/NuxPresale';
import NuxBridge from '../components/nux/NuxBridge';

const Nux = memo(() => {
  const isMobile = useIsMobile();

  if (isMaintenanceMode('nux')) return <StakingMaintenance />;

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

        {/* Tokenomics */}
        <NuxTokenomics />

        {/* Utilities */}
        <NuxUtilities />

        {/* Cross-Chain Bridge */}
        <NuxBridge />

        {/* Bottom disclaimer */}
        <div className="mt-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="jersey-20-regular text-white/30 text-sm">
            NUX token has not yet launched. This page is a preview of the upcoming token and its ecosystem integration.
            All allocations and dates are subject to change. Follow our{' '}
            <a href="https://x.com/nuxchain" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
              X / Twitter
            </a>{' '}
            and{' '}
            <a href="https://t.me/+ESghwuU2rCpiNmI5" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
              Telegram
            </a>{' '}
            for official announcements.
          </p>
        </div>

      </div>
    </div>
  );
});

Nux.displayName = 'Nux';
export default Nux;
