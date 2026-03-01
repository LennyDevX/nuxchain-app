/**
 * 🎨 Tokenization Toast Notifications
 * Centralized styling and messaging for tokenization operations (upload, mint, approve, etc.)
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  success: makeToastStyle('success'),
  error:   makeToastStyle('error'),
  warning: makeToastStyle('warning'),
  info:    makeToastStyle('info'),
  loading: makeToastStyle('loading'),
}

/**
 * Tokenization Toast Notifications
 */
export const tokenizationToasts = {
  // File Upload
  fileSelected: (fileName: string, size: string) => {
    toast.success(
      `📁 File "${fileName}" selected (${size})`,
      { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.success }
    )
  },

  fileUploadError: (error: string) => {
    toast.error(
      `❌ Upload failed: ${error}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  fileSizeTooLarge: (maxSize: string) => {
    toast.error(
      `📦 File too large. Maximum size: ${maxSize}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  invalidFileType: (acceptedTypes: string) => {
    toast.error(
      `❌ Invalid file type. Accepted: ${acceptedTypes}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  // Minting
  mintingInProgress: (message?: string) => {
    return toast.loading(
      message ?? `⏳ Minting your NFT... This may take a few moments`,
      { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading }
    )
  },

  mintingSuccess: (nftName: string, tokenId: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.success(
      `🎉 NFT "${nftName}" minted successfully! Token ID: ${tokenId}`,
      { duration: toastDurations.critical, position: DEFAULT_POSITION, style: s.success }
    )
  },

  mintingError: (error: string, toastId?: string) => {
    if (toastId) toast.dismiss(toastId)
    toast.error(
      `❌ Minting failed: ${error}`,
      { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.error }
    )
  },

  // Metadata/Details
  metadataValidationError: (field: string) => {
    toast.error(
      `❌ Invalid metadata: ${field}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  requiredFieldMissing: (fieldName: string) => {
    toast.error(
      `❌ Required field missing: ${fieldName}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  // Approval/Permission
  approvalRequested: () => {
    return toast.loading(
      `⏳ Requesting contract approval...`,
      { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading }
    )
  },

  approvalSuccess: () => {
    toast.success(
      `✅ Contract approved successfully!`,
      { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.success }
    )
  },

  approvalError: (error: string) => {
    toast.error(
      `❌ Approval failed: ${error}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  // IPFS/Storage
  uploadingToIPFS: () => {
    return toast.loading(
      `📤 Uploading to IPFS...`,
      { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading }
    )
  },

  ipfsUploadSuccess: (ipfsHash: string) => {
    toast.success(
      `📦 Uploaded to IPFS: ${ipfsHash.slice(0, 10)}...`,
      { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.success }
    )
  },

  ipfsUploadError: (error: string) => {
    toast.error(
      `❌ IPFS upload failed: ${error}`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  // Wallet
  walletNotConnected: () => {
    toast.error(
      `🔐 Please connect your wallet to tokenize assets`,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  },

  incorrectNetwork: (expectedNetwork: string) => {
    toast(
      `🌐 Please switch to ${expectedNetwork} network`,
      { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.warning }
    )
  },

  // Processing
  processingTransaction: (step: string) => {
    return toast.loading(
      `⏳ ${step}... Please wait`,
      { duration: toastDurations.loading, position: DEFAULT_POSITION, style: s.loading }
    )
  },

  // Info messages
  skillTokenBenefit: (benefit: string) => {
    toast(
      `✨ Skill Token Benefit: ${benefit}`,
      { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.info }
    )
  },

  // Generic error
  error: (message: string) => {
    toast.error(
      message,
      { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error }
    )
  }
}
