import React, { useMemo } from 'react';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  // Memoize star positions to prevent re-rendering
  const farStars = useMemo(() => 
    Array.from({ length: 150 }, (_, i) => ({
      id: `star-far-${i}`,
      width: Math.random() * 1 + 0.5,
      height: Math.random() * 1 + 0.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.6 + 0.2,
      animationDelay: Math.random() * 3,
      animationDuration: Math.random() * 2 + 2
    })), []
  );

  const midStars = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => ({
      id: `star-mid-${i}`,
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.8 + 0.3,
      boxShadow: Math.random() * 4 + 2,
      animationDuration: Math.random() * 3 + 2
    })), []
  );

  const brightStars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: `star-bright-${i}`,
      width: Math.random() * 3 + 2,
      height: Math.random() * 3 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.9 + 0.4,
      boxShadow1: Math.random() * 8 + 4,
      boxShadow2: Math.random() * 16 + 8,
      animationDuration: Math.random() * 4 + 3
    })), []
  );

  const shootingStars = useMemo(() => 
    Array.from({ length: 3 }, (_, i) => ({
      id: `shooting-star-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 50,
      animationDuration: Math.random() * 3 + 4,
      animationDelay: Math.random() * 10
    })), []
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Deep space base background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 50%, #000000 100%)'
        }}
      ></div>
      
      {/* Background nebula */}
      <div 
        className="fixed inset-0 opacity-30 animate-gradient-flow z-0" 
        style={{ 
          background: 'radial-gradient(circle at 20% 30%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 0, 139, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(25, 25, 112, 0.25) 0%, transparent 50%)',
          backgroundSize: '100% 100%',
          animation: 'nebula-drift 20s ease-in-out infinite alternate'
        }}
      ></div>
      
      {/* Star field - Layer 1 (distant stars) */}
      <div className="fixed inset-0 z-0">
        {farStars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: star.width + 'px',
              height: star.height + 'px',
              left: star.left + '%',
              top: star.top + '%',
              opacity: star.opacity,
              animationDelay: star.animationDelay + 's',
              animationDuration: star.animationDuration + 's'
            }}
          />
        ))}
      </div>
      
      {/* Star field - Layer 2 (medium stars) */}
      <div className="fixed inset-0 z-0">
        {midStars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              width: star.width + 'px',
              height: star.height + 'px',
              left: star.left + '%',
              top: star.top + '%',
              opacity: star.opacity,
              boxShadow: `0 0 ${star.boxShadow}px rgba(255, 255, 255, 0.8)`,
              animation: `twinkle ${star.animationDuration}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>
      
      {/* Star field - Layer 3 (bright stars) */}
      <div className="fixed inset-0 z-0">
        {brightStars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              width: star.width + 'px',
              height: star.height + 'px',
              left: star.left + '%',
              top: star.top + '%',
              opacity: star.opacity,
              boxShadow: `0 0 ${star.boxShadow1}px rgba(255, 255, 255, 0.9), 0 0 ${star.boxShadow2}px rgba(255, 255, 255, 0.4)`,
              animation: `bright-twinkle ${star.animationDuration}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>
      
      {/* Occasional shooting stars */}
      <div className="fixed inset-0 z-0">
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute"
            style={{
              left: star.left + '%',
              top: star.top + '%',
              animation: `shooting-star ${star.animationDuration}s linear infinite`,
              animationDelay: star.animationDelay + 's'
            }}
          >
            <div 
              className="w-1 h-1 bg-white rounded-full"
              style={{
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.8), -100px 0 20px rgba(255, 255, 255, 0.3)'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Orbes de energía cósmica */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float"
             style={{ animationDuration: '12s', animationDelay: '0s' }}></div>
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl animate-float"
             style={{ animationDuration: '15s', animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-600/6 rounded-full blur-2xl animate-float"
             style={{ animationDuration: '18s', animationDelay: '6s' }}></div>
      </div>
      
      {/* Contenido con z-index alto */}
      <div className="relative z-10">
        {children}
      </div>
      
      <style>{`
        @keyframes nebula-drift {
          0% { transform: translateX(-10px) translateY(-5px) scale(1); }
          100% { transform: translateX(10px) translateY(5px) scale(1.05); }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        @keyframes bright-twinkle {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        
        @keyframes shooting-star {
          0% { transform: translateX(0) translateY(0) rotate(45deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(300px) translateY(300px) rotate(45deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default GlobalBackground;