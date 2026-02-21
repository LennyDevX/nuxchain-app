/**
 * 🎨 Shared Toast Style Tokens
 * Single source of truth for all toast gradients, durations, and positions.
 * Import from here — never redefine locally in domain toast files.
 */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'premium' | 'social' | 'comment' | 'xp' | 'levelUp' | 'achievement' | 'compound'

export const toastColors = {
  success:     { from: '#10b981', to: '#059669', shadow: '16, 185, 129' },
  error:       { from: '#ef4444', to: '#dc2626', shadow: '239, 68, 68' },
  warning:     { from: '#f59e0b', to: '#d97706', shadow: '245, 158, 11' },
  info:        { from: '#3b82f6', to: '#2563eb', shadow: '59, 130, 246' },
  loading:     { from: '#8b5cf6', to: '#7c3aed', shadow: '139, 92, 246' },
  premium:     { from: '#8b5cf6', to: '#7c3aed', shadow: '139, 92, 246' },
  social:      { from: '#ec4899', to: '#db2777', shadow: '236, 72, 153' },
  comment:     { from: '#06b6d4', to: '#0891b2', shadow: '6, 182, 212' },
  xp:          { from: '#a855f7', to: '#9333ea', shadow: '168, 85, 247' },
  levelUp:     { from: '#8b5cf6', to: '#6d28d9', shadow: '139, 92, 246' },
  achievement: { from: '#22c55e', to: '#16a34a', shadow: '34, 197, 94' },
  compound:    { from: '#06b6d4', to: '#0891b2', shadow: '6, 182, 212' },
} as const

/**
 * Build a CSSProperties-compatible style object for a given variant.
 */
export function makeToastStyle(variant: ToastVariant): React.CSSProperties {
  const c = toastColors[variant]
  return {
    background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: `0 10px 30px rgba(${c.shadow}, 0.3)`,
    border: `1px solid rgba(${c.shadow}, 0.5)`,
  }
}

/**
 * Subtle XP style (smaller, less intrusive).
 */
export const xpToastStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${toastColors.xp.from} 0%, ${toastColors.xp.to} 100%)`,
  color: '#fff',
  fontSize: '13px',
  fontWeight: '500',
  borderRadius: '10px',
  padding: '12px 20px',
  boxShadow: `0 8px 24px rgba(${toastColors.xp.shadow}, 0.3)`,
  border: `1px solid rgba(${toastColors.xp.shadow}, 0.4)`,
}

/**
 * Neutral dark style (used for pending tx, etc.)
 */
export const neutralToastStyle: React.CSSProperties = {
  background: '#1f2937',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '500',
  borderRadius: '12px',
  padding: '16px 24px',
  border: '1px solid #374151',
}

/**
 * Standard durations (ms) — use these everywhere for consistency.
 */
export const toastDurations = {
  short:    2000,
  default:  3000,
  medium:   4000,
  long:     5000,
  error:    5000,
  success:  4000,
  loading:  Infinity,
  critical: 8000,
} as const

/**
 * Default position for all toasts.
 */
export const DEFAULT_POSITION = 'top-center' as const
