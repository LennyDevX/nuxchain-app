/**
 * useAdminAuth hook - Separated for Fast Refresh compatibility
 */

import { useContext } from 'react';
import { AdminAuthContext } from '../../context/AdminAuthContext.types';

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
