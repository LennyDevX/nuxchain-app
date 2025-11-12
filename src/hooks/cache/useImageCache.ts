import { useState, useEffect, useCallback, useRef } from 'react';
import { imageCache } from '../../utils/cache/ImageCache';
import { imagePreloadQueue } from '../../utils/queue/RequestQueue';

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
  const previousUrlRef = useRef<string | null | undefined>(undefined);
  const isInitialMount = useRef(true);

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

      // Load and cache the image via request queue to prevent Pinata 429 errors
      await imagePreloadQueue.add(() => imageCache.preloadImage(imageUrl));
      setImageUrl(imageUrl);
      setIsLoading(false);
    } catch (err) {
      console.debug('Image loading attempt made:', err instanceof Error ? err.message : String(err));
      // Don't fail - show placeholder instead
      setImageUrl(imageUrl);
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (url) {
      loadImage(url);
    }
  }, [url, loadImage]);

  useEffect(() => {
    // Skip if URL hasn't changed
    if (!isInitialMount.current && previousUrlRef.current === url) {
      return;
    }

    isInitialMount.current = false;
    previousUrlRef.current = url;

    // Reset state when URL is cleared (async to avoid cascade)
    if (!url) {
      Promise.resolve().then(() => {
        setImageUrl(null);
        setIsLoading(false);
        setError(null);
      });
      return;
    }

    // Check if image is already cached - update state async
    if (imageCache.isCached(url)) {
      Promise.resolve().then(() => {
        setImageUrl(url);
        setIsLoading(false);
        setError(null);
      });
      return;
    }

    // Load the image (async to avoid cascade warning)
    Promise.resolve().then(() => loadImage(url));
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
 * Uses RequestQueue to prevent rate limiting from Pinata gateway
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

      // Queue each image preload to prevent Pinata 429 rate limiting
      // The imagePreloadQueue enforces max 10 concurrent requests
      let loaded = imageUrls.length - uncachedUrls.length;

      for (const url of uncachedUrls) {
        try {
          await imagePreloadQueue.add(() => imageCache.preloadImage(url));
          loaded++;
          setPreloadedCount(loaded);
        } catch (err) {
          // Fail silently for individual images, just increment counter
          loaded++;
          setPreloadedCount(loaded);
        }
      }
    } catch (error) {
      console.debug('Error preloading images batch:', error instanceof Error ? error.message : String(error));
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