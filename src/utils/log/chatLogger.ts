/**
 * 📝 Chat Logger Module
 * ==================
 * Sistema centralizado y profesional de logging para el módulo de chat.
 * Proporciona métodos estructurados para registrar eventos, errores y estados.
 * 
 * @module chatLogger
 * @version 1.0.0
 */

export interface LogContext {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
  duration?: number;
  error?: Error;
}

export interface ChatStreamingEvent {
  type: 'START' | 'UPDATE' | 'FINISH' | 'ERROR' | 'CANCEL';
  messageId?: string;
  contentLength?: number;
  chunkCount?: number;
  duration?: number;
  error?: string;
}

export interface ChatMessageEvent {
  type: 'SEND' | 'RECEIVE' | 'ERROR' | 'DELETE';
  messageId: string;
  sender: 'user' | 'assistant';
  contentPreview?: string;
  timestamp: string;
}

export interface ChatStateEvent {
  type: 'STATE_CHANGE' | 'ERROR' | 'RECOVERY';
  prevState?: string;
  newState?: string;
  reason?: string;
  error?: string;
}

class ChatLogger {
  private isDevelopment = !import.meta.env.PROD;
  private logHistory: LogContext[] = [];
  private maxHistorySize = 100;
  private performanceMetrics = new Map<string, number[]>();

  /**
   * Log de evento de streaming
   */
  logStreamingEvent(event: ChatStreamingEvent, component: string = 'StreamingService'): void {
    const timestamp = this.getTimestamp();
    
    switch (event.type) {
      case 'START':
        this.logInfo(
          `⏹️ Stream iniciado`,
          component,
          {
            messageId: event.messageId,
            timestamp
          }
        );
        break;

      case 'UPDATE':
        this.logDebug(
          `📥 Stream actualizado`,
          component,
          {
            messageId: event.messageId,
            contentLength: event.contentLength,
            timestamp
          }
        );
        break;

      case 'FINISH':
        this.logInfo(
          `✅ Stream completado`,
          component,
          {
            messageId: event.messageId,
            totalLength: event.contentLength,
            chunkCount: event.chunkCount,
            duration: `${event.duration}ms`,
            timestamp
          }
        );
        break;

      case 'ERROR':
        this.logError(
          `❌ Error en stream`,
          component,
          {
            messageId: event.messageId,
            error: event.error,
            timestamp
          }
        );
        break;

      case 'CANCEL':
        this.logInfo(
          `⏸️ Stream cancelado por usuario`,
          component,
          {
            messageId: event.messageId,
            duration: `${event.duration}ms`,
            timestamp
          }
        );
        break;
    }
  }

  /**
   * Log de evento de mensaje
   */
  logMessageEvent(event: ChatMessageEvent, component: string = 'ChatMessage'): void {
    const timestamp = this.getTimestamp();

    switch (event.type) {
      case 'SEND':
        this.logInfo(
          `📤 Mensaje enviado`,
          component,
          {
            messageId: event.messageId,
            sender: event.sender,
            preview: event.contentPreview?.substring(0, 50) + '...',
            timestamp
          }
        );
        break;

      case 'RECEIVE':
        this.logInfo(
          `📩 Mensaje recibido`,
          component,
          {
            messageId: event.messageId,
            sender: event.sender,
            preview: event.contentPreview?.substring(0, 50) + '...',
            timestamp
          }
        );
        break;

      case 'ERROR':
        this.logError(
          `❌ Error procesando mensaje`,
          component,
          {
            messageId: event.messageId,
            error: event.contentPreview,
            timestamp
          }
        );
        break;

      case 'DELETE':
        this.logInfo(
          `🗑️ Mensaje eliminado`,
          component,
          {
            messageId: event.messageId,
            timestamp
          }
        );
        break;
    }
  }

