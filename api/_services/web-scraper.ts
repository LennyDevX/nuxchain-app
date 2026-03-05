/**
 * ✅ TypeScript Migration - Phase 3
 * Web Scraping Service optimized for Vercel
 * Efficiently extracts content from web pages
 */

import type { WebScraperOptions, ExtractedHtmlData, WebScraperResult } from '../types/index.js';

class WebScraperService {
  private timeout: number;
  private maxRetries: number;
  private userAgent: string;

  constructor() {
    // Configuration optimized for Vercel
    // OPTIMIZACIÓN: Timeout reducido de 8s a 4s para evitar timeouts en Vercel
    // Fallback rápido a OpenGraph/meta description si la extracción completa falla
    this.timeout = process.env.VERCEL ? 4000 : 8000; // 4s prod, 8s dev
    this.maxRetries = process.env.VERCEL ? 1 : 2; // Menos reintentos en prod
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NuxchainBot/1.0';
  }

  /**
   * Detects URLs in text
   */
  detectUrls(text: string): string[] {
    const urlRegex: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.+~#?&//=]*)/g;
    return text.match(urlRegex) || [];
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
   * Extracts domain from URL
   */
  extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Extracts content from a URL with fast OpenGraph fallback
   */
  async extractContent(url: string, options: WebScraperOptions = {}): Promise<WebScraperResult> {
    try {
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL');
      }

      // Configure timeout and headers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log(`[WebScraper] Fetching URL: ${url} (timeout: ${this.timeout}ms)`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error(`Content is not HTML: ${contentType}`);
      }

      const html = await response.text();
      console.log(`[WebScraper] HTML obtained: ${html.length} characters`);
      
      const extractedData = this.parseHtml(html);

      // Limit extracted content to first 3000 characters
      let limitedContent = extractedData.content || '';
      const maxLength = options.maxContentLength || 3000;
      if (limitedContent.length > maxLength) {
        limitedContent = limitedContent.substring(0, maxLength) + '...';
      }

      return {
        success: true,
        url: url,
        title: extractedData.title,
        content: limitedContent,
        metadata: {
          domain: new URL(url).hostname,
          extractedAt: new Date().toISOString(),
          contentLength: limitedContent.length,
          ...extractedData.metadata
        }
      };

    } catch (error: unknown) {
      // FAST FALLBACK: Si timeout o error, intentar extraer solo OpenGraph/meta tags
      const message = error instanceof Error ? error.message : String(error);
      
      if (message.includes('aborted') || message.includes('timeout')) {
        console.warn(`⚠️  [WebScraper] Timeout on ${url}, trying fast OpenGraph extraction`);
        try {
          return await this.extractOpenGraphFast(url);
        } catch (_ogError) {
          console.error(`❌ [WebScraper] OpenGraph fallback also failed for ${url}`);
        }
      }

      console.error(`❌ [WebScraper] Error extracting content from ${url}:`, message);
      return {
        success: false,
        url: url,
        error: message,
        metadata: {
          domain: this.extractDomain(url),
          extractedAt: new Date().toISOString(),
          failed: true
        }
      };
    }
  }

  /**
   * Fast extraction of OpenGraph tags only (< 2s)
   * Used as fallback when full extraction times out
   */
  async extractOpenGraphFast(url: string): Promise<WebScraperResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': this.userAgent },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Only read first 50KB to extract meta tags
      const html = await response.text();
      const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      const head = headMatch ? headMatch[1] : html.substring(0, 5000);

      // Extract OpenGraph tags
      const ogTitle = head.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      const ogDesc = head.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      const ogImage = head.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      const metaDesc = head.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const titleTag = head.match(/<title[^>]*>([^<]+)<\/title>/i);

      const title = (ogTitle?.[1] || titleTag?.[1] || 'No title').trim();
      const content = (ogDesc?.[1] || metaDesc?.[1] || 'No description available').trim();

      return {
        success: true,
        url: url,
        title,
        content,
        metadata: {
          domain: this.extractDomain(url),
          extractedAt: new Date().toISOString(),
          contentLength: content.length,
          ogImage: ogImage?.[1],
          fastExtraction: true
        }
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parses HTML and extracts relevant content
   */
  parseHtml(html: string): ExtractedHtmlData {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : 'No title';
    title = title.replace(/\s+/g, ' ').trim();

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    let content = '';
    // Enhanced selectors: added article and specific content IDs
    const contentSelectors = [
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<main[^>]*>([\s\S]*?)<\/main>/gi,
      /<div[^>]*id=["'](?:content|main|article|post-content|main-content)["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class=["'][^"']*(?:content|article|post-text|entry-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class=["'][^"']*main[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi
    ];

    for (const selector of contentSelectors) {
      const match = selector.exec(cleanHtml);
      if (match && match[1]) {
        content = this.extractTextFromHtml(match[1]);
        if (content.length > 500) break; // If we found significant text, stop searching
      }
    }

    if (!content.trim()) {
      const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) content = this.extractTextFromHtml(bodyMatch[1]);
    }

    content = this.cleanText(content);
    if (description && !content.includes(description)) {
      content = description + '\n\n' + content;
    }

    // Increased truncation to 5000 characters
    const maxLength = 5000;
    if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '... [Content Truncated]';
    }

    return {
      title,
      content: content || 'Content not available',
      metadata: {
        description,
        hasContent: content.length > 0,
        wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
      },
    };
  }

  /**
   * Extracts plain text from HTML
   */
  extractTextFromHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Cleans text for better readability
   */
  cleanText(text: string): string {
    return text
      .replace(/[\n\r]+/g, '\n') // Normalize newlines
      .replace(/\n\s+\n/g, '\n\n') // Remove empty lines with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
  }
};

export default WebScraperService;