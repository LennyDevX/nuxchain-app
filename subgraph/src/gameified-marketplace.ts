import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  TokenCreated,
  TokenListed,
  TokenSold,
  TokenUnlisted,
  OfferMade,
  OfferAccepted
} from "../generated/GameifiedMarketplaceCore/GameifiedMarketplaceCoreV1"
import {
  User,
  Activity
} from "../generated/schema"

// ✅ OPTIMIZADO: Helper function mejorado con contadores directos
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

export function handleTokenCreated(event: TokenCreated): void {
  const user = loadOrCreateUser(event.params.creator, event.block.timestamp)
  user.updatedAt = event.block.timestamp
  user.save()

  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "TOKEN_CREATED"
  activity.user = user.id
  activity.tokenId = event.params.tokenId
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleTokenListed(event: TokenListed): void {
  const user = loadOrCreateUser(event.params.seller, event.block.timestamp)
  user.updatedAt = event.block.timestamp
  user.save()

  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "TOKEN_LISTED"
  activity.user = user.id
  activity.tokenId = event.params.tokenId
  activity.amount = event.params.price
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleTokenSold(event: TokenSold): void {
  const seller = loadOrCreateUser(event.params.seller, event.block.timestamp)
  seller.updatedAt = event.block.timestamp
  seller.save()

  const buyer = loadOrCreateUser(event.params.buyer, event.block.timestamp)
  buyer.updatedAt = event.block.timestamp
  buyer.save()

  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "TOKEN_SOLD"
  activity.user = seller.id
  activity.tokenId = event.params.tokenId
  activity.amount = event.params.price
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleTokenUnlisted(event: TokenUnlisted): void {
  const user = loadOrCreateUser(event.params.seller, event.block.timestamp)
  user.updatedAt = event.block.timestamp
  user.save()

  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "TOKEN_UNLISTED"
  activity.user = user.id
  activity.tokenId = event.params.tokenId
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleOfferMade(event: OfferMade): void {
  const user = loadOrCreateUser(event.params.offeror, event.block.timestamp)
  user.updatedAt = event.block.timestamp
  user.save()

  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "OFFER_MADE"
  activity.user = user.id
  activity.tokenId = event.params.tokenId
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}

export function handleOfferAccepted(event: OfferAccepted): void {
  const buyer = loadOrCreateUser(event.params.buyer, event.block.timestamp)
  buyer.updatedAt = event.block.timestamp
  buyer.save()

  const seller = loadOrCreateUser(event.params.seller, event.block.timestamp)
  seller.updatedAt = event.block.timestamp
  seller.save()

  const activity = new Activity(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  )
  activity.type = "OFFER_ACCEPTED"
  activity.user = seller.id
  activity.tokenId = event.params.tokenId
  activity.amount = event.params.amount
  activity.timestamp = event.block.timestamp
  activity.transactionHash = event.transaction.hash
  activity.blockNumber = event.block.number
  activity.save()
}


