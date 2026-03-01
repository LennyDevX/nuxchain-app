/**
 * BurnToken page — /burntoken
 * Community-driven NUX token burn page
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { useBurnNux } from '../hooks/useBurnNux';
import { isMaintenanceMode } from '../config/maintenance';
import BurnTokenMaintenance from './BurnTokenMaintenance';

const QUICK_AMOUNTS = [1_000, 5_000, 10_000, 50_000, 100_000, 200_000];
const MIN_BURN = 100;

export default function BurnToken() {
  const isMobile = useIsMobile();

  // Check maintenance mode
  if (isMaintenanceMode('burntoken')) {
    return <BurnTokenMaintenance />;
  }
  const {
    burnTokens,
    reset,
    status,
    error,
    lastResult,
    tokenBalance,
    currentSupply,
    burnedSupply,
    burnedPercent,
    connected,
  } = useBurnNux();

  const [amount, setAmount] = useState('');

  const isBusy = status === 'confirming' || status === 'sending';
  const numAmount = Number(amount);
  const isValid = numAmount >= MIN_BURN && (tokenBalance === null || numAmount <= tokenBalance);

  async function handleBurn() {
    if (!isValid || isBusy) return;
    const ok = await burnTokens(numAmount);
    if (ok) setAmount('');
  }

  return (
    <div className={`relative z-10 max-w-5xl mx-auto px-4 pb-24 ${isMobile ? 'pt-6' : 'pt-10'}`}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 space-y-3"
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-2xl animate-pulse" />
            <span className="text-7xl md:text-8xl relative z-10">🔥</span>
          </div>
        </div>

        <div>
          <span className="jersey-20-regular text-sm bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full uppercase tracking-widest">
            Deflationary Mechanism
          </span>
        </div>

        <h1 className="jersey-15-regular text-5xl md:text-8xl bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
          Burn NUX
        </h1>

        <p className="jersey-20-regular text-slate-400 text-xl md:text-2xl max-w-lg mx-auto">
          Permanently destroy NUX tokens to reduce the total supply.
          Every token burned increases scarcity — and value — for all holders.
        </p>
      </motion.div>

      {/* Stats */}
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <p className="jersey-20-regular text-xs text-slate-400 mb-1">Original Supply</p>
          <p className="jersey-15-regular text-3xl md:text-4xl text-white">100M</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <p className="jersey-20-regular text-xs text-slate-400 mb-1">Current Supply</p>
          <p className="jersey-15-regular text-3xl md:text-4xl text-white">{currentSupply?.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <p className="jersey-20-regular text-xs text-slate-400 mb-1">Total Burned</p>
          <p className="jersey-15-regular text-3xl md:text-4xl text-orange-400">{burnedSupply?.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <p className="jersey-20-regular text-xs text-slate-400 mb-1">Burn %</p>
          <p className="jersey-15-regular text-3xl md:text-4xl text-orange-400">{burnedPercent?.toFixed(2)}%</p>
        </div>
      </motion.div>

      {/* Main grid: Burn form + Leaderboard */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_360px]'}`}>

        {/* Burn Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-unified border border-orange-500/20 p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <h2 className="jersey-15-regular text-white text-3xl">Burn Tokens</h2>
          </div>

          <AnimatePresence mode="wait">
            {/* Success */}
            {status === 'success' && lastResult && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4 py-8"
              >
                <div className="text-6xl">🎉</div>
                <p className="jersey-15-regular text-orange-400 text-3xl">Burned Successfully!</p>
                <div className="bg-black/30 rounded-xl border border-orange-500/20 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="jersey-20-regular text-slate-400 text-lg">Amount Burned</span>
                    <span className="jersey-15-regular text-orange-400 text-4xl font-bold">
                      {lastResult.amount.toLocaleString()} NUX
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="jersey-20-regular text-slate-400 text-lg">Gone forever</span>
                    <span className="jersey-20-regular text-red-400 text-lg">♻️ Permanently destroyed</span>
                  </div>
                </div>
                <a
                  href={`https://solscan.io/tx/${lastResult.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jersey-20-regular text-blue-400 text-lg underline block"
                >
                  View on Solscan →
                </a>
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl jersey-20-regular text-lg text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  Burn More
                </button>
              </motion.div>
            )}

            {/* Error */}
            {status === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-6">
                <div className="text-5xl">❌</div>
                <p className="jersey-20-regular text-red-400 text-xl">{error || 'Transaction failed'}</p>
                <button onClick={reset} className="w-full py-3 rounded-xl jersey-20-regular text-lg text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all">
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Sending */}
            {isBusy && (
              <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-8">
                <div className="text-5xl animate-pulse">🔥</div>
                <p className="jersey-20-regular text-orange-400 text-xl">
                  {status === 'confirming' ? 'Waiting for wallet approval...' : 'Burning tokens on-chain...'}
                </p>
                <p className="jersey-20-regular text-slate-500 text-base">Please confirm in your Solana wallet</p>
              </motion.div>
            )}

            {/* Input form */}
            {(status === 'idle') && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                {/* Wallet balance */}
                {connected && tokenBalance !== null && (
                  <div className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2.5 border border-white/10">
                    <span className="jersey-20-regular text-slate-400 text-lg">Your Balance</span>
                    <span className="jersey-15-regular text-white text-2xl font-semibold">
                      {tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} NUX
                    </span>
                  </div>
                )}

                {/* Amount input */}
                <div className="bg-black/30 rounded-xl border border-orange-500/20 p-5 space-y-3">
                  <label className="jersey-20-regular text-slate-300 text-lg uppercase tracking-wide">
                    Amount to burn
                  </label>
                  <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                    <input
                      type="number"
                      min={MIN_BURN}
                      max={tokenBalance ?? undefined}
                      step={100}
                      placeholder={`Min ${MIN_BURN.toLocaleString()}`}
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      disabled={!connected}
                      className="flex-1 bg-transparent jersey-20-regular text-white text-4xl md:text-5xl outline-none placeholder-slate-700 disabled:opacity-50"
                    />
                    <span className="jersey-20-regular text-orange-400 text-3xl font-semibold">NUX</span>
                  </div>
                  {/* Set max */}
                  {tokenBalance !== null && tokenBalance > 0 && (
                    <button
                      onClick={() => setAmount(String(Math.floor(tokenBalance)))}
                      className="jersey-20-regular text-base text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Burn MAX ({Math.floor(tokenBalance).toLocaleString()} NUX)
                    </button>
                  )}
                  {amount && numAmount < MIN_BURN && (
                    <p className="jersey-20-regular text-red-400 text-sm">Minimum burn: {MIN_BURN.toLocaleString()} NUX</p>
                  )}
                  {tokenBalance !== null && numAmount > tokenBalance && (
                    <p className="jersey-20-regular text-red-400 text-sm">Insufficient balance</p>
                  )}
                </div>

                {/* Quick amounts */}
                <div className="space-y-2">
                  <p className="jersey-20-regular text-slate-500 text-sm uppercase tracking-wide">Quick amounts</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map(q => (
                      <button
                        key={q}
                        onClick={() => setAmount(String(q))}
                        disabled={!connected || (tokenBalance !== null && q > tokenBalance)}
                        className={`jersey-20-regular text-sm px-3 py-1.5 rounded-lg border transition-all
                          ${amount === String(q)
                            ? 'bg-orange-500/30 border-orange-500/60 text-orange-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {q >= 1_000_000 ? (q / 1_000_000) + 'M' : (q / 1_000) + 'K'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                {!connected ? (
                  <button
                    onClick={() => {
                      // Trigger wallet selection modal from wallet adapter
                      const walletBtn = document.querySelector('.wallet-adapter-button-trigger') as HTMLButtonElement;
                      walletBtn?.click();
                    }}
                    className="w-full py-4 rounded-xl jersey-20-regular text-white text-xl md:text-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                      hover:from-blue-400 hover:via-purple-400 hover:to-pink-400
                      transition-all duration-200 active:scale-95 shadow-lg font-semibold"
                  >
                    🔗 Connect Wallet to Burn
                  </button>
                ) : (
                  <button
                    onClick={handleBurn}
                    disabled={!isValid || isBusy}
                    className="w-full py-4 rounded-xl jersey-20-regular text-white text-xl md:text-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500
                      hover:from-red-400 hover:via-orange-400 hover:to-amber-400
                      transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg font-semibold"
                  >
                    🔥 Burn {numAmount > 0 ? numAmount.toLocaleString() : ''} NUX Permanently
                  </button>
                )}

                {/* Disclaimer */}
                <p className="jersey-20-regular text-slate-600 text-xs text-center">
                  ⚠️ Burned tokens are permanently and irreversibly destroyed. This action cannot be undone.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <h3 className="jersey-15-regular text-white text-xl mb-4">🏆 Top Burners</h3>
          <p className="jersey-20-regular text-slate-400 text-sm">Leaderboard loading...</p>
        </motion.div>
      </div>

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 card-unified border border-white/5 p-6"
      >
        <h3 className="jersey-15-regular text-white text-2xl mb-4 text-center">🔥 Why Burn NUX?</h3>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[
            {
              icon: '📉',
              title: 'Reduces Supply',
              desc: 'Every burn permanently removes NUX from circulation, lowering the total supply forever.',
            },
            {
              icon: '📈',
              title: 'Supports Price',
              desc: 'Basic economics: same demand + less supply = higher value per token. Burning helps all holders.',
            },
            {
              icon: '🏆',
              title: 'Community Power',
              desc: 'Token burns are a community signal. The leaderboard rewards the most committed NUX supporters.',
            },
          ].map(item => (
            <div key={item.title} className="bg-white/5 rounded-xl p-4 space-y-2 text-center border border-white/5">
              <div className="text-3xl">{item.icon}</div>
              <p className="jersey-15-regular text-white text-xl">{item.title}</p>
              <p className="jersey-20-regular text-slate-400 text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center space-y-1">
          <p className="jersey-20-regular text-orange-300 text-base">
            🎯 <strong>Burn Target:</strong> Community + treasury burn up to <span className="text-amber-400 font-bold">20,000,000 NUX (20%)</span> over the lifetime of the project.
            This would reduce the max supply to <span className="text-white font-bold">80,000,000 NUX</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
