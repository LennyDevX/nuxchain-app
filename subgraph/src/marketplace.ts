import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  TokenMinted,
  TokenListed,
  TokenSold,
  TokenUnlisted,
  OfferCreated as OfferCreatedEvent,
  OfferAccepted as OfferAcceptedEvent,
} from "../generated/Marketplace/Marketplace";
import {
  User,
  NFTMint,
  NFTList,
  NFTSale,
  NFTPurchase,
  NFTUnlist,
  OfferCreated,
  OfferAccepted,
  Activity,
} from "../generated/schema";

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

export function handleTokenMinted(event: TokenMinted): void {
  // Create or update user
  const user = getOrCreateUser(event.params.creator, event.block.timestamp);
  user.nftCount = user.nftCount + 1;
  user.updatedAt = event.block.timestamp;
  user.save();

  // Create NFT mint entity
  const mintId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const mint = new NFTMint(mintId);
  mint.tokenId = event.params.tokenId;
  mint.creator = user.id;
  mint.tokenURI = event.params.tokenURI;
  mint.category = event.params.category;
  mint.timestamp = event.block.timestamp;
  mint.transactionHash = event.transaction.hash;
  mint.blockNumber = event.block.number;
  mint.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(mintId + "-activity");
  activity.type = "NFT_MINT";
  activity.user = user.id;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.tokenId = event.params.tokenId;
  activity.category = event.params.category;
  activity.save();
}

export function handleTokenListed(event: TokenListed): void {
  // Create or update user
  const user = getOrCreateUser(event.params.seller, event.block.timestamp);
  user.updatedAt = event.block.timestamp;
  user.save();

  // Create NFT list entity
  const listId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const list = new NFTList(listId);
  list.tokenId = event.params.tokenId;
  list.seller = user.id;
  list.price = event.params.price;
  list.category = event.params.category;
  list.timestamp = event.block.timestamp;
  list.transactionHash = event.transaction.hash;
  list.blockNumber = event.block.number;
  list.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(listId + "-activity");
  activity.type = "NFT_LIST";
  activity.user = user.id;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.tokenId = event.params.tokenId;
  activity.amount = event.params.price;
  activity.category = event.params.category;
  activity.save();
}

export function handleTokenSold(event: TokenSold): void {
  // Create or update seller
  const seller = getOrCreateUser(event.params.seller, event.block.timestamp);
  seller.updatedAt = event.block.timestamp;
  seller.save();

  // Create or update buyer
  const buyer = getOrCreateUser(event.params.buyer, event.block.timestamp);
  buyer.nftCount = buyer.nftCount + 1;
  buyer.updatedAt = event.block.timestamp;
  buyer.save();

  // Create NFT sale entity (seller perspective)
  const saleId = event.transaction.hash.toHex() + "-" + event.logIndex.toString() + "-sale";
  const sale = new NFTSale(saleId);
  sale.tokenId = event.params.tokenId;
  sale.seller = seller.id;
  sale.buyer = buyer.id;
  sale.price = event.params.price;
  sale.timestamp = event.block.timestamp;
  sale.transactionHash = event.transaction.hash;
  sale.blockNumber = event.block.number;
  sale.save();

  // Create NFT purchase entity (buyer perspective)
  const purchaseId = event.transaction.hash.toHex() + "-" + event.logIndex.toString() + "-purchase";
  const purchase = new NFTPurchase(purchaseId);
  purchase.tokenId = event.params.tokenId;
  purchase.seller = seller.id;
  purchase.buyer = buyer.id;
  purchase.price = event.params.price;
  purchase.timestamp = event.block.timestamp;
  purchase.transactionHash = event.transaction.hash;
  purchase.blockNumber = event.block.number;
  purchase.save();

  // Create activity entity for seller (use unique ID)
  const activitySale = new Activity(saleId + "-activity");
  activitySale.type = "NFT_SALE";
  activitySale.user = seller.id;
  activitySale.timestamp = event.block.timestamp;
  activitySale.transactionHash = event.transaction.hash;
  activitySale.blockNumber = event.block.number;
  activitySale.tokenId = event.params.tokenId;
  activitySale.amount = event.params.price;
  activitySale.buyer = buyer.id;
  activitySale.save();

  // Create activity entity for buyer (use unique ID)
  const activityPurchase = new Activity(purchaseId + "-activity");
  activityPurchase.type = "NFT_PURCHASE";
  activityPurchase.user = buyer.id;
  activityPurchase.timestamp = event.block.timestamp;
  activityPurchase.transactionHash = event.transaction.hash;
  activityPurchase.blockNumber = event.block.number;
  activityPurchase.tokenId = event.params.tokenId;
  activityPurchase.amount = event.params.price;
  activityPurchase.seller = seller.id;
  activityPurchase.save();
}

