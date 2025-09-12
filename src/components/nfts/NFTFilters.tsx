import { useState, useEffect } from 'react';

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

interface NFTFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  availableCategories?: string[];
  onCreateNFT: () => void;
  isLoading?: boolean;
}

export default function NFTFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filter,
  onFilterChange,
  availableCategories = [],
  onCreateNFT,
  isLoading = false
}: NFTFiltersProps) {
  const isMobile = useIsMobile();
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile); // Desktop expanded by default, mobile collapsed
  
  // Update filters expanded state when screen size changes
  useEffect(() => {
    setFiltersExpanded(!isMobile);
  }, [isMobile]);
  
  const hasActiveFilters = selectedCategory !== 'all' || filter !== 'all';
  
  const formatCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'all': 'All Categories',
      'art': 'Art',
      'photography': 'Photography',
      'music': 'Music',
      'video': 'Video',
      'collectibles': 'Collectibles'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  const formatFilterName = (filterValue: string) => {
    const filterNames: { [key: string]: string } = {
      'all': 'All NFTs',
      'listed': 'For Sale',
      'unlisted': 'Not Listed'
    };
    return filterNames[filterValue] || filterValue;
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="space-y-4 mb-6 md:mb-8">
        <div className="animate-pulse">
          {/* Search Bar and Actions Skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
            {isMobile && (
              <div className="w-20 h-12 bg-white/10 rounded-xl"></div>
            )}
            {/* Create NFT Button Skeleton */}
            <div className="w-24 h-12 bg-purple-500/20 rounded-xl"></div>
          </div>
          
          {/* Filters Container Skeleton */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="space-y-4">
              {/* Category Skeleton */}
              <div>
                <div className="w-16 h-4 bg-white/10 rounded mb-2"></div>
                <div className="w-full h-10 bg-white/10 rounded-lg"></div>
              </div>
              
              {/* Status Filter Skeleton */}
              <div>
                <div className="w-12 h-4 bg-white/10 rounded mb-2"></div>
                <div className="w-full h-10 bg-white/10 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6 md:mb-8">
      {/* Search Bar and Actions - Always Visible */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            )}
          </button>
        )}
        
        {/* Create NFT Button */}
        <button 
          onClick={onCreateNFT}
          className="btn-primary rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 px-4 py-3 shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create NFT</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Active Filters Preview - Compact (only on mobile when collapsed) */}
      {hasActiveFilters && !filtersExpanded && isMobile && (
        <div className="flex flex-wrap gap-2 animate-fadeIn">
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all duration-200 hover:bg-purple-500/30">
              {formatCategoryName(selectedCategory)}
              <button
                onClick={() => onCategoryChange('all')}
                className="ml-1 text-purple-300 hover:text-white transition-colors duration-200"
              >
                ×
              </button>
            </span>
          )}
          {filter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all duration-200 hover:bg-blue-500/30">
              {formatFilterName(filter)}
              <button
                onClick={() => onFilterChange('all')}
                className="ml-1 text-blue-300 hover:text-white transition-colors duration-200"
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
            <label className="block text-sm font-medium text-white/80 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="all" className="bg-gray-800 text-white">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category} className="bg-gray-800 text-white">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
              {availableCategories.length === 0 && (
                <>
                  <option value="art" className="bg-gray-800 text-white">Art</option>
                  <option value="photography" className="bg-gray-800 text-white">Photography</option>
                  <option value="music" className="bg-gray-800 text-white">Music</option>
                  <option value="video" className="bg-gray-800 text-white">Video</option>
                  <option value="collectibles" className="bg-gray-800 text-white">Collectibles</option>
                </>
              )}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="all" className="bg-gray-800 text-white">All NFTs</option>
              <option value="listed" className="bg-gray-800 text-white">For Sale</option>
              <option value="unlisted" className="bg-gray-800 text-white">Not Listed</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  onCategoryChange('all');
                  onFilterChange('all');
                }}
                className="w-full px-4 py-2 text-sm text-white/60 hover:text-white transition-all duration-300 transform hover:scale-105 border border-white/20 rounded-lg hover:bg-white/5"
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