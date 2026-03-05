import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/config';
import type { StoredConversation } from '../../components/chat/core/conversationManager';
import type { ChatMessage } from '../../components/chat/core/chatReducer';

const MAX_CONVERSATIONS = 10;

/**
 * Persists and retrieves chat conversation history in Firestore.
 * Documents are stored under: users/{walletAddress}/conversations/{conversationId}
 *
 * Falls back to localStorage if no wallet is connected.
 */
export function useFirebaseConversations(walletAddress?: string) {
  const [history, setHistory] = useState<StoredConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load history (Firestore when wallet connected, else localStorage) ──
  const loadHistory = useCallback(async () => {
    if (!walletAddress) {
      // Fallback: localStorage
      try {
        const stored = localStorage.getItem('nuxbee_chat_conversations');
        setHistory(stored ? JSON.parse(stored) : []);
      } catch {
        setHistory([]);
      }
      return;
    }

    setIsLoadingHistory(true);
    try {
      const ref = collection(db, 'users', walletAddress, 'conversations');
      const q = query(ref, orderBy('timestamp', 'desc'), limit(MAX_CONVERSATIONS));
      const snap = await getDocs(q);
      const convs: StoredConversation[] = snap.docs.map(d => d.data() as StoredConversation);
      setHistory(convs);
    } catch (err) {
      console.warn('[useFirebaseConversations] Load failed, falling back to localStorage', err);
      try {
        const stored = localStorage.getItem('nuxbee_chat_conversations');
        setHistory(stored ? JSON.parse(stored) : []);
      } catch {
        setHistory([]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [walletAddress]);

  // Load on wallet change
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Debounced save ──
  const saveConversation = useCallback((messages: ChatMessage[], conversationId: string) => {
    if (messages.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const conv: StoredConversation = {
        id: conversationId,
        timestamp: Date.now(),
        messages: messages.slice(),
        preview: messages[0]?.text?.substring(0, 100) || 'Conversation',
        title: messages[0]?.text?.substring(0, 50) || 'New Chat',
      };

      // Always write to localStorage as backup
      try {
        const stored = localStorage.getItem('nuxbee_chat_conversations');
        let all: StoredConversation[] = stored ? JSON.parse(stored) : [];
        const idx = all.findIndex(c => c.id === conversationId);
        if (idx !== -1) all[idx] = conv;
        else all = [conv, ...all];
        localStorage.setItem('nuxbee_chat_conversations', JSON.stringify(all.slice(0, MAX_CONVERSATIONS)));
      } catch { /* ignore */ }

      // If wallet connected, also write to Firestore
      if (walletAddress) {
        try {
          const ref = doc(db, 'users', walletAddress, 'conversations', conversationId);
          await setDoc(ref, conv, { merge: true });
        } catch (err) {
          console.warn('[useFirebaseConversations] Firestore save failed', err);
        }
      }

      // Refresh local history state
      setHistory(prev => {
        const idx = prev.findIndex(c => c.id === conversationId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = conv;
          return updated;
        }
        return [conv, ...prev].slice(0, MAX_CONVERSATIONS);
      });
    }, 2000);
  }, [walletAddress]);

  // ── Delete ──
  const deleteConversation = useCallback(async (conversationId: string) => {
    setHistory(prev => prev.filter(c => c.id !== conversationId));

    try {
      const stored = localStorage.getItem('nuxbee_chat_conversations');
      const all: StoredConversation[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('nuxbee_chat_conversations', JSON.stringify(all.filter(c => c.id !== conversationId)));
    } catch { /* ignore */ }

    if (walletAddress) {
      try {
        await deleteDoc(doc(db, 'users', walletAddress, 'conversations', conversationId));
      } catch (err) {
        console.warn('[useFirebaseConversations] Firestore delete failed', err);
      }
    }
  }, [walletAddress]);

  return { history, isLoadingHistory, saveConversation, deleteConversation, refreshHistory: loadHistory };
}
