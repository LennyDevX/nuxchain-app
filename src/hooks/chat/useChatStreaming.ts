import { useCallback, useRef, useEffect, useReducer, useState } from 'react';
import { useAccount } from 'wagmi';
import { StreamingService } from '../../components/chat/core/streamingService';
import { chatReducer, initialChatState } from '../../components/chat/core/chatReducer';
import { showApiOverloadToast } from '../../components/ui/ApiOverloadNotificationUtils';
import { conversationManager } from '../../components/chat/core/conversationManager';

// Define API endpoints directly since the import is not available
const API_ENDPOINTS = {
  gemini: {
    stream: '/api/chat/stream',
    streamWithTools: '/api/chat/stream-with-tools'
  }
} as const;

// Function to detect URLs in text - FIXED
const detectUrls = (text: string): string[] => {
  // FIXED: Character class doesn't need escaped +
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
  const urls = text.match(urlRegex) || [];
  
  // Solo log en desarrollo y si hay URLs
  if (import.meta.env.DEV && urls.length > 0) {
    console.log('🔍 [FRONTEND] URLs detected:', urls);
  }
  
  return urls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
};

// 🔗 Function to detect blockchain queries
interface BlockchainDetection {
  isBlockchain: boolean;
  action: string | null;
  requiresWallet?: boolean; // Flag to indicate if query needs connected wallet
}

const detectBlockchainQuery = (text: string, hasConnectedWallet = false): BlockchainDetection => {
  const lowerText = text.toLowerCase();
  
  // Detectar precio POL/MATIC
  if ((lowerText.includes('pol') || lowerText.includes('matic') || lowerText.includes('polygon')) &&
      (lowerText.includes('precio') || lowerText.includes('price') || lowerText.includes('cotiza') || 
       lowerText.includes('vale') || lowerText.includes('cuesta') || lowerText.includes('actual') ||
       lowerText.includes('cuánto') || lowerText.includes('cuanto'))) {
    return { isBlockchain: true, action: 'Fetching POL price...' };
  }
  
  // Detectar staking info general (APY, pool stats)
  if (lowerText.includes('staking') || lowerText.includes('stake') || lowerText.includes('stakear') ||
      lowerText.includes('apr') || lowerText.includes('apy')) {
    // Si menciona "mi" o "my", es query de posición personal
    const isPersonalQuery = /\b(mi|mis|my|tengo|cuánto|cuanto)\b/.test(lowerText);
    if (isPersonalQuery && hasConnectedWallet) {
      return { isBlockchain: true, action: 'Checking your staking position...', requiresWallet: true };
    }
    return { isBlockchain: true, action: 'Querying staking data...' };
  }
  
  // Detectar NFT
  if ((lowerText.includes('nft') || lowerText.includes('marketplace')) &&
      (lowerText.includes('lista') || lowerText.includes('venta') || lowerText.includes('disponible') ||
       lowerText.includes('listing') || lowerText.includes('available') || lowerText.includes('comprar'))) {
    return { isBlockchain: true, action: 'Searching NFT listings...' };
  }
  
  // 🆕 MEJORADO: Detectar wallet/balance - ahora soporta frases naturales
  // Detecta: "mi balance", "my wallet", "cuántos POL tengo", "revisa mi saldo", etc.
  const hasWalletKeywords = lowerText.includes('wallet') || lowerText.includes('balance') || 
                            lowerText.includes('saldo') || lowerText.includes('cartera');
  const hasExplicitAddress = lowerText.includes('0x');
  const hasPersonalIndicator = /\b(mi|mis|my|tengo|revisa|check|cuánto|cuanto|what.*my|cuál.*mi)\b/.test(lowerText);
  const askingAboutPOL = (lowerText.includes('pol') || lowerText.includes('matic')) && 
                         /\b(tengo|have|cuántos?|how many|cuál|what)\b/.test(lowerText);
  
  // Caso 1: Tiene dirección 0x explícita
  if (hasWalletKeywords && hasExplicitAddress) {
    return { isBlockchain: true, action: 'Checking wallet balance...' };
  }
  
  // Caso 2: Pregunta personal con wallet conectada
  if ((hasWalletKeywords || askingAboutPOL) && hasPersonalIndicator) {
    if (hasConnectedWallet) {
      return { isBlockchain: true, action: 'Checking your connected wallet...', requiresWallet: true };
    }
    // Sin wallet conectada, aún detectamos pero el backend manejará el caso
    return { isBlockchain: true, action: 'Wallet query detected (connect wallet for data)', requiresWallet: true };
  }
  
  // Detectar rewards
  if ((lowerText.includes('reward') || lowerText.includes('recompensa') || lowerText.includes('ganancia')) &&
      (lowerText.includes('staking') || lowerText.includes('pol'))) {
    return { isBlockchain: true, action: 'Calculating rewards...' };
  }
  
  return { isBlockchain: false, action: null };
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
  loadHistory?: (conversationId: string) => boolean;
  retryLastMessage: () => void;
  isUsingUrlContext: boolean;
  blockchainAction: string | null;
  isSearchingKB: boolean;
  pauseStream: () => void;
  currentConversationId?: string | null;
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
  walletAddress?: string;
}

