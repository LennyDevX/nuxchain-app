import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string | null;
  onSuccess: () => void;
}

const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

export default function ListingModal({ isOpen, onClose, tokenId, onSuccess }: ListingModalProps) {
  const [listingPrice, setListingPrice] = useState('');
  const [category, setCategory] = useState('art');
  const { isConnected } = useAccount();

  // Contract interaction hooks
  const { writeContract: writeListContract, data: listHash, isPending: isListPending, error: listError } = useWriteContract();
  const { isLoading: isListConfirming, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setListingPrice('');
      setCategory('art');
    }
  }, [isOpen]);

  // Handle successful listing
  useEffect(() => {
    if (isListSuccess) {
      onSuccess();
      onClose();
    }
  }, [isListSuccess, onSuccess, onClose]);

  // Handle listing error
  useEffect(() => {
    if (listError) {
      console.error('Listing error:', listError);
      alert(`Error listing NFT: ${listError.message || 'Unknown error'}`);
    }
  }, [listError]);

  const handleConfirmListing = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!tokenId || !listingPrice || parseFloat(listingPrice) < 50) {
      alert('Please enter a valid price (minimum 50 POL)');
      return;
    }

    try {
      await writeListContract({
        address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi,
        functionName: 'listTokenForSale',
        args: [BigInt(tokenId), parseEther(listingPrice), category],
      });
    } catch (error) {
      console.error('Error initiating listing:', error);
      alert('Failed to initiate listing. Please try again.');
    }
  };

  const handleCancel = () => {
    setListingPrice('');
    setCategory('art');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-6">List NFT for Sale</h3>
        
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [&>option]:bg-gray-800 [&>option]:text-white"
            required
          >
            <option value="art" className="bg-gray-800 text-white">Art</option>
            <option value="photography" className="bg-gray-800 text-white">Photography</option>
            <option value="music" className="bg-gray-800 text-white">Music</option>
            <option value="video" className="bg-gray-800 text-white">Video</option>
            <option value="collectibles" className="bg-gray-800 text-white">Collectibles</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Price (POL) *</label>
          <input
            type="number"
            step="50"
            min="50"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="50"
            required
          />
          <p className="text-white/60 text-sm mt-1">
            💰 Minimum price: 50 POL
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            disabled={isListPending || isListConfirming}
            className="flex-1 bg-gray-600/20 border border-gray-600 text-gray-300 hover:bg-gray-600/30 py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmListing}
            disabled={isListPending || isListConfirming || !listingPrice || parseFloat(listingPrice) < 50}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 transform"
          >
            {isListPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Listing...
              </span>
            ) : isListConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Confirming...
              </span>
            ) : (
              '🚀 List for Sale'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}