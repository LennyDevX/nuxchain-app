import { useState, useMemo, memo, useEffect } from 'react';
import { isMaintenanceMode } from '../config/maintenance';
import NFTsMaintenance from './NFTsMaintenance';

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// Helper: Check if NFT has skill attributes
function hasSkill(attributes: NFTAttribute[] | undefined): boolean {
  return (attributes || []).some(attr => 
    attr.trait_type.toLowerCase() === 'skill' ||
    attr.trait_type.toLowerCase() === 'skilltype'
  );
}
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import InfiniteScrollNFTGrid from '../components/nfts/InfiniteScrollNFTGrid';
import NFTFilters from '../components/nfts/NFTFilters';
import NFTStats from '../components/nfts/NFTStats';
import ListingModal from '../components/nfts/ListingModal';
import { useMarketplaceNFTsGraph } from '../hooks/nfts/useMarketplaceNFTsGraph';
import useListNFT from '../hooks/nfts/useListNFT';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import ConnectWallet from '../ui/ConnectWalletAlert';
import { nftLogger } from '../utils/log/nftLogger';




function NFTs() {
  // Check maintenance mode first
  if (isMaintenanceMode('nfts')) {
    return <NFTsMaintenance />;
  }
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // ✅ React Query hook - replaces 40+ lines of manual state management
  const { 
    nfts: userNFTs, 
    loading, 
    loadingMore, 
    error, 
    hasMore, 
    refreshNFTs, 
    loadMoreNFTs,
    totalCount,
    loadedCount 
  } = useMarketplaceNFTsGraph({
    userOnly: true, // Show only user's NFTs
    enabled: isConnected
  });
  
  // ✅ FIXED: Log only when data changes (inside useEffect)
  useEffect(() => {
    if (!loading && userNFTs.length > 0) {
      nftLogger.logPageState({
        page: 'NFTs',
        total: totalCount,
        loaded: loadedCount,
        hasMore,
        isConnected,
        error
      });
    }
  }, [loading, userNFTs.length, totalCount, loadedCount, hasMore, isConnected, error]);
  
  // Remove unused listError
  useListNFT();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [nftType, setNFTType] = useState('all'); // 'all' | 'skill' | 'standard' - NEW
  const [sortBy, setSortBy] = useState('date');
  const [listingTokenId, setListingTokenId] = useState<string | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  
  // Remove unused effect - listError is handled by the ListingModal component

  // Filter NFTs based on search term, category, status, and NFT type - optimized with early returns
  const filteredNFTs = useMemo(() => {
    // Early return if no NFTs
    if (userNFTs.length === 0) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const categoryLower = selectedCategory.toLowerCase();
    
    const filtered = userNFTs.filter(nft => {
      // Status filter first (cheapest check)
      if (filter !== 'all') {
        if (filter === 'listed' && !nft.isForSale) return false;
        if (filter === 'unlisted' && nft.isForSale) return false;
      }
      
      // NFT Type filter (NEW) - Check if has skill attribute
      if (nftType !== 'all') {
        const hasSkillAttr = hasSkill(nft.attributes);
        if (nftType === 'skill' && !hasSkillAttr) return false;
        if (nftType === 'standard' && hasSkillAttr) return false;
      }
      
      // Search filter
      if (searchTerm !== '') {
        const matchesSearch = nft.name.toLowerCase().includes(searchLower) ||
          nft.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Category filter (most expensive)
      if (selectedCategory !== 'all') {
        const matchesCategory = nft.attributes?.some((attr: NFTAttribute) => 
          attr.trait_type === 'category' && 
          attr.value.toString().toLowerCase() === categoryLower
        );
        if (!matchesCategory) return false;
      }
      
      return true;
    });

    // Sort NFTs based on selected sort option
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return Number(a.price || 0) - Number(b.price || 0);
        case 'price-desc':
          return Number(b.price || 0) - Number(a.price || 0);
        case 'date':
        default:
          return Number(b.tokenId) - Number(a.tokenId);
      }
    });

    // ✅ Log filter results (only when filters change)
    nftLogger.logFilter({
      page: 'NFTs',
      originalCount: userNFTs.length,
      filteredCount: sorted.length,
      filters: {
        search: searchTerm,
        category: selectedCategory,
        status: filter,
        nftType, // NEW
        sortBy
      }
    });

    return sorted;
  }, [userNFTs, searchTerm, selectedCategory, filter, nftType, sortBy]);

  // Get unique categories from NFTs for dynamic filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    userNFTs.forEach(nft => {
      nft.attributes?.forEach((attr: NFTAttribute) => {
        if (attr.trait_type === 'category' || attr.trait_type === 'Category') {
          cats.add(attr.value.toString());
        }
      });
    });
    return Array.from(cats);
  }, [userNFTs]);

  const handleCreateNFT = () => {
    navigate('/tokenization');
  };

  const handleListNFT = (tokenId: string) => {
    setListingTokenId(tokenId);
    setShowListingModal(true);
  };

  const handleCancelListing = () => {
    setShowListingModal(false);
    setListingTokenId(null);
  };


  if (!isConnected) {
    return <ConnectWallet pageName="NFTs" />;
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-6 md:mb-8 ${isMobile ? 'px-2' : ''}`}>
          <h1 className={`font-bold text-white mb-3 md:mb-4 text-gradient ${
            isMobile ? 'text-2xl' : 'text-4xl'
          }`}>
            My Collection
          </h1>
          <p className={`text-white/60 max-w-3xl mx-auto ${
            isMobile ? 'text-base px-4' : 'text-xl'
          }`}>
            Manage your collection of unique NFTs created on our platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 md:mb-8">
          <NFTStats 
            nfts={userNFTs}
            loading={loading}
          />
        </div>
        
        {/* Actions Bar */}
        <div className={`flex flex-col gap-3 mb-4 md:mb-6 ${
          isMobile ? 'space-y-3' : 'sm:flex-row gap-4'
        }`}>
          <div className="flex-1">
            <NFTFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              filter={filter}
              onFilterChange={setFilter}
              nftType={nftType}
              onNFTTypeChange={setNFTType}
              availableCategories={availableCategories}
              onCreateNFT={handleCreateNFT}
              isLoading={loading}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>
        
        {/* NFT Grid */}
        <div className={`${isMobile ? 'px-1' : ''}`}>
          <InfiniteScrollNFTGrid
            nfts={filteredNFTs}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
            hasMore={hasMore}
            onListNFT={handleListNFT}
            onCreateNFT={handleCreateNFT}
            onLoadMore={loadMoreNFTs}
            totalCount={totalCount}
            loadedCount={loadedCount}
          />
        </div>
        
        {/* Listing Modal */}
        <ListingModal
          isOpen={showListingModal}
          onClose={handleCancelListing}
          onSuccess={() => {
            setShowListingModal(false);
            setListingTokenId(null);
            refreshNFTs(); // Refresh NFTs after listing
          }}
          tokenId={listingTokenId}
        />
      </div>
    </div>
  );
}

export default memo(NFTs);