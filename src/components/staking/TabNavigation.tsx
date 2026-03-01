/**
 * TabNavigation - Navigation system for staking interface
 * Tabs: Overview, My Deposit, Skills, Active Quest
 * Desktop: Horizontal tabs with animated indicator
 * Mobile: Sticky tabs + swipe gestures
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function TabNavigation({ tabs, defaultTab, className = '' }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active tab into center view on mobile
  const scrollTabIntoView = (tabId: string) => {
    const container = containerRef.current;
    const tabElement = tabRefs.current[tabId];
    
    if (container && tabElement) {
      const containerWidth = container.offsetWidth;
      const tabLeft = tabElement.offsetLeft;
      const tabWidth = tabElement.offsetWidth;
      
      // Center the tab
      const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll active tab into view when it changes
  useEffect(() => {
    scrollTabIntoView(activeTab);
  }, [activeTab]);

  // Handle swipe gestures for mobile - DESHABILITADO para evitar interferencia con StakingForm
  const handleTouchStart = () => {
    // No-op: deshabilitado para evitar conflicto con tabs internos de StakingForm
    return;
  };

  const handleTouchMove = () => {
    // No-op: deshabilitado para evitar conflicto con tabs internos de StakingForm
    return;
  };

  const handleTouchEnd = () => {
    // No-op: deshabilitado para evitar conflicto con tabs internos de StakingForm
    return;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/10 mb-4 rounded-t-xl">
        <div className="relative">
          {/* Tabs Container */}
          <div 
            ref={containerRef}
            className="flex items-center gap-1 px-2 overflow-x-auto scrollbar-hide md:justify-center"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 jersey-15-regular text-lg lg:text-xl font-medium transition-all duration-200
                  whitespace-nowrap focus:outline-none rounded-lg flex-shrink-0
                  md:flex-1 md:px-8 md:py-4 md:text-2xl lg:text-3xl
                  ${
                    activeTab === tab.id
                      ? 'text-white bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/40'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {tab.icon && <span className="text-lg lg:text-xl">{tab.icon}</span>}
                  <span className="jersey-15-regular">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content - only mount the active tab to avoid multiple wallet hook instances */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        {tabs.map((tab) => (
          activeTab === tab.id ? (
            <div key={tab.id} className="min-h-[400px]">
              {tab.content}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;
