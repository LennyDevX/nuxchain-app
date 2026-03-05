/**
 * ✅ TypeScript Migration - Phase 3
 * URL Context Service for Gemini API
 * Uses native Gemini URL context tool for fetching and analyzing URL content
 * @see https://ai.google.dev/gemini-api/docs/url-context
 */

import type {
  UrlContextOptions,
  ProcessedUrlContent,
  CachedUrlData,
  RequestMetrics
} from '../types/index.js';
import analyticsService from './analytics-service.js';

interface UrlMetadata {
  retrieved_url: string;
  url_retrieval_status: 'URL_RETRIEVAL_STATUS_SUCCESS' | 'URL_RETRIEVAL_STATUS_FAILED' | 'URL_RETRIEVAL_STATUS_UNSAFE';
}

class UrlContextService {
  private cache: Map<string, CachedUrlData>;
  private maxCacheSize: number;
  private cacheTTL: number;

  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheTTL = 300000; // 5 minutes
  }

  /**
   * Validates URL for Gemini URL context tool
   * Note: The actual URL fetching is handled by Gemini's native URL context tool
   * This service provides validation and metadata tracking
   * 
   * @example
   * // In your API endpoint, use Gemini's tools API:
   * const tools = [{ "url_context": {} }];
   * const response = await client.models.generate_content({
    *   model: "gemini-3.1-flash-lite",
   *   contents: `Analyze this URL: ${url}`,
   *   config: { tools }
   * });
   */
  async validateUrlForContext(url: string): Promise<{ valid: boolean; error?: string }> {
    const requestMetrics: RequestMetrics = analyticsService.startRequest('url_context', 'url-validation');
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL provided');
      }

      // Check if URL is accessible type
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      analyticsService.endRequest(requestMetrics, {
        url: url,
        valid: true
      });

      return { valid: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      analyticsService.failRequest(requestMetrics, err);
      console.error('Error validating URL:', err.message);
      return { valid: false, error: err.message };
    }
  }

  /**
   * Processes URL context metadata from Gemini response
   * Extracts information about URL retrieval success/failure
   */
  processUrlContextMetadata(urlMetadata: UrlMetadata[]): { successful: string[]; failed: string[]; unsafe: string[] } {
    const result = {
      successful: [] as string[],
      failed: [] as string[],
      unsafe: [] as string[]
    };

    for (const meta of urlMetadata) {
      if (meta.url_retrieval_status === 'URL_RETRIEVAL_STATUS_SUCCESS') {
        result.successful.push(meta.retrieved_url);
      } else if (meta.url_retrieval_status === 'URL_RETRIEVAL_STATUS_UNSAFE') {
        result.unsafe.push(meta.retrieved_url);
      } else {
        result.failed.push(meta.retrieved_url);
      }
    }

    return result;
  }

  /**
   * Creates context data structure for tracking
   */
  createContextData(url: string, title?: string): ProcessedUrlContent {
    return {
      url: url,
      title: title || 'URL Content',
      content: '', // Content is handled by Gemini's native URL context tool
      metadata: {
        domain: this.extractDomain(url),
        extractedAt: new Date().toISOString(),
        contentLength: 0,
        originalLength: 0
      },
      summary: 'Content retrieved via Gemini URL context tool'
    };
  }

  /**
   * Generates a summary of the content for context
   */
  generateContentSummary(content: string): string {
    if (!content) return 'Content not available';
    // Limit to 2 sentences for faster processing
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 2).join('. ');
    return summary || content.substring(0, 200) + '...';
  }

  /**
   * Validates if a URL is valid
   */
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extracts domain from a URL
   */
  extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Generates cache key
   */
  generateCacheKey(url: string): string {
    // Use only URL as key to simplify and improve hit rate
    return url;
  }

  /**
   * Gets content from cache
   */
  getFromCache(key: string): ProcessedUrlContent | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  /**
   * Saves content to cache
   */
  saveToCache(key: string, data: ProcessedUrlContent): void {
    // Clean cache if full
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest item
      let oldestKey;
      let oldestTime = Infinity;
      for (const [k, v] of this.cache.entries()) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Create singleton instance
const urlContextService = new UrlContextService();

export default urlContextService;