import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { db } from '../components/firebase/config';
import { submitAirdropRegistration, getRegisteredUsersCount, checkUserRegistration } from '../components/forms/airdrop-service';
import { analyzeWalletMetrics, type WalletMetrics } from '../components/forms/wallet-analysis-service';

import Footer from '../components/layout/footer';
import AirdropHeader from '../components/airdrop/AirdropHeader';
import AirdropForm from '../components/airdrop/AirdropForm';
import AirdropFeatures from '../components/airdrop/AirdropFeatures';
import AirdropSuccess from '../components/airdrop/AirdropSuccess';
// import WalletMetricsDisplay from '../components/airdrop/WalletMetrics'; // Integrated in form
import AirdropModals from '../components/airdrop/AirdropModals';
import RequirementsModal from '../components/airdrop/RequirementsModal';
import '../styles/nux-coin-display.css';

// Configuration constants
const MAX_USERS = 5000;
const TOKENS_PER_USER = 40000;

// Memoized fingerprint generation to avoid recreating on every render
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return Math.random().toString();
  
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('Browser Fingerprint', 2, 15);
  
  return canvas.toDataURL();
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let osName = 'Unknown';

  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.split('Firefox/')[1];
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.split('Chrome/')[1];
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.split('Version/')[1];
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = ua.split('Edge/')[1];
  }

  // Detect OS
  if (ua.indexOf('Win') > -1) osName = 'Windows';
  else if (ua.indexOf('Mac') > -1) osName = 'MacOS';
  else if (ua.indexOf('Linux') > -1) osName = 'Linux';
  else if (ua.indexOf('Android') > -1) osName = 'Android';
  else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) osName = 'iOS';

  return {
    browserName,
    browserVersion: browserVersion?.split(';')[0] || 'Unknown',
    osName,
    deviceType: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
}

