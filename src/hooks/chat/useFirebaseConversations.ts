import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../../components/firebase/config';
import type { StoredConversation } from '../../components/chat/core/conversationManager';
import type { ChatMessage } from '../../components/chat/core/chatReducer';

const MAX_CONVERSATIONS = 10;
// Legacy unscoped key to clean up on load
const LEGACY_LS_KEY = 'nuxbee_chat_conversations';

/** Returns a wallet-scoped localStorage key. */
function lsKey(wallet: string) {
  return `nuxbee_chat_${wallet.toLowerCase()}`;
}

/**
 * Persists and retrieves chat conversation history.
 * Storage: Firestore under users/{walletAddress}/conversations/{id}
 * Fallback: localStorage SCOPED to wallet address.
 *
 * SECURITY:
 * - No wallet connected → returns empty history. Never reads/writes global keys.
 * - Each wallet address has a fully isolated localStorage namespace.
 * - Firestore writes are the source of truth; localStorage is offline fallback only.
 */
export function useFirebaseConversations(walletAddress?: string) {
  const [history, setHistory] = useState<StoredConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load history ──
  const loadHistory = useCallback(async () => {
    // No wallet → clear history and stop. Never expose other users' data.
    if (!walletAddress) {
      setHistory([]);
      return;
    }

    // Purge legacy unscoped key so it can't leak to disconnected sessions
    try { localStorage.removeItem(LEGACY_LS_KEY); } catch { /* ignore */ }

    setIsLoadingHistory(true);
    try {
      const ref = collection(db, 'users', walletAddress, 'conversations');
      const q = query(ref, orderBy('timestamp', 'desc'), limit(MAX_CONVERSATIONS));
      const snap = await getDocs(q);
      const convs: StoredConversation[] = snap.docs.map(d => d.data() as StoredConversation);
      setHistory(convs);
    } catch (err) {
      console.warn('[useFirebaseConversations] Firestore load failed, falling back to scoped localStorage', err);
      try {
        const stored = localStorage.getItem(lsKey(walletAddress));
        setHistory(stored ? JSON.parse(stored) : []);
      } catch {
        setHistory([]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [walletAddress]);

  // Clear history immediately when wallet disconnects, reload when it connects
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Debounced save ──
  const saveConversation = useCallback((messages: ChatMessage[], conversationId: string) => {
    // Never persist without a wallet — prevents cross-session history leakage
    if (messages.length === 0 || !walletAddress) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const conv: StoredConversation = {
        id: conversationId,
        timestamp: Date.now(),
        messages: messages.slice(),
        preview: messages[0]?.text?.substring(0, 100) || 'Conversation',
        title: messages[0]?.text?.substring(0, 50) || 'New Chat',
      };

      // Write to wallet-scoped localStorage as offline backup
      try {
        const stored = localStorage.getItem(lsKey(walletAddress));
        let all: StoredConversation[] = stored ? JSON.parse(stored) : [];
        const idx = all.findIndex(c => c.id === conversationId);
        if (idx !== -1) all[idx] = conv;
        else all = [conv, ...all];
        localStorage.setItem(lsKey(walletAddress), JSON.stringify(all.slice(0, MAX_CONVERSATIONS)));
      } catch { /* ignore */ }

      // Write to Firestore (source of truth)
      try {
        const ref = doc(db, 'users', walletAddress, 'conversations', conversationId);
        // Strip undefined fields — Firestore rejects them
        const cleanConv = JSON.parse(JSON.stringify(conv));
        await setDoc(ref, cleanConv, { merge: true });
      } catch (err) {
        console.warn('[useFirebaseConversations] Firestore save failed', err);
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
    }, 1500);
  }, [walletAddress]);

  // ── Delete ──
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!walletAddress) return; // No wallet = no history to delete

    setHistory(prev => prev.filter(c => c.id !== conversationId));

    // Remove from wallet-scoped localStorage
    try {
      const stored = localStorage.getItem(lsKey(walletAddress));
      const all: StoredConversation[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(lsKey(walletAddress), JSON.stringify(all.filter(c => c.id !== conversationId)));
    } catch { /* ignore */ }

    // Remove from Firestore
    try {
      await deleteDoc(doc(db, 'users', walletAddress, 'conversations', conversationId));
    } catch (err) {
      console.warn('[useFirebaseConversations] Firestore delete failed', err);
    }
  }, [walletAddress]);

  return { history, isLoadingHistory, saveConversation, deleteConversation, refreshHistory: loadHistory };
}
