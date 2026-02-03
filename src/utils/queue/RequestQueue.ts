/**
 * RequestQueue - Manages concurrent requests with configurable concurrency limit
 * Prevents rate limiting by controlling the number of parallel requests
 * Useful for IPFS/Pinata API calls, contract reads, and other rate-limited endpoints
 */

interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export class RequestQueue {
  private queue: Array<QueuedRequest<unknown>> = [];
  private activeCount = 0;
  private maxConcurrent: number;
  private readonly name: string;

  constructor(maxConcurrent: number = 5, name: string = 'RequestQueue') {
    this.maxConcurrent = maxConcurrent;
    this.name = name;
  }

  /**
   * Add a request to the queue
   * @param fn Async function to execute
   * @returns Promise that resolves when the request completes
   */
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve: resolve as (value: unknown) => void, reject });
      this.process();
    });
  }

  /**
   * Process queued requests respecting the concurrency limit
   */
  private process(): void {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      this.activeCount++;
      const request = this.queue.shift();

      if (request) {
        request
          .fn()
          .then(request.resolve)
          .catch(request.reject)
          .finally(() => {
            this.activeCount--;
            this.process();
          });
      }
    }
  }

  /**
   * Get current queue state for debugging
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeCount,
      maxConcurrent: this.maxConcurrent,
      name: this.name,
    };
  }

  /**
   * Reset queue (useful for cleanup)
   */
  clear(): void {
    // Reject all pending requests
    this.queue.forEach(request => {
      request.reject(new Error(`Queue ${this.name} cleared`));
    });
    this.queue = [];
  }
}

/**
 * Create a global request queue instance for IPFS metadata fetches
 * Set to 5 concurrent to stay well below Pinata rate limits
 */
export const ipfsMetadataQueue = new RequestQueue(5, 'IPFS-Metadata');

/**
 * Create a global request queue instance for contract reads
 * Set to 8 concurrent for contract batch calls
 */
export const contractReadQueue = new RequestQueue(8, 'Contract-Read');

/**
 * Create a global request queue instance for image preloading
 * Set to 10 concurrent for non-critical image loads
 */
export const imagePreloadQueue = new RequestQueue(10, 'Image-Preload');
