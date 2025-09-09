import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, type Abi } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import { toast } from 'react-hot-toast';

const CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

export interface BuyNFTParams {
  tokenId: string;
  price: string; // Price in ETH as string
  seller: string;
}

export interface UseBuyNFTReturn {
  buyNFT: (params: BuyNFTParams) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash: string | null;
  reset: () => void;
}

export default function useBuyNFT(): UseBuyNFTReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  });

  const buyNFT = useCallback(async (params: BuyNFTParams) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      toast.error('Please connect your wallet first');
      return;
    }

    if (!CONTRACT_ADDRESS) {
      setError('Marketplace contract address not configured');
      toast.error('Marketplace contract address not configured');
      return;
    }

    if (!publicClient) {
      setError('Public client not available');
      toast.error('Network connection error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setTransactionHash(null);

    try {
      // Validate parameters
      if (!params.tokenId || !params.price || !params.seller) {
        throw new Error('Invalid parameters: tokenId, price, and seller are required');
      }

      const tokenId = BigInt(params.tokenId);
      const priceInWei = parseEther(params.price);

      // Check if user has sufficient balance
      const balance = await publicClient.getBalance({ address });
      if (balance < priceInWei) {
        throw new Error('Insufficient balance to purchase this NFT');
      }

      // Verify the NFT is still for sale and get current price
      const listedToken = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi as Abi,
        functionName: 'getListedToken',
        args: [tokenId]
      }) as any[];

      if (!listedToken || !listedToken[4]) { // isForSale is at index 4
        throw new Error('This NFT is no longer for sale');
      }

      const currentPrice = listedToken[3] as bigint;
      if (currentPrice !== priceInWei) {
        throw new Error('Price has changed. Please refresh and try again.');
      }

      const currentSeller = listedToken[1] as string;
      if (currentSeller.toLowerCase() !== params.seller.toLowerCase()) {
        throw new Error('Seller has changed. Please refresh and try again.');
      }

      // Check if user is trying to buy their own NFT
      if (currentSeller.toLowerCase() === address.toLowerCase()) {
        throw new Error('You cannot buy your own NFT');
      }

      toast.loading('Preparing transaction...', { id: 'buy-nft' });

      // Execute the purchase transaction
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi as Abi,
        functionName: 'buyToken',
        args: [tokenId],
        value: priceInWei,
      });

      setTransactionHash(hash);
      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'buy-nft' });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        setIsSuccess(true);
        toast.success('NFT purchased successfully!', { id: 'buy-nft' });
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error buying NFT:', err);
      
      let errorMessage = 'Failed to purchase NFT';
      
      if (err.message) {
        if (err.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for this transaction';
        } else if (err.message.includes('execution reverted')) {
          errorMessage = 'Transaction failed: NFT may no longer be available';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage, { id: 'buy-nft' });
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, publicClient, writeContractAsync]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    setTransactionHash(null);
  }, []);

  return {
    buyNFT,
    isLoading: isLoading || isWaitingForReceipt,
    isSuccess,
    error,
    transactionHash,
    reset
  };
}