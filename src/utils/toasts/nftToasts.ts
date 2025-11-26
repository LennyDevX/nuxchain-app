/**
 * 🎨 NFT Toast Notifications
 * Centralized styling and messaging for NFT operations (buy, list, transfer, etc.)
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for NFT
 */
const nftToastStyles = {
  success: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
    border: '1px solid rgba(139, 92, 246, 0.5)',
    icon: '✨'
  },
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
  loading: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)',
    border: '1px solid rgba(6, 182, 212, 0.5)',
    icon: '⏳'
  }
}

/**
 * NFT Toast Notifications
 */
export const nftToasts = {
  // Purchase/Buying NFTs
  purchaseSuccess: (nftName: string, price: string) => {
    toast.success(
      `🎉 Successfully purchased "${nftName}" for ${price} POL!`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: nftToastStyles.success.background,
          color: nftToastStyles.success.color,
          fontSize: nftToastStyles.success.fontSize,
          fontWeight: nftToastStyles.success.fontWeight,
          borderRadius: nftToastStyles.success.borderRadius,
          padding: nftToastStyles.success.padding,
          boxShadow: nftToastStyles.success.boxShadow,
          border: nftToastStyles.success.border
        }
      }
    )
  },

  purchaseError: (error: string) => {
    toast.error(
      `❌ Purchase failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  insufficientBalance: (needed: string, available: string) => {
    toast.error(
      `💸 Insufficient balance. Need ${needed} POL, have ${available} POL`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  // Listing NFTs
  listingSuccess: (nftName: string, price: string) => {
    toast.success(
      `📋 "${nftName}" listed for ${price} POL!`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: nftToastStyles.success.background,
          color: nftToastStyles.success.color,
          fontSize: nftToastStyles.success.fontSize,
          fontWeight: nftToastStyles.success.fontWeight,
          borderRadius: nftToastStyles.success.borderRadius,
          padding: nftToastStyles.success.padding,
          boxShadow: nftToastStyles.success.boxShadow,
          border: nftToastStyles.success.border
        }
      }
    )
  },

  listingError: (error: string) => {
    toast.error(
      `❌ Listing failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  // Transferring NFTs
  transferSuccess: (nftName: string, recipient: string) => {
    toast.success(
      `🔄 "${nftName}" transferred to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: nftToastStyles.success.background,
          color: nftToastStyles.success.color,
          fontSize: nftToastStyles.success.fontSize,
          fontWeight: nftToastStyles.success.fontWeight,
          borderRadius: nftToastStyles.success.borderRadius,
          padding: nftToastStyles.success.padding,
          boxShadow: nftToastStyles.success.boxShadow,
          border: nftToastStyles.success.border
        }
      }
    )
  },

  transferError: (error: string) => {
    toast.error(
      `❌ Transfer failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  // Canceling listings
  cancelListingSuccess: (nftName: string) => {
    toast.success(
      `✅ Listing cancelled for "${nftName}"`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.success.background,
          color: nftToastStyles.success.color,
          fontSize: nftToastStyles.success.fontSize,
          fontWeight: nftToastStyles.success.fontWeight,
          borderRadius: nftToastStyles.success.borderRadius,
          padding: nftToastStyles.success.padding,
          boxShadow: nftToastStyles.success.boxShadow,
          border: nftToastStyles.success.border
        }
      }
    )
  },

  cancelListingError: (error: string) => {
    toast.error(
      `❌ Cancel failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  // Copy to clipboard
  addressCopied: (type: string) => {
    toast(
      `📋 ${type} copied to clipboard!`,
      {
        duration: 2000,
        position: 'top-center',
        style: {
          background: nftToastStyles.info.background,
          color: nftToastStyles.info.color,
          fontSize: nftToastStyles.info.fontSize,
          fontWeight: nftToastStyles.info.fontWeight,
          borderRadius: nftToastStyles.info.borderRadius,
          padding: nftToastStyles.info.padding,
          boxShadow: nftToastStyles.info.boxShadow,
          border: nftToastStyles.info.border
        }
      }
    )
  },

  // NFT Not found/Invalid
  nftNotFound: () => {
    toast.error(
      `❌ NFT not found or has been removed`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  walletNotConnected: () => {
    toast.error(
      `🔐 Please connect your wallet to purchase NFTs`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  },

  // Favorites/Likes
  addedToFavorites: (nftName: string) => {
    toast(
      `❤️ "${nftName}" added to favorites!`,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: nftToastStyles.success.background,
          color: nftToastStyles.success.color,
          fontSize: nftToastStyles.success.fontSize,
          fontWeight: nftToastStyles.success.fontWeight,
          borderRadius: nftToastStyles.success.borderRadius,
          padding: nftToastStyles.success.padding,
          boxShadow: nftToastStyles.success.boxShadow,
          border: nftToastStyles.success.border
        }
      }
    )
  },

  removedFromFavorites: (nftName: string) => {
    toast(
      `💔 "${nftName}" removed from favorites`,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: nftToastStyles.info.background,
          color: nftToastStyles.info.color,
          fontSize: nftToastStyles.info.fontSize,
          fontWeight: nftToastStyles.info.fontWeight,
          borderRadius: nftToastStyles.info.borderRadius,
          padding: nftToastStyles.info.padding,
          boxShadow: nftToastStyles.info.boxShadow,
          border: nftToastStyles.info.border
        }
      }
    )
  },

  // Loading states
  processingTransaction: (action: string) => {
    toast.loading(
      `⏳ ${action}... This may take a few moments`,
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: nftToastStyles.loading.background,
          color: nftToastStyles.loading.color,
          fontSize: nftToastStyles.loading.fontSize,
          fontWeight: nftToastStyles.loading.fontWeight,
          borderRadius: nftToastStyles.loading.borderRadius,
          padding: nftToastStyles.loading.padding,
          boxShadow: nftToastStyles.loading.boxShadow,
          border: nftToastStyles.loading.border
        }
      }
    )
  },

  // Generic error
  error: (message: string) => {
    toast.error(
      message,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: nftToastStyles.error.background,
          color: nftToastStyles.error.color,
          fontSize: nftToastStyles.error.fontSize,
          fontWeight: nftToastStyles.error.fontWeight,
          borderRadius: nftToastStyles.error.borderRadius,
          padding: nftToastStyles.error.padding,
          boxShadow: nftToastStyles.error.boxShadow,
          border: nftToastStyles.error.border
        }
      }
    )
  }
}
