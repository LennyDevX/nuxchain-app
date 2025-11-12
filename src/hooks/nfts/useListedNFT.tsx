import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getContract, isAddress, parseEther, type Abi } from 'viem';
import GameifiedMarketplaceCoreABI from '../../abi/GameifiedMarketplaceCoreV1.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

interface BuyNFTParams {
  tokenId: string | number | bigint;
  price: number;
}

interface MakeOfferParams {
  tokenId: string | number | bigint;
  offerAmount: number;
  expiresInDays: number;
}

interface AcceptOfferParams {
  offerId: string | number | bigint;
}

interface CancelOfferParams {
  offerId: string | number | bigint;
}

interface UpdatePriceParams {
  tokenId: string | number | bigint;
  newPrice: number;
}

interface UnlistNFTParams {
  tokenId: string | number | bigint;
}

// Utilidad para parsear tokenId de forma robusta
function parseTokenId(tokenId: string | number | bigint): bigint {
  let parsedTokenId;
  if (typeof tokenId === 'bigint') {
    parsedTokenId = tokenId;
  } else if (typeof tokenId === 'number' && !isNaN(tokenId)) {
    parsedTokenId = BigInt(tokenId);
  } else if (typeof tokenId === 'string') {
    const cleanTokenId = tokenId.trim().replace(/^0x0+/, '0x').replace(/^0+/, '');
    if (/^0x[0-9a-fA-F]+$/.test(cleanTokenId)) {
      parsedTokenId = BigInt(cleanTokenId);
    } else if (/^\d+$/.test(cleanTokenId)) {
      parsedTokenId = BigInt(cleanTokenId);
    }
  }
  if (parsedTokenId === undefined || parsedTokenId === null || isNaN(Number(parsedTokenId))) {
    throw new Error('tokenId is required and must be a valid number or hex string');
  }
  return parsedTokenId;
}

export default function useListedNFT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Buy a listed NFT
  const buyNFT = useCallback(async ({ tokenId, price }: BuyNFTParams) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!walletClient || !address) throw new Error('Please connect your wallet');
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');
      if (!price) throw new Error('price is required');

      const parsedTokenId = parseTokenId(tokenId);

      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      const txHash = await contract.write.buyToken([parsedTokenId], { value: parseEther(price.toString()), gas: 300000n });
      setTxHash(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : 'Error buying NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient]);

  // Make an offer for a listed NFT
  const makeOffer = useCallback(async ({ tokenId, offerAmount, expiresInDays }: MakeOfferParams) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!walletClient || !address) throw new Error('Please connect your wallet');
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');
      if (!offerAmount) throw new Error('offerAmount is required');
      if (!expiresInDays) throw new Error('expiresInDays is required');

      const parsedTokenId = parseTokenId(tokenId);

      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      const txHash = await contract.write.makeOffer([parsedTokenId, expiresInDays], {
        value: parseEther(offerAmount.toString()),
        gas: 300000n
      });
      setTxHash(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : 'Error making offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient]);

  // Accept an offer
  const acceptOffer = useCallback(async ({ offerId }: AcceptOfferParams) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!walletClient || !address) throw new Error('Please connect your wallet');
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!offerId) throw new Error('offerId is required');

      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      const txHash = await contract.write.acceptOffer([offerId], { gas: 300000n });
      setTxHash(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : 'Error accepting offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient]);

  // Cancel an offer
  const cancelOffer = useCallback(async ({ offerId }: CancelOfferParams) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!walletClient || !address) throw new Error('Please connect your wallet');
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!offerId) throw new Error('offerId is required');

      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      const txHash = await contract.write.cancelOffer([offerId], { gas: 200000n });
      setTxHash(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : 'Error cancelling offer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient]);

  // Update price of a listed NFT
  const updatePrice = useCallback(async ({ tokenId, newPrice }: UpdatePriceParams) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!walletClient || !address) throw new Error('Please connect your wallet');
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');
      if (!newPrice) throw new Error('newPrice is required');

      const parsedTokenId = parseTokenId(tokenId);

      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      const txHash = await contract.write.updatePrice([parsedTokenId, parseEther(newPrice.toString())], {
        gas: 200000n
      });
      setTxHash(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : 'Error updating price');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient]);

  // Unlist NFT
  const unlistNFT = useCallback(async ({ tokenId }: UnlistNFTParams) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      if (!walletClient || !address) throw new Error('Please connect your wallet');
      if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) throw new Error('Invalid contract address');
      if (!tokenId) throw new Error('tokenId is required');

      const parsedTokenId = parseTokenId(tokenId);

      const contract = getContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameifiedMarketplaceCoreABI.abi as Abi,
        client: { public: publicClient, wallet: walletClient }
      });

      const txHash = await contract.write.unlistedToken([parsedTokenId], {
        gas: 200000n
      });
      setTxHash(txHash);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return { txHash };
    } catch (err: unknown) {
      const error = err as Error;
      setError(error instanceof Error ? error.message : 'Error unlisting NFT');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, walletClient]);

  return {
    buyNFT,
    makeOffer,
    acceptOffer,
    cancelOffer,
    updatePrice,
    unlistNFT,
    loading,
    error,
    txHash
  };
}
