interface WorkerMessage {
  type: string;
  data?: unknown;
  id: string | number;
}

interface ProcessStreamData {
  chunk: Uint8Array | ArrayBuffer;
  accumulated: string;
  isLowPerformance: boolean;
  chunkIndex: number;
}

interface DecodeTextData {
  buffer: ArrayBuffer;
  encoding?: string;
}

interface ProcessingMetrics {
  chunkSize: number;
  totalSize: number;
  linesProcessed: number;
  hasContent: boolean;
}

interface ProcessedChunkResult {
  fullResponse: string;
  remainingChunk: string;
  shouldUpdate: boolean;
  metrics: ProcessingMetrics;
  chunkIndex: number;
}

interface ErrorInfo {
  message: string;
  name: string;
  stack?: string;
}

// Web Worker for processing streaming responses
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, data, id } = e.data;
  
  switch (type) {
    case 'PROCESS_STREAM':
      processStreamChunk(data as ProcessStreamData, id);
      break;
    case 'DECODE_TEXT':
      decodeTextChunk(data as DecodeTextData, id);
      break;
    case 'CLEANUP':
      cleanup(id);
      break;
    default:
      self.postMessage({
        type: 'ERROR',
        id,
        error: `Unknown message type: ${type}`
      });
  }
};

function processStreamChunk(data: ProcessStreamData, id: string | number): void {
  try {
    const { chunk, accumulated, isLowPerformance, chunkIndex } = data;
    
    // Convert Uint8Array back to ArrayBuffer if needed
    const buffer = chunk instanceof Uint8Array ? chunk.buffer : chunk;
    
    const decoder = new TextDecoder('utf-8');
    const decodedChunk = decoder.decode(buffer, { stream: true });
    
    const newAccumulated = accumulated + decodedChunk;
    const lines = newAccumulated.split('\n');
    const remainingChunk = lines.pop() || '';
    
    let fullResponse = '';
    for (const line of lines) {
      if (line.trim()) {
        fullResponse += line + '\n';
      }
    }
    
    // Intelligent throttling based on performance and content
    const shouldUpdate = !isLowPerformance || 
                        decodedChunk.includes('.') || 
                        decodedChunk.includes('!') ||
                        decodedChunk.includes('?') ||
                        decodedChunk.includes('\n') ||
                        fullResponse.length % 100 === 0 ||
                        chunkIndex % 5 === 0; // Every 5th chunk
    
    // Calculate processing metrics
    const metrics: ProcessingMetrics = {
      chunkSize: decodedChunk.length,
      totalSize: fullResponse.length + remainingChunk.length,
      linesProcessed: lines.length - 1,
      hasContent: fullResponse.length > 0
    };
    
    const result: ProcessedChunkResult = {
      fullResponse,
      remainingChunk,
      shouldUpdate,
      metrics,
      chunkIndex
    };
    
    self.postMessage({
      type: 'CHUNK_PROCESSED',
      id,
      data: result
    });
  } catch (error) {
    const errorInfo: ErrorInfo = {
      message: (error as Error).message,
      name: (error as Error).name,
      stack: (error as Error).stack
    };
    
    self.postMessage({
      type: 'PROCESSING_ERROR',
      id,
      error: errorInfo
    });
  }
}

function decodeTextChunk(data: DecodeTextData, id: string | number): void {
  try {
    const { buffer, encoding = 'utf-8' } = data;
    const decoder = new TextDecoder(encoding);
    const text = decoder.decode(buffer);
    
    self.postMessage({
      type: 'TEXT_DECODED',
      id,
      data: { text, size: text.length }
    });
  } catch (error) {
    self.postMessage({
      type: 'DECODE_ERROR',
      id,
      error: {
        message: (error as Error).message,
        name: (error as Error).name
      }
    });
  }
}

function cleanup(id: string | number): void {
  // Cleanup any ongoing operations for this session
  self.postMessage({
    type: 'CLEANUP_COMPLETE',
    id
  });
}

// Handle worker errors
self.onerror = function(
  event: Event | string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
) {
  let message = '';
  if (typeof event === 'string') {
    message = event;
  } else if (error && error.message) {
    message = error.message;
  } else if ((event as ErrorEvent).message) {
    message = (event as ErrorEvent).message;
  } else {
    message = 'Unknown error';
  }

  self.postMessage({
    type: 'WORKER_ERROR',
    error: {
      message,
      filename: source,
      lineno,
      colno
    }
  });
};

// Handle unhandled promise rejections
self.onunhandledrejection = function(event: PromiseRejectionEvent) {
  self.postMessage({
    type: 'WORKER_UNHANDLED_REJECTION',
    error: {
      message: (event.reason as Error)?.message || 'Unhandled promise rejection',
      reason: event.reason
    }
  });
};

// Export empty object to make this a module
export {};
