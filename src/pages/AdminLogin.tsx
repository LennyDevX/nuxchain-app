/**
 * AdminLogin - Secure login page for admin panel
 * Uses wallet signature verification for authentication
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { motion } from 'framer-motion';
import GlobalBackground from '../ui/gradientBackground';
import { useAdminAuth } from '../hooks/admin/useAdminAuth';

const OWNER = (import.meta.env.VITE_DEPLOYER_ADDRESS ?? '') as string;
const maskedOwner = OWNER ? `${OWNER.slice(0, 4)}...${OWNER.slice(-4)}` : '—';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { isAuthenticated, isOwner, login, isLoading, error } = useAdminAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    await login();
  };

  const handleWalletConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <GlobalBackground>
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-400">Secure authentication required</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Status Messages */}
          {!isConnected && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-400 font-medium">Connect Wallet First</p>
                  <p className="text-xs text-gray-400 mt-1">Please connect your owner wallet to proceed</p>
                </div>
              </div>
            </div>
          )}

          {isConnected && !isOwner && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm text-red-400 font-medium">Access Denied</p>
                  <p className="text-xs text-gray-400 mt-1">Connected wallet is not the owner</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Connected: {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isConnected && isOwner && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-green-400 font-medium">Owner Wallet Connected</p>
                  <p className="text-xs text-gray-400 mt-1">Click below to authenticate</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Connect Wallet Buttons */}
          {!isConnected && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">Connect with your owner wallet:</p>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleWalletConnect(connector.id)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Connect with {connector.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Sign Message Button */}
          {isConnected && isOwner && (
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Waiting for signature...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Sign Message to Authenticate</span>
                </>
              )}
            </button>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="space-y-2 text-xs text-gray-400">
              <p className="flex items-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Your private key never leaves your wallet</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Authentication via cryptographic signature</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-green-400">✓</span>
                <span>Session expires after 1 hour for security</span>
              </p>
            </div>
          </div>

          {/* Owner Info - censored for security */}
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Owner Wallet:</p>
            <p className="text-xs text-gray-400 font-mono">{maskedOwner}</p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          className="mt-6 w-full text-center text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
    </div>
    </GlobalBackground>
  );
}
