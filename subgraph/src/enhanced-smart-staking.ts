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
  Activity
} from "../generated/schema"

// Helper function to load or create user
function loadOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address)
  
  if (user == null) {
    user = new User(address)
    user.totalDeposited = BigInt.fromI32(0)
    user.totalWithdrawn = BigInt.fromI32(0)
    user.totalCompounded = BigInt.fromI32(0)
    user.nftCount = 0
    user.level = 1
    user.totalXP = BigInt.fromI32(0)
    user.createdAt = timestamp
    user.updatedAt = timestamp
    user.save()
  }
  
  return user
}

export function handleDeposited(event: Deposited): void {
  const user = loadOrCreateUser(event.params.user, event.block.timestamp)
  
  // Create deposit entity
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
  
  // Update user totals
  user.totalDeposited = user.totalDeposited.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // Create activity
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
  
  // Update user totals
  user.totalWithdrawn = user.totalWithdrawn.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
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
