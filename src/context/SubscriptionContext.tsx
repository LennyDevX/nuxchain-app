/**
 * SubscriptionContext
 * Global state for NuxBee AI subscription tier, active skills, and daily usage.
 *
 * - Fetches from /api/subscriptions/status when a Solana wallet connects
 * - Exposes: tier, isActive, expiryDate, activeSkills, daysRemaining, isExpiringSoon
 * - Also provides: dailyUsed, dailyLimit (for free tier progress bar)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SkillId, SubscriptionTier } from '../constants/subscription';
import { FREE_DAILY_LIMIT } from '../constants/subscription';

// ── Types ────────────────────────────────────────────────────────────────────
export interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expiryDate: string | null;
  activeSkills: SkillId[];
  addOns: SkillId[];
  daysRemaining: number;
  isExpiringSoon: boolean; // < 3 days
  dailyLimit: number;      // -1 = unlimited
  dailyUsed: number;
  trackUsage: () => void;
  loading: boolean;
  error: string | null;
  /** Whether wallet has Pro or Premium */
  isPaid: boolean;
  /** Refresh subscription data from API */
  refresh: () => Promise<void>;
}

const defaultState: SubscriptionState = {
  tier: 'free',
  isActive: false,
  expiryDate: null,
  activeSkills: [],
  addOns: [],
  daysRemaining: 0,
  isExpiringSoon: false,
  dailyLimit: FREE_DAILY_LIMIT,
  dailyUsed: 0,
  trackUsage: () => {},
  loading: false,
  error: null,
  isPaid: false,
  refresh: async () => {},
};

// ── Context ──────────────────────────────────────────────────────────────────
const SubscriptionContext = createContext<SubscriptionState>(defaultState);

export function useSubscription(): SubscriptionState {
  return useContext(SubscriptionContext);
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [state, setState] = useState<Omit<SubscriptionState, 'refresh'>>(
    () => ({ ...defaultState, loading: false })
  );
  const lastWallet = useRef<string | null>(null);

  const fetchStatus = useCallback(async (wallet: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(
        `/api/subscriptions/status?wallet=${encodeURIComponent(wallet)}`
      );
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // API unavailable or wallet not authorized — silently use free tier
          setState(prev => ({ ...prev, loading: false, error: null }));
          return;
        }
        throw new Error(`Status ${res.status}`);
      }
      const data = await res.json();
      setState({
        tier: data.tier,
        isActive: data.isActive,
        expiryDate: data.expiryDate,
        activeSkills: data.activeSkills || [],
        addOns: data.addOns || [],
        daysRemaining: data.daysRemaining || 0,
        isExpiringSoon: data.isExpiringSoon || false,
        dailyLimit: data.dailyLimit ?? FREE_DAILY_LIMIT,
        loading: false,
        error: null,
        isPaid: data.tier !== 'free' && data.isActive,
      });
    } catch (err) {
      // Only log as warning — subscription errors are non-critical
      console.warn('[SubscriptionContext] fetch error:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load subscription status',
      }));
    }
  }, []);

  // Refresh when wallet connects or changes
  useEffect(() => {
    const wallet = publicKey?.toBase58() || null;
    if (!connected || !wallet) {
      lastWallet.current = null;
      setState({ ...defaultState, loading: false });
      return;
    }
    if (wallet === lastWallet.current) return;
    lastWallet.current = wallet;
    fetchStatus(wallet);
  }, [connected, publicKey, fetchStatus]);

  // Expiry warning effect
  useEffect(() => {
    if (state.isExpiringSoon && state.isActive) {
      console.warn(
        `[NuxBee AI] Subscription expiring in ${state.daysRemaining} day(s).`
      );
    }
  }, [state.isExpiringSoon, state.isActive, state.daysRemaining]);

  const refresh = useCallback(async () => {
    const wallet = publicKey?.toBase58();
    if (wallet) await fetchStatus(wallet);
  }, [publicKey, fetchStatus]);

  const [dailyUsed, setDailyUsed] = useState(() => {
    try {
      const key = `nuxbee_daily_${new Date().toISOString().slice(0, 10)}`;
      return parseInt(localStorage.getItem(key) || '0', 10);
    } catch { return 0; }
  });

  const trackUsage = useCallback(() => {
    const key = `nuxbee_daily_${new Date().toISOString().slice(0, 10)}`;
    // Read current count (safe)
    let current = 0;
    try { current = parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch { /* ignore */ }
    const next = current + 1;
    // Update UI immediately — must happen before localStorage to not be blocked by storage errors
    setDailyUsed(next);
    // Persist to localStorage (best-effort)
    try { localStorage.setItem(key, String(next)); } catch { /* non-critical */ }
    // Refresh subscription state from server (non-blocking)
    refresh().catch(() => { /* silent */ });
  }, [refresh]);

  return (
    <SubscriptionContext.Provider value={{ ...state, refresh, dailyUsed, trackUsage }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
