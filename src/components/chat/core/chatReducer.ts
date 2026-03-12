export interface SkillResult {
  skillId: string;
  status: 'loading' | 'success' | 'error';
  data?: unknown;
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  conversationId?: string;
  isStreaming?: boolean;
  error?: string;
  skillResult?: SkillResult;
  attachments?: Array<{ id: string; url: string; name: string; size: number; type: string; uploadedAt: string; metadata?: { width?: number; height?: number } }>;
}

export interface UrlProcessing {
  urls: string[];
  status: 'idle' | 'processing' | 'completed' | 'failed';
  content: string[];
  error: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  status: 'idle' | 'loading_history' | 'waiting_for_response' | 'streaming' | 'error';
  error: string | null;
  conversationId: string | null;
  isOnline: boolean;
  urlProcessing: UrlProcessing;
}

export type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: ChatMessage }
  | { type: 'START_STREAMING' }
  | { type: 'UPDATE_STREAM'; payload: string }
  | { type: 'FINISH_STREAM' }
  | { type: 'SET_ERROR'; payload: { error: string; messageId: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_CONVERSATION' }
  | { type: 'REMOVE_LAST_MESSAGE' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'START_URL_PROCESSING'; payload: string[] }
  | { type: 'URL_PROCESSING_COMPLETE'; payload: string[] }
  | { type: 'URL_PROCESSING_ERROR'; payload: string }
  | { type: 'RESET_URL_PROCESSING' }
  | { type: 'LOAD_CONVERSATION'; payload: { messages: ChatMessage[]; conversationId: string } }
  | { type: 'ADD_SKILL_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_SKILL_MESSAGE'; payload: { id: string; skillResult: SkillResult } };

export const initialChatState: ChatState = {
  messages: [],
  status: 'idle',
  error: null,
  conversationId: null,
  isOnline: navigator.onLine,
  urlProcessing: {
    urls: [],
    status: 'idle',
    content: [],
    error: null
  }
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        conversationId: action.payload.conversationId ?? null,
        status: 'waiting_for_response',
        error: null
      };

    case 'START_STREAMING':
      return {
        ...state,
        status: 'streaming',
        messages: [
          ...state.messages,
          {
            id: `assistant_${Date.now()}`,
            text: '',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            conversationId: state.conversationId || undefined,
            isStreaming: true
          }
        ]
      };

    case 'UPDATE_STREAM':
      return {
        ...state,
        messages: state.messages.map((msg, idx) =>
          idx === state.messages.length - 1
            ? { ...msg, text: action.payload, isStreaming: true }
            : msg
        )
      };

    case 'FINISH_STREAM':
      return {
        ...state,
        status: 'idle',
        messages: state.messages.map((msg, idx) =>
          idx === state.messages.length - 1
            ? { ...msg, isStreaming: false }
            : msg
        )
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.error,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? { ...msg, error: action.payload.error, isStreaming: false }
            : msg
        )
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        status: 'idle'
      };

    case 'RESET_CONVERSATION':
      return {
        ...initialChatState,
        isOnline: state.isOnline
      };

    case 'LOAD_CONVERSATION':
      return {
        ...state,
        messages: action.payload.messages,
        conversationId: action.payload.conversationId,
        status: 'idle',
        error: null
      };

    case 'REMOVE_LAST_MESSAGE':
      return {
        ...state,
        messages: state.messages.slice(0, -1),
        status: 'idle'
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload
      };

    case 'START_URL_PROCESSING':
      return {
        ...state,
        urlProcessing: {
          urls: action.payload,
          status: 'processing',
          content: [],
          error: null
        }
      };

    case 'URL_PROCESSING_COMPLETE':
      return {
        ...state,
        urlProcessing: {
          ...state.urlProcessing,
          status: 'completed',
          content: action.payload
        }
      };

    case 'URL_PROCESSING_ERROR':
      return {
        ...state,
        urlProcessing: {
          ...state.urlProcessing,
          status: 'failed',
          error: action.payload
        }
      };

    case 'RESET_URL_PROCESSING':
      return {
        ...state,
        urlProcessing: {
          urls: [],
          status: 'idle',
          content: [],
          error: null
        }
      };

    case 'ADD_SKILL_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'UPDATE_SKILL_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, skillResult: action.payload.skillResult }
            : msg
        ),
      };

    default:
      return state;
  }
}
