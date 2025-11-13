import React, { useState, useCallback } from 'react';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import '../styles/AnimatedAILogo.css';

interface AIAgentSphereProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  onClick?: () => void;
}

// Pre-generate particle data to avoid impure Math.random() during render
interface ParticleData {
  id: number;
  width: number;
  height: number;
  top: number;
  left: number;
  colorIndex: number;
  xOffsets: [number, number, number, number];
  yOffsets: [number, number, number, number];
  scaleValues: [number, number, number, number];
  opacityValues: [number, number, number, number];
  rotateValues: [number, number, number, number];
  delay: number;
  glowSize: number;
}

// Generate stable particle data outside component
const generateParticleData = (count: number): ParticleData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    width: 3 + Math.random() * 4,
    height: 3 + Math.random() * 4,
    top: 15 + Math.random() * 70,
    left: 15 + Math.random() * 70,
    colorIndex: i % 3,
    xOffsets: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0] as [number, number, number, number],
    yOffsets: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0] as [number, number, number, number],
    scaleValues: [1, 1.2 + Math.random() * 0.6, 0.8 + Math.random() * 0.6, 1] as [number, number, number, number],
    opacityValues: [0.4 + Math.random() * 0.3, 1, 0.5 + Math.random() * 0.3, 0.4 + Math.random() * 0.3] as [number, number, number, number],
    rotateValues: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0] as [number, number, number, number],
    delay: Math.random() * 2,
    glowSize: 6 + Math.random() * 6,
  }));
};

// Generate mobile and desktop variants
const mobileParticles = generateParticleData(5);
const desktopParticles = generateParticleData(12);

// Color palette by index
const colorPalette = [
  { bg: 'rgba(99, 102, 241, 0.9)', glow: 'rgba(99, 102, 241, 0.8)' },
  { bg: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.7)' },
  { bg: 'rgba(236, 72, 153, 0.7)', glow: 'rgba(236, 72, 153, 0.6)' }
];

const AIAgentSphere: React.FC<AIAgentSphereProps> = ({ 
  size = 'medium',
  className = '',
  onClick,
}) => {
  const [isActive, setIsActive] = useState(false);
  const isMobile = useIsMobile();

  // Derive particles from isMobile - better than useState + useEffect
  const particles = isMobile ? mobileParticles : desktopParticles;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    xlarge: 'w-64 h-64'
  };

  const handleClick = useCallback(() => {
    setIsActive(true);
    onClick?.();
    setTimeout(() => setIsActive(false), 1200);
  }, [onClick]);

  // Wave animation variants with proper Framer Motion types
  const waveVariants: Variants = {
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

  // Container animations with proper typing
  const containerVariants: Variants = {
    hover: {
      scale: 0.80,
      filter: "blur(0.5px)"
    },
    tap: {
      scale: 0.97
    }
  };

  return (
    <motion.div 
      className={`ai-sphere-container ${sizeClasses[size]} ${className} ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      variants={containerVariants}
      whileHover="hover"
      whileTap="tap"
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 16,
        mass: 0.7
      }}
    >
      {/* Main glass sphere */}
      <div className="ai-sphere-main">
        {/* Primary neural nodes (3 large particles with wave animation) */}
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
        
        {/* Free-floating particles with pre-generated data */}
        {particles.map((particle) => {
          const color = colorPalette[particle.colorIndex];
          const duration = isActive ? (0.6 + particle.delay * 0.8) : (6 + particle.delay * 4);
          
          return (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                background: `radial-gradient(circle, ${color.bg} 0%, transparent 100%)`,
                boxShadow: `0 0 ${particle.glowSize}px ${color.glow}`,
                zIndex: 2,
                willChange: 'transform, opacity'
              }}
              animate={{
                x: particle.xOffsets,
                y: particle.yOffsets,
                scale: particle.scaleValues,
                opacity: particle.opacityValues,
                rotate: particle.rotateValues
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay,
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIAgentSphere;

