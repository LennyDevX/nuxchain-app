import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  IndividualSkillActivated,
  IndividualSkillDeactivated,
  IndividualSkillExpired,
  IndividualSkillPurchased,
  IndividualSkillRenewed,
  IndividualSkillTransferred,
} from "../generated/IIndividualSkills/IIndividualSkills";
import { IndividualSkill, User, SkillRenewal } from "../generated/schema";

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

export function handleIndividualSkillActivated(event: IndividualSkillActivated): void {
  getOrCreateUser(event.params.user, event.block.timestamp);
  
  const skillId = event.params.skillId.toString();
  const skill = IndividualSkill.load(skillId);
  
  if (skill) {
    skill.isActive = true;
    skill.blockNumber = event.block.number;
    skill.transactionHash = event.transaction.hash;
    skill.save();
  }
}

export function handleIndividualSkillDeactivated(event: IndividualSkillDeactivated): void {
  getOrCreateUser(event.params.user, event.block.timestamp);
  
  const skillId = event.params.skillId.toString();
  const skill = IndividualSkill.load(skillId);
  
  if (skill) {
    skill.isActive = false;
    skill.blockNumber = event.block.number;
    skill.transactionHash = event.transaction.hash;
    skill.save();
  }
}

export function handleIndividualSkillExpired(event: IndividualSkillExpired): void {
  getOrCreateUser(event.params.user, event.block.timestamp);
  
  const skillId = event.params.skillId.toString();
  const skill = IndividualSkill.load(skillId);
  
  if (skill) {
    skill.isActive = false;
    skill.blockNumber = event.block.number;
    skill.transactionHash = event.transaction.hash;
    skill.save();
  }
}

export function handleIndividualSkillPurchased(event: IndividualSkillPurchased): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);
  
  const skillId = event.params.skillId.toString();
  const skill = new IndividualSkill(skillId);
  
  skill.user = user.id;
  skill.skillId = event.params.skillId;
  skill.skillType = event.params.skillType;
  skill.rarity = event.params.rarity;
  skill.level = BigInt.fromI32(1);
  skill.owner = event.params.user;
  skill.purchasedAt = event.block.timestamp;
  skill.expiresAt = event.block.timestamp.plus(BigInt.fromI32(30 * 24 * 60 * 60)); // 30 days
  skill.isActive = false;
  skill.metadata = "";
  skill.createdAt = event.block.timestamp;
  skill.blockNumber = event.block.number;
  skill.transactionHash = event.transaction.hash;
  
  skill.save();
}

export function handleIndividualSkillRenewed(event: IndividualSkillRenewed): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);
  
  const skillId = event.params.skillId.toString();
  const skill = IndividualSkill.load(skillId);
  
  if (skill) {
    skill.expiresAt = event.params.newExpiryTime;
    skill.blockNumber = event.block.number;
    skill.transactionHash = event.transaction.hash;
    skill.save();
  }
  
  // Record renewal event
  const renewalId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const renewal = new SkillRenewal(renewalId);
  renewal.user = user.id;
  renewal.skillId = event.params.skillId;
  renewal.newExpiryTime = event.params.newExpiryTime;
  renewal.timestamp = event.block.timestamp;
  renewal.transactionHash = event.transaction.hash;
  renewal.blockNumber = event.block.number;
  renewal.save();
}

export function handleIndividualSkillTransferred(event: IndividualSkillTransferred): void {
  getOrCreateUser(event.params.from, event.block.timestamp);
  const toUser = getOrCreateUser(event.params.to, event.block.timestamp);
  
  const skillId = event.params.skillId.toString();
  const skill = IndividualSkill.load(skillId);
  
  if (skill) {
    skill.user = toUser.id;
    skill.owner = event.params.to;
    skill.blockNumber = event.block.number;
    skill.transactionHash = event.transaction.hash;
    skill.save();
  }
}
