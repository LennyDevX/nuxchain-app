import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  APYUpdated,
  QuestRewardClaimed,
  RewardFunded,
  EmergencyWithdrawal
} from "../generated/EnhancedSmartStakingRewards/EnhancedSmartStakingRewards"
import {
  User,
  GlobalStats,
  DailyStats,
  QuestRewardClaim,
  RewardFunding,
  Activity
} from "../generated/schema"

// ✅ CONSTANTE para singleton GlobalStats
const GLOBAL_STATS_ID = "global"

// ✅ Helper para cargar o crear usuario
function loadOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address)
  
  if (user == null) {
    user = new User(address)
    user.depositCount = 0
    user.withdrawalCount = 0
    user.compoundCount = 0
    user.nftMintedCount = 0
    user.nftSoldCount = 0
    user.nftBoughtCount = 0
    user.offersMadeCount = 0
    user.questRewardClaimCount = 0
    user.totalDeposited = BigInt.fromI32(0)
    user.totalWithdrawn = BigInt.fromI32(0)
    user.totalCompounded = BigInt.fromI32(0)
    user.totalQuestRewards = BigInt.fromI32(0)
    user.level = 1
    user.totalXP = BigInt.fromI32(0)
    user.createdAt = timestamp
    user.updatedAt = timestamp
    user.save()
  }
  
  return user
}

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

// ✅ NUEVO: Handler para QuestRewardClaimed
export function handleQuestRewardClaimed(event: QuestRewardClaimed): void {
  const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  // Crear o cargar usuario
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Actualizar contador de claims del usuario
  const currentCount = user.questRewardClaimCount
  user.questRewardClaimCount = currentCount ? currentCount + 1 : 1
  
  // Actualizar total de recompensas
  const currentTotal = user.totalQuestRewards
  user.totalQuestRewards = currentTotal 
    ? currentTotal.plus(event.params.amount) 
    : event.params.amount
  
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Crear entidad QuestRewardClaim
  const claim = new QuestRewardClaim(id)
  claim.user = user.id
  claim.questId = event.params.questId
  claim.amount = event.params.amount
  claim.boostApplied = event.params.boostApplied
  claim.timestamp = event.block.timestamp
  claim.transactionHash = event.transaction.hash
  claim.blockNumber = event.block.number
  claim.save()
  
  // Crear Activity
  const activity = new Activity(id)
  activity.type = "QUEST_COMPLETED"
  activity.user = event.params.user
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.amount = event.params.amount
  activity.save()
}

// ✅ NUEVO: Handler para RewardFunded
export function handleRewardFunded(event: RewardFunded): void {
  const id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  // Crear entidad RewardFunding
  const funding = new RewardFunding(id)
  funding.funder = event.params.funder
  funding.amount = event.params.amount
  funding.timestamp = event.block.timestamp
  funding.transactionHash = event.transaction.hash
  funding.blockNumber = event.block.number
  funding.save()
  
  // Actualizar global stats
  const globalStats = getOrCreateGlobalStats(event.block.timestamp)
  globalStats.updatedAt = event.block.timestamp
  globalStats.save()
}

// ✅ NUEVO: Handler para EmergencyWithdrawal en módulo de Rewards
export function handleRewardsEmergencyWithdrawal(event: EmergencyWithdrawal): void {
  // Actualizar global stats
  const globalStats = getOrCreateGlobalStats(event.block.timestamp)
  globalStats.updatedAt = event.block.timestamp
  globalStats.save()
}
