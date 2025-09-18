/**
 * Servicio de web scraping para entorno serverless
 * Compatible con Vercel y otros entornos serverless
 * Versión mejorada con análisis inteligente de contenido
 */
class WebScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 10000;
    this.maxContentLength = 50000;
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutos
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo inicial
  }

  /**
   * Detecta URLs en un texto
   */
  detectUrls(text) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Valida si una URL es válida
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
   * Sistema de caché inteligente
   */
  getCachedContent(url) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[SimpleWebScraper] ✓ Contenido obtenido desde caché: ${url}`);
      return cached.data;
    }
    return null;
  }

  setCachedContent(url, data) {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
    
    // Limpiar caché antiguo
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Extrae contenido con reintentos inteligentes
   */
  async extractContent(url) {
    // Verificar caché primero
    const cachedResult = this.getCachedContent(url);
    if (cachedResult) {
      return cachedResult;
    }

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[SimpleWebScraper] Intento ${attempt}/${this.maxRetries} - Extrayendo: ${url}`);
        
        if (!this.isValidUrl(url)) {
          return { success: false, error: 'URL no válida' };
        }

        const result = await this.extractContentWithTimeout(url);
        
        // Cachear resultado exitoso
        if (result.success) {
          this.setCachedContent(url, result);
        }
        
        return result;

      } catch (error) {
        lastError = error;
        console.warn(`[SimpleWebScraper] Intento ${attempt} falló:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Backoff exponencial
          console.log(`[SimpleWebScraper] Reintentando en ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    console.error(`[SimpleWebScraper] Todos los intentos fallaron para ${url}:`, lastError.message);
    return { success: false, error: `Error después de ${this.maxRetries} intentos: ${lastError.message}` };
  }

  /**
   * Extrae contenido con timeout
   */
  async extractContentWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate, br'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error(`Contenido no es HTML: ${contentType}`);
      }

      const html = await response.text();
      console.log(`[SimpleWebScraper] HTML obtenido: ${html.length} caracteres`);

      return this.parseHtmlContentAdvanced(url, html);

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  }

  /**
   * Parsea contenido HTML con análisis avanzado
   */
  parseHtmlContentAdvanced(url, html) {
    try {
      // Extraer metadatos básicos
      const metadata = this.extractBasicMetadata(html);
      
      // Detección inteligente de contenido principal
      const mainContent = this.extractMainContentIntelligent(html);
      
      // Análisis de contenido
      const contentAnalysis = this.analyzeContent(mainContent);
      
      // Extracción contextual mejorada
      const contextualData = this.extractContextualData(mainContent);
      
      // Limpiar y procesar contenido final
      const cleanContent = this.cleanHtmlTags(mainContent);
      
      if (cleanContent.length < 50) {
        throw new Error('Contenido extraído insuficiente');
      }

      const finalContent = cleanContent.substring(0, this.maxContentLength);
      const excerpt = metadata.description || contextualData.summary || 
                     finalContent.substring(0, 300) + (finalContent.length > 300 ? '...' : '');

      console.log(`[SimpleWebScraper] ✓ Contenido procesado: ${finalContent.length} caracteres`);

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
          extractionMethod: 'intelligent-analysis',
          extractedAt: new Date().toISOString(),
          domain: new URL(url).hostname,
          contentAnalysis,
          processingTime: Date.now()
        },
        success: true
      };

    } catch (error) {
      console.error(`[SimpleWebScraper] Error parseando HTML:`, error.message);
      throw error;
    }
  }

  /**
   * Extrae metadatos básicos del HTML
   */
  extractBasicMetadata(html) {
    // Título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? this.cleanText(titleMatch[1]) : 'Sin título';

    // Descripción meta
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? this.cleanText(descMatch[1]) : '';

    // Keywords meta
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
   * Detección inteligente de contenido principal usando heurísticas
   */
  extractMainContentIntelligent(html) {
    // Limpiar elementos no deseados primero
    let content = html;
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Selectores con puntuación por prioridad
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

    // Evaluar cada selector
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

    // Si no se encontró buen contenido, usar body con filtros
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
   * Calcula puntuación de calidad del contenido
   */
  calculateContentScore(content) {
    const textContent = this.cleanHtmlTags(content);
    let score = 0;

    // Longitud del texto (más texto = mejor, hasta un límite)
    const length = textContent.length;
    score += Math.min(length / 100, 50);

    // Densidad de párrafos
    const paragraphs = (content.match(/<p[^>]*>/gi) || []).length;
    score += paragraphs * 5;

    // Presencia de encabezados
    const headings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    score += headings * 3;

    // Penalizar contenido con muchos enlaces (navegación)
    const links = (content.match(/<a[^>]*>/gi) || []).length;
    const linkDensity = links / Math.max(textContent.length / 100, 1);
    score -= linkDensity * 10;

    // Penalizar contenido con muchas listas (menús)
    const lists = (content.match(/<li[^>]*>/gi) || []).length;
    if (lists > 10) score -= lists * 2;

    return Math.max(score, 0);
  }

  /**
   * Filtra contenido del body removiendo navegación y elementos no deseados
   */
  filterBodyContent(bodyContent) {
    let filtered = bodyContent;
    
    // Remover elementos de navegación y estructura
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
   * Analiza el contenido para categorización y sentimientos
   */
  analyzeContent(content) {
    const textContent = this.cleanHtmlTags(content).toLowerCase();
    
    // Categorización básica por palabras clave
    const categories = {
      'tecnología': ['javascript', 'python', 'react', 'node', 'api', 'desarrollo', 'código', 'programación', 'software'],
      'blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'smart contract', 'web3'],
      'negocios': ['empresa', 'negocio', 'mercado', 'ventas', 'marketing', 'estrategia', 'finanzas'],
      'educación': ['tutorial', 'aprender', 'curso', 'guía', 'enseñar', 'estudiante', 'educación'],
      'noticias': ['noticia', 'actualidad', 'información', 'reportaje', 'acontecimiento'],
      'documentación': ['documentación', 'manual', 'referencia', 'api docs', 'especificación']
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

    // Análisis de sentimientos básico
    const positiveWords = ['excelente', 'bueno', 'genial', 'fantástico', 'útil', 'recomendado', 'éxito'];
    const negativeWords = ['malo', 'terrible', 'problema', 'error', 'fallo', 'difícil', 'complicado'];
    
    const positiveCount = positiveWords.filter(word => textContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textContent.includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positivo';
    else if (negativeCount > positiveCount + 1) sentiment = 'negativo';

    // Detectar tipo de contenido
    const contentType = this.detectContentType(content, textContent);

    // Calcular puntuación de legibilidad básica
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
   * Detecta el tipo de contenido
   */
  detectContentType(htmlContent, textContent) {
    // Detectar código
    if (htmlContent.includes('<code>') || htmlContent.includes('<pre>') || 
        textContent.includes('function') || textContent.includes('import')) {
      return 'tutorial-técnico';
    }

    // Detectar artículo
    if (htmlContent.includes('<article>') || htmlContent.includes('<h1>')) {
      return 'artículo';
    }

    // Detectar documentación
    if (textContent.includes('api') && textContent.includes('endpoint')) {
      return 'documentación';
    }

    // Detectar noticia
    if (textContent.includes('fecha') || textContent.includes('publicado')) {
      return 'noticia';
    }

    return 'página-web';
  }

  /**
   * Calcula puntuación básica de legibilidad
   */
  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    
    // Puntuación simple: menos palabras por oración = más legible
    if (avgWordsPerSentence < 15) return 'alta';
    if (avgWordsPerSentence < 25) return 'media';
    return 'baja';
  }

  /**
   * Extrae datos contextuales mejorados
   */
  extractContextualData(content) {
    const textContent = this.cleanHtmlTags(content);
    
    // Generar resumen automático (primeras oraciones significativas)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ').trim();
    
    // Extraer puntos clave (párrafos cortos o elementos de lista)
    const keyPoints = [];
    
    // Buscar listas
    const listItems = [...content.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
    listItems.slice(0, 5).forEach(match => {
      const point = this.cleanHtmlTags(match[1]).trim();
      if (point.length > 10 && point.length < 200) {
        keyPoints.push(point);
      }
    });
    
    // Si no hay listas, usar párrafos cortos
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
   * Función auxiliar para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Limpia tags HTML y normaliza texto
   */
  cleanHtmlTags(html) {
    return html
      .replace(/<[^>]+>/g, ' ')           // Remover tags HTML
      .replace(/&nbsp;/g, ' ')            // Reemplazar &nbsp;
      .replace(/&[a-zA-Z0-9#]+;/g, ' ')   // Remover entidades HTML
      .replace(/\s+/g, ' ')               // Normalizar espacios
      .trim();                            // Remover espacios al inicio/final
  }

  /**
   * Limpia texto de caracteres especiales
   */
  cleanText(text) {
    return text
      .replace(/&[a-zA-Z0-9#]+;/g, ' ')   // Remover entidades HTML
      .replace(/\s+/g, ' ')               // Normalizar espacios
      .trim();                            // Remover espacios al inicio/final
  }

  /**
   * Obtiene contenido conocido para sitios específicos
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