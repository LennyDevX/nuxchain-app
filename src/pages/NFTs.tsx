import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import InfiniteScrollNFTGrid from '../components/nfts/InfiniteScrollNFTGrid';
import NFTFilters from '../components/nfts/NFTFilters';
import NFTStats from '../components/nfts/NFTStats';
import ListingModal from '../components/nfts/ListingModal';
import useUserNFTsLazy from '../hooks/nfts/useUserNFTsLazy';
import useListNFT from '../hooks/nfts/useListNFT';
import ConnectWallet from '../ui/ConnectWallet';




function NFTs() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
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
  const [listingTokenId, setListingTokenId] = useState<string | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  
  // Calculate stats from NFTs
  const totalNFTs = userNFTs.length;
const forSaleCount = userNFTs.filter((nft) => nft.isForSale).length;



  // Handle listing errors
  useEffect(() => {
    if (listError) {
      console.error('Listing error:', listError);
    }
  }, [listError]);

  // Filter NFTs based on search term, category, and status
  const filteredNFTs = useMemo(() => {
    return userNFTs.filter(nft => {
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
  }, [userNFTs, searchTerm, selectedCategory, filter]);

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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            My NFTs
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Manage your collection of unique NFTs created on our platform
          </p>
        </div>

        {/* Stats Cards */}
        <NFTStats 
            totalNFTs={totalNFTs}
            forSaleCount={forSaleCount}
            loading={loading}
            nfts={userNFTs}
          />
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            />
          </div>

        </div>
        
        {/* NFTs Grid */}
        <InfiniteScrollNFTGrid
          nfts={filteredNFTs as any[]}
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

export default NFTs