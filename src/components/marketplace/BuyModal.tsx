import React from 'react';
import { useAccount } from 'wagmi';
import type { MarketplaceNFT } from '../../hooks/nfts/useMarketplace';

// SVG Icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="m12 17 .01 0"></path>
  </svg>
);

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: MarketplaceNFT | null;
  onBuy: (nft: MarketplaceNFT) => void;
  onSuccess?: (nft: MarketplaceNFT) => void;
}

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, nft, onBuy, onSuccess }) => {
  const { address: account, isConnected } = useAccount();
  const [buyError, setBuyError] = React.useState<string>('');

  if (!isOpen || !nft) return null;

  const handleBuy = () => {
    if (!isConnected) {
      setBuyError('Debes conectar tu wallet');
      return;
    }
    if (account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase()) {
      setBuyError('No puedes comprar tu propio NFT');
      return;
    }
    setBuyError('');
    onBuy(nft);
    onSuccess?.(nft);
    onClose();
  };

  const isOwner = account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-unified border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Comprar NFT</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="mb-4">
          <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {nft.image ? (
              <img
                src={nft.image}
                alt={nft.name || 'NFT'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center" style={{display: nft.image ? 'none' : 'flex'}}>
              <span className="text-6xl opacity-50">🖼️</span>
            </div>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">{nft.name || `NFT #${nft.tokenId || 'Unknown'}`}</h4>
          <p className="text-2xl font-bold text-purple-400 mb-4">
            {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangleIcon />
              <span>Debes conectar tu wallet para comprar</span>
            </div>
          </div>
        ) : isOwner ? (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangleIcon />
              <span>No puedes comprar tu propio NFT</span>
            </div>
          </div>
        ) : null}

        {buyError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangleIcon />
              <span>{buyError}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleBuy}
            disabled={!isConnected || Boolean(isOwner)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;