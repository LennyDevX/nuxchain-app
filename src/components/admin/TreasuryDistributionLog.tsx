/**
 * TreasuryDistributionLog
 * Shows on-chain distribution history from TreasuryManager:
 *  - Per-treasury cumulative totals
 *  - Recent events: Distributed / Revenue Received / Cycles
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TreasuryManagerABIJSON from '../../abi/Treasury/TreasuryManager.json';
import {
  useTreasuryDistributions,
  fmtPOL,
  fmtTimeAgo,
  shortAddr,
  TREASURY_COLORS,
} from '../../hooks/treasury/useTreasuryDistributions';

const TreasuryManagerABI = TreasuryManagerABIJSON.abi as readonly object[];

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xs text-slate-600">No on-chain events found in the last 30 days</p>
    </div>
  );
}

function TxBadge({ txHash, getUrl }: { txHash: string; getUrl: (h: string) => string }) {
  if (!txHash) return <span className="text-slate-600 text-xs font-mono">—</span>;
  return (
    <a
      href={getUrl(txHash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-violet-400 transition-colors group"
    >
      {shortAddr(txHash)}
      <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

// Tab types
type Tab = 'distributed' | 'received' | 'cycles';

// ── Main Component ────────────────────────────────────────────────────────────

const SUB_TREASURY_LABELS = ['Rewards', 'Staking', 'Collaborators', 'Development', 'Marketplace'];
const SUB_TREASURY_BPS    = [3000, 2500, 2000, 1500, 1000];

export default function TreasuryDistributionLog({
  isDistributionReady = false,
  availableBalance = 0n,
}: {
  isDistributionReady?: boolean;
  availableBalance?: bigint;
}) {
  const {
    distributions,
    revenues,
    cycles,
    summaries,
    isLoading,
    error,
    lastFetch,
    getExplorerUrl,
    refetch,
    contractAddress,
  } = useTreasuryDistributions();

  // ── Trigger Distribution write ────────────────────────────────────────────
  const { writeContract, data: triggerTxHash, isPending: isTriggerPending } = useWriteContract();
  const { isLoading: isTriggerConfirming, isSuccess: isTriggerSuccess } =
    useWaitForTransactionReceipt({ hash: triggerTxHash });

  const [showConfirm, setShowConfirm] = useState(false);

  const handleTrigger = () => {
    setShowConfirm(false);
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: TreasuryManagerABI,
      functionName: 'triggerDistribution',
    });
  };

  const isTriggerBusy = isTriggerPending || isTriggerConfirming;

  const [activeTab, setActiveTab] = useState<Tab>('distributed');

  // Grand total distributed
  const grandTotal = summaries.reduce((acc, s) => acc + s.totalReceived, 0n);
  const nothingDistributed = summaries.every(s => s.eventCount === 0) && !isLoading;
  // Cycle was triggered but no individual sub-treasury transfers were recorded on-chain
  const triggeredButEmpty = nothingDistributed && cycles.length > 0;

  return (
    <div className="space-y-5">
      {/* ── Section Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
            Distribution Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            On-chain treasury fund routing — last 30 days
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastFetch && (
            <span className="text-xs text-slate-600 font-medium hidden sm:block">
              Updated {fmtTimeAgo(Math.floor(lastFetch / 1000))}
            </span>
          )}
          {/* Trigger Distribution button */}
          {isDistributionReady && (
            <button
              onClick={() => !isTriggerBusy && setShowConfirm(true)}
              disabled={isTriggerBusy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-black text-amber-300 hover:bg-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider whitespace-nowrap"
              title="Distribute accumulated treasury funds to all sub-treasuries"
            >
              {isTriggerBusy ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {isTriggerConfirming ? 'Confirming…' : 'Sending…'}
                </>
              ) : isTriggerSuccess ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Distributed!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  Distribute Now
                </>
              )}
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Pre-flight confirmation panel ────────────────────────────── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-sm font-black text-amber-300 uppercase tracking-wide">Confirm Distribution</p>
                <p className="text-xs text-amber-400/80 mt-0.5">The following amounts will be sent on-chain. This cannot be undone.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {SUB_TREASURY_LABELS.map((label, i) => {
                const share = availableBalance > 0n
                  ? (availableBalance * BigInt(SUB_TREASURY_BPS[i])) / 10000n
                  : 0n;
                const color = TREASURY_COLORS[i];
                return (
                  <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-bold text-slate-300">{label}</span>
                      <span className="text-[10px] text-slate-600 font-mono">{SUB_TREASURY_BPS[i] / 100}%</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      {availableBalance > 0n ? fmtPOL(share, 4) : '—'} POL
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 mt-1">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wide">Total</span>
                <span className="text-sm font-black text-amber-300">{fmtPOL(availableBalance, 4)} POL</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleTrigger}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-black uppercase tracking-wide hover:bg-amber-500/30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                Confirm & Send
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Diagnostic banner: distribution never triggered ──────────── */}
      <AnimatePresence>
        {nothingDistributed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-black text-amber-300 uppercase tracking-wide">
                  {triggeredButEmpty
                    ? 'Distribution triggered — no transfers recorded'
                    : isDistributionReady
                    ? 'Distribution ready — never triggered'
                    : 'No distributions found in the last 30 days'}
                </p>
                <p className="text-xs text-amber-400/70 mt-0.5 max-w-lg">
                  {triggeredButEmpty
                    ? 'A distribution cycle was triggered but no individual sub-treasury transfers were recorded on-chain. This usually means the sub-treasury wallet addresses are not yet configured in the TreasuryManager contract.'
                    : isDistributionReady
                    ? 'Revenue has accumulated in the TreasuryManager. The 7-day cycle is complete. Call \u201ctriggerDistribution()\u201d to distribute funds to all sub-treasuries now.'
                    : 'Revenue may still be accumulating (7-day window not reached yet), or the Staking contract is not forwarding commissions to this TreasuryManager address.'}
                </p>
              </div>
            </div>
            {isDistributionReady && (
              <button
                onClick={handleTrigger}
                disabled={isTriggerBusy}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wide hover:bg-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isTriggerBusy ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    {isTriggerConfirming ? 'Confirming\u2026' : 'Sending\u2026'}
                  </>
                ) : isTriggerSuccess ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Distributed!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    Trigger Distribution
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger success banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {isTriggerSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Distribution executed on-chain. Refreshing logs…
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: Per-treasury cumulative summary ─────────────────── */}
        <div className="lg:col-span-2 bg-[#0a0a0a]/40 rounded-3xl border border-white/[0.05] p-5 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Destination Breakdown
            </h3>
            <p className="text-2xl font-black text-white mt-1">
              {fmtPOL(grandTotal, 3)}{' '}
              <span className="text-sm text-slate-500 font-medium">POL Total</span>
            </p>
          </div>

          {isLoading && summaries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : summaries.every(s => s.eventCount === 0) ? (
            <EmptyState label="No distributions yet" />
          ) : (
            <div className="flex flex-col gap-3">
              {summaries.map(s => (
                <div
                  key={s.index}
                  className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-base font-bold text-slate-200">{s.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color: s.color }}>
                      {fmtPOL(s.totalReceived, 2)} POL
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ backgroundColor: s.color }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] uppercase tracking-tighter font-bold text-slate-500">
                    <span>{s.pct}% of total</span>
                    <span>{s.eventCount} distribution{s.eventCount !== 1 ? 's' : ''}</span>
                  </div>

                  {s.address && (
                    <p className="text-[11px] font-mono text-slate-600 break-all">
                      {s.address}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Event log table with tabs ──────────────────────── */}
        <div className="lg:col-span-3 bg-[#0a0a0a]/40 rounded-3xl border border-white/[0.05] p-5 shadow-xl flex flex-col gap-4">

          {/* Tab bar */}
          <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
            {([
              { id: 'distributed', label: 'Distributed', count: distributions.length },
              { id: 'received',    label: 'Revenue In',  count: revenues.length },
              { id: 'cycles',      label: 'Cycles',      count: cycles.length },
            ] as { id: Tab; label: string; count: number }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    activeTab === tab.id ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto max-h-[420px] pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {isLoading && distributions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Reading on-chain events…
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* ─ Distributed tab ──────────────────────────────── */}
                {activeTab === 'distributed' && (
                  <motion.div
                    key="distributed"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    {distributions.length === 0 ? (
                      <EmptyState label="No distribution events" />
                    ) : (
                      <>
                        <div className="grid grid-cols-[1fr_1.4fr_0.9fr_0.8fr] gap-2 px-3 pb-2">
                          {['Treasury', 'Tx Hash', 'Amount', 'When'].map(h => (
                            <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-600">{h}</span>
                          ))}
                        </div>
                        {distributions.map((evt, i) => {
                          const color = TREASURY_COLORS[evt.treasuryType] ?? '#64748b';
                          const label = ['Rewards', 'Staking', 'Collaborators', 'Development', 'Marketplace'][evt.treasuryType] ?? 'Unknown';
                          return (
                            <motion.div
                              key={`${evt.txHash}-${i}`}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
                              className="grid grid-cols-[1fr_1.4fr_0.9fr_0.8fr] gap-2 items-center px-3 py-3 rounded-2xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] transition-all"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="text-xs font-bold truncate" style={{ color }}>{label}</span>
                              </div>
                              <TxBadge txHash={evt.txHash} getUrl={getExplorerUrl} />
                              <span className="text-sm font-mono font-bold text-white">
                                {fmtPOL(evt.amount, 3)}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {fmtTimeAgo(evt.timestamp)}
                              </span>
                            </motion.div>
                          );
                        })}
                      </>
                    )}
                  </motion.div>
                )}

                {/* ─ Revenue Received tab ─────────────────────────── */}
                {activeTab === 'received' && (
                  <motion.div
                    key="received"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    {revenues.length === 0 ? (
                      <EmptyState label="No revenue events" />
                    ) : (
                      <>
                        <div className="grid grid-cols-[1.4fr_1fr_0.9fr_0.8fr] gap-2 px-3 pb-2">
                          {['Source', 'Type', 'Amount', 'When'].map(h => (
                            <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-600">{h}</span>
                          ))}
                        </div>
                        {revenues.map((evt, i) => (
                          <motion.div
                            key={`${evt.txHash}-${i}`}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
                            className="grid grid-cols-[1.4fr_1fr_0.9fr_0.8fr] gap-2 items-center px-3 py-3 rounded-2xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] transition-all"
                          >
                            <TxBadge txHash={evt.txHash} getUrl={getExplorerUrl} />
                            <span className="text-xs font-bold text-emerald-400 truncate capitalize">
                              {evt.revenueType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-mono font-bold text-white">
                              {fmtPOL(evt.amount, 3)}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {fmtTimeAgo(evt.timestamp)}
                            </span>
                          </motion.div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}

                {/* ─ Distribution Cycles tab ──────────────────────── */}
                {activeTab === 'cycles' && (
                  <motion.div
                    key="cycles"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    {cycles.length === 0 ? (
                      <EmptyState label="No distribution cycles" />
                    ) : (
                      <>
                        <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-2 px-3 pb-2">
                          {['Tx', 'Total Batch', 'Next Cycle', 'When'].map(h => (
                            <span key={h} className="text-[10px] font-black uppercase tracking-widest text-slate-600">{h}</span>
                          ))}
                        </div>
                        {cycles.map((cycle, i) => {
                          const nextDate = new Date(Number(cycle.nextCycleTime) * 1000);
                          const nextLabel = nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
                          return (
                            <motion.div
                              key={`${cycle.txHash}-${i}`}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
                              className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-2 items-center px-3 py-3 rounded-2xl bg-white/[0.015] border border-white/[0.03] hover:bg-white/[0.04] transition-all"
                            >
                              <TxBadge txHash={cycle.txHash} getUrl={getExplorerUrl} />
                              <span className="text-sm font-mono font-bold text-blue-400">
                                {fmtPOL(cycle.totalAmount, 3)} POL
                              </span>
                              <span className="text-xs font-bold text-slate-300">
                                {nextLabel}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {fmtTimeAgo(cycle.timestamp)}
                              </span>
                            </motion.div>
                          );
                        })}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
