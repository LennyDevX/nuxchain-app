import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { isMaintenanceMode } from '../config/maintenance';
import GiveawayMaintenance from './GiveawayMaintenance';

const TWEET_TEXT_RAW =
  "🚀 I'm joining the @nuxchain giveaway for 2 Solana! Just reserved my NUX tokens before the launch. Don't miss out — only 2 winners! 🎰 #Nuxchain #Solana #NUX #Giveaway #Web3";
// Use x.com/intent/post directly — avoids the twitter.com redirect that can strip query params
const TWEET_URL =
  'https://x.com/intent/post?text=' + encodeURIComponent(TWEET_TEXT_RAW);
const FOLLOW_URL = 'https://x.com/nuxchain';

type StepKey = 'follow' | 'buy' | 'share';
const STORAGE_KEY = 'nux_giveaway_steps_v1';

const steps: { key: StepKey; icon: string; title: string; desc: string; action: string; url: string | null; hint: string }[] = [
  {
    key: 'follow',
    icon: '𝕏',
    title: 'Follow @nuxchain on X',
    desc: 'Follow the official Nuxchain account on X (Twitter) to stay updated on all project news and the winner announcement.',
    action: 'Follow @nuxchain',
    url: FOLLOW_URL,
    hint: 'After you follow, mark this step as done.',
  },
  {
    key: 'buy',
    icon: '◎',
    title: 'Buy min. $20 in NUX',
    desc: 'Reserve your NUX tokens through the presale whitelist with a minimum of $20 USD in Solana. This purchase confirms your spot in the Nuxchain ecosystem.',
    action: 'Buy Tokens',
    url: '/launchpad',
    hint: 'Complete your token reservation, then mark this step as done.',
  },
  {
    key: 'share',
    icon: '📢',
    title: 'Share on X',
    desc: 'Post the official giveaway tweet from your X account. The text is pre-filled — just click, review, and hit Post.',
    action: 'Post Tweet',
    url: TWEET_URL,
    hint: 'After posting your tweet, mark this step as done.',
  },
];

const stepColors: Record<StepKey, { from: string; border: string; text: string; bg: string }> = {
  follow: { from: 'from-slate-800/60', border: 'border-slate-600/30', text: 'text-white', bg: 'bg-white/10' },
  buy:    { from: 'from-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-300', bg: 'bg-purple-500/15' },
  share:  { from: 'from-blue-900/30',   border: 'border-blue-500/30',   text: 'text-blue-300',   bg: 'bg-blue-500/15' },
};

function SolanaIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} fill="none" className={className}>
      <defs>
        <linearGradient id="sol-giveaway" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="50%" stopColor="#43B4CA" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path d="M14 60 L62 60 L82 44 L34 44 Z" fill="url(#sol-giveaway)" />
      <path d="M14 43 L62 43 L82 27 L34 27 Z" fill="url(#sol-giveaway)" />
      <path d="M34 77 L82 77 L62 61 L14 61 Z" fill="url(#sol-giveaway)" />
    </svg>
  );
}

