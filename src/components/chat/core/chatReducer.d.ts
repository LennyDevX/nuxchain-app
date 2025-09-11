export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  conversationId?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface UrlProcessing {
  urls: string[];
  status: 'idle' | 'processing' | 'completed' | 'failed';
  content: any[];
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

export interface ChatAction {
  type: string;
  payload?: any;
}

export declare const initialChatState: ChatState;
export declare function chatReducer(state: ChatState, action: ChatAction): ChatState;