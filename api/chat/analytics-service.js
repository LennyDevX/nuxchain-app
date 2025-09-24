/**
 * Servicio de Analytics simplificado para Vercel
 * Maneja métricas y estadísticas de rendimiento
 */

class AnalyticsService {
  constructor() {
    this.metrics = {
      requests: new Map(),
      performance: new Map()
    };
  }

  /**
   * Inicia el seguimiento de una solicitud
   * @param {string} service - Nombre del servicio
   * @param {string} operation - Operación realizada
   * @returns {Object} - Objeto de métricas para la solicitud
   */
  startRequest(service, operation) {
    const requestId = `${service}_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const requestMetrics = {
      id: requestId,
      service: service,
      operation: operation,
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    };

    this.metrics.requests.set(requestId, requestMetrics);
    
    console.log(`📊 [Analytics] Iniciando seguimiento: ${service}/${operation} [${requestId}]`);
    
    return requestMetrics;
  }

  /**
   * Finaliza el seguimiento de una solicitud exitosa
   * @param {Object} requestMetrics - Métricas de la solicitud
   * @param {Object} additionalData - Datos adicionales
   */
  endRequest(requestMetrics, additionalData = {}) {
    if (!requestMetrics || !requestMetrics.id) {
      console.warn('⚠️ [Analytics] RequestMetrics inválido para endRequest');
      return;
    }

    const endTime = Date.now();
    const duration = endTime - requestMetrics.startTime;
    const endMemory = this.getMemoryUsage();
    const memoryDelta = endMemory - requestMetrics.startMemory;

    const completedMetrics = {
      ...requestMetrics,
      endTime: endTime,
      duration: duration,
      endMemory: endMemory,
      memoryDelta: memoryDelta,
      success: true,
      ...additionalData
    };

    this.metrics.requests.set(requestMetrics.id, completedMetrics);
    
    console.log(`✅ [Analytics] Solicitud completada: ${requestMetrics.service}/${requestMetrics.operation} - ${duration}ms`);
    
    // Limpiar métricas antiguas para evitar memory leaks
    this.cleanupOldMetrics();
  }

  /**
   * Marca una solicitud como fallida
   * @param {Object} requestMetrics - Métricas de la solicitud
   * @param {Error} error - Error ocurrido
   */
  failRequest(requestMetrics, error) {
    if (!requestMetrics || !requestMetrics.id) {
      console.warn('⚠️ [Analytics] RequestMetrics inválido para failRequest');
      return;
    }

    const endTime = Date.now();
    const duration = endTime - requestMetrics.startTime;
    const endMemory = this.getMemoryUsage();
    const memoryDelta = endMemory - requestMetrics.startMemory;

    const failedMetrics = {
      ...requestMetrics,
      endTime: endTime,
      duration: duration,
      endMemory: endMemory,
      memoryDelta: memoryDelta,
      success: false,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    };

    this.metrics.requests.set(requestMetrics.id, failedMetrics);
    
    console.error(`❌ [Analytics] Solicitud fallida: ${requestMetrics.service}/${requestMetrics.operation} - ${duration}ms - ${error.message}`);
    
    // Limpiar métricas antiguas
    this.cleanupOldMetrics();
  }

  /**
   * Registra una métrica de rendimiento
   * @param {string} name - Nombre de la métrica
   * @param {number} value - Valor de la métrica
   * @param {Object} metadata - Metadatos adicionales
   */
  recordPerformance(name, value, metadata = {}) {
    const performanceMetric = {
      name: name,
      value: value,
      timestamp: Date.now(),
      metadata: metadata
    };

    if (!this.metrics.performance.has(name)) {
      this.metrics.performance.set(name, []);
    }

    this.metrics.performance.get(name).push(performanceMetric);
    
    console.log(`📈 [Analytics] Métrica registrada: ${name} = ${value}`);
    
    // Mantener solo las últimas 100 métricas por nombre
    const metrics = this.metrics.performance.get(name);
    if (metrics.length > 100) {
      this.metrics.performance.set(name, metrics.slice(-100));
    }
  }

  /**
   * Obtiene estadísticas de un servicio
   * @param {string} service - Nombre del servicio
   * @returns {Object} - Estadísticas del servicio
   */
  getServiceStats(service) {
    const serviceRequests = Array.from(this.metrics.requests.values())
      .filter(req => req.service === service);

    if (serviceRequests.length === 0) {
      return {
        service: service,
        totalRequests: 0,
        successRate: 0,
        averageDuration: 0,
        averageMemoryDelta: 0
      };
    }

    const successfulRequests = serviceRequests.filter(req => req.success);
    const totalDuration = serviceRequests.reduce((sum, req) => sum + (req.duration || 0), 0);
    const totalMemoryDelta = serviceRequests.reduce((sum, req) => sum + (req.memoryDelta || 0), 0);

    return {
      service: service,
      totalRequests: serviceRequests.length,
      successfulRequests: successfulRequests.length,
      failedRequests: serviceRequests.length - successfulRequests.length,
      successRate: (successfulRequests.length / serviceRequests.length) * 100,
      averageDuration: totalDuration / serviceRequests.length,
      averageMemoryDelta: totalMemoryDelta / serviceRequests.length,
      lastRequest: serviceRequests[serviceRequests.length - 1]
    };
  }

  /**
   * Obtiene todas las estadísticas
   * @returns {Object} - Todas las estadísticas
   */
  getAllStats() {
    const services = [...new Set(Array.from(this.metrics.requests.values()).map(req => req.service))];
    const serviceStats = services.map(service => this.getServiceStats(service));

    return {
      services: serviceStats,
      totalRequests: this.metrics.requests.size,
      performanceMetrics: Object.fromEntries(
        Array.from(this.metrics.performance.entries()).map(([name, metrics]) => [
          name,
          {
            count: metrics.length,
            latest: metrics[metrics.length - 1],
            average: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
          }
        ])
      ),
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Obtiene el uso actual de memoria
   * @returns {number} - Uso de memoria en MB
   */
  getMemoryUsage() {
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100; // MB con 2 decimales
      }
    } catch (error) {
      // En entornos donde process no está disponible
    }
    return 0;
  }

  /**
   * Limpia métricas antiguas para evitar memory leaks
   */
  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos

    // Limpiar requests antiguos
    for (const [id, metrics] of this.metrics.requests.entries()) {
      if (now - metrics.startTime > maxAge) {
        this.metrics.requests.delete(id);
      }
    }

    // Limpiar métricas de rendimiento antiguas
    for (const [name, metrics] of this.metrics.performance.entries()) {
      const recentMetrics = metrics.filter(m => now - m.timestamp <= maxAge);
      if (recentMetrics.length === 0) {
        this.metrics.performance.delete(name);
      } else {
        this.metrics.performance.set(name, recentMetrics);
      }
    }
  }

  /**
   * Reinicia todas las métricas
   */
  reset() {
    this.metrics.requests.clear();
    this.metrics.performance.clear();
    console.log('🔄 [Analytics] Métricas reiniciadas');
  }
}

// Exportar instancia singleton
export default new AnalyticsService();