import { useState, useEffect, useMemo, memo } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import InfiniteScrollNFTGrid from '../components/nfts/InfiniteScrollNFTGrid';
import NFTFilters from '../components/nfts/NFTFilters';
import NFTStats from '../components/nfts/NFTStats';
import ListingModal from '../components/nfts/ListingModal';
import useUserNFTsLazy from '../hooks/nfts/useUserNFTsLazy';
import useListNFT from '../hooks/nfts/useListNFT';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import ConnectWallet from '../ui/ConnectWallet';




function NFTs() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { 
    nfts: userNFTs, 
    loading, 
    loadingMore, 
    error, 
    hasMore, 
    refreshNFTs: refetch, 
    loadMoreNFTs,
    totalCount,
    loadedCount 
  } = useUserNFTsLazy();
  const { error: listError } = useListNFT();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [listingTokenId, setListingTokenId] = useState<string | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  
  // Calculate stats from NFTs - memoized for performance
  // Remove unused nftStats declaration since it's not being used anywhere

  // Handle listing errors
  useEffect(() => {
    if (listError) {
      console.error('Listing error:', listError);
    }
  }, [listError]);

  // Filter NFTs based on search term, category, and status
  const filteredNFTs = useMemo(() => {
    let filtered = userNFTs.filter(nft => {
      const matchesSearch = searchTerm === '' || 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        (nft.attributes?.some((attr: any) => 
          attr.trait_type === 'category' && 
          attr.value.toString().toLowerCase() === selectedCategory.toLowerCase()
        ));
      
      const matchesStatus = filter === 'all' ||
        (filter === 'listed' && nft.isForSale) ||
        (filter === 'unlisted' && !nft.isForSale);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort NFTs based on selected sort option
    return filtered.sort((a, b) => {
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
  }, [userNFTs, searchTerm, selectedCategory, filter, sortBy]);

  // Get unique categories from NFTs for dynamic filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    userNFTs.forEach(nft => {
      nft.attributes?.forEach((attr: any) => {
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
          <h1 className={`font-bold text-white mb-3 md:mb-4 ${
            isMobile ? 'text-2xl' : 'text-4xl'
          }`}>
            My NFTs
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
            refetch(); // Refresh NFTs after listing
          }}
          tokenId={listingTokenId}
        />
      </div>
    </div>
  );
}

export default memo(NFTs);