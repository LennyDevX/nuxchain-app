/**
 * Servicio simplificado de web scraping para entorno serverless
 * Compatible con Vercel y otros entornos serverless
 */
class SimpleWebScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.timeout = 10000;
    this.maxContentLength = 50000;
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
   * Extrae contenido de una URL usando solo fetch y regex
   */
  async extractContent(url) {
    try {
      console.log(`[SimpleWebScraper] Extrayendo contenido de: ${url}`);
      
      if (!this.isValidUrl(url)) {
        return { success: false, error: 'URL no válida' };
      }

      // Configurar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          return { success: false, error: `Contenido no es HTML: ${contentType}` };
        }

        const html = await response.text();
        console.log(`[SimpleWebScraper] HTML obtenido: ${html.length} caracteres`);

        return this.parseHtmlContent(url, html);

      } catch (fetchError) {
        clearTimeout(timeoutId);
        return { success: false, error: `Error al realizar fetch: ${fetchError.message}` };
      }

    } catch (error) {
      console.error(`[SimpleWebScraper] Error extrayendo ${url}:`, error.message);
      return { success: false, error: `Error extrayendo contenido: ${error.message}` };
    }
  }

  /**
   * Parsea el contenido HTML usando regex
   */
  parseHtmlContent(url, html) {
    try {
      // Extraer título
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? this.cleanText(titleMatch[1]) : 'Sin título';

      // Extraer descripción meta
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? this.cleanText(descMatch[1]) : '';

      // Extraer keywords meta
      const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
      const keywords = keywordsMatch ? this.cleanText(keywordsMatch[1]) : '';

      // Limpiar HTML de elementos no deseados
      let content = html;
      
      // Remover scripts, estilos y otros elementos
      content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
      content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
      content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
      content = content.replace(/<!--[\s\S]*?-->/g, '');

      // Intentar extraer contenido principal
      const mainSelectors = [
        /<main[^>]*>([\s\S]*?)<\/main>/gi,
        /<article[^>]*>([\s\S]*?)<\/article>/gi,
        /<div[^>]*class[^>]*["'].*?content.*?["'][^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class[^>]*["'].*?post.*?["'][^>]*>([\s\S]*?)<\/div>/gi,
        /<section[^>]*>([\s\S]*?)<\/section>/gi
      ];

      let mainContent = '';
      for (const regex of mainSelectors) {
        const matches = [...content.matchAll(regex)];
        if (matches.length > 0) {
          const candidate = matches.map(match => match[1]).join(' ');
          if (candidate.length > mainContent.length) {
            mainContent = candidate;
          }
        }
      }

      // Si no se encontró contenido principal, usar el body
      if (!mainContent || mainContent.length < 100) {
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        mainContent = bodyMatch ? bodyMatch[1] : content;
      }

      // Limpiar tags HTML y normalizar texto
      const cleanContent = this.cleanHtmlTags(mainContent);
      
      if (cleanContent.length < 50) {
        throw new Error('Contenido extraído insuficiente');
      }

      const finalContent = cleanContent.substring(0, this.maxContentLength);
      const excerpt = description || finalContent.substring(0, 300) + (finalContent.length > 300 ? '...' : '');

      console.log(`[SimpleWebScraper] ✓ Contenido extraído: ${finalContent.length} caracteres`);

      return {
        url,
        title,
        content: finalContent,
        excerpt,
        metadata: {
          title,
          description,
          keywords,
          length: finalContent.length,
          extractionMethod: 'simple-regex',
          extractedAt: new Date().toISOString(),
          domain: new URL(url).hostname
        },
        success: true
      };

    } catch (error) {
      console.error(`[SimpleWebScraper] Error parseando HTML:`, error.message);
      throw error;
    }
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

export default SimpleWebScraperService;