import { 
  processGeminiRequest, 
  processGeminiStreamRequest,
  processGeminiStreamRequestWithTools,
  createOptimizedGeminiStream,
  processFunctionCallingRequest,
  processGeminiRequestWithTools,
  executeFunctionCall,
  clearCache as clearGeminiCache 
} from '../services/gemini-service.js';
import { executeBlockchainFunction } from '../services/blockchain-service.js';
import { fetchUserBlockchainData, formatUserContextForAI } from '../services/graph-user-service.js';
import { verifyMessage } from 'ethers';
import urlContextService from '../services/url-context-service.js';

import { streamText } from '../utils/stream-utils.js';
import { formatResponseForMarkdown } from '../utils/markdown-formatter.js';
import { getMetrics } from '../middlewares/logger.js';
import embeddingsService, { getRelevantContext } from '../services/embeddings-service.js';
import contextCacheService from '../services/context-cache-service.js';
import chatLogger from '../utils/chat-logger.js';
import analyticsService from '../services/analytics-service.js';
import batchService from '../services/batch-service.js';
import WebScraperService from '../services/web-scraper.js';
import semanticStreamingService from '../services/semantic-streaming-service.js';

// Create instance of simple web scraper
const webScraperService = new WebScraperService();

// === Configuración ===
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB, cambiar aquí para ajustar el límite

// === � SKILLS SYSTEM — Phase 1: Capability instruction blocks ===
// Each skill appends a focused instruction block to tell Gemini what analyses it can perform.
// Skills are gated by subscription tier — the frontend sends only the user's unlocked skills.
const SKILL_CONTEXTS = {
  'nft-listing': `[SKILL: NFT Listing Service] When asked about NFT descriptions, listings, or metadata, generate a structured response with: SEO description, traits list, tags, and a short marketing pitch. You can analyze token IDs or IPFS URIs from the user's wallet context.`,
  'risk-analysis': `[SKILL: Risk Analysis Reports] You can produce on-chain risk scores for liquidity pools and tokens. For each requested asset, evaluate: smart contract age & audit status, liquidity concentration, volatility index (7d), holder distribution, and rug-pull indicators. Output a score 0-100 with breakdown.`,
  'market-alpha': `[SKILL: Market Alpha] You have access to the user's subgraph context (deposits, pool activity, recent events). Provide narrative market insights: which pools are gaining yields, LP concentration risks, and upcoming unlock events. Be specific and data-driven.`,
  'content-moderation': `[SKILL: Content Moderation API] When presented with text content, classify it as: SPAM, SCAM, SUSPICIOUS, or OK. Provide: classification label, confidence score (0-1), affected rules triggered, and a 1-sentence reasoning. Format as JSON.`,
  'contract-auditor': `[SKILL: Smart Contract Auditor] When given a contract address or ABI, analyze for: reentrancy vulnerabilities, unchecked external calls, integer overflow risks, access control flaws, and centralization risks (owner powers). Rate severity: CRITICAL / HIGH / MEDIUM / LOW. Format findings as a structured audit report.`,
  'whale-tracker': `[SKILL: Whale Tracker Insights] When analyzing wallet activity, identify large movements (>50K USD equivalent), correlate timing with market events, and narrate the potential intent (accumulation, distribution, wash trading). Use the user's on-chain activity context when available.`,
  'portfolio-analyzer': `[SKILL: Portfolio Analyzer] Using the user's verified on-chain data (staking deposits, NFT holdings, LP positions from graph context), analyze: total value distribution, yield efficiency by position, impermanent loss risk for LP, and suggest 1-3 concrete rebalancing actions.`,
  'token-research': `[SKILL: Token Deep Research] For any requested token, provide: tokenomics summary, team/VC backing indicators, on-chain activity trend (30d), top holder concentration, comparable tokens for benchmarking, and a risk/reward conclusion. Cite on-chain signals where possible.`,
  'liquidity-advisor': `[SKILL: Liquidity Advisor] When asked about LP positions on Uniswap v3/v4, recommend: optimal price range based on 30d historical volatility, fee tier selection, capital efficiency ratio, and estimated APY range. Explain the tradeoffs of wider vs tighter ranges for the specific pair.`,
};

/**
 * Builds a combined skills context block for the active skill IDs.
 * Returns an empty string if no skills are active.
 */
function buildSkillsContext(skillIds) {
  if (!skillIds || skillIds.length === 0) return '';
  const blocks = skillIds
    .filter(id => SKILL_CONTEXTS[id])
    .map(id => SKILL_CONTEXTS[id]);
  if (blocks.length === 0) return '';
  return `[ACTIVE SKILLS — You have the following specialized capabilities unlocked for this user]\n${blocks.join('\n')}`;
}


/**
 * Detecta si el mensaje requiere llamadas a funciones blockchain
 */
function detectBlockchainQuery(message) {
  const text = message.toLowerCase();
  const functions = [];

  const isUserIntent =
    text.includes('mi ') ||
    text.includes('mis ') ||
    text.includes('mio') ||
    text.includes('mía') ||
    text.includes('revisa') ||
    text.includes('tengo');

  const isOptimizationIntent =
    text.includes('optimiza') ||
    text.includes('optimizar') ||
    text.includes('mejorar') ||
    text.includes('mejora') ||
    text.includes('recomend') ||
    text.includes('consej') ||
    text.includes('estrateg');
  
  // Detectar queries de precio POL
  if ((text.includes('pol') || text.includes('matic') || text.includes('polygon')) &&
      (text.includes('precio') || text.includes('price') || text.includes('cotiza') || 
       text.includes('vale') || text.includes('cuesta') || text.includes('actual') ||
       text.includes('cuánto') || text.includes('cuanto') || text.includes('costo'))) {
    functions.push('get_pol_price');
  }
  
  // Detectar queries de staking
  if (text.includes('staking') || text.includes('stake') || text.includes('stakear') || 
      text.includes('stakeado') || text.includes('apr') || text.includes('apy')) {
    functions.push('get_staking_info');
  }

  // Detectar queries de staking del usuario (depositos/recompensas/optimizacion)
  if ((text.includes('staking') || text.includes('stake') || text.includes('stakear') || text.includes('stakeado')) &&
      (isUserIntent || isOptimizationIntent || text.includes('recompensa') || text.includes('rewards') || text.includes('deposit') || text.includes('deposito') || text.includes('acumulad'))) {
    functions.push('get_user_staking_position');
  }
  
  // Detectar queries de NFT listings
  if ((text.includes('nft') || text.includes('marketplace')) && 
      (text.includes('lista') || text.includes('venta') || text.includes('disponible') || text.includes('comprar'))) {
    functions.push('get_nft_listings');
  }
  
  // Detectar queries de wallet/balance - incluir "mi balance", "mi wallet", etc.
  if ((text.includes('wallet') || text.includes('balance') || text.includes('saldo') || text.includes('cartera')) &&
      (text.includes('0x') || text.includes('direccion') || text.includes('address') ||
       text.includes('mi ') || text.includes('mio') || text.includes('tengo') || text.includes('revisa'))) {
    functions.push('check_wallet_balance');
  }
  
  // Detectar queries de NFTs del usuario (mis NFTs, cuántos tengo, listings propios)
  const isUserNFTQuery = (
    /\b(mis?|my|cu[aá]ntos?|tengo|have|minteado|minted|listado|listed)\b/.test(text) &&
    text.includes('nft')
  ) || /\b(mis listings|my listings|nfts listados|nfts for sale|mis nfts?|my nfts?)\b/.test(text);
  if (isUserNFTQuery) {
    functions.push('get_user_nfts');
  }

  // Detectar queries de reward estimation
  if ((text.includes('reward') || text.includes('recompensa') || text.includes('ganancia') || text.includes('ganar')) &&
      (text.includes('staking') || text.includes('stake') || text.includes('pol') || text.includes('matic'))) {
    functions.push('estimate_staking_reward');
  }

  // Auto-chain: cuando hay wallet balance query, también traer posición de staking
  if (functions.includes('check_wallet_balance') && !functions.includes('get_user_staking_position')) {
    functions.push('get_user_staking_position');
  }

  // Detectar queries personales de contrato (sin keyword 'staking' explícito)
  const isPersonalContractQuery =
    /\b(mis?|my|tengo|cu[aá]nto|revisa|dame|muestra|ver)\b/i.test(text) &&
    /(dep[oó]sit|contrat[oa]|interacci[oó]n|fondos?|tokens? bloqueados?|locked|unlock|bloquead|invert|position|portfolio|retir)/i.test(text);
  if (isPersonalContractQuery && !functions.includes('get_user_staking_position')) {
    if (!functions.includes('get_staking_info')) functions.push('get_staking_info');
    functions.push('get_user_staking_position');
  }

  // Detectar queries de historial de actividad (subgraph)
  const isHistoryQuery =
    /\b(historial|cu[aá]nto.{0,20}(depositado|ganado|retirado|total)|mis (retiros?|dep[oó]sitos? total|nfts? mint|ventas?|compras?))\b/i.test(text);
  if (isHistoryQuery && !functions.includes('get_user_history')) {
    functions.push('get_user_history');
  }

  if (functions.length > 0) {
    console.log(`🔗 [LOCAL] Blockchain detection: "${text.substring(0, 50)}..." → [${functions.join(', ')}]`);
  }
  
  return {
    isBlockchain: functions.length > 0,
    functions
  };
}

/**
 * Detecta URLs en el mensaje del usuario
 */
