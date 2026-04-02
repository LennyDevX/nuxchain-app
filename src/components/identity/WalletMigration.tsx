import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { doc, getDoc, setDoc, serverTimestamp, collection, getCountFromServer } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { isEligibleSolanaWallet, isValidSolanaAddress } from '../../data/migrationEligible';

// ─── Firebase ──────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ─── Types ─────────────────────────────────────────────────────────────────
type Step = 'verify' | 'connect' | 'confirm' | 'done';

interface MigrationRecord {
  solanaAddress: string;
  polygonAddress: string;
  migratedAt: ReturnType<typeof serverTimestamp>;
  source: 'hybrid-2026-03-21';
}

const TOTAL_ELIGIBLE = 229;

const STEPS: Step[] = ['verify', 'connect', 'confirm', 'done'];
const STEP_LABELS: Record<Step, string> = { verify: 'Verify', connect: 'Connect', confirm: 'Confirm', done: 'Done' };

const panelVariants: Variants = {
  enter: { opacity: 0, y: 20, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.15 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

// ─── Migration progress hook ───────────────────────────────────────────────
function useMigrationCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCountFromServer(collection(db, 'walletMigrations'))
      .then(snap => { if (!cancelled) setCount(snap.data().count); })
      .catch(() => { if (!cancelled) setCount(null); });
    return () => { cancelled = true; };
  }, []);

  return count;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function WalletMigration() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();

  const migrationCount = useMigrationCount();
  const [migrationCountOverride, setMigrationCountOverride] = useState<number | null>(null);
  const displayCount = migrationCountOverride ?? migrationCount;

  const [step, setStep] = useState<Step>('verify');
  const [solanaInput, setSolanaInput] = useState('');
  const [verifiedSolana, setVerifiedSolana] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [alreadyMigrated, setAlreadyMigrated] = useState(false);

  const handleVerify = useCallback(async () => {
    const trimmed = solanaInput.trim();
    setValidationError('');

    if (!isValidSolanaAddress(trimmed)) {
      setValidationError('Invalid Solana address format.');
      return;
    }
    if (!isEligibleSolanaWallet(trimmed)) {
      setValidationError('Not in the eligible list. Only March 2026 airdrop wallets can migrate.');
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'walletMigrations', trimmed));
      if (snap.exists()) {
        setAlreadyMigrated(true);
        setVerifiedSolana(trimmed);
        setStep('done');
        return;
      }
    } catch { /* proceed */ }

    setVerifiedSolana(trimmed);
    setStep('connect');
  }, [solanaInput]);

  const handleConfirm = useCallback(async () => {
    if (!address || !verifiedSolana) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const record: MigrationRecord = {
        solanaAddress: verifiedSolana,
        polygonAddress: address.toLowerCase(),
        migratedAt: serverTimestamp(),
        source: 'hybrid-2026-03-21',
      };
      await setDoc(doc(db, 'walletMigrations', verifiedSolana), record);
      setStep('done');
      // Re-fetch count after successful migration
      getCountFromServer(collection(db, 'walletMigrations'))
        .then(snap => setMigrationCountOverride(snap.data().count))
        .catch(() => {});
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [address, verifiedSolana]);

  const truncate = (addr: string, start = 6, end = 4) =>
    `${addr.slice(0, start)}…${addr.slice(-end)}`;

  const currentIndex = STEPS.indexOf(step);

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-8">

      {/* ── outer container ── */}
      <div className="w-full max-w-sm">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/10 border border-white/10 mb-4 overflow-hidden">
            <img src="/assets/tokens/SolanaLogo.png" alt="Solana" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="jersey-15-regular text-white text-5xl mb-2 leading-tight">
            Wallet Migration
          </h1>
          <p className="jersey-20-regular text-white/40 text-lg leading-relaxed">
            Link your Solana wallet to Polygon<br />to qualify for the POL airdrop.
          </p>
        </motion.div>

        {/* ── Migration progress bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-6"
        >
          <div className="rounded-2xl bg-white/[0.03] border border-white/8 overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-400/70">✦</span>
                <span className="jersey-20-regular text-white/50 text-sm uppercase tracking-wider">Migration Progress</span>
              </div>
              <div className="flex items-baseline gap-1">
                {displayCount === null ? (
                  <motion.span
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="jersey-20-regular text-white/25 text-sm"
                  >
                    loading…
                  </motion.span>
                ) : (
                  <>
                    <motion.span
                      key={displayCount}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="jersey-15-regular text-white text-2xl leading-none"
                    >
                      {displayCount}
                    </motion.span>
                    <span className="jersey-20-regular text-white/30 text-sm">/ {TOTAL_ELIGIBLE}</span>
                  </>
                )}
              </div>
            </div>

            {/* track */}
            <div className="relative h-1.5 bg-white/6">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: displayCount === null ? '0%' : `${Math.min((displayCount / TOTAL_ELIGIBLE) * 100, 100)}%` }}
                transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.3 }}
              />

            </div>

            <div className="px-4 pb-3.5 pt-2.5 flex items-center justify-between">
              <span className="jersey-20-regular text-white/25 text-xs">
                {displayCount === null ? '—' : `${TOTAL_ELIGIBLE - displayCount} spots left`}
              </span>
              <span className="jersey-20-regular text-emerald-400/60 text-xs">
                {displayCount === null ? '' : `${Math.round((displayCount / TOTAL_ELIGIBLE) * 100)}% complete`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Step dots ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-1.5 mb-6"
        >
          {STEPS.map((s, i) => {
            const isActive = s === step;
            const isDone = i < currentIndex;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <motion.div
                  animate={{
                    width: isActive ? 28 : 8,
                    backgroundColor: isDone ? '#34d399' : isActive ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="h-2 rounded-full"
                />
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-px ${isDone ? 'bg-emerald-400/40' : 'bg-white/8'} transition-colors duration-300`} />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* ── Step label ── */}
        <motion.p
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="jersey-20-regular text-white/30 text-sm uppercase tracking-widest text-center mb-5"
        >
          Step {currentIndex + 1} of {STEPS.length} — {STEP_LABELS[step]}
        </motion.p>

        {/* ── Step panels ── */}
        <AnimatePresence mode="wait">

          {/* ───── STEP 1 — Verify ───── */}
          {step === 'verify' && (
            <motion.div key="verify" variants={panelVariants} initial="enter" animate="center" exit="exit">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl overflow-hidden">

                <div className="px-5 pt-5 pb-4 border-b border-white/8">
                  <motion.div custom={0} variants={childVariants} initial="hidden" animate="show" className="flex items-center gap-3">
                    
                    <div>
                      <p className="jersey-15-regular text-white text-2xl leading-tight">Verify Solana Wallet</p>
                      <p className="jersey-20-regular text-white/35 text-sm mt-0.5">Enter your registered address</p>
                    </div>
                  </motion.div>
                </div>

                <div className="p-5 space-y-4">
                  <motion.div custom={1} variants={childVariants} initial="hidden" animate="show">
                    <input
                      type="text"
                      value={solanaInput}
                      onChange={e => { setSolanaInput(e.target.value); setValidationError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleVerify()}
                      placeholder="Paste Solana address…"
                      maxLength={44}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/80 font-mono text-sm placeholder-white/20 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.07] transition-all duration-200"
                      autoComplete="off"
                      spellCheck={false}
                      autoFocus
                    />
                    <AnimatePresence>
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="jersey-20-regular text-red-400/90 text-sm mt-2 flex items-center gap-1.5 pl-1">
                            <span>⚠</span> {validationError}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div custom={2} variants={childVariants} initial="hidden" animate="show"
                    className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
                    <span className="text-blue-400/70 text-xs mt-0.5 flex-shrink-0">🔒</span>
                    <p className="jersey-20-regular text-blue-300/70 text-sm leading-relaxed">
                      Only wallets from the March 2026 airdrop report are eligible. Off-chain, no gas required.
                    </p>
                  </motion.div>

                  <motion.button
                    custom={3} variants={childVariants} initial="hidden" animate="show"
                    onClick={handleVerify}
                    disabled={solanaInput.trim().length < 32}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-white/8 disabled:text-white/25 text-black jersey-15-regular text-lg font-bold transition-colors duration-150 disabled:cursor-not-allowed"
                  >
                    Verify Wallet →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── STEP 2 — Connect ───── */}
          {step === 'connect' && (
            <motion.div key="connect" variants={panelVariants} initial="enter" animate="center" exit="exit">
              <div className="rounded-2xl bg-white/[0.04] border border-emerald-500/15 backdrop-blur-xl overflow-hidden">

                {/* verified badge */}
                <div className="px-5 py-3 bg-emerald-500/8 border-b border-emerald-500/10 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</span>
                  <div className="min-w-0">
                    <span className="jersey-20-regular text-emerald-400 text-sm">Solana verified · </span>
                    <span className="font-mono text-white/50 text-sm">{truncate(verifiedSolana)}</span>
                  </div>
                </div>

                <div className="px-5 pt-5 pb-4 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-base flex-shrink-0">
                      ⬡
                    </div>
                    <div>
                      <p className="jersey-15-regular text-white text-2xl leading-tight">Connect Polygon Wallet</p>
                      <p className="jersey-20-regular text-white/35 text-sm mt-0.5">Receive your POL airdrop here</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {!isConnected ? (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => connect({ connector: injected() })}
                        className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 active:bg-purple-600 text-white jersey-15-regular text-lg font-bold transition-colors duration-150 flex items-center justify-center gap-2"
                      >
                        <span>👛</span> Connect Wallet
                      </motion.button>
                      <p className="jersey-20-regular text-white/25 text-sm text-center">
                        MetaMask · Rabby · Coinbase Wallet · any EVM
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3.5 rounded-xl bg-purple-500/8 border border-purple-500/15">
                        <p className="jersey-20-regular text-purple-300/70 text-xs uppercase tracking-wider mb-1">Connected</p>
                        <p className="font-mono text-white/70 text-sm break-all leading-relaxed">{address}</p>
                      </div>

                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
                        <span className="text-amber-400/70 text-xs flex-shrink-0 mt-0.5">⚠</span>
                        <p className="jersey-20-regular text-amber-300/70 text-sm leading-relaxed">
                          Confirm this is the correct address — this mapping cannot be changed.
                        </p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep('confirm')}
                        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black jersey-15-regular text-lg font-bold transition-colors duration-150"
                      >
                        Use This Address →
                      </motion.button>
                    </>
                  )}

                  <button
                    onClick={() => { setStep('verify'); setVerifiedSolana(''); }}
                    className="w-full py-2 jersey-20-regular text-white/25 hover:text-white/50 text-sm transition-colors duration-150"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── STEP 3 — Confirm ───── */}
          {step === 'confirm' && (
            <motion.div key="confirm" variants={panelVariants} initial="enter" animate="center" exit="exit">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl overflow-hidden">

                <div className="px-5 pt-5 pb-4 border-b border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-base flex-shrink-0">
                      🔗
                    </div>
                    <div>
                      <p className="jersey-15-regular text-white text-2xl leading-tight">Confirm Migration</p>
                      <p className="jersey-20-regular text-white/35 text-sm mt-0.5">Review before submitting</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {/* wallet pair */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
                    <div className="px-4 py-3.5 flex items-center gap-3">
                      <span className="text-sm opacity-60 flex-shrink-0">◎</span>
                      <div className="flex-1 min-w-0">
                        <p className="jersey-20-regular text-white/35 text-xs uppercase tracking-wider">Solana · verified</p>
                        <p className="font-mono text-white/65 text-sm mt-0.5 truncate">{verifiedSolana}</p>
                      </div>
                      <span className="text-emerald-400 text-xs flex-shrink-0">✓</span>
                    </div>

                    <div className="flex items-center gap-3 px-4">
                      <div className="w-px h-5 bg-white/10 ml-[7px]" />
                      <span className="text-white/20 text-xs">↕</span>
                    </div>

                    <div className="px-4 py-3.5 flex items-center gap-3 bg-purple-500/5">
                      <span className="text-sm text-purple-400/60 flex-shrink-0">⬡</span>
                      <div className="flex-1 min-w-0">
                        <p className="jersey-20-regular text-purple-300/50 text-xs uppercase tracking-wider">Polygon · airdrop</p>
                        <p className="font-mono text-white/65 text-sm mt-0.5 truncate">{address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-500/8 border border-blue-500/12">
                    <span className="text-xs flex-shrink-0 mt-0.5">🔒</span>
                    <p className="jersey-20-regular text-blue-300/65 text-sm leading-relaxed">
                      Stored securely for POL distribution. No signature or gas needed.
                    </p>
                  </div>

                  <AnimatePresence>
                    {submitError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="jersey-20-regular text-red-400/90 text-sm flex items-center gap-1.5 overflow-hidden pl-1"
                      >
                        <span>⚠</span> {submitError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black jersey-15-regular text-lg font-bold transition-colors duration-150 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                        />
                        Saving…
                      </>
                    ) : '✓ Complete Migration'}
                  </motion.button>

                  <button
                    onClick={() => setStep('connect')}
                    className="w-full py-2 jersey-20-regular text-white/25 hover:text-white/50 text-sm transition-colors duration-150"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── STEP 4 — Done ───── */}
          {step === 'done' && (
            <motion.div key="done" variants={panelVariants} initial="enter" animate="center" exit="exit">
              <div className="rounded-2xl bg-white/[0.04] border border-emerald-500/20 backdrop-blur-xl overflow-hidden text-center">
                <div className="px-6 py-8 space-y-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                    className="text-5xl"
                  >
                    {alreadyMigrated ? '✅' : '🎉'}
                  </motion.div>

                  <motion.div custom={1} variants={childVariants} initial="hidden" animate="show">
                    <p className="jersey-15-regular text-emerald-400 text-3xl mb-1">
                      {alreadyMigrated ? 'Already Migrated' : 'Migration Complete'}
                    </p>
                    <p className="jersey-20-regular text-white/40 text-base">
                      {alreadyMigrated
                        ? 'This Solana wallet is already on the airdrop list.'
                        : 'Your wallets are linked. POL airdrop will be sent to your Polygon address.'
                      }
                    </p>
                  </motion.div>

                  <motion.div custom={2} variants={childVariants} initial="hidden" animate="show"
                    className="rounded-xl bg-white/[0.03] border border-white/8 text-left overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-white/6">
                      <span className="text-xs opacity-50">◎</span>
                      <p className="font-mono text-white/45 text-sm truncate">{truncate(verifiedSolana, 10, 6)}</p>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="text-xs text-purple-400/50">⬡</span>
                      <p className="font-mono text-white/45 text-sm truncate">{address ? truncate(address, 10, 6) : '—'}</p>
                    </div>
                  </motion.div>

                  <motion.a
                    custom={3} variants={childVariants} initial="hidden" animate="show"
                    href="/rewards"
                    whileTap={{ scale: 0.98 }}
                    className="inline-block w-full py-3.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 jersey-20-regular text-base transition-colors duration-150 border border-white/8"
                  >
                    ← Back to Rewards
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
