/**
 * SubscriptionModal
 * Crypto-native subscription payment flow.
 *
 * - Shows Pro ($10) and Premium ($25) tiers
 * - Live SOL price via CoinGecko → exact dynamic SOL amount
 * - One-click wallet payment: click Pay → wallet opens → done
 * - 30-day access, no auto-renewal
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useSubscription } from '../../../context/SubscriptionContext';
import {
  SUBSCRIPTION_PRICES,
  TIER_SKILLS,
  GEMINI_MODELS,
  type GeminiModel,
} from '../../../constants/subscription';
import { useSolPrice } from '../../../hooks/useSolPrice';

// Treasury wallet
const TREASURY_DIRECT = 'GcfKd6DzFUANkRWkSwVp5YspaoRvS5j5GgRRvA8oBPXm';
const TREASURY_WALLET = (import.meta.env.VITE_DEPLOYER_NUX as string) || TREASURY_DIRECT;

type Step = 'select' | 'processing' | 'success' | 'error';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIER_SKILLS_DISPLAY: Record<'pro' | 'premium', { icon: string; label: string }[]> = {
  pro: [
    { icon: '🖼️', label: 'NFT Listing' },
    { icon: '🔍', label: 'Risk Analysis' },
    { icon: '📈', label: 'Market Alpha' },
    { icon: '∞', label: 'Unlimited queries' },
  ],
  premium: [
    { icon: '💎', label: 'Everything in Pro' },
    { icon: '🛡️', label: 'Content Moderation' },
    { icon: '🔐', label: 'Contract Auditor' },
    { icon: '🐋', label: 'Whale Tracker' },
  ],
};

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { refresh, tier: currentTier } = useSubscription();
  const { solPrice, loading: priceLoading, error: priceError, getSolAmount } = useSolPrice();

  const [selectedTier, setSelectedTier] = useState<'pro' | 'premium'>('pro');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-flash');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [txSignature, setTxSignature] = useState('');

  const tierConfig = SUBSCRIPTION_PRICES[selectedTier];
  const solAmount = getSolAmount(tierConfig.usd);

  // ── Wallet payment ──────────────────────────────────────────────────────
  const handlePay = useCallback(async () => {
    if (!publicKey || !connected) {
      setErrorMsg('Connect your Solana wallet first.');
      setStep('error');
      return;
    }
    setLoading(true);
    setStep('processing');
    setErrorMsg('');
    try {
      const treasury = new PublicKey(TREASURY_WALLET);
      const lamports = Math.ceil(solAmount * LAMPORTS_PER_SOL);
      const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: treasury, lamports })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const sig = await sendTransaction(transaction, connection);
      setTxSignature(sig);
      await connection.confirmTransaction(sig, 'confirmed');

      const res = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          txSignature: sig,
          tier: selectedTier,
          paidWith: 'SOL',
          selectedModel,
          solAmount,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error activating subscription');
      }
      localStorage.setItem('selectedGeminiModel', selectedModel);
      await refresh();
      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection, sendTransaction, solAmount, selectedTier, selectedModel, refresh]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-24 sm:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="bg-[#0a0a14] border border-purple-500/30 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl shadow-purple-900/30"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-3xl jersey-15-regular text-gradient">✨ Unlock NuxBee AI</h2>
                <p className="jersey-20-regular text-base text-white/50 mt-1">30 days · No auto-renewal</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* ── SUCCESS ───────────────────────────────────────────── */}
            {step === 'success' && (
              <motion.div className="p-8 text-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl jersey-15-regular text-green-400 mb-2">Plan Activated!</h3>
                <p className="jersey-20-regular text-white/70 mb-4">
                  Your <strong className="text-white capitalize">{selectedTier}</strong> plan is active for 30 days.
                </p>
                {txSignature && (
                  <a
                    href={`https://solscan.io/tx/${txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 text-sm jersey-20-regular hover:underline"
                  >
                    View on Solscan ↗
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl jersey-20-regular font-semibold transition-all"
                >
                  Use my Skills now!
                </button>
              </motion.div>
            )}

            {/* ── ERROR ─────────────────────────────────────────────── */}
            {step === 'error' && (
              <motion.div className="p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl jersey-15-regular text-red-400 mb-2">Something went wrong</h3>
                <p className="jersey-20-regular text-white/60 text-sm mb-6">{errorMsg}</p>
                <button
                  onClick={() => { setStep('select'); setErrorMsg(''); }}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl jersey-20-regular transition-colors"
                >
                  ← Go Back
                </button>
              </motion.div>
            )}

            {/* ── PROCESSING ────────────────────────────────────────── */}
            {step === 'processing' && (
              <motion.div className="p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  ⚡
                </motion.div>
                <h3 className="text-3xl jersey-15-regular text-yellow-400 mb-2">Processing payment...</h3>
                <p className="jersey-20-regular text-white/60 text-lg">Confirm the transaction in your wallet.</p>
              </motion.div>
            )}

            {/* ── SELECT ────────────────────────────────────────────── */}
            {step === 'select' && (
              <div className="p-5 space-y-4">

                {/* Tier cards */}
                <div className="grid grid-cols-2 gap-3">
                  {(['pro', 'premium'] as const).map(t => {
                    const config = SUBSCRIPTION_PRICES[t];
                    const isSelected = selectedTier === t;
                    const isCurrent = currentTier === t;
                    const tierSol = getSolAmount(config.usd);
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTier(t)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-900/20'
                            : 'border-white/10 bg-white/5 hover:border-purple-500/40'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full jersey-20-regular">Current</span>
                        )}
                        {!isCurrent && t === 'premium' && (
                          <span className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full jersey-20-regular">Popular</span>
                        )}
                        <div className="jersey-15-regular text-white text-3xl capitalize">{config.label}</div>
                        <div className="jersey-15-regular text-purple-400 text-5xl mt-1 font-bold">
                          ${config.usd}<span className="jersey-20-regular text-xl text-white/40 ml-1">/mo</span>
                        </div>
                        {/* Dynamic SOL price */}
                        <div className="mt-3 flex items-center gap-2">
                          {priceLoading ? (
                            <span className="text-sm text-white/30 animate-pulse jersey-20-regular">Loading...</span>
                          ) : (
                            <span className="jersey-15-regular text-xl font-bold text-emerald-400 flex items-center gap-1.5">
                              <img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-10 h-10 object-contain" />
                              {tierSol} SOL
                            </span>
                          )}
                        </div>
                        <ul className="mt-3 space-y-2">
                          {TIER_SKILLS_DISPLAY[t].map((s, i) => (
                            <li key={i} className="jersey-20-regular text-base text-white/60 flex items-center gap-2">
                              <span>{s.icon}</span> {s.label}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                {/* AI Model Selection */}
                <div className="bg-[#0f0f1e] border border-blue-500/20 rounded-xl p-4">
                  <p className="jersey-15-regular text-white text-2xl mb-3">🤖 Select Your AI Model</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['gemini-pro', 'gemini-flash'] as const).map(modelId => {
                      const model = GEMINI_MODELS[modelId];
                      return (
                        <button
                          key={modelId}
                          onClick={() => setSelectedModel(modelId)}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            selectedModel === modelId
                              ? 'border-blue-500 bg-blue-900/30 text-white'
                              : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="jersey-15-regular text-lg">{model.label}</p>
                              <p className="jersey-20-regular text-sm text-white/40 mt-1 leading-tight">{model.description}</p>
                            </div>
                            {selectedModel === modelId && <span className="text-blue-400 text-lg flex-shrink-0">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pay button area */}
                <div className="space-y-3 pt-1">
                  {/* Price summary */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl px-4 py-3">
                    <div>
                      <p className="jersey-15-regular text-white text-xl capitalize">{selectedTier} Plan · 30 days</p>
                      <p className="jersey-20-regular text-base text-white/40">
                        {TIER_SKILLS[selectedTier].length} skills · No auto-renewal
                      </p>
                    </div>
                    <div className="text-right">
                      {priceLoading ? (
                        <div className="w-24 h-8 bg-white/10 rounded animate-pulse" />
                      ) : (
                        <>
                          <p className="jersey-15-regular text-purple-300 text-4xl font-bold flex items-center gap-2 justify-end">
                            <img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-10 h-10 object-contain" />
                            {solAmount}
                          </p>
                          <p className="jersey-20-regular text-sm text-white/30 mt-0.5">
                            ≈ ${tierConfig.usd} USD
                            {solPrice && !priceError && (
                              <span className="ml-1">@ ${solPrice.toFixed(2)}</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Wallet not connected warning */}
                  {!connected && (
                    <p className="jersey-20-regular text-sm text-yellow-400/80 text-center bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3">
                      ⚠️ Connect your Solana wallet before paying
                    </p>
                  )}

                  {/* Price error notice */}
                  {priceError && (
                    <p className="jersey-20-regular text-xs text-white/30 text-center">
                      ⚠️ Using estimated SOL price. Amount may differ slightly.
                    </p>
                  )}

                  {/* PAY button */}
                  <button
                    onClick={handlePay}
                    disabled={loading || !connected || priceLoading}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl jersey-15-regular text-3xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-3"
                  >
                    <img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-12 h-12 object-contain" />
                    {priceLoading ? 'Fetching price...' : `Pay ${solAmount} SOL`}
                  </button>

                  <p className="jersey-20-regular text-center text-xs text-white/30">
                    All payments are on-chain · Verification takes ~30 seconds
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

