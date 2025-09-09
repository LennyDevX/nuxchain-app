import React from 'react';
import '../styles/AnimatedAILogo.css';

interface AnimatedAILogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const AnimatedAILogo: React.FC<AnimatedAILogoProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`ai-logo-avatar ${sizeClasses[size]} ${className}`}>
      <div className="ai-logo-core">
        <div className="ai-logo-pulse"></div>
        <div className="ai-logo-inner"></div>
      </div>
    </div>
  );
};

export default AnimatedAILogo;