export function useChatStreaming(): UseChatStreamingReturn {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const streamingServiceRef = useRef<StreamingService | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const [isUsingUrlContext, setIsUsingUrlContext] = useState(false);
  const [blockchainAction, setBlockchainAction] = useState<string | null>(null);
  const [isSearchingKB, setIsSearchingKB] = useState(false);
  
  // Get connected wallet address
  const { address: connectedWallet } = useAccount();

  // Initialize streaming service
  useEffect(() => {
    streamingServiceRef.current = new StreamingService();

    return () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.destroy();
      }
    };
  }, []);

  // Save conversation automatically when messages change
  useEffect(() => {
    if (state.messages.length > 0 && state.conversationId) {
      // Only save if we are not currently streaming (to avoid saving incomplete responses repeatedly) 
      // or if it's the user's first message
      if (state.status !== 'streaming' || state.messages.length === 1) {
        conversationManager.saveConversation(state.messages, state.conversationId);
      }
    }
  }, [state.messages, state.status, state.conversationId]);

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
    
    // \ud83d\udd17 Detectar URLs en el mensaje
    const detectedUrls = detectUrls(messageText);
    const hasUrls = detectedUrls.length > 0;
    
    // 🔗 Detectar si es una query blockchain para mostrar feedback
    // Pasamos flag de wallet conectada para detectar queries personales como "mi balance"
    const hasConnectedWallet = Boolean(connectedWallet);
    const blockchainDetection = detectBlockchainQuery(messageText, hasConnectedWallet);
    
    if (hasUrls) {
      // Si hay URLs, mostrar indicador de URL context
      setIsUsingUrlContext(true);
      setBlockchainAction(null);
      setIsSearchingKB(false);
      if (import.meta.env.DEV) {
        console.log('🔗 [FRONTEND] URLs detected:', detectedUrls.length);
      }
    } else if (blockchainDetection.isBlockchain) {
      setBlockchainAction(blockchainDetection.action);
      setIsSearchingKB(false);
      setIsUsingUrlContext(false);
      if (import.meta.env.DEV) {
        console.log('🔗 [FRONTEND] Blockchain query detected:', blockchainDetection.action);
      }
    } else {
      // 📚 For non-blockchain queries, show KB search indicator
      setIsSearchingKB(true);
      setBlockchainAction(null);
      setIsUsingUrlContext(false);
      if (import.meta.env.DEV) {
        console.log('📚 [FRONTEND] Searching knowledge base...');
      }
    }

    try {
      // Prepare conversation history for Gemini API
      // FIXED: Filter out messages with null/empty text to avoid Gemini API error
      // "required oneof field 'data' must have one initialized field"
      const conversationHistory = state.messages
        .filter((msg: ChatMessage) => msg.text && msg.text.trim() !== '')
        .map((msg: ChatMessage) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      // Add current message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: messageText }]
      });

      // Use main stream endpoint (URLs already detected above)
      const endpoint = API_ENDPOINTS.gemini.stream;
      
      // Get selected model from localStorage (if user has Pro/Premium subscription)
      const selectedModel = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedGeminiModel') || 'gemini-3.1-flash-lite-preview'
        : 'gemini-3.1-flash-lite-preview';
      
      //Tipo específico en lugar de any
      const requestBody: RequestBody = {
        messages: conversationHistory,
        model: selectedModel,
        temperature: 0.3,
        maxTokens: 1024,
        stream: true
      };
      
      // Include connected wallet address for blockchain queries
      if (connectedWallet) {
        requestBody.walletAddress = connectedWallet;
      }
      
      // Log request details in development (URL context already set above)
      if (import.meta.env.DEV && hasUrls) {
        console.log('🔗 [FRONTEND] Sending message with URLs:', {
          endpoint,
          urlCount: detectedUrls.length,
          urls: detectedUrls
        });
      }
      
      // Make streaming request to backend
      // ✅ No API Key header needed - backend handles Gemini authentication internally
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
            // Reset all feedback indicators
            setBlockchainAction(null);
            setIsUsingUrlContext(false);
            setIsSearchingKB(false);
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
  }, [state.messages, state.status, state.conversationId, connectedWallet]);

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

  const loadHistory = useCallback((historyId: string) => {
    const conversations = conversationManager.loadConversationsFromStorage();
    const found = conversations.find(c => c.id === historyId);
    if (found) {
      const convertedMessages: ChatMessage[] = found.messages.map((m: any) => ({
        id: m.id,
        text: m.text || m.content,
        sender: m.sender || m.role,
        timestamp: typeof m.timestamp === 'string' ? m.timestamp : (m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date(m.timestamp).toISOString()),
        conversationId: found.id
      }));
      dispatch({ 
        type: 'LOAD_CONVERSATION', 
        payload: { 
          messages: convertedMessages, 
          conversationId: found.id 
        } 
      });
      return true;
    }
    return false;
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
    loadHistory,
    retryLastMessage,
    isUsingUrlContext,
    blockchainAction,
    isSearchingKB,
    pauseStream,
    currentConversationId: state.conversationId
  };
}

export default useChatStreaming;