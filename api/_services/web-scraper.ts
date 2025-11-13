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
    // OPTIMIZACIÓN: Timeout reducido para Vercel
    // En producción (Vercel): 8 segundos máximo
    // En desarrollo: 15 segundos
    this.timeout = process.env.VERCEL ? 8000 : 15000; // 15 seconds for better reliability
    this.maxRetries = process.env.VERCEL ? 1 : 2; // Menos reintentos en prod
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NuxchainBot/1.0';
  }

  /**
   * Detects URLs in text
   */
  detectUrls(text: string): string[] {
    const urlRegex: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
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
   * Extracts content from a URL
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
      
      const extractedData = this.parseHtml(html, url);

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

    } catch (error) {
      // Critical error logging only
      console.error(`❌ [WebScraper] Error extracting content from ${url}:`, error.message);
      return {
        success: false,
        url: url,
        error: error.message,
        metadata: {
          domain: this.extractDomain(url),
          extractedAt: new Date().toISOString(),
          failed: true
        }
      };
    }
  }

  /**
   * Parses HTML and extracts relevant content
   */
  parseHtml(html: string, url: string): ExtractedHtmlData {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    // Clean title
    title = title.replace(/\s+/g, ' ').trim();

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract content from body
    let content = '';
    
    // Remove scripts, styles and other unwanted elements
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Extract text from main content elements
    const contentSelectors = [
      /<main[^>]*>([\s\S]*?)<\/main>/gi,
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class=["'][^"']*post[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*>([\s\S]*?)<\/section>/gi
    ];

    for (const selector of contentSelectors) {
      const matches = cleanHtml.match(selector);
      if (matches) {
        content += matches.map(match => this.extractTextFromHtml(match)).join(' ');
      }
    }

    // If no specific content found, extract from full body
    if (!content.trim()) {
      const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = this.extractTextFromHtml(bodyMatch[1]);
      }
    }

    // Clean and format content
    content = this.cleanText(content);
    
    // Combine description if available
    if (description && !content.includes(description)) {
      content = description + '\n\n' + content;
    }

    return {
      title: title || 'No title',
      content: content || 'Content not available',
      metadata: {
        description: description,
        hasContent: !!content.trim(),
        wordCount: content.split(/\s+/).length
      }
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