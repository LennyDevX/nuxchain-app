import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Deposited,
  Withdrawn,
  WithdrawAll,
  Compounded,
  RewardsCompounded,
  AutoCompounded,
  SkillActivated,
  SkillDeactivated,
  SkillProfileUpdated,
  SkillUpgraded
} from "../generated/EnhancedSmartStaking/EnhancedSmartStaking"
import {
  User,
  Deposit,
  Withdrawal,
  Compound,
  SkillProfile,
  Activity,
  UserStats,
  GlobalStats,
  DailyStats
} from "../generated/schema"

// ✅ CONSTANTE para singleton GlobalStats
const GLOBAL_STATS_ID = "global"

// ✅ OPTIMIZADO: Helper mejorado con contadores directos
function loadOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address)
  
  if (user == null) {
    user = new User(address)
    // ✅ Inicializar contadores directos
    user.depositCount = 0
    user.withdrawalCount = 0
    user.compoundCount = 0
    user.nftMintedCount = 0
    user.nftSoldCount = 0
    user.nftBoughtCount = 0
    user.offersMadeCount = 0
    
    // Totales agregados
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

// ✅ NUEVO: Obtener o crear UserStats
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
    stats.createdAt = timestamp
    stats.updatedAt = timestamp
  }
  
  return stats
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

