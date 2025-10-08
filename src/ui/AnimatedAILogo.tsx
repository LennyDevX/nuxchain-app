import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/AnimatedAILogo.css';

interface AIAgentSphereProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  onClick?: () => void;
}

const AIAgentSphere: React.FC<AIAgentSphereProps> = ({ 
  size = 'medium',
  className = '',
  onClick,
}) => {
  const [isActive, setIsActive] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    xlarge: 'w-64 h-64'
  };

  const handleClick = () => {
    // React immediate: set active quickly so CSS .active accelerates internal animations
    setIsActive(true);
    onClick?.();

    // Keep active for a short responsive burst, then return to normal animations
    setTimeout(() => setIsActive(false), 1200); // faster reaction window (1.2s)
  };

  // Advanced fluid wave animations with Framer Motion
  const waveVariants = {
    wave1: {
      scale: [1, 1.5, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: isActive ? 0.6 : 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    wave2: {
      scale: [1, 1.5, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: isActive ? 0.6 : 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.7
      }
    },
    wave3: {
      scale: [1, 1.5, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: isActive ? 0.6 : 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.4
      }
    }
  };


  const containerVariants = {
    hover: { 
      scale: 0.80,
      filter: "blur(0.5px)",
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 16, 
        mass: 0.7,
        duration: 8.0
      }
    },
    tap: { 
      scale: 0.97,
      transition: { type: "spring", stiffness: 200, damping: 18, duration: 0.18 }
    }
  };

  return (
    <motion.div 
      className={`ai-sphere-container ${sizeClasses[size]} ${className} ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      variants={containerVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Main glass sphere */}
      <div className="ai-sphere-main">
        {/* Primary neural nodes (3 large particles) */}
        <motion.div 
          className="ai-sphere-gradient-1"
          variants={waveVariants}
          animate="wave1"
        />
        
        <motion.div 
          className="ai-sphere-gradient-2"
          variants={waveVariants}
          animate="wave2"
        />
        
        <motion.div 
          className="ai-sphere-gradient-3"
          variants={waveVariants}
          animate="wave3"
        />
        
        {/* Medium particles */}
        <div className="ai-sphere-core" />
        <div className="ai-sphere-core-pulse" />
        
        {/* Additional free-floating particles (20 more) */}
        {[...Array(20)].map((_, i) => {
          // Recompute durations on each render; include isActive in key to remount when active toggles
          const rand = Math.random();
          const duration = isActive ? (0.6 + rand * 0.8) : (6 + rand * 4);
          return (
            <motion.div
              key={`particle-${i}-${isActive ? 'active' : 'idle'}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                top: `${15 + Math.random() * 70}%`,
                left: `${15 + Math.random() * 70}%`,
                background: `radial-gradient(circle, ${
                  i % 3 === 0 
                    ? 'rgba(99, 102, 241, 0.9)' 
                    : i % 3 === 1 
                    ? 'rgba(168, 85, 247, 0.8)' 
                    : 'rgba(236, 72, 153, 0.7)'
                } 0%, transparent 100%)`,
                boxShadow: `0 0 ${6 + Math.random() * 6}px ${
                  i % 3 === 0 
                    ? 'rgba(99, 102, 241, 0.8)' 
                    : i % 3 === 1 
                    ? 'rgba(168, 85, 247, 0.7)' 
                    : 'rgba(236, 72, 153, 0.6)'
                }`,
                zIndex: 2,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * (isActive ? 80 : 40), (Math.random() - 0.5) * (isActive ? 80 : 40), 0],
                y: [0, (Math.random() - 0.5) * (isActive ? 80 : 40), (Math.random() - 0.5) * (isActive ? 80 : 40), 0],
                scale: [1, 1.2 + Math.random() * 0.6, 0.8 + Math.random() * 0.6, 1],
                opacity: [0.4 + Math.random() * 0.3, 1, 0.5 + Math.random() * 0.3, 0.4 + Math.random() * 0.3],
                rotate: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0]
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * (isActive ? 0.2 : 2),
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIAgentSphere;

