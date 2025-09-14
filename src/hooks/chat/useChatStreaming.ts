import { useCallback, useRef, useEffect, useReducer, useState } from 'react';
import { StreamingService } from '../../components/chat/core/streamingService';
import { chatReducer, initialChatState } from '../../components/chat/core/chatReducer';
import { API_ENDPOINTS } from '../../config/api';

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
        temperature: 0.7,
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar el mensaje';
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          error: errorMessage, 
          messageId: userMessage.id 
        } 
      });
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