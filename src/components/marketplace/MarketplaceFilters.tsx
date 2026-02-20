import React, { useState, useMemo, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import ModernSelect from '../ui/ModernSelect';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useDebounce } from '../../hooks/performance/useDebounce';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { SkeletonLoader } from '../ui/SkeletonLoader';

interface MarketplaceFiltersProps {
  categories: { name: string; count: number; icon: string; }[];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (field: 'price' | 'name' | 'date') => void;
  onNFTTypeChange: (type: string) => void; // NEW
  currentFilters: {
    category: string;
    priceRange: { min: number; max: number };
    searchQuery: string;
    sortBy: string;
    nftType?: string; // NEW
  };
  className?: string;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Recently Listed', icon: '🆕' },
  { value: 'price', label: 'Price: Low to High', icon: '💰' },
  { value: 'name', label: 'Name: A to Z', icon: '🔤' }
];

// NEW: NFT Type filter options
const NFT_TYPE_OPTIONS = [
  { value: 'all', label: 'All NFTs', icon: '📦' },
  { value: 'skill', label: 'Skill NFTs', icon: '⚡' },
  { value: 'standard', label: 'Standard NFTs', icon: '🖼️' }
];

export default memo(function MarketplaceFilters({
  categories,
  onCategoryChange,
  onPriceRangeChange,
  onSearchChange,
  onSortChange,
  onNFTTypeChange,
  currentFilters,
  className = '',
  isLoading = false
}: MarketplaceFiltersProps) {
  // 🎯 Estado local con debounce para búsqueda
  const [searchInput, setSearchInput] = useState(currentFilters.searchQuery);
  const debouncedSearch = useDebounce(searchInput, 300);
  
  const [priceMin, setPriceMin] = useState(currentFilters.priceRange.min.toString());
  const [priceMax, setPriceMax] = useState(
    currentFilters.priceRange.max === Infinity ? '' : currentFilters.priceRange.max.toString()
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // 📳 Haptic feedback
  const triggerHaptic = useTapFeedback();

  // 🔄 Efecto para aplicar búsqueda debounced
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // 🎨 Memoizar opciones de categoría
  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories', icon: '🎨' },
    ...categories.map(cat => ({
      value: cat.name,
      label: `${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} (${cat.count})`,
      icon: cat.icon
    }))
  ], [categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const handlePriceFilter = () => {
    const min = parseFloat(priceMin) || 0;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    onPriceRangeChange(min, max);
    setIsPriceOpen(false);
    triggerHaptic('medium'); // 📳 Feedback al aplicar filtro
  };

  const clearFilters = () => {
    setSearchInput('');
    setPriceMin('0');
    setPriceMax('');
    onSearchChange('');
    onCategoryChange('all');
    onPriceRangeChange(0, Infinity);
    triggerHaptic('light'); // 📳 Feedback al limpiar
  };

  const handleFilterToggle = () => {
    setIsFilterOpen(!isFilterOpen);
    triggerHaptic('light'); // 📳 Feedback al toggle
  };

  const hasActiveFilters = 
    currentFilters.category !== 'all' ||
    currentFilters.searchQuery !== '' ||
    currentFilters.priceRange.min > 0 ||
    currentFilters.priceRange.max !== Infinity ||
    (currentFilters.nftType && currentFilters.nftType !== 'all'); // NEW

  const hasPriceFilter = 
    currentFilters.priceRange.min > 0 || 
    currentFilters.priceRange.max !== Infinity;

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className={`space-y-3 mb-6 ${className}`}>
        <SkeletonLoader width="w-full" height="h-11" rounded="lg" className="mb-2" />
        {!isMobile && (
          <div className="grid grid-cols-3 gap-2">
            <SkeletonLoader width="w-full" height="h-11" rounded="lg" />
            <SkeletonLoader width="w-full" height="h-11" rounded="lg" />
            <SkeletonLoader width="w-full" height="h-11" rounded="lg" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 mb-6 ${className}`}>
      {/* Top Bar: Search */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Search marketplace..."
            value={searchInput}
            onChange={handleSearchChange}
            aria-label="Search marketplace by NFT name or description"
            className="
              w-full h-11 pl-10 pr-4
              bg-white/5 backdrop-blur-md
              border border-white/10
              rounded-lg
              jersey-20-regular text-xl lg:text-2xl text-white placeholder-white/40
              transition-all duration-300
              focus:outline-none focus:bg-white/10 focus:border-purple-500/50
              focus:ring-2 focus:ring-purple-500/20
              hover:border-white/20
            "
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-purple-400 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <motion.button
            onClick={handleFilterToggle}
            aria-label={isFilterOpen ? 'Close filters menu' : 'Open filters menu'}
            aria-expanded={isFilterOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              h-11 px-4 flex items-center gap-2
              rounded-lg border jersey-20-regular text-lg lg:text-xl
              transition-all duration-300
              ${hasActiveFilters || isFilterOpen
                ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            )}
          </motion.button>
        )}
      </div>

      {/* Filter Pills (Desktop) */}
      {!isMobile && (
        <div className="grid grid-cols-4 gap-2">
          <ModernSelect
            value={currentFilters.category}
            onChange={onCategoryChange}
            options={categoryOptions}
            placeholder="Category"
          />
          
          <ModernSelect
            value={currentFilters.sortBy}
            onChange={(value) => onSortChange(value as 'price' | 'name' | 'date')}
            options={SORT_OPTIONS}
            placeholder="Sort by"
          />

          {/* NFT Type Filter - NEW */}
          <ModernSelect
            value={currentFilters.nftType || 'all'}
            onChange={onNFTTypeChange}
            options={NFT_TYPE_OPTIONS}
            placeholder="NFT Type"
          />

          {/* Price Range Filter */}
          <div className="relative">
            <button
              onClick={() => setIsPriceOpen(!isPriceOpen)}
              aria-label={hasPriceFilter ? `Price filter active: ${currentFilters.priceRange.min} to ${currentFilters.priceRange.max === Infinity ? 'unlimited' : currentFilters.priceRange.max} POL` : 'Set price range filter'}
              aria-expanded={isPriceOpen}
              aria-haspopup="true"
              className={`
                w-full px-4 py-2.5 
                bg-white/5 backdrop-blur-md
                border border-white/10
                rounded-lg
                jersey-20-regular text-xl md:text-2xl
                transition-all duration-300 ease-out
                flex items-center justify-between
                group
                ${hasPriceFilter
                  ? 'bg-purple-500/15 border-purple-500/40 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">💵</span>
                <span className="truncate">
                  {hasPriceFilter 
                    ? `${currentFilters.priceRange.min} - ${currentFilters.priceRange.max === Infinity ? '∞' : currentFilters.priceRange.max} POL`
                    : 'Price Range'
                  }
                </span>
              </span>
              <svg 
                className={`w-4 h-4 text-white/60 transition-transform duration-300 ${
                  isPriceOpen ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Price Dropdown */}
            {isPriceOpen && (
              <div className="absolute z-50 w-full mt-2 p-4 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/15 rounded-lg shadow-2xl">
                <label className="block jersey-20-regular text-xs md:text-sm text-white/60 mb-2">
                  Price Range (POL)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white jersey-20-regular text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white jersey-20-regular text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPriceMin('0');
                      setPriceMax('');
                      onPriceRangeChange(0, Infinity);
                      setIsPriceOpen(false);
                    }}
                    aria-label="Clear price range filter"
                    className="flex-1 px-3 py-2 jersey-20-regular text-xs md:text-sm text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white/80 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handlePriceFilter}
                    aria-label="Apply price range filter"
                    className="flex-1 px-3 py-2 jersey-20-regular text-xs md:text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Tags (Mobile - Collapsed) */}
      {isMobile && hasActiveFilters && !isFilterOpen && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.category !== 'all' && (
            <button
              onClick={() => onCategoryChange('all')}
              aria-label={`Remove ${currentFilters.category} category filter`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-full jersey-20-regular text-xs md:text-sm text-purple-300 hover:bg-purple-500/25 transition-colors"
            >
              <span>{categories.find(c => c.name === currentFilters.category)?.icon || '📁'}</span>
              <span>{currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1)}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {hasPriceFilter && (
            <button
              onClick={() => onPriceRangeChange(0, Infinity)}
              aria-label={`Remove price filter: ${currentFilters.priceRange.min} to ${currentFilters.priceRange.max === Infinity ? 'unlimited' : currentFilters.priceRange.max} POL`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 border border-green-500/30 rounded-full jersey-20-regular text-xs md:text-sm text-green-300 hover:bg-green-500/25 transition-colors"
            >
              <span>💵</span>
              <span>
                {currentFilters.priceRange.min} - {currentFilters.priceRange.max === Infinity ? '∞' : currentFilters.priceRange.max} POL
              </span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Mobile Expanded Filters */}
      {isMobile && (
        <div className={`grid gap-2 overflow-hidden transition-all duration-300 ease-out ${isFilterOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="min-h-0">
            <div className="space-y-2 pb-2">
              <ModernSelect
                value={currentFilters.category}
                onChange={onCategoryChange}
                options={categoryOptions}
                placeholder="Category"
              />
              
              <ModernSelect
                value={currentFilters.sortBy}
                onChange={(value) => onSortChange(value as 'price' | 'name' | 'date')}
                options={SORT_OPTIONS}
                placeholder="Sort by"
              />

              {/* NFT Type Filter - NEW */}
              <ModernSelect
                value={currentFilters.nftType || 'all'}
                onChange={onNFTTypeChange}
                options={NFT_TYPE_OPTIONS}
                placeholder="NFT Type"
              />

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <label className="block jersey-20-regular text-xs md:text-sm text-white/60 mb-2">Price Range (POL)</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white jersey-20-regular text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white jersey-20-regular text-sm md:text-base placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  aria-label="Apply price range filter"
                  className="w-full px-3 py-2 jersey-20-regular text-xs md:text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Apply Price Filter
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  aria-label="Clear all active filters"
                  className="w-full h-9 px-4 jersey-20-regular text-xs md:text-sm text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white/80 transition-all duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
