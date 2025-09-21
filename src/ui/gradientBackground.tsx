import React from 'react';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
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
      
      
    </div>
  );
};

export default GlobalBackground;