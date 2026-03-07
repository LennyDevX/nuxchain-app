/**
 * SubscriptionModal
 * Crypto-native subscription payment flow — SOL wallet connect or QR code manual payment.
 *
 * - Shows Pro ($10) and Premium ($25) tiers
 * - Two payment methods: connect wallet (one-click) or scan QR + paste tx hash
 * - Verifies on-chain via /api/subscriptions/purchase
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
  type PaymentToken,
  type GeminiModel,
} from '../../../constants/subscription';

// Treasury wallet (manual QR payment recipient)
const TREASURY_DIRECT = 'GcfKd6DzFUANkRWkSwVp5YspaoRvS5j5GgRRvA8oBPXm';

// Treasury wallet from env (with direct fallback for QR code)
const TREASURY_WALLET = import.meta.env.VITE_DEPLOYER_NUX as string || TREASURY_DIRECT;

type PaymentMethod = 'wallet' | 'qr';
type Step = 'select' | 'qr' | 'processing' | 'success' | 'error';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIER_SKILLS_DISPLAY: Record<'pro' | 'premium', { icon: string; label: string }[]> = {
  pro: [
    { icon: '🖼️', label: 'NFT Listing' },
    { icon: '🔍', label: 'Risk Analysis' },
    { icon: '📈', label: 'Market Alpha' },
    { icon: '🚫', label: 'Unlimited queries' },
    { icon: '🤖', label: 'Choose your AI model' },
  ],
  premium: [
    { icon: '💎', label: 'Everything in Pro' },
    { icon: '🛡️', label: 'Content Moderation' },
    { icon: '🔐', label: 'Contract Auditor' },
    { icon: '🐋', label: 'Whale Tracker' },
    { icon: '💼', label: 'Portfolio Analyzer' },
    { icon: '🔬', label: 'Token Research' },
    { icon: '💧', label: 'Liquidity Advisor' },
  ],
};

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { refresh, tier: currentTier } = useSubscription();

  const [selectedTier, setSelectedTier] = useState<'pro' | 'premium'>('pro');
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('SOL');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-flash');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [errorMsg, setErrorMsg] = useState('');
  const [txSignature, setTxSignature] = useState('');
  const [manualTxHash, setManualTxHash] = useState('');
  const [verifyingManual, setVerifyingManual] = useState(false);

  const tierConfig = SUBSCRIPTION_PRICES[selectedTier];

  // ── Wallet-connect payment ──────────────────────────────────────────────
  const handlePayWithWallet = useCallback(async () => {
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
      const lamports = Math.ceil(tierConfig.minSol * LAMPORTS_PER_SOL);
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
        body: JSON.stringify({ wallet: publicKey.toBase58(), txSignature: sig, tier: selectedTier, paidWith: 'SOL', selectedModel }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error activating subscription');
      }
      // Save selected model to localStorage
      localStorage.setItem('selectedGeminiModel', selectedModel);
      await refresh();
      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection, sendTransaction, tierConfig, selectedTier, refresh]);

  // ── Manual QR verification ──────────────────────────────────────────────
  const handleVerifyManual = useCallback(async () => {
    if (!manualTxHash.trim()) return;
    if (!publicKey) {
      setErrorMsg('Connect your wallet to verify payment.');
      setStep('error');
      return;
    }
    setVerifyingManual(true);
    setStep('processing');
    try {
      const res = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toBase58(), txSignature: manualTxHash.trim(), tier: selectedTier, paidWith: 'SOL', selectedModel }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Could not verify payment');
      }
      // Save selected model to localStorage
      localStorage.setItem('selectedGeminiModel', selectedModel);
      setTxSignature(manualTxHash.trim());
      await refresh();
      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification failed. Did you send the correct amount?');
      setStep('error');
    } finally {
      setVerifyingManual(false);
    }
  }, [manualTxHash, publicKey, selectedTier, refresh]);

  const handleProceed = useCallback(() => {
    if (paymentToken === 'NUX') {
      setErrorMsg('NUX payments available after TGE (24 Mar 2026). Use SOL for now.');
      setStep('error');
      return;
    }
    if (paymentMethod === 'qr') {
      setStep('qr');
    } else {
      handlePayWithWallet();
    }
  }, [paymentToken, paymentMethod, handlePayWithWallet]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-24 sm:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0a0a14] border border-purple-500/30 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] mt-4 overflow-y-auto shadow-2xl shadow-purple-900/30 jersey-20-regular"
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
                <h2 className="text-3xl jersey-15-regular text-gradient">
                  ✨ NuxBee AI Premium
                </h2>
                <p className="jersey-20-regular text-base text-white/50 mt-1">
                  30 days · No auto-renewal
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* ── SUCCESS ─────────────────────────────────────────────── */}
            {step === 'success' && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl jersey-15-regular text-green-400 mb-2">Plan Activated!</h3>
                <p className="jersey-20-regular text-white/70 mb-4">
                  Tu plan <strong className="text-white capitalize">{selectedTier}</strong> is active for 30 days.
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

            {/* ── ERROR ───────────────────────────────────────────────── */}
            {step === 'error' && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
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

            {/* ── PROCESSING ──────────────────────────────────────────── */}
            {step === 'processing' && (
              <motion.div
                className="p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  ⚡
                </motion.div>
                <h3 className="text-3xl jersey-15-regular text-yellow-400 mb-2">Verifying payment...</h3>
                <p className="jersey-20-regular text-white/60 text-lg">
                  {paymentMethod === 'wallet' ? 'Confirm the transaction in your wallet.' : 'Verifying on-chain...'}
                </p>
              </motion.div>
            )}

            {/* ── QR PAYMENT ──────────────────────────────────────────── */}
            {step === 'qr' && (
              <motion.div
                className="p-6 space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center">
                  <p className="jersey-15-regular text-white text-3xl mb-2">
                    Send Direct Transfer
                  </p>
                  <p className="jersey-20-regular text-white/50 text-xl">
                    Send exactly <span className="text-purple-400 font-semibold inline-flex items-center gap-1">{tierConfig.minSol} <img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-5 h-5 object-contain" /></span> to activate  {tierConfig.label}
                  </p>
                </div>

                {/* Address copy */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="jersey-20-regular text-xl text-white/50 mb-3">Destination Address</p>
                  <div className="flex items-center gap-2">
                    <p className="jersey-20-regular text-white text-sm font-mono truncate flex-1">
                      {TREASURY_DIRECT}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(TREASURY_DIRECT)}
                      className="text-sm text-purple-400 hover:text-purple-300 flex-shrink-0 border border-purple-500/30 px-3 py-2 rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="jersey-20-regular text-xl text-white/40">Exact Amount</p>
                    <div className="jersey-20-regular text-2xl text-purple-300 font-semibold flex items-center gap-2"><img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-6 h-6 object-contain" /> {tierConfig.minSol}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="jersey-20-regular text-xs text-white/40">Already paid?</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Manual tx hash input */}
                <div className="space-y-2">
                  <p className="jersey-20-regular text-xl text-white/60 mb-3">Paste your transaction hash here:</p>
                  <input
                    type="text"
                    value={manualTxHash}
                    onChange={(e) => setManualTxHash(e.target.value)}
                    placeholder="5xK3... tx signature"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 jersey-20-regular text-white text-lg placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
                  />
                  {publicKey && (
                    <p className="jersey-20-regular text-base text-white/40">
                      Wallet: {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
                    </p>
                  )}
                  {!publicKey && (
                    <p className="jersey-20-regular text-base text-yellow-400/80">
                      ⚠️ Connect your wallet so we can verify payment
                    </p>
                  )}
                  <button
                    onClick={handleVerifyManual}
                    disabled={!manualTxHash.trim() || verifyingManual || !publicKey}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl jersey-20-regular text-lg font-semibold transition-all"
                  >
                    {verifyingManual ? '⏳ Verifying...' : '✅ Verify Payment'}
                  </button>
                </div>

                <button onClick={() => setStep('select')} className="w-full text-center text-lg jersey-20-regular text-white/40 hover:text-white/60 mt-4 transition-colors">
                  ← Back to selection
                </button>
              </motion.div>
            )}

            {/* ── SELECT ──────────────────────────────────────────────── */}
            {step === 'select' && (
              <div className="p-6 space-y-5">
                {/* Tier selector */}
                <div className="grid grid-cols-2 gap-3">
                  {(['pro', 'premium'] as const).map(t => {
                    const config = SUBSCRIPTION_PRICES[t];
                    const isSelected = selectedTier === t;
                    const isCurrent = currentTier === t;
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
                          <span className="absolute top-2 right-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full jersey-20-regular">
                            Current
                          </span>
                        )}
                        {isSelected && t === 'premium' && (
                          <span className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full jersey-20-regular">
                            Most Popular
                          </span>
                        )}
                        <div className="jersey-15-regular text-white text-2xl capitalize">{config.label}</div>
                        <div className="jersey-15-regular text-purple-400 text-4xl mt-2 font-bold">
                          ${config.usd}<span className="jersey-20-regular text-lg text-white/40 ml-2">/mo</span>
                        </div>
                        <div className="jersey-20-regular text-sm text-white/50 mt-2 flex items-center justify-start gap-1.5 font-medium">
                          ~{config.minSol} <img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-4 h-4 object-contain" /> · 30 days
                        </div>
                        <ul className="mt-3 space-y-1">
                          {TIER_SKILLS_DISPLAY[t].slice(0, 4).map((s, i) => (
                            <li key={i} className="jersey-20-regular text-base text-white/60 flex items-center gap-1.5 mb-1.5">
                              <span>{s.icon}</span> {s.label}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                {/* AI Model Selection (Pro & Premium only) */}
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-5">
                  <p className="jersey-15-regular text-white text-2xl mb-4">🤖 Select Your AI Model</p>
                  <div className="space-y-3">
                    {(['gemini-pro', 'gemini-flash'] as const).map(modelId => {
                      const model = GEMINI_MODELS[modelId];
                      return (
                        <button
                          key={modelId}
                          onClick={() => setSelectedModel(modelId)}
                          className={`w-full p-4 rounded-lg border transition-all text-left ${
                            selectedModel === modelId
                              ? 'border-blue-500 bg-blue-900/30 text-white'
                              : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="jersey-15-regular text-lg">{model.label}</p>
                              <p className="jersey-20-regular text-base text-white/50 mt-1">{model.description}</p>
                            </div>
                            <span className="text-xl">{selectedModel === modelId ? '✓' : ''}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <p className="jersey-20-regular text-2xl text-white/50 mb-3">Payment Method:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('qr')}
                      className={`py-3 rounded-xl border jersey-20-regular text-2xl transition-all ${
                        paymentMethod === 'qr'
                          ? 'border-purple-500 bg-purple-900/20 text-white'
                          : 'border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >
                      💸 Manual Transfer
                    </button>
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`py-3 rounded-xl border jersey-20-regular text-2xl transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-purple-500 bg-purple-900/20 text-white'
                          : 'border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >
                      🔗 Connect Wallet
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['SOL', 'NUX'] as PaymentToken[]).map(token => (
                      <button
                        key={token}
                        onClick={() => setPaymentToken(token)}
                        className={`py-2 rounded-xl border jersey-20-regular text-2xl transition-all ${
                          paymentToken === token
                            ? 'border-purple-500 bg-purple-900/20 text-white'
                            : 'border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {token === 'SOL' ? <span className="flex items-center justify-center gap-2"><img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-12 h-12 object-contain" /> SOL</span> : '🪙 NUX (post-TGE)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary pill */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl px-5 py-4">
                  <div>
                    <p className="jersey-15-regular text-white text-2xl capitalize">{selectedTier} Plan · 30 days</p>
                    <p className="jersey-20-regular text-base text-white/50">{TIER_SKILLS[selectedTier].length} skills included · No auto-renewal</p>
                  </div>
                  <div className="jersey-15-regular text-purple-400 text-4xl flex items-center gap-2 font-bold">{tierConfig.minSol} <img src="/assets/tokens/SolanaLogo.png" alt="SOL" className="w-8 h-8 object-contain" /></div>
                </div>

                {paymentMethod === 'wallet' && !connected && (
                  <p className="jersey-20-regular text-2xl text-yellow-400/80 text-center">
                    ⚠️ Connect your Solana wallet before continuing
                  </p>
                )}

                <button
                  onClick={handleProceed}
                  disabled={loading || (paymentMethod === 'wallet' && !connected)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl jersey-15-regular text-2xl transition-all shadow-lg shadow-purple-900/30"
                >
                  {paymentMethod === 'qr' ? '💸 Manual Transfer →' : '⚡ Pay with Wallet →'}
                </button>

                <p className="jersey-20-regular text-center text-sm text-white/50 mt-2">
                  All payments are on-chain. Verification takes up to 30 seconds.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SubscriptionModal;
