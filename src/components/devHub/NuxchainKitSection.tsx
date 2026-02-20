import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { registerForWaitlist } from '../forms/waitlist-service';
import { db } from '../firebase/config'; 

function NuxchainKitSection() {
  const isMobile = useIsMobile();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const specializationOptions = [
    'Full-Stack Developer',
    'Smart Contract Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Product Builder',
    'Startup Founder',
    'Other'
  ];

  const handleToggleForm = () => {
    setIsFormVisible((prev) => !prev);
    setStatus('idle');
    setMessage('');
  };

  const handleChange = (field: 'name' | 'specialization' | 'email') => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setStatus('error');
      setMessage('Please provide your name.');
      return;
    }

    if (!formData.specialization.trim()) {
      setStatus('error');
      setMessage('Select your specialization.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('');
      
      // ✅ FIX: Pasar los parámetros correctamente
      console.log('Submitting:', formData); // Debug
      await registerForWaitlist(
        db,                        // Firebase Firestore instance
        formData.name,             // name
        formData.specialization,   // specialization
        formData.email             // email
      );
      
      setStatus('success');
      setMessage('You are on the waitlist! We will reach out soon.');
      setFormData({ name: '', specialization: '', email: '' });
    } catch (error) {
      console.error('Error registering for waitlist:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong while registering. Please try again.');
    }
  };

  const features = [
    {
      icon: '🔌',
      title: 'RESTful API',
      description: 'Simple HTTP endpoints for all core functionality'
    },
    {
      icon: '📚',
      title: 'SDK Libraries',
      description: 'JavaScript, TypeScript, Python'
    },
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'API keys and OAuth 2.0 support'
    },
    {
      icon: '📊',
      title: 'Real-time Webhooks',
      description: 'Event notifications for blockchain activities'
    },
    {
      icon: '🧪',
      title: 'Sandbox Environment',
      description: 'Test your integration on testnets'
    },
    {
      icon: '📖',
      title: 'Comprehensive Docs',
      description: 'Interactive API documentation and guides'
    }
  ];

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="card-form">
        <div className="text-center mb-8">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold tracking-widest text-purple-400 uppercase bg-purple-500/10 rounded-full border border-purple-500/20 jersey-20-regular">
            🚀 Coming Soon
          </span>
          <h2 className={`font-bold jersey-15-regular text-gradient ${isMobile ? 'text-4xl mb-3' : 'text-5xl mb-4'}`}>
            Introducing Nuxchain Kit
          </h2>
          <p className={`jersey-20-regular text-slate-300 max-w-3xl mx-auto leading-relaxed ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            A comprehensive developer toolkit and API platform to build Web3 solutions faster than ever. 
            Deploy smart contracts, manage NFTs, process transactions, and integrate blockchain functionality 
            into your applications with just a few lines of code.
          </p>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'} mb-8`}>
          {features.map((feature, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="text-base font-bold jersey-15-regular text-white mb-1">{feature.title}</h3>
              <p className="jersey-20-regular text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-400/20">
          <h3 className="text-xl font-bold jersey-15-regular mb-3 text-purple-300">What You'll Be Able To Do:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">▸</span>
                <p className="jersey-20-regular text-slate-300 text-sm">Deploy staking contracts with custom parameters via API</p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">▸</span>
                <p className="jersey-20-regular text-slate-300 text-sm">Create and manage NFT collections programmatically</p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">▸</span>
                <p className="jersey-20-regular text-slate-300 text-sm">Integrate marketplace functionality into your dApp</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">▸</span>
                <p className="jersey-20-regular text-slate-300 text-sm">Query blockchain data with simplified GraphQL endpoints</p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">▸</span>
                <p className="jersey-20-regular text-slate-300 text-sm">Automate token distributions and airdrops</p>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">▸</span>
                <p className="jersey-20-regular text-slate-300 text-sm">Access AI-powered analytics and insights</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {!isFormVisible ? (
            <div className="text-center">
              <p className="jersey-20-regular text-slate-500 text-sm mb-4">
                Join the waitlist to get early access and exclusive developer benefits
              </p>
              <button onClick={handleToggleForm} className="btn-primary jersey-20-regular px-8 py-3">
                🔔 Notify Me When Available
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold jersey-15-regular text-white">Join the Nuxchain Kit waitlist</h3>
                  <p className="jersey-20-regular text-slate-400 text-sm">
                    We will notify you as soon as the API is available.
                  </p>
                </div>
                <button
                  onClick={handleToggleForm}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Close waitlist form"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 jersey-20-regular" htmlFor="waitlist-name">
                      Full name
                    </label>
                    <input
                      id="waitlist-name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange('name')}
                      placeholder="Satoshi Nakamoto"
                      className="w-full rounded-lg bg-white/10 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 jersey-20-regular" htmlFor="waitlist-specialization">
                      Area of specialization
                    </label>
                    <select
                      id="waitlist-specialization"
                      value={formData.specialization}
                      onChange={handleChange('specialization')}
                      className="w-full rounded-lg bg-white/10 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {specializationOptions.map((option) => (
                        <option key={option} value={option} className="bg-[#05071C]">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 jersey-20-regular" htmlFor="waitlist-email">
                    Work email
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="you@nuxchain.dev"
                    className="w-full rounded-lg bg-white/10 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {message && (
                  <div
                    className={`text-sm px-4 py-3 rounded-lg ${
                      status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/10 text-rose-300 border border-rose-400/30'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="submit"
                    className="btn-primary jersey-20-regular px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Submitting...' : 'Submit' }
                  </button>
                  <p className="text-xs text-slate-600 jersey-20-regular">
                    Your information will be used solely to share updates about Nuxchain Kit.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default NuxchainKitSection;
