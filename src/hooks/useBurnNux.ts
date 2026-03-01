/**
 * useBurnNux — Hook to burn NUX SPL tokens on Solana mainnet
 * Mint: Cmpy3SvMJRKSXcfaDsLWC4gidhTQNwxeHXBmAgM5Ydja
 */
import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createBurnInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

export const NUX_MINT = new PublicKey('Cmpy3SvMJRKSXcfaDsLWC4gidhTQNwxeHXBmAgM5Ydja');
export const NUX_DECIMALS = 6;
export const NUX_TOTAL_SUPPLY = 100_000_000;

export type BurnStatus = 'idle' | 'confirming' | 'sending' | 'success' | 'error';

interface BurnResult {
  signature: string;
  amount: number;
}

export function useBurnNux() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [status, setStatus] = useState<BurnStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<BurnResult | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [currentSupply, setCurrentSupply] = useState<number | null>(null);

  // Fetch user's NUX token balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey) { setTokenBalance(null); return; }
    try {
      const ata = await getAssociatedTokenAddress(NUX_MINT, publicKey);
      const info = await connection.getTokenAccountBalance(ata);
      setTokenBalance(Number(info.value.uiAmount ?? 0));
    } catch {
      setTokenBalance(0);
    }
  }, [publicKey, connection]);

  // Fetch current circulating supply
  const fetchSupply = useCallback(async () => {
    try {
      const supply = await connection.getTokenSupply(NUX_MINT);
      setCurrentSupply(Number(supply.value.uiAmount ?? NUX_TOTAL_SUPPLY));
    } catch {
      setCurrentSupply(NUX_TOTAL_SUPPLY);
    }
  }, [connection]);

  useEffect(() => {
    fetchBalance();
    fetchSupply();
  }, [fetchBalance, fetchSupply]);

  // Execute burn transaction
  const burnTokens = useCallback(async (amount: number): Promise<string | null> => {
    if (!publicKey || !connected) {
      setError('Wallet not connected');
      return null;
    }
    if (!amount || amount <= 0) {
      setError('Invalid amount');
      return null;
    }
    if (tokenBalance !== null && amount > tokenBalance) {
      setError('Insufficient balance');
      return null;
    }

    setStatus('confirming');
    setError(null);

    try {
      const ata = await getAssociatedTokenAddress(NUX_MINT, publicKey);
      const lamports = Math.round(amount * Math.pow(10, NUX_DECIMALS));

      const burnIx = createBurnInstruction(
        ata,
        NUX_MINT,
        publicKey,
        lamports,
        [],
        TOKEN_PROGRAM_ID
      );

      const tx = new Transaction().add(burnIx);
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      setStatus('sending');
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, 'confirmed');

      // Register burn with backend
      try {
        await fetch('/api/launchpad/burn-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: publicKey.toBase58(),
            amount,
            txSignature: sig,
          }),
        });
      } catch {
        // Non-blocking — burn happened on-chain regardless
        console.warn('[useBurnNux] Failed to record burn in backend');
      }

      setLastResult({ signature: sig, amount });
      setStatus('success');
      await fetchBalance();
      await fetchSupply();
      return sig;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg.includes('rejected') ? 'Transaction cancelled by user.' : msg);
      setStatus('error');
      return null;
    }
  }, [publicKey, connected, tokenBalance, connection, sendTransaction, fetchBalance, fetchSupply]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setLastResult(null);
  }, []);

  const burnedSupply = currentSupply !== null ? NUX_TOTAL_SUPPLY - currentSupply : 0;
  const burnedPercent = currentSupply !== null ? (burnedSupply / NUX_TOTAL_SUPPLY) * 100 : 0;

  return {
    burnTokens,
    reset,
    fetchBalance,
    status,
    error,
    lastResult,
    tokenBalance,
    currentSupply,
    burnedSupply,
    burnedPercent,
    connected,
  };
}
