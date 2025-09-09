import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Address } from 'viem'
import AirdropFactoryABI from '../../abi/AirdropFactory.json'

// Dirección del contrato AirdropFactory desde variables de entorno
const AIRDROP_FACTORY_ADDRESS = (import.meta.env.VITE_AIRDROP_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as Address

export interface AirdropInfo {
  airdropContract: Address
  token: Address
  deploymentTime: bigint
  isActive: boolean
  name: string
}

export interface DeployAirdropParams {
  token: Address
  registrationDuration: bigint
  claimDelay: bigint
  claimDuration: bigint
  name: string
}

export function useAirdropFactory() {
  // Hook para escribir en el contrato
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Hook para esperar confirmación de transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Función para obtener airdrops activos
  const useGetActiveAirdrops = (offset: number = 0, limit: number = 10) => {
    return useReadContract({
      address: AIRDROP_FACTORY_ADDRESS,
      abi: AirdropFactoryABI.abi,
      functionName: 'getActiveAirdrops',
      args: [BigInt(offset), BigInt(limit)],
    })
  }

  // Función para obtener información de un airdrop específico
  const useGetAirdropInfo = (index: number) => {
    return useReadContract({
      address: AIRDROP_FACTORY_ADDRESS,
      abi: AirdropFactoryABI.abi,
      functionName: 'getAirdropInfo',
      args: [BigInt(index)],
    })
  }

  // Función para obtener el total de airdrops
  const useGetTotalAirdrops = () => {
    return useReadContract({
      address: AIRDROP_FACTORY_ADDRESS,
      abi: AirdropFactoryABI.abi,
      functionName: 'getTotalAirdrops',
    })
  }

  // Función para desplegar un nuevo airdrop
  const deployAirdrop = async (params: DeployAirdropParams) => {
    try {
      await writeContract({
        address: AIRDROP_FACTORY_ADDRESS,
        abi: AirdropFactoryABI.abi,
        functionName: 'deployAirdrop',
        args: [
          params.token,
          params.registrationDuration,
          params.claimDelay,
          params.claimDuration,
          params.name,
        ],
      })
    } catch (err) {
      console.error('Error deploying airdrop:', err)
      throw err
    }
  }

  // Función para desactivar un airdrop
  const deactivateAirdrop = async (index: number) => {
    try {
      await writeContract({
        address: AIRDROP_FACTORY_ADDRESS,
        abi: AirdropFactoryABI.abi,
        functionName: 'deactivateAirdrop',
        args: [BigInt(index)],
      })
    } catch (err) {
      console.error('Error deactivating airdrop:', err)
      throw err
    }
  }

  return {
    // Hooks de lectura
    useGetActiveAirdrops,
    useGetAirdropInfo,
    useGetTotalAirdrops,
    
    // Funciones de escritura
    deployAirdrop,
    deactivateAirdrop,
    
    // Estados de transacción
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}

export default useAirdropFactory