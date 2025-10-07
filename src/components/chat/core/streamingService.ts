import { enhancedCache } from './cacheManager';
import type { ChatMessage, ChatAction } from './chatReducer';

export interface StreamingServiceOptions {
  response: Response;
  dispatch: (action: ChatAction) => void;
  isLowPerformance: boolean;
  shouldReduceMotion: boolean;
  onUpdate: (content: string) => void;
  onFinish: (content: string) => void;
  onError: (error: Error, onRetry: () => void, messageId: string) => void;
  lastMessage: ChatMessage;
  setInput?: (input: string) => void;
}

interface WorkerCallback {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface ProcessChunkResult {
  processedContent: string;
  remainingChunk: string;
  shouldUpdate: boolean;
}

export class StreamingService {
  private activeStreams: Set<ReadableStreamDefaultReader<Uint8Array>>;
  private webWorker: Worker | null;
  private pendingWorkerCallbacks: Map<number, WorkerCallback>;

  constructor() {
    this.activeStreams = new Set();
    this.webWorker = null;
    this.pendingWorkerCallbacks = new Map();
    this.initializeWebWorker();
  }

  private initializeWebWorker(): void {
    try {
      // Try to create worker from TypeScript file
      this.webWorker = new Worker(
        new URL('./streamingWebWorker.ts', import.meta.url),
        { type: 'module' }
      );
      
      this.webWorker.onmessage = this.handleWorkerMessage.bind(this);
      this.webWorker.onerror = this.handleWorkerError.bind(this);
      
      console.log('Web Worker initialized successfully');
      
    } catch (error) {
      console.warn('Failed to initialize Web Worker from file, trying fallback:', error);
      this.tryFallbackWorker();
    }
  }

  private tryFallbackWorker(): void {
    try {
      const workerScript = this.getWorkerScript();
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.webWorker = new Worker(URL.createObjectURL(blob));
      
      this.webWorker.onmessage = this.handleWorkerMessage.bind(this);
      this.webWorker.onerror = this.handleWorkerError.bind(this);
      
      console.log('Fallback Web Worker initialized successfully');
      
    } catch (error) {
      console.warn('Web Worker not available, using main thread processing:', error);
      this.webWorker = null;
    }
  }

  private getWorkerScript(): string {
    return `
      self.onmessage = function(e) {
        const { type, data, id } = e.data;
        
        switch (type) {
          case 'PROCESS_STREAM':
            processStreamChunk(data, id);
            break;
          case 'DECODE_TEXT':
            decodeTextChunk(data, id);
            break;
          case 'CLEANUP':
            cleanup(id);
            break;
        }
      };

      function processStreamChunk(data, id) {
        try {
          const { chunk, accumulated, isLowPerformance, chunkIndex } = data;
          
          const decoder = new TextDecoder('utf-8', { stream: true });
          const decodedChunk = decoder.decode(chunk, { stream: true });
          
          const fullResponse = decodedChunk;
          
          const hasNaturalBreak = decodedChunk.includes('.') || 
                                 decodedChunk.includes('\\n') || 
                                 decodedChunk.includes('!') || 
                                 decodedChunk.includes('?');
          
          const shouldUpdate = !isLowPerformance || 
                              hasNaturalBreak ||
                              (chunkIndex % 3 === 0);
          
          self.postMessage({
            type: 'CHUNK_PROCESSED',
            id,
            data: {
              fullResponse,
              remainingChunk: '',
              shouldUpdate
            }
          });
        } catch (error) {
          self.postMessage({
            type: 'ERROR',
            id,
            error: error.message
          });
        }
      }

      function decodeTextChunk(data, id) {
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(data.chunk);
          self.postMessage({
            type: 'TEXT_DECODED',
            id,
            data: { text }
          });
        } catch (error) {
          self.postMessage({
            type: 'ERROR',
            id,
            error: error.message
          });
        }
      }

      function cleanup(id) {
        self.postMessage({ type: 'CLEANUP_COMPLETE', id });
      }
    `;
  }

  private handleWorkerMessage(e: MessageEvent): void {
    const { type, data, error, id } = e.data;
    const callback = this.pendingWorkerCallbacks.get(id);
    
    if (!callback) return;
    
    switch (type) {
      case 'CHUNK_PROCESSED':
        callback.resolve(data);
        this.pendingWorkerCallbacks.delete(id);
        break;
        
      case 'PROCESSING_ERROR':
      case 'WORKER_ERROR':
        console.error('Worker processing error:', error);
        callback.reject(new Error(error.message || 'Worker processing failed'));
        this.pendingWorkerCallbacks.delete(id);
        break;
        
      case 'CLEANUP_COMPLETE':
        callback.resolve(undefined);
        this.pendingWorkerCallbacks.delete(id);
        break;
    }
  }

  private handleWorkerError(error: ErrorEvent): void {
    console.error('Web Worker error:', error);
    for (const [, callback] of this.pendingWorkerCallbacks) {
      callback.reject(new Error('Worker error: ' + error.message));
    }
    this.pendingWorkerCallbacks.clear();
    this.webWorker = null;
  }

