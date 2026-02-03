/**
 * 🚦 REQUEST QUEUE: Rate limiter para evitar 429 errors de The Graph API
 * 
 * Implementa un queue system con:
 * - Límite de requests concurrentes
 * - Delay mínimo entre requests
 * - Automatic retry con exponential backoff para 429s
 */

interface QueuedRequest {
  fn: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  retries: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private running = 0;
  private readonly maxConcurrent = 1; // 🔥 ULTRA CONSERVATIVE: Solo 1 request a la vez
  private readonly minDelay = 3000; // 🔥 3 segundos delay para evitar 429
  private lastRequestTime = 0;
  
  /**
   * Encola un request con automatic retry logic
   */
  async enqueue<T>(fn: () => Promise<T>, maxRetries = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        retries: maxRetries,
      });
      this.processQueue();
    });
  }

  /**
   * Procesa la cola de requests respetando límites
   */
  private async processQueue(): Promise<void> {
    // Si ya hay suficientes requests corriendo, esperar
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Calcular delay necesario desde último request
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, this.minDelay - timeSinceLastRequest);

    // Esperar delay si es necesario
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Sacar siguiente request de la cola
    const item = this.queue.shift();
    if (!item) return;

    this.running++;
    this.lastRequestTime = Date.now();

    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Si es 429 y quedan reintentos, volver a encolar con backoff
      if ('statusCode' in errorObj && (errorObj as { statusCode?: number }).statusCode === 429 && item.retries > 0) {
        const backoffDelay = Math.min(5000 * (item.retries + 1), 30000); // Max 30s
        console.warn(`⚠️ [RequestQueue] Got 429, retrying in ${backoffDelay}ms (${item.retries} retries left)`);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        this.queue.unshift({
          ...item,
          retries: item.retries - 1,
        });
      } else {
        item.reject(errorObj);
      }
    } finally {
      this.running--;
      // Procesar siguiente request
      this.processQueue();
    }
  }

  /**
   * Limpia la cola (útil para cleanup)
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Obtiene estado actual de la cola
   */
  getStats() {
    return {
      queued: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();
