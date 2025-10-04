import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  DepositMade,
  WithdrawalMade,
  RewardsCompounded,
} from "../generated/SmartStaking/SmartStaking";
import { User, Deposit, Withdrawal, Compound, Activity } from "../generated/schema";

// Helper function to get or create User entity
function getOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address);
  
  if (user == null) {
    user = new User(address);
    user.totalDeposited = BigInt.fromI32(0);
    user.totalWithdrawn = BigInt.fromI32(0);
    user.totalCompounded = BigInt.fromI32(0);
    user.nftCount = 0;
    user.createdAt = timestamp;
    user.updatedAt = timestamp;
    user.save();
  }
  
  return user;
}

export function handleDepositMade(event: DepositMade): void {
  // Create or update user
  const user = getOrCreateUser(event.params.user, event.params.timestamp);
  user.totalDeposited = user.totalDeposited.plus(event.params.amount);
  user.updatedAt = event.params.timestamp;
  user.save();

  // Create deposit entity
  const depositId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const deposit = new Deposit(depositId);
  deposit.user = user.id;
  deposit.amount = event.params.amount;
  deposit.lockupDuration = BigInt.fromI32(0); // Not available in event, would need to query contract
  deposit.timestamp = event.params.timestamp;
  deposit.transactionHash = event.transaction.hash;
  deposit.blockNumber = event.block.number;
  deposit.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(depositId + "-activity");
  activity.type = "STAKING_DEPOSIT";
  activity.user = user.id;
  activity.timestamp = event.params.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.amount = event.params.amount;
  activity.lockupDuration = BigInt.fromI32(0); // Not available in event
  activity.save();
}

export function handleWithdrawalMade(event: WithdrawalMade): void {
  // Create or update user
  const user = getOrCreateUser(event.params.user, event.params.timestamp);
  user.totalWithdrawn = user.totalWithdrawn.plus(event.params.amount);
  user.updatedAt = event.params.timestamp;
  user.save();

  // Create withdrawal entity
  const withdrawalId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const withdrawal = new Withdrawal(withdrawalId);
  withdrawal.user = user.id;
  withdrawal.amount = event.params.amount;
  withdrawal.timestamp = event.params.timestamp;
  withdrawal.transactionHash = event.transaction.hash;
  withdrawal.blockNumber = event.block.number;
  withdrawal.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(withdrawalId + "-activity");
  activity.type = "STAKING_WITHDRAW";
  activity.user = user.id;
  activity.timestamp = event.params.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.amount = event.params.amount;
  activity.save();
}

export function handleRewardsCompounded(event: RewardsCompounded): void {
  // Create or update user
  const user = getOrCreateUser(event.params.user, event.block.timestamp);
  user.totalCompounded = user.totalCompounded.plus(event.params.amount);
  user.updatedAt = event.block.timestamp;
  user.save();

  // Create compound entity
  const compoundId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const compound = new Compound(compoundId);
  compound.user = user.id;
  compound.amount = event.params.amount;
  compound.timestamp = event.block.timestamp;
  compound.transactionHash = event.transaction.hash;
  compound.blockNumber = event.block.number;
  compound.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(compoundId + "-activity");
  activity.type = "STAKING_COMPOUND";
  activity.user = user.id;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.amount = event.params.amount;
  activity.save();
}
