/**
 * Emergency Tools Dropdown - Dropdown for emergency actions
 * Shows all available emergency tools with proper categorization
 */

import { useState } from 'react';
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

export default function EmergencyToolsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const groupedTools = EMERGENCY_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, EmergencyTool[]>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] rounded-lg text-sm font-medium border border-[rgba(239,68,68,0.3)] transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span>Emergency Tools</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[rgba(239,68,68,0.3)] rounded-xl shadow-2xl z-[99999] max-h-96 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {Object.entries(groupedTools).map(([category, tools]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.name}
                        disabled={tool.comingSoon}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          tool.comingSoon
                            ? 'bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed'
                            : `${BG_COLOR_CLASSES[tool.color as keyof typeof BG_COLOR_CLASSES]} hover:scale-[1.02]`
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${BG_COLOR_CLASSES[tool.color as keyof typeof BG_COLOR_CLASSES]}`}>
                            <svg className={`w-4 h-4 ${COLOR_CLASSES[tool.color as keyof typeof COLOR_CLASSES]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${tool.comingSoon ? 'text-slate-400' : 'text-white'}`}>
                                {tool.name}
                              </p>
                              {tool.comingSoon && (
                                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded-full">
                                  Soon
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
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
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
