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

// Función para detectar URLs en el texto
const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  console.log('🔍 [FRONTEND] URLs detectadas:', urls);
  return urls;
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

      // Detectar URLs automáticamente
      const detectedUrls = detectUrls(messageText);
      const useTools = detectedUrls.length > 0;
      
      console.log('🔍 [FRONTEND] Análisis de herramientas:');
      console.log('🔍 [FRONTEND] - URLs detectadas:', detectedUrls.length);
      console.log('🔍 [FRONTEND] - Usar herramientas:', useTools);
      
      // Actualizar estado de herramientas
      setIsUsingUrlContext(detectedUrls.length > 0);
      
      // Seleccionar endpoint apropiado
      const endpoint = useTools ? API_ENDPOINTS.gemini.streamWithTools : API_ENDPOINTS.gemini.stream;
      console.log('🔍 [FRONTEND] Endpoint seleccionado:', endpoint);
      
      // Preparar el cuerpo de la solicitud
      const requestBody: any = {
        messages: conversationHistory,
        model: 'gemini-2.5-flash-lite',
        temperature: 0.8,
        maxTokens: 2048,
        stream: true
      };
      
      // Agregar configuración de herramientas si es necesario
      if (useTools) {
        const enabledTools = [];
        if (detectedUrls.length > 0) {
          enabledTools.push('urlContext');
          requestBody.urls = detectedUrls;
        }
        requestBody.options = {
          enabledTools
        };
        
        console.log('🔍 [FRONTEND] Herramientas habilitadas:', enabledTools);
        console.log('🔍 [FRONTEND] Configuración de opciones:', requestBody.options);
      }
      
      console.log('🔍 [FRONTEND] Request body completo:', JSON.stringify(requestBody, null, 2));
      
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
        let errorInfo = null;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              errorInfo = JSON.parse(errorText);
            } catch {
              // Si no es JSON, usar el texto como mensaje
              errorInfo = { message: errorText };
            }
          }
        } catch {
          // Si no se puede leer el cuerpo, usar información básica
        }
        
        // Crear error con información detallada
        const error = new Error(errorInfo?.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).isOverload = errorInfo?.isOverload || response.status === 503;
        (error as any).retryAfter = errorInfo?.retryAfter;
        
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
            // Verificar si es un error de sobrecarga
            if ((error as any).isOverload || (error as any).status === 503 || error.message.includes('sobrecargado') || error.message.includes('overloaded')) {
              const retryDelay = ((error as any).retryAfter ? (error as any).retryAfter : 5);
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
        // Detectar errores de sobrecarga de la API
        if ((error as any).isOverload || (error as any).status === 503 || error.message.includes('503') || error.message.includes('sobrecargado') || error.message.includes('overloaded')) {
          errorMessage = 'El servicio está temporalmente sobrecargado. Reintentando automáticamente...';
          shouldRetry = true;
          isOverloadError = true;
          retryDelay = ((error as any).retryAfter ? (error as any).retryAfter * 1000 : 5000); // Use server's retryAfter or default to 5 seconds
          
          // Mostrar notificación de sobrecarga
          showApiOverloadToast(Math.ceil(retryDelay / 1000));
          
        } else if (error.message.includes('408') || error.message.includes('Timeout')) {
          errorMessage = 'El servicio tardó demasiado en responder. Reintentando...';
          shouldRetry = true;
          retryDelay = 3000;
        } else if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Error de autenticación. Por favor, recarga la página.';
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
          console.log('Reintentando envío de mensaje automáticamente...');
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
    isUsingUrlContext
  };
}

export default useChatStreaming;