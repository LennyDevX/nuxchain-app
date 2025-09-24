/**
 * Servicio de Web Scraping optimizado para Vercel
 * Extrae contenido de páginas web de manera eficiente
 */

class WebScraperService {
  constructor() {
    // Configuración optimizada para Vercel
    this.timeout = 15000; // 15 segundos para Vercel
    this.maxRetries = 2;
    this.userAgent = 'Mozilla/5.0 (compatible; NuxchainBot/1.0)';
  }

  /**
   * Detecta URLs en un texto
   * @param {string} text - Texto a analizar
   * @returns {Array} - Array de URLs encontradas
   */
  detectUrls(text) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Valida si una URL es válida
   * @param {string} url - URL a validar
   * @returns {boolean} - True si es válida
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extrae contenido de una URL
   * @param {string} url - URL a procesar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Contenido extraído
   */
  async extractContent(url, options = {}) {
    console.log(`🌐 [WebScraper] Extrayendo contenido de: ${url}`);
    
    try {
      if (!this.isValidUrl(url)) {
        throw new Error('URL inválida');
      }

      // Configurar timeout y headers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const extractedData = this.parseHtml(html, url);

      console.log(`✅ [WebScraper] Contenido extraído exitosamente de ${url}`);
      
      return {
        success: true,
        url: url,
        title: extractedData.title,
        content: extractedData.content,
        metadata: {
          domain: new URL(url).hostname,
          extractedAt: new Date().toISOString(),
          contentLength: extractedData.content?.length || 0,
          ...extractedData.metadata
        }
      };

    } catch (error) {
      console.error(`❌ [WebScraper] Error extrayendo contenido de ${url}:`, error.message);
      
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
   * Parsea HTML y extrae contenido relevante
   * @param {string} html - HTML a parsear
   * @param {string} url - URL original
   * @returns {Object} - Datos extraídos
   */
  parseHtml(html, url) {
    // Extraer título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    // Limpiar título
    title = title.replace(/\s+/g, ' ').trim();

    // Extraer meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extraer contenido del body
    let content = '';
    
    // Remover scripts, styles y otros elementos no deseados
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Extraer texto de elementos principales
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

    // Si no se encontró contenido específico, extraer del body completo
    if (!content.trim()) {
      const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = this.extractTextFromHtml(bodyMatch[1]);
      }
    }

    // Limpiar y formatear contenido
    content = this.cleanText(content);
    
    // Combinar descripción si está disponible
    if (description && !content.includes(description)) {
      content = description + '\n\n' + content;
    }

    return {
      title: title || 'Sin título',
      content: content || 'Contenido no disponible',
      metadata: {
        description: description,
        hasContent: !!content.trim(),
        wordCount: content.split(/\s+/).length
      }
    };
  }

  /**
   * Extrae texto plano de HTML
   * @param {string} html - HTML a procesar
   * @returns {string} - Texto extraído
   */
  extractTextFromHtml(html) {
    return html
      .replace(/<[^>]+>/g, ' ') // Remover tags HTML
      .replace(/&nbsp;/g, ' ') // Reemplazar entidades
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Limpia y formatea texto
   * @param {string} text - Texto a limpiar
   * @returns {string} - Texto limpio
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Normalizar espacios
      .replace(/\n\s*\n/g, '\n') // Remover líneas vacías múltiples
      .trim();
  }

  /**
   * Extrae dominio de una URL
   * @param {string} url - URL
   * @returns {string} - Dominio
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }
}

export default WebScraperService;