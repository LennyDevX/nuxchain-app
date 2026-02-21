/**
 * 🎨 NFT Toast Notifications
 * Centralized styling and messaging for NFT operations (buy, list, transfer, etc.)
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  success: makeToastStyle('premium'),
  error:   makeToastStyle('error'),
  info:    makeToastStyle('info'),
  warning: makeToastStyle('warning'),
  loading: makeToastStyle('comment'),
}

/**
 * NFT Toast Notifications
 */
export const nftToasts = {
  // Purchase/Buying NFTs
  purchaseSuccess: (nftName: string, price: string) => {
    toast.success(`🎉 Successfully purchased "${nftName}" for ${price} POL!`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  purchaseError: (error: string) => {
    toast.error(`❌ Purchase failed: ${error}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  insufficientBalance: (needed: string, available: string) => {
    toast.error(`💸 Insufficient balance. Need ${needed} POL, have ${available} POL`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // Listing NFTs
  listingSuccess: (nftName: string, price: string) => {
    toast.success(`📋 "${nftName}" listed for ${price} POL!`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  listingError: (error: string) => {
    toast.error(`❌ Listing failed: ${error}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // Transferring NFTs
  transferSuccess: (nftName: string, recipient: string) => {
    toast.success(`🔄 "${nftName}" transferred to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  transferError: (error: string) => {
    toast.error(`❌ Transfer failed: ${error}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // Canceling listings
  cancelListingSuccess: (nftName: string) => {
    toast.success(`✅ Listing cancelled for "${nftName}"`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.success })
  },

  cancelListingError: (error: string) => {
    toast.error(`❌ Cancel failed: ${error}`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // Copy to clipboard
  addressCopied: (type: string) => {
    toast(`📋 ${type} copied to clipboard!`, { duration: toastDurations.short, position: DEFAULT_POSITION, style: s.info })
  },

  // NFT Not found/Invalid
  nftNotFound: () => {
    toast.error(`❌ NFT not found or has been removed`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  walletNotConnected: () => {
    toast.error(`🔐 Please connect your wallet to purchase NFTs`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  // Favorites/Likes
  addedToFavorites: (nftName: string) => {
    toast(`❤️ "${nftName}" added to favorites!`, { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.success })
  },

  removedFromFavorites: (nftName: string) => {
    toast(`💔 "${nftName}" removed from favorites`, { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.info })
  },

  // Loading states
  processingTransaction: (action: string) => {
    return toast.loading(`⏳ ${action}... This may take a few moments`, { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading })
  },

  // Generic error
  error: (message: string) => {
    toast.error(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  }
}
