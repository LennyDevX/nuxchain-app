import { useState, useEffect, useCallback } from 'react';
import { imageCache } from '../../utils/cache/ImageCache';

interface UseImageCacheResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Custom hook for caching and loading images with error handling
 */
export function useImageCache(url: string | null | undefined): UseImageCacheResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadImage = useCallback(async (imageUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if image is already cached
      const cachedImage = imageCache.getCachedImage(imageUrl);
      if (cachedImage) {
        setImageUrl(imageUrl);
        setIsLoading(false);
        return;
      }

      // Check if image is currently loading
      if (imageCache.isLoading(imageUrl)) {
        // Wait for the existing loading promise
        await imageCache.preloadImage(imageUrl);
        setImageUrl(imageUrl);
        setIsLoading(false);
        return;
      }

      // Load and cache the image
      await imageCache.preloadImage(imageUrl);
      setImageUrl(imageUrl);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load image:', err);
      setError(err instanceof Error ? err.message : 'Failed to load image');
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (url) {
      loadImage(url);
    }
  }, [url, loadImage]);

  useEffect(() => {
    if (!url) {
      setImageUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Check if image is already cached
    if (imageCache.isCached(url)) {
      setImageUrl(url);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Load the image
    loadImage(url);
  }, [url, loadImage]);

  return {
    imageUrl,
    isLoading,
    error,
    retry
  };
}

/**
 * Hook for preloading multiple images (useful for NFT collections)
 */
export function useImagePreloader(urls: string[]) {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadImages = useCallback(async (imageUrls: string[]) => {
    if (imageUrls.length === 0) return;

    setIsPreloading(true);
    setPreloadedCount(0);

    try {
      // Filter out already cached images
      const uncachedUrls = imageUrls.filter(url => !imageCache.isCached(url));
      
      if (uncachedUrls.length === 0) {
        setPreloadedCount(imageUrls.length);
        setIsPreloading(false);
        return;
      }

      // Preload in batches of 3 to avoid overwhelming the browser
      const batchSize = 3;
      let loaded = imageUrls.length - uncachedUrls.length;

      for (let i = 0; i < uncachedUrls.length; i += batchSize) {
        const batch = uncachedUrls.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(url => imageCache.preloadImage(url))
        );
        
        // Count successful loads
        const successfulLoads = results.filter(result => result.status === 'fulfilled').length;
        loaded += successfulLoads;
        setPreloadedCount(loaded);

        // Small delay between batches
        if (i + batchSize < uncachedUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('Error preloading images:', error);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  useEffect(() => {
    if (urls.length > 0) {
      preloadImages(urls);
    }
  }, [urls, preloadImages]);

  return {
    preloadedCount,
    totalCount: urls.length,
    isPreloading,
    progress: urls.length > 0 ? (preloadedCount / urls.length) * 100 : 0
  };
}

export default useImageCache;