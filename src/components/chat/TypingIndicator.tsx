import React from 'react';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  isVisible?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isVisible = true,
  size = 'medium'
}) => {
  if (!isVisible) return null;

  // Minimalista: tres puntos con movimiento suave
  const dotVariants: Variants = {
    animate: (custom: number) => ({
      y: [0, -8, 0],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: custom * 0.12
      }
    })
  };

  const sizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5'
  };

  const spacingClasses = {
    small: 'space-x-1',
    medium: 'space-x-1.5',
    large: 'space-x-2'
  };

  return (
    <motion.div
      className={`flex items-center ${spacingClasses[size]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-b from-pink-400 via-purple-400 to-blue-400`}
          custom={index}
          variants={dotVariants}
          animate="animate"
          style={{
            boxShadow: '0 0 8px rgba(236, 72, 153, 0.6)'
          }}
        />
      ))}
    </motion.div>
  );
};

export default TypingIndicator;
