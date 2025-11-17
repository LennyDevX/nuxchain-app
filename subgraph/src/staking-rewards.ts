import { BigInt } from "@graphprotocol/graph-ts"
import {
  APYUpdated
} from "../generated/EnhancedSmartStakingRewards/EnhancedSmartStakingRewards"
import {
  GlobalStats,
  DailyStats
} from "../generated/schema"

// ✅ CONSTANTE para singleton GlobalStats
const GLOBAL_STATS_ID = "global"

// ✅ NUEVO: Obtener o crear GlobalStats
function getOrCreateGlobalStats(timestamp: BigInt): GlobalStats {
  let stats = GlobalStats.load(GLOBAL_STATS_ID)
  
  if (stats == null) {
    stats = new GlobalStats(GLOBAL_STATS_ID)
    stats.totalDeposited = BigInt.fromI32(0)
    stats.totalWithdrawn = BigInt.fromI32(0)
    stats.totalCompounded = BigInt.fromI32(0)
    stats.totalNFTsMinted = 0
    stats.totalNFTsSold = 0
    stats.totalMarketplaceVolume = BigInt.fromI32(0)
    stats.totalUsers = 0
    stats.totalActiveUsers = 0
    stats.lastUpdatedBlock = BigInt.fromI32(0)
    stats.updatedAt = timestamp
  }
  
  return stats
}

// ✅ NUEVO: Obtener o crear DailyStats
function getOrCreateDailyStats(timestamp: BigInt): DailyStats {
  const dayId = (timestamp.toI64() / 86400).toString()
  let stats = DailyStats.load(dayId)
  
  if (stats == null) {
    stats = new DailyStats(dayId)
    stats.date = timestamp
    stats.totalDeposited = BigInt.fromI32(0)
    stats.totalWithdrawn = BigInt.fromI32(0)
    stats.totalCompounded = BigInt.fromI32(0)
    stats.totalStakers = 0
    stats.totalNFTsMinted = 0
    stats.totalNFTsSold = 0
    stats.totalMarketplaceVolume = BigInt.fromI32(0)
    stats.uniqueUsers = 0
    stats.updatedAt = timestamp
  }
  
  return stats
}

export function handleAPYUpdated(event: APYUpdated): void {
  // Update global rewards statistics when APY changes
  const globalStats = getOrCreateGlobalStats(event.block.timestamp)
  globalStats.updatedAt = event.block.timestamp
  globalStats.save()
  
  // Update daily stats
  const dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.updatedAt = event.block.timestamp
  dailyStats.save()
}
