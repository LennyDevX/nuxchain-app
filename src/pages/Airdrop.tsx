import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { db } from '../components/firebase/config';
import { submitAirdropRegistration, getRegisteredUsersCount, checkUserRegistration } from '../components/forms/airdrop-service';
import GlobalBackground from '../ui/gradientBackground';
import Footer from '../components/layout/footer';
import CountdownTimer from '../components/ui/CountdownTimer';
import NuxCoinDisplay from '../components/airdrop/NuxCoinDisplay';
import MaintenancePage from './MaintenancePage';
import { MAINTENANCE_CONFIG, isMaintenanceMode } from '../config/maintenance';
import '../styles/nux-coin-display.css';

// Utility functions for device fingerprinting
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
  const { publicKey: solanaPublicKey, connected: solanaConnected } = useWallet();

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
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const [detectedNetwork, setDetectedNetwork] = useState<'solana' | 'evm' | null>(null);
  const [mountTime] = useState(Date.now());
  const [deviceFingerprint] = useState(() => generateFingerprint());
  const [userAgent] = useState(navigator.userAgent);
  const [browserInfo] = useState(() => getBrowserInfo());

  // Constantes del airdrop
  const TOKENS_PER_USER = 6000; // 6K NUX tokens por usuario
  const MAX_USERS = 10000; // 10,000 usuarios máximo

  // Cargar número de usuarios registrados
  useEffect(() => {
    const loadUsersCount = async () => {
      setIsLoadingCount(true);
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

    // Actualizar cada 30 segundos
    const interval = setInterval(loadUsersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-fill wallet y check de registro cuando se conecta (SOLANA ONLY)
  useEffect(() => {
    const checkStatus = async () => {
      if (solanaConnected && solanaPublicKey) {
        const solanaAddress = solanaPublicKey.toBase58();
        setFormData(prev => ({ ...prev, wallet: solanaAddress }));
        setDetectedNetwork('solana');

        setIsCheckingRegistration(true);
        try {
          const registered = await checkUserRegistration(db, solanaAddress);
          setIsAlreadyRegistered(registered);
        } catch (err) {
          console.error('Error checking registration:', err);
        } finally {
          setIsCheckingRegistration(false);
        }
      } else if (evmConnected) {
        setDetectedNetwork('evm');
        setIsAlreadyRegistered(false);
      } else {
        setDetectedNetwork(null);
        setIsAlreadyRegistered(false);
      }
    };

    checkStatus();
  }, [solanaConnected, solanaPublicKey, evmConnected]);

  useEffect(() => {
    document.title = `Nuxchain | NUX Token Airdrop - Get ${TOKENS_PER_USER.toLocaleString()} NUX Tokens`;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (submitStatus.type === 'error') {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const validateForm = (): boolean => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          pageLoadTime: mountTime
        }
      );

      console.log('✅ Registration successful!');
      
      setSubmitStatus({
        type: 'success',
        message: `Successfully registered! You will receive ${TOKENS_PER_USER.toLocaleString()} NUX tokens.`,
      });
      setShowSuccess(true);

      // Actualizar contador
      setRegisteredUsers(prev => prev + 1);

      // Reset form
      setFormData({
        name: '',
        email: '',
        wallet: solanaConnected && solanaPublicKey
          ? solanaPublicKey.toBase58()
          : '',
        website: '',
      });

      // Hide success message after 8 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 8000);

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
  };

  // Countdown target date - February 14, 2026 23:59:59 (Airdrop distribution date)
  const airdropEndDate = new Date(2026, 1, 14, 23, 59, 59);

  // Calcular usuarios restantes y estadísticas
  const isPoolFull = registeredUsers >= MAX_USERS;
  const usersRemaining = Math.max(0, MAX_USERS - registeredUsers);
  const poolProgress = Math.min(100, (registeredUsers / MAX_USERS) * 100);

  // Check for maintenance mode - must be after all hooks
  if (isMaintenanceMode()) {
    return (
      <MaintenancePage 
        estimatedTime={MAINTENANCE_CONFIG.estimatedTime}
        message={MAINTENANCE_CONFIG.message}
      />
    );
  }

  return (
    <GlobalBackground>
      <div className="min-h-screen text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16 animate-fadeIn">
            {/* NUX Coin Display */}
            <div className="mb-8">
              <NuxCoinDisplay size="xl" className="nux-coin-container" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6 animate-gradient-text">
              $NUX Token Airdrop
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-2">
              Register now and receive <span className="font-bold text-purple-400">{TOKENS_PER_USER.toLocaleString()} NUX tokens</span>
            </p>

            {/* Token Info Cards */}
            <div className="flex flex-wrap gap-3 justify-center items-center text-sm sm:text-base mb-6">
              <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span>$NUX Token</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Solana Network</span>
              </div>
              <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>1B Total Supply</span>
              </div>
            </div>

            {/* Launch Info */}
            <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-400">
              <span>🚀 Token Launch: <strong className="text-purple-300">February 10, 2026</strong></span>
              <span className="text-gray-600">|</span>
              <span>🎁 Airdrop Date: <strong className="text-pink-300">February 14, 2026</strong></span>
            </div>
          </div>

          {/* Countdown Timer Section */}
          <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <CountdownTimer targetDate={airdropEndDate} />
          </div>

          {/* Form Section - Improved Desktop Layout */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Form Column */}
              <div className="lg:col-span-7">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6 sm:p-8 lg:p-10 shadow-2xl">
                  {isCheckingRegistration ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-500 rounded-full animate-spin-slow"></div>
                      </div>
                      <p className="text-gray-400 font-medium animate-pulse tracking-wide">Syncing with Nuxchain Universe...</p>
                    </div>
                  ) : isAlreadyRegistered ? (
                    <div className="relative overflow-hidden group">
                      {/* Decorative Background Elements */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-500"></div>
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors duration-500"></div>

                      <div className="relative z-10 text-center py-16 px-8 sm:py-20 bg-transparent rounded-3xl">
                        {/* Dragonix Branding */}
                        <div className="flex justify-center mb-10">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                            <img
                              src="/Dragonix.png"
                              alt="Dragonix"
                              className="w-40 h-40 sm:w-48 sm:h-48 object-contain relative z-10 animate-float"
                              style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))' }}
                            />
                          </div>
                        </div>

                        <h3 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight uppercase">
                          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-text">
                            Welcome to the Universe
                          </span>
                        </h3>

                        <p className="text-2xl sm:text-3xl font-bold text-white mb-10 opacity-90 tracking-wide">
                          of Nuxchain
                        </p>

                        <div className="max-w-md mx-auto space-y-6 text-gray-200 text-base sm:text-lg leading-relaxed mb-12">
                          <p className="opacity-90 text-xl font-medium">
                            Your registration has been detected in our database. You're already part of the early adopter elite!
                          </p>
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-white font-black text-xl sm:text-2xl tracking-tight leading-relaxed">
                              Your <span className="text-blue-400">{TOKENS_PER_USER.toLocaleString()} NUX</span> airdrop will be sent soon.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-6 justify-center items-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="px-8 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs sm:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                              </span>
                              Registration Confirmed
                            </div>
                            <p className="text-gray-500 text-xs font-mono mt-2">
                              Wallet: <span className="text-gray-300">{formData.wallet.slice(0, 6)}...{formData.wallet.slice(-6)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isPoolFull ? (
                    <div className="relative overflow-hidden group">
                      {/* Decorative Background Elements */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-colors duration-500"></div>
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors duration-500"></div>

                      <div className="relative z-10 text-center py-16 px-8 sm:py-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full mb-8 shadow-inner border border-red-500/20 animate-pulse">
                          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight uppercase">
                          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Waitlist Initialized</span>
                        </h3>

                        <p className="text-xl text-white font-medium mb-6">You missed the first wave!</p>

                        <div className="max-w-md mx-auto space-y-4 text-gray-400 text-base leading-relaxed mb-10">
                          <p>
                            All <span className="text-white font-bold">{MAX_USERS.toLocaleString()}</span> early adopter slots have been claimed in record time.
                          </p>
                          <p className="text-sm">
                            The demand for <span className="text-purple-400 font-semibold">$NUX</span> is unprecedented. Don't let the next opportunity slip away.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <div className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            Sold Out
                          </div>
                          <a
                            href="https://x.com/nuxchain"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2"
                          >
                            Follow for Phase 2
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" /></svg>
                          </a>
                        </div>

                        <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                          Official $NUX ecosystem registration
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Honeypot field - invisible to humans */}
                      <div className="hidden" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input
                          type="text"
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          disabled={isSubmitting}
                          required
                          minLength={3}
                        />
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          disabled={isSubmitting}
                          required
                        />
                      </div>

                      {/* Wallet Input */}
                      <div className="space-y-2">
                        <label htmlFor="wallet" className="block text-sm font-medium text-gray-300">
                          Wallet Address *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="wallet"
                            name="wallet"
                            value={formData.wallet}
                            onChange={handleInputChange}
                            placeholder="Enter your Solana (SOL) address"
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${detectedNetwork === 'evm' ? 'border-orange-500/50' : 'border-gray-700'
                              }`}
                            disabled={isSubmitting || (solanaConnected && !!solanaPublicKey)}
                            required
                          />
                          {solanaConnected && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-400 font-bold uppercase tracking-wider">
                                Solana Connected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Alert for EVM users */}
                        {detectedNetwork === 'evm' && !solanaConnected && (
                          <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex gap-3 animate-fadeIn">
                            <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-orange-200/80">
                              <strong className="text-orange-400 block mb-0.5">Solana Required!</strong>
                              You are connected to Polygon. This airdrop is only compatible with the Solana network. Please connect a Solana wallet (Phantom/OKX) to continue.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Info Box */}
                      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 flex gap-3">
                        <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-gray-300">
                          <p className="font-medium text-purple-300 mb-1">What you'll receive:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li><strong className="text-white">{TOKENS_PER_USER.toLocaleString()} NUX tokens</strong> on Solana network</li>
                            <li>Early access to Nuxchain ecosystem</li>
                          </ul>
                        </div>
                      </div>

                      {/* Status Messages */}
                      {submitStatus.type && (
                        <div
                          className={`p-4 rounded-xl border ${submitStatus.type === 'success'
                            ? 'bg-green-500/10 border-green-500/30 text-green-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300'
                            } animate-fadeIn`}
                        >
                          <div className="flex items-start gap-3">
                            {submitStatus.type === 'success' ? (
                              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <p className="text-sm">{submitStatus.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || detectedNetwork === 'evm'}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Registering...</span>
                          </>
                        ) : (
                          <>
                            <span>Register for Airdrop</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>

                      <p className="text-xs text-center text-gray-500">
                        By registering, you agree to receive your airdrop allocation and participate in the Nuxchain ecosystem
                      </p>
                    </form>
                  )}
                </div>
              </div>

              {/* Info Sidebar - Desktop Only */}
              <div className="lg:col-span-5 space-y-6">
                {/* Live Stats Card */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Live Airdrop Stats
                  </h3>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Pool Progress</span>
                      <span className="text-purple-300 font-semibold">{poolProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 animate-gradient-shift"
                        style={{ width: `${poolProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Registered Users
                      </span>
                      <span className="text-white font-semibold">
                        {isLoadingCount ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <>{registeredUsers} / {MAX_USERS}</>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Slots Available
                      </span>
                      <span className="text-green-400 font-semibold">
                        {isLoadingCount ? '...' : usersRemaining}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">NUX per User</span>
                      <span className="text-purple-400 font-semibold">{TOKENS_PER_USER.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Total NUX Pool</span>
                      <span className="text-white font-semibold">60M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Airdrop Date</span>
                      <span className="text-purple-400 font-semibold">Feb 10, 2026</span>
                    </div>
                  </div>
                </div>

                {/* Benefits Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Why Join?
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong className="text-white">{(TOKENS_PER_USER / 1000).toLocaleString()}K NUX tokens</strong> - Launch price allocation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong className="text-white">Solana network</strong> - Fast & low-cost transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong className="text-white">Early adopter</strong> exclusive benefits</span>
                    </li>
                  </ul>
                </div>

                {/* Security Badge */}
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-8 h-8 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Secure & Verified</h4>
                      <p className="text-sm text-gray-400">Limited to {MAX_USERS.toLocaleString()} participants. First come, first served!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info - Mobile */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:hidden">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">No Gas Fees</h3>
                <p className="text-sm text-gray-400">Registration is completely free with no hidden costs</p>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">One Per User</h3>
                <p className="text-sm text-gray-400">Each wallet and email can register only once</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-purple-500/50 p-8 max-w-md w-full shadow-2xl animate-scaleIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Registration Successful! 🎉</h2>
              <p className="text-gray-300 mb-2">
                You've been registered for the NUX token airdrop!
              </p>
              <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                <p className="text-white font-bold text-lg mb-2">You will receive:</p>
                <ul className="text-left text-gray-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span><strong className="text-purple-300">{TOKENS_PER_USER.toLocaleString()} NUX tokens</strong></span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Distribution on <strong className="text-purple-300">February 14, 2026</strong>
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </GlobalBackground>
  );
}

export default Airdrop;
