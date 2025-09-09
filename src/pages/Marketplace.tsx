import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import useMarketplace, { type MarketplaceNFT } from '../hooks/nfts/useMarketplace';
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters';
import MarketplaceStatsModule from '../components/marketplace/MarketplaceStatsModule';
import NFTCardMemo from '../components/marketplace/NFTCardMemo';
import usePOLPrice from '../hooks/coingecko/usePOLPrice';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy load the BuyModal component
const BuyModal = lazy(() => import('../components/marketplace/BuyModal'));

function Marketplace() {
  const {
    filteredNFTs,
    loading,
    error,
    refreshData,
    filterByCategory,
    filterByPriceRange,
    searchByName,
    sortBy,
    currentFilters
  } = useMarketplace();
usePOLPrice();

  const [refreshing, setRefreshing] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<MarketplaceNFT | null>(null);

  const handleBuyNFT = useCallback((nft: MarketplaceNFT) => {
    setSelectedNFT(nft);
    setShowBuyModal(true);
  }, []);

  const handleBuy = useCallback((nft: MarketplaceNFT) => {
    // Aquí iría la lógica de compra
    console.log('Comprando NFT:', nft);
    setShowBuyModal(false);
    setSelectedNFT(null);
    // Refresh data after successful purchase
    refreshData();
  }, [refreshData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleCloseModal = useCallback(() => {
    setShowBuyModal(false);
    setSelectedNFT(null);
  }, []);

  const categories = useMemo(() => [
    { name: "Art", count: filteredNFTs.filter(nft => nft.category.toLowerCase() === 'art').length, icon: "🎨" },
    { name: "Video", count: filteredNFTs.filter(nft => nft.category.toLowerCase() === 'video').length, icon: "🎬" },
    { name: "Music", count: filteredNFTs.filter(nft => nft.category.toLowerCase() === 'music').length, icon: "🎵" },
    { name: "Collectibles", count: filteredNFTs.filter(nft => nft.category.toLowerCase() === 'collectibles').length, icon: "🏆" },
    { name: "Photography", count: filteredNFTs.filter(nft => nft.category.toLowerCase() === 'photography').length, icon: "📸" }
  ], [filteredNFTs]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            NFT Marketplace
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Discover, buy, and sell unique digital assets on our decentralized marketplace
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">
              Error loading marketplace: {error}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8">
          <MarketplaceStatsModule />
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="card-unified p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6">Filters</h3>
              <MarketplaceFilters
                categories={categories}
                onCategoryChange={filterByCategory}
                onPriceRangeChange={filterByPriceRange}
                onSearchChange={searchByName}
                onSortChange={sortBy}
                currentFilters={currentFilters}
                className=""
              />
            </div>
          </div>

          {/* Main Content - NFT Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {filteredNFTs.length} NFTs
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-16">
                  <LoadingSpinner size="lg" text="Loading NFTs..." />
                </div>
              ) : filteredNFTs.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-white/40 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No NFTs found</h3>
                  <p className="text-white/60">No NFTs found matching your criteria. Try adjusting your filters.</p>
                </div>
              ) : (
                filteredNFTs.map((nft, index) => (
                  <NFTCardMemo
                    key={nft.tokenId || index}
                    nft={nft}
                    index={index}
                    onBuy={handleBuyNFT}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <LoadingSpinner size="md" text="Loading modal..." />
          </div>
        </div>
      }>
        {showBuyModal && (
          <BuyModal
            isOpen={showBuyModal}
            onClose={handleCloseModal}
            nft={selectedNFT}
            onBuy={handleBuy}
            onSuccess={handleBuy}
          />
        )}
      </Suspense>
    </div>
  );
}

export default Marketplace