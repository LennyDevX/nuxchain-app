import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { LAUNCHPAD_CONFIG, nuxToSol } from '../../constants/launchpad';
import type { TierId } from '../../constants/launchpad';

interface BuyModalProps {
  tierId: TierId;
  onClose: () => void;
}

type Step = 'connect' | 'whitelist-check' | 'input' | 'confirm' | 'success' | 'error';

const RPC = import.meta.env.VITE_SOLANA_RPC_QUICKNODE || 'https://solana-rpc.publicnode.com';

export default function BuyModal({ tierId, onClose }: BuyModalProps) {
  const { publicKey, connected, sendTransaction } = useWallet();
  const tier = LAUNCHPAD_CONFIG.tiers[tierId];

  const [step, setStep] = useState<Step>(() => (!connected ? 'connect' : tier.requiresWhitelist ? 'whitelist-check' : 'input'));
  const [nuxAmount, setNuxAmount] = useState<string>('');
  const [whitelistStatus, setWhitelistStatus] = useState<'checking' | 'eligible' | 'ineligible' | null>(null);
  const [txSignature, setTxSignature] = useState('');
  const [nuxPurchased, setNuxPurchased] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const solCost = nuxAmount ? nuxToSol(Number(nuxAmount), tierId) : 0;
  const minBuy = tier.minBuy ?? 1_000;

  // Move to input once wallet connects
  useEffect(() => {
    if (connected && step === 'connect') {
      setStep(tier.requiresWhitelist ? 'whitelist-check' : 'input');
    }
  }, [connected, step, tier.requiresWhitelist]);

  // Auto-check whitelist
  useEffect(() => {
    if (step === 'whitelist-check' && connected && publicKey) {
      checkWhitelist();
    }
  }, [step, connected, publicKey]);

  async function checkWhitelist() {
    if (!publicKey) return;
    setWhitelistStatus('checking');
    try {
      const res = await fetch(`/api/launchpad/verify-whitelist?wallet=${publicKey.toBase58()}`);
      const data = await res.json();
      setWhitelistStatus(data.eligible ? 'eligible' : 'ineligible');
      if (data.eligible) setTimeout(() => setStep('input'), 1200);
    } catch {
      setWhitelistStatus('ineligible');
    }
  }

  async function handleBuy() {
    if (!publicKey || !connected) return;
    const amount = Number(nuxAmount);
    if (!amount || amount < minBuy) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const connection = new Connection(RPC, 'confirmed');
      const lamports = Math.round(solCost * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(LAUNCHPAD_CONFIG.treasuryWallet),
          lamports,
        })
      );

      setStep('confirm');
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      // Register with backend
      const res = await fetch('/api/launchpad/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toBase58(), txSignature: sig, tier: tierId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Purchase registration failed');

      setTxSignature(sig);
      setNuxPurchased(data.nuxAmount);
      setStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(msg.includes('rejected') ? 'Transaction cancelled by user.' : msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  const COLORS = {
    1: { text: 'text-emerald-400', btn: 'from-emerald-500 to-green-500', badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
    2: { text: 'text-blue-400', btn: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
    3: { text: 'text-purple-400', btn: 'from-purple-500 to-pink-500', badge: 'bg-purple-500/20 border-purple-500/30 text-purple-400' },
  }[tierId];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-sm card-unified border border-white/10 p-6 flex flex-col gap-5"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <span className={`jersey-20-regular text-lg border px-2 py-0.5 rounded-full ${COLORS.badge}`}>
                {tier.badge}
              </span>
              <h2 className={`jersey-15-regular text-2xl mt-1 ${COLORS.text}`}>Buy {tier.label}</h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
          </div>

          {/* Step: Connect */}
          {step === 'connect' && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">👛</div>
              <p className="jersey-20-regular text-slate-300">Connect your Solana wallet to continue</p>
              <p className="jersey-20-regular text-slate-500 text-xl">Use Phantom, Solflare, or any wallet adapter</p>
            </div>
          )}

          {/* Step: Whitelist Check */}
          {step === 'whitelist-check' && (
            <div className="text-center space-y-3 py-4">
              {whitelistStatus === 'checking' && (
                <>
                  <div className="animate-spin text-3xl">⚙️</div>
                  <p className="jersey-20-regular text-slate-300">Checking whitelist eligibility...</p>
                </>
              )}
              {whitelistStatus === 'eligible' && (
                <>
                  <div className="text-4xl">✅</div>
                  <p className="jersey-20-regular text-emerald-400">Whitelist Eligible!</p>
                  <p className="jersey-20-regular text-slate-500 text-xl">Redirecting to purchase...</p>
                </>
              )}
              {whitelistStatus === 'ineligible' && (
                <>
                  <div className="text-4xl">⛔</div>
                  <p className="jersey-20-regular text-red-400">Not registered in Airdrop</p>
                  <p className="jersey-20-regular text-slate-500 text-xl">
                    Tier 1 is exclusive to Airdrop participants.
                  </p>
                  <a href="/airdrop" className="jersey-20-regular text-blue-400 text-xl underline">Register for Airdrop →</a>
                </>
              )}
            </div>
          )}

          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl border border-white/10 p-4 space-y-3">
                <label className="jersey-20-regular text-slate-400 text-xl uppercase tracking-wide">
                  Amount to buy
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={minBuy}
                    step={1000}
                    placeholder={`Min ${minBuy.toLocaleString()}`}
                    value={nuxAmount}
                    onChange={(e) => setNuxAmount(e.target.value)}
                    className="flex-1 bg-transparent jersey-20-regular text-white text-lg outline-none placeholder-slate-600"
                  />
                  <span className={`jersey-20-regular text-xl ${COLORS.text}`}>NUX</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between">
                  <span className="jersey-20-regular text-slate-500 text-xl">You pay</span>
                  <span className={`jersey-15-regular text-xl ${COLORS.text}`}>
                    {solCost > 0 ? `${solCost.toFixed(6)} SOL` : '—'}
                  </span>
                </div>
              </div>

              {/* Price info */}
              <div className="flex justify-between text-xl">
                <span className="jersey-20-regular text-slate-500">Price</span>
                <span className="jersey-20-regular text-slate-300">{tier.price} SOL / NUX</span>
              </div>

              <button
                onClick={handleBuy}
                disabled={!nuxAmount || Number(nuxAmount) < minBuy || loading || !LAUNCHPAD_CONFIG.treasuryWallet}
                className={`w-full py-3 rounded-xl jersey-20-regular text-xl text-white bg-gradient-to-r ${COLORS.btn}
                  transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg`}
              >
                {!LAUNCHPAD_CONFIG.treasuryWallet
                  ? 'Coming Soon'
                  : loading ? 'Processing...' : `Buy ${nuxAmount ? Number(nuxAmount).toLocaleString() : ''} NUX →`}
              </button>

              {!LAUNCHPAD_CONFIG.treasuryWallet && (
                <p className="jersey-20-regular text-amber-500 text-xl text-center">
                  ⚠️ Presale wallet not configured yet. Check back soon.
                </p>
              )}
            </div>
          )}

          {/* Step: Confirm (waiting for tx) */}
          {step === 'confirm' && (
            <div className="text-center space-y-3 py-6">
              <div className="animate-pulse text-4xl">⏳</div>
              <p className="jersey-20-regular text-white">Confirming transaction...</p>
              <p className="jersey-20-regular text-slate-500 text-xl">Please approve in your wallet and wait</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4 py-4">
              <div className="text-5xl">🎉</div>
              <p className={`jersey-15-regular text-2xl ${COLORS.text}`}>Purchase Confirmed!</p>
              <div className="bg-black/30 rounded-xl border border-white/10 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="jersey-20-regular text-slate-400 text-xl">NUX Reserved</span>
                  <span className={`jersey-15-regular text-lg ${COLORS.text}`}>{nuxPurchased.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="jersey-20-regular text-slate-400 text-xl">Tier</span>
                  <span className="jersey-20-regular text-slate-300 text-xl">{tier.badge} {tier.label}</span>
                </div>
              </div>
              <p className="jersey-20-regular text-slate-500 text-xl">
                Tokens will be distributed at TGE (Mar 24). Check your wallet then.
              </p>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="jersey-20-regular text-blue-400 text-xl underline"
              >
                View on Solana Explorer →
              </a>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl jersey-20-regular text-xl text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors">
                Close
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center space-y-4 py-4">
              <div className="text-4xl">❌</div>
              <p className="jersey-20-regular text-red-400">{errorMsg || 'Transaction failed'}</p>
              <button
                onClick={() => setStep('input')}
                className="w-full py-2.5 rounded-xl jersey-20-regular text-xl text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
