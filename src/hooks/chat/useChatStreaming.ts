import { useCallback, useRef, useEffect, useReducer, useState } from 'react';
import { StreamingService } from '../../components/chat/core/streamingService';
import { chatReducer, initialChatState } from '../../components/chat/core/chatReducer';
// Define API endpoints directly since the import is not available
const API_ENDPOINTS = {
  gemini: {
    stream: '/api/chat/stream',
    streamWithTools: '/api/chat/stream-with-tools'
  }
} as const;
import { showApiOverloadToast } from '../../components/ui/ApiOverloadNotification';

// Function to detect URLs in text - FIXED
const detectUrls = (text: string): string[] => {
  // FIXED: Character class doesn't need escaped +
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
  const urls = text.match(urlRegex) || [];
  console.log('🔍 [FRONTEND] URLs detected:', urls);
  return urls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
};

// Google Search functionality removed - only URL context remains

// Tipos para los módulos JS
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  conversationId?: string;
  isStreaming?: boolean;
  error?: string;
}

// Generador de IDs únicos para evitar duplicados
let messageIdCounter = 0;
const generateUniqueId = (prefix = 'msg') => {
  messageIdCounter++;
  return `${prefix}_${Date.now()}_${messageIdCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  error?: string;
}

interface UseChatStreamingReturn {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => void;
  isUsingUrlContext: boolean;
  pauseStream: () => void;
}

// NUEVO: Definir interfaces para tipos específicos
interface ErrorWithExtras extends Error {
  status?: number;
  isOverload?: boolean;
  isTimeout?: boolean;
  retryAfter?: number;
}

interface ErrorInfo {
  message?: string;
  isOverload?: boolean;
  retryAfter?: number;
}

interface RequestBody {
  messages: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
  urls?: string[];
}

export function useChatStreaming(): UseChatStreamingReturn {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const streamingServiceRef = useRef<StreamingService | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const [isUsingUrlContext, setIsUsingUrlContext] = useState(false);

  // Initialize streaming service
  useEffect(() => {
    streamingServiceRef.current = new StreamingService();
    
    return () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.destroy();
      }
    };
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || state.status === 'streaming') return;

    lastUserMessageRef.current = messageText;

    // Add user message
    const userMessage = {
      id: generateUniqueId('user'),
      text: messageText.trim(),
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
      conversationId: state.conversationId || generateUniqueId('conv')
    };

    dispatch({ type: 'ADD_USER_MESSAGE', payload: userMessage });
    dispatch({ type: 'START_STREAMING' });

    try {
      // Prepare conversation history for Gemini API
      const conversationHistory = state.messages.map((msg: ChatMessage) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Add current message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: messageText }]
      });

      // Automatically detect URLs
      const detectedUrls = detectUrls(messageText);
      
      // CAMBIO: Siempre usar el endpoint stream.js principal
      // El backend maneja URLs automáticamente si están presentes
      const endpoint = API_ENDPOINTS.gemini.stream;
      
      console.log('🔍 [FRONTEND] Selected endpoint:', endpoint);
      console.log('🔍 [FRONTEND] - URLs detected:', detectedUrls.length);
      
      //Tipo específico en lugar de any
      const requestBody: RequestBody = {
        messages: conversationHistory,
        model: 'gemini-2.5-flash-lite',
        temperature: 0.3,
        maxTokens: 1024,
        stream: true
      };
      
      // Si hay URLs, agregarlas al contexto
      if (detectedUrls.length > 0) {
        requestBody.urls = detectedUrls;
        setIsUsingUrlContext(true);
        console.log('🔗 [FRONTEND] URLs incluidas en el request:', detectedUrls);
      }
      
      console.log('🔍 [FRONTEND] Complete request body:', JSON.stringify(requestBody, null, 2));
      
      // Make streaming request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Intentar obtener información detallada del error
        let errorInfo: ErrorInfo | null = null;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              errorInfo = JSON.parse(errorText) as ErrorInfo;
            } catch {
              // Si no es JSON, usar el texto como mensaje
              errorInfo = { message: errorText };
            }
          }
        } catch {
          // Si no se puede leer el cuerpo, usar información básica
        }
        
        // FIXED: Crear error tipado
        const error: ErrorWithExtras = new Error(errorInfo?.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.isOverload = errorInfo?.isOverload || response.status === 503;
        error.retryAfter = errorInfo?.retryAfter;
        
        // MEJORA: Mejor manejo de errores de timeout
        if (response.status === 408 || response.status === 504) {
          error.isTimeout = true;
          error.retryAfter = 3; // Reintentar en 3 segundos
        }
        
        throw error;
      }

      if (!response.body) {
        throw new Error('No response body available for streaming');
      }

      // Process stream using StreamingService
      if (streamingServiceRef.current) {
        await streamingServiceRef.current.processStream({
          response,
          dispatch,
          isLowPerformance: false,
          shouldReduceMotion: false,
          onUpdate: (content: string) => {
            dispatch({ type: 'UPDATE_STREAM', payload: content });
          },
          onFinish: () => {
            dispatch({ type: 'FINISH_STREAM' });
          },
          onError: (error: Error, _onRetry: () => void, messageId: string) => {
            // FIXED: Type assertion correcta
            const errorWithExtras = error as ErrorWithExtras;
            
            // Verificar si es un error de sobrecarga
            if (errorWithExtras.isOverload || errorWithExtras.status === 503 || error.message.includes('sobrecargado') || error.message.includes('overloaded')) {
              const retryDelay = errorWithExtras.retryAfter ?? 5;
              showApiOverloadToast(retryDelay);
              
              // No mostrar error en el chat para errores de sobrecarga
              return;
            }
            
            dispatch({ 
              type: 'SET_ERROR', 
              payload: { error: error.message, messageId } 
            });
          },
          lastMessage: userMessage
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Error al enviar el mensaje';
      let shouldRetry = false;
      let retryDelay = 3000;
      let isOverloadError = false;
      
      if (error instanceof Error) {
        // FIXED: Type assertion correcta
        const errorWithExtras = error as ErrorWithExtras;
        
        // MEJORA: Manejo de timeouts
        if (errorWithExtras.isTimeout || error.message.includes('timeout')) {
          errorMessage = 'El servicio tardó demasiado en responder. Reintentando...';
          shouldRetry = true;
          retryDelay = 3000;
        }
        // Detectar errores de sobrecarga de la API
        else if (errorWithExtras.isOverload || errorWithExtras.status === 503) {
          errorMessage = 'The service is temporarily overloaded. Retrying automatically...';
          shouldRetry = true;
          isOverloadError = true;
          retryDelay = (errorWithExtras.retryAfter ?? 5) * 1000;
          
          // Show overload notification
          showApiOverloadToast(Math.ceil(retryDelay / 1000));
          
        } else if (error.message.includes('408') || error.message.includes('Timeout')) {
          errorMessage = 'The service took too long to respond. Retrying...';
          shouldRetry = true;
          retryDelay = 3000;
        } else if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Authentication error. Please refresh the page.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Solo mostrar error en el chat si no es un error de sobrecarga
      // (la notificación toast ya maneja la comunicación al usuario)
      if (!isOverloadError) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: { 
            error: errorMessage, 
            messageId: userMessage.id 
          } 
        });
      }
      
      // Implementar reintento automático para errores temporales
      if (shouldRetry) {
        // Para errores de sobrecarga, no mostrar mensaje adicional en el chat
        if (!isOverloadError) {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: { 
              error: `Reintentando en ${retryDelay / 1000} segundos...`, 
              messageId: userMessage.id 
            } 
          });
        }
        
        setTimeout(() => {
          console.log('Retrying message sending automatically...');
          // Limpiar error antes del reintento
          dispatch({ type: 'CLEAR_ERROR' });
          sendMessage(messageText);
        }, retryDelay);
      }
    } finally {
      // Resetear estado de herramientas
      setIsUsingUrlContext(false);
    }
  }, [state.messages, state.status, state.conversationId]);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'RESET_CONVERSATION' });
  }, []);

  const retryLastMessage = useCallback(() => {
    if (lastUserMessageRef.current) {
      sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const pauseStream = useCallback(() => {
    if (streamingServiceRef.current) {
      streamingServiceRef.current.cancelAllStreams();
      dispatch({ type: 'FINISH_STREAM' });
      console.log('Stream paused by user');
    }
  }, []);

  // Convert internal state to external format
  const messages: Message[] = state.messages.map((msg: ChatMessage) => ({
    id: msg.id,
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
    timestamp: new Date(msg.timestamp),
    isStreaming: msg.isStreaming,
    error: msg.error
  }));

  return {
    messages,
    isLoading: state.status === 'waiting_for_response',
    isStreaming: state.status === 'streaming',
    error: state.error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    isUsingUrlContext,
    pauseStream
  };
}

export default useChatStreaming;