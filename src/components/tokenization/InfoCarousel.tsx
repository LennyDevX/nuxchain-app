import { useState, useRef, useEffect, memo, useMemo } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    if (Math.abs(diffX) > 50) { // Minimum swipe distance
      if (diffX > 0 && activeTab < tabs.length - 1) {
        setActiveTab(activeTab + 1);
      } else if (diffX < 0 && activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => document.removeEventListener('mouseup', handleMouseUpGlobal);
  }, []);

  return (
    <div className="w-full">
      {/* Tab Content with Touch/Swipe Support */}
      <div 
        ref={carouselRef}
        className="relative min-h-[400px] md:min-h-[500px] overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeTab * 100}%)` }}
        >
          {tabs.map((tab) => (
            <div key={tab.id} className="w-full flex-shrink-0">
              {tab.component}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 gap-3">
        {tabs.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeTab === index
                ? 'bg-white w-8'
                : 'bg-white/40 w-2 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ✅ React 19 Best Practice: Export memoized component
export default memo(InfoCarousel);