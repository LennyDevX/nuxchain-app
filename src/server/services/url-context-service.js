/**
 * Servicio para manejar URL Context de Gemini API
 * Permite obtener contenido de URLs para proporcionar contexto adicional
 */

import SimpleWebScraperService from './simple-web-scraper.js';
import analyticsService from './analytics-service.js';

class UrlContextService {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheTTL = 300000; // 5 minutos
    this.webScraper = new SimpleWebScraperService();
  }

  /**
   * Obtiene el contenido de una URL para usar como contexto
   * @param {string} url - URL a procesar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Contenido procesado de la URL
   */
  async fetchUrlContext(url, options = {}) {
    const requestMetrics = analyticsService.startRequest('url_context', 'url-fetch');
    
    try {
      // Validar URL
      if (!this.isValidUrl(url)) {
        throw new Error('URL inválida proporcionada');
      }

      // Verificar caché
      const cacheKey = this.generateCacheKey(url, options);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        analyticsService.endRequest(requestMetrics, {
          cached: true,
          url: url,
          contentLength: cachedResult.content?.length || 0
        });
        return cachedResult;
      }

      // Obtener contenido usando el simple web scraper
        const scrapedContent = await this.webScraper.extractContent(url);

      if (!scrapedContent.success) {
        // En lugar de lanzar un error, podemos devolver un objeto con información de error
        // o un contenido vacío para que Gemini pueda decidir qué hacer.
        // Por ahora, lanzaremos un error para que el flujo de error sea consistente.
        throw new Error(`Error al obtener contenido de la URL: ${scrapedContent.error}`);
      }

      // Procesar y estructurar el contenido para Gemini
      const processedContent = this.processContentForGemini(scrapedContent, options);

      // Guardar en caché
      this.saveToCache(cacheKey, processedContent);

      analyticsService.endRequest(requestMetrics, {
        cached: false,
        url: url,
        contentLength: processedContent.content?.length || 0,
        title: processedContent.title,
        success: true
      });

      return processedContent;
    } catch (error) {
      analyticsService.failRequest(requestMetrics, error);
      throw error;
    }
  }

  /**
   * Procesa el contenido scrapeado para optimizarlo para Gemini
   * @param {Object} scrapedContent - Contenido obtenido del scraper
   * @param {Object} options - Opciones de procesamiento
   * @returns {Object} - Contenido procesado
   */
  processContentForGemini(scrapedContent, options = {}) {
    const { title, content, metadata, url } = scrapedContent;
    
    // Limpiar y estructurar el contenido
    let cleanContent = content || '';
    
    // Limitar longitud del contenido
    const maxLength = options.maxContentLength || 10000;
    if (cleanContent.length > maxLength) {
      cleanContent = cleanContent.substring(0, maxLength) + '...';
    }

    // Crear contexto estructurado para Gemini
    const contextData = {
      url: url,
      title: title || 'Sin título',
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
   * Genera un resumen del contenido para contexto
   * @param {string} content - Contenido a resumir
   * @param {string} title - Título del contenido
   * @returns {string} - Resumen generado
   */
  generateContentSummary(content, title) {
    if (!content) return 'Contenido no disponible';
    
    // Extraer las primeras oraciones más relevantes
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ');
    
    return summary || content.substring(0, 200) + '...';
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
   * Extrae el dominio de una URL
   * @param {string} url - URL
   * @returns {string} - Dominio extraído
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Genera clave de caché
   * @param {string} url - URL
   * @param {Object} options - Opciones
   * @returns {string} - Clave de caché
   */
  generateCacheKey(url, options) {
    return `${url}_${JSON.stringify(options)}`;
  }

  /**
   * Obtiene contenido del caché
   * @param {string} key - Clave de caché
   * @returns {Object|null} - Contenido cacheado o null
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Guarda contenido en caché
   * @param {string} key - Clave de caché
   * @param {Object} data - Datos a cachear
   */
  saveToCache(key, data) {
    // Limpiar caché si está lleno
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpia el caché
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Procesa URL Context (método principal llamado desde el controlador)
   * @param {string} url - URL a procesar
   * @param {string} query - Query opcional para el contexto
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async processUrlContext(url, query, options = {}) {
    try {
      console.log(`Procesando URL Context: ${url}`);
      
      // Obtener el contenido de la URL
      const contextData = await this.fetchUrlContext(url, options);
      
      // Si hay una query, agregar contexto adicional
      let result = {
        url: contextData.url,
        title: contextData.title,
        content: contextData.content,
        summary: contextData.summary,
        metadata: contextData.metadata
      };
      
      if (query) {
        result.query = query;
        result.contextualResponse = `Basado en el contenido de ${contextData.title || url}: ${contextData.summary}`;
      }
      
      return result;
    } catch (error) {
      console.error('Error en processUrlContext:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del servicio
   * @returns {Object} - Estadísticas
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      cacheTTL: this.cacheTTL
    };
  }
}

export default new UrlContextService();