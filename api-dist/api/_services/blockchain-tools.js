/**
 * 🔧 Blockchain Function Declarations for Gemini
 * ===============================================
 * OpenAPI-compatible function declarations for blockchain operations.
 * Used by Gemini Function Calling to determine when and how to call
 * blockchain-related functions.
 *
 * @module blockchain-tools
 * @version 1.0.0
 */
// ============================================================================
// FUNCTION DECLARATIONS (OpenAPI Schema Format)
// ============================================================================
/**
 * Get POL token price from CoinGecko
 * Use when user asks about POL/MATIC price, market data, or token value
 */
export const getPolPriceDeclaration = {
    name: 'get_pol_price',
    description: `Get the current POL (Polygon/MATIC) token price and market data. 
Use this function when the user asks about:
- Current POL or MATIC price
- Token market cap or trading volume
- 24-hour price change
- Converting POL amounts to USD

Returns: price in USD, 24h change percentage, market cap, and volume.`,
    parameters: {
        type: 'object',
        properties: {},
        required: [],
    },
};
/**
 * Get Nuxchain staking contract information
 * Use when user asks about staking statistics, APY, or platform metrics
 */
export const getStakingInfoDeclaration = {
    name: 'get_staking_info',
    description: `Get Nuxchain smart staking contract statistics and APY information.
Use this function when the user asks about:
- Staking APY or rewards rate
- Total POL staked on the platform
- Number of stakers/participants
- Total rewards distributed
- Platform staking statistics

Returns: total staked amount, APY (up to 125%), participant count, rewards paid.`,
    parameters: {
        type: 'object',
        properties: {},
        required: [],
    },
};
/**
 * Get NFT marketplace listings
 * Use when user asks about NFTs for sale, marketplace activity, or floor prices
 */
export const getNftListingsDeclaration = {
    name: 'get_nft_listings',
    description: `Get active NFT listings from the Nuxchain Skills NFT marketplace.
Use this function when the user asks about:
- NFTs currently for sale
- Marketplace floor price
- Recent NFT listings
- NFT trading volume
- Skill NFT availability

Returns: active listings with prices, sellers, rarity; floor price; total volume.`,
    parameters: {
        type: 'object',
        properties: {
            limit: {
                type: 'integer',
                description: 'Maximum number of listings to return (1-50). Default: 10',
            },
            sort_by: {
                type: 'string',
                enum: ['price', 'recent'],
                description: 'Sort listings by price (lowest first) or most recent. Default: recent',
            },
        },
        required: [],
    },
};
/**
 * Check wallet balance and staking info
 * Use when user provides a wallet address and wants to know their balance
 */
export const checkWalletBalanceDeclaration = {
    name: 'check_wallet_balance',
    description: `Check the POL balance and staking information for a specific wallet address.
Use this function when the user:
- Provides a wallet address (0x...) and asks about balance
- Wants to check their staked amount
- Asks about pending rewards for a specific wallet
- Wants to know NFT holdings for an address

IMPORTANT: Only call this if the user explicitly provides a wallet address.
Do NOT ask for wallet addresses - privacy is important.

Returns: POL balance, USD value, staked amount, pending rewards, NFT count.`,
    parameters: {
        type: 'object',
        properties: {
            address: {
                type: 'string',
                description: 'The Ethereum/Polygon wallet address (must start with 0x and be 42 characters)',
            },
        },
        required: ['address'],
    },
};
/**
 * Get user staking position (deposits + pending rewards)
 * Use when user asks about their staking deposits/rewards or optimization
 */
export const getUserStakingPositionDeclaration = {
    name: 'get_user_staking_position',
    description: `Get the connected user's SmartStaking deposits and pending rewards.
Use this function when the user asks about:
- My staking deposits / positions
- My pending rewards / accumulated rewards
- How to optimize my staking rewards
- Unlock times / withdrawable deposits

Returns: total deposited, pending rewards (boosted), deposit count, next unlock time, APY rates, and suggestions.`,
    parameters: {
        type: 'object',
        properties: {
            address: {
                type: 'string',
                description: 'The Ethereum/Polygon wallet address (must start with 0x and be 42 characters)',
            },
        },
        required: ['address'],
    },
};
/**
 * Estimate staking rewards
 * Use when user asks about potential earnings from staking
 */
