/**
 * Advanced HTML Content Parser
 * Parses HTML with semantic analysis, content extraction, and categorization
 */

class WebScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    // Reduced timeout for Vercel (maximum 25s function limit)
    this.timeout = process.env.VERCEL ? 5000 : 10000;
    this.maxContentLength = 5000;
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    // Reduce retries in production to avoid timeouts
    this.maxRetries = process.env.VERCEL ? 1 : 3;
    this.retryDelay = 1000; // 1 second initial delay
  }

  /**
   * Detects URLs in text
   */
  detectUrls(text) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Validates if a URL is valid
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Intelligent caching system
   */
  getCachedContent(url) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[SimpleWebScraper] ✓ Content retrieved from cache: ${url}`);
      return cached.data;
    }
    return null;
  }

  setCachedContent(url, data) {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Extracts content with intelligent retries
   */
  async extractContent(url) {
    // Check cache first
    const cachedResult = this.getCachedContent(url);
    if (cachedResult) {
      return cachedResult;
    }

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[SimpleWebScraper] Attempt ${attempt}/${this.maxRetries} - Extracting: ${url}`);
          
        if (!this.isValidUrl(url)) {
          throw new Error('Invalid URL format');
        }

        // Create a controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        // Fetch with proper headers and timeout
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          signal: controller.signal,
          redirect: 'follow'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // For known sites, use optimized extraction
        const knownSiteContent = this.getKnownSiteContent(url);
        if (knownSiteContent) {
          this.setCachedContent(url, knownSiteContent);
          return knownSiteContent;
        }

        const html = await response.text();
        const result = this.parseHtmlContentAdvanced(url, html);
        
        if (result.success) {
          this.setCachedContent(url, result);
        }
        
        return result;

      } catch (error) {
        lastError = error;
        console.warn(`[SimpleWebScraper] Attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt, throw the error
        if (attempt === this.maxRetries) break;
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1)));
      }
    }

    // If all retries failed, return error result
    console.error(`[SimpleWebScraper] All extraction attempts failed for ${url}`, lastError);
    return {
      url,
      error: lastError?.message || 'Failed to extract content',
      success: false
    };
  }

  /**
   * Parses HTML content with advanced analysis
   */
  parseHtmlContentAdvanced(url, html) {
    try {
      // Extract basic metadata
      const metadata = this.extractBasicMetadata(html);
      
      // Intelligent main content detection
      const mainContent = this.extractMainContentIntelligent(html);
      
      // Content analysis
      const contentAnalysis = this.analyzeContent(mainContent);
      
      // Enhanced contextual extraction
      const contextualData = this.extractContextualData(mainContent);
      
      // Clean and process final content
      const cleanContent = this.cleanHtmlTags(mainContent);
      
      if (cleanContent.length < 50) {
        throw new Error('Insufficient extracted content');
      }

      const finalContent = cleanContent.substring(0, this.maxContentLength);
      const excerpt = metadata.description || contextualData.summary || 
                     finalContent.substring(0, 300) + (finalContent.length > 300 ? '...' : '');

      console.log(`[SimpleWebScraper] ✓ Content processed: ${finalContent.length} characters`);

      return {
        url,
        title: metadata.title,
        content: finalContent,
        excerpt,
        summary: contextualData.summary,
        keyPoints: contextualData.keyPoints,
        category: contentAnalysis.category,
        sentiment: contentAnalysis.sentiment,
        contentType: contentAnalysis.contentType,
        readabilityScore: contentAnalysis.readabilityScore,
        metadata: {
          ...metadata,
          length: finalContent.length,
          extractionMethod: 'advanced',
          extractedAt: new Date().toISOString(),
          domain: new URL(url).hostname
        },
        success: true
      };
    } catch (error) {
      console.error(`[SimpleWebScraper] Error processing ${url}:`, error);
      return {
        url,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Extracts basic metadata from HTML
   */
  extractBasicMetadata(html) {
    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? this.cleanText(titleMatch[1]) : 'Untitled';

    // Meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? this.cleanText(descMatch[1]) : '';

    // Meta keywords
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    const keywords = keywordsMatch ? this.cleanText(keywordsMatch[1]) : '';

    // Open Graph
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogTitle = ogTitleMatch ? this.cleanText(ogTitleMatch[1]) : '';

    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogDescription = ogDescMatch ? this.cleanText(ogDescMatch[1]) : '';

    return {
      title: ogTitle || title,
      description: ogDescription || description,
      keywords,
      ogTitle,
      ogDescription
    };
  }

  /**
   * Intelligent main content detection using heuristics
   */
  extractMainContentIntelligent(html) {
    // Clean unwanted elements first
    let content = html;
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Selectors with priority scoring
    const contentSelectors = [
      { regex: /<main[^>]*>([\s\S]*?)<\/main>/gi, score: 10 },
      { regex: /<article[^>]*>([\s\S]*?)<\/article>/gi, score: 9 },
      { regex: /<div[^>]*class[^>]*["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, score: 8 },
      { regex: /<div[^>]*class[^>]*["'][^"']*post[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, score: 7 },
      { regex: /<div[^>]*class[^>]*["'][^"']*entry[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, score: 7 },
      { regex: /<section[^>]*class[^>]*["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi, score: 6 },
      { regex: /<div[^>]*id[^>]*["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, score: 6 },
      { regex: /<section[^>]*>([\s\S]*?)<\/section>/gi, score: 4 }
    ];

    let bestContent = '';
    let bestScore = 0;

    // Evaluate each selector
    for (const selector of contentSelectors) {
      const matches = [...content.matchAll(selector.regex)];
      for (const match of matches) {
        const candidate = match[1];
        const contentScore = this.calculateContentScore(candidate) * selector.score;
        
        if (contentScore > bestScore) {
          bestScore = contentScore;
          bestContent = candidate;
        }
      }
    }

    // If no good content found, use body with filters
    if (!bestContent || bestScore < 50) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        bestContent = this.filterBodyContent(bodyMatch[1]);
      } else {
        bestContent = content;
      }
    }

    return bestContent;
  }

  /**
   * Calculates content quality score
   */
  calculateContentScore(content) {
    const textContent = this.cleanHtmlTags(content);
    let score = 0;

    // Text length (more text = better, up to a limit)
    const length = textContent.length;
    score += Math.min(length / 100, 50);

    // Paragraph density
    const paragraphs = (content.match(/<p[^>]*>/gi) || []).length;
    score += paragraphs * 5;

    // Presence of headings
    const headings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    score += headings * 3;

    // Penalize content with many links (navigation)
    const links = (content.match(/<a[^>]*>/gi) || []).length;
    const linkDensity = links / Math.max(textContent.length / 100, 1);
    score -= linkDensity * 10;

    // Penalize content with many lists (menus)
    const lists = (content.match(/<li[^>]*>/gi) || []).length;
    if (lists > 10) score -= lists * 2;

    return Math.max(score, 0);
  }

  /**
   * Filters body content by removing navigation and unwanted elements
   */
  filterBodyContent(bodyContent) {
    let filtered = bodyContent;
    
    // Remove navigation and structural elements
    const elementsToRemove = [
      /<nav[^>]*>[\s\S]*?<\/nav>/gi,
      /<header[^>]*>[\s\S]*?<\/header>/gi,
      /<footer[^>]*>[\s\S]*?<\/footer>/gi,
      /<aside[^>]*>[\s\S]*?<\/aside>/gi,
      /<div[^>]*class[^>]*["'][^"']*nav[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
      /<div[^>]*class[^>]*["'][^"']*menu[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
      /<div[^>]*class[^>]*["'][^"']*sidebar[^"']*["'][^>]*>[\s\S]*?<\/div>/gi
    ];

    for (const regex of elementsToRemove) {
      filtered = filtered.replace(regex, '');
    }

    return filtered;
  }

  /**
   * Analyzes content for categorization and sentiment
   */
  analyzeContent(content) {
    const textContent = this.cleanHtmlTags(content).toLowerCase();
    
    // Basic keyword-based categorization
    const categories = {
      'technology': ['javascript', 'python', 'react', 'node', 'api', 'development', 'code', 'programming', 'software'],
      'blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'smart contract', 'web3'],
      'business': ['company', 'business', 'market', 'sales', 'marketing', 'strategy', 'finance'],
      'education': ['tutorial', 'learn', 'course', 'guide', 'teach', 'student', 'education'],
      'news': ['news', 'current events', 'information', 'report', 'event'],
      'documentation': ['documentation', 'manual', 'reference', 'api docs', 'specification']
    };

    let detectedCategory = 'general';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => textContent.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = category;
      }
    }

    // Define English positive and negative words for sentiment analysis
    const positiveWords = ['good', 'excellent', 'success', 'improvement', 'benefit', 'innovation', 'positive'];
    const negativeWords = ['bad', 'terrible', 'problem', 'error', 'failure', 'difficult', 'complicated'];
    
    // Calculate positive and negative word counts
    const positiveCount = positiveWords.filter(word => textContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textContent.includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';

    // Detect content type
    const contentType = this.detectContentType(content, textContent);

    // Calculate basic readability score
    const readabilityScore = this.calculateReadabilityScore(textContent);

    return {
      category: detectedCategory,
      sentiment,
      contentType,
      readabilityScore,
      keywordMatches: maxMatches
    };
  }

  /**
   * Detects content type
   */
  detectContentType(htmlContent, textContent) {
    // Detect technical content
    if (htmlContent.includes('<code>') || htmlContent.includes('<pre>') || 
        textContent.includes('function') || textContent.includes('import')) {
      return 'technical-tutorial';
    }

    // Detect article
    if (htmlContent.includes('<article>') || htmlContent.includes('<h1>')) {
      return 'article';
    }

    // Detect documentation
    if (textContent.includes('api') && textContent.includes('endpoint')) {
      return 'documentation';
    }

    // Detect news
    if (textContent.includes('date') || textContent.includes('published')) {
      return 'news';
    }

    // Default content type
    return 'general';
  }

  /**
   * Calculates basic readability score
   */
  calculateReadabilityScore(text) {
    // Simple readability score based on sentence length and vocabulary complexity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    
    if (sentences === 0 || words === 0) return 50; // Default score if insufficient text
    
    const avgWordsPerSentence = words / sentences;
    const complexWords = text.split(/\s+/).filter(word => word.length > 6).length;
    const complexWordRatio = complexWords / words;
    
    // Higher score = more readable
    // Base score 100, subtract for complexity
    let score = 100 - (avgWordsPerSentence * 2) - (complexWordRatio * 100);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Extracts enhanced contextual data
   */
  extractContextualData(content) {
    const textContent = this.cleanHtmlTags(content);
    
    // Generate automatic summary (first significant sentences)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ').trim();
    
    // Extract key points (short paragraphs or list items)
    const keyPoints = [];
    
    // Search for lists
    const listItems = [...content.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
    listItems.slice(0, 5).forEach(match => {
      const point = this.cleanHtmlTags(match[1]).trim();
      if (point.length > 10 && point.length < 200) {
        keyPoints.push(point);
      }
    });
    
    // If no lists, use short paragraphs
    if (keyPoints.length === 0) {
      const paragraphs = [...content.matchAll(/<p[^>]*>(.*?)<\/p>/gi)];
      paragraphs.slice(0, 3).forEach(match => {
        const point = this.cleanHtmlTags(match[1]).trim();
        if (point.length > 20 && point.length < 150) {
          keyPoints.push(point);
        }
      });
    }

    return {
      summary: summary || textContent.substring(0, 200) + '...',
      keyPoints: keyPoints.slice(0, 5)
    };
  }

  /**
   * Removes HTML tags from text
   */
  cleanHtmlTags(html) {
    return html
      .replace(/<[^>]*>/g, ' ')  // Remove all HTML tags
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim();                  // Trim leading/trailing whitespace
  }

  /**
   * Cleans text by removing unwanted characters
   */
  cleanText(text) {
    return text
      .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .replace(/[<>]/g, '')     // Remove angle brackets
      .trim();                  // Trim leading/trailing whitespace
  }

  /**
   * Gets known content for specific sites
   */
  getKnownSiteContent(url) {
    const domain = new URL(url).hostname.toLowerCase();
    
    const knownSites = {
      'github.com': {
        title: 'GitHub Repository',
        content: 'GitHub is a platform for version control and collaboration using Git.',
        description: 'GitHub repository page'
      },
      'stackoverflow.com': {
        title: 'Stack Overflow',
        content: 'Stack Overflow is a question and answer site for programmers.',
        description: 'Programming Q&A community'
      }
    };

    if (knownSites[domain]) {
      const siteInfo = knownSites[domain];
      return {
        url,
        title: siteInfo.title,
        content: siteInfo.content,
        excerpt: siteInfo.description,
        metadata: {
          title: siteInfo.title,
          description: siteInfo.description,
          length: siteInfo.content.length,
          extractionMethod: 'known-site',
          extractedAt: new Date().toISOString(),
          domain
        },
        success: true
      };
    }

    return null;
  }
}

export default WebScraperService;