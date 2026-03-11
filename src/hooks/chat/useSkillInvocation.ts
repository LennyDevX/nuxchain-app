import { useState, useCallback } from 'react';
import type { SkillId } from '../../constants/subscription';

export interface SkillInvocationState {
  isLoading: boolean;
  result: unknown | null;
  error: string | null;
  activeSkillId: SkillId | null;
}

const initialState: SkillInvocationState = {
  isLoading: false,
  result: null,
  error: null,
  activeSkillId: null,
};

export function useSkillInvocation(walletAddress?: string) {
  const [state, setState] = useState<SkillInvocationState>(initialState);

  const invokeSkill = useCallback(
    async (skillId: SkillId, params: Record<string, unknown>): Promise<unknown> => {
      setState({ isLoading: true, result: null, error: null, activeSkillId: skillId });

      try {
        const res = await fetch(`/api/skills/${skillId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(walletAddress ? { 'x-wallet-address': walletAddress } : {}),
          },
          body: JSON.stringify(params),
        });

        if (!res.ok) {
          if (res.status === 402) {
            throw new Error('Upgrade required — this skill is not included in your current plan.');
          }
          if (res.status === 429) {
            throw new Error('Rate limit reached. Please wait a moment before trying again.');
          }
          if (res.status === 403) {
            throw new Error('Access denied. Please connect your wallet and ensure your subscription is active.');
          }
          let message = `Skill request failed (${res.status})`;
          try {
            const body = await res.json();
            if (body?.error) message = body.error;
          } catch { /* ignore */ }
          throw new Error(message);
        }

        const data = await res.json();
        const result = data?.result ?? data;
        setState({ isLoading: false, result, error: null, activeSkillId: skillId });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setState({ isLoading: false, result: null, error: message, activeSkillId: skillId });
        throw err;
      }
    },
    [walletAddress]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { invokeSkill, state, reset };
}
