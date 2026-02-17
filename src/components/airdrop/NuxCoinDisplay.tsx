interface NuxCoinDisplayProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function NuxCoinDisplay({ size = 'lg', className = '' }: NuxCoinDisplayProps) {
  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24',
    md: 'w-32 h-32 sm:w-40 sm:h-40',
    lg: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64',
    xl: 'w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Coin image */}
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        <img
          src="/Dragonix.png"
          alt="NUX Token"
          className="w-full h-full object-contain animate-float"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden'
          }}
        />
      </div>
    </div>
  );
}

export default NuxCoinDisplay;
