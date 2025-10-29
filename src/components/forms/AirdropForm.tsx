import React, { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useAirdrops } from '../../hooks/airdrops/useAirdrops';
import type { Address } from 'viem';

// Manual validation functions
const validateName = (name: string) => {
  if (name.length < 3) return "Name must be at least 3 characters long";
  return true;
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email address";
  return true;
};

function AirdropForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet: '',
    selectedAirdrop: '',
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { airdrops, registerForAirdrop, isPending, isConfirming, isConfirmed, transactionError } = useAirdrops();
  
  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setFormData(prev => ({
        ...prev,
        wallet: address
      }));
    }
  }, [isConnected, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
        setSubmitMessage('Please connect your wallet first');
        return;
      }

    // Validate name
    const nameValidation = validateName(formData.name);
    if (nameValidation !== true) {
      setSubmitMessage(nameValidation);
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (emailValidation !== true) {
      setSubmitMessage(emailValidation);
      return;
    }

    if (!formData.selectedAirdrop) {
        setSubmitMessage('Please select an airdrop');
        return;
      }

      if (!formData.agreedToTerms) {
        setSubmitMessage('You must agree to the terms and conditions');
        return;
      }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await registerForAirdrop(formData.selectedAirdrop as Address);
      setSubmitMessage('Registration successful! Your transaction is being processed.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        wallet: '',
        selectedAirdrop: '',
        agreedToTerms: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitMessage('Registration error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleConnectWallet = () => {
    connect({ connector: injected() });
  };

  return (
    <div className="card-form">
      <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
        Airdrop Registration
      </h2>
      
      {isConfirmed && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
          <p className="text-green-400 text-center font-medium">🎉 Registration Successful!</p>
          <p className="text-green-300 text-sm text-center mt-1">
            Thank you for registering! We'll notify you about upcoming NFT airdrops.
          </p>
        </div>
      )}
      
      <div className="mb-6 card-unified">
        <p className="text-sm text-gray-300 text-center mb-3">
          Connect your wallet to automatically fill your address and ensure secure participation.
        </p>
        {!isConnected ? (
          <button
            onClick={handleConnectWallet}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="text-center">
            <p className="text-green-400 text-sm font-medium">✓ Wallet Connected</p>
            <p className="text-xs text-gray-400 mt-1">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-black/20 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-white placeholder-gray-400"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-black/20 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-white placeholder-gray-400"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="selectedAirdrop" className="block text-sm font-medium text-gray-300 mb-2">
            Select Airdrop *
          </label>
          <select
            id="selectedAirdrop"
            name="selectedAirdrop"
            value={formData.selectedAirdrop}
            onChange={handleInputChange}
            className="w-full px-2 py-3 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-white"
            required
          >
            <option value="">Select an airdrop</option>
            {airdrops.filter(airdrop => airdrop.canRegister).map((airdrop) => (
              <option key={airdrop.airdropContract} value={airdrop.airdropContract} className="bg-black text-white">
                {airdrop.name} - {airdrop.registeredUsers} registered users
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleInputChange}
              className="mr-2 accent-purple-500"
              required
            />
            <span className="text-sm text-gray-300">
              I agree to the terms and conditions *
            </span>
          </label>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isConnected || isSubmitting || isPending || isConfirming}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 transform flex items-center justify-center ${
              isConnected && !isSubmitting && !isPending && !isConfirming
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting || isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : isConfirming ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming transaction...
              </>
            ) : isConnected ? (
              'Register for Airdrop'
            ) : (
              'Connect Wallet to Register'
            )}
          </button>
        </div>
      </form>
      
      {submitMessage && (
        <div className={`mt-4 border rounded-lg p-4 backdrop-blur-sm ${
          submitMessage.includes('successful') || isConfirmed
            ? 'bg-green-500/20 border-green-500/50 text-green-400'
            : 'bg-red-500/20 border-red-500/50 text-red-400'
        }`}>
          <p className="text-sm text-center">
            {typeof submitMessage === 'string' ? submitMessage : 'An error occurred'}
          </p>
        </div>
      )}

      {transactionError && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-red-400 text-sm text-center">
            Transaction error: {(() => {
              if (transactionError instanceof Error) {
                return transactionError.message || 'Unknown error occurred';
              }
              if (typeof transactionError === 'object' && transactionError !== null) {
                return JSON.stringify(transactionError).slice(0, 200) + '...';
              }
              return String(transactionError);
            })()}
          </p>
        </div>
      )}
      
      <div className="mt-4 card-unified">
        <p className="text-xs text-gray-400 text-center">
          By registering, you agree to receive notifications about NFT airdrops and updates.
        </p>
      </div>
    </div>
  );
}

export default AirdropForm;