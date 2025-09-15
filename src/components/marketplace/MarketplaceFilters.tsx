import React, { useState, useEffect } from 'react';

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
};

interface MarketplaceFiltersProps {
  categories: { name: string; count: number; icon: string; }[];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (field: 'price' | 'name' | 'date') => void;
  currentFilters: {
    category: string;
    priceRange: { min: number; max: number };
    searchQuery: string;
    sortBy: string;
  };
  className?: string;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Recently Listed' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'name', label: 'Name: A to Z' }
];

export default function MarketplaceFilters({
  categories,
  onCategoryChange,
  onPriceRangeChange,
  onSearchChange,
  onSortChange,
  currentFilters,
  className = '',
  isLoading = false
}: MarketplaceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery);
  const [priceMin, setPriceMin] = useState(currentFilters.priceRange.min.toString());
  const [priceMax, setPriceMax] = useState(
    currentFilters.priceRange.max === Infinity ? '' : currentFilters.priceRange.max.toString()
  );
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const isMobile = useIsMobile();
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile); // Desktop expanded by default, mobile collapsed
  
  // Update filters expanded state when screen size changes
  useEffect(() => {
    setFiltersExpanded(!isMobile);
  }, [isMobile]);

  // Update local state when filters change externally
  useEffect(() => {
    setSearchQuery(currentFilters.searchQuery);
    setPriceMin(currentFilters.priceRange.min.toString());
    setPriceMax(
      currentFilters.priceRange.max === Infinity ? '' : currentFilters.priceRange.max.toString()
    );
  }, [currentFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handlePriceFilter = () => {
    const min = parseFloat(priceMin) || 0;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    onPriceRangeChange(min, max);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceMin('0');
    setPriceMax('');
    onSearchChange('');
    onCategoryChange('all');
    onPriceRangeChange(0, Infinity);
  };

  const hasActiveFilters = 
    currentFilters.category !== 'all' ||
    currentFilters.searchQuery !== '' ||
    currentFilters.priceRange.min > 0 ||
    currentFilters.priceRange.max !== Infinity;

  const formatCategoryName = (category: string) => {
    if (category === 'all') return 'All Categories';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };



  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          {/* Search Bar Skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
            {isMobile && (
              <div className="w-20 h-12 bg-white/10 rounded-xl"></div>
            )}
          </div>
          
          {/* Filters Container Skeleton */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="space-y-4">
              {/* Categories Skeleton */}
              <div>
                <div className="w-20 h-4 bg-white/10 rounded mb-2"></div>
                <div className="w-full h-12 bg-white/10 rounded-lg"></div>
              </div>
              
              {/* Sort Options Skeleton */}
              <div>
                <div className="w-16 h-4 bg-white/10 rounded mb-2"></div>
                <div className="w-full h-10 bg-white/10 rounded-lg"></div>
              </div>
              
              {/* Price Range Skeleton */}
              <div>
                <div className="w-24 h-4 bg-white/10 rounded mb-2"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-white/10 rounded-lg"></div>
                  <div className="h-10 bg-white/10 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar - Always Visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
            🔍
          </span>
        </div>
        
        {/* Filter Toggle Button - Only visible on mobile */}
        {isMobile && (
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={`px-4 py-3 rounded-xl border transition-all duration-300 ease-in-out flex items-center gap-2 transform hover:scale-105 ${
              filtersExpanded || hasActiveFilters
                ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${
                filtersExpanded ? 'rotate-180' : 'rotate-0'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>

            {hasActiveFilters && (
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
      </div>

      {/* Active Filters Preview - Compact (only on mobile when collapsed) */}
      {hasActiveFilters && !filtersExpanded && isMobile && (
        <div className="flex flex-wrap gap-2 animate-fadeIn">
          {currentFilters.category !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all duration-200 hover:bg-purple-500/30">
              {formatCategoryName(currentFilters.category)}
              <button
                onClick={() => onCategoryChange('all')}
                className="ml-1 text-purple-300 hover:text-white transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
          {(currentFilters.priceRange.min > 0 || currentFilters.priceRange.max !== Infinity) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 transition-all duration-200 hover:bg-green-500/30">
              {currentFilters.priceRange.min} - {currentFilters.priceRange.max === Infinity ? '∞' : currentFilters.priceRange.max} POL
              <button
                onClick={() => onPriceRangeChange(0, Infinity)}
                className="ml-1 text-green-300 hover:text-white transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        filtersExpanded 
          ? 'max-h-screen opacity-100 transform translate-y-0' 
          : 'max-h-0 opacity-0 transform -translate-y-4'
      }`}>
        <div className={`space-y-4 p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 ${
          filtersExpanded ? 'shadow-lg shadow-black/20' : ''
        }`}>
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white/80">
              Categories
            </label>
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {categoriesExpanded ? '▲' : '▼'}
              </button>
            </div>
            
            {/* Selected Category Display (Collapsed) */}
            {!categoriesExpanded && (
              <div className="mb-3">
                <button
                  onClick={() => setCategoriesExpanded(true)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    currentFilters.category === 'all'
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{currentFilters.category === 'all' ? '📁' : categories.find(cat => cat.name === currentFilters.category)?.icon || '📁'}</span>
                      <span className="text-sm font-medium">{formatCategoryName(currentFilters.category)}</span>
                    </div>
                    <span className="text-xs text-white/40">▼</span>
                  </div>
                </button>
              </div>
            )}
            
            {/* Categories List */}
            {categoriesExpanded && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    setCategoriesExpanded(false);
                  }}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    currentFilters.category === 'all'
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>📁</span>
                      <span className="text-sm font-medium">All Categories</span>
                    </div>
                    <span className="text-xs text-white/40">{categories.reduce((sum, cat) => sum + cat.count, 0)}</span>
                  </div>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      onCategoryChange(category.name);
                      setCategoriesExpanded(false);
                    }}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      currentFilters.category === category.name
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs text-white/40">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Sort by
            </label>
            <select
              value={currentFilters.sortBy}
              onChange={(e) => onSortChange(e.target.value as 'price' | 'name' | 'date')}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Price Range (POL)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={handlePriceFilter}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={handlePriceFilter}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-white/60 hover:text-white transition-colors border border-white/20 rounded-lg hover:bg-white/5"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
