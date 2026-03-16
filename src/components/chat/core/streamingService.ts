import { enhancedCache } from './cacheManager';
import { chatLogger } from '../../../utils/log/chatLogger';
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

interface ProcessChunkResult {
  processedContent: string;
  remainingChunk: string;
  shouldUpdate: boolean;
}

export class StreamingService {
  private activeStreams: Set<ReadableStreamDefaultReader<Uint8Array>>;

  constructor() {
    this.activeStreams = new Set();
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
    chatLogger.logStreamingEvent(
      { type: 'START', messageId: lastMessage.id },
      'StreamingService'
    );
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
    
    // Stream tracking variables (reduce verbosity)
    let chunkCounter = 0;
    let totalBytesRead = 0;
    const streamStartTime = Date.now();
    // Persistent decoder so multi-byte UTF-8 sequences (emoji) that span chunk
    // boundaries are buffered correctly instead of becoming ◆ replacement chars.
    const streamDecoder = new TextDecoder('utf-8', { fatal: false });
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          const duration = Date.now() - streamStartTime;
          chatLogger.logInfo('✅ Stream completado', 'StreamingService', {
            chunks: chunkCounter,
            bytes: totalBytesRead,
            duration: `${duration}ms`,
            avgSpeed: `${Math.round(totalBytesRead / duration)}b/ms`
          });
          break;
        }
        
        chunkCounter++;
        totalBytesRead += value?.length || 0;
        
        // Log solo cada 50 chunks o en producción nunca
        if (chunkCounter % 50 === 0) {
          chatLogger.logDebug(`📊 Stream progreso: ${chunkCounter} chunks, ${totalBytesRead} bytes`, 'StreamingService');
        }
        
        // chunkIndex++; // Removed unused increment
        
        // Process chunk directly in main thread (web worker removed for simplicity)
        const result = await this.processChunkMainThread(value!, isLowPerformance, streamDecoder);
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
      // Flush any bytes buffered by the streaming TextDecoder (e.g. trailing emoji)
      const flushed = streamDecoder.decode();
      if (flushed) fullResponse += flushed;
      chatLogger.logInfo('Finalizando stream con contenido', 'StreamingService', {
        contentLength: fullResponse.length
      });
      onUpdate(fullResponse);
      onFinish(fullResponse);
      
      if (fullResponse && lastMessage?.conversationId) {
        try {
          await enhancedCache.set(lastMessage.conversationId, fullResponse, 3600000);
          chatLogger.logCache('SET', { conversationId: lastMessage.conversationId });
        } catch (error) {
          chatLogger.logWarning('Falló el caché de respuesta', 'StreamingService', {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
    } catch (error) {
      if (frameId) cancelAnimationFrame(frameId);
      chatLogger.logError('Error en streaming', 'StreamingService', {
        errorName: (error as Error).name,
        errorMessage: (error as Error).message
      }, error as Error);
      
      if ((error as Error).name === 'AbortError') {
        chatLogger.logInfo('Stream cancelado por usuario', 'StreamingService');
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
      chatLogger.logInfo('Limpiando recursos del stream', 'StreamingService', {
        activeStreams: this.activeStreams.size
      });
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
    isLowPerformance: boolean,
    decoder?: TextDecoder
  ): Promise<ProcessChunkResult> {
    // Use the caller-supplied persistent decoder (stream:true) to handle multi-byte
    // sequences split across chunks. Fall back to a one-shot decoder if called standalone.
    const chunk = decoder
      ? decoder.decode(value, { stream: true })
      : new TextDecoder('utf-8').decode(value);
    
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
  }
}