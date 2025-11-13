import {
  QuestCreated as QuestCreatedEvent,
  QuestCompleted as QuestCompletedEvent,
  QuestDeactivated as QuestDeactivatedEvent,
  QuestProgressUpdated as QuestProgressUpdatedEvent,
  SocialActionRecorded as SocialActionRecordedEvent,
} from "../generated/GameifiedMarketplaceQuests/GameifiedMarketplaceQuests";
import {
  User,
  Quest,
  QuestProgress,
  Activity,
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

function recordActivity(
  userAddress: Bytes,
  type: string,
  timestamp: BigInt,
  txHash: Bytes,
  blockNumber: BigInt,
  amount: BigInt | null
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

    activity.save();
  }
}

function getOrCreateQuest(questId: BigInt): Quest {
  const questIdStr = questId.toString();
  let quest = Quest.load(questIdStr);
  if (quest == null) {
    quest = new Quest(questIdStr);
    quest.questId = questId;
    quest.questType = 0;
    quest.title = "";
    quest.description = "";
    quest.requirement = BigInt.fromI32(0);
    quest.xpReward = BigInt.fromI32(0);
    quest.active = true;
    quest.createdAt = BigInt.fromI32(0);
    quest.transactionHash = Bytes.empty();
    quest.blockNumber = BigInt.fromI32(0);
    quest.save();
  }
  return quest;
}

function getOrCreateQuestProgress(
  user: Bytes,
  questId: BigInt
): QuestProgress {
  const progressId = user
    .toHexString()
    .concat("-")
    .concat(questId.toString());
  let progress = QuestProgress.load(progressId);
  if (progress == null) {
    progress = new QuestProgress(progressId);
    progress.user = user;
    progress.questId = questId;
    progress.currentProgress = BigInt.fromI32(0);
    progress.completed = false;
    progress.completedAt = null;
    progress.transactionHash = Bytes.empty();
    progress.blockNumber = BigInt.fromI32(0);
    progress.save();
  }
  return progress;
}

export function handleQuestCreated(event: QuestCreatedEvent): void {
  const quest = getOrCreateQuest(event.params.questId);

  quest.questType = event.params.questType;
  quest.title = event.params.title;
  quest.requirement = event.params.requirement;
  quest.xpReward = event.params.xpReward;
  quest.transactionHash = event.transaction.hash;
  quest.blockNumber = event.block.number;
  quest.createdAt = event.block.timestamp;
  quest.save();

  recordActivity(
    event.transaction.from,
    "QUEST_COMPLETED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    event.params.xpReward
  );
}

export function handleQuestCompleted(event: QuestCompletedEvent): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);
  const questId = event.params.questId.toString();
  const progressId = event.params.user
    .toHexString()
    .concat("-")
    .concat(questId);

  const progress = QuestProgress.load(progressId);
  if (progress != null) {
    progress.completed = true;
    progress.completedAt = event.block.timestamp;
    progress.transactionHash = event.transaction.hash;
    progress.blockNumber = event.block.number;
    progress.save();
  }

  recordActivity(
    event.params.user,
    "QUEST_COMPLETED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null
  );

  user.questCompletionCount = user.questCompletionCount! + 1;
  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleQuestDeactivated(event: QuestDeactivatedEvent): void {
  const quest = getOrCreateQuest(event.params.questId);

  quest.active = false;
  quest.transactionHash = event.transaction.hash;
  quest.blockNumber = event.block.number;
  quest.save();

  recordActivity(
    event.transaction.from,
    "QUEST_COMPLETED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null
  );
}

export function handleQuestProgressUpdated(
  event: QuestProgressUpdatedEvent
): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);

  const progress = getOrCreateQuestProgress(
    event.params.user,
    event.params.questId
  );
  progress.currentProgress = event.params.progress;
  progress.transactionHash = event.transaction.hash;
  progress.blockNumber = event.block.number;
  progress.save();

  recordActivity(
    event.params.user,
    "QUEST_COMPLETED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    null
  );

  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleSocialActionRecorded(event: SocialActionRecordedEvent): void {
  const user = getOrCreateUser(event.params.user, event.block.timestamp);

  recordActivity(
    event.params.user,
    "XP_GAINED",
    event.block.timestamp,
    event.transaction.hash,
    event.block.number,
    event.params.newTotal
  );

  user.updatedAt = event.block.timestamp;
  user.save();
}
