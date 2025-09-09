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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          {phase === 'success' ? '🎉 NFT Created Successfully!' : 
           phase === 'confirming' ? '⏳ Confirming Transaction...' :
           phase === 'minting' ? '⚡ Minting Your NFT...' :
           '📤 Uploading to IPFS...'}
        </h3>
        <p className="text-white/60">
          {phase === 'success' ? 'Your NFT is now live on the blockchain!' :
           phase === 'confirming' ? 'Please wait while the transaction is confirmed' :
           phase === 'minting' ? 'Creating your unique NFT on the blockchain' :
           'Preparing your artwork for the decentralized web'}
        </p>
      </div>

      {/* Progress Bar */}
      {phase !== 'success' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm font-medium">
              Progress
            </span>
            <span className="text-white/80 text-sm font-medium">
              {phase === 'confirming' || phase === 'minting' ? '100' : uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ 
                width: `${phase === 'confirming' || phase === 'minting' ? 100 : uploadProgress}%` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Steps */}
      {phase === 'uploading' && (
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.index} className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300
                ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white scale-110' 
                    : step.status === 'active'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse scale-110'
                    : 'bg-white/20 text-white/60'
                }
              `}>
                {step.status === 'completed' ? '✓' : step.icon}
              </div>
              <div className="flex-1">
                <p className={`
                  font-medium transition-colors duration-300
                  ${
                    step.status === 'completed'
                      ? 'text-green-400'
                      : step.status === 'active'
                      ? 'text-white'
                      : 'text-white/60'
                  }
                `}>
                  {step.label}
                </p>
              </div>
              {step.status === 'active' && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Blockchain Transaction Phase */}
      {(phase === 'minting' || phase === 'confirming') && (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">
              {phase === 'minting' ? 'Creating your NFT on the blockchain...' : 'Waiting for transaction confirmation...'}
            </p>
            <p className="text-white/60 text-sm">
              This may take a few moments depending on network congestion
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {phase === 'success' && (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
            <p className="text-green-300 font-medium mb-2">{success}</p>
            <p className="text-green-200 text-sm">
              🚀 Redirecting to NFTs section in a few seconds...
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      {(phase === 'minting' || phase === 'confirming') && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Tip:</strong> Don't close this window or refresh the page while the transaction is processing.
          </p>
        </div>
      )}
    </div>
  );
}