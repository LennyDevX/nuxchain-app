import { useState, memo } from 'react';
import ModernSelect from '../ui/ModernSelect';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface NFTFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  nftType: string; // 'all' | 'skill' | 'standard'
  onNFTTypeChange: (type: string) => void;
  availableCategories: string[];
  onCreateNFT: () => void;
  isLoading?: boolean;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export default memo(function NFTFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filter,
  onFilterChange,
  nftType = 'all',
  onNFTTypeChange,
  availableCategories = [],
  onCreateNFT,
  isLoading = false,
  sortBy = 'date',
  onSortChange,
}: NFTFiltersProps) {
  const isMobile = useIsMobile();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sort options for NFTs
  const SORT_OPTIONS = [
    { value: 'date', label: 'Recently Created', icon: '🆕' },
    { value: 'name', label: 'Name A-Z', icon: '🔤' },
    { value: 'price', label: 'Price Low-High', icon: '💰' },
    { value: 'price-desc', label: 'Price High-Low', icon: '💎' },
  ];

  // Category options
  const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Categories', icon: '📂' },
    ...availableCategories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: getCategoryIcon(cat)
    }))
  ];

  // Status filter options (listing status)
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All NFTs', icon: '🎨' },
    { value: 'listed', label: 'For Sale', icon: '💸' },
    { value: 'unlisted', label: 'Not Listed', icon: '🔒' }
  ];

  // NFT Type filter options (skill vs standard) - NEW
  const NFT_TYPE_OPTIONS = [
    { value: 'all', label: 'All NFTs', icon: '📦' },
    { value: 'skill', label: 'Skill NFTs', icon: '⚡' },
    { value: 'standard', label: 'Standard NFTs', icon: '🖼️' }
  ];

  const hasActiveFilters = selectedCategory !== 'all' || filter !== 'all' || nftType !== 'all';

  // Helper function to get category icons
  function getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'art': '🎨',
      'photography': '📸',
      'music': '🎵',
      'video': '🎬',
      'collectibles': '🏆',
      'gaming': '🎮',
      'metaverse': '🌐'
    };
    return icons[category] || '📁';
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="space-y-3 mb-6 animate-pulse">
        {/* Search and Create Skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-11 bg-white/5 rounded-lg border border-white/10"></div>
          <div className="w-28 h-11 bg-purple-500/10 rounded-lg border border-purple-500/20"></div>
        </div>
        
        {/* Filters Skeleton (Desktop) */}
        {!isMobile && (
          <div className="grid grid-cols-3 gap-2">
            <div className="h-11 bg-white/5 rounded-lg border border-white/10"></div>
            <div className="h-11 bg-white/5 rounded-lg border border-white/10"></div>
            <div className="h-11 bg-white/5 rounded-lg border border-white/10"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Top Bar: Search + Create Button */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search NFTs by name or description"
            className="
              w-full h-11 pl-10 pr-4
              bg-white/5 backdrop-blur-md
              border border-white/10
              rounded-lg
              text-sm text-white placeholder-white/40
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
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label={isFilterOpen ? 'Close filters menu' : 'Open filters menu'}
            aria-expanded={isFilterOpen}
            className={`
              h-11 px-4 flex items-center gap-2
              rounded-lg border font-medium text-sm
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
          </button>
        )}

        {/* Create NFT Button */}
        <button 
          onClick={onCreateNFT}
          aria-label="Create new NFT"
          className="
            h-11 px-4 flex items-center gap-2
            bg-gradient-to-r from-purple-500 to-purple-600
            hover:from-purple-600 hover:to-purple-700
            text-white font-semibold text-sm
            rounded-lg
            shadow-lg shadow-purple-500/25
            transition-all duration-300
            hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>

      {/* Filter Pills (Desktop) */}
      {!isMobile && (
        <div className="grid grid-cols-4 gap-2">
          <ModernSelect
            value={selectedCategory}
            onChange={onCategoryChange}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
          />
          
          <ModernSelect
            value={filter}
            onChange={onFilterChange}
            options={STATUS_OPTIONS}
            placeholder="Status"
          />

          <ModernSelect
            value={nftType}
            onChange={onNFTTypeChange}
            options={NFT_TYPE_OPTIONS}
            placeholder="NFT Type"
          />
          
          {onSortChange && (
            <ModernSelect
              value={sortBy}
              onChange={onSortChange}
              options={SORT_OPTIONS}
              placeholder="Sort by"
            />
          )}
        </div>
      )}

      {/* Active Filters Tags (Mobile - Collapsed) */}
      {isMobile && hasActiveFilters && !isFilterOpen && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onCategoryChange('all')}
              aria-label={`Remove ${selectedCategory} category filter`}
              className="
                inline-flex items-center gap-1.5 px-3 py-1.5
                bg-purple-500/15 border border-purple-500/30
                rounded-full text-xs font-medium text-purple-300
                hover:bg-purple-500/25 transition-colors
              "
            >
              <span>{getCategoryIcon(selectedCategory)}</span>
              <span>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {filter !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              aria-label={`Remove ${STATUS_OPTIONS.find(s => s.value === filter)?.label} status filter`}
              className="
                inline-flex items-center gap-1.5 px-3 py-1.5
                bg-blue-500/15 border border-blue-500/30
                rounded-full text-xs font-medium text-blue-300
                hover:bg-blue-500/25 transition-colors
              "
            >
              <span>{STATUS_OPTIONS.find(s => s.value === filter)?.icon}</span>
              <span>{STATUS_OPTIONS.find(s => s.value === filter)?.label}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Mobile Expanded Filters */}
      {isMobile && (
        <div
          className={`
            grid gap-2 overflow-hidden
            transition-all duration-300 ease-out
            ${isFilterOpen
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
            }
          `}
        >
          <div className="min-h-0">
            <div className="space-y-2 pb-2">
              <ModernSelect
                value={selectedCategory}
                onChange={onCategoryChange}
                options={CATEGORY_OPTIONS}
                placeholder="Category"
              />
              
              <ModernSelect
                value={filter}
                onChange={onFilterChange}
                options={STATUS_OPTIONS}
                placeholder="Status"
              />

              <ModernSelect
                value={nftType}
                onChange={onNFTTypeChange}
                options={NFT_TYPE_OPTIONS}
                placeholder="NFT Type"
              />
              
              {onSortChange && (
                <ModernSelect
                  value={sortBy}
                  onChange={onSortChange}
                  options={SORT_OPTIONS}
                  placeholder="Sort by"
                />
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    onFilterChange('all');
                    onNFTTypeChange('all');
                  }}
                  aria-label="Clear all active filters"
                  className="
                    w-full h-9 px-4
                    text-xs font-medium text-white/60
                    border border-white/10 rounded-lg
                    hover:bg-white/5 hover:text-white/80
                    transition-all duration-200
                  "
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});