export function handleTokenUnlisted(event: TokenUnlisted): void {
  // Create NFT unlist entity
  const unlistId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const unlist = new NFTUnlist(unlistId);
  unlist.tokenId = event.params.tokenId;
  unlist.timestamp = event.block.timestamp;
  unlist.transactionHash = event.transaction.hash;
  unlist.blockNumber = event.block.number;
  unlist.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(unlistId + "-activity");
  activity.type = "NFT_UNLIST";
  activity.user = event.transaction.from;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.tokenId = event.params.tokenId;
  activity.save();
}

export function handleOfferCreated(event: OfferCreatedEvent): void {
  // Create or update buyer
  const buyer = getOrCreateUser(event.params.buyer, event.block.timestamp);
  buyer.updatedAt = event.block.timestamp;
  buyer.save();

  // Create offer entity
  const offerId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const offer = new OfferCreated(offerId);
  offer.offerId = event.params.offerId;
  offer.tokenId = event.params.tokenId;
  offer.buyer = buyer.id;
  offer.amount = event.params.amount;
  offer.expiresAt = event.params.expiresAt;
  offer.timestamp = event.block.timestamp;
  offer.transactionHash = event.transaction.hash;
  offer.blockNumber = event.block.number;
  offer.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(offerId + "-activity");
  activity.type = "OFFER_MADE";
  activity.user = buyer.id;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.tokenId = event.params.tokenId;
  activity.amount = event.params.amount;
  activity.offerId = event.params.offerId;
  activity.save();
}

export function handleOfferAccepted(event: OfferAcceptedEvent): void {
  // Create or update seller
  const seller = getOrCreateUser(Bytes.fromHexString(event.params.seller.toHexString()), event.block.timestamp);
  seller.updatedAt = event.block.timestamp;
  seller.save();

  // Create or update buyer
  const buyer = getOrCreateUser(Bytes.fromHexString(event.params.buyer.toHexString()), event.block.timestamp);
  buyer.updatedAt = event.block.timestamp;
  buyer.save();

  // Create offer accepted entity
  const acceptedId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const accepted = new OfferAccepted(acceptedId);
  accepted.offerId = event.params.offerId;
  accepted.tokenId = event.params.tokenId;
  accepted.seller = seller.id;
  accepted.buyer = buyer.id;
  accepted.amount = event.params.amount;
  accepted.timestamp = event.block.timestamp;
  accepted.transactionHash = event.transaction.hash;
  accepted.blockNumber = event.block.number;
  accepted.save();

  // Create activity entity (use unique ID)
  const activity = new Activity(acceptedId + "-activity");
  activity.type = "OFFER_ACCEPTED";
  activity.user = seller.id;
  activity.timestamp = event.block.timestamp;
  activity.transactionHash = event.transaction.hash;
  activity.blockNumber = event.block.number;
  activity.tokenId = event.params.tokenId;
  activity.amount = event.params.amount;
  activity.offerId = event.params.offerId;
  activity.buyer = buyer.id;
  activity.seller = seller.id;
  activity.save();
}
