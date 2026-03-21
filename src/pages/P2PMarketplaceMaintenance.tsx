import MaintenancePage from './MaintenancePage'
import { MAINTENANCE_CONFIG } from '../config/maintenance'

export default function P2PMarketplaceMaintenance() {
  const cfg = (MAINTENANCE_CONFIG as Record<string, { message: string; estimatedTime: number; startTime: string }>)['p2pmarket']
  return (
    <MaintenancePage
      title="P2P Market"
      message={cfg?.message ?? 'The P2P Marketplace is being set up. Trading will be available soon!'}
      estimatedTime={cfg?.estimatedTime ?? 4320}
      startTime={cfg?.startTime ?? new Date().toISOString()}
    />
  )
}
