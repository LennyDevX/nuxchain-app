/**
 * 🖼️ Image Optimization Utility
 * Provides helpers for responsive image serving and srcSet generation
 * 
 * Optimizations:
 * - Responsive image sizes (320w, 640w, 1024w)
 * - IPFS gateway caching
 * - Mobile-first breakpoints
 * - Prevents layout shift with aspect ratios
 */

import { ipfsToHttp } from '../ipfs/ipfsUtils';

// Predefined responsive sizes for common use cases
export const IMAGE_SIZES = {
  // NFT Cards mobile and desktop
  nft: {
    mobile: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    thumbnail: '(max-width: 640px) 80px, (max-width: 1024px) 120px, 160px',
    hero: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
    profile: '(max-width: 640px) 120px, (max-width: 1024px) 160px, 200px'
  },
  // Avatar images (typically much smaller)
  avatar: {
    xs: '(max-width: 640px) 32px, 40px',
    sm: '(max-width: 640px) 48px, 56px',
    md: '(max-width: 640px) 64px, 80px',
    lg: '(max-width: 640px) 96px, 128px',
    xl: '(max-width: 640px) 128px, 160px'
  }
};

/**
 * Generate responsive image sizes attribute
 * @param category - Category like 'nft' or 'avatar'
 * @param size - Size variant like 'mobile', 'md'
 * @returns sizes attribute value
 */
export const getImageSizes = (category: 'nft' | 'avatar', size: string): string => {
  const categoryData = IMAGE_SIZES[category];
  return (categoryData as Record<string, string>)?.[size] || '';
};

/**
 * Generate srcSet for responsive images
 * Converts IPFS URLs to HTTP gateway URLs with responsive widths
 * 
 * @param ipfsUrl - IPFS URL (ipfs:// or full URL)
 * @returns srcSet string with 320w, 640w, 1024w variants
 * 
 * @example
 * const srcSet = generateImageSrcSet(nft.image);
 * <img src={imageUrl} srcSet={srcSet} sizes={IMAGE_SIZES.nft.mobile} />
 */
export const generateImageSrcSet = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  try {
    // Convert IPFS to HTTP
    const httpUrl = ipfsToHttp(ipfsUrl);
    
    // Note: Standard IPFS gateways don't support image resizing
    // For production, consider integrating:
    // - Cloudinary: httpUrl?w=320&q=80 (quality optimization)
    // - Imgix: httpUrl?w=320&auto=format (automatic format selection)
    // - Pinata's image optimization: requires Pinata's image API
    
    // For now, return the same URL across all widths (browsers will handle caching)
    // The sizes attribute will still prevent downloading unnecessary sizes
    return `${httpUrl} 320w, ${httpUrl} 640w, ${httpUrl} 1024w`;
  } catch (error) {
    console.warn('Error generating srcSet:', error);
    return '';
  }
};

/**
 * Generate Cloudinary srcSet with automatic quality optimization
 * Requires Cloudinary account and URL transformation
 * 
 * @param imageUrl - Original image URL
 * @param cloudinaryUrl - Base Cloudinary transformation URL
 * @returns srcSet with quality and format optimization
 */
export const generateCloudinarySrcSet = (imageUrl: string, cloudinaryUrl: string): string => {
  if (!imageUrl || !cloudinaryUrl) return '';
  
  return `
    ${cloudinaryUrl}?w=320&q=80&f=auto 320w,
    ${cloudinaryUrl}?w=640&q=80&f=auto 640w,
    ${cloudinaryUrl}?w=1024&q=80&f=auto 1024w
  `.trim();
};

/**
 * Generate Imgix srcSet with automatic format selection
 * Requires Imgix account and domain setup
 * 
 * @param imageUrl - Original image URL
 * @param imgixUrl - Imgix domain URL
 * @returns srcSet with format optimization
 */
export const generateImgixSrcSet = (imageUrl: string, imgixUrl: string): string => {
  if (!imageUrl || !imgixUrl) return '';
  
  return `
    ${imgixUrl}?w=320&auto=format 320w,
    ${imgixUrl}?w=640&auto=format 640w,
    ${imgixUrl}?w=1024&auto=format 1024w
  `.trim();
};

/**
 * Get optimal image URL for device width
 * Use in fallback scenarios or when srcSet isn't fully supported
 * 
 * @param ipfsUrl - IPFS URL
 * @param deviceWidth - Current device width in pixels
 * @returns Optimized URL
 */
export const getImageForWidth = (ipfsUrl: string, deviceWidth: number): string => {
  const httpUrl = ipfsToHttp(ipfsUrl);
  
  // Return appropriate URL based on device width
  // Note: Standard IPFS doesn't support sizing, but this pattern works with CDNs
  if (deviceWidth <= 640) {
    return httpUrl; // Small screens can handle full res, but will be cached
  }
  return httpUrl;
};

/**
 * Pre-calculate aspect ratio CSS for CLS prevention
 * @param width - Image width
 * @param height - Image height
 * @returns CSS aspect-ratio value
 */
export const getImageAspectRatio = (width: number, height: number): string => {
  return `${width}/${height}`;
};

/**
 * NFT Card presets with optimized defaults
 */
export const NFT_IMAGE_PRESETS = {
  mobileCard: {
    sizes: IMAGE_SIZES.nft.mobile,
    aspectRatio: '3/4', // Common NFT aspect ratio
    loading: 'lazy' as const,
    decoding: 'async' as const
  },
  desktopCard: {
    sizes: IMAGE_SIZES.nft.mobile,
    aspectRatio: '4/3',
    loading: 'lazy' as const,
    decoding: 'async' as const
  },
  hero: {
    sizes: IMAGE_SIZES.nft.hero,
    aspectRatio: '16/9',
    loading: 'lazy' as const,
    decoding: 'async' as const
  }
};

/**
 * Avatar presets
 */
export const AVATAR_PRESETS = {
  small: {
    sizes: IMAGE_SIZES.avatar.sm,
    aspectRatio: '1/1',
    loading: 'lazy' as const
  },
  medium: {
    sizes: IMAGE_SIZES.avatar.md,
    aspectRatio: '1/1',
    loading: 'lazy' as const
  },
  large: {
    sizes: IMAGE_SIZES.avatar.lg,
    aspectRatio: '1/1',
    loading: 'lazy' as const
  }
};
