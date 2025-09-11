import React, { useState, useEffect } from 'react';

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
  className = ''
}: MarketplaceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery);
  const [priceMin, setPriceMin] = useState(currentFilters.priceRange.min.toString());
  const [priceMax, setPriceMax] = useState(
    currentFilters.priceRange.max === Infinity ? '' : currentFilters.priceRange.max.toString()
  );
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

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



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Search NFTs
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
            🔍
          </span>
        </div>
      </div>

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
          Sort By
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
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min price"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={handlePriceFilter}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <input
            type="number"
            placeholder="Max price"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={handlePriceFilter}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/80">
              Active Filters
            </label>
            <button
              onClick={clearFilters}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentFilters.category !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {formatCategoryName(currentFilters.category)}
                <button
                  onClick={() => onCategoryChange('all')}
                  className="ml-1 text-purple-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {currentFilters.searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                "{currentFilters.searchQuery}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 text-blue-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {(currentFilters.priceRange.min > 0 || currentFilters.priceRange.max !== Infinity) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                {currentFilters.priceRange.min} - {currentFilters.priceRange.max === Infinity ? '∞' : currentFilters.priceRange.max} POL
                <button
                  onClick={() => onPriceRangeChange(0, Infinity)}
                  className="ml-1 text-green-300 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}