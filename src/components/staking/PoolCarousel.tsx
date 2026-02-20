/**
 * PoolCarousel - Mobile swipeable carousel for StakingPoolChart and TreasuryPoolChart
 * Desktop: shows normal grid layout
 * Mobile: swipeable carousel with snap points
 */

import { useState, useRef, useEffect } from 'react';
import { StakingPoolChart } from './StakingPoolChart';
import { TreasuryPoolChart } from './TreasuryPoolChart';

// Dot indicator component
function CarouselDots({ 
  total, 
  current, 
  onSelect 
}: { 
  total: number; 
  current: number; 
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === current
              ? 'bg-[#8b5cf6] w-6'
              : 'bg-white/20 hover:bg-white/40'
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

// Slide labels
const SLIDE_LABELS = [
  { title: 'Staking Pool', color: '#10b981' },
  { title: 'Treasury Pool', color: '#8b5cf6' }
];

export function PoolCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Touch/mouse drag handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Handle snap scrolling
    const handleScroll = () => {
      if (!container || isDragging) return;
      
      const slideWidth = container.offsetWidth;
      const newIndex = Math.round(container.scrollLeft / slideWidth);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < 2) {
        setCurrentIndex(newIndex);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      startX.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
      if (!isDragging) return;
      e.preventDefault();
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      container.scrollLeft = scrollLeft.current - walk;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.stopPropagation();
      setIsDragging(false);
      // Snap to nearest slide
      const slideWidth = container.offsetWidth;
      const newIndex = Math.round(container.scrollLeft / slideWidth);
      const clampedIndex = Math.max(0, Math.min(1, newIndex));
      
      container.scrollTo({
        left: clampedIndex * slideWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(clampedIndex);
    };

    // Mouse events for desktop drag
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      startX.current = e.pageX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      container.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      container.style.cursor = 'grab';
      
      const slideWidth = container.offsetWidth;
      const newIndex = Math.round(container.scrollLeft / slideWidth);
      const clampedIndex = Math.max(0, Math.min(1, newIndex));
      
      container.scrollTo({
        left: clampedIndex * slideWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(clampedIndex);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isDragging, currentIndex]);

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    if (!containerRef.current) return;
    const slideWidth = containerRef.current.offsetWidth;
    containerRef.current.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  return (
    <div 
      className="w-full"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Header with current slide indicator */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: SLIDE_LABELS[currentIndex].color }}
          />
          <h3 className="jersey-15-regular text-lg lg:text-xl font-bold text-white">
            {SLIDE_LABELS[currentIndex].title}
          </h3>
        </div>
        <span className="jersey-20-regular text-xs lg:text-sm text-white/40">
          {currentIndex + 1} / 2
        </span>
      </div>

      {/* Carousel container - with touch-action for horizontal scroll only */}
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-x'
        }}
      >
        {/* Slide 1 - Staking Pool */}
        <div className="w-full flex-shrink-0 snap-center">
          <div className="transform-gpu">
            <StakingPoolChart />
          </div>
        </div>

        {/* Slide 2 - Treasury Pool */}
        <div className="w-full flex-shrink-0 snap-center">
          <div className="transform-gpu">
            <TreasuryPoolChart />
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <CarouselDots 
        total={2} 
        current={currentIndex} 
        onSelect={goToSlide}
      />

      {/* Swipe hint */}
      <p className="text-center jersey-20-regular text-xs lg:text-sm text-white/30 mt-3">
        ← Swipe to switch →
      </p>
    </div>
  );
}

export default PoolCarousel;
