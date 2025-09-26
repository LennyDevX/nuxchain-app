import React, { useState, useRef, useEffect } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(options.findIndex(option => option.value === value));
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Ensure activeIndex is valid
  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= options.length) {
      setActiveIndex(0);
      onChange(options[0].value);
    }
  }, [activeIndex, options, onChange]);
  
  // Update activeIndex when value prop changes externally
  useEffect(() => {
    const newIndex = options.findIndex(option => option.value === value);
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [value, options, activeIndex]);
  
  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && activeIndex < options.length - 1) {
      setActiveIndex(activeIndex + 1);
      onChange(options[activeIndex + 1].value);
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      onChange(options[activeIndex - 1].value);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };
  
  // Auto-scroll active item into view
  useEffect(() => {
    if (isMobile && carouselRef.current) {
      const activeItem = carouselRef.current.children[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeIndex, isMobile]);
  
  // Get the selected option
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  
  if (!isMobile) {
    // Desktop view - show as cards
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                option.value === value
                  ? 'bg-blue-500/20 border-blue-500/50 text-white transform scale-105'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <h4 className="font-medium">{option.label}</h4>
              <p className="text-xs text-white/60 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
        {selectedOption.roi && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm font-medium mb-1">
              📈 Estimated ROI:
            </p>
            <p className="text-white/80 text-sm">
              Daily: {selectedOption.roi.daily} | Monthly: {selectedOption.roi.monthly} | Annual: {selectedOption.roi.annual}
            </p>
            <p className="text-yellow-400 text-xs mt-1">
              ⚠️ Longer periods = Higher ROI but funds locked
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Mobile view - show as carousel
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white/80 mb-2">
        {label}
      </label>
      
      {/* Carousel for selecting periods */}
      <div
        ref={carouselRef}
        className="overflow-x-auto scrollbar-hide py-2 px-1 mb-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex min-w-max gap-2">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => {
                setActiveIndex(index);
                onChange(option.value);
              }}
              className={`px-4 py-3 rounded-lg border transition-all duration-300 text-center whitespace-nowrap min-w-[120px] ${
                index === activeIndex
                  ? 'bg-blue-500/20 border-blue-500/50 text-white transform scale-105 shadow-lg shadow-blue-500/10'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <h4 className="font-medium">{option.label}</h4>
              <p className="text-xs text-white/60 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected option details */}
      {selectedOption.roi && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm font-medium mb-1">
            📈 Estimated ROI:
          </p>
          <p className="text-white/80 text-sm">
            Daily: {selectedOption.roi.daily} | Monthly: {selectedOption.roi.monthly} | Annual: {selectedOption.roi.annual}
          </p>
          <p className="text-yellow-400 text-xs mt-1">
            ⚠️ Longer periods = Higher ROI but funds locked
          </p>
        </div>
      )}
    </div>
  );
}