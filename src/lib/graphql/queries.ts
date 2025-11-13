import { gql } from '@apollo/client';

/**
 * Query to get user's recent activities
 * Returns all activity types sorted by timestamp (most recent first)
 */
export const GET_USER_ACTIVITIES = gql`
  query GetUserActivities($userAddress: Bytes!, $first: Int!, $skip: Int!) {
    activities(
      where: { user: $userAddress }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      type
      timestamp
      transactionHash
      blockNumber
      amount
      tokenId
      lockupDuration
      category
      buyer
      seller
      offerId
    }
  }
`;

/**
 * Query to get user's aggregated stats
 */
export const GET_USER_STATS = gql`
  query GetUserStats($userAddress: Bytes!) {
    user(id: $userAddress) {
      id
      totalDeposited
      totalWithdrawn
      totalCompounded
      nftMintedCount
      depositCount
      withdrawalCount
      compoundCount
      level
      totalXP
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get user's deposits
 */
export const GET_USER_DEPOSITS = gql`
  query GetUserDeposits($userAddress: Bytes!, $first: Int!) {
    deposits(
      where: { user: $userAddress }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      lockupDuration
      timestamp
      transactionHash
      blockNumber
    }
  }
`;

/**
 * Query to get user's withdrawals
 */
export const GET_USER_WITHDRAWALS = gql`
  query GetUserWithdrawals($userAddress: Bytes!, $first: Int!) {
    withdrawals(
      where: { user: $userAddress }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      amount
      timestamp
      transactionHash
      blockNumber
    }
  }
`;

/**
 * Query to get user's NFTs minted (v0.0.7 - using NFTMint entity)
 */
export const GET_USER_NFTS = gql`
  query GetUserNFTs($userAddress: Bytes!, $first: Int!) {
    nftMints(
      where: { creator: $userAddress }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      tokenId
      creator {
        id
      }
      tokenURI
      category
      royaltyPercentage
      timestamp
      transactionHash
      blockNumber
    }
  }
`;

/**
 * Query to check subgraph sync status
 */
export const GET_SUBGRAPH_STATUS = gql`
  query GetSubgraphStatus {
    _meta {
      block {
        number
        hash
        timestamp
      }
      deployment
      hasIndexingErrors
    }
  }
`;
