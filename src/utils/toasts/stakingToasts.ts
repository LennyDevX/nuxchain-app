/**
 * 🎨 Staking Toast Notifications
 * Centralized styling and messaging for staking-related notifications
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

export interface ToastOptions {
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

const s = {
  error:    makeToastStyle('error'),
  success:  makeToastStyle('success'),
  warning:  makeToastStyle('warning'),
  info:     makeToastStyle('info'),
  premium:  makeToastStyle('premium'),
  loading:  makeToastStyle('loading'),
  compound: makeToastStyle('compound'),
}

/**
 * Validation Error Toasts
 */
export const stakingToasts = {
  // Validation Errors
  minimumDepositError: (minAmount: string = '10 POL') => {
    toast.error(`⛔ Deposit must be at least ${minAmount}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  maximumDepositError: (maxAmount: string = '10,000 POL') => {
    toast.error(`⛔ Deposit cannot exceed ${maxAmount}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  insufficientBalance: (needed: string, available: string) => {
    toast.error(`💸 Need ${needed} POL but only have ${available} POL`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  invalidLockupPeriod: () => {
    toast.error('⏱️ Invalid lockup period. Select: Flexible, 30, 90, 180, or 365 days', { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  walletNotConnected: () => {
    toast.error('🔐 Please connect your wallet first', { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  noDeposits: () => {
    toast.error('💰 You don\'t have any deposits to withdraw', { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  noRewards: () => {
    toast.error('🎁 You have no rewards to claim', { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // ── Loading Toasts (return toastId to dismiss later) ──
  depositPending: (amount: string) => {
    return toast.loading(`💰 Staking ${amount} POL... This may take a few moments`, { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading })
  },

  withdrawPending: () => {
    return toast.loading(`📤 Withdrawing your stake... Please wait`, { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading })
  },

  claimPending: (amount: string) => {
    return toast.loading(`🎁 Claiming ${amount} POL in rewards...`, { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading })
  },

  compoundPending: (amount: string) => {
    return toast.loading(`🔄 Compounding ${amount} POL into your stake...`, { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.compound })
  },

  emergencyPending: () => {
    return toast.loading(`� Emergency withdrawal in progress...`, { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.warning })
  },

  // ── Success Toasts ──
  depositSuccess: (amount: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.success(`💰 Staked ${amount} POL successfully!`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  withdrawSuccess: (amount: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.success(`📤 Withdrawal successful! Received ${amount} POL`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  claimSuccess: (amount: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.success(`🎁 Claimed ${amount} POL in rewards!`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  compoundSuccess: (amount: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.success(`🔄 Compounded ${amount} POL — added to your stake!`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  emergencySuccess: (amount: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.success(`🚨 Emergency withdrawal complete: ${amount} POL returned`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.success })
  },

  // ── Error Toasts (with dismiss) ──
  depositError: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.error(`❌ Staking failed. Please try again`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  withdrawError: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.error(`❌ Withdrawal failed. Please try again`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  claimError: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.error(`❌ Claim failed. Please try again`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  compoundError: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.error(`❌ Compound failed. Please try again`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  emergencyError: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.error(`❌ Emergency withdrawal failed. Please try again`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // ── Warning Toasts ──
  emergencyWithdraw: (amount: string, penalty: string) => {
    toast(`🚨 EMERGENCY WITHDRAWAL: ${amount} POL (Penalty: ${penalty} POL) - You will lose ALL rewards!`, { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.warning })
  },

  // ── Info Toasts ──
  depositInfo: (minAmount: string) => {
    toast(`ℹ️ Minimum Deposit: Start with ${minAmount} to begin staking`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.info })
  },

  // ── Generic Error ──
  error: (message: string) => {
    toast.error(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  }
}
