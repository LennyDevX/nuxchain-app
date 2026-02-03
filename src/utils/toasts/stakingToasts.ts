/**
 * 🎨 Staking Toast Notifications
 * Centralized styling and messaging for staking-related notifications
 */

import toast from 'react-hot-toast'

export interface ToastOptions {
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

/**
 * 🎨 Toast Style Presets
 */
const toastStyles = {
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    icon: '⚠️'
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
    border: '1px solid rgba(16, 185, 129, 0.5)',
    icon: '✅'
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)',
    border: '1px solid rgba(245, 158, 11, 0.5)',
    icon: '⚡'
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    icon: 'ℹ️'
  },
  premium: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
    border: '1px solid rgba(139, 92, 246, 0.5)',
    icon: '💎'
  }
}

/**
 * Validation Error Toasts
 */
export const stakingToasts = {
  // Validation Errors
  minimumDepositError: (minAmount: string = '10 POL') => {
    toast.error(
      `⛔ Deposit must be at least ${minAmount}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  maximumDepositError: (maxAmount: string = '10,000 POL') => {
    toast.error(
      `⛔ Deposit cannot exceed ${maxAmount}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  insufficientBalance: (needed: string, available: string) => {
    toast.error(
      `💸 Need ${needed} POL but only have ${available} POL`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  invalidLockupPeriod: () => {
    toast.error(
      '⏱️ Invalid lockup period. Select: Flexible, 30, 90, 180, or 365 days',
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  walletNotConnected: () => {
    toast.error(
      '🔐 Please connect your wallet first',
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  noDeposits: () => {
    toast.error(
      '💰 You don\'t have any deposits to withdraw',
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  noRewards: () => {
    toast.error(
      '🎁 You have no rewards to claim',
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  },

  // Success Toasts
  depositSuccess: (amount: string) => {
    toast.success(
      `💰 Deposit successful! Staking ${amount} POL`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: toastStyles.success.background,
          color: toastStyles.success.color,
          fontSize: toastStyles.success.fontSize,
          fontWeight: toastStyles.success.fontWeight,
          borderRadius: toastStyles.success.borderRadius,
          padding: toastStyles.success.padding,
          boxShadow: toastStyles.success.boxShadow,
          border: toastStyles.success.border
        }
      }
    )
  },

  withdrawSuccess: (amount: string) => {
    toast.success(
      `📤 Withdrawal successful! Received ${amount} POL`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: toastStyles.success.background,
          color: toastStyles.success.color,
          fontSize: toastStyles.success.fontSize,
          fontWeight: toastStyles.success.fontWeight,
          borderRadius: toastStyles.success.borderRadius,
          padding: toastStyles.success.padding,
          boxShadow: toastStyles.success.boxShadow,
          border: toastStyles.success.border
        }
      }
    )
  },

  claimSuccess: (amount: string) => {
    toast.success(
      `🎁 Claimed ${amount} POL in rewards!`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: toastStyles.success.background,
          color: toastStyles.success.color,
          fontSize: toastStyles.success.fontSize,
          fontWeight: toastStyles.success.fontWeight,
          borderRadius: toastStyles.success.borderRadius,
          padding: toastStyles.success.padding,
          boxShadow: toastStyles.success.boxShadow,
          border: toastStyles.success.border
        }
      }
    )
  },

  compoundSuccess: (amount: string) => {
    toast.success(
      `🔄 Compounded ${amount} POL in rewards!`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: toastStyles.success.background,
          color: toastStyles.success.color,
          fontSize: toastStyles.success.fontSize,
          fontWeight: toastStyles.success.fontWeight,
          borderRadius: toastStyles.success.borderRadius,
          padding: toastStyles.success.padding,
          boxShadow: toastStyles.success.boxShadow,
          border: toastStyles.success.border
        }
      }
    )
  },

  // Warning Toasts
  emergencyWithdraw: (amount: string, penalty: string) => {
    toast(
      `🚨 EMERGENCY WITHDRAWAL: ${amount} POL (Penalty: ${penalty} POL) - You will lose ALL rewards!`,
      {
        duration: 8000,
        position: 'top-center',
        style: {
          background: toastStyles.warning.background,
          color: toastStyles.warning.color,
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)',
          border: '1px solid rgba(245, 158, 11, 0.5)'
        }
      }
    )
  },

  // Info Toasts
  depositInfo: (minAmount: string) => {
    toast(
      `ℹ️ Minimum Deposit: Start with ${minAmount} to begin staking`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.info.background,
          color: toastStyles.info.color,
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
          border: '1px solid rgba(59, 130, 246, 0.5)'
        }
      }
    )
  },

  // Generic Error
  error: (message: string) => {
    toast.error(
      message,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: toastStyles.error.background,
          color: toastStyles.error.color,
          fontSize: toastStyles.error.fontSize,
          fontWeight: toastStyles.error.fontWeight,
          borderRadius: toastStyles.error.borderRadius,
          padding: toastStyles.error.padding,
          boxShadow: toastStyles.error.boxShadow,
          border: toastStyles.error.border
        }
      }
    )
  }
}
