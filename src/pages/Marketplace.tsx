import { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMarketplaceNFTs } from '../hooks/nfts/useReactQueryNFTs';
import type { NFTData } from '../hooks/nfts/useReactQueryNFTs';
import type { MarketplaceNFT } from '../types/marketplace';
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters';
import MarketplaceStats from '../components/marketplace/MarketplaceStats';
import NFTCardMemo from '../components/marketplace/NFTCardMemo';
import usePOLPrice from '../hooks/coingecko/usePOLPrice';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import ConnectWallet from '../ui/ConnectWalletAlert';
import { nftLogger } from '../utils/log/nftLogger';

// Lazy load components
const BuyModal = lazy(() => import('../components/marketplace/BuyModal'));
const MarketplaceSidebar = lazy(() => import('../components/marketplace/MarketplaceSidebar'));

// ✅ Adapter function: NFTData → MarketplaceNFT
function convertToMarketplaceNFT(nft: NFTData): MarketplaceNFT {
  const priceInEth = Number(nft.price) / 1e18;
  return {
    tokenId: nft.tokenId,
    name: nft.name,
    description: nft.description,
    image: nft.image,
    price: nft.price.toString(),
    priceInEth,
    seller: nft.creator,
    owner: nft.owner,
    isForSale: nft.isForSale,
    listedTimestamp: 0, // Not available in NFTData
    category: nft.category,
    tokenURI: nft.tokenURI,
    attributes: nft.attributes.map(attr => ({
      trait_type: attr.trait_type,
      value: String(attr.value) // Convert number to string
    })),
    metadata: null,
    uniqueId: nft.uniqueId,
    contract: nft.contract,
    creator: nft.creator,
    likes: nft.likes
  };
}