export default function Giveaway() {
  const isMobile = useIsMobile();

  if (isMaintenanceMode('giveaway')) return <GiveawayMaintenance />;

  const [checked, setChecked] = useState<Record<StepKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { follow: false, buy: false, share: false };
    } catch {
      return { follow: false, buy: false, share: false };
    }
  });

  const allDone = checked.follow && checked.buy && checked.share;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (key: StepKey) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const handleAction = (url: string | null) => {
    if (!url) return;
    if (url.startsWith('/')) {
      window.location.href = url;
    } else {
      // noreferrer only (no noopener) so Twitter intent can read query params
      window.open(url, '_blank', 'noreferrer');
    }
  };

  return (
    <div className={`min-h-screen py-6 lg:py-10 ${isMobile ? 'pb-32' : ''}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ── Prize Banner ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 280, damping: 26 }}
          className="relative overflow-hidden text-center px-6 py-10 rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-900/30 via-black/40 to-blue-900/20"
        >
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[420px] h-[220px] bg-purple-600/10 rounded-full blur-[80px]" />
          </div>

          <p className="jersey-20-regular text-amber-400 text-base sm:text-lg uppercase tracking-[0.3em] mb-5">
            🎰 Official Giveaway
          </p>

          {/* Title flanked by Solana logos */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6">
            <SolanaIcon size={isMobile ? 52 : 72} />
            <h1 className={`jersey-15-regular text-gradient ${isMobile ? 'text-6xl' : 'text-8xl'} leading-none`}>
              Win 2 SOL
            </h1>
            <SolanaIcon size={isMobile ? 52 : 72} />
          </div>

          <p className={`jersey-20-regular text-white/70 ${isMobile ? 'text-lg' : 'text-xl'} max-w-lg mx-auto leading-relaxed mb-7`}>
            Two winners will each receive{' '}
            <span className="text-amber-300 font-semibold">1 SOL</span>.{' '}
            Complete the 3 steps and reserve your NUX tokens before the launch.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="jersey-20-regular px-5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-base tracking-wide">
              ✦ 2 Winners
            </span>
            <span className="jersey-20-regular px-5 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-base tracking-wide">
              ◎ 1 SOL each
            </span>
            <span className="jersey-20-regular px-5 py-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-base tracking-wide">
              🚀 NUX Token Launch
            </span>
          </div>
        </motion.div>

        {/* ── Steps ────────────────────────────────────── */}
        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="jersey-20-regular text-white/50 text-base uppercase tracking-[0.2em] text-center"
          >
            Complete all 3 steps to enter
          </motion.p>

          {steps.map((step, idx) => {
            const c = stepColors[step.key];
            const done = checked[step.key];
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + idx * 0.1, type: 'spring', stiffness: 300, damping: 28 }}
                className={`relative p-5 sm:p-6 rounded-3xl border bg-gradient-to-br ${c.from} ${c.border} transition-all duration-300 ${done ? 'opacity-80' : ''}`}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${c.bg} border ${c.border} ${c.text}`}>
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="text-emerald-400 text-3xl font-black"
                        >
                          \u2713
                        </motion.span>
                      ) : (
                        <motion.span
                          key="icon"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          {step.icon}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="jersey-20-regular text-white/40 text-sm uppercase tracking-widest">
                        Step {idx + 1}
                      </span>
                      <AnimatePresence>
                        {done && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="jersey-20-regular text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          >
                            Done ✓
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <h3 className={`jersey-15-regular ${c.text} ${isMobile ? 'text-2xl' : 'text-3xl'} leading-tight mb-3`}>
                      {step.title}
                    </h3>
                    <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed mb-4`}>
                      {step.desc}
                    </p>

                    {/* Tweet preview (step 3 only) */}
                    {step.key === 'share' && (
                      <div className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-blue-500/20">
                        <p className="jersey-20-regular text-white/40 text-xs uppercase tracking-widest mb-2">Pre-filled tweet</p>
                        <p className={`jersey-20-regular text-white/80 ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed break-words`}>
                          {TWEET_TEXT_RAW}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2.5 items-center">
                      {/* Share step: use a real <a> so the browser opens it as direct navigation,
                          preserving the full URL with query params — window.open can lose params on redirect */}
                      {step.key === 'share' ? (
                        <a
                          href={step.url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`jersey-20-regular ${isMobile ? 'text-lg' : 'text-xl'} px-6 py-2.5 rounded-xl inline-flex items-center gap-2 border transition-all hover:scale-[1.02] active:scale-[0.98] ${c.bg} ${c.border} ${c.text} hover:brightness-125`}
                        >
                          {step.action}
                          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <button
                          onClick={() => handleAction(step.url)}
                          className={`jersey-20-regular ${isMobile ? 'text-lg' : 'text-xl'} px-6 py-2.5 rounded-xl inline-flex items-center gap-2 border transition-all hover:scale-[1.02] active:scale-[0.98] ${c.bg} ${c.border} ${c.text} hover:brightness-125`}
                        >
                          {step.action}
                          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => toggle(step.key)}
                        className={`jersey-20-regular ${isMobile ? 'text-base' : 'text-lg'} px-5 py-2.5 rounded-xl border transition-all ${
                          done
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5'
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {done ? '✓ Mark as pending' : '○ Mark as done'}
                      </button>
                    </div>

                    <p className="jersey-20-regular text-white/25 text-sm mt-3 italic">
                      {step.hint}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── All steps done — congratulations ─────────── */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              key="congrats"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
              className="text-center py-10 px-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-transparent"
            >
              <p className="text-6xl mb-5">🎉</p>
              <h3 className={`jersey-15-regular text-gradient ${isMobile ? 'text-4xl' : 'text-5xl'} mb-4`}>
                You&apos;re in the draw!
              </h3>
              <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-base' : 'text-lg'} max-w-sm mx-auto leading-relaxed`}>
                All 3 steps completed! Winners will be announced on{' '}
                <a href={FOLLOW_URL} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
                  @nuxchain
                </a>{' '}
                after the token launch. Good luck! 🚀
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Rules & Terms ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3"
        >
          <h4 className="jersey-20-regular text-white/50 text-base uppercase tracking-widest">Giveaway Rules</h4>
          <ul className="space-y-2">
            {[
              '2 winners will be randomly selected from all eligible participants.',
              'Each winner will receive exactly 1 SOL (Solana) sent to their wallet.',
              'A minimum purchase of $20 USD in NUX must be confirmed on the whitelist.',
              'The tweet must be public and mention @nuxchain.',
              'One entry per wallet / X account.',
              'Winners will be announced on @nuxchain after the token launch.',
              'Nuxchain reserves the right to disqualify invalid or fraudulent entries.',
            ].map((rule, i) => (
              <li key={i} className={`jersey-20-regular text-white/40 ${isMobile ? 'text-base' : 'text-lg'} flex items-start gap-2.5`}>
                <span className="text-purple-500/70 shrink-0 mt-0.5">◆</span>
                {rule}
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </div>
  );
}
