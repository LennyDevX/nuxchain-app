import React from 'react';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Layer 1 - Deep space base, brighter purple-tinted */}
      <div
        className="fixed inset-0 z-0 w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #2a1a4a 0%, #1a1030 45%, #0d0b1a 100%)'
        }}
      />

      {/* Layer 2 - Subtle nebula: soft purple left, soft red-pink right */}
      <div
        className="fixed inset-0 z-0 w-full h-full"
        style={{
          background:
            'radial-gradient(ellipse at 15% 40%, rgba(120, 40, 220, 0.18) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 85% 60%, rgba(200, 50, 160, 0.14) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 50% 100%, rgba(60, 20, 160, 0.12) 0%, transparent 55%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

export default GlobalBackground;
