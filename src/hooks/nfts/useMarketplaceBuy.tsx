import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getContract, isAddress, parseEther, type Abi } from 'viem';
import MarketplaceABI from '../../abi/Marketplace.json';
import toast from 'react-hot-toast';

const CONTRACT_ADDRESS = (import.meta as any).env.VITE_MARKETPLACE_ADDRESS;

interface BuyNFTParams {
  tokenId: string | number | bigint;
  price: string | number;
}

interface BuyNFTResult {
  success: boolean;
  txHash: string | null;
  error: string | null;
}

export default function useMarketplaceBuy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const buyNFT = useCallback(async ({ tokenId, price }: BuyNFTParams): Promise<BuyNFTResult> => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      if (!walletClient || !address) {
        throw new Error('Please connect your wallet');
      }
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
        throw new Error('Invalid contract address');
      }
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // Parse tokenId
      let parsedTokenId: bigint;
      if (typeof tokenId === 'bigint') {
        parsedTokenId = tokenId;
      } else if (typeof tokenId === 'number') {
        parsedTokenId = BigInt(tokenId);
      } else if (typeof tokenId === 'string') {
        const clean = tokenId.trim();
        if (/^0x[0-9a-fA-F]+$/.test(clean) || /^\d+$/.test(clean)) {
          parsedTokenId = BigInt(clean);
        } else {
          throw new Error('Invalid token ID format');
        }
      } else {
        throw new Error('Invalid token ID type');
      }

      // Parse price to wei
      let priceInWei: bigint;
      if (typeof price === 'string') {
        priceInWei = parseEther(price);
      } else if (typeof price === 'number') {
        priceInWei = parseEther(price.toString());
      } else {
        throw new Error('Invalid price format');
      }

      // Get contract instance
      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      // Check if token is for sale
      const listedToken = await contract.read.getListedToken([parsedTokenId]) as any[];
      if (!listedToken || listedToken.length < 4 || !listedToken[3]) { // Check if token exists and is for sale (isForSale is at index 3)
        throw new Error('This NFT is not for sale');
      }

      // Check if price matches
      const currentPrice = listedToken[2] as bigint; // price is at index 2
      if (currentPrice !== priceInWei) {
        throw new Error('Price has changed. Please refresh and try again.');
      }

      // Estimate gas
      const gasEstimate = await contract.estimateGas.buyToken([parsedTokenId], {
        value: priceInWei,
        account: address
      });

      // Add 20% buffer to gas estimate
      const gasLimit = (gasEstimate * 120n) / 100n;

      // Execute purchase
      const hash = await contract.write.buyToken([parsedTokenId], {
        value: priceInWei,
        gas: gasLimit,
        account: address
      });

      setTxHash(hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        toast.success('NFT purchased successfully!');
        setLoading(false);
        return {
          success: true,
          txHash: hash,
          error: null
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Error buying NFT:', err);
      const errorMessage = err?.message || 'Failed to buy NFT';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return {
        success: false,
        txHash: null,
        error: errorMessage
      };
    }
  }, [address, walletClient, publicClient]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setTxHash(null);
  }, []);

  return {
    buyNFT,
    loading,
    error,
    txHash,
    reset
  };
}