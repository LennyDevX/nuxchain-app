import { debounce } from '../../../utils/performance/debounce';
import type { ChatMessage } from './chatReducer';

const STORAGE_KEY = 'nuvos_chat_conversations';
const MAX_STORED_CONVERSATIONS = 10;

export interface StoredConversation {
  id: string;
  timestamp: number;
  messages: ChatMessage[];
  preview: string;
  title: string;
}

export interface ConversationStats {
  total: number;
  totalMessages: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
}

interface MinimalConversationData {
  id: number;
  timestamp: number;
  messageCount: number;
  preview: string;
}

export class ConversationManager {
  private debouncedSaveConversation: (messages: ChatMessage[], conversationId: string) => void;

  constructor() {
    this.debouncedSaveConversation = debounce(this._saveConversation.bind(this), 2000);
  }

  private _saveConversation(messages: ChatMessage[], conversationId: string): void {
    if (messages.length === 0) return;

    const saveOperation = (): void => {
      try {
        let stored = this.loadConversationsFromStorage();
        const existingIndex = stored.findIndex(c => c.id === conversationId);

        if (existingIndex !== -1) {
          // Update existing conversation
          stored[existingIndex].messages = messages.slice();
          stored[existingIndex].timestamp = Date.now();
          stored[existingIndex].preview = messages[0]?.text?.substring(0, 100) || 'Updated conversation';
        } else {
          // Add new conversation
          const newConversation: StoredConversation = {
            id: conversationId || crypto.randomUUID(),
            timestamp: Date.now(),
            messages: messages.slice(),
            preview: messages[0]?.text?.substring(0, 100) || 'New conversation',
            title: messages[0]?.text?.substring(0, 50) || 'New Chat'
          };

          stored = [newConversation, ...stored];
        }

        const updated = stored.slice(0, MAX_STORED_CONVERSATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save conversation:', error);
        this._saveFallback(messages);
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(saveOperation, { timeout: 2000 });
    } else {
      setTimeout(saveOperation, 100);
    }
  }

  // Expose a public method to save conversation using the debounced function
  public saveConversation(messages: ChatMessage[], conversationId: string): void {
    this.debouncedSaveConversation(messages, conversationId);
  }

  updateConversationTitle(conversationId: string, newTitle: string): boolean {
    try {
      const stored = this.loadConversationsFromStorage();
      const existingIndex = stored.findIndex(c => c.id === conversationId);

      if (existingIndex !== -1) {
        stored[existingIndex].title = newTitle;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      return false;
    }
  }

  private _saveFallback(messages: ChatMessage[]): void {
    try {
      const minimalData: MinimalConversationData = {
        id: Date.now(),
        timestamp: Date.now(),
        messageCount: messages.length,
        preview: messages[0]?.text?.substring(0, 50) || 'Conversation'
      };
      localStorage.setItem(`${STORAGE_KEY}_minimal`, JSON.stringify(minimalData));
    } catch (fallbackError) {
      console.error('Critical storage error:', fallbackError);
    }
  }

  loadLastConversation(): StoredConversation | null {
    const conversations = this.loadConversationsFromStorage();
    return conversations[0] || null;
  }

  loadConversationsFromStorage(): StoredConversation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load conversations:', error);
      return [];
    }
  }

  deleteConversation(conversationId: string): boolean {
    try {
      const stored = this.loadConversationsFromStorage();
      const filtered = stored.filter(conv => conv.id !== conversationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  }

  clearAllConversations(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_minimal`);
      return true;
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      return false;
    }
  }

  getConversationStats(): ConversationStats {
    const conversations = this.loadConversationsFromStorage();
    return {
      total: conversations.length,
      totalMessages: conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0),
      oldestTimestamp: conversations.length > 0 ? Math.min(...conversations.map(c => c.timestamp)) : null,
      newestTimestamp: conversations.length > 0 ? Math.max(...conversations.map(c => c.timestamp)) : null
    };
  }
}

// Singleton instance
export const conversationManager = new ConversationManager();
