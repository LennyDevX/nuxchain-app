import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { nftToasts } from '../../utils/toasts/nftToasts';
import GameifiedMarketplaceCoreABI from '../../abi/Marketplace/GameifiedMarketplaceCoreV1.json';
import { useFocusTrap, useModalBackdrop } from '../../hooks/accessibility/useFocusTrap';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string | null;
  onSuccess: () => void;
}

const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

export default function ListingModal({ isOpen, onClose, tokenId, onSuccess }: ListingModalProps) {
  const [listingPrice, setListingPrice] = useState('');
  const [category, setCategory] = useState('art');
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const { isConnected } = useAccount();

  // 🎯 Accessibility: Focus trap and keyboard navigation
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const handleBackdropClick = useModalBackdrop(onClose);

  // Contract interaction hooks
  const { writeContract: writeListContract, data: listHash, isPending: isListPending, error: listError } = useWriteContract();
  const { isLoading: isListConfirming, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  // Handle successful listing
  useEffect(() => {
    if (isListSuccess && loadingToastId) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      nftToasts.listingSuccess(`NFT #${tokenId}`, 'Listed successfully');
      
      // Reset and close after showing success
      setTimeout(() => {
        setLoadingToastId(null);
        onSuccess();
        onClose();
      }, 100);
    }
  }, [isListSuccess, onSuccess, onClose, tokenId, loadingToastId]);

  // Handle listing error
  useEffect(() => {
    if (listError && loadingToastId) {
      console.error('Listing error:', listError);
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      nftToasts.listingError(listError.message || 'Failed to list NFT');
      
      setTimeout(() => {
        setLoadingToastId(null);
      }, 0);
    }
  }, [listError, loadingToastId]);

  const handleConfirmListing = async () => {
    if (!isConnected) {
      nftToasts.walletNotConnected();
      return;
    }
    
    if (!tokenId || !listingPrice || parseFloat(listingPrice) < 50) {
      nftToasts.error('Enter valid price (minimum 50 POL)');
      return;
    }

    try {
      // Dismiss any existing loading toasts
      toast.dismiss();
      
      const toastId = toast.loading('📋 Listing NFT...', {
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
          border: '1px solid rgba(139, 92, 246, 0.5)'
        }
      });
      setLoadingToastId(toastId);
      
      await writeListContract({
        address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi,
        functionName: 'listTokenForSale',
        args: [BigInt(tokenId), parseEther(listingPrice)],
      });
    } catch (error: unknown) {
      console.error('Error initiating listing:', error);
      // Dismiss loading toast
      toast.dismiss(loadingToastId ?? undefined);
      setLoadingToastId(null);
      
      // No mostrar aquí porque el useEffect de listError ya lo maneja
      // El error será procesado por el useEffect cuando listError se actualice
    }
  };

  const handleCancel = () => {
    // Dismiss all toasts when canceling
    toast.dismiss();
    setLoadingToastId(null);
    setListingPrice('');
    setCategory('art');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-modal-title"
      aria-describedby="listing-modal-description"
    >
      <div ref={modalRef} className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full">
        <h3 id="listing-modal-title" className="jersey-15-regular text-2xl lg:text-3xl font-bold text-white mb-6">List NFT for Sale</h3>
        
        <div id="listing-modal-description" className="mb-6">
          <label htmlFor="category-select" className="jersey-15-regular block text-white font-medium mb-2 text-base lg:text-lg">Category *</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Select NFT category"
            aria-required="true"
            className="jersey-20-regular w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [&>option]:bg-gray-800 [&>option]:text-white text-base lg:text-lg"
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
          <label htmlFor="listing-price-input" className="jersey-15-regular block text-white font-medium mb-2 text-base lg:text-lg">Price (POL) *</label>
          <input
            id="listing-price-input"
            type="number"
            step="50"
            min="50"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            aria-label="Enter listing price in POL"
            aria-required="true"
            aria-describedby="price-hint"
            aria-invalid={listingPrice !== '' && parseFloat(listingPrice) < 50}
            className="jersey-20-regular w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base lg:text-lg"
            placeholder="50"
            required
          />
          <p id="price-hint" className="jersey-20-regular text-white/60 text-sm lg:text-base mt-1">
            💰 Minimum price: 50 POL
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            disabled={isListPending || isListConfirming}
            aria-label="Cancel listing"
            aria-disabled={isListPending || isListConfirming}
            className="jersey-20-regular flex-1 btn-secondary text-base lg:text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmListing}
            disabled={isListPending || isListConfirming || !listingPrice || parseFloat(listingPrice) < 50}
            aria-label={isListPending ? 'Listing NFT in progress' : isListConfirming ? 'Confirming transaction' : 'List NFT for sale'}
            aria-busy={isListPending || isListConfirming}
            aria-disabled={isListPending || isListConfirming || !listingPrice || parseFloat(listingPrice) < 50}
            className="jersey-20-regular flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 transform text-base lg:text-lg"
          >
            {isListPending ? (
              <span className="jersey-20-regular flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Listing...
              </span>
            ) : isListConfirming ? (
              <span className="jersey-20-regular flex items-center justify-center gap-2">
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