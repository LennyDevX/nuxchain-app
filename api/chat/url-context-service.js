/**
 * Servicio para manejar URL Context de Gemini API
 * Permite obtener contenido de URLs para proporcionar contexto adicional
 */

import WebScraperService from './web-scraper.js';
import analyticsService from './analytics-service.js';

class UrlContextService {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheTTL = 300000; // 5 minutos
    this.webScraper = new WebScraperService();
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

      // Usar un cacheKey simple si las opciones no afectan el resultado
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

      // Limitar el tamaño máximo de contenido por defecto
      const maxContentLength = options.maxContentLength || 3000;
      const scrapedContent = await this.webScraper.extractContent(url, { ...options, maxContentLength });

      if (!scrapedContent.success) {
        throw new Error(`Error al obtener contenido de la URL: ${scrapedContent.error}`);
      }

      // Procesar y estructurar el contenido para Gemini
      const processedContent = this.processContentForGemini(scrapedContent, { ...options, maxContentLength });

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
      // Solo log de error crítico
      console.error('Error en fetchUrlContext:', error.message);
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
    let cleanContent = content || '';
    const maxLength = options.maxContentLength || 3000;
    if (cleanContent.length > maxLength) {
      cleanContent = cleanContent.substring(0, maxLength) + '...';
    }
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
    // Limitar a 2 oraciones para mayor velocidad
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 2).join('. ');
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
    // Usar solo la URL como clave para simplificar y mejorar el hit rate
    return url;
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
      // Eliminar el elemento más antiguo
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
      console.error('Error en processUrlContext:', error.message);
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