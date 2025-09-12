import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAccount } from 'wagmi';
import useMarketplace, { type MarketplaceNFT } from '../hooks/nfts/useMarketplace';
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters';
import MarketplaceStatsModule from '../components/marketplace/MarketplaceStatsModule';
import NFTCardMemo from '../components/marketplace/NFTCardMemo';
import usePOLPrice from '../hooks/coingecko/usePOLPrice';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import ConnectWallet from '../ui/ConnectWallet';

// Lazy load the BuyModal component
const BuyModal = lazy(() => import('../components/marketplace/BuyModal'));

function Marketplace() {
  const { isConnected } = useAccount();
  const isMobile = useIsMobile();
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

  if (!isConnected) {
    return <ConnectWallet pageName="Marketplace" />;
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3' : 'px-4 sm:px-6 lg:px-8'}`}>
        {/* Header */}
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
          <h1 className={`font-bold text-white ${isMobile ? 'text-2xl mb-3' : 'text-4xl mb-4'}`}>
            NFT Marketplace
          </h1>
          <p className={`text-white/60 max-w-3xl mx-auto ${isMobile ? 'text-base px-4' : 'text-xl'}`}>
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
        <div className={isMobile ? 'mb-6' : 'mb-8'}>
          <MarketplaceStatsModule />
        </div>

        {/* Security Notice */}
        

        {/* Main Layout: Sidebar + Content */}
        <div className={`flex flex-col gap-6 ${isMobile ? '' : 'lg:flex-row lg:gap-8'}`}>
          {/* Sidebar - Filters */}
          <div className={`${isMobile ? 'w-full' : 'lg:w-80'} flex-shrink-0`}>
            <div className={`card-unified ${isMobile ? 'p-4' : 'p-6'} ${isMobile ? '' : 'sticky top-8'}`}>
              <h3 className={`font-semibold text-white ${isMobile ? 'text-base mb-4' : 'text-lg mb-6'}`}>Filters</h3>
              <MarketplaceFilters
                categories={categories}
                onCategoryChange={filterByCategory}
                onPriceRangeChange={filterByPriceRange}
                onSearchChange={searchByName}
                onSortChange={sortBy}
                currentFilters={currentFilters}
                className=""
                isLoading={loading}
              />
            </div>
          </div>

          {/* Main Content - NFT Grid */}
          <div className="flex-1">
            <div className={`mb-4 flex justify-between items-center ${isMobile ? 'flex-col gap-3 sm:flex-row' : ''}`}>
              <h2 className={`font-semibold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {filteredNFTs.length} NFTs
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 ${isMobile ? 'px-3 py-2 text-sm w-full sm:w-auto' : 'px-4 py-2 text-sm'}`}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Grid más espacioso para cards más grandes */}
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8'}`}>
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