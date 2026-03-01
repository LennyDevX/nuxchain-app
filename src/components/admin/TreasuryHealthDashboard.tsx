/**
 * TreasuryHealthDashboard — Admin component for visualizing Treasury V6.0 health
 * Uses the useTreasuryHealth hook for real-time on-chain data.
 */

import { motion } from 'framer-motion';
import { 
  useTreasuryHealth, 
  formatPOL, 
  formatCountdown, 
  healthColor, 
  statusColor 
} from '../../hooks/treasury/useTreasuryHealth';
import { ProtocolStatus, getTreasuryManagerAddress } from '../../constants/treasury';

// Sub-component for individual metric cards
function MetricCard({ 
  label, 
  value, 
  subValue, 
  color = '#8b5cf6', 
  loading = false 
}: { 
  label: string; 
  value: string; 
  subValue?: string; 
  color?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-[#0a0a0a]/60 rounded-2xl p-5 border border-[rgba(255,255,255,0.05)] shadow-xl relative overflow-hidden group">
      {/* Accent glow on hover */}
      <div 
        className="absolute -right-4 -top-4 w-16 h-16 opacity-10 blur-2xl rounded-full transition-all group-hover:opacity-20 group-hover:scale-150"
        style={{ backgroundColor: color }}
      />
      
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">{label}</p>
      
      {loading ? (
        <div className="h-9 w-32 bg-slate-800/30 animate-pulse rounded-lg" />
      ) : (
        <p className="text-3xl font-black tracking-tight" style={{ color }}>{value}</p>
      )}
      
      {subValue && !loading && (
        <div className="mt-2 flex items-center gap-2">
           <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-white/5 whitespace-nowrap overflow-hidden text-ellipsis">
            {subValue}
           </span>
        </div>
      )}
    </div>
  );
}

// Sub-component for protocol status bars
function ProtocolStatusRow({ 
  label, 
  status, 
  deficit, 
  healthLabel 
}: { 
  label: string; 
  status: ProtocolStatus; 
  deficit: bigint; 
  healthLabel: string;
}) {
  const color = statusColor(status);
  const isDeficit = deficit > 0n;
  
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-300">{label}</span>
        <span 
          className="text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-tighter"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {healthLabel}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Simple Progress Bar representation (static visual for status) */}
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: status === ProtocolStatus.HEALTHY ? '100%' : '60%' }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        
        {isDeficit && (
          <span className="text-[11px] font-mono text-red-400/80">
            -{formatPOL(deficit, 2)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TreasuryHealthDashboard() {
  const { data, isLoading, error, refetch } = useTreasuryHealth();
  const currentTreasuryAddress = getTreasuryManagerAddress();

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
        <p className="text-red-400 mb-2 font-medium">Error loading Treasury metrics: {error}</p>
        <p className="text-[10px] text-red-500/60 font-mono mb-4">{currentTreasuryAddress}</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold text-red-300 transition-all uppercase tracking-widest"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Fallback for empty state or initial mount before data
  const health = data?.healthScore ?? 0;
  const hColor = healthColor(health);

  return (
    <div className="space-y-6">
      {/* ── Header with Health Score ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a]/40 p-6 rounded-3xl border border-white/[0.05] backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
                <circle 
                  cx="40" cy="40" r="36" 
                  fill="none" stroke="currentColor" strokeWidth="8"
                  className="text-white/5"
                />
                <motion.circle 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isLoading ? 0 : health / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="40" cy="40" r="36" 
                  fill="none" stroke={hColor} strokeWidth="8"
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{isLoading ? "…" : health}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase -mt-1">%</span>
             </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-white">
                System Health: <span style={{ color: hColor }}>{isLoading ? "Fetching..." : data?.healthLabel}</span>
              </h3>
              <div 
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter ${
                  currentTreasuryAddress.toLowerCase() === import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.toLowerCase()
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                <div className={`w-1 h-1 rounded-full ${currentTreasuryAddress.toLowerCase() === import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.toLowerCase() ? 'bg-blue-400' : 'bg-amber-400 animate-pulse'}`} />
                {currentTreasuryAddress.slice(0, 6)}...{currentTreasuryAddress.slice(-4)}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              Global status based on solvency, emergency reserve, and automated distribution cycles.
            </p>
          </div>
        </div>

        <button 
          onClick={() => refetch()}
          className="group px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-95"
          disabled={isLoading}
        >
          <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            {isLoading ? (
               <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>↻</motion.span>
            ) : "Sync Protocol"}
          </span>
        </button>
      </div>

      {/* ── PRIMARY STATS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Contract Balance" 
          value={isLoading ? "…" : formatPOL(data?.contractBalance ?? 0n, 2)}
          subValue={isLoading ? "…" : `Distributable: ${formatPOL(data?.availableBalance ?? 0n, 2)}`}
          color="#3b82f6"
          loading={isLoading}
        />
        <MetricCard 
          label="Historical Revenue" 
          value={isLoading ? "…" : formatPOL(data?.totalRevenueReceived ?? 0n, 1)}
          subValue={isLoading ? "…" : `Total Paid: ${formatPOL(data?.totalDistributed ?? 0n, 1)}`}
          color="#10b981"
          loading={isLoading}
        />
        <MetricCard 
          label="Emergency Reserve" 
          value={isLoading ? "…" : formatPOL(data?.reserveBalance ?? 0n, 2)}
          subValue={isLoading ? "…" : `${data?.reserveAllocationPct}% allocation`}
          color="#f59e0b"
          loading={isLoading}
        />
        <MetricCard 
          label="Next Distribution" 
          value={isLoading ? "…" : data?.distributionReady ? "READY" : formatCountdown(data?.timeUntilNextSecs ?? 0)}
          subValue={isLoading ? "…" : `Cycle: ${data?.cycleProgressPct}%`}
          color="#8b5cf6"
          loading={isLoading}
        />
      </div>

      {/* ── PROTOCOL BREAKDOWN ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status List */}
        <div className="lg:col-span-2 bg-[#0a0a0a]/40 p-6 rounded-3xl border border-white/[0.05]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Protocol Health Matrix
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
              ))
            ) : (
              data?.protocolStatuses.map((p, idx) => (
                <ProtocolStatusRow 
                  key={idx}
                  label={p.label}
                  status={p.status}
                  deficit={p.deficit}
                  healthLabel={p.statusLabel}
                />
              ))
            )}
          </div>
        </div>

        {/* Allocation Breakdown (Simple text list representation) */}
        <div className="bg-[#0a0a0a]/40 p-6 rounded-3xl border border-white/[0.05]">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             Distribution Config
          </h4>
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-8 bg-white/5 animate-pulse rounded-lg" />)
            ) : (
              data?.allocations.map((a, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{a.label}</span>
                    <span className="text-white">{a.allocationPct}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500/50" 
                      style={{ width: `${a.allocationPct}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.03]">
             <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Auto-Distribution</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${data?.autoDistributionEnabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                   {data?.autoDistributionEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
             </div>
             <div className="flex justify-between items-center px-1 mt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Emergency Mode</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${data?.emergencyModeActive ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                   {data?.emergencyModeActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