export function handleDeposited(event: Deposited): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create deposit entity (immutable record)
  const deposit = new Deposit(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  deposit.user = user.id
  deposit.amount = event.params.amount
  deposit.lockupDuration = event.params.lockupDuration
  deposit.timestamp = event.block.timestamp
  deposit.transactionHash = event.transaction.hash
  deposit.blockNumber = event.block.number
  deposit.save()
  
  // ✅ OPTIMIZADO: Actualizar contadores directos en User
  user.depositCount += 1
  user.totalDeposited = user.totalDeposited.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // ✅ OPTIMIZADO: Actualizar UserStats
  const userStats = getOrCreateUserStats(event.params.user, event.block.timestamp)
  userStats.totalStakingAmount = userStats.totalStakingAmount.plus(event.params.amount)
  userStats.currentStakingAmount = userStats.currentStakingAmount.plus(event.params.amount)
  userStats.lastActivityAt = event.block.timestamp
  userStats.updatedAt = event.block.timestamp
  userStats.save()
  
  // ✅ OPTIMIZADO: Actualizar GlobalStats
  const globalStats = getOrCreateGlobalStats(event.block.timestamp)
  globalStats.totalDeposited = globalStats.totalDeposited.plus(event.params.amount)
  globalStats.lastUpdatedBlock = event.block.number
  globalStats.updatedAt = event.block.timestamp
  globalStats.save()
  
  // ✅ OPTIMIZADO: Actualizar DailyStats
  const dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.totalDeposited = dailyStats.totalDeposited.plus(event.params.amount)
  dailyStats.totalStakers += 1
  dailyStats.updatedAt = event.block.timestamp
  dailyStats.save()
  
  // Create activity for audit trail
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "STAKING_DEPOSIT"
  activity.user = user.id
  activity.amount = event.params.amount
  activity.lockupDuration = event.params.lockupDuration
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create withdrawal entity
  const withdrawal = new Withdrawal(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  withdrawal.user = user.id
  withdrawal.amount = event.params.amount
  withdrawal.timestamp = event.block.timestamp
  withdrawal.transactionHash = event.transaction.hash
  withdrawal.blockNumber = event.block.number
  withdrawal.save()
  
  // ✅ OPTIMIZADO: Actualizar contadores
  user.withdrawalCount += 1
  user.totalWithdrawn = user.totalWithdrawn.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // ✅ OPTIMIZADO: Actualizar UserStats
  const userStats = getOrCreateUserStats(event.params.user, event.block.timestamp)
  userStats.currentStakingAmount = userStats.currentStakingAmount.minus(event.params.amount)
  userStats.lastActivityAt = event.block.timestamp
  userStats.updatedAt = event.block.timestamp
  userStats.save()
  
  // ✅ OPTIMIZADO: Actualizar GlobalStats
  const globalStats = getOrCreateGlobalStats(event.block.timestamp)
  globalStats.totalWithdrawn = globalStats.totalWithdrawn.plus(event.params.amount)
  globalStats.lastUpdatedBlock = event.block.number
  globalStats.updatedAt = event.block.timestamp
  globalStats.save()
  
  // ✅ OPTIMIZADO: Actualizar DailyStats
  const dailyStats = getOrCreateDailyStats(event.block.timestamp)
  dailyStats.totalWithdrawn = dailyStats.totalWithdrawn.plus(event.params.amount)
  dailyStats.updatedAt = event.block.timestamp
  dailyStats.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "STAKING_WITHDRAW"
  activity.user = user.id
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleRewardsCompounded(event: RewardsCompounded): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create compound entity
  const compound = new Compound(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  compound.user = user.id
  compound.amount = event.params.amount
  compound.timestamp = event.block.timestamp
  compound.transactionHash = event.transaction.hash
  compound.blockNumber = event.block.number
  compound.save()
  
  // Update user totals
  user.totalCompounded = user.totalCompounded.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "STAKING_COMPOUND"
  activity.user = user.id
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleWithdrawAll(event: WithdrawAll): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create withdrawal entity
  const withdrawal = new Withdrawal(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  withdrawal.user = user.id
  withdrawal.amount = event.params.totalAmount
  withdrawal.timestamp = event.block.timestamp
  withdrawal.transactionHash = event.transaction.hash
  withdrawal.blockNumber = event.block.number
  withdrawal.save()
  
  // Update user totals
  user.totalWithdrawn = user.totalWithdrawn.plus(event.params.totalAmount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "STAKING_WITHDRAW_ALL"
  activity.user = user.id
  activity.amount = event.params.totalAmount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleCompounded(event: Compounded): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create compound entity
  const compound = new Compound(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  compound.user = user.id
  compound.amount = event.params.amount
  compound.timestamp = event.block.timestamp
  compound.transactionHash = event.transaction.hash
  compound.blockNumber = event.block.number
  compound.save()
  
  // Update user totals
  user.totalCompounded = user.totalCompounded.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "STAKING_COMPOUND"
  activity.user = user.id
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleAutoCompounded(event: AutoCompounded): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create compound entity
  const compound = new Compound(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  compound.user = user.id
  compound.amount = event.params.amount
  compound.timestamp = event.block.timestamp
  compound.transactionHash = event.transaction.hash
  compound.blockNumber = event.block.number
  compound.save()
  
  // Update user totals
  user.totalCompounded = user.totalCompounded.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "STAKING_AUTO_COMPOUND"
  activity.user = user.id
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleSkillActivated(event: SkillActivated): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "SKILL_ACTIVATED"
  activity.user = user.id
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleSkillDeactivated(event: SkillDeactivated): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "SKILL_DEACTIVATED"
  activity.user = user.id
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleSkillProfileUpdated(event: SkillProfileUpdated): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create or update skill profile
  let profile = SkillProfile.load(event.params.user.toHexString())
  if (profile == null) {
    profile = new SkillProfile(event.params.user.toHexString())
    profile.user = user.id
    profile.totalXP = BigInt.fromI32(0)
  }
  
  profile.level = event.params.level
  profile.maxActiveSkills = event.params.maxActiveSkills
  profile.stakingBoostTotal = event.params.stakingBoostTotal
  profile.feeDiscountTotal = 0 // Will be calculated if needed
  profile.hasAutoCompound = false // Will be updated if needed
  profile.updatedAt = event.block.timestamp
  profile.save()
  
  // Update user level
  user.level = event.params.level
  user.updatedAt = event.block.timestamp
  user.save()
}

export function handleSkillUpgraded(event: SkillUpgraded): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create activity
  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "SKILL_UPGRADED"
  activity.user = user.id
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}