  async processStream({
    response,
    dispatch,
    isLowPerformance,
    shouldReduceMotion,
    onUpdate,
    onFinish,
    onError,
    lastMessage,
    setInput
  }: StreamingServiceOptions): Promise<void> {
    console.log('Starting stream processing...');
    const reader = response.body!.getReader();
    let fullResponse = '';
    let frameId: number | null = null;
    let lastUpdate = Date.now();
    // let chunkIndex = 0; // Removed unused variable
    
    const getUpdateThrottle = (): number => {
      const baseFPS = shouldReduceMotion ? 15 : 45;
      const frameBudget = 1000 / baseFPS;
      
      if (isLowPerformance) {
        return Math.max(120, frameBudget * 2.5);
      }
      
      const contentLength = fullResponse.length;
      const adaptiveMultiplier = contentLength > 1000 ? 1.5 : 1;
      
      return Math.max(20, frameBudget * adaptiveMultiplier);
    };
    
    const debouncedUpdate = this.createDebouncedUpdate(onUpdate, getUpdateThrottle());
    
    const smartUpdate = (content: string, forceUpdate = false): void => {
      if (forceUpdate) {
        debouncedUpdate.cancel();
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => onUpdate(content));
      } else {
        debouncedUpdate(content);
      }
    };
    
    this.activeStreams.add(reader);
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        console.log(`Read from stream: done=${done}, value size=${value?.length}`);
        
        if (done) {
          console.log('Stream finished.');
          break;
        }
        
        // chunkIndex++; // Removed unused increment
        
        // Process chunk directly in main thread (web worker removed for simplicity)
        const result = await this.processChunkMainThread(value!, isLowPerformance);
        fullResponse += result.processedContent;
        
        const now = Date.now();
        const throttleDelay = getUpdateThrottle();
        
        if (result.shouldUpdate || now - lastUpdate >= throttleDelay) {
          const forceUpdate = now - lastUpdate >= throttleDelay * 1.5;
          smartUpdate(fullResponse, forceUpdate);
          if (forceUpdate) lastUpdate = now;
        }
      }
      
      debouncedUpdate.cancel();
      if (frameId) cancelAnimationFrame(frameId);
      console.log('Finalizing stream with content:', fullResponse);
      onUpdate(fullResponse);
      onFinish(fullResponse);
      
      if (fullResponse && lastMessage?.conversationId) {
        try {
          await enhancedCache.set(lastMessage.conversationId, fullResponse, 3600000);
        } catch (error) {
          console.warn('Failed to cache response:', error);
        }
      }
      
    } catch (error) {
      if (frameId) cancelAnimationFrame(frameId);
      console.error('Streaming error:', error);
      
      if ((error as Error).name === 'AbortError') {
        console.log('Stream cancelled by user');
        return;
      }

      const onRetry = (): void => {
        dispatch({ type: 'REMOVE_LAST_MESSAGE' });
        if (setInput && lastMessage?.sender === 'user') {
          setInput(lastMessage.text);
        }
      };

      onError(error as Error, onRetry, lastMessage.id);

    } finally {
      console.log('Cleaning up stream resources.');
      this.activeStreams.delete(reader);
      try {
        reader.releaseLock();
      } catch {
        // Reader already released
      }
      dispatch({ type: 'FINISH_STREAM' });
    }
  }

  private async processChunkMainThread(
    value: Uint8Array,
    isLowPerformance: boolean
  ): Promise<ProcessChunkResult> {
    const decoder = new TextDecoder('utf-8');
    const chunk = decoder.decode(value);
    
    const processedContent = chunk;
    
    const hasNaturalBreak = chunk.includes('.') || 
                           chunk.includes('\n') || 
                           chunk.includes('!') || 
                           chunk.includes('?');
    
    const hasWordBoundary = chunk.includes(' ') && chunk.trim().length > 3;
    
    const shouldUpdate = !isLowPerformance || 
                        hasNaturalBreak ||
                        hasWordBoundary ||
                        (processedContent.length > 0 && processedContent.length % 60 === 0);
    
    return {
      processedContent,
      remainingChunk: '',
      shouldUpdate
    };
  }

  cancelAllStreams(): void {
    this.activeStreams.forEach(reader => {
      try {
        reader.cancel();
      } catch (e) {
        console.warn('Error cancelling stream:', e);
      }
    });
    this.activeStreams.clear();
  }

  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  private createDebouncedUpdate(
    updateFn: (content: string) => void,
    delay: number
  ): ((content: string) => void) & { cancel: () => void } {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastContent: string | null = null;
    
    const debouncedFn = (content: string): void => {
      lastContent = content;
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        if (lastContent !== null) {
          requestAnimationFrame(() => {
            updateFn(lastContent!);
            lastContent = null;
          });
        }
        timeoutId = null;
      }, delay);
    };
    
    debouncedFn.cancel = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastContent = null;
    };
    
    return debouncedFn;
  }

  destroy(): void {
    this.cancelAllStreams();
    
    for (const [, callback] of this.pendingWorkerCallbacks) {
      callback.reject(new Error('Service destroyed'));
    }
    this.pendingWorkerCallbacks.clear();
    
    if (this.webWorker) {
      try {
        this.webWorker.postMessage({ type: 'CLEANUP', id: 'destroy' });
      } catch {
        // Worker might be terminated already
      }
      
      setTimeout(() => {
        if (this.webWorker) {
          this.webWorker.terminate();
          this.webWorker = null;
        }
      }, 100);
    }
  }
}