/**
 * Emergency Tools Modal - Modal for emergency actions
 * Shows all available emergency tools with proper categorization
 */

import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyTool {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  comingSoon?: boolean;
}

const EMERGENCY_TOOLS: EmergencyTool[] = [
  {
    name: 'Emergency Pause',
    description: 'Pause all contract operations',
    icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'red',
    category: 'Critical'
  },
  {
    name: 'Emergency Withdraw',
    description: 'Recover funds from contract',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'orange',
    category: 'Critical'
  },
  {
    name: 'Transfer Ownership',
    description: 'Transfer contract control',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    color: 'yellow',
    category: 'Critical'
  },
  {
    name: 'Module Config',
    description: 'Configure contract modules',
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
    color: 'purple',
    category: 'Configuration'
  },
  {
    name: 'Event Logs',
    description: 'View contract event history',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    color: 'green',
    category: 'Monitoring',
    comingSoon: true
  },
  {
    name: 'Advanced Analytics',
    description: 'Detailed protocol analytics',
    icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'blue',
    category: 'Monitoring',
    comingSoon: true
  },
  {
    name: 'Security Audit',
    description: 'Run security diagnostics',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'emerald',
    category: 'Security',
    comingSoon: true
  },
  {
    name: 'Gas Optimization',
    description: 'Optimize contract gas usage',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'cyan',
    category: 'Optimization',
    comingSoon: true
  }
];

const COLOR_CLASSES = {
  red: 'text-red-400 hover:text-red-300',
  orange: 'text-orange-400 hover:text-orange-300',
  yellow: 'text-yellow-400 hover:text-yellow-300',
  purple: 'text-purple-400 hover:text-purple-300',
  green: 'text-green-400 hover:text-green-300',
  blue: 'text-blue-400 hover:text-blue-300',
  emerald: 'text-emerald-400 hover:text-emerald-300',
  cyan: 'text-cyan-400 hover:text-cyan-300',
};

const BG_COLOR_CLASSES = {
  red: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30',
  orange: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  yellow: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30',
  purple: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  green: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  blue: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  emerald: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
  cyan: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30',
};

interface EmergencyToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyToolsModal({ isOpen, onClose }: EmergencyToolsModalProps) {
  const groupedTools = EMERGENCY_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, EmergencyTool[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99998] flex items-center justify-center p-4"
          >
            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[rgba(239,68,68,0.3)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[rgba(239,68,68,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[rgba(239,68,68,0.2)] rounded-xl flex items-center justify-center border border-[rgba(239,68,68,0.3)]">
                    <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Emergency Tools</h2>
                    <p className="text-sm text-slate-400">Quick protocol actions</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 space-y-6">
                {Object.entries(groupedTools).map(([category, tools]) => (
                  <div key={category}>
                    <h4 className="text-sm font-bold text-[#ef4444] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#ef4444] rounded-full"></div>
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tools.map((tool) => (
                        <button
                          key={tool.name}
                          disabled={tool.comingSoon}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            tool.comingSoon
                              ? 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
                              : `${BG_COLOR_CLASSES[tool.color as keyof typeof BG_COLOR_CLASSES]} hover:scale-[1.02]`
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${BG_COLOR_CLASSES[tool.color as keyof typeof BG_COLOR_CLASSES]}`}>
                              <svg className={`w-5 h-5 ${COLOR_CLASSES[tool.color as keyof typeof COLOR_CLASSES]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm font-semibold ${tool.comingSoon ? 'text-slate-400' : 'text-white'}`}>
                                  {tool.name}
                                </p>
                                {tool.comingSoon && (
                                  <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] rounded-full font-medium">
                                    Soon
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs ${tool.comingSoon ? 'text-slate-500' : 'text-slate-400'}`}>
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
