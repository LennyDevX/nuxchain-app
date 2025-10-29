import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Benefits from './Benefits';
import FAQ from './FAQ';
import TechnicalDetails from './TechnicalDetails';

// ✅ React 19 Best Practice: Memoize child components to prevent unnecessary re-renders
const MemoizedBenefits = memo(Benefits);
const MemoizedFAQ = memo(FAQ);
const MemoizedTechnicalDetails = memo(TechnicalDetails);

function InfoCarousel() {
  const [activeTab, setActiveTab] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);

  // ✅ React 19 Best Practice: useMemo for tabs array to prevent recreation
  const tabs = useMemo(() => [
    {
      id: 0,
      title: 'Why Create NFTs?',
      icon: '🌟',
      component: <MemoizedBenefits />
    },
    {
      id: 1,
      title: 'FAQ',
      icon: '❓',
      component: <MemoizedFAQ />
    },
    {
      id: 2,
      title: 'Technical Details',
      icon: '🔧',
      component: <MemoizedTechnicalDetails />
    }
  ], []);

  // Proper swipe detection with threshold
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // Minimum swipe distance (30px) and maximum duration (500ms) to detect a valid swipe
    const swipeDistance = touchStartXRef.current - touchEndX;
    const minSwipeDistance = 30;
    const maxSwipeDuration = 500;
    
    // Detectar swipe válido solo si es un gesto rápido y con distancia mínima
    if (Math.abs(swipeDistance) > minSwipeDistance && touchDuration < maxSwipeDuration) {
      if (swipeDistance > 0 && activeTab < tabs.length - 1) {
        // Swipe izquierda → siguiente slide
        setActiveTab(activeTab + 1);
      } else if (swipeDistance < 0 && activeTab > 0) {
        // Swipe derecha → slide anterior
        setActiveTab(activeTab - 1);
      }
    }
  }, [activeTab, tabs.length]);

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeTab > 0) {
        setActiveTab(activeTab - 1);
      } else if (e.key === 'ArrowRight' && activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs.length]);

  return (
    <div className="w-full">
      {/* Tab Content with Native Touch/Swipe Support */}
      <div 
        ref={carouselRef}
        className="relative min-h-[320px] sm:min-h-[360px] md:min-h-[400px] overflow-hidden pb-12 sm:pb-14 md:pb-8 transition-all duration-300 touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        {/* Carousel slides with smooth transition */}
        <motion.div 
          className="flex h-full"
          animate={{ x: `calc(-${activeTab * 100}%)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {tabs.map((tab) => (
            <div key={tab.id} className="w-full flex-shrink-0">
              {tab.component}
            </div>
          ))}
        </motion.div>

        {/* Navigation Dots with improved styling and spacing */}
        <motion.div 
          className="absolute bottom-3 sm:bottom-4 md:bottom-3 left-1/2 -translate-x-1/2 flex justify-center items-center gap-3 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tabs.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveTab(index)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`transition-all duration-300 rounded-full ${
                activeTab === index
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-2 h-2 shadow-lg shadow-purple-400/50'
                  : 'bg-white/40 w-1.5 h-1.5 hover:bg-white/60'
              }`}
              aria-label={`Go to ${tabs[index].title}`}
              aria-current={activeTab === index}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ✅ React 19 Best Practice: Export memoized component
export default memo(InfoCarousel);