function Marketplace() {
  const { isConnected } = useAccount();
  const isMobile = useIsMobile();
  
  // ✅ React Query hook for marketplace NFTs
  const {
    nfts: allNFTs,
    loading,
    error,
    refreshNFTs
  } = useMarketplaceNFTs({
    userOnly: false,
    isForSale: true, // Only show listed NFTs
    enabled: isConnected
  });
  
  usePOLPrice();

  // ✅ FIXED: Log only when data changes (inside useEffect)
  useEffect(() => {
    if (!loading && allNFTs.length > 0) {
      nftLogger.logPageState({
        page: 'Marketplace',
        total: allNFTs.length,
        loaded: allNFTs.length,
        hasMore: false,
        isConnected,
        error
      });
    }
  }, [loading, allNFTs.length, isConnected, error]);

  const [refreshing, setRefreshing] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<MarketplaceNFT | null>(null);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'price' | 'name' | 'date'>('date');

  // ✅ Convert to MarketplaceNFT format for compatibility
  const marketplaceNFTs = useMemo(() => 
    allNFTs.map(convertToMarketplaceNFT),
    [allNFTs]
  );

  // ✅ Client-side filtering with useMemo
  const filteredNFTs = useMemo(() => {
    let filtered = [...marketplaceNFTs];

    // Filter by category
    if (currentCategory !== 'all') {
      filtered = filtered.filter(nft => 
        nft.category.toLowerCase() === currentCategory.toLowerCase()
      );
    }

    // Filter by price range
    filtered = filtered.filter(nft => {
      const priceInEth = nft.priceInEth;
      return priceInEth >= priceRange.min && priceInEth <= priceRange.max;
    });

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(query) ||
        nft.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortField === 'price') {
        return b.priceInEth - a.priceInEth;
      } else if (sortField === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return b.listedTimestamp - a.listedTimestamp;
      }
    });

    return filtered;
  }, [marketplaceNFTs, currentCategory, priceRange, searchQuery, sortField]);

  // Enhanced logging after filtering
  if (!loading && filteredNFTs.length > 0) {
    console.log(
      `%c🔍 Marketplace Filters%c\n` +
      `├─ Filtered: ${filteredNFTs.length}/${allNFTs.length} NFTs\n` +
      `├─ Category: ${currentCategory}\n` +
      `├─ Price Range: ${priceRange.min} - ${priceRange.max} ETH\n` +
      `├─ Search: ${searchQuery || '(none)'}\n` +
      `└─ Sort: ${sortField}`,
      'color: #ffa500; font-weight: bold;',
      'color: #ffffff;'
    );
  }

  // Categories with counts
  const categories = useMemo(() => [
    { name: "Art", count: marketplaceNFTs.filter(nft => nft.category.toLowerCase() === 'art').length, icon: "🎨" },
    { name: "Video", count: marketplaceNFTs.filter(nft => nft.category.toLowerCase() === 'video').length, icon: "🎬" },
    { name: "Music", count: marketplaceNFTs.filter(nft => nft.category.toLowerCase() === 'music').length, icon: "🎵" },
    { name: "Collectibles", count: marketplaceNFTs.filter(nft => nft.category.toLowerCase() === 'collectibles').length, icon: "🏆" },
    { name: "Photography", count: marketplaceNFTs.filter(nft => nft.category.toLowerCase() === 'photography').length, icon: "📸" }
  ], [marketplaceNFTs]);

  // Handlers
  const handleBuyNFT = useCallback((nft: MarketplaceNFT) => {
    setSelectedNFT(nft);
    setShowBuyModal(true);
  }, []);

  const handleBuy = useCallback((nft: MarketplaceNFT) => {
    console.log('Comprando NFT:', nft);
    setShowBuyModal(false);
    setSelectedNFT(null);
    refreshNFTs();
  }, [refreshNFTs]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNFTs();
    setRefreshing(false);
  }, [refreshNFTs]);

  const handleCloseModal = useCallback(() => {
    setShowBuyModal(false);
    setSelectedNFT(null);
  }, []);

  // Wrapper functions for MarketplaceFilters
  const handleCategoryChange = useCallback((category: string) => {
    setCurrentCategory(category);
  }, []);

  const handlePriceRangeChange = useCallback((min: number, max: number) => {
    setPriceRange({ min, max });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((field: 'price' | 'name' | 'date') => {
    setSortField(field);
  }, []);

  // Current filters object for MarketplaceFilters component
  const currentFilters = {
    category: currentCategory,
    priceRange,
    searchQuery,
    sortBy: sortField
  };

  if (!isConnected) {
    return <ConnectWallet pageName="Marketplace" />;
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3' : 'px-4 sm:px-6 lg:px-8'}`}>
        
        {/* Desktop: Grid Layout con Sidebar */}
        {!isMobile ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Izquierdo - 3 columnas */}
            <div className="col-span-3">
              <Suspense fallback={<LoadingSpinner />}>
                <MarketplaceSidebar />
              </Suspense>
            </div>

            {/* Contenido Principal - 9 columnas */}
            <div className="col-span-9">
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
              {filteredNFTs.length > 0 && (
                <MarketplaceStats
                  stats={{
                    totalListedNFTs: filteredNFTs.length,
                    floorPrice: Math.min(...filteredNFTs.map(nft => nft.priceInEth)),
                    totalMarketValue: filteredNFTs.reduce((sum, nft) => sum + nft.priceInEth, 0),
                    averagePrice: filteredNFTs.reduce((sum, nft) => sum + nft.priceInEth, 0) / filteredNFTs.length
                  }}
                  loading={loading}
                  className="mb-6"
                />
              )}

              {/* Filters Section */}
              <div className="mb-6">
                <MarketplaceFilters
                  categories={categories}
                  onCategoryChange={handleCategoryChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onSearchChange={handleSearchChange}
                  onSortChange={handleSortChange}
                  currentFilters={currentFilters}
                  className=""
                  isLoading={loading}
                />
              </div>

              {/* Main Content - NFT Grid */}
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">
                    {filteredNFTs.length} NFTs
                  </h2>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 px-4 py-2 text-sm"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
        ) : (
          /* Mobile: Layout Vertical */
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-3">
                NFT Marketplace
              </h1>
              <p className="text-base text-white/60 px-4">
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
            {filteredNFTs.length > 0 && (
              <MarketplaceStats
                stats={{
                  totalListedNFTs: filteredNFTs.length,
                  floorPrice: Math.min(...filteredNFTs.map(nft => nft.priceInEth)),
                  totalMarketValue: filteredNFTs.reduce((sum, nft) => sum + nft.priceInEth, 0),
                  averagePrice: filteredNFTs.reduce((sum, nft) => sum + nft.priceInEth, 0) / filteredNFTs.length
                }}
                loading={loading}
                className="mb-4"
              />
            )}

            {/* Filters Section */}
            <div className="mb-4">
              <MarketplaceFilters
                categories={categories}
                onCategoryChange={handleCategoryChange}
                onPriceRangeChange={handlePriceRangeChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                currentFilters={currentFilters}
                className=""
                isLoading={loading}
              />
            </div>

            {/* Main Content - NFT Grid */}
            <div>
              <div className="mb-4 flex justify-between items-center flex-col gap-3 sm:flex-row">
                <h2 className="text-lg font-semibold text-white">
                  {filteredNFTs.length} NFTs
                </h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 px-3 py-2 text-sm w-full sm:w-auto"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <div className="grid gap-2 grid-cols-2">
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
          </>
        )}
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