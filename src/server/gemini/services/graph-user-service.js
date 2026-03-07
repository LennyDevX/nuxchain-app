/**
 * The Graph subgraph service for the local Gemini server.
 * Queries on-chain indexed data for a verified wallet address.
 */

const SUBGRAPH_URL =
  process.env.SUBGRAPH_URL ||
  process.env.VITE_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/1743068/nux/version/latest';

const USER_CONTEXT_QUERY = `
  query GetUserContext($wallet: String!, $sevenDaysAgo: BigInt!) {
    user(id: $wallet) {
      depositCount
      totalDeposited
      totalWithdrawn
      totalEarnings
      nftMintedCount
      nftSoldCount
      level
      totalXP
    }
    skillProfile(id: $wallet) {
      hasAutoCompound
      level
      totalXP
    }
    marketplaceProfile(id: $wallet) {
      level
      nftsCreated
      nftsSold
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
    }
    activeListings: nftLists(
      where: { seller: $wallet }
      first: 10
    ) {
      tokenId
      price
      category
      timestamp
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
    recentRewards7d: questRewardClaims(
      where: { user: $wallet, timestamp_gte: $sevenDaysAgo }
      orderBy: timestamp
      orderDirection: desc
    ) {
      amount
      timestamp
    }
    royalties7d: royaltyPaids(
      where: { creator: $wallet, timestamp_gte: $sevenDaysAgo }
      orderBy: timestamp
      orderDirection: desc
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

function fmtPOL(wei) {
  if (!wei) return '0.0000';
  try {
    const val = Number(BigInt(wei)) / 1e18;
    return val.toFixed(4);
  } catch {
    return '0.0000';
  }
}

function fmtDate(ts) {
  if (!ts) return 'N/A';
  try {
    return new Date(Number(ts) * 1000).toLocaleDateString('es-ES');
  } catch {
    return 'N/A';
  }
}

/**
 * Fetch on-chain data for a wallet from The Graph subgraph.
 * Returns null on error (fail-open so chat still works without Graph).
 */
export async function fetchUserBlockchainData(wallet) {
  try {
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000).toString();
    const walletLower = wallet.toLowerCase();

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: USER_CONTEXT_QUERY,
        variables: { wallet: walletLower, sevenDaysAgo },
      }),
    });

    if (!response.ok) {
      console.warn(`[GraphService] Subgraph HTTP ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (json.errors) {
      console.warn('[GraphService] GraphQL errors:', json.errors.map(e => e.message).join('; '));
      return null;
    }

    return parseGraphResponse(json.data, wallet);
  } catch (err) {
    console.warn('[GraphService] Fetch failed:', err.message);
    return null;
  }
}

function parseGraphResponse(data, wallet) {
  const user = data?.user;
  const skill = data?.skillProfile;
  const market = data?.marketplaceProfile;

  const recentDeposits = (data?.recentDeposits || []).map(d => ({
    amount: fmtPOL(d.amount),
    lockupDuration: Number(d.lockupDuration || 0),
    timestamp: fmtDate(d.timestamp),
  }));

  const activeListings = (data?.activeListings || []).map(l => ({
    tokenId: l.tokenId,
    price: fmtPOL(l.price),
    category: l.category || 'N/A',
    timestamp: fmtDate(l.timestamp),
  }));

  const recentNFTs = (data?.recentMints || []).map(m => ({
    tokenId: m.tokenId,
    category: m.category || 'N/A',
    royaltyPercentage: Number(m.royaltyPercentage || 0),
    timestamp: fmtDate(m.timestamp),
  }));

  const rewards7dTotal = (data?.recentRewards7d || [])
    .reduce((acc, r) => acc + BigInt(r.amount || 0), 0n);

  const royalties7dTotal = (data?.royalties7d || [])
    .reduce((acc, r) => acc + BigInt(r.amount || 0), 0n);

  const recentActivities = (data?.recentActivities || []).map(a => ({
    type: a.type,
    amount: a.amount ? fmtPOL(a.amount) : null,
    tokenId: a.tokenId || null,
    timestamp: fmtDate(a.timestamp),
  }));

  return {
    wallet,
    totalDepositedPOL: fmtPOL(user?.totalDeposited),
    totalWithdrawnPOL: fmtPOL(user?.totalWithdrawn),
    activeStakedPOL: fmtPOL(
      user?.totalDeposited && user?.totalWithdrawn
        ? (BigInt(user.totalDeposited) - BigInt(user.totalWithdrawn)).toString()
        : user?.totalDeposited
    ),
    depositCount: Number(user?.depositCount || 0),
    totalEarningsPOL: fmtPOL(user?.totalEarnings),
    rewardsLast7Days: fmtPOL(rewards7dTotal.toString()),
    hasAutoCompound: skill?.hasAutoCompound ?? false,
    stakingLevel: Number(skill?.level || user?.level || 1),
    stakingXP: user?.totalXP?.toString() || '0',
    recentDeposits,
    nftsMintedCount: Number(user?.nftMintedCount || 0),
    nftsSoldCount: Number(user?.nftSoldCount || 0),
    nftsBoughtCount: Number(market?.nftsSold || 0),
    activeListings,
    totalRoyaltiesLast7Days: fmtPOL(royalties7dTotal.toString()),
    recentNFTs,
    marketplaceLevel: Number(market?.level || 1),
    marketplaceXP: '0',
    referralCount: Number(market?.referralCount || 0),
    recentActivities,
    fetchedAt: Date.now(),
  };
}

