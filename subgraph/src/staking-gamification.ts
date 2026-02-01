import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AchievementUnlocked,
  AutoCompoundDisabled,
  AutoCompoundEnabled,
  AutoCompoundExecuted,
  QuestCompleted,
  XPUpdated
} from "../generated/EnhancedSmartStakingGamification/EnhancedSmartStakingGamification"
import {
  User,
  Activity,
  UserStats,
  GlobalStats
} from "../generated/schema"

// ✅ CONSTANTE para singleton GlobalStats
const GLOBAL_STATS_ID = "global"

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
    user.totalDeposited = BigInt.fromI32(0)
    user.totalWithdrawn = BigInt.fromI32(0)
    user.totalCompounded = BigInt.fromI32(0)
    user.level = 1
    user.totalXP = BigInt.fromI32(0)
    user.createdAt = timestamp
    user.updatedAt = timestamp
    user.save()
  }
  
  return user
}

function getOrCreateUserStats(userAddress: Bytes, timestamp: BigInt): UserStats {
  let stats = UserStats.load(userAddress)
  
  if (stats == null) {
    stats = new UserStats(userAddress)
    stats.user = userAddress
    stats.totalStakingAmount = BigInt.fromI32(0)
    stats.currentStakingAmount = BigInt.fromI32(0)
    stats.totalRewardsEarned = BigInt.fromI32(0)
    stats.totalRoyaltiesReceived = BigInt.fromI32(0)
    stats.nftsMintedCount = 0
    stats.nftsSoldCount = 0
    stats.nftsBoughtCount = 0
    stats.totalMarketplaceVolume = BigInt.fromI32(0)
    stats.level = 1
    stats.xp = BigInt.fromI32(0)
    stats.lastActivityAt = timestamp
    stats.createdAt = timestamp
    stats.updatedAt = timestamp
  }
  
  return stats
}

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

export function handleAchievementUnlocked(event: AchievementUnlocked): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Update user stats
  const userStats = getOrCreateUserStats(event.params.user, event.block.timestamp)
  userStats.totalRewardsEarned = userStats.totalRewardsEarned.plus(event.params.rewardAmount)
  userStats.lastActivityAt = event.block.timestamp
  userStats.updatedAt = event.block.timestamp
  userStats.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "ACHIEVEMENT_UNLOCKED"
  activity.user = user.id
  activity.amount = event.params.rewardAmount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleAutoCompoundEnabled(event: AutoCompoundEnabled): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "AUTO_COMPOUND_ENABLED"
  activity.user = user.id
  activity.amount = event.params.minAmount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleAutoCompoundDisabled(event: AutoCompoundDisabled): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "AUTO_COMPOUND_DISABLED"
  activity.user = user.id
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleAutoCompoundExecuted(event: AutoCompoundExecuted): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Update user
  user.compoundCount += 1
  user.totalCompounded = user.totalCompounded.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "AUTO_COMPOUND_EXECUTED"
  activity.user = user.id
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
  
  // Update user stats
  const userStats = getOrCreateUserStats(event.params.user, event.block.timestamp)
  userStats.lastActivityAt = event.block.timestamp
  userStats.updatedAt = event.block.timestamp
  userStats.save()
}

export function handleQuestCompleted(event: QuestCompleted): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "QUEST_COMPLETED"
  activity.user = user.id
  activity.amount = event.params.rewardAmount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
  
  // Update user stats
  const userStats = getOrCreateUserStats(event.params.user, event.block.timestamp)
  userStats.totalRewardsEarned = userStats.totalRewardsEarned.plus(event.params.rewardAmount)
  userStats.lastActivityAt = event.block.timestamp
  userStats.updatedAt = event.block.timestamp
  userStats.save()
}

export function handleXPUpdated(event: XPUpdated): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Update user
  user.totalXP = event.params.newXP
  user.level = event.params.newLevel
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Update user stats
  const userStats = getOrCreateUserStats(event.params.user, event.block.timestamp)
  userStats.xp = event.params.newXP
  userStats.level = event.params.newLevel
  userStats.lastActivityAt = event.block.timestamp
  userStats.updatedAt = event.block.timestamp
  userStats.save()
  
  // Update global stats
  const globalStats = getOrCreateGlobalStats(event.block.timestamp)
  globalStats.updatedAt = event.block.timestamp
  globalStats.save()
}
