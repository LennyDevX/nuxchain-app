import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import Abi from '../../abi/Marketplace.json';

const MARKETPLACE_CONTRACT_ADDRESS = (import.meta as any).env.VITE_MARKETPLACE_ADDRESS;

interface UseMarketplaceListReturn {
  listNFT: (tokenId: string, price: string, category?: string) => Promise<void>;
  unlistNFT: (tokenId: string) => Promise<void>;
  loading: boolean;
  listError: string | null;
  txHash: string | null;
  reset: () => void;
}

export const useMarketplaceList = (): UseMarketplaceListReturn => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [listError, setListError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<'list' | 'unlist' | null>(null);

  const loading = isPending || isConfirming;

  const listNFT = async (tokenId: string, price: string, category: string = 'general') => {
    if (!isConnected || !address) {
      toast.error('Por favor conecta tu wallet');
      return;
    }

    if (!tokenId || !price) {
      toast.error('Token ID y precio son requeridos');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Por favor ingresa un precio válido');
      return;
    }

    try {
      setListError(null);
      setCurrentAction('list');
      
      toast.loading('Listando NFT en el marketplace...', { id: 'list' });
      
      writeContract({
        address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        abi: Abi.abi,
        functionName: 'listToken',
        args: [BigInt(tokenId), parseEther(price), category]
      });

    } catch (error: any) {
      const errorMessage = error?.message || 'Error al listar NFT';
      setListError(errorMessage);
      toast.error(errorMessage, { id: 'list' });
      console.error('List error:', error);
      setCurrentAction(null);
    }
  };

  const unlistNFT = async (tokenId: string) => {
    if (!isConnected || !address) {
      toast.error('Por favor conecta tu wallet');
      return;
    }

    if (!tokenId) {
      toast.error('Token ID es requerido');
      return;
    }

    try {
      setListError(null);
      setCurrentAction('unlist');
      
      toast.loading('Removiendo NFT del marketplace...', { id: 'unlist' });
      
      writeContract({
        address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        abi: Abi.abi,
        functionName: 'unlistToken',
        args: [BigInt(tokenId)]
      });

    } catch (error: any) {
      const errorMessage = error?.message || 'Error al remover NFT del marketplace';
      setListError(errorMessage);
      toast.error(errorMessage, { id: 'unlist' });
      console.error('Unlist error:', error);
      setCurrentAction(null);
    }
  };

  const reset = () => {
    setListError(null);
    setCurrentAction(null);
  };

  // Handle transaction success
  if (isSuccess && hash && currentAction) {
    const successMessage = currentAction === 'list' 
      ? '¡NFT listado exitosamente!' 
      : '¡NFT removido del marketplace!';
    
    toast.success(successMessage, { id: currentAction });
    setCurrentAction(null);
  }

  // Handle transaction errors
  if (writeError && currentAction) {
    const errorMessage = writeError.message || 'Error en la transacción';
    setListError(errorMessage);
    toast.error(errorMessage, { id: currentAction });
    setCurrentAction(null);
  }

  return {
    listNFT,
    unlistNFT,
    loading,
    listError,
    txHash: hash || null,
    reset
  };
};