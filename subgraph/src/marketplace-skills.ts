import {
  SkillAdded as SkillAddedEvent,
  SkillDeactivatedManually as SkillDeactivatedManuallyEvent,
  SkillExpired as SkillExpiredEvent,
  SkillNFTCreated as SkillNFTCreatedEvent,
  SkillRenewed as SkillRenewedEvent,
  SkillSwitched as SkillSwitchedEvent,
} from "../generated/GameifiedMarketplaceSkillsV2/GameifiedMarketplaceSkillsV2";
import {
  User,
  Activity,
  SkillRenewal,
  SkillSwitch,
} from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

function getOrCreateUser(address: Bytes, timestamp: BigInt): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.depositCount = 0;
    user.withdrawalCount = 0;
    user.compoundCount = 0;
    user.nftMintedCount = 0;
    user.nftSoldCount = 0;
    user.nftBoughtCount = 0;
    user.offersMadeCount = 0;
    user.skillPurchaseCount = 0;
    user.skillRenewalCount = 0;
    user.skillSwitchCount = 0;
    user.questCompletionCount = 0;
    user.totalDeposited = BigInt.fromI32(0);
    user.totalWithdrawn = BigInt.fromI32(0);
    user.totalCompounded = BigInt.fromI32(0);
    user.totalEarnings = BigInt.fromI32(0);
    user.totalSpent = BigInt.fromI32(0);
    user.level = 1;
    user.totalXP = BigInt.fromI32(0);
    user.createdAt = timestamp;
    user.updatedAt = timestamp;
    user.save();
  } else {
    // Initialize new fields for existing users
    if (user.skillPurchaseCount === null) user.skillPurchaseCount = 0;
    if (user.skillRenewalCount === null) user.skillRenewalCount = 0;
    if (user.skillSwitchCount === null) user.skillSwitchCount = 0;
    if (user.questCompletionCount === null) user.questCompletionCount = 0;
    if (user.totalEarnings === null) user.totalEarnings = BigInt.fromI32(0);
    if (user.totalSpent === null) user.totalSpent = BigInt.fromI32(0);
    user.updatedAt = timestamp;
    user.save();
  }
  return user;
}

export function handleSkillAdded(event: SkillAddedEvent): void {
  recordActivity(
    event.transaction.from,
    "SKILL_ACTIVATED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null,
    event.params.tokenId
  );
}

export function handleSkillDeactivatedManually(
  event: SkillDeactivatedManuallyEvent
): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);

  recordActivity(
    event.params.user,
    "SKILL_DEACTIVATED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null,
    event.params.tokenId
  );

  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleSkillExpired(event: SkillExpiredEvent): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);

  recordActivity(
    event.params.user,
    "SKILL_DEACTIVATED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null,
    event.params.tokenId
  );

  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleSkillNFTCreated(event: SkillNFTCreatedEvent): void {
  const user = getOrCreateUser(event.params.creator, event.block.timestamp);

  recordActivity(
    event.params.creator,
    "NFT_MINT",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    event.params.totalXP,
    event.params.tokenId
  );

  user.nftMintedCount += 1;
  user.totalXP = user.totalXP.plus(event.params.totalXP);
  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleSkillRenewed(event: SkillRenewedEvent): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);

  // Create immutable SkillRenewal record
  const renewalId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  const renewal = new SkillRenewal(renewalId);
  renewal.user = event.params.user;
  renewal.skillId = event.params.tokenId;
  renewal.newExpiryTime = event.params.newExpiryTime;
  renewal.timestamp = event.block.timestamp;
  renewal.transactionHash = event.transaction.hash;
  renewal.blockNumber = event.block.number;
  renewal.save();

  recordActivity(
    event.params.user,
    "SKILL_ACTIVATED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null,
    event.params.tokenId
  );

  user.skillRenewalCount = user.skillRenewalCount! + 1;
  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleSkillSwitched(event: SkillSwitchedEvent): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);

  // Create immutable SkillSwitch record
  const switchId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  const skillSwitch = new SkillSwitch(switchId);
  skillSwitch.user = event.params.user;
  skillSwitch.oldTokenId = event.params.oldTokenId;
  skillSwitch.newTokenId = event.params.newTokenId;
  skillSwitch.skillType = event.params.skillType;
  skillSwitch.switchFee = event.params.switchFee;
  skillSwitch.timestamp = event.block.timestamp;
  skillSwitch.transactionHash = event.transaction.hash;
  skillSwitch.blockNumber = event.block.number;
  skillSwitch.save();

  recordActivity(
    event.params.user,
    "XP_GAINED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null,
    event.params.newTokenId
  );

  user.skillSwitchCount = user.skillSwitchCount! + 1;
  user.totalSpent = user.totalSpent!.plus(event.params.switchFee);
  user.updatedAt = event.block.timestamp;
  user.save();
}

function recordActivity(
  userAddress: Bytes,
  type: string,
  timestamp: BigInt,
  txHash: Bytes,
  blockNumber: BigInt,
  amount: BigInt | null,
  tokenId: BigInt | null
): void {
  const activityId = txHash
    .toHexString()
    .concat("-")
    .concat(blockNumber.toString());
  let activity = Activity.load(activityId);
  if (activity == null) {
    activity = new Activity(activityId);
    activity.user = userAddress;
    activity.timestamp = timestamp;
    activity.transactionHash = txHash;
    activity.blockNumber = blockNumber;

    if (amount) {
      activity.amount = amount;
    }
    if (tokenId) {
      activity.tokenId = tokenId;
    }

    activity.save();
  }
}
