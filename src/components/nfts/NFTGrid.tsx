import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FixedSizeGrid } from 'react-window';
import NFTCard from './NFTCard';
import { CardSkeletonLoader } from '../ui/SkeletonLoader';

interface NFTData {
  tokenId: string;
  uniqueId: string;
  tokenURI: string | null;
  contract: `0x${string}`;
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  owner: string;
  creator: string;
  price: bigint;
  isForSale: boolean;
  likes: string;
  category: string;
}

interface NFTGridProps {
  nfts: NFTData[];
  loading: boolean;
  error: string | null;
  onListNFT: (tokenId: string) => void;
  onCreateNFT: () => void;
}

export default function NFTGrid({ nfts, loading, error, onListNFT, onCreateNFT }: NFTGridProps) {
  // Calculate grid dimensions based on screen size
  const gridConfig = useMemo(() => {
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200; // Account for padding
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    const minCardWidth = isMobile ? 260 : 280;
    const gap = isMobile ? 16 : 24;
    const columnsCount = Math.max(1, Math.floor((containerWidth + gap) / (minCardWidth + gap)));
    const cardWidth = (containerWidth - (gap * (columnsCount - 1))) / columnsCount;
    const cardHeight = cardWidth * 1.5; // Updated aspect ratio 3:4.5

    return {
      columnsCount,
      cardWidth,
      cardHeight,
      containerWidth,
      isMobile
    };
  }, []);

  // Virtualized grid item renderer
  const GridItem = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const itemIndex = rowIndex * gridConfig.columnsCount + columnIndex;
    const nft = nfts[itemIndex];

    if (!nft) return null;

    return (
      <div style={{
        ...style,
        padding: '12px',
        boxSizing: 'border-box'
      }}>
        <NFTCard
          key={nft.uniqueId || nft.tokenId}
          nft={nft}
          onListNFT={onListNFT}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full">
        <CardSkeletonLoader count={gridConfig.columnsCount * 2} />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1 }}
        >
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Error Loading NFTs</h3>
        <p className="text-white/60 mb-6">{error}</p>
        <motion.button
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  if (nfts.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-6"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">You don't have any NFTs yet</h3>
        <p className="text-white/60 mb-6">Create your first NFT and start your collection</p>
        <motion.button
          onClick={onCreateNFT}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Create my first NFT
        </motion.button>
      </motion.div>
    );
  }

  // Use virtualization only for large collections (>20 items)
  if (nfts.length > 20) {
    const rowCount = Math.ceil(nfts.length / gridConfig.columnsCount);

    return (
      <div className="w-full">
        <FixedSizeGrid
          columnCount={gridConfig.columnsCount}
          columnWidth={gridConfig.cardWidth}
          height={600} // Fixed height for virtualization
          rowCount={rowCount}
          rowHeight={gridConfig.cardHeight + 24} // Add padding
          width={gridConfig.containerWidth}
          className="scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent"
        >
          {GridItem}
        </FixedSizeGrid>
      </div>
    );
  }

  // For smaller collections, use regular grid but keep consistent card heights
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
    >
      {nfts.map((nft, _idx) => (
        <motion.div
          key={nft.uniqueId || nft.tokenId}
          className="flex items-stretch"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <NFTCard
            nft={nft}
            onListNFT={onListNFT}
            isMobile={gridConfig.isMobile}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}