/**
 * 🎨 Tokenization Toast Notifications
 * Centralized styling and messaging for tokenization operations (upload, mint, approve, etc.)
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for Tokenization
 */
const tokenizationToastStyles = {
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
  loading: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
    border: '1px solid rgba(139, 92, 246, 0.5)',
    icon: '⏳'
  }
}

/**
 * Tokenization Toast Notifications
 */
export const tokenizationToasts = {
  // File Upload
  fileSelected: (fileName: string, size: string) => {
    toast.success(
      `📁 File "${fileName}" selected (${size})`,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.success.background,
          color: tokenizationToastStyles.success.color,
          fontSize: tokenizationToastStyles.success.fontSize,
          fontWeight: tokenizationToastStyles.success.fontWeight,
          borderRadius: tokenizationToastStyles.success.borderRadius,
          padding: tokenizationToastStyles.success.padding,
          boxShadow: tokenizationToastStyles.success.boxShadow,
          border: tokenizationToastStyles.success.border
        }
      }
    )
  },

  fileUploadError: (error: string) => {
    toast.error(
      `❌ Upload failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  fileSizeTooLarge: (maxSize: string) => {
    toast.error(
      `📦 File too large. Maximum size: ${maxSize}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  invalidFileType: (acceptedTypes: string) => {
    toast.error(
      `❌ Invalid file type. Accepted: ${acceptedTypes}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  // Minting
  mintingInProgress: () => {
    return toast.loading(
      `⏳ Minting your NFT... This may take a few moments`,
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.loading.background,
          color: tokenizationToastStyles.loading.color,
          fontSize: tokenizationToastStyles.loading.fontSize,
          fontWeight: tokenizationToastStyles.loading.fontWeight,
          borderRadius: tokenizationToastStyles.loading.borderRadius,
          padding: tokenizationToastStyles.loading.padding,
          boxShadow: tokenizationToastStyles.loading.boxShadow,
          border: tokenizationToastStyles.loading.border
        }
      }
    )
  },

  mintingSuccess: (nftName: string, tokenId: string) => {
    toast.success(
      `🎉 NFT "${nftName}" minted successfully! Token ID: ${tokenId}`,
      {
        duration: 8000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.success.background,
          color: tokenizationToastStyles.success.color,
          fontSize: tokenizationToastStyles.success.fontSize,
          fontWeight: tokenizationToastStyles.success.fontWeight,
          borderRadius: tokenizationToastStyles.success.borderRadius,
          padding: tokenizationToastStyles.success.padding,
          boxShadow: tokenizationToastStyles.success.boxShadow,
          border: tokenizationToastStyles.success.border
        }
      }
    )
  },

  mintingError: (error: string) => {
    toast.error(
      `❌ Minting failed: ${error}`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  // Metadata/Details
  metadataValidationError: (field: string) => {
    toast.error(
      `❌ Invalid metadata: ${field}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  requiredFieldMissing: (fieldName: string) => {
    toast.error(
      `❌ Required field missing: ${fieldName}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  // Approval/Permission
  approvalRequested: () => {
    return toast.loading(
      `⏳ Requesting contract approval...`,
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.loading.background,
          color: tokenizationToastStyles.loading.color,
          fontSize: tokenizationToastStyles.loading.fontSize,
          fontWeight: tokenizationToastStyles.loading.fontWeight,
          borderRadius: tokenizationToastStyles.loading.borderRadius,
          padding: tokenizationToastStyles.loading.padding,
          boxShadow: tokenizationToastStyles.loading.boxShadow,
          border: tokenizationToastStyles.loading.border
        }
      }
    )
  },

  approvalSuccess: () => {
    toast.success(
      `✅ Contract approved successfully!`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.success.background,
          color: tokenizationToastStyles.success.color,
          fontSize: tokenizationToastStyles.success.fontSize,
          fontWeight: tokenizationToastStyles.success.fontWeight,
          borderRadius: tokenizationToastStyles.success.borderRadius,
          padding: tokenizationToastStyles.success.padding,
          boxShadow: tokenizationToastStyles.success.boxShadow,
          border: tokenizationToastStyles.success.border
        }
      }
    )
  },

  approvalError: (error: string) => {
    toast.error(
      `❌ Approval failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  // IPFS/Storage
  uploadingToIPFS: () => {
    return toast.loading(
      `📤 Uploading to IPFS...`,
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.loading.background,
          color: tokenizationToastStyles.loading.color,
          fontSize: tokenizationToastStyles.loading.fontSize,
          fontWeight: tokenizationToastStyles.loading.fontWeight,
          borderRadius: tokenizationToastStyles.loading.borderRadius,
          padding: tokenizationToastStyles.loading.padding,
          boxShadow: tokenizationToastStyles.loading.boxShadow,
          border: tokenizationToastStyles.loading.border
        }
      }
    )
  },

  ipfsUploadSuccess: (ipfsHash: string) => {
    toast.success(
      `📦 Uploaded to IPFS: ${ipfsHash.slice(0, 10)}...`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.success.background,
          color: tokenizationToastStyles.success.color,
          fontSize: tokenizationToastStyles.success.fontSize,
          fontWeight: tokenizationToastStyles.success.fontWeight,
          borderRadius: tokenizationToastStyles.success.borderRadius,
          padding: tokenizationToastStyles.success.padding,
          boxShadow: tokenizationToastStyles.success.boxShadow,
          border: tokenizationToastStyles.success.border
        }
      }
    )
  },

  ipfsUploadError: (error: string) => {
    toast.error(
      `❌ IPFS upload failed: ${error}`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  // Wallet
  walletNotConnected: () => {
    toast.error(
      `🔐 Please connect your wallet to tokenize assets`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  },

  incorrectNetwork: (expectedNetwork: string) => {
    toast(
      `🌐 Please switch to ${expectedNetwork} network`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.warning.background,
          color: tokenizationToastStyles.warning.color,
          fontSize: tokenizationToastStyles.warning.fontSize,
          fontWeight: tokenizationToastStyles.warning.fontWeight,
          borderRadius: tokenizationToastStyles.warning.borderRadius,
          padding: tokenizationToastStyles.warning.padding,
          boxShadow: tokenizationToastStyles.warning.boxShadow,
          border: tokenizationToastStyles.warning.border
        }
      }
    )
  },

  // Processing
  processingTransaction: (step: string) => {
    return toast.loading(
      `⏳ ${step}... Please wait`,
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.loading.background,
          color: tokenizationToastStyles.loading.color,
          fontSize: tokenizationToastStyles.loading.fontSize,
          fontWeight: tokenizationToastStyles.loading.fontWeight,
          borderRadius: tokenizationToastStyles.loading.borderRadius,
          padding: tokenizationToastStyles.loading.padding,
          boxShadow: tokenizationToastStyles.loading.boxShadow,
          border: tokenizationToastStyles.loading.border
        }
      }
    )
  },

  // Info messages
  skillTokenBenefit: (benefit: string) => {
    toast(
      `✨ Skill Token Benefit: ${benefit}`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: tokenizationToastStyles.info.background,
          color: tokenizationToastStyles.info.color,
          fontSize: tokenizationToastStyles.info.fontSize,
          fontWeight: tokenizationToastStyles.info.fontWeight,
          borderRadius: tokenizationToastStyles.info.borderRadius,
          padding: tokenizationToastStyles.info.padding,
          boxShadow: tokenizationToastStyles.info.boxShadow,
          border: tokenizationToastStyles.info.border
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
          background: tokenizationToastStyles.error.background,
          color: tokenizationToastStyles.error.color,
          fontSize: tokenizationToastStyles.error.fontSize,
          fontWeight: tokenizationToastStyles.error.fontWeight,
          borderRadius: tokenizationToastStyles.error.borderRadius,
          padding: tokenizationToastStyles.error.padding,
          boxShadow: tokenizationToastStyles.error.boxShadow,
          border: tokenizationToastStyles.error.border
        }
      }
    )
  }
}
