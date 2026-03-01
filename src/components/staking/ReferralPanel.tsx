/**
 * ReferralPanel - Referral system UI for v6.2.0
 * Shows boost status, referral link generator, register referrer flow.
 * Reads getReferralInfo() → ViewStats. Writes registerReferrer() → Core.
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useStakingV620, formatBPS } from '../../hooks/staking/useStakingV620';

const ReferralPanel = memo(() => {
  const { address } = useAccount();
  const { referralInfo, referralBoostBps, registerReferrer, isTxPending, isConfirmed, resetTx } = useStakingV620();

  const [copied, setCopied] = useState(false);
  const [pendingReferrer, setPendingReferrer] = useState<`0x${string}` | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  // Detect ?ref= in URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref?.startsWith('0x')) {
        setPendingReferrer(ref as `0x${string}`);
        // Only show if no existing referrer and no deposits yet
        if (!referralInfo?.referrer) {
          setShowRegisterPrompt(true);
        }
      }
    }
  }, [referralInfo?.referrer]);

  const referralLink = address
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/staking?ref=${address}`
    : '';

  const copyLink = useCallback(async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const handleRegister = useCallback(() => {
    if (!pendingReferrer) return;
    registerReferrer(pendingReferrer);
    setShowRegisterPrompt(false);
  }, [pendingReferrer, registerReferrer]);

  useEffect(() => {
    if (isConfirmed) { resetTx(); }
  }, [isConfirmed, resetTx]);

  const boostPct = formatBPS(referralInfo?.currentBoostBps ?? referralBoostBps);
  const boostEndDate = referralInfo?.boostEndTime
    ? new Date(Number(referralInfo.boostEndTime) * 1000).toLocaleDateString()
    : null;
  const now = Math.floor(Date.now() / 1000);
  const boostActive = referralInfo?.boostActive && Number(referralInfo.boostEndTime) > now;

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl lg:text-4xl">🤝</span>
        <h3 className="jersey-15-regular text-white font-semibold text-2xl lg:text-3xl">Referral Program</h3>
      </div>

      {/* Pending referrer register prompt */}
      <AnimatePresence>
        {showRegisterPrompt && pendingReferrer && !referralInfo?.referrer && (
          <motion.div
            className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="jersey-20-regular text-amber-400 text-lg lg:text-xl font-semibold mb-2">
              🎉 You were referred by:
            </p>
            <p className="jersey-20-regular text-white/60 text-base lg:text-lg font-mono mb-4">
              {pendingReferrer.slice(0, 6)}...{pendingReferrer.slice(-4)}
            </p>
            <p className="jersey-20-regular text-white/60 text-base lg:text-lg mb-4">
              Register this referral BEFORE your first deposit to activate your referral benefits.
            </p>
            <button
              onClick={handleRegister}
              disabled={isTxPending}
              className="jersey-20-regular bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-base lg:text-lg font-bold px-5 py-3 rounded-lg transition-colors w-full"
            >
              {isTxPending ? '⏳ Registering...' : 'Accept Referral'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active boost banner */}
      <AnimatePresence>
        {boostActive && (
          <motion.div
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-3xl lg:text-4xl">⚡</span>
            <div>
              <p className="jersey-15-regular text-emerald-400 font-semibold text-xl lg:text-2xl">
                APY Boosted +{boostPct}
              </p>
              <p className="jersey-20-regular text-white/50 text-base lg:text-lg">
                Active until {boostEndDate}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-5 text-center border border-white/10">
          <p className="jersey-15-regular text-white text-4xl lg:text-5xl font-bold">
            {referralInfo?.totalReferralsMade?.toString() ?? '0'}
          </p>
          <p className="jersey-20-regular text-white/50 text-base lg:text-lg mt-2">People referred</p>
        </div>
        <div className="bg-white/5 rounded-lg p-5 text-center border border-white/10">
          <p className="jersey-15-regular text-emerald-400 text-4xl lg:text-5xl font-bold">
            +{boostPct}
          </p>
          <p className="jersey-20-regular text-white/50 text-base lg:text-lg mt-2">APY boost per referral</p>
        </div>
      </div>

      {/* Referrer info */}
      {referralInfo?.referrer && (
        <div className="bg-white/5 rounded-lg p-5 border border-white/10">
          <p className="jersey-20-regular text-white/50 text-base lg:text-lg mb-2">Referred by</p>
          <p className="jersey-20-regular text-white/80 text-lg lg:text-xl font-mono">
            {referralInfo.referrer.slice(0, 10)}...{referralInfo.referrer.slice(-6)}
          </p>
        </div>
      )}

      {/* Referral link */}
      {address && (
        <div>
          <p className="jersey-20-regular text-white/60 text-base lg:text-lg mb-3 font-medium">Your referral link</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 overflow-hidden">
              <p className="jersey-20-regular text-white/60 text-sm lg:text-base break-all">{referralLink}</p>
            </div>
            <button
              onClick={copyLink}
              className="jersey-20-regular px-5 py-3 rounded-lg text-base lg:text-lg font-semibold transition-all bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              {copied ? '✅' : '📋'}
            </button>
          </div>
        </div>
      )}

      {!boostActive && !referralInfo?.referrer && (
        <p className="jersey-20-regular text-white/40 text-base lg:text-lg bg-white/5 rounded-lg p-4 border border-white/10">
          💡 Share your link. When someone signs up and deposits, you earn +{boostPct} APY for 30 days.
        </p>
      )}
    </div>
  );
});

ReferralPanel.displayName = 'ReferralPanel';
export default ReferralPanel;