function detectUrls(text) {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
  const urls = text.match(urlRegex) || [];
  
  // Validate URLs
  return urls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Ejecuta las funciones blockchain detectadas y retorna el contexto
 * @param {string} messageText - Mensaje del usuario
 * @param {string[]} functions - Funciones blockchain a ejecutar
 * @param {string|undefined} connectedWallet - Wallet conectada del usuario (opcional)
 */
async function executeBlockchainFunctions(messageText, functions, connectedWallet = null, hasGraphContext = false) {
  const results = [];
  
  for (const funcName of functions) {
    try {
      let args = {};

      // ── Skip staking RPC when Graph already has the data ─────────────────
      // If walletAuth was verified and Graph returned data, skip the redundant RPC call.
      // The graph context is injected into enrichedContents and Gemini will use it directly.
      if (funcName === 'get_user_staking_position' && hasGraphContext) {
        console.log(`[LOCAL] ⏭️ Skipping ${funcName} — Graph context already available`);
        continue;
      }
      // ─────────────────────────────────────────────────────────────────────
      
      // Extraer argumentos si es necesario
      if (funcName === 'check_wallet_balance') {
        // Primero intentar extraer direccion del mensaje
        const addressMatch = messageText.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          args = { walletAddress: addressMatch[0] };
        } else if (connectedWallet) {
          // Si no hay direccion en el mensaje, usar la wallet conectada
          args = { connectedWallet: connectedWallet };
          console.log(`[LOCAL] Using connected wallet: ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
        } else {
          // No hay direccion disponible
          console.log(`[LOCAL] Skipping ${funcName}: No wallet address found and no connected wallet`);
          results.push({ 
            name: funcName, 
            result: { 
              success: false, 
              error: 'Para ver tu balance, conecta tu wallet o proporciona una direccion (ej: 0x1234...)' 
            } 
          });
          continue;
        }
      }

      if (funcName === 'get_user_staking_position') {
        const addressMatch = messageText.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          args = { walletAddress: addressMatch[0] };
        } else if (connectedWallet) {
          args = { connectedWallet: connectedWallet };
          console.log(`[LOCAL] Using connected wallet (staking): ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
        } else {
          console.log(`[LOCAL] Skipping ${funcName}: No wallet address found and no connected wallet`);
          results.push({
            name: funcName,
            result: {
              success: false,
              error: 'Para ver tus depositos/recompensas de staking, conecta tu wallet o proporciona una direccion (ej: 0x1234...)'
            }
          });
          continue;
        }
      }
      
      if (funcName === 'get_user_nfts') {
        const addressMatch = messageText.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          args = { walletAddress: addressMatch[0] };
        } else if (connectedWallet) {
          args = { connectedWallet: connectedWallet };
          console.log(`[LOCAL] Using connected wallet (NFTs): ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
        } else {
          console.log(`[LOCAL] Skipping ${funcName}: No wallet address found`);
          results.push({
            name: funcName,
            result: { success: false, error: 'Para ver tus NFTs, conecta tu wallet o proporciona una dirección (ej: 0x1234...)' }
          });
          continue;
        }
      }

      if (funcName === 'get_user_history') {
        const addressMatch = messageText.match(/0x[a-fA-F0-9]{40}/);
        if (addressMatch) {
          args = { address: addressMatch[0] };
        } else if (connectedWallet) {
          args = { address: connectedWallet };
          console.log(`[LOCAL] Using connected wallet (history): ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
        } else {
          console.log(`[LOCAL] Skipping ${funcName}: No wallet address found`);
          results.push({
            name: funcName,
            result: { success: false, error: 'Para ver tu historial, conecta tu wallet o proporciona una dirección (ej: 0x1234...)' }
          });
          continue;
        }
      }

      if (funcName === 'estimate_staking_reward') {
        const amountMatch = messageText.match(/(\d+(?:\.\d+)?)\s*(?:pol|matic)/i);
        args = { amount: amountMatch ? parseFloat(amountMatch[1]) : 100 };
      }
      
      console.log(`[LOCAL] Executing ${funcName}...`);
      const result = await executeBlockchainFunction(funcName, args);
      console.log(`[LOCAL] Result for ${funcName}:`, JSON.stringify(result, null, 2));
      results.push({ name: funcName, result });
      console.log(`[LOCAL] ${funcName} completed successfully`);
    } catch (error) {
      console.error(`[LOCAL] Error in ${funcName}:`, error.message);
    }
  }
  
  if (results.length === 0) {
    console.log('⚠️ [LOCAL] No blockchain results to return');
    return '';
  }
  
  // Helper function to get source label (sin emojis para mejor compatibilidad)
  const getSourceLabel = (source) => {
    const sources = {
      'coingecko': 'CoinGecko API',
      'binance': 'Binance API',
      'diadata': 'DIA Data Oracle',
      'polygon': 'Polygon RPC',
      'contract': 'Smart Contract',
      'fallback': 'Datos Estimados'
    };
    return sources[source] || source || 'Blockchain';
  };

  // Formatear los resultados - los datos vienen directamente en result, no en result.data
  const formattedContext = `\n\n**DATOS BLOCKCHAIN EN TIEMPO REAL:**\n${results.map(r => {
    if (r.result && r.result.success) {
      // Extraer los campos relevantes según el tipo de función
      if (r.name === 'get_pol_price') {
        const { price, change24h, volume24h, marketCap } = r.result;
        const changeEmoji = change24h > 0 ? '📈' : change24h < 0 ? '📉' : '➡️';
        return `\n**💰 Precio POL:**\n  • Precio actual: $${price?.toFixed(4) || 'N/A'} USD\n  • Cambio 24h: ${changeEmoji} ${change24h ? `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%` : 'N/A'}${volume24h ? `\n  • Volumen 24h: $${(volume24h/1e6).toFixed(2)}M USD` : ''}${marketCap ? `\n  • Market Cap: $${(marketCap/1e6).toFixed(2)}M USD` : ''}\n`;
      }
      if (r.name === 'get_staking_info') {
        const { totalStaked, totalStakedUSD, apy, apyRates, totalParticipants, totalRewardsPaid } = r.result;
        const apyDetails = apyRates ? `\n    • Flexible: ${apyRates.flexible?.toFixed(2)}%\n    • 30 días: ${apyRates.locked30?.toFixed(2)}%\n    • 90 días: ${apyRates.locked90?.toFixed(2)}%\n    • 180 días: ${apyRates.locked180?.toFixed(2)}%\n    • 365 días: ${apyRates.locked365?.toFixed(2)}%` : '';
        return `\n**🏦 Staking Pool Global:**\n  • Total staked: ${totalStaked || 'N/A'} (~$${totalStakedUSD?.toLocaleString() || 'N/A'} USD)\n  • APY base: ${apy?.toFixed(2) || 'N/A'}%${apyDetails}\n  • Participantes activos: ${totalParticipants?.toLocaleString() || 'N/A'}\n  • Recompensas pagadas: ${totalRewardsPaid || 'N/A'}\n`;
      }
      if (r.name === 'get_nft_listings') {
        const { totalListings, activeListings, floorPrice, message, source } = r.result;
        const count = Array.isArray(activeListings) ? activeListings.length : activeListings || 0;
        return `\n**🎨 NFT Marketplace:**\n  • Total NFTs: ${totalListings || 0}\n  • Activos: ${count}${floorPrice ? `\n  • Floor price: ${floorPrice}` : ''}${message ? `\n  ℹ️  ${message}` : ''}\n  [Fuente: ${getSourceLabel(source || 'contract')}]\n`;
      }
      if (r.name === 'check_wallet_balance') {
        const { address, balancePOL, balanceUSD, stakedAmount, pendingRewards } = r.result;
        return `\n**👛 Tu Wallet ${address?.slice(0,6)}...${address?.slice(-4)}:**\n  • Balance disponible: ${balancePOL || 'N/A'} (~$${balanceUSD?.toFixed(2) || 'N/A'} USD)${stakedAmount && stakedAmount !== '0 POL' ? `\n  • En staking: ${stakedAmount}` : ''}${pendingRewards && pendingRewards !== '0 POL' ? `\n  • Rewards pendientes: ${pendingRewards}` : ''}\n`;
      }
      if (r.name === 'estimate_staking_reward') {
        const { amount, duration, estimatedReward, estimatedRewardUSD, apy, isLocked } = r.result;
        return `\n**📈 Estimación de Recompensas:**\n  • Monto: ${amount}\n  • Duración: ${duration}\n  • Tipo: ${isLocked ? '🔒 Locked' : '🔓 Flexible'}\n  • APY aplicado: ${apy?.toFixed(2) || 'N/A'}%\n  • Recompensa estimada: ${estimatedReward || 'N/A'} (~$${estimatedRewardUSD?.toFixed(2) || 'N/A'} USD)\n  [Fuente: Cálculo basado en contrato]\n`;
      }

      if (r.name === 'get_user_staking_position') {
        const {
          totalDepositedPOL,
          depositCount,
          pendingRewardsPOL,
          hasAutoCompound,
          nextUnlockTime,
          apyRates,
          recommendations,
          depositSummary,
        } = r.result;

        // Format deposit summary with amounts and detect locked deposits
        let depositSummaryText = '';
        let hasLockedDeposits = false;
        
        if (depositSummary) {
          const flexible = depositSummary.flexible || {};
          const locked30 = depositSummary.locked30 || {};
          const locked90 = depositSummary.locked90 || {};
          const locked180 = depositSummary.locked180 || {};
          const locked365 = depositSummary.locked365 || {};
          
          hasLockedDeposits = (locked30.count || 0) + (locked90.count || 0) + (locked180.count || 0) + (locked365.count || 0) > 0;
          
          const deposits = [];
          if (flexible.count > 0) {
            deposits.push(`    🔓 **Flexible:** ${flexible.count} depósito${flexible.count > 1 ? 's' : ''} (${flexible.totalAmountPOL.toFixed(2)} POL) - Retirable cuando quieras`);
          }
          if (locked30.count > 0) {
            deposits.push(`    🔒 **Locked 30d:** ${locked30.count} depósito${locked30.count > 1 ? 's' : ''} (${locked30.totalAmountPOL.toFixed(2)} POL) - APY: ${apyRates?.locked30?.toFixed(2)}%`);
          }
          if (locked90.count > 0) {
            deposits.push(`    🔒 **Locked 90d:** ${locked90.count} depósito${locked90.count > 1 ? 's' : ''} (${locked90.totalAmountPOL.toFixed(2)} POL) - APY: ${apyRates?.locked90?.toFixed(2)}%`);
          }
          if (locked180.count > 0) {
            deposits.push(`    🔒 **Locked 180d:** ${locked180.count} depósito${locked180.count > 1 ? 's' : ''} (${locked180.totalAmountPOL.toFixed(2)} POL) - APY: ${apyRates?.locked180?.toFixed(2)}%`);
          }
          if (locked365.count > 0) {
            deposits.push(`    🔒 **Locked 365d:** ${locked365.count} depósito${locked365.count > 1 ? 's' : ''} (${locked365.totalAmountPOL.toFixed(2)} POL) - APY: ${apyRates?.locked365?.toFixed(2)}%`);
          }
          
          if (deposits.length > 0) {
            depositSummaryText = `\n  **Tus Depósitos:**\n${deposits.join('\n')}`;
          }
        }

        // Only show next unlock if there are locked deposits
        const unlockText = (hasLockedDeposits && nextUnlockTime) 
          ? `\n  • 📅 Próximo desbloqueo: ${nextUnlockTime}` 
          : '';

        // Format recommendations
        const recText = Array.isArray(recommendations) && recommendations.length
          ? `\n  **💡 Recomendaciones:**\n${recommendations.map((rec, idx) => `    ${idx + 1}. ${rec}`).join('\n')}`
          : '';

        return `\n**📊 Tu Posición de Staking:**\n  • Total depositado: ${totalDepositedPOL || 'N/A'}\n  • Número de depósitos: ${depositCount ?? 'N/A'}\n  • Rewards acumulados: ${pendingRewardsPOL || 'N/A'}\n  • Auto-Compound: ${hasAutoCompound ? '✅ Activado' : '❌ Desactivado'}${unlockText}${depositSummaryText}${recText}\n`;
      }
      if (r.name === 'get_user_nfts') {
        const { address, nftBalance, activeListings, note } = r.result;
        const shortAddr = address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'tu wallet';
        return `\n**🎨 NFTs de ${shortAddr}:**\n  • Skill NFTs en wallet: **${nftBalance ?? 0}**${activeListings > 0 ? `\n  • Listados en venta: ${activeListings}` : '\n  • Ninguno listado actualmente'}${note ? `\n  ℹ️ ${note}` : ''}\n`;
      }
      if (r.name === 'get_user_history') {
        const { totalDeposited, totalWithdrawn, depositCount, withdrawalCount, nftMintedCount,
          nftSoldCount, nftBoughtCount, level, totalXP, recentDeposits, recentWithdrawals } = r.result;
        const recentDepText = Array.isArray(recentDeposits) && recentDeposits.length > 0
          ? `\n  **Últimos depósitos:**\n${recentDeposits.slice(0, 3).map(d => {
              const date = new Date(d.timestamp * 1000).toLocaleDateString('es-ES');
              return `    • ${d.amount} (${d.lockupDuration > 0 ? `${d.lockupDuration}d locked` : 'flexible'}) - ${date}`;
            }).join('\n')}`
          : '';
        const recentWithText = Array.isArray(recentWithdrawals) && recentWithdrawals.length > 0
          ? `\n  **Últimos retiros:**\n${recentWithdrawals.slice(0, 3).map(w => {
              const date = new Date(w.timestamp * 1000).toLocaleDateString('es-ES');
              return `    • ${w.amount} - ${date}`;
            }).join('\n')}`
          : '';
        return `\n**📈 Tu Historial de Actividad:**\n  • Total depositado: **${totalDeposited || '0 POL'}** (${depositCount ?? 0} depósito${depositCount !== 1 ? 's' : ''})\n  • Total retirado: ${totalWithdrawn || '0 POL'} (${withdrawalCount ?? 0} retiro${withdrawalCount !== 1 ? 's' : ''})\n  • NFTs minteados: ${nftMintedCount ?? 0} | Vendidos: ${nftSoldCount ?? 0} | Comprados: ${nftBoughtCount ?? 0}\n  • Nivel: ${level ?? 0} | XP total: ${totalXP ?? 0}${recentDepText}${recentWithText}\n`;
      }
      return `- ${r.name}: ${JSON.stringify(r.result)}`;
    }
    return `- ${r.name}: Error o sin datos`;
  }).join('\n')}\n`;
  
  console.log(`📊 [LOCAL] Formatted blockchain context: ${formattedContext}`);
  return formattedContext;
}

// === Utilidades ===
/**
 * Valida la entrada del usuario para generación de contenido Gemini.
 * @param {object} data - Datos recibidos en el body.
 * @returns {string[]} Lista de errores descriptivos.
 */
function validateInput(data) {
  const errors = [];
  if (!data.prompt && (!data.messages || !Array.isArray(data.messages) || data.messages.length === 0)) {
    errors.push('Debes proporcionar un prompt o un historial de mensajes válido. Ejemplo: { prompt: "¿Cuál es la capital de Francia?" }');
  }
  if (data.temperature !== undefined && (typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 2)) {
    errors.push('El parámetro "temperature" debe ser un número entre 0 y 2. Ejemplo: { temperature: 0.7 }');
  }
  if (data.maxTokens !== undefined && (typeof data.maxTokens !== 'number' || data.maxTokens < 1 || data.maxTokens > 8192)) {
    errors.push('El parámetro "maxTokens" debe ser un número entre 1 y 8192. Ejemplo: { maxTokens: 2048 }');
  }
  if (data.image && typeof data.image !== 'string') {
    errors.push('El campo "image" debe ser una cadena en formato base64.');
  }
  return errors;
}

// Función mejorada para optimización inteligente de conversaciones
function optimizeMessages(messages, maxMessages = 20) {
  if (!Array.isArray(messages) || messages.length <= maxMessages) {
    return messages;
  }
  
  // Análisis inteligente de importancia de mensajes
  const messageImportance = messages.map((msg, index) => {
    let score = 0;
    
    // Mensajes recientes son más importantes
    score += (index / messages.length) * 3;
    
    // Mensajes del usuario son más importantes
    if (msg.role === 'user') score += 2;
    
    // Mensajes con preguntas son importantes
    if (msg.parts?.[0]?.text?.includes('?')) score += 1.5;
    
    // Mensajes con código o datos técnicos
    if (msg.parts?.[0]?.text?.match(/```|{|}|\[|\]/)) score += 1;
    
    // Mensajes cortos probablemente son menos importantes
    if (msg.parts?.[0]?.text?.length < 50) score -= 0.5;
    
    return { ...msg, index, score };
  });
  
  // Mantener siempre los primeros 2 mensajes (contexto inicial)
  const contextMessages = messages.slice(0, 2);
  
  // Ordenar por importancia y tomar los mejores
  const remainingMessages = messageImportance
    .slice(2)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMessages - 4) // Reservar espacio para contexto y resumen
    .sort((a, b) => a.index - b.index); // Reordenar cronológicamente
  
  // Crear resumen inteligente del contenido omitido
  const omittedCount = messages.length - contextMessages.length - remainingMessages.length;
  const summaryMessage = {
    role: 'model',
    parts: [{
      text: `[Contexto: ${omittedCount} mensajes anteriores resumidos. Conversación continúa manteniendo el hilo principal.]`
    }]
  };
  
  return [
    ...contextMessages,
    summaryMessage,
    ...remainingMessages.map(({ score, index, ...msg }) => msg)
  ];
}

/**
 * Genera contenido usando Gemini.
 * POST /api/gemini/generate
 */
export async function generateContent(req, res, next = null) {
  const metricsStart = Date.now();
  chatLogger.reset();
  
  try {
    const { prompt, model, messages, temperature, maxTokens, stream, image, walletAddress, walletAuth, activeSkills } = req.body;
    
    // ── WALLET AUTH + GRAPH CONTEXT ──────────────────────────────────────────
    // Verify EIP-191 signature and fetch on-chain data from The Graph
    let graphUserContext = '';
    if (walletAuth?.walletAddress && walletAuth?.message && walletAuth?.signature) {
      try {
        const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
        const tsMatch = walletAuth.message.match(/Timestamp:\s*(\d+)/);
        const msgTimestamp = tsMatch ? parseInt(tsMatch[1], 10) : null;
        const now = Date.now();
        const isTimestampValid = msgTimestamp &&
          msgTimestamp <= now + 5 * 60 * 1000 &&
          now - msgTimestamp <= SESSION_TTL_MS;

        if (isTimestampValid) {
          const recovered = verifyMessage(walletAuth.message, walletAuth.signature);
          if (recovered.toLowerCase() === walletAuth.walletAddress.toLowerCase()) {
            const userData = await fetchUserBlockchainData(walletAuth.walletAddress);
            if (userData) {
              graphUserContext = formatUserContextForAI(userData);
              console.log(`[LOCAL] ✅ Graph context fetched for ${walletAuth.walletAddress.slice(0,6)}...${walletAuth.walletAddress.slice(-4)} (${graphUserContext.length} chars)`);
            }
          } else {
            console.warn('[LOCAL] ⚠️ walletAuth signature mismatch — ignoring');
          }
        } else {
          console.warn('[LOCAL] ⚠️ walletAuth timestamp expired or invalid — ignoring');
        }
      } catch (authErr) {
        console.warn('[LOCAL] ⚠️ walletAuth verification error:', authErr.message);
      }
    }
    // ────────────────────────────────────────────────────────────────────────
    
    // Get the actual query for logging - MEJORADO para capturar el texto correctamente
    let queryText = prompt || '';
    if (!queryText && messages && Array.isArray(messages) && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      queryText = lastMsg?.text || lastMsg?.parts?.[0]?.text || lastMsg?.content || '';
    }
    
    console.log(`📝 [LOCAL] Query received: "${queryText.substring(0, 100)}..."`);
    
    chatLogger.logSystemInfo({
      kbEnabled: true,
      embeddingsEnabled: true
    });
    
    chatLogger.logQueryAnalysis(queryText, {
      needsKB: true,
      confidence: 0.8
    });
    
    // Iniciar tracking de analytics
    const requestMetrics = analyticsService.startRequest('generate_content', req.body.model || 'default');
    
    // Validación de entrada
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
      analyticsService.failRequest(requestMetrics, new Error('Validation failed'));
      chatLogger.logError(new Error('Validation failed'), 'Input validation');
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos', 
        details: validationErrors 
      });
    }

    // ✅ CRÍTICO: NO modificar el contenido del usuario aquí
    // La búsqueda de KB y el systemInstruction se manejan automáticamente en processGeminiStreamRequest/processGeminiRequest
    // Esto asegura que el contexto de KB se pase como systemInstruction, NO como parte del mensaje del usuario

    // Validación de tamaño de imagen (configurable)
    if (image && typeof image === 'string') {
      const base64Length = image.length - (image.indexOf(',') + 1);
      const imageSize = Math.ceil(base64Length * 3 / 4); // Aproximación
      if (imageSize > IMAGE_SIZE_LIMIT) {
        return res.status(413).json({
          error: `La imagen es demasiado grande (máx ${(IMAGE_SIZE_LIMIT / (1024 * 1024)).toFixed(1)}MB). Usa una imagen más pequeña.`
        });
      }
    }

    // Detectar multimodalidad (imagen en el mensaje)
    let contents;
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Si el último mensaje tiene texto y/o imagen, prepara contenido multimodal
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.image || lastMsg.text) {
        const parts = [];
        // ✅ NO modificar el texto del usuario - enviarlo tal cual
        if (lastMsg.text) parts.push({ text: lastMsg.text });
        if (lastMsg.image) {
          // Extrae el mimeType si está presente, si no usa png por defecto
          const mimeMatch = lastMsg.image.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
          parts.push({ inlineData: { mimeType, data: lastMsg.image.replace(/^data:image\/\w+;base64,/, '') } });
        }
        contents = [
          ...optimizeMessages(messages.slice(0, -1), 24),
          {
            role: lastMsg.role || 'user',
            parts
          }
        ];
      } else {
        contents = optimizeMessages(messages, 25);
      }
    } else if (image) {
      // Si viene imagen directa en el body
      // ✅ NO modificar el prompt - enviarlo tal cual
      contents = [
        { role: 'user', parts: [
          ...(prompt ? [{ text: prompt }] : []),
          { inlineData: { mimeType: 'image/png', data: image.replace(/^data:image\/\w+;base64,/, '') } }
        ]}
      ];
    } else {
      // ✅ Para prompts simples, enviar sin modificar
      contents = prompt;
    }

    // Parámetros adaptativos basados en el tipo de contenido
    const isComplexQuery = typeof contents === 'string' 
      ? contents.length > 200 || contents.includes('explain') || contents.includes('analyze')
      : Array.isArray(contents) && contents.some(msg => 
          msg.parts?.[0]?.text?.length > 200 || 
          msg.parts?.[0]?.text?.includes('explain')
        );

    // ── DYNAMIC maxOutputTokens (cost optimization) ────────────────────────
    // Blockchain-only queries never need long prose — cap at 512.
    // Skill-heavy queries (auditor, research) need room — use 2048.
    // Everything else keeps the smart default.
    const blockchainDetectionEarly = detectBlockchainQuery(queryText);
    const isBlockchainOnlyQuery = blockchainDetectionEarly.isBlockchain && !isComplexQuery;
    const isSkillHeavyQuery = activeSkills?.some(s => ['contract-auditor', 'token-research', 'risk-analysis'].includes(s));
    const computedMaxTokens = maxTokens ||
      (isSkillHeavyQuery ? 2048 :
        isBlockchainOnlyQuery ? 512 :
          isComplexQuery ? 1500 : 1024);

    const params = {
      temperature: temperature || (isComplexQuery ? 0.7 : 0.8),
      maxOutputTokens: computedMaxTokens,
      topP: isComplexQuery ? 0.9 : 0.95 // Más conservador para consultas complejas
    };

    // Streaming nativo mejorado
    if (stream) {
      try {
        // Headers optimizados para streaming (sin forzar Transfer-Encoding)
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Nginx
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Detectar características del cliente
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Mobile|Android|iPhone/.test(userAgent);
        
        // Configuración adaptativa (reservada para uso futuro)
        const streamConfig = {
          enableCompression: !isMobile,
          bufferSize: isMobile ? 512 : 1024,
          flushInterval: isMobile ? 30 : 50
        };
        
        // Log response generation start
        chatLogger.logResponseStart(model || 'gemini-2.5-flash', {
          temperature: params.temperature,
          maxTokens: params.maxOutputTokens,
          streaming: true
        });
        
        // 🔗 URL CONTEXT: Detectar URLs en el mensaje y extraer contenido
        const detectedUrls = detectUrls(queryText);
        const hasUrls = detectedUrls.length > 0;
        let urlContext = '';
        
        if (hasUrls) {
          console.log(`\n🔗 =========== URL DETECTION ===========`);
          console.log(`🔗 URLs detected: ${detectedUrls.length}`);
          console.log(`🔗 URLs:`, detectedUrls);
          console.log(`🔗 ====================================\n`);
          
          // Extract URL content
          console.log(`🔗 Extracting content from URLs...`);
          try {
            const urlContents = [];
            for (const url of detectedUrls) {
              try {
                const result = await webScraperService.extractContent(url, { maxContentLength: 4000 });
                if (result.success && result.content) {
                  urlContents.push(`\n[URL: ${url}]\n${result.content}`);
                  console.log(`✅ URL content extracted: ${result.content.length} chars from ${url}`);
                }
              } catch (urlError) {
                console.warn(`⚠️ Failed to extract ${url}:`, urlError.message);
              }
            }
            
            if (urlContents.length > 0) {
              urlContext = urlContents.join('\n\n');
              console.log(`📄 Total URL context: ${urlContext.length} chars`);
            }
          } catch (error) {
            console.error('Error extracting URL content:', error);
          }
        }
        
        // 🔗 BLOCKCHAIN FUNCTION CALLING: Detectar y ejecutar funciones blockchain
        const blockchainDetection = detectBlockchainQuery(queryText);
        let enrichedContents = contents;
        
        console.log(`\n🔗 =========== BLOCKCHAIN DETECTION ===========`);
        console.log(`🔗 Query: "${queryText}"`);
        console.log(`🔗 Is Blockchain: ${blockchainDetection.isBlockchain}`);
        console.log(`🔗 Functions: ${blockchainDetection.functions.join(', ') || 'none'}`);
        console.log(`🔗 =============================================\n`);
        
        // Flag para indicar si es blockchain query (salta KB search)
        let isBlockchainQuery = false;
        
        if (blockchainDetection.isBlockchain) {
          isBlockchainQuery = true;
          console.log(`[LOCAL] Blockchain query detected: ${blockchainDetection.functions.join(', ')}`);
          const blockchainContext = await executeBlockchainFunctions(queryText, blockchainDetection.functions, walletAddress, Boolean(graphUserContext));
          
          console.log(`🔗 [LOCAL] Blockchain context result: "${blockchainContext}"`);
          
          if (blockchainContext) {
            const isStakingAdviceQuery =
              /(optimiza|optimizar|mejorar|recomend|consej|estrateg)/i.test(queryText) &&
              /(stake|staking|recompens|rewards)/i.test(queryText);

            // Crear instrucción específica para respuestas de datos blockchain
            const blockchainSystemPrompt = isStakingAdviceQuery
              ? `INSTRUCCIONES CRÍTICAS:
1. Usa los datos on-chain proporcionados para este usuario
2. Responde en español con 3-5 recomendaciones ACCIONABLES para optimizar rewards
3. Menciona cifras clave (depositado, rewards pendientes, tipo de depósitos)
4. NO busques en base de conocimiento; usa SOLO estos datos + buenas prácticas generales
5. Sé claro y conciso

DATOS EN TIEMPO REAL (USUARIO):
${blockchainContext}

Formato sugerido: 1 frase con resumen + 3-5 bullets cortos.`
              : `INSTRUCCIONES CRÍTICAS:
1. Responde DIRECTAMENTE con los datos proporcionados
2. Sé BREVE y PRECISO - máximo 2-3 oraciones
3. Muestra el dato exacto con claridad
4. NO busques en base de conocimiento - usa SOLO los datos proporcionados
5. NO divagues ni añadas información extra
6. NO menciones fuentes técnicas (RPC, API, etc) al usuario

DATOS EN TIEMPO REAL:
${blockchainContext}

Formato de respuesta esperado: "[Dato] de forma clara y directa."`;


            // Enriquecer el contenido con datos blockchain
            if (typeof contents === 'string') {
              enrichedContents = `${blockchainSystemPrompt}\n\nPregunta del usuario: ${contents}`;
            } else if (Array.isArray(contents) && contents.length > 0) {
              // Para arrays de mensajes, agregar como mensaje de sistema al inicio
              enrichedContents = [
                {
                  role: 'user',
                  parts: [{ text: blockchainSystemPrompt }]
                },
                {
                  role: 'model', 
                  parts: [{ text: 'Entendido. Responderé usando únicamente los datos blockchain proporcionados de forma breve y precisa.' }]
                },
                ...contents
              ];
            }
            console.log(`📊 [LOCAL] Blockchain context added: ${blockchainContext.length} chars`);
          }
        }
        
        // Add URL content context if available (after blockchain context)
        if (urlContext) {
          const urlSystemPrompt = `[CONTENIDO DE URL - ANALIZA ESTE CONTENIDO PARA RESPONDER]:\n${urlContext}`;
          
          if (typeof enrichedContents === 'string') {
            enrichedContents = `${enrichedContents}\n\n${urlSystemPrompt}`;
          } else if (Array.isArray(enrichedContents) && enrichedContents.length > 0) {
            // Agregar contexto de URL al último mensaje del usuario
            const lastMessage = enrichedContents[enrichedContents.length - 1];
            if (lastMessage.role === 'user' && lastMessage.parts && lastMessage.parts[0]) {
              lastMessage.parts[0].text = `${lastMessage.parts[0].text}\n\n${urlSystemPrompt}`;
            }
          }
          console.log(`📄 [LOCAL] URL context added: ${urlContext.length} chars`);
        }
        
        // Configurar tools si hay URLs detectadas (mantener como fallback)
        const configTools = hasUrls ? [{ url_context: {} }] : undefined;
        
        if (hasUrls) {
          console.log('✅ URL context: explicit content + tool enabled as fallback');
        }
        
        // Hybrid query: blockchain data + conceptual question → keep KB enabled
        const isHybridQuery = blockchainDetection.isBlockchain &&
          /\b(skill|qu[ée] es|c[oó]mo funciona|explica|beneficio|informaci[oó]n|ventaj|para qu[ée]|tipos?|qu[ée] tipo|cu[aá]les)\b/i.test(queryText);

        // ── INJECT GRAPH USER CONTEXT ──────────────────────────────────────
        // Prepend verified on-chain Graph data as a context exchange before the user's query
        if (graphUserContext) {
          const graphBlock = `[DATOS ON-CHAIN VERIFICADOS DEL USUARIO — USA ESTOS DATOS PARA RESPONDER PREGUNTAS SOBRE SU POSICIÓN]:\n${graphUserContext}`;
          if (Array.isArray(enrichedContents)) {
            enrichedContents = [
              { role: 'user', parts: [{ text: graphBlock }] },
              { role: 'model', parts: [{ text: 'Datos on-chain del usuario cargados correctamente. Los usaré para responder preguntas sobre su posición.' }] },
              ...enrichedContents,
            ];
          } else {
            enrichedContents = [
              { role: 'user', parts: [{ text: graphBlock }] },
              { role: 'model', parts: [{ text: 'Datos on-chain del usuario cargados correctamente. Los usaré para responder preguntas sobre su posición.' }] },
              { role: 'user', parts: [{ text: typeof enrichedContents === 'string' ? enrichedContents : queryText }] },
            ];
          }
          console.log(`[LOCAL] 📊 Graph context injected: ${graphUserContext.length} chars`);
        }

        // ── INJECT ACTIVE SKILLS CONTEXT ───────────────────────────────────
        // Append skill capability blocks so Gemini knows what specialized analyses it can do
        const skillsContextBlock = buildSkillsContext(activeSkills);
        if (skillsContextBlock) {
          if (Array.isArray(enrichedContents)) {
            enrichedContents = [
              { role: 'user', parts: [{ text: skillsContextBlock }] },
              { role: 'model', parts: [{ text: `Skills loaded: ${activeSkills.join(', ')}. I will apply these specialized capabilities when relevant to the user's questions.` }] },
              ...enrichedContents,
            ];
          }
          console.log(`[LOCAL] 🔮 Skills context injected: [${activeSkills.join(', ')}]`);
        }
        // ──────────────────────────────────────────────────────────────────

        // Obtener stream nativo de Gemini - pasar flag para saltar KB si es blockchain (pero no para hybrid)
        const geminiStream = await processGeminiStreamRequest(enrichedContents, model, params, { 
          skipKnowledgeBase: isBlockchainQuery && !isHybridQuery,
          tools: configTools 
        });
        
        // ✅ RECOLECTAR RESPUESTA COMPLETA del stream de Gemini
        let fullResponse = '';
        let chunkCount = 0;
        const responseStartTime = Date.now();
        
        for await (const chunk of geminiStream) {
          const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text || chunk?.text || '';
          if (text) {
            fullResponse += text;
            chunkCount++;
            chatLogger.logResponseProgress(chunkCount, fullResponse.length);
          }
        }
        
        // ✅ APPLY MARKDOWN FORMATTING: Ensure consistent formatting across all environments
        // This guarantees that both local dev and production responses have proper markdown structure
        const formattedResponse = formatResponseForMarkdown(fullResponse);
        
        // Log response completion
        const responseDuration = Date.now() - responseStartTime;
        chatLogger.logResponseComplete(formattedResponse.length, responseDuration);
        
        // ✅ STREAMING SEMÁNTICO: Procesar la respuesta completa con chunking inteligente
        await semanticStreamingService.streamSemanticContent(res, formattedResponse, {
          enableSemanticChunking: true,
          enableContextualPauses: true,
          enableVariableSpeed: true,
          clientInfo: {
            userAgent,
            isMobile
          }
        });
        
        // Log final summary
        chatLogger.logSummary({
          queryType: 'streaming',
          kbUsed: true,
          responseLength: formattedResponse.length,
          status: '✅ Success'
        });
        
        analyticsService.endRequest(requestMetrics);
        return;

      } catch (streamError) {
        // Mejor manejo de errores en streaming
        chatLogger.logError(streamError, 'Stream generation');
        analyticsService.failRequest(requestMetrics, streamError);
        
        // Determinar el tipo de error y respuesta apropiada
        let errorMessage = 'Error interno del servidor';
        let statusCode = 500;
        
        if (streamError.message?.includes('temporalmente no disponible') ||
            streamError.message?.includes('sobrecargado') ||
            streamError.message?.includes('overloaded') ||
            streamError.status === 503) {
          errorMessage = 'El servicio está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.';
          statusCode = 503;
        } else if (streamError.message?.includes('API key') ||
                   streamError.message?.includes('authentication')) {
          errorMessage = 'Error de autenticación con el servicio de IA';
          statusCode = 401;
        } else if (streamError.message?.includes('Timeout')) {
          errorMessage = 'El servicio tardó demasiado en responder. Por favor, inténtalo de nuevo.';
          statusCode = 408;
        } else if (streamError.message) {
          errorMessage = streamError.message;
        }
        
        if (!res.headersSent) {
          return res.status(statusCode).json({ 
            message: errorMessage,
            error: errorMessage,
            code: statusCode,
            isOverload: statusCode === 503,
            retryAfter: statusCode === 503 ? 30 : undefined
          });
        } else {
          try {
            res.end(`data: ${JSON.stringify({ 
              error: errorMessage, 
              code: statusCode,
              isOverload: statusCode === 503,
              retryAfter: statusCode === 503 ? 30 : undefined
            })}\n\n`);
          } catch (_) {}
        }
      }
    }

    // Solo procesar respuesta no-streaming si no es streaming
    if (!stream) {
      const response = await processGeminiRequest(contents, model, params);
      
      // Registrar éxito en analytics
      analyticsService.endRequest(requestMetrics, {
        tokensUsed: response.usage?.totalTokens || 0,
        inputTokens: response.usage?.promptTokens || 0,
        outputTokens: response.usage?.completionTokens || 0,
        model: model || 'default'
      });

      return res.json({
        message: 'Respuesta de Gemini generada correctamente',
        response: response.text,
        // Si el modelo devuelve imagen, inclúyela
        image: response.image || null,
        metadata: {
          model: model || 'default',
          tokensUsed: response.usage?.totalTokens || 0,
          timestamp: new Date().toISOString(),
          contextCache: Array.isArray(contents) && contents.length >= 3 ? 'potentially-used' : 'not-applicable'
        }
      });
    }


  } catch (error) {
    // FIXED: Improved error handling to prevent FUNCTION_INVOCATION_FAILED
    console.error('Critical error in generateContent:', error);
    
    // Registrar fallo en analytics
    if (requestMetrics) {
      try {
        analyticsService.failRequest(requestMetrics, error);
      } catch (analyticsError) {
        console.error('Error logging analytics:', analyticsError);
      }
    }
    
    // Ensure response is sent properly
    if (!res.headersSent) {
      try {
        return res.status(500).json({ 
          message: 'Error interno del servidor',
          error: 'Ha ocurrido un error inesperado',
          code: 500
        });
      } catch (responseError) {
        console.error('Error sending error response:', responseError);
      }
    } else {
      try {
        res.end(`data: ${JSON.stringify({ 
          error: 'Error interno del servidor', 
          code: 500
        })}\n\n`);
      } catch (endError) {
        console.error('Error ending response:', endError);
      }
    }
    
    // FIXED: Don't call next(error) in Vercel as it can cause FUNCTION_INVOCATION_FAILED
    // Instead, ensure the response is properly handled above
  }
}