/**
 * Format the user data as a multi-section text block for Gemini system instruction injection.
 */
export function formatUserContextForAI(data) {
  const lines = [
    `🔐 Wallet verificada: ${data.wallet}`,
    '',
    '📊 STAKING:',
    `  • Depositado total: ${data.totalDepositedPOL} POL`,
    `  • Staked activo (estimado): ${data.activeStakedPOL} POL`,
    `  • Número de depósitos: ${data.depositCount}`,
    `  • Ganancias totales: ${data.totalEarningsPOL} POL`,
    `  • Rewards últimos 7 días: ${data.rewardsLast7Days} POL`,
    `  • Auto-Compound: ${data.hasAutoCompound ? '✅ Activo' : '❌ Inactivo'}`,
    `  • Nivel staking: ${data.stakingLevel} | XP: ${data.stakingXP}`,
  ];

  if (data.recentDeposits.length > 0) {
    lines.push('  • Depósitos recientes:');
    data.recentDeposits.forEach(d => {
      const days = d.lockupDuration > 0 ? `Locked ${Math.round(d.lockupDuration / 86400)}d` : 'Flexible';
      lines.push(`    - ${d.amount} POL (${days}) — ${d.timestamp}`);
    });
  }

  lines.push('');
  lines.push('🖼️ NFTs:');
  lines.push(`  • NFTs minteados: ${data.nftsMintedCount}`);
  lines.push(`  • NFTs vendidos: ${data.nftsSoldCount}`);
  lines.push(`  • Royalties últimos 7 días: ${data.totalRoyaltiesLast7Days} POL`);

  if (data.activeListings.length > 0) {
    lines.push(`  • Listings activos (${data.activeListings.length}):`);
    data.activeListings.slice(0, 5).forEach(l => {
      lines.push(`    - Token #${l.tokenId} — ${l.price} POL (${l.category}) desde ${l.timestamp}`);
    });
  } else {
    lines.push('  • Sin listings activos');
  }

  if (data.recentNFTs.length > 0) {
    lines.push('  • Últimos NFTs minteados:');
    data.recentNFTs.slice(0, 5).forEach(n => {
      lines.push(`    - Token #${n.tokenId} (${n.category}) royalty ${n.royaltyPercentage}% — ${n.timestamp}`);
    });
  }

  lines.push('');
  lines.push('🏪 MARKETPLACE:');
  lines.push(`  • Nivel: ${data.marketplaceLevel}`);
  lines.push(`  • Referidos: ${data.referralCount}`);

  if (data.recentActivities.length > 0) {
    lines.push('  • Actividad reciente:');
    data.recentActivities.slice(0, 5).forEach(a => {
      const detail = a.amount ? ` ${a.amount} POL` : a.tokenId ? ` Token #${a.tokenId}` : '';
      lines.push(`    - ${a.type}${detail} — ${a.timestamp}`);
    });
  }

  return lines.join('\n');
}