export const estimateStakingRewardDeclaration = {
    name: 'estimate_staking_reward',
    description: `Calculate estimated staking rewards for a given amount and duration.
Use this function when the user asks:
- "How much would I earn staking X POL?"
- "What are the rewards for staking for X days?"
- "Is locked staking better than flexible?"
- "Calculate my potential staking income"

The function considers:
- Base APY: 125% annual
- Lock bonus: +25% for locked staking
- Duration: 1-365 days

Returns: estimated reward in POL and USD, effective APY, lock bonus.`,
    parameters: {
        type: 'object',
        properties: {
            amount: {
                type: 'number',
                description: 'Amount of POL to stake. Must be greater than 0.',
            },
            duration_days: {
                type: 'integer',
                description: 'Number of days to stake (1-365).',
            },
            is_locked: {
                type: 'boolean',
                description: 'Whether to use locked staking (+25% APY bonus). Default: false',
            },
        },
        required: ['amount', 'duration_days'],
    },
};
/**
 * Get user's NFT balance and active listings
 * Use when user asks about their own NFTs, minted NFTs, or marketplace listings
 */
export const getUserNFTsDeclaration = {
    name: 'get_user_nfts',
    description: `Get the connected user's Skill NFT balance and active marketplace listings.
Use this function when the user asks about:
- How many NFTs they have minted / own
- Their Skill NFTs in their wallet
- NFTs they have listed for sale
- Their active marketplace listings
- "mis NFTs", "my NFTs", "cuántos NFT tengo", "NFTs minteados"

IMPORTANT: Only call this if a wallet address is available (connected wallet).
Returns: total NFT balance, active listing count, contract address.`,
    parameters: {
        type: 'object',
        properties: {
            address: {
                type: 'string',
                description: 'The Ethereum/Polygon wallet address (must start with 0x and be 42 characters)',
            },
        },
        required: ['address'],
    },
};
export const getUserHistoryDeclaration = {
    name: 'get_user_history',
    description: `Get the full activity history for a user from The Graph subgraph.
Returns cumulative deposit/withdrawal stats, NFT activity counts, XP/level, and recent transactions.
Use for questions like "how much have I deposited total", "my withdrawal history", "how many NFTs have I minted".`,
    parameters: {
        type: 'object',
        properties: {
            address: {
                type: 'string',
                description: 'The Ethereum/Polygon wallet address (must start with 0x and be 42 characters)',
            },
        },
        required: ['address'],
    },
};
// ============================================================================
// COMBINED DECLARATIONS
// ============================================================================
/**
 * All blockchain function declarations for Gemini tools
 */
export const blockchainFunctionDeclarations = [
    getPolPriceDeclaration,
    getStakingInfoDeclaration,
    getNftListingsDeclaration,
    checkWalletBalanceDeclaration,
    getUserStakingPositionDeclaration,
    estimateStakingRewardDeclaration,
    getUserNFTsDeclaration,
    getUserHistoryDeclaration,
];
/**
 * Function names for allowed function calling config
 */
export const blockchainFunctionNames = [
    'get_pol_price',
    'get_staking_info',
    'get_nft_listings',
    'check_wallet_balance',
    'get_user_staking_position',
    'estimate_staking_reward',
    'get_user_nfts',
    'get_user_history',
];
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Check if a function name is a blockchain function
 */
export function isBlockchainFunction(name) {
    return blockchainFunctionNames.includes(name);
}
/**
 * Get function declaration by name
 */
export function getFunctionDeclaration(name) {
    const declarations = {
        get_pol_price: getPolPriceDeclaration,
        get_staking_info: getStakingInfoDeclaration,
        get_nft_listings: getNftListingsDeclaration,
        check_wallet_balance: checkWalletBalanceDeclaration,
        get_user_staking_position: getUserStakingPositionDeclaration,
        estimate_staking_reward: estimateStakingRewardDeclaration,
        get_user_nfts: getUserNFTsDeclaration,
        get_user_history: getUserHistoryDeclaration,
    };
    return declarations[name];
}
export default blockchainFunctionDeclarations;
