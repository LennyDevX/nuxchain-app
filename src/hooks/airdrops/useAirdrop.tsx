import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Address } from 'viem'
import AirdropABI from '../../abi/Airdrop.json'

export interface AirdropStats {
  registeredUserCount: bigint
  claimedUserCount: bigint
  totalTokensDistributed: bigint
  registrationEndTime: bigint
  claimStartTime: bigint
  claimEndTime: bigint
  tokenAddress: Address
  owner: Address
  paused: boolean
}

export function useAirdrop(airdropAddress: Address) {
  // Hook para escribir en el contrato
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Hook para esperar confirmación de transacción
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Función para verificar si un usuario está registrado
  const useIsRegistered = (userAddress: Address) => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'isRegistered',
      args: [userAddress],
    })
  }

  // Función para verificar si un usuario ya reclamó
  const useHasClaimed = (userAddress: Address) => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'hasClaimed',
      args: [userAddress],
    })
  }

  // Función para obtener el conteo de usuarios registrados
  const useRegisteredUserCount = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'registeredUserCount',
    })
  }

  // Función para obtener el conteo de usuarios que reclamaron
  const useClaimedUserCount = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'claimedUserCount',
    })
  }

  // Función para obtener el tiempo de fin de registro
  const useRegistrationEndTime = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'registrationEndTime',
    })
  }

  // Función para obtener el tiempo de inicio de reclamo
  const useClaimStartTime = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'claimStartTime',
    })
  }

  // Función para obtener el tiempo de fin de reclamo
  const useClaimEndTime = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'claimEndTime',
    })
  }

  // Función para obtener la dirección del token
  const useTokenAddress = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'token',
    })
  }

  // Función para obtener el owner del contrato
  const useOwner = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'owner',
    })
  }

  // Función para verificar si el contrato está pausado
  const usePaused = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'paused',
    })
  }

  // Función para obtener el balance del contrato
  const useContractBalance = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'getContractBalance',
    })
  }

  // Función para obtener la cantidad por usuario
  const useAmountPerUser = () => {
    return useReadContract({
      address: airdropAddress,
      abi: AirdropABI.abi,
      functionName: 'amountPerUser',
    })
  }

  // Función para registrarse en el airdrop
  const register = async () => {
    try {
      await writeContract({
        address: airdropAddress,
        abi: AirdropABI.abi,
        functionName: 'register',
      })
    } catch (err) {
      console.error('Error registering for airdrop:', err)
      throw err
    }
  }

  // Función para reclamar tokens
  const claim = async () => {
    try {
      await writeContract({
        address: airdropAddress,
        abi: AirdropABI.abi,
        functionName: 'claim',
      })
    } catch (err) {
      console.error('Error claiming tokens:', err)
      throw err
    }
  }

  // Función para obtener estadísticas completas del airdrop
  const useAirdropStats = (): AirdropStats | null => {
    const registeredCount = useRegisteredUserCount()
    const claimedCount = useClaimedUserCount()
    const registrationEnd = useRegistrationEndTime()
    const claimStart = useClaimStartTime()
    const claimEnd = useClaimEndTime()
    const tokenAddr = useTokenAddress()
    const ownerAddr = useOwner()
    const isPaused = usePaused()
    const contractBalance = useContractBalance()

    if (
      registeredCount.data !== undefined &&
      claimedCount.data !== undefined &&
      registrationEnd.data !== undefined &&
      claimStart.data !== undefined &&
      claimEnd.data !== undefined &&
      tokenAddr.data !== undefined &&
      ownerAddr.data !== undefined &&
      isPaused.data !== undefined &&
      contractBalance.data !== undefined
    ) {
      return {
        registeredUserCount: registeredCount.data as bigint,
        claimedUserCount: claimedCount.data as bigint,
        totalTokensDistributed: contractBalance.data as bigint,
        registrationEndTime: registrationEnd.data as bigint,
        claimStartTime: claimStart.data as bigint,
        claimEndTime: claimEnd.data as bigint,
        tokenAddress: tokenAddr.data as Address,
        owner: ownerAddr.data as Address,
        paused: isPaused.data as boolean,
      }
    }

    return null
  }

  return {
    // Hooks de lectura
    useIsRegistered,
    useHasClaimed,
    useRegisteredUserCount,
    useClaimedUserCount,
    useRegistrationEndTime,
    useClaimStartTime,
    useClaimEndTime,
    useTokenAddress,
    useOwner,
    usePaused,
    useContractBalance,
    useAmountPerUser,
    useAirdropStats,
    
    // Funciones de escritura
    register,
    claim,
    
    // Estados de transacción
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}

export default useAirdrop