import type { WalletMetrics } from '../forms/wallet-analysis-service';
import AirdropRequirements from './AirdropRequirements';

interface AirdropFormProps {
  formData: {
    name: string;
    email: string;
    wallet: string;
    website: string;
  };
  isSubmitting: boolean;
  submitStatus: {
    type: 'success' | 'error' | null;
    message: string;
  };
  solanaConnected: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onOpenRequirements: () => void;
  walletMetrics: WalletMetrics | null;
}

function AirdropForm({
  formData,
  isSubmitting,
  submitStatus,
  solanaConnected,
  handleInputChange,
  handleSubmit,
  onOpenRequirements,
  walletMetrics
}: AirdropFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Honeypot field - invisible to humans */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name Input */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          disabled={isSubmitting}
          required
          minLength={3}
        />
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-700 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Wallet Input - READ ONLY */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap justify-between items-end gap-1.5 px-1">
          <label htmlFor="wallet" className="block text-xs sm:text-sm font-medium text-gray-300">
            Wallet Address * (Auto-Connected)
          </label>
          {solanaConnected ? (
            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest leading-none">
                ✓ Connected
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest leading-none">
                ⚠ Not Connected
              </span>
            </div>
          )}
        </div>
        
        {!solanaConnected ? (
          <div className="relative">
            <div className="w-full px-4 py-3 bg-gray-800/50 border border-dashed border-gray-600 rounded-xl text-gray-400 text-sm placeholder-gray-500 cursor-not-allowed flex items-center justify-between">
              <span className="italic">Wallet will appear here after connecting...</span>
              <svg className="w-5 h-5 text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-xs text-orange-400/80 mt-2 px-1">
              🔐 Please connect your Solana wallet (Phantom, Solflare, OKX) to continue
            </p>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              id="wallet"
              name="wallet"
              value={formData.wallet}
              readOnly={true}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/40 rounded-xl text-green-300 text-sm font-mono placeholder-gray-600 focus:outline-none transition-all duration-200 cursor-not-allowed"
              style={{ textOverflow: 'ellipsis' }}
            />
            <div className="absolute right-3 top-3 text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {submitStatus.type && (
        <div
          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border text-sm ${submitStatus.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
            } animate-fadeIn`}
        >
          <div className="flex items-start gap-2">
            {submitStatus.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm">{submitStatus.message}</p>
          </div>
        </div>
      )}

      {/* Wallet Metrics Display - ELIGIBILITY CHECK (MOVED UP) */}
      {walletMetrics && (
        <div className="bg-gradient-to-br from-emerald-900/30 to-green-800/20 border border-emerald-500/40 rounded-lg sm:rounded-xl p-4 sm:p-5 space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {walletMetrics.isLegit ? (
                <>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300">✓ Eligible</h3>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-yellow-300">⏳ Under Review</h3>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                Score: <span className="text-lg">{walletMetrics.trustScore || 50}</span>/100
              </p>
            </div>
          </div>

          {/* Trust Score Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${walletMetrics.trustScore || 50}%` }}
            ></div>
          </div>

          {/* Info Grid - WITHOUT AGE */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-emerald-900/30 border border-emerald-500/20 rounded p-2 sm:p-3 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Balance</p>
              <p className="text-sm sm:text-base font-bold text-emerald-300">{walletMetrics.balance.toFixed(3)} <span className="text-xs">SOL</span></p>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-500/20 rounded p-2 sm:p-3 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Activity</p>
              <p className="text-sm sm:text-base font-bold text-emerald-300">{walletMetrics.transactionCount} <span className="text-xs">txns</span></p>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-500/20 rounded p-2 sm:p-3 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Tokens</p>
              <p className="text-sm sm:text-base font-bold text-emerald-300">{walletMetrics.tokenAccountCount || 0}</p>
            </div>
          </div>

          {/* Approval Reasons */}
          {walletMetrics.approvalReasons && walletMetrics.approvalReasons.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 space-y-2">
              <p className="text-xs font-semibold text-emerald-300">Approval Reasons:</p>
              <ul className="space-y-1">
                {walletMetrics.approvalReasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-emerald-200 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CEX Funding Badge */}
          {walletMetrics.isFundedByCEX && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v-1h8v1z" />
              </svg>
              <p className="text-xs text-blue-200 font-semibold">🏦 Wallet funded from verified exchange</p>
            </div>
          )}
        </div>
      )}

      {/* Requirements Dropdown - Modular Component */}
      <AirdropRequirements onOpenModal={onOpenRequirements} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !solanaConnected}
        className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none shadow-lg disabled:shadow-none"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : !solanaConnected ? (
          'Connect Wallet First'
        ) : (
          'Join Airdrop'
        )}
      </button>
    </form>
  );
}

export default AirdropForm;