import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { getContract, isAddress, parseEther, type Abi } from 'viem';
import GameifiedMarketplaceCoreABI from '../../abi/MarketplaceCore/GameifiedMarketplaceCoreV1.json';
import { normalizeCategory } from '../../utils/ipfs/ipfsUtils';

// Use V2 contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

interface ListNFTParams {
  tokenId: string | number | bigint;
  price: string | number;
  category: string;
}

export default function useListNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const listNFT = useCallback(async ({ tokenId, price, category }: ListNFTParams) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);

    try {
      if (!walletClient || !address) {
        throw new Error('Please connect your wallet');
      }
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
        throw new Error('Invalid contract address');
      }

      // Parse tokenId
      let parsedTokenId;
      if (typeof tokenId === 'bigint') {
        parsedTokenId = tokenId;
      } else if (typeof tokenId === 'number') {
        parsedTokenId = BigInt(tokenId);
      } else if (typeof tokenId === 'string') {
        const clean = tokenId.trim();
        if (/^0x[0-9a-fA-F]+$/.test(clean) || /^\d+$/.test(clean)) {
          parsedTokenId = BigInt(clean);
        } else {
          throw new Error('Invalid tokenId format');
        }
      } else {
        throw new Error('tokenId must be a number, bigint or hex/string');
      }

      // Validate price
      const priceFloat = parseFloat(price.toString());
      if (isNaN(priceFloat) || priceFloat <= 0) {
        throw new Error('Price must be a positive number');
      }
      const priceWei = parseEther(priceFloat.toString());
      const minPrice = BigInt(1000);
      if (priceWei < minPrice) {
        throw new Error('Price is below minimum required');
      }

      // Map and normalize category
      // Removed unused categoryEs mapping
      const categoryEn = normalizeCategory(category);
      const categoryToSend = categoryEn;

      // Initialize contract
      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      // Verify ownership
      const owner = await contract.read.ownerOf([parsedTokenId]) as string;
      if (owner.toLowerCase() !== address.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Check already listed
      try {
        const listed = await contract.read.getListedToken([parsedTokenId]) as [bigint, string, bigint, bigint, boolean];
        if (listed[4] || listed[4]) {
          throw new Error('This NFT is already listed for sale');
        }
      } catch {
        // Si falla, asumimos que no está listado
      }

      // Send transaction
      const txHash = await contract.write.listTokenForSale([
        parsedTokenId,
        priceWei,
        categoryToSend
      ], {
        gas: 500000n
      });

      setTxHash(txHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      setSuccess(true);
      
      // ✅ Invalidate user profile cache to force refetch of XP
      setTimeout(() => {
        console.log('🔄 Invalidating user profile cache after listing...');
        queryClient.invalidateQueries({
          queryKey: ['readContract']
        });
        localStorage.setItem('profile_list_complete', Date.now().toString());
      }, 2000);
      
      return { txHash, receipt };
    } catch (err: unknown) {
      // Mapea errores específicos del contrato si aplica
      const error = err as { data?: string; message?: string };
      if (error.data) {
        const sig = error.data as string;
        const errorSignatures: Record<string, string> = {
          '0x8f563f02': 'CategoryNotValid',
          '0x82b42960': 'Unauthorized',
          '0x677510db': 'TokenDoesNotExist',
          '0x037eff13': 'TokenNotForSale',
          '0x356680b7': 'InsufficientFunds',
          '0xb4fa3fb3': 'InvalidInput',
          '0x0df56d4f': 'SectionPaused',
        };
        const msg = errorSignatures[sig] || 'Unknown contract error';
        setError(msg);
      } else {
        setError(error.message || 'Failed to list NFT');
      }
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient, queryClient]);

  return { listNFT, loading, error, success, txHash };
}
