import { useMemo } from 'react';
import { useRecentActivities, type Activity, type ActivityType } from '../../hooks/activity/useRecentActivities';

interface ActivityStats {
  totalStaked: number;
  totalWithdrawn: number;
  nftsMinted: number;
  nftsListed: number;
  nftsSold: number;
  nftsPurchased: number;
  offersMade: number;
  totalValue: number;
}

/**
 * Hook para calcular estadísticas de actividad del usuario
 */
export function useActivityStats() {
  const { activities, isLoading, error } = useRecentActivities(100); // Obtener más actividades para estadísticas

  const stats = useMemo((): ActivityStats => {
    const initialStats: ActivityStats = {
      totalStaked: 0,
      totalWithdrawn: 0,
      nftsMinted: 0,
      nftsListed: 0,
      nftsSold: 0,
      nftsPurchased: 0,
      offersMade: 0,
      totalValue: 0,
    };

    return activities.reduce((acc, activity: Activity) => {
      const amount = parseFloat(activity.details.amount || '0');
      
      switch (activity.type as ActivityType) {
        case 'STAKING_DEPOSIT':
          acc.totalStaked += amount;
          acc.totalValue += amount;
          break;
        case 'STAKING_WITHDRAW':
          acc.totalWithdrawn += amount;
          break;
        case 'NFT_MINT':
          acc.nftsMinted += 1;
          break;
        case 'NFT_LIST':
          acc.nftsListed += 1;
          break;
        case 'NFT_SALE':
          acc.nftsSold += 1;
          acc.totalValue += parseFloat(activity.details.price || '0');
          break;
        case 'NFT_PURCHASE':
          acc.nftsPurchased += 1;
          break;
        case 'OFFER_MADE':
          acc.offersMade += 1;
          break;
      }
      
      return acc;
    }, initialStats);
  }, [activities]);

  return {
    stats,
    isLoading,
    error,
  };
}