  /**
   * Log de cambio de estado del chat
   */
  logStateEvent(event: ChatStateEvent, component: string = 'ChatReducer'): void {
    const timestamp = this.getTimestamp();

    switch (event.type) {
      case 'STATE_CHANGE':
        this.logInfo(
          `🔄 Cambio de estado`,
          component,
          {
            from: event.prevState,
            to: event.newState,
            reason: event.reason,
            timestamp
          }
        );
        break;

      case 'ERROR':
        this.logError(
          `❌ Error de estado`,
          component,
          {
            prevState: event.prevState,
            error: event.error,
            timestamp
          }
        );
        break;

      case 'RECOVERY':
        this.logInfo(
          `🔧 Recuperación de estado`,
          component,
          {
            prevState: event.prevState,
            newState: event.newState,
            timestamp
          }
        );
        break;
    }
  }

  /**
   * Log de operación con medición de rendimiento
   */
  logOperation(
    operationName: string,
    duration: number,
    component: string = 'Chat',
    success: boolean = true,
    details?: Record<string, unknown>
  ): void {
    const timestamp = this.getTimestamp();
    const level = success ? 'INFO' : 'WARN';
    const symbol = success ? '⚡' : '⚠️';

    this.logWithLevel(
      level,
      `${symbol} ${operationName}`,
      component,
      {
        duration: `${duration}ms`,
        success,
        ...details,
        timestamp
      }
    );

    // Registrar métrica para análisis
    if (!this.performanceMetrics.has(operationName)) {
      this.performanceMetrics.set(operationName, []);
    }
    this.performanceMetrics.get(operationName)!.push(duration);
  }

  /**
   * Log de URL processing
   */
  logUrlProcessing(
    action: 'START' | 'PROGRESS' | 'COMPLETE' | 'ERROR',
    urls: string[],
    duration?: number,
    error?: string
  ): void {
    const timestamp = this.getTimestamp();
    const urlCount = urls.length;

    switch (action) {
      case 'START':
        this.logInfo(
          `🔗 Iniciando análisis de URLs`,
          'UrlProcessor',
          {
            urlCount,
            urls: urls.slice(0, 3).map(u => this.sanitizeUrl(u)),
            timestamp
          }
        );
        break;

      case 'PROGRESS':
        this.logDebug(
          `🔗 Procesando URLs`,
          'UrlProcessor',
          {
            urlCount,
            timestamp
          }
        );
        break;

      case 'COMPLETE':
        this.logInfo(
          `✅ Análisis de URLs completado`,
          'UrlProcessor',
          {
            urlCount,
            duration: duration ? `${duration}ms` : undefined,
            timestamp
          }
        );
        break;

      case 'ERROR':
        this.logError(
          `❌ Error en análisis de URLs`,
          'UrlProcessor',
          {
            urlCount,
            error,
            timestamp
          }
        );
        break;
    }
  }

  /**
   * Log de conexión de red
   */
  logNetworkStatus(isOnline: boolean, previousStatus?: boolean): void {
    const timestamp = this.getTimestamp();

    if (previousStatus !== undefined && previousStatus !== isOnline) {
      const message = isOnline 
        ? '🟢 Conexión restablecida'
        : '🔴 Conexión perdida';

      this.logInfo(message, 'NetworkStatus', {
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        timestamp
      });
    }
  }

  /**
   * Log de caché
   */
  logCache(action: 'HIT' | 'MISS' | 'SET' | 'CLEAR' | 'ERROR', details?: Record<string, unknown>): void {
    const timestamp = this.getTimestamp();
    const symbols: Record<string, string> = {
      'HIT': '💾✅',
      'MISS': '💾❌',
      'SET': '💾📝',
      'CLEAR': '💾🗑️',
      'ERROR': '💾⚠️'
    };

    this.logDebug(
      `${symbols[action]} Cache ${action}`,
      'CacheManager',
      {
        action,
        ...details,
        timestamp
      }
    );
  }

  /**
   * Log de error estructurado
   */
  logError(
    message: string,
    component: string = 'Chat',
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    this.logWithLevel('ERROR', message, component, {
      ...context,
      errorStack: error?.stack,
      timestamp: this.getTimestamp()
    });

    // También loguear en consola para debugging
    if (this.isDevelopment) {
      console.error(`[${component}] ${message}`, {
        context,
        error
      });
    }
  }