/**
 * Genera contenido usando Gemini (GET).
 * GET /api/gemini/generate
 */
export async function generateContentGet(req, res, next) {
  const requestMetrics = analyticsService.startRequest('generate_content_get', req.query.model || 'default');
  
  try {
    const prompt = req.query.prompt;
    const model = req.query.model;
    
    if (!prompt) {
      analyticsService.failRequest(requestMetrics, new Error('Missing prompt'));
      return res.status(400).json({ error: 'Se requiere un prompt' });
    }
    
    const response = await processGeminiRequest(prompt, model);
    
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      model: model || 'default'
    });
    
    res.json({
      message: 'Respuesta de Gemini generada correctamente',
      response: response.text
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Llama funciones usando Gemini Function Calling.
 * POST /api/gemini/function-calling
 */
export async function functionCalling(req, res, next) {
  const requestMetrics = analyticsService.startRequest('function_calling', req.body.model || 'default');
  
  try {
    const { 
      prompt, 
      model, 
      functionDeclarations, 
      functionCallingMode, 
      allowedFunctionNames 
    } = req.body;

    const response = await processFunctionCallingRequest({
      prompt,
      model,
      functionDeclarations,
      functionCallingMode,
      allowedFunctionNames
    });

    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      model: model || 'default',
      functionCallsCount: response.functionCalls?.length || 0
    });

    res.json({
      message: 'Respuesta de Gemini con Function Calling',
      response: response.text,
      functionCalls: response.functionCalls
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Devuelve el estado de salud del API.
 * GET /api/gemini/health
 */
export function getHealthStatus(req, res) {
  res.json({
    status: 'ok',
    ...getMetrics()
  });
}

/**
 * Endpoint de prueba.
 * GET /api/gemini/hello
 */
export function helloCheck(req, res) {
  res.json({ 
    message: 'Gemini API is running', 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

/**
 * Verifica la conexión con la API de Gemini.
 * GET /api/gemini/check-api
 */
export function checkApiConnection(req, res) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'API key not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Respuesta exitosa
    res.json({
      status: 'ok',
      message: 'API connection available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API connection check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Limpia la caché de Gemini.
 * POST /api/gemini/clear-cache
 */
export function clearCache(req, res) {
  try {
    clearGeminiCache();
    res.json({ 
      message: 'Caché limpiado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar caché' });
  }
}

/**
 * Lista los modelos disponibles de Gemini.
 * GET /api/gemini/models
 */
export function getAvailableModels(req, res) {
  res.json({
    models: [
      {
        name: 'gemini-3.1-flash-lite',
        displayName: 'Gemini 3.1 Flash Lite',
        isDefault: true,
        isStable: true,
        isPreview: false,
        description: 'Optimized stable model for speed and quality - recommended for all use cases'
      }
    ],
    default: 'gemini-3.1-flash-lite',
    note: 'Using the latest stable Gemini 3.1 Flash Lite model for optimal performance and reliability.'
  });
}

/**
 * Analiza un texto usando Gemini.
 * POST /api/gemini/analyze
 */
export async function analyzeText(req, res, next) {
  const requestMetrics = analyticsService.startRequest('analyze_text', 'gemini-analysis');
  
  try {
    const { text, analysisType = 'general', detailedAnalysis = false } = req.body;
    
    if (!text) {
      analyticsService.failRequest(requestMetrics, new Error('Missing text'));
      return res.status(400).json({ error: 'Se requiere texto para analizar' });
    }
    
    // Prompts mejorados y más especializados
    const prompts = {
      sentiment: `Analiza exhaustivamente el sentimiento del siguiente texto. Proporciona:
        1. Puntaje general del -1 (muy negativo) al 1 (muy positivo)
        2. Emociones específicas detectadas
        3. Confianza del análisis (0-100%)
        4. Palabras clave que influyen en el sentimiento
        
        Texto: "${text}"`,
        
      summary: `Crea un resumen estructurado del siguiente texto:
        1. Resumen ejecutivo (50 palabras máximo)
        2. Puntos clave principales
        3. Conclusiones o insights importantes
        
        Texto: "${text}"`,
        
      keywords: `Extrae y categoriza las palabras clave del siguiente texto:
        1. Términos principales (máximo 10)
        2. Entidades mencionadas (personas, lugares, organizaciones)
        3. Conceptos técnicos o especializados
        4. Frecuencia y relevancia de cada término
        
        Texto: "${text}"`,
        
      technical: `Realiza un análisis técnico profundo del siguiente texto:
        1. Complejidad del lenguaje (1-10)
        2. Áreas temáticas identificadas
        3. Terminología especializada
        4. Nivel de expertise requerido para comprensión
        
        Texto: "${text}"`,
        
      linguistic: `Analiza los aspectos lingüísticos del texto:
        1. Estructura y coherencia
        2. Calidad de redacción
        3. Registro del lenguaje (formal/informal)
        4. Sugerencias de mejora
        
        Texto: "${text}"`,
        
      content: `Evalúa la calidad y estructura del contenido:
        1. Claridad del mensaje
        2. Organización de ideas
        3. Completitud de la información
        4. Audiencia objetivo identificada
        
        Texto: "${text}"`,
        
      general: `Proporciona un análisis integral del siguiente texto cubriendo:
        1. Tema principal y subtemas
        2. Tono y estilo
        3. Intención del autor
        4. Insights y observaciones relevantes
        5. Contexto y aplicabilidad
        
        Texto: "${text}"`
    };
    
    // Análisis adicional para textos largos
    let additionalAnalysis = {};
    
    // Análisis de estructura para textos largos
    if (detailedAnalysis && text.length > 500) {
      try {
        const structurePrompt = `Analiza la estructura del siguiente texto y proporciona:
        1. Número de ideas principales
        2. Flujo lógico de argumentos
        3. Transiciones entre secciones
        4. Calidad de la conclusión
        
        Texto: "${text}"`;
        
        const structureResponse = await processGeminiRequest(structurePrompt);
        additionalAnalysis.structure = structureResponse.text;
      } catch (error) {
        console.warn('Error en análisis de estructura:', error);
      }
    }
    
    // Métricas automáticas del texto
    const metrics = {
      length: text.length,
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
      averageWordsPerSentence: Math.round(
        text.split(/\s+/).length / text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      ),
      readingTime: Math.ceil(text.split(/\s+/).length / 200) // Minutos (200 palabras/min)
    };
    
    const prompt = prompts[analysisType] || prompts.general;
    const response = await processGeminiRequest(prompt);
    
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      analysisType,
      textLength: text.length,
      detailedAnalysis
    });

    res.json({
      analysis: response.text,
      type: analysisType,
      metrics,
      additionalAnalysis,
      processingTime: Date.now() - req.startTime || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Compara dos textos usando Gemini.
 * POST /api/gemini/compare
 */
export async function compareTexts(req, res, next) {
  const requestMetrics = analyticsService.startRequest('compare_texts', 'gemini-comparison');
  
  try {
    const { text1, text2, comparisonType = 'similarity' } = req.body;
    
    if (!text1 || !text2) {
      analyticsService.failRequest(requestMetrics, new Error('Missing texts for comparison'));
      return res.status(400).json({ error: 'Se requieren dos textos para comparar' });
    }
    
    const comparisonPrompts = {
      similarity: `Compara estos dos textos y analiza:
        1. Similitud de contenido (0-100%)
        2. Diferencias principales
        3. Temas comunes
        4. Estilo de escritura comparativo
        
        Texto 1: "${text1}"
        Texto 2: "${text2}"`,
        
      quality: `Compara la calidad de estos dos textos:
        1. Claridad y coherencia
        2. Estructura y organización
        3. Uso del lenguaje
        4. Cuál es mejor y por qué
        
        Texto 1: "${text1}"
        Texto 2: "${text2}"`,
        
      sentiment: `Compara el sentimiento de estos textos:
        1. Diferencias en tono emocional
        2. Nivel de positividad/negatividad
        3. Intenciones comunicativas
        
        Texto 1: "${text1}"
        Texto 2: "${text2}"`
    };
    
    const prompt = comparisonPrompts[comparisonType] || comparisonPrompts.similarity;
    const response = await processGeminiRequest(prompt);
    
    analyticsService.endRequest(requestMetrics, {
      tokensUsed: response.usage?.totalTokens || 0,
      inputTokens: response.usage?.promptTokens || 0,
      outputTokens: response.usage?.completionTokens || 0,
      comparisonType,
      text1Length: text1.length,
      text2Length: text2.length
    });

    res.json({
      comparison: response.text,
      type: comparisonType,
      lengths: {
        text1: text1.length,
        text2: text2.length
      }
    });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Devuelve estadísticas de uso del API.
 * GET /api/gemini/usage
 */
export function getUsageStats(req, res) {
  const stats = getMetrics();
  res.json({
    ...stats,
    cacheInfo: {
      // Aquí podrías agregar estadísticas del caché
      message: 'Cache stats available in future versions'
    }
  });
}

/**
 * Crea/actualiza un índice de embeddings en memoria
 * POST /api/gemini/embeddings/index
 * body: { name: string, documents: Array<{text:string, meta?:any}>, model?: string }
 */
export async function upsertEmbeddingsIndex(req, res, next) {
  const requestMetrics = analyticsService.startRequest('embeddings_index', req.body.model || 'default');
  
  try {
    const { name, documents, model } = req.body;
    if (!name || !Array.isArray(documents)) {
      analyticsService.failRequest(requestMetrics, new Error('Missing index name or documents'));
      return res.status(400).json({ error: 'Nombre de índice y documentos son requeridos' });
    }
    
    const result = await embeddingsService.upsertIndex(name, documents, { model });
    
    analyticsService.endRequest(requestMetrics, {
      indexName: name,
      documentsCount: documents.length,
      model: model || 'default',
      operation: 'upsert'
    });
    
    res.json({ message: 'Índice actualizado', ...result });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Búsqueda semántica por similitud
 * POST /api/gemini/embeddings/search
 * body: { name: string, query: string, topK?: number, model?: string }
 */
export async function searchEmbeddings(req, res, next) {
  const requestMetrics = analyticsService.startRequest('embeddings_search', req.body.model || 'default');
  
  try {
    const { name, query, topK = 5, model } = req.body;
    if (!name || !query) {
      analyticsService.failRequest(requestMetrics, new Error('Missing index name or query'));
      return res.status(400).json({ error: 'Nombre de índice y query son requeridos' });
    }
    
    const results = await embeddingsService.search(name, query, topK, { model });
    
    analyticsService.endRequest(requestMetrics, {
      indexName: name,
      queryLength: query.length,
      topK,
      resultsCount: results.length,
      model: model || 'default',
      operation: 'search'
    });
    
    res.json({ results });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Limpia un índice de embeddings
 * DELETE /api/gemini/embeddings/index/:name
 */
export function clearEmbeddingsIndex(req, res, next) {
  const requestMetrics = analyticsService.startRequest('embeddings_clear', 'system');
  
  try {
    const { name } = req.params;
    if (!name) {
      analyticsService.failRequest(requestMetrics, new Error('Missing index name'));
      return res.status(400).json({ error: 'Nombre requerido' });
    }
    
    const result = embeddingsService.clearIndex(name);
    
    analyticsService.endRequest(requestMetrics, {
      indexName: name,
      operation: 'clear'
    });
    
    res.json({ message: 'Índice limpiado', ...result });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    next(error);
  }
}

/**
 * Stats del Context Cache
 * GET /api/gemini/context-cache/stats
 */
export function getContextCacheStats(req, res) {
  const requestMetrics = analyticsService.startRequest('context_cache_stats', 'system');
  
  try {
    const stats = contextCacheService.getStats();
    
    analyticsService.endRequest(requestMetrics, {
      operation: 'get_cache_stats',
      cacheSize: stats.size || 0
    });
    
    res.json({ stats });
  } catch (error) {
    analyticsService.failRequest(requestMetrics, error);
    res.status(500).json({ error: 'Error al obtener estadísticas del cache' });
  }
}

// === NUEVOS ENDPOINTS: BATCH PROCESSING ===

/**
 * Procesa múltiples requests de generación en batch
 * POST /api/gemini/batch/generate
 * body: { requests: Array<{prompt, model?, temperature?, maxTokens?}>, options?: {concurrency?, failFast?, timeout?} }
 */
export async function processBatchGeneration(req, res, next) {
  try {
    const { requests, options = {} } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de requests no vacío',
        example: {
          requests: [
            { prompt: "¿Qué es la IA?", model: "gemini-3.1-flash-lite" },
            { prompt: "Explica blockchain", temperature: 0.7 }
          ],
          options: { concurrency: 3, failFast: false }
        }
      });
    }
    
    const result = await batchService.processBatchGeneration(requests, options);
    
    res.json({
      message: 'Batch processing completado',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Procesa múltiples operaciones de embeddings en batch
 * POST /api/gemini/batch/embeddings
 * body: { operations: Array<{type, ...params}>, options?: {concurrency?} }
 */
export async function processBatchEmbeddings(req, res, next) {
  try {
    const { operations, options = {} } = req.body;
    
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de operaciones no vacío',
        example: {
          operations: [
            { type: "index", name: "docs", documents: [{text: "contenido"}] },
            { type: "search", name: "docs", query: "buscar esto", topK: 5 }
          ]
        }
      });
    }
    
    const result = await batchService.processBatchEmbeddings(operations, options);
    
    res.json({
      message: 'Batch embeddings completado',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Procesa análisis de múltiples textos en batch
 * POST /api/gemini/batch/analyze
 * body: { texts: Array<string>, analysisType?: string, options?: {} }
 */
export async function processBatchAnalysis(req, res, next) {
  try {
    const { texts, analysisType = 'general', options = {} } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de textos no vacío',
        supportedTypes: ['general', 'sentiment', 'summary', 'keywords']
      });
    }
    
    const result = await batchService.processBatchAnalysis(texts, analysisType, options);
    
    res.json({
      message: 'Batch analysis completado',
      ...result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene el estado de un batch job
 * GET /api/gemini/batch/status/:batchId
 */
export function getBatchStatus(req, res) {
  const { batchId } = req.params;
  const status = batchService.getBatchStatus(batchId);
  
  if (status.error) {
    return res.status(404).json(status);
  }
  
  res.json(status);
}

/**
 * Lista todos los batch jobs activos
 * GET /api/gemini/batch/active
 */
export function getActiveBatches(req, res) {
  const batches = batchService.getActiveBatches();
  res.json({ batches });
}

/**
 * Cancela un batch job
 * DELETE /api/gemini/batch/:batchId
 */
export function cancelBatch(req, res) {
  const { batchId } = req.params;
  const result = batchService.cancelBatch(batchId);
  
  if (result.error) {
    return res.status(400).json(result);
  }
  
  res.json(result);
}

/**
 * Obtiene estadísticas de batch processing
 * GET /api/gemini/batch/stats
 */
export function getBatchStats(req, res) {
  const stats = batchService.getBatchStats();
  res.json({ stats });
}

// === NUEVOS ENDPOINTS: ANALYTICS AVANZADAS ===

/**
 * Obtiene métricas completas del sistema
 * GET /api/gemini/analytics/metrics
 */
export function getAdvancedMetrics(req, res) {
  const metrics = analyticsService.getMetrics();
  res.json({ metrics });
}

/**
 * Obtiene métricas en tiempo real
 * GET /api/gemini/analytics/realtime
 */
export function getRealTimeMetrics(req, res) {
  const realTimeMetrics = analyticsService.getRealTimeMetrics();
  res.json({ realTime: realTimeMetrics });
}

/**
 * Obtiene insights y recomendaciones del sistema
 * GET /api/gemini/analytics/insights
 */
export function getSystemInsights(req, res) {
  const insights = analyticsService.getInsights();
  res.json({ insights });
}

/**
 * Exporta métricas a archivo
 * POST /api/gemini/analytics/export
 * body: { format?: 'json' | 'csv' }
 */
export async function exportMetrics(req, res, next) {
  try {
    const { format = 'json' } = req.body;
    
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ 
        error: 'Formato no soportado',
        supportedFormats: ['json', 'csv']
      });
    }
    
    const result = await analyticsService.exportMetrics(format);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Error al exportar métricas',
        details: result.error
      });
    }
    
    res.json({
      message: 'Métricas exportadas exitosamente',
      filename: result.filename,
      filepath: result.filepath
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resetea todas las métricas del sistema
 * POST /api/gemini/analytics/reset
 */
export function resetMetrics(req, res) {
  analyticsService.resetMetrics();
  res.json({ 
    message: 'Métricas reseteadas exitosamente',
    timestamp: new Date().toISOString()
  });
}

/**
 * Endpoint para suscribirse a métricas en tiempo real (WebSocket simulation)
 * GET /api/gemini/analytics/stream
 */
export function streamMetrics(req, res) {
  // Configurar headers para Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Enviar métricas iniciales
  const initialMetrics = analyticsService.getRealTimeMetrics();
  res.write(`data: ${JSON.stringify(initialMetrics)}\n\n`);
  
  // Suscribirse a actualizaciones
  const unsubscribe = analyticsService.subscribe((event, data) => {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString()
    };
    
    if (!res.destroyed) {
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  });
  
  // Enviar heartbeat cada 30 segundos
  const heartbeat = setInterval(() => {
    if (!res.destroyed) {
      const metrics = analyticsService.getRealTimeMetrics();
      res.write(`data: ${JSON.stringify({ event: 'heartbeat', data: metrics })}\n\n`);
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
  
  // Cleanup al cerrar conexión
  req.on('close', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
  
  req.on('aborted', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
}

/**
 * Extrae contenido de una URL
 * POST /api/gemini/extract-url
 * body: { url: string, includeInContext?: boolean }
 */
export async function extractUrlContent(req, res, next) {
  try {
    const { url, includeInContext = false } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'Se requiere una URL válida',
        example: { url: 'https://example.com' }
      });
    }

    console.log(`Intentando extraer contenido de: ${url}`);

    // Extraer contenido de la URL
    const extractionResult = await webScraperService.extractContent(url);
    
    // Check if extraction was successful
    if (!extractionResult.success) {
      throw new Error(extractionResult.error || 'Error extrayendo contenido');
    }

    const extractedContent = extractionResult;
    
    // Si se solicita, agregar al contexto usando embeddings
    if (includeInContext) {
      try {
        await embeddingsService.upsertIndex('url_context', [{
          content: extractedContent.content,
          metadata: {
            ...extractedContent.metadata,
            type: 'url_content',
            title: extractedContent.title,
            url: extractedContent.url,
            addedAt: new Date().toISOString()
          }
        }]);
        console.log(`Contenido de ${url} agregado al contexto`);
      } catch (contextError) {
        console.warn('Error agregando contenido al contexto:', contextError);
      }
    }

    // Formatear respuesta (create a simple format since formatForChat doesn't exist in WebScraperService)
    const formattedContent = `📄 **Contenido de URL**\n🔗 **Fuente:** [${extractedContent.metadata?.domain || 'Sitio web'}](${url})\n\n## ${extractedContent.title}\n\n📖 **Contenido:**\n\n${extractedContent.content}`;

    const response = {
      success: true,
      data: extractedContent,
      formatted: formattedContent,
      addedToContext: includeInContext
    };

    console.log(`Extracción exitosa de ${url}: ${extractedContent.title}`);
    res.json(response);
  } catch (error) {
    console.error('Error extracting URL content:', error);
    
    // Proporcionar error más detallado
    const errorResponse = {
      success: false,
      error: error.message,
      url: req.body.url,
      details: {
        type: error.name || 'ExtractionError',
        timestamp: new Date().toISOString()
      }
    };
    
    // Diferentes códigos de estado según el tipo de error
    if (error.message.includes('URL no válida') || error.message.includes('no permitida')) {
      // Proporcionar mensaje más específico para URLs de OAuth
      if (error.message.includes('OAuth') || error.message.includes('oauth')) {
        errorResponse.error = 'Esta URL contiene patrones de autenticación OAuth que pueden causar redirecciones infinitas y no se puede procesar.';
        errorResponse.suggestion = 'Intenta usar la URL de documentación directa sin parámetros de autenticación.';
      }
      return res.status(400).json(errorResponse);
    } else if (error.message.includes('Error HTTP: 404') || error.message.includes('no existe')) {
      return res.status(404).json(errorResponse);
    } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return res.status(408).json(errorResponse);
    } else if (error.message.includes('maximum redirect')) {
      errorResponse.error = 'La URL causó demasiadas redirecciones. Esto puede ocurrir con URLs de autenticación o páginas que requieren login.';
      errorResponse.suggestion = 'Verifica que la URL sea accesible públicamente sin requerir autenticación.';
      return res.status(400).json(errorResponse);
    } else {
      return res.status(500).json(errorResponse);
    }
  }
}

/**
 * Extrae contenido de múltiples URLs
 * POST /api/gemini/extract-multiple-urls
 * body: { urls: string[], options?: { concurrency?: number, continueOnError?: boolean, includeInContext?: boolean } }
 */
export async function extractMultipleUrls(req, res, next) {
  try {
    const { urls, options = {} } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de URLs no vacío',
        example: { urls: ['https://example1.com', 'https://example2.com'] }
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({ 
        error: 'Máximo 10 URLs permitidas por request para evitar sobrecarga',
      });
    }

    const { includeInContext = false, ...extractOptions } = options;
    
    // Extraer contenido de múltiples URLs usando WebScraperService
    const extractionPromises = urls.map(async (url) => {
      try {
        const extractedContent = await webScraperService.extractContent(url);
        if (extractedContent.success) {
          return {
            url,
            success: true,
            content: extractedContent.content,
            title: extractedContent.title || 'Sin título',
            metadata: {
              url,
              title: extractedContent.title || 'Sin título',
              extractedAt: new Date().toISOString()
            }
          };
        } else {
          return {
            url,
            success: false,
            error: extractedContent.error || 'Error desconocido'
          };
        }
      } catch (error) {
        return {
          url,
          success: false,
          error: error.message || 'Error al extraer contenido'
        };
      }
    });

    const extractionResults = await Promise.allSettled(extractionPromises);
    
    const results = [];
    const errors = [];
    
    extractionResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.push(result.value);
        } else {
          errors.push({
            url: urls[index],
            error: result.value.error
          });
        }
      } else {
        errors.push({
          url: urls[index],
          error: result.reason?.message || 'Error en la promesa'
        });
      }
    });
    
    // Si se solicita, agregar contenido exitoso al contexto
    if (includeInContext && results.length > 0) {
      try {
        const documentsForContext = results.map(content => ({
          content: content.content,
          metadata: {
            ...content.metadata,
            type: 'url_content',
            title: content.title,
            url: content.url,
            addedAt: new Date().toISOString()
          }
        }));

        await embeddingsService.upsertIndex('url_context', documentsForContext);
        console.log(`${results.length} URLs agregadas al contexto`);
      } catch (contextError) {
        console.warn('Error agregando URLs al contexto:', contextError);
      }
    }

    // Formatear respuestas
    const formattedResults = results.map(content => ({
      ...content,
      formatted: `**${content.title}**\n\nURL: ${content.url}\n\n${content.content}`
    }));

    const response = {
      success: true,
      results: formattedResults,
      errors: errors,
      summary: {
        total: urls.length,
        successful: results.length,
        failed: errors.length
      },
      addedToContext: includeInContext
    };

    res.json(response);
  } catch (error) {
    console.error('Error extracting multiple URLs:', error);
    next(error);
  }
}

/**
 * Valida una URL antes de intentar extraer contenido
 * POST /api/gemini/validate-url
 * body: { url: string }
 */
export async function validateUrl(req, res, next) {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        valid: false,
        error: 'Se requiere una URL válida',
        example: { url: 'https://example.com' }
      });
    }

    console.log(`Validando URL: ${url}`);
    
    // Limpiar la URL
    const cleanedUrl = webScraperService.cleanUrl(url);
    console.log(`URL limpia: ${cleanedUrl}`);
    
    // Validar formato
    const isValidFormat = webScraperService.isValidUrl(cleanedUrl);
    
    if (!isValidFormat) {
      return res.json({
        valid: false,
        originalUrl: url,
        cleanedUrl,
        error: 'URL no válida o no permitida (debe ser HTTP/HTTPS y no local)',
        issues: ['Formato inválido o URL local/privada']
      });
    }
    
    // Verificar si la URL está truncada
    const issues = [];
    if (url.includes('…') || url.includes('...')) {
      issues.push('URL parece estar truncada');
    }
    
    if (url !== cleanedUrl) {
      issues.push('URL fue modificada durante la limpieza');
    }
    
    // Intentar hacer una petición HEAD para verificar accesibilidad
    let accessible = false;
    let httpStatus = null;
    let contentType = null;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const response = await fetch(cleanedUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      accessible = response.ok;
      httpStatus = response.status;
      contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        issues.push(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      
      if (contentType && !contentType.includes('text/html')) {
        issues.push(`Contenido no es HTML: ${contentType}`);
      }
      
    } catch (fetchError) {
      issues.push(`No se pudo acceder: ${fetchError.message}`);
    }
    
    const validation = {
      valid: isValidFormat && accessible && issues.length === 0,
      originalUrl: url,
      cleanedUrl,
      accessible,
      httpStatus,
      contentType,
      issues: issues.length > 0 ? issues : null,
      recommendations: []
    };
    
    // Agregar recomendaciones
    if (url.includes('…') || url.includes('...')) {
      validation.recommendations.push('Intenta copiar la URL completa sin truncar');
    }
    
    if (!accessible && httpStatus === 404) {
      validation.recommendations.push('Verifica que la URL sea correcta y que la página exista');
    }
    
    if (contentType && !contentType.includes('text/html')) {
      validation.recommendations.push('Esta URL no apunta a una página web HTML');
    }
    
    console.log(`Validación completada para ${url}:`, validation);
    res.json(validation);
    
  } catch (error) {
    console.error('Error validating URL:', error);
    res.status(500).json({
      valid: false,
      error: 'Error interno validando la URL',
      details: error.message
    });
  }
}

/**
 * Procesa URL Context usando Gemini
 * POST /api/gemini/url-context
 * body: { url: string, query?: string, options?: object }
 */
export async function processUrlContext(req, res, next) {
  try {
    const { url, query, options = {} } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        error: 'Se requiere una URL válida',
        example: { url: 'https://example.com', query: 'Resumen del contenido' }
      });
    }

    console.log(`Procesando URL Context para: ${url}`);

    // Procesar URL Context usando el servicio
    const result = await urlContextService.processUrlContext(url, query, options);
    
    res.json({
      success: true,
      url,
      query,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing URL context:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      url: req.body.url,
      timestamp: new Date().toISOString()
    });
  }
}



/**
 * Procesa solicitud de Gemini con herramientas habilitadas (URL Context y Google Search)
 * POST /api/gemini/chat-with-tools
 * body: { messages: array, options?: object }
 */
export async function processChatWithTools(req, res, next) {
  try {
    const { messages, options = {} } = req.body;
    
    console.log('🔧 [CONTROLLER] Procesando chat con herramientas habilitadas');
    console.log('🔧 [CONTROLLER] Mensajes recibidos:', messages?.length || 0);
    console.log('🔧 [CONTROLLER] Opciones recibidas:', JSON.stringify(options, null, 2));
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de mensajes no vacío',
        example: { messages: [{ role: 'user', content: 'Busca información sobre React' }] }
      });
    }

    // Formatear mensajes para Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
    }));

    console.log('🔧 [CONTROLLER] Mensajes formateados:', JSON.stringify(formattedMessages, null, 2));

    // Configurar herramientas habilitadas
    const enabledTools = options.enabledTools || [];
    const model = options.model || 'gemini-3.1-flash-lite';

    console.log('🔧 [CONTROLLER] Herramientas habilitadas:', enabledTools);
    console.log('🔧 [CONTROLLER] Modelo a usar:', model);

    // Procesar usando Gemini con herramientas
    const result = await processGeminiRequestWithTools(formattedMessages, model, options, enabledTools);
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing chat with tools:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Stream de chat con herramientas habilitadas
 * POST /api/gemini/stream-with-tools
 * body: { messages: array, options?: object }
 */
export async function streamChatWithTools(req, res, next) {
  try {
    console.log('🔧 [CONTROLLER] Iniciando streamChatWithTools');
    console.log('🔧 [CONTROLLER] Método:', req.method);
    
    // Validar método
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Validar API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('🔧 [CONTROLLER] GEMINI_API_KEY no configurada');
      return res.status(500).json({ error: 'API key no configurada' });
    }
    
    console.log('🔧 [CONTROLLER] API Key disponible:', apiKey ? 'Sí' : 'No');
    console.log('🔧 [CONTROLLER] API Key length:', apiKey?.length || 0);
    
    // Parsear body
    const { messages, enabledTools = [] } = req.body || {};
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    console.log('🔧 [CONTROLLER] Messages recibidos:', messages.length);
    console.log('🔧 [CONTROLLER] Enabled tools:', enabledTools.length);
    
    // Configurar headers para streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Usar el servicio de Gemini existente en lugar de importación directa
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content || 'Hola';
    
    console.log('🔧 [CONTROLLER] Prompt:', prompt);
    
    // Formatear mensajes para Gemini
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
    }));
    
    console.log('🔧 [CONTROLLER] Mensajes formateados:', formattedMessages.length);
    
    // Detectar URLs en el mensaje para habilitar herramientas automáticamente
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = prompt.match(urlRegex);
    
    // Configurar herramientas habilitadas automáticamente
    let finalEnabledTools = [...enabledTools];
    if (urls && urls.length > 0 && !finalEnabledTools.includes('urlContext')) {
      finalEnabledTools.push('urlContext');
      console.log('🔧 [CONTROLLER] URL detectada, habilitando herramienta urlContext automáticamente');
    }
    
    console.log('🔧 [CONTROLLER] Herramientas finales habilitadas:', finalEnabledTools);
    
    try {
      // Usar el servicio de streaming con herramientas
      const geminiStream = await processGeminiStreamRequestWithTools(
        formattedMessages, 
        'gemini-3.1-flash-lite', 
        { temperature: 0.7, maxOutputTokens: 2048 }, 
        finalEnabledTools
      );
      
      console.log('🔧 [CONTROLLER] Stream de Gemini iniciado');
      
      // Verificar si es un ReadableStream (simulado) o un stream de Gemini
      if (geminiStream && typeof geminiStream.getReader === 'function') {
        // Es un ReadableStream simulado
        console.log('🔧 [CONTROLLER] Procesando ReadableStream simulado');
        const reader = geminiStream.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            if (res.destroyed || res.writableEnded) {
              console.log('🔧 [CONTROLLER] Conexión cerrada por el cliente');
              await reader.cancel();
              break;
            }
            
            const text = decoder.decode(value, { stream: true });
            if (text) {
              res.write(text);
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // Es un stream de Gemini normal
        console.log('🔧 [CONTROLLER] Procesando stream de Gemini');
        for await (const chunk of geminiStream) {
          if (res.destroyed || res.writableEnded) {
            console.log('🔧 [CONTROLLER] Conexión cerrada por el cliente');
            break;
          }
          
          const text = chunk.text || chunk || '';
          if (text) {
            res.write(text);
          }
        }
      }
      
      res.end();
      console.log('🔧 [CONTROLLER] Stream completado exitosamente');
      
    } catch (streamError) {
      console.error('🔧 [CONTROLLER] Error en streaming:', streamError);
      
      if (!res.headersSent) {
        res.status(500);
      }
      
      const errorText = `Lo siento, ocurrió un error al procesar tu solicitud: ${streamError.message}`;
      res.write(errorText);
      res.end();
    }
    
    console.log('🔧 [CONTROLLER] Respuesta enviada exitosamente');
    
  } catch (error) {
    console.error('🔧 [CONTROLLER] Error en streamChatWithTools:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message, 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
  
