interface RequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function RequirementsModal({ isOpen, onClose }: RequirementsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with higher blur for professional look */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal Container - Focused/Vertical for better UX */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div className="bg-[#0b0f1a] border border-white/10 rounded-2xl w-full max-w-[420px] max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-up pointer-events-auto flex flex-col">
          
          {/* Professional Minimalist Header */}
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Security Protocol</h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Airdrop Verification</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body - Compact & Grid-based */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
            
            {/* Section: Eligibility Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Required Criteria</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">Meet 1 or more</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Whale Status', val: '0.1 SOL+', icon: '🐋' },
                  { label: 'Network Activity', val: '3+ Txns', icon: '⚡' },
                  { label: 'Verified Source', val: 'CEX Funded', icon: '🏦' },
                  { label: 'Wallet Tenure', val: 'Active 2d+', icon: '📅' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                      <span className="text-xs font-semibold text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 bg-black/20 px-2 py-1 rounded-md">{item.val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: System & Integration */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Supported Systems</h3>
              <div className="bg-blue-600/5 border border-blue-600/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-200">Solana Mainnet</span>
                  </div>
                  <div className="flex gap-1.5">
                    {['PH', 'SL', 'OK'].map(l => (
                      <div key={l} className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-400">{l}</div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  Direct connection via <span className="text-blue-400">Phantom</span>, <span className="text-blue-400">Solflare</span> or <span className="text-blue-400">OKX</span>. Manual input disabled to ensure on-chain ownership verification.
                </p>
              </div>
            </section>

            {/* Section: Audit Pro Tips */}
            <section className="space-y-3 pb-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Audit Insights</h3>
              <div className="space-y-2">
                <div className="flex gap-3 items-start p-3 bg-yellow-500/[0.03] border border-yellow-500/10 rounded-xl">
                  <span className="text-sm">🔑</span>
                  <div>
                    <h4 className="text-[11px] font-bold text-yellow-500/80 mb-0.5">Instant Approval</h4>
                    <p className="text-[10px] text-gray-500 leading-snug">Active wallets are recognized by our neural engine for immediate $NUX allocation.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-purple-500/[0.03] border border-purple-500/10 rounded-xl">
                  <span className="text-sm">🛡️</span>
                  <div>
                    <h4 className="text-[11px] font-bold text-purple-500/80 mb-0.5">Sybil Protection</h4>
                    <p className="text-[10px] text-gray-500 leading-snug">Rate limiting and fingerprinting are active. Max 3 entries per user identity.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Industrial Design Footer */}
          <div className="p-6 bg-gradient-to-t from-black/40 to-transparent border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Authorize & Proceed
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <p className="text-[9px] text-gray-600 text-center mt-4 uppercase tracking-[0.1em] font-medium">
              Secured by Nuxchain Core Protocol
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}

export default RequirementsModal;

