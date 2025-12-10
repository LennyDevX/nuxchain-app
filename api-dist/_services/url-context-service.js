/**
 * ✅ TypeScript Migration - Phase 3
 * URL Context Service for Gemini API
 * Provides functionality to fetch content from URLs for additional context
 */
import WebScraperService from './web-scraper.js';
import analyticsService from './analytics-service.js';
class UrlContextService {
    cache;
    maxCacheSize;
    cacheTTL;
    webScraper;
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 100;
        this.cacheTTL = 300000; // 5 minutes
        this.webScraper = new WebScraperService();
    }
    /**
     * Fetches content from a URL for use as context
     */
    async fetchUrlContext(url, options = {}) {
        const requestMetrics = analyticsService.startRequest('url_context', 'url-fetch');
        try {
            // Validate URL
            if (!this.isValidUrl(url)) {
                throw new Error('Invalid URL provided');
            }
            // Use simple cacheKey if options don't affect result
            const cacheKey = url;
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult) {
                analyticsService.endRequest(requestMetrics, {
                    cached: true,
                    url: url,
                    contentLength: cachedResult.content?.length || 0
                });
                return cachedResult;
            }
            // Limit maximum content length by default
            const maxContentLength = options.maxContentLength || 3000;
            const scrapedContent = await this.webScraper.extractContent(url, { ...options, maxContentLength });
            if (!scrapedContent.success) {
                throw new Error(`Failed to get content from URL: ${scrapedContent.error}`);
            }
            // Process and structure content for Gemini
            const processedContent = this.processContentForGemini(scrapedContent, { ...options, maxContentLength });
            // Save to cache
            this.saveToCache(cacheKey, processedContent);
            analyticsService.endRequest(requestMetrics, {
                cached: false,
                url: url,
                contentLength: processedContent.content?.length || 0,
                title: processedContent.title,
                success: true
            });
            return processedContent;
        }
        catch (error) {
            analyticsService.failRequest(requestMetrics, error);
            // Critical error logging only
            console.error('Error in fetchUrlContext:', error.message);
            throw error;
        }
    }
    /**
     * Processes scraped content to optimize it for Gemini
     */
    processContentForGemini(scrapedContent, options = {}) {
        const { title, content, metadata, url } = scrapedContent;
        let cleanContent = content || '';
        const maxLength = options.maxContentLength || 3000;
        if (cleanContent.length > maxLength) {
            cleanContent = cleanContent.substring(0, maxLength) + '...';
        }
        const contextData = {
            url: url,
            title: title || 'No title',
            content: cleanContent,
            metadata: {
                domain: this.extractDomain(url),
                extractedAt: new Date().toISOString(),
                contentLength: cleanContent.length,
                originalLength: content?.length || 0,
                ...metadata
            },
            summary: this.generateContentSummary(cleanContent, title)
        };
        return contextData;
    }
    /**
     * Generates a summary of the content for context
     */
    generateContentSummary(content, title) {
        if (!content)
            return 'Content not available';
        // Limit to 2 sentences for faster processing
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const summary = sentences.slice(0, 2).join('. ');
        return summary || content.substring(0, 200) + '...';
    }
    /**
     * Validates if a URL is valid
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    /**
     * Extracts domain from a URL
     */
    extractDomain(url) {
        try {
            return new URL(url).hostname;
        }
        catch {
            return 'unknown';
        }
    }
    /**
     * Generates cache key
     */
    generateCacheKey(url, options) {
        // Use only URL as key to simplify and improve hit rate
        return url;
    }
    /**
     * Gets content from cache
     */
    getFromCache(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() - item.timestamp > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    /**
     * Saves content to cache
     */
    saveToCache(key, data) {
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
            if (oldestKey)
                this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    /**
     * Clears the cache
     */
    clearCache() {
        this.cache.clear();
    }
}
// Create singleton instance
const urlContextService = new UrlContextService();
export default urlContextService;
