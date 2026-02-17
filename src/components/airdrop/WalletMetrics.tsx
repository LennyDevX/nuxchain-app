import type { WalletMetrics } from '../forms/wallet-analysis-service';
import { getWalletQualityAssessment } from '../forms/wallet-analysis-service';

interface WalletMetricsProps {
  walletMetrics: WalletMetrics | null;
}

function WalletMetricsDisplay({ walletMetrics }: WalletMetricsProps) {
  if (!walletMetrics) return null;

  return (
    <div className={`mt-3 p-4 sm:p-5 rounded-lg sm:rounded-xl border animate-fadeIn ${
      walletMetrics.isLegit 
        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/15 border-green-500/50' 
        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/15 border-yellow-500/50'
    }`}>
      {/* Header with Status and Trust Score */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-2.5">
          {walletMetrics.isLegit ? (
            <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <div className="flex-1">
            <p className={`text-xs font-black uppercase tracking-widest ${
              walletMetrics.isLegit ? 'text-green-300' : 'text-yellow-300'
            }`}>
              {walletMetrics.isLegit ? '✓ Eligible' : '⚠️ Status'}
            </p>
            <p className="text-sm sm:text-base font-bold text-white mt-1">{getWalletQualityAssessment(walletMetrics)}</p>
          </div>
        </div>
        {walletMetrics.trustScore !== undefined && (
          <div className={`px-3 py-2 rounded-lg flex flex-col items-center border flex-shrink-0 ${
            walletMetrics.isLegit
              ? 'bg-green-500/20 border-green-500/40'
              : 'bg-yellow-500/20 border-yellow-500/40'
          }`}>
            <span className={`text-sm font-black ${
              walletMetrics.isLegit ? 'text-green-300' : 'text-yellow-300'
            }`}>{walletMetrics.trustScore}%</span>
            <span className={`text-[9px] font-bold ${
              walletMetrics.isLegit ? 'text-green-400' : 'text-yellow-400'
            }`}>Ready</span>
          </div>
        )}
      </div>

      {/* Key Metrics - Consolidated, No Age */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Balance</p>
          <p className="text-sm font-bold text-white mt-1">{walletMetrics.balance.toFixed(3)} SOL</p>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Activity</p>
          <p className="text-sm font-bold text-white mt-1">{walletMetrics.transactionCount} {walletMetrics.transactionCount === 1 ? 'tx' : 'txs'}</p>
        </div>
        {walletMetrics.tokenAccountCount > 0 && (
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tokens</p>
            <p className="text-sm font-bold text-white mt-1">{walletMetrics.tokenAccountCount}</p>
          </div>
        )}
      </div>

      {/* Approval Reasons Badge */}
      {walletMetrics.approvalReasons && walletMetrics.approvalReasons.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Details:</p>
          <div className="flex flex-wrap gap-2">
            {walletMetrics.approvalReasons.slice(0, 3).map((reason, idx) => (
              <div key={idx} className={`text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 border ${
                walletMetrics.isLegit
                  ? 'bg-green-500/15 border-green-500/40 text-green-300'
                  : 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
              }`}>
                <span className={walletMetrics.isLegit ? 'text-green-400' : 'text-yellow-400'}>✓</span>
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper message for non-legit wallets */}
      {!walletMetrics.isLegit && (
        <div className="mt-3 p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
          <p className="text-xs text-yellow-200 leading-relaxed">
            💡 <strong>You can still register!</strong> Try adding balance, making a transaction, or checking back soon to increase eligibility.
          </p>
        </div>
      )}
    </div>
  );
}

export default WalletMetricsDisplay;