function Airdrop() {
  
  // EVM wallet hooks
  const { isConnected: evmConnected } = useAccount();

  // Solana wallet hooks
  const { publicKey: solanaPublicKey, connected: solanaConnected, signMessage } = useWallet();

  // Form and UI states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet: '',
    website: '', // Honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [detectedNetwork, setDetectedNetwork] = useState<'solana' | 'evm' | null>(null);
  const [isAnalyzingWallet, setIsAnalyzingWallet] = useState(false);
  const [walletMetrics, setWalletMetrics] = useState<WalletMetrics | null>(null);

  // Security: hCaptcha + Web3 signature
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [walletSignature, setWalletSignature] = useState<string | null>(null);
  const [isSigningWallet, setIsSigningWallet] = useState(false);

  // Browser and device tracking
  const [mountTime] = useState(Date.now());
  const [deviceFingerprint] = useState(() => generateFingerprint());
  const [userAgent] = useState(navigator.userAgent);
  const [browserInfo] = useState(() => getBrowserInfo());

  // Load registered users count
  useEffect(() => {
    const loadUsersCount = async () => {
      try {
        const count = await getRegisteredUsersCount(db);
        setRegisteredUsers(count);
      } catch (error) {
        console.error('Error loading users count:', error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    loadUsersCount();
  }, []);

  // Wallet analysis effect
  useEffect(() => {
    if (solanaConnected && solanaPublicKey && formData.wallet) {
      const analyzeWallet = async () => {
        setIsAnalyzingWallet(true);
        try {
          const metrics = await analyzeWalletMetrics(formData.wallet);
          setWalletMetrics(metrics);
        } catch (error) {
          console.error('Error analyzing wallet:', error);
        } finally {
          setIsAnalyzingWallet(false);
        }
      };

      analyzeWallet();
    }
  }, [formData.wallet, solanaConnected, solanaPublicKey]);

  // Reset security state when wallet disconnects
  useEffect(() => {
    if (!solanaConnected) {
      setCaptchaToken(null);
      setWalletSignature(null);
    }
  }, [solanaConnected]);

  const handleSignWallet = useCallback(async () => {
    if (!solanaPublicKey || !signMessage) {
      setSubmitStatus({ type: 'error', message: 'Wallet does not support message signing. Please use Phantom or Solflare.' });
      return;
    }
    setIsSigningWallet(true);
    try {
      const message = `NuxChain Airdrop Registration\nWallet: ${solanaPublicKey.toBase58()}\nTimestamp: ${Date.now()}\nNonce: ${Math.random().toString(36).slice(2)}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);
      setWalletSignature(signatureBase58);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signing cancelled';
      setSubmitStatus({ type: 'error', message: `Wallet signing failed: ${msg}` });
    } finally {
      setIsSigningWallet(false);
    }
  }, [solanaPublicKey, signMessage]);

  // Wallet connection effect
  useEffect(() => {
    if (solanaConnected && solanaPublicKey) {
      const walletAddress = solanaPublicKey.toBase58();
      setFormData(prev => ({ ...prev, wallet: walletAddress }));
      setDetectedNetwork('solana');
      
      // Check if already registered
      const checkRegistration = async () => {
        setIsCheckingRegistration(true);
        try {
          const isRegistered = await checkUserRegistration(db, walletAddress);
          setIsAlreadyRegistered(isRegistered);
        } catch (error) {
          console.error('Error checking registration:', error);
        } finally {
          setIsCheckingRegistration(false);
        }
      };
      
      checkRegistration();
    } else if (evmConnected) {
      setDetectedNetwork('evm');
    } else {
      setDetectedNetwork(null);
      setFormData(prev => ({ ...prev, wallet: '' }));
      setIsAlreadyRegistered(false);
      setWalletMetrics(null);
    }
  }, [solanaConnected, evmConnected, solanaPublicKey]);

  useEffect(() => {
    document.title = `Nuxchain | NUX Token Airdrop - Get ${TOKENS_PER_USER.toLocaleString()} NUX Tokens (100M Supply)`;
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (submitStatus.type === 'error') {
      setSubmitStatus({ type: null, message: '' });
    }
  }, [submitStatus.type]);

  const validateForm = useCallback((): boolean => {
    if (!formData.name || formData.name.trim().length < 3) {
      setSubmitStatus({
        type: 'error',
        message: 'Name must be at least 3 characters long',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid email address',
      });
      return false;
    }

    if (!formData.wallet || formData.wallet.trim().length === 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please connect your Solana wallet or enter a valid Solana address',
      });
      return false;
    }

    // Basic Solana address validation (base58 and length 32-44)
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaRegex.test(formData.wallet.trim())) {
      setSubmitStatus({
        type: 'error',
        message: 'Invalid Solana address. Please use a valid Solana wallet.',
      });
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    // Bot Protection: Honeypot check
    if (formData.website) {
      console.warn('Bot detected: Honeypot filled');
      // Artificial delay to mimic real processing and confuse bots
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus({ type: 'success', message: 'Registration submitted successfully!' });
      setIsSubmitting(false);
      return;
    }

    // Bot Protection: Timing check (min 3 seconds)
    const timeToSubmit = Date.now() - mountTime;
    if (timeToSubmit < 3000) {
      console.warn('Bot detected: Fast submission', timeToSubmit);
      setSubmitStatus({ type: 'error', message: 'Something went wrong. Please try again in a few seconds.' });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🚀 Submitting airdrop registration...');
      console.log('Form data:', {
        name: formData.name,
        email: formData.email,
        wallet: formData.wallet,
        network: 'solana'
      });

      await submitAirdropRegistration(
        db,
        formData.name,
        formData.email,
        formData.wallet,
        formData.website, // Pass honeypot to service for extra verification
        {
          userAgent,
          fingerprint: deviceFingerprint,
          browserInfo,
          submitTime: Date.now(),
          pageLoadTime: mountTime,
          captchaToken: captchaToken || '',
          walletSignature: walletSignature || '',
          // Pass frontend pre-analysis as a hint so the backend can rescue
          // legitimate users when its own RPC calls are temporarily degraded
          walletHint: walletMetrics
            ? {
                trustScore: walletMetrics.trustScore ?? 0,
                transactionCount: walletMetrics.transactionCount,
                isLegit: walletMetrics.isLegit,
              }
            : undefined,
        }
      );

      console.log('✅ Registration successful!');
      
      setSubmitStatus({
        type: 'success',
        message: `Successfully registered! You will receive ${TOKENS_PER_USER.toLocaleString()} NUX tokens.`,
      });
      
      // Update counter
      setRegisteredUsers(prev => prev + 1);
      
      // Mark as registered immediately to change UI
      setIsAlreadyRegistered(true);
      
      // Show success modal
      setShowSuccess(true);

      // Hide success message/modal after 15 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 15000);

    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to register. Please try again.';
      
      console.error('Showing error message to user:', errorMessage);
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, mountTime, userAgent, deviceFingerprint, browserInfo, captchaToken, walletSignature]);

  // Countdown target date - March 15, 2026 23:59:59
  const airdropEndDate = new Date(2026, 2, 15, 23, 59, 59);

  // Calculate remaining users and statistics
  const isPoolFull = registeredUsers >= MAX_USERS;
  const usersRemaining = Math.max(0, MAX_USERS - registeredUsers);
  const poolProgress = Math.min(100, (registeredUsers / MAX_USERS) * 100);

  return (
    <>
      <div className="min-h-screen text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Header Section - Modular Component */}
          <AirdropHeader 
            tokensPerUser={TOKENS_PER_USER} 
            airdropEndDate={airdropEndDate} 
          />

          {/* Form Section - Improved Desktop Layout */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Form Column */}
              <div className="lg:col-span-7">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-4 sm:p-6 lg:p-8 shadow-2xl">
                  {isCheckingRegistration ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-500 rounded-full animate-spin-slow"></div>
                      </div>
                      <p className="text-gray-400 font-medium animate-pulse tracking-wide">Syncing with Nuxchain Universe...</p>
                    </div>
                  ) : isAlreadyRegistered ? (
                    <AirdropSuccess 
                      name={formData.name}
                      email={formData.email}
                      walletAddress={formData.wallet}
                    />
                  ) : isPoolFull ? (
                    <div className="relative overflow-hidden group">
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-colors duration-500"></div>
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors duration-500"></div>

                      <div className="relative z-10 text-center py-16 px-8 sm:py-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full mb-8 shadow-inner border border-red-500/20 animate-pulse">
                          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        <h3 className="jersey-15-regular text-2xl lg:text-3xl font-black text-white mb-4 flex items-center gap-2">
                          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Waitlist Initialized</span>
                        </h3>

                        <p className="jersey-20-regular text-xl lg:text-3xl text-white font-medium mb-6">You missed the first wave!</p>

                        <div className="max-w-md mx-auto space-y-4 text-gray-400 text-base leading-relaxed mb-10">
                          <p>
                            All <span className="text-white font-bold">{MAX_USERS.toLocaleString()}</span> early adopter slots have been claimed in record time.
                          </p>
                          <p className="text-sm">
                            The demand for <span className="text-purple-400 font-semibold">$NUX</span> is unprecedented. Don't let the next opportunity slip away.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <div className="jersey-20-regular px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm lg:text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            Sold Out
                          </div>
                          <a
                            href="https://x.com/nuxchain"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="jersey-20-regular px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-sm lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2"
                          >
                            Follow for Phase 2
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" /></svg>
                          </a>
                        </div>

                        <p className="mt-12 text-sm lg:text-xl uppercase tracking-[0.2em] text-gray-500 font-bold">
                          Official $NUX ecosystem registration
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <AirdropForm
                        formData={formData}
                        isSubmitting={isSubmitting}
                        submitStatus={submitStatus}
                        solanaConnected={solanaConnected}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        onOpenRequirements={() => setIsRequirementsOpen(true)}
                        walletMetrics={walletMetrics}
                        onCaptchaVerify={(token) => setCaptchaToken(token)}
                        onCaptchaExpire={() => setCaptchaToken(null)}
                        captchaToken={captchaToken}
                        walletSignature={walletSignature}
                        isSigningWallet={isSigningWallet}
                        onSignWallet={handleSignWallet}
                      />
                      
                      {/* Wallet Metrics Display - REMOVED (integrated in form) */}
                      {/* <WalletMetricsDisplay walletMetrics={walletMetrics} /> */}

                      {isAnalyzingWallet && (
                        <div className="mt-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="jersey-20-regular text-sm sm:text-base text-blue-300">Analyzing wallet security...</span>
                        </div>
                      )}

                      {/* Alert for EVM users */}
                      {detectedNetwork === 'evm' && !solanaConnected && (
                        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex gap-3 animate-fadeIn">
                          <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="jersey-20-regular text-xl sm:text-xl text-orange-200/80">
                            <strong className="text-orange-400 block mb-0.5">Solana Required!</strong>
                            This airdrop is exclusively for the <span className="text-white font-bold">Solana Network</span>. Please connect a Solana wallet (like Phantom, Solflare or OKX) to claim your tokens.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Sidebar - Desktop Only */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                {/* Live Stats Card */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 lg:p-8">
                  <h3 className="jersey-15-regular text-2xl lg:text-3xl font-black text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Live Airdrop Stats
                  </h3>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="jersey-20-regular flex justify-between text-sm lg:text-xl mb-2">
                      <span className="text-gray-400">Pool Progress</span>
                      <span className="text-purple-300 font-semibold">{poolProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 animate-gradient-shift"
                        style={{ width: `${poolProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <p className="jersey-20-regular text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">Registered</p>
                      <p className="jersey-20-regular text-2xl sm:text-3xl font-bold text-white">{isLoadingCount ? '...' : registeredUsers.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <p className="jersey-20-regular text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-semibold">Remaining</p>
                      <p className="jersey-20-regular text-2xl sm:text-3xl font-bold text-white">{isLoadingCount ? '...' : usersRemaining.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="jersey-20-regular text-xs sm:text-sm text-gray-500 mb-2">Token Distribution</p>
                    <p className="jersey-20-regular text-sm sm:text-base text-purple-400 font-semibold">
                        Deadline: <span className="text-purple-400 font-semibold">Mar 15, 2026</span>
                    </p>
                  </div>
                </div>

                {/* Benefits Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 lg:p-8">
                  <h3 className="jersey-15-regular text-xl sm:text-2xl font-black text-white mb-4 flex items-center gap-2">
                                      <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Why Join?
                  </h3>
                  <ul className="jersey-20-regular space-y-3 text-xl lg:text-xl text-gray-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white">40K NUX tokens + Whitelist access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white">3-Phase vesting: 10K + 20K + 10K</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white">Exclusive Whitelist: Buy at $0.0015 (cheapest)</span>
                    </li>
                  </ul>
                </div>

                {/* Additional Features - Modular Component */}
                <AirdropFeatures />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* Success Modal - Modular Component */}
      <AirdropModals
        showSuccess={showSuccess}
        setShowSuccess={setShowSuccess}
        tokensPerUser={TOKENS_PER_USER}
      />

      {/* Requirements Modal */}
      <RequirementsModal 
        isOpen={isRequirementsOpen} 
        onClose={() => setIsRequirementsOpen(false)} 
      />
    </>
  );
}

export default Airdrop;