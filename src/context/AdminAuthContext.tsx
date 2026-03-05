/**
 * AdminAuthContext - Secure authentication for admin panel
 * 
 * SECURITY IMPLEMENTATION:
 * - Uses wallet signature verification (not storing private keys)
 * - Session expires after 1 hour
 * - Owner wallet loaded from VITE_DEPLOYER_ADDRESS (env variable)
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { verifyMessage } from 'viem';
import { AdminAuthContext } from './AdminAuthContext.types';

// Owner wallet address (read from .env — never hardcode)
// VITE_ADMIN_WALLET takes priority; fallback to VITE_DEPLOYER_ADDRESS
const ADMIN_OWNER_ADDRESS = (import.meta.env.VITE_ADMIN_WALLET ?? import.meta.env.VITE_DEPLOYER_ADDRESS ?? '') as `0x${string}`;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;
// Obfuscated session key — do not use obvious names like "admin_session"
const SESSION_KEY = 'x_token_data';

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if connected wallet is the owner
  const isOwner = isConnected && address?.toLowerCase() === ADMIN_OWNER_ADDRESS.toLowerCase();

  // Load session from localStorage
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) {
      try {
        const { address: savedAddress, timestamp } = JSON.parse(session);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        // Check if session is valid (not expired and matches current wallet)
        if (
          savedAddress.toLowerCase() === ADMIN_OWNER_ADDRESS.toLowerCase() &&
          now - timestamp < oneHour &&
          address?.toLowerCase() === savedAddress.toLowerCase()
        ) {
          setIsAuthenticated(true);
        } else {
          // Session expired or invalid
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error loading admin session:', err);
        localStorage.removeItem('admin_session');
      }
    }
  }, [address]);

  // Auto logout when wallet disconnects or changes
  useEffect(() => {
    if (!isConnected || !isOwner) {
      setIsAuthenticated(false);
      localStorage.removeItem(SESSION_KEY);
    }
  }, [isConnected, isOwner]);

  const login = async (password: string) => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isOwner) {
      setError('Access denied: Only owner wallet can access admin panel');
      return;
    }

    // Validate access password before requesting wallet signature
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      setError('Invalid access password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create a unique message to sign
      const timestamp = Date.now();
      const message = `Nuxchain Admin Authentication
      
Wallet: ${address}
Timestamp: ${timestamp}
Action: Login to Admin Panel

This signature proves you own this wallet without exposing your private key.`;

      // Request signature from user
      const signature = await signMessageAsync({ message });

      // Verify signature by checking if the signature is valid for the connected address
      const isValid = await verifyMessage({
        address: address!,
        message,
        signature,
      });

      if (isValid && address?.toLowerCase() === ADMIN_OWNER_ADDRESS.toLowerCase()) {
        // Save session
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          address: address,
          timestamp: timestamp,
          signature: signature.slice(0, 20) + '...', // Store partial signature for reference
        }));

        setIsAuthenticated(true);
        setError(null);
      } else {
        setError('Signature verification failed');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('Signature request rejected');
        } else {
          setError(err.message);
        }
      } else {
        setError('Authentication failed');
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isOwner,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
