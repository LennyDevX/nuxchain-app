import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther, type Abi } from 'viem';
import GameifiedMarketplaceCoreABI from '../../abi/Marketplace/GameifiedMarketplaceCoreV1.json';
import { apolloClient } from '../../lib/apollo-client';
import toast from 'react-hot-toast';
import { nftToasts } from '../../utils/toasts';

const CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

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
  const queryClient = useQueryClient();
  
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  });

  const buyNFT = useCallback(async (params: BuyNFTParams) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      nftToasts.walletNotConnected();
      return;
    }

    if (!CONTRACT_ADDRESS) {
      setError('Marketplace contract address not configured');
      nftToasts.error('Marketplace contract address not configured');
      return;
    }

    if (!publicClient) {
      setError('Public client not available');
      nftToasts.error('Network connection error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setTransactionHash(null);

    let buyToastId: string | null = null;

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

      // Check if user is trying to buy their own NFT
      if (params.seller.toLowerCase() === address.toLowerCase()) {
        throw new Error('You cannot buy your own NFT');
      }

      buyToastId = nftToasts.processingTransaction('Preparing purchase');

      // Execute the purchase transaction using buyToken function
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        functionName: 'buyToken',
        args: [tokenId],
        value: priceInWei,
      });

      setTransactionHash(hash);
      toast.loading('Transaction submitted. Waiting for confirmation...', { id: buyToastId });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        setIsSuccess(true);
        toast.dismiss(buyToastId);
        nftToasts.purchaseSuccess(`NFT #${params.tokenId}`, params.price);
        
        console.log('✅ [useBuyNFT] Transaction confirmed on blockchain:', {
          tokenId: params.tokenId,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber
        });
        
        // ✅ CRITICAL: Verify NFT is unlisted on-chain before updating UI
        // This prevents showing stale data from subgraph
        console.log('🔍 [useBuyNFT] Verifying NFT is unlisted on-chain...');
        let isUnlistedOnChain = false;
        let verifyAttempts = 0;
        const maxVerifyAttempts = 6; // Try up to 12 seconds
        
        while (!isUnlistedOnChain && verifyAttempts < maxVerifyAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
          verifyAttempts++;
          
          try {
            // Try to read the owner and listing status directly
            const ownerResult = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: GameifiedMarketplaceCoreABI.abi as Abi,
              functionName: 'ownerOf',
              args: [tokenId]
            }) as string;
            
            // If ownerOf returns the current buyer, NFT has been transferred
            if (ownerResult.toLowerCase() === address.toLowerCase()) {
              console.log(`✅ [useBuyNFT] Attempt ${verifyAttempts}/${maxVerifyAttempts}: NFT ownership confirmed`);
              isUnlistedOnChain = true;
            } else {
              console.log(`⏳ [useBuyNFT] Attempt ${verifyAttempts}/${maxVerifyAttempts}: NFT not yet owned, retrying...`);
            }
          } catch (err) {
            console.warn(`⚠️ [useBuyNFT] Error verifying NFT ownership (attempt ${verifyAttempts}):`, err);
          }
        }
        
        if (!isUnlistedOnChain) {
          console.warn('⚠️ [useBuyNFT] Could not verify NFT unlisted after 12 seconds, proceeding anyway');
        }
        
        // ✅ Clear caches
        console.log('🧹 [useBuyNFT] Clearing Apollo Client cache...');
        await apolloClient.clearStore();
        console.log('✅ [useBuyNFT] Apollo Client cache cleared');
        
        console.log('🔄 [useBuyNFT] Invalidating React Query caches...');
        queryClient.invalidateQueries({ 
          queryKey: ['marketplace-nfts-graph']
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-nfts']
        });
        console.log('✅ [useBuyNFT] React Query caches invalidated - UI will refresh');
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: unknown) {
      console.error('Error buying NFT:', err);
      
      let errorMessage = 'Failed to purchase NFT';
      
      const error = err as { message?: string };
      if (error.message) {
        if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for this transaction';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Transaction failed: NFT may no longer be available';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      if (buyToastId) {
        toast.dismiss(buyToastId);
      }
      nftToasts.purchaseError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, publicClient, writeContractAsync, queryClient]);

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