  /**
   * Log de advertencia
   */
  logWarning(
    message: string,
    component: string = 'Chat',
    context?: Record<string, unknown>
  ): void {
    this.logWithLevel('WARN', message, component, {
      ...context,
      timestamp: this.getTimestamp()
    });

    if (this.isDevelopment) {
      console.warn(`[${component}] ${message}`, context);
    }
  }

  /**
   * Log de información
   */
  logInfo(
    message: string,
    component: string = 'Chat',
    context?: Record<string, unknown>
  ): void {
    this.logWithLevel('INFO', message, component, {
      ...context,
      timestamp: this.getTimestamp()
    });

    if (this.isDevelopment) {
      console.info(`[${component}] ${message}`, context);
    }
  }

  /**
   * Log de debug
   */
  logDebug(
    message: string,
    component: string = 'Chat',
    context?: Record<string, unknown>
  ): void {
    if (!this.isDevelopment) return;

    this.logWithLevel('DEBUG', message, component, {
      ...context,
      timestamp: this.getTimestamp()
    });

    console.debug(`[${component}] ${message}`, context);
  }

  /**
   * Método privado para loguear con nivel
   */
  private logWithLevel(
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    message: string,
    component: string,
    context?: Record<string, unknown>
  ): void {
    const logEntry: LogContext = {
      timestamp: this.getTimestamp(),
      level,
      component,
      action: message,
      data: context
    };

    this.addToHistory(logEntry);

    if (this.isDevelopment) {
      this.formatAndLog(logEntry);
    }
  }

  /**
   * Agregar entrada al historial
   */
  private addToHistory(entry: LogContext): void {
    this.logHistory.push(entry);

    // Mantener tamaño máximo del historial
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Formatear y mostrar log en consola
   */
  private formatAndLog(entry: LogContext): void {
    const colors = {
      DEBUG: 'color: #888; font-weight: bold;',
      INFO: 'color: #0066ff; font-weight: bold;',
      WARN: 'color: #ff6600; font-weight: bold;',
      ERROR: 'color: #ff0000; font-weight: bold;'
    };

    const style = colors[entry.level];
    
    // Log simplificado para consola - solo mostrar información esencial
    const logMessage = `[${entry.level}] ${entry.component} • ${entry.action}`;
    
    if (entry.data && Object.keys(entry.data).length > 0) {
      console.log(`%c${logMessage}`, style, entry.data);
    } else {
      console.log(`%c${logMessage}`, style);
    }
  }

  /**
   * Obtener timestamp formateado
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Sanitizar URLs para logs
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.substring(0, 30)}...`;
    } catch {
      return url.substring(0, 50) + '...';
    }
  }

  /**
   * Obtener historial de logs
   */
  getHistory(): LogContext[] {
    return [...this.logHistory];
  }

  /**
   * Limpiar historial
   */
  clearHistory(): void {
    this.logHistory = [];
    this.performanceMetrics.clear();
  }

  /**
   * Obtener métricas de rendimiento
   */
  getPerformanceMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const metrics: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [operationName, durations] of this.performanceMetrics) {
      if (durations.length > 0) {
        metrics[operationName] = {
          avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          min: Math.min(...durations),
          max: Math.max(...durations),
          count: durations.length
        };
      }
    }

    return metrics;
  }

  /**
   * Exportar logs para debugging
   */
  exportLogs(): string {
    const report = {
      timestamp: this.getTimestamp(),
      environment: this.isDevelopment ? 'development' : 'production',
      historySize: this.logHistory.length,
      logs: this.logHistory,
      metrics: this.getPerformanceMetrics()
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Log de sesión
   */
  logSessionStart(): void {
    this.logInfo(
      '🚀 Sesión de chat iniciada',
      'ChatSession',
      {
        userAgent: navigator.userAgent,
        timestamp: this.getTimestamp()
      }
    );
  }

  /**
   * Log de fin de sesión
   */
  logSessionEnd(): void {
    this.logInfo(
      '🛑 Sesión de chat finalizada',
      'ChatSession',
      {
        logsGenerated: this.logHistory.length,
        timestamp: this.getTimestamp()
      }
    );
  }
}

// Singleton instance
export const chatLogger = new ChatLogger();

// Export tipo para uso en otros módulos
export type { ChatLogger };
