import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  uploadProgress: number;
  isUploading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  success: string | null;
}

export default function ProgressIndicator({
  uploadProgress,
  isUploading,
  isPending,
  isConfirming,
  success
}: ProgressIndicatorProps) {
  const getProgressSteps = () => {
    const steps = [
      { label: 'Uploading Image', progress: 25, icon: '📸' },
      { label: 'Creating Metadata', progress: 50, icon: '📝' },
      { label: 'Uploading to IPFS', progress: 75, icon: '🌐' },
      { label: 'Minting NFT', progress: 100, icon: '⚡' }
    ];

    return steps.map((step, index) => {
      let status = 'pending';
      if (uploadProgress > step.progress) {
        status = 'completed';
      } else if (uploadProgress >= step.progress - 24) {
        status = 'active';
      }

      return { ...step, status, index };
    });
  };

  const getCurrentPhase = () => {
    if (success) return 'success';
    if (isConfirming) return 'confirming';
    if (isPending) return 'minting';
    if (isUploading) return 'uploading';
    return 'idle';
  };

  const phase = getCurrentPhase();
  const steps = getProgressSteps();

  if (!isUploading && !isPending && !isConfirming && !success) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8"
    >
      <div className="text-center mb-8">
        <motion.h3 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {phase === 'success' ? '🎉 NFT Created Successfully!' : 
           phase === 'confirming' ? '⏳ Confirming Transaction...' :
           phase === 'minting' ? '⚡ Minting Your NFT...' :
           '📤 Uploading to IPFS...'}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-white/60"
        >
          {phase === 'success' ? 'Your NFT is now live on the blockchain!' :
           phase === 'confirming' ? 'Please wait while the transaction is confirmed' :
           phase === 'minting' ? 'Creating your unique NFT on the blockchain' :
           'Preparing your artwork for the decentralized web'}
        </motion.p>
      </div>

      {/* Progress Bar */}
      {phase !== 'success' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm font-medium">
              Progress
            </span>
            <motion.span 
              className="text-white/80 text-sm font-medium"
              key={uploadProgress}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {phase === 'confirming' || phase === 'minting' ? '100' : uploadProgress}%
            </motion.span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${phase === 'confirming' || phase === 'minting' ? 100 : uploadProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Steps */}
      {phase === 'uploading' && (
        <motion.div 
          className="space-y-4"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {steps.map((step) => (
            <motion.div 
              key={step.index} 
              className="flex items-center gap-4"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <motion.div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300
                  ${
                    step.status === 'completed' 
                      ? 'bg-green-500 text-white scale-110' 
                      : step.status === 'active'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse scale-110'
                      : 'bg-white/20 text-white/60'
                  }
                `}
                animate={step.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {step.status === 'completed' ? '✓' : step.icon}
              </motion.div>
              <div className="flex-1">
                <motion.p 
                  className={`
                    font-medium transition-colors duration-300
                    ${
                      step.status === 'completed'
                        ? 'text-green-400'
                        : step.status === 'active'
                        ? 'text-white'
                        : 'text-white/60'
                    }
                  `}
                >
                  {step.label}
                </motion.p>
              </div>
              {step.status === 'active' && (
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: ['0px', '-4px', '0px'] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: ['0px', '-4px', '0px'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ y: ['0px', '-4px', '0px'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Blockchain Transaction Phase */}
      {(phase === 'minting' || phase === 'confirming') && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.svg 
              className="w-10 h-10 text-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </motion.svg>
          </motion.div>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white font-medium">
              {phase === 'minting' ? 'Creating your NFT on the blockchain...' : 'Waiting for transaction confirmation...'}
            </p>
            <p className="text-white/60 text-sm">
              This may take a few moments depending on network congestion
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Success State */}
      {phase === 'success' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="text-center"
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.svg 
              className="w-10 h-10 text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>
          <motion.div 
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-green-300 font-medium mb-2">{success}</p>
            <p className="text-green-200 text-sm">
              🚀 Redirecting to NFTs section in a few seconds...
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Tips */}
      {(phase === 'minting' || phase === 'confirming') && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <p className="text-blue-300 text-sm">
            💡 <strong>Tip:</strong> Don't close this window or refresh the page while the transaction is processing.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}