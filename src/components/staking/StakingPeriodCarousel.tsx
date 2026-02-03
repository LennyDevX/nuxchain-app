import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface LockupOption {
  value: string;
  label: string;
  description: string;
  roi?: {
    daily: string;
    monthly: string;
    annual: string;
  };
}

interface StakingPeriodCarouselProps {
  value: string;
  onChange: (value: string) => void;
  options: LockupOption[];
  label: string;
  className?: string;
}

export default function StakingPeriodCarousel({
  value,
  onChange,
  options,
  label,
  className = ''
}: StakingPeriodCarouselProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Get active index from the value prop directly - no setState needed
  const activeIndex = options.findIndex(option => option.value === value);
  const normalizedIndex = activeIndex >= 0 ? activeIndex : 0;

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent parent handlers from firing
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent parent handlers from firing
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent parent handlers from firing
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && normalizedIndex < options.length - 1) {
      onChange(options[normalizedIndex + 1].value);
    }
    if (isRightSwipe && normalizedIndex > 0) {
      onChange(options[normalizedIndex - 1].value);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // ✅ Auto-scroll active item into view - SAME BEHAVIOR as StakingForm tabs
  useEffect(() => {
    // Only auto-scroll in mobile view with horizontal scrolling
    if (isMobile && carouselRef.current) {
      // Get the container that holds all buttons (the flex container)
      const flexContainer = carouselRef.current.querySelector('.flex.min-w-max') as HTMLElement;
      if (flexContainer && flexContainer.children[normalizedIndex]) {
        const activeButton = flexContainer.children[normalizedIndex] as HTMLElement;
        // Scroll to center the active button
        activeButton.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [value, isMobile, normalizedIndex]); // React to value changes

  // Get the selected option
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  if (!isMobile) {
    // Desktop view - show as cards with APY prominently
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.label
          className="block text-sm font-medium text-white/80 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {options.map((option, index) => (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-4 rounded-lg border transition-all duration-300 text-left ${index === options.length - 1 ? 'col-span-2' : ''} ${option.value === value
                ? 'bg-blue-500/20 border-blue-500/50 text-white transform scale-105'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
              whileHover={{ scale: 1.05, borderColor: option.value === value ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <motion.h4
                    className="font-medium"
                    whileHover={{ color: '#60a5fa' }}
                  >
                    {option.label}
                  </motion.h4>
                  <p className="text-xs text-white/60 mt-1">{option.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">APY</div>
                  <div className="text-xs text-white/60">See ROI below</div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
        {selectedOption.roi && (
          <motion.div
            className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-white font-semibold text-sm mb-2">📊 Earnings Breakdown:</p>
            <motion.div
              className="grid grid-cols-3 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.08 }}
              >
                <p className="text-green-400 font-bold">{selectedOption.roi.daily}</p>
                <p className="text-white/60 text-xs">Daily</p>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.08 }}
              >
                <p className="text-blue-400 font-bold">{selectedOption.roi.monthly}</p>
                <p className="text-white/60 text-xs">Monthly</p>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.08 }}
              >
                <p className="text-purple-400 font-bold">{selectedOption.roi.annual}</p>
                <p className="text-white/60 text-xs">Annual</p>
              </motion.div>
            </motion.div>
            <motion.p
              className="text-yellow-400 text-xs mt-3 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              ⚠️ Funds are locked for the selected period. Longer = Higher rewards but less liquidity.
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Mobile view - show as carousel
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.label
        className="block text-sm font-medium text-white/80 mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.label>

      {/* Carousel for selecting periods */}
      <div
        ref={carouselRef}
        className="overflow-x-auto scrollbar-hide py-2 px-1 mb-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex min-w-max gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {options.map((option, index) => (
            <motion.button
              key={option.value}
              onClick={() => {
                onChange(option.value);
              }}
              className={`px-4 py-3 rounded-lg border transition-all duration-300 text-center whitespace-nowrap min-w-[120px] ${index === normalizedIndex
                  ? 'bg-blue-500/20 border-blue-500/50 text-white transform scale-105 shadow-lg shadow-blue-500/10'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <h4 className="font-medium">{option.label}</h4>
              <p className="text-xs text-white/60 mt-1">{option.description}</p>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Selected option details */}
      {selectedOption.roi && (
        <motion.div
          className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="text-blue-400 text-sm font-medium mb-1">
            📈 Estimated ROI:
          </p>
          <p className="text-white/80 text-sm">
            Daily: {selectedOption.roi.daily} | Monthly: {selectedOption.roi.monthly} | Annual: {selectedOption.roi.annual}
          </p>
          <motion.p
            className="text-yellow-400 text-xs mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            ⚠️ Longer periods = Higher ROI but funds locked
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}