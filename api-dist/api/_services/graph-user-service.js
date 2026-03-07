/**
 * The Graph User Service
 * Queries the NuxChain subgraph for a specific wallet address to build
 * a rich user context object for the Gemini AI chat.
 *
 * Subgraph URL: SUBGRAPH_URL env variable (same as VITE_SUBGRAPH_URL for server)
 *
 * Entities queried:
 * - User aggregate (totals, counts, level, XP)
 * - Recent Deposits (last 5)
 * - Active NFT Listings with prices
 * - Recent NFT Mints
 * - Recent Quest/Achievement Rewards
 * - Royalties Earned (last 7 days)
 * - Recent Activity feed
 */
const SUBGRAPH_URL = process.env.SUBGRAPH_URL ||
    process.env.VITE_SUBGRAPH_URL ||
    'https://api.studio.thegraph.com/query/1743068/nux/version/latest';
const SEVEN_DAYS_AGO = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
const USER_CONTEXT_QUERY = `
query GetUserContext($wallet: String!, $sevenDaysAgo: BigInt!) {
  user(id: $wallet) {
    id
    depositCount
    withdrawalCount
    totalDeposited
    totalWithdrawn
    totalEarnings
    nftMintedCount
    nftSoldCount
    nftBoughtCount
    level
    totalXP
    createdAt
  }

  skillProfile(id: $wallet) {
    totalXP
    level
    hasAutoCompound
    stakingBoostTotal
  }

  marketplaceProfile(id: $wallet) {
    totalXP
    level
    nftsCreated
    nftsSold
    nftsBought
    referralCount
  }

  recentDeposits: deposits(
    where: { user: $wallet }
    orderBy: timestamp
    orderDirection: desc
    first: 5
  ) {
    amount
    lockupDuration
    timestamp
    transactionHash
  }

  activeListings: nftLists(
    where: { seller: $wallet }
    orderBy: timestamp
    orderDirection: desc
    first: 10
  ) {
    tokenId
    price
    category
    timestamp
    transactionHash
  }

  recentMints: nftMints(
    where: { creator: $wallet }
    orderBy: timestamp
    orderDirection: desc
    first: 10
  ) {
    tokenId
    tokenURI
    category
    royaltyPercentage
    timestamp
  }

  recentRewards: questRewardClaims(
    where: { user: $wallet }
    orderBy: timestamp
    orderDirection: desc
    first: 5
  ) {
    amount
    questId
    timestamp
  }

  recentRewards7d: questRewardClaims(
    where: { user: $wallet, timestamp_gte: $sevenDaysAgo }
    orderBy: timestamp
    orderDirection: desc
    first: 20
  ) {
    amount
    timestamp
  }

  royalties7d: royaltyPaids(
    where: { creator: $wallet, timestamp_gte: $sevenDaysAgo }
    orderBy: timestamp
    orderDirection: desc
    first: 20
  ) {
    amount
    tokenId
    timestamp
  }

  recentActivities: activities(
    where: { user: $wallet }
    orderBy: timestamp
    orderDirection: desc
    first: 10
  ) {
    type
    amount
    tokenId
    timestamp
  }
}
`;
function formatPOL(wei) {
    if (!wei || wei === '0')
        return '0 POL';
    const bn = BigInt(wei);
    const pol = Number(bn) / 1e18;
    return `${pol.toFixed(4)} POL`;
}
function sumWei(items) {
    if (!items || items.length === 0)
        return '0 POL';
    const total = items.reduce((acc, item) => acc + BigInt(item.amount), BigInt(0));
    const pol = Number(total) / 1e18;
    return `${pol.toFixed(4)} POL`;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGraphResponse(data, wallet) {
    const user = data.user || {};
    const skillProfile = data.skillProfile || {};
    const marketplaceProfile = data.marketplaceProfile || {};
    const totalDeposited = BigInt(user.totalDeposited || '0');
    const totalWithdrawn = BigInt(user.totalWithdrawn || '0');
    const activeStaked = totalDeposited - totalWithdrawn;
    // Compute pending rewards estimate from questRewardClaims as proxy
    const rewardsLast7Days = sumWei(data.recentRewards7d || []);
    const royalties7dSum = sumWei(data.royalties7d || []);
    // Active listings (NFTList events not yet unliststed — simple heuristic: most recent 10 list events)
    const activeListings = (data.activeListings || []).map((l) => ({
        tokenId: l.tokenId?.toString() || '',
        price: formatPOL(l.price),
        category: l.category || 'Unknown',
        timestamp: Number(l.timestamp),
    }));
    const recentNFTs = (data.recentMints || []).map((n) => ({
        tokenId: n.tokenId?.toString() || '',
        tokenURI: n.tokenURI || '',
        category: n.category || 'Unknown',
        royaltyPercentage: `${(Number(n.royaltyPercentage || '0') / 100).toFixed(1)}%`,
        timestamp: Number(n.timestamp),
    }));
    const recentDeposits = (data.recentDeposits || []).map((d) => ({
        amount: formatPOL(d.amount),
        lockupDuration: Number(d.lockupDuration),
        timestamp: Number(d.timestamp),
    }));
    const recentActivities = (data.recentActivities || []).map((a) => ({
        type: a.type || '',
        amount: a.amount ? formatPOL(a.amount) : null,
        tokenId: a.tokenId?.toString() || null,
        timestamp: Number(a.timestamp),
    }));
    // Total royalties earned last 7 days
    const totalRoyaltiesEarned = royalties7dSum;
    return {
        wallet,
        totalDepositedPOL: formatPOL(user.totalDeposited),
        totalWithdrawnPOL: formatPOL(user.totalWithdrawn),
        activeStakedPOL: `${(Number(activeStaked) / 1e18).toFixed(4)} POL`,
        depositCount: Number(user.depositCount || 0),
        pendingRewardsPOL: formatPOL(user.totalEarnings),
        rewardsLast7Days,
        hasAutoCompound: Boolean(skillProfile.hasAutoCompound),
        stakingLevel: Number(skillProfile.level || user.level || 0),
        stakingXP: (skillProfile.totalXP || user.totalXP || '0').toString(),
        recentDeposits,
        nftsMintedCount: Number(user.nftMintedCount || marketplaceProfile.nftsCreated || 0),
        nftsSoldCount: Number(user.nftSoldCount || marketplaceProfile.nftsSold || 0),
        nftsBoughtCount: Number(user.nftBoughtCount || marketplaceProfile.nftsBought || 0),
        activeListings,
        totalRoyaltiesEarned,
        recentNFTs,
        marketplaceLevel: Number(marketplaceProfile.level || 0),
        marketplaceXP: (marketplaceProfile.totalXP || '0').toString(),
        referralCount: Number(marketplaceProfile.referralCount || 0),
        recentActivities,
        fetchedAt: Date.now(),
    };
}
/**
 * Fetch on-chain context for a wallet from The Graph subgraph.
 * Returns null on error (fail open — chat still works without graph data).
 */
export async function fetchUserBlockchainData(wallet) {
    const normalizedWallet = wallet.toLowerCase();
    try {
        const response = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: USER_CONTEXT_QUERY,
                variables: { wallet: normalizedWallet, sevenDaysAgo: SEVEN_DAYS_AGO.toString() },
            }),
        });
        if (!response.ok) {
            console.warn(`[graph-user-service] HTTP ${response.status} from subgraph`);
            return null;
        }
        const json = await response.json();
        if (json.errors) {
            console.warn('[graph-user-service] GraphQL errors:', JSON.stringify(json.errors));
        }
        if (!json.data) {
            console.warn('[graph-user-service] No data returned from subgraph');
            return null;
        }
        return parseGraphResponse(json.data, normalizedWallet);
    }
    catch (err) {
        console.error('[graph-user-service] fetch failed:', err);
        return null;
    }
}
/**
 * Formats UserBlockchainData into a concise context string for the AI system prompt.
 */
export function formatUserContextForAI(data) {
    const lines = [
        `== CONTEXTO DEL USUARIO EN NUXCHAIN ==`,
        `Wallet: ${data.wallet}`,
        ``,
        `-- STAKING --`,
        `  Depositado activo: ${data.activeStakedPOL} (${data.depositCount} depósito(s) totales)`,
        `  Total depositado histórico: ${data.totalDepositedPOL}`,
        `  Total retirado histórico: ${data.totalWithdrawnPOL}`,
        `  Earnings/rewards totales: ${data.pendingRewardsPOL}`,
        `  Rewards últimos 7 días: ${data.rewardsLast7Days}`,
        `  Auto-Compound: ${data.hasAutoCompound ? '✅ Activado' : '❌ Desactivado'}`,
        `  Nivel Staking: ${data.stakingLevel} | XP: ${data.stakingXP}`,
    ];
    if (data.recentDeposits.length > 0) {
        lines.push(`  Últimos depósitos:`);
        data.recentDeposits.slice(0, 3).forEach(d => {
            const date = new Date(d.timestamp * 1000).toLocaleDateString('es-ES');
            const type = d.lockupDuration === 0 ? 'flexible' : `locked ${d.lockupDuration}d`;
            lines.push(`    • ${d.amount} (${type}) — ${date}`);
        });
    }
    lines.push(``, `-- NFTs (Plataforma Nuxchain) --`, `  Minteados por ti: ${data.nftsMintedCount}`, `  Vendidos: ${data.nftsSoldCount}`, `  Comprados: ${data.nftsBoughtCount}`, `  Royalties ganadas (últimos 7 días): ${data.totalRoyaltiesEarned}`);
    if (data.activeListings.length > 0) {
        lines.push(`  Listados activos en marketplace:`);
        data.activeListings.slice(0, 5).forEach(l => {
            lines.push(`    • Token #${l.tokenId} — ${l.price} — Categoría: ${l.category}`);
        });
    }
    else {
        lines.push(`  Sin NFTs listados actualmente en marketplace.`);
    }
    if (data.recentNFTs.length > 0) {
        lines.push(`  NFTs minteados recientemente:`);
        data.recentNFTs.slice(0, 3).forEach(n => {
            const date = new Date(n.timestamp * 1000).toLocaleDateString('es-ES');
            lines.push(`    • Token #${n.tokenId} — Categoría: ${n.category} — Royalty: ${n.royaltyPercentage} — ${date}`);
        });
    }
    lines.push(``, `-- MARKETPLACE --`, `  Nivel marketplace: ${data.marketplaceLevel} | XP: ${data.marketplaceXP}`, `  Referidos: ${data.referralCount}`);
    if (data.recentActivities.length > 0) {
        lines.push(``, `-- ACTIVIDAD RECIENTE --`);
        data.recentActivities.slice(0, 5).forEach(a => {
            const date = new Date(a.timestamp * 1000).toLocaleDateString('es-ES');
            const detail = a.amount ? ` — ${a.amount}` : a.tokenId ? ` — Token #${a.tokenId}` : '';
            lines.push(`    • ${a.type}${detail} (${date})`);
        });
    }
    lines.push(``, `Datos obtenidos: ${new Date(data.fetchedAt).toLocaleString('es-ES')}`);
    lines.push(`== FIN CONTEXTO USUARIO ==`);
    return lines.join('\n');
}
