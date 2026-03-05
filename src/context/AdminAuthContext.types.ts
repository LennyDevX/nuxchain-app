/**
 * Admin Auth Context Types - Separated for Fast Refresh compatibility
 */

import { createContext } from 'react';

export interface AdminAuthContextType {
  isAuthenticated: boolean;
  isOwner: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);
