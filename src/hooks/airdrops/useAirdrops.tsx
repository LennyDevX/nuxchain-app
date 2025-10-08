import { useState, useEffect, useCallback } from 'react'
import type { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useAirdropFactory, type AirdropInfo } from './useAirdropFactory.tsx'
import { useAirdrop } from './useAirdrop.tsx'

export interface AirdropWithStats extends AirdropInfo {
  registeredUsers: number
  claimedUsers: number
  isUserRegistered: boolean
  isUserClaimed: boolean
  canRegister: boolean
  canClaim: boolean
  registrationEndTime: bigint
  claimStartTime: bigint
  claimEndTime: bigint
}

export function useAirdrops() {
  const { address: userAddress } = useAccount()
  const [selectedAirdrop, setSelectedAirdrop] = useState<Address | null>(null)
  const [airdropsWithStats, setAirdropsWithStats] = useState<AirdropWithStats[]>([])
  
  const factory = useAirdropFactory()
  const activeAirdropsQuery = factory.useGetActiveAirdrops(0, 50)
  const selectedAirdropHook = useAirdrop(selectedAirdrop || '0x0000000000000000000000000000000000000000')

  // Función para obtener estadísticas detalladas de todos los airdrops activos
  const loadAirdropsWithStats = useCallback(() => {
    if (!activeAirdropsQuery.data || !userAddress) {
      setAirdropsWithStats([])
      return
    }
    
    try {
      const [activeAirdrops] = activeAirdropsQuery.data as [AirdropInfo[], bigint]
      
      // Crear estadísticas básicas sin hooks dinámicos
      const airdropsWithBasicStats = activeAirdrops.map((airdrop) => {

        
        return {
          ...airdrop,
          registeredUsers: 0, // Se actualizará con datos reales cuando estén disponibles
          claimedUsers: 0,
          isUserRegistered: false,
          isUserClaimed: false,
          canRegister: true, // Valor por defecto
          canClaim: false,
          registrationEndTime: BigInt(0),
          claimStartTime: BigInt(0),
          claimEndTime: BigInt(0),
        } as AirdropWithStats
      })
      
      setAirdropsWithStats(airdropsWithBasicStats)
    } catch (error) {
      console.error('Error loading airdrops with stats:', error)
      setAirdropsWithStats([])
    }
  }, [activeAirdropsQuery.data, userAddress])

  // Cargar estadísticas cuando cambien los datos
  useEffect(() => {
    loadAirdropsWithStats()
  }, [loadAirdropsWithStats])

  // Función para registrarse en un airdrop específico
  const registerForAirdrop = async (airdropAddress: Address) => {
    setSelectedAirdrop(airdropAddress)
    // La lógica de registro se manejará a través del hook selectedAirdropHook
    // que se actualiza cuando cambia selectedAirdrop
  }

  // Función para reclamar tokens de un airdrop específico
  const claimFromAirdrop = async (airdropAddress: Address) => {
    setSelectedAirdrop(airdropAddress)
    // La lógica de reclamo se manejará a través del hook selectedAirdropHook
    // que se actualiza cuando cambia selectedAirdrop
  }

  // Función para obtener estadísticas globales
  const getGlobalStats = () => {
    const totalAirdrops = airdropsWithStats.length
    const totalRegisteredUsers = airdropsWithStats.reduce(
      (sum, airdrop) => sum + airdrop.registeredUsers, 
      0
    )
    const totalClaimedUsers = airdropsWithStats.reduce(
      (sum, airdrop) => sum + airdrop.claimedUsers, 
      0
    )
    const userRegistrations = airdropsWithStats.filter(
      (airdrop) => airdrop.isUserRegistered
    ).length
    const userClaims = airdropsWithStats.filter(
      (airdrop) => airdrop.isUserClaimed
    ).length

    return {
      totalAirdrops,
      totalRegisteredUsers,
      totalClaimedUsers,
      userRegistrations,
      userClaims,
    }
  }

  return {
    // Datos
    airdrops: airdropsWithStats,
    globalStats: getGlobalStats(),
    
    // Estados
    loading: activeAirdropsQuery.isLoading,
    error: activeAirdropsQuery.error,
    
    // Funciones
    registerForAirdrop,
    claimFromAirdrop,
    refreshData: loadAirdropsWithStats,
    
    // Factory functions
    deployAirdrop: factory.deployAirdrop,
    
    // Transaction states
    isPending: selectedAirdropHook.isPending || factory.isPending,
    isConfirming: selectedAirdropHook.isConfirming || factory.isConfirming,
    isConfirmed: selectedAirdropHook.isConfirmed || factory.isConfirmed,
    transactionError: selectedAirdropHook.error || factory.error,
    transactionHash: selectedAirdropHook.hash || factory.hash,
  }
}

export default useAirdrops