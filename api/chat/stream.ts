import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

import { withSecurity } from '../_middlewares/serverless-security.js';
import WebScraperService from '../_services/web-scraper.js';
import type { 
  ChatMessage, 
  KnowledgeBaseContext 
} from '../types/index.js';

// Lazy imports for blockchain services
let blockchainService: typeof import('../_services/blockchain-service.js') | null = null;
let blockchainTools: typeof import('../_services/blockchain-tools.js') | null = null;

// Import type for function names
type BlockchainFunctionName = 'get_pol_price' | 'get_staking_info' | 'get_nft_listings' | 'check_wallet_balance' | 'get_user_staking_position' | 'estimate_staking_reward';

// ============================================================================
// TIPOS
// ============================================================================
interface RequestMetrics {
  total: number;
  success: number;
  errors: number;
  avgResponseTime: number;
  totalTokensUsed: number;       // NEW: Track token usage
  totalTokensSaved: number;      // NEW: Track tokens saved by caching
  estimatedCostSavings: number;  // NEW: Track cost savings
}

interface ClassificationResult {
  needsKB: boolean;
  score: number;
  reason?: string;
}

interface StreamConfig {
  enableSemanticChunking?: boolean;
  enableContextualPauses?: boolean;
  enableVariableSpeed?: boolean;
  clientInfo?: {
    ip: string;
    userAgent?: string;
  };
}

// Interface for blockchain function calls
interface FunctionCallResult {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

/**
 * Detecta URLs en el mensaje del usuario
 */
function detectUrls(text: string): string[] {
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
 * Detecta si el mensaje requiere llamadas a funciones blockchain
 */
function detectBlockchainQuery(message: string): { isBlockchain: boolean; functions: string[] } {
  const text = message.toLowerCase();
  const functions: string[] = [];
  
  // Detectar queries de precio POL - MEJORADO: más keywords
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

    // Si el usuario pide optimizar o pide datos propios (mis depósitos/rewards), traer posición on-chain
    const isUserIntent = /\b(mi|mis|m[ií]o|m[ií]a|revisa|tengo|cu[aá]nto tengo|mi wallet|mi cartera)\b/i.test(text);
    const isOptimizationIntent = /(optimizar|mejorar|recomend|consej|estrateg|maximiz|aumentar)\b/i.test(text);
    const mentionsRewardsOrDeposits = /(reward|recompens|ganancia|pendiente|acumulad|deposit|dep[oó]sit|bloquead|locked|unlock|retirable|withdraw)\b/i.test(text);
    if (isUserIntent || isOptimizationIntent || mentionsRewardsOrDeposits) {
      functions.push('get_user_staking_position');
    }
  }
  
  // Detectar queries de NFT listings
  if ((text.includes('nft') || text.includes('marketplace')) && 
      (text.includes('lista') || text.includes('venta') || text.includes('disponible') || text.includes('comprar'))) {
    functions.push('get_nft_listings');
  }
  
  // Detectar queries de wallet/balance - MEJORADO: detectar "mi balance", "my wallet", etc
  if ((text.includes('wallet') || text.includes('balance') || text.includes('saldo') || text.includes('cartera')) &&
      (text.includes('0x') || text.includes('direccion') || text.includes('address') || 
       text.includes('mi ') || text.includes('my ') || text.includes('tengo') || text.includes('revisa'))) {
    functions.push('check_wallet_balance');
  }
  
  // Detectar queries de reward estimation
  if ((text.includes('reward') || text.includes('recompensa') || text.includes('ganancia') || text.includes('ganar')) &&
      (text.includes('staking') || text.includes('stake') || text.includes('pol') || text.includes('matic'))) {
    functions.push('estimate_staking_reward');
  }
  
  // Log para debug
  if (functions.length > 0) {
    console.log(`🔗 Blockchain detection: "${text.substring(0, 50)}..." → [${functions.join(', ')}]`);
  }
  
  return {
    isBlockchain: functions.length > 0,
    functions
  };
}

// Tipo para el body que puede venir en diferentes formatos
type ChatRequestBody = 
  | { messages: ChatMessage[]; message?: never; walletAddress?: string }
  | { message: string; messages?: never; walletAddress?: string }
  | ChatMessage[]
  | string;

// ============================================================================
// MÉTRICAS Y VALIDACIÓN
// ============================================================================
const metrics: RequestMetrics = {
  total: 0,
  success: 0,
  errors: 0,
  avgResponseTime: 0,
  totalTokensUsed: 0,
  totalTokensSaved: 0,
  estimatedCostSavings: 0
};

/**
 * Valida la estructura y contenido del mensaje
 */
function validateRequest(body: unknown): string[] {
  const errors: string[] = [];
  
  if (!body) {
    errors.push('Invalid request body');
    return errors;
  }
  
  let messageContent = '';
  
  if (typeof body === 'string') {
    messageContent = body;
  } else if (typeof body === 'object') {
    const typedBody = body as ChatRequestBody;
    messageContent = extractMessage(typedBody);
  }
  
  if (!messageContent || typeof messageContent !== 'string') {
    errors.push('Message content is required');
  }
  
  if (messageContent.length > 10000) {
    errors.push('Message exceeds maximum length (10000 chars)');
  }
  
  return errors;
}

/**
 * Extrae el mensaje del request body que puede venir en diferentes formatos
 */
function extractMessage(body: ChatRequestBody): string {
  if (typeof body === 'string') {
    return body;
  }
  
  if (Array.isArray(body)) {
    const lastMessage = body[body.length - 1];
    return (lastMessage as ChatMessage)?.content || '';
  }
  
  if ('messages' in body && Array.isArray(body.messages)) {
    const lastMessage = body.messages[body.messages.length - 1];
    return lastMessage?.parts?.[0]?.text || lastMessage?.content || '';
  }
  
  if ('message' in body && typeof body.message === 'string') {
    return body.message;
  }
  
  return '';
}

/**
 * Obtiene la IP del cliente desde los headers
 */
function getClientIp(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(',')[0]?.trim() || 'unknown';
  }
  
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  
  return 'unknown';
}

// ============================================================================
// HANDLER PRINCIPAL (SIN SEGURIDAD MANUAL)
// ============================================================================
async function streamHandler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const startTime = Date.now();
  metrics.total++;
  
  // Solo POST permitido
  if (req.method !== 'POST') {
    metrics.errors++;
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const headers = req.headers || {};
    const clientIp = getClientIp(req);
    
    console.log(`🚀 Chat stream request from ${clientIp}`);
    
    // Validación de mensaje
    const validationErrors = validateRequest(req.body);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      metrics.errors++;
      res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
      return;
    }
    
    // API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not configured');
      console.error('💡 Expected GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY in environment');
      metrics.errors++;
      res.status(500).json({ error: 'API key not configured' });
      return;
    }
    
    // Extraer mensaje
    const messageContent = extractMessage(req.body as ChatRequestBody);
    
    console.log(`📝 Message: ${messageContent.substring(0, 50)}...`);
    
    // Lazy import de servicios para evitar FUNCTION_INVOCATION_FAILED
    console.log('📦 Loading services...');
    let needsKnowledgeBase, updateConversationContext, getRelevantContext;
    let buildSystemInstructionWithContext, formatResponseForMarkdown, semanticStreamingService;
    let tokenCountingService, detectLanguage;
    
    try {
      const modules = await Promise.all([
        import('../_services/query-classifier.js').catch(e => { console.error('Error loading query-classifier:', e.message); throw e; }),
        import('../_services/embeddings-service.js').catch(e => { console.error('Error loading embeddings-service:', e.message); throw e; }),
        import('../_config/system-instruction.js').catch(e => { console.error('Error loading system-instruction:', e.message); throw e; }),
        import('../_services/markdown-formatter.js').catch(e => { console.error('Error loading markdown-formatter:', e.message); throw e; }),
        import('../_services/semantic-streaming-service.js').catch(e => { console.error('Error loading semantic-streaming:', e.message); throw e; }),
        import('../_services/token-counting-service.js').catch(e => { console.error('Error loading token-counting:', e.message); throw e; }),
        import('../_services/language-detector.js').catch(e => { console.error('Error loading language-detector:', e.message); throw e; })
      ]);
      
      needsKnowledgeBase = modules[0].needsKnowledgeBase;
      updateConversationContext = modules[0].updateConversationContext;
      getRelevantContext = modules[1].getRelevantContext;
      buildSystemInstructionWithContext = modules[2].buildSystemInstructionWithContext;
      formatResponseForMarkdown = modules[3].formatResponseForMarkdown;
      semanticStreamingService = modules[4].default;
      tokenCountingService = modules[5].default;
      detectLanguage = modules[6].detectLanguage;
      
      console.log('✅ All services loaded successfully');
    } catch (importError) {
      console.error('❌ Failed to load services:', importError);
      metrics.errors++;
      res.status(500).json({ 
        error: 'Failed to initialize services',
        message: importError instanceof Error ? importError.message : 'Unknown import error'
      });
      return;
    }
    
    // Detectar idioma del mensaje
    const languageDetection = detectLanguage(messageContent);
    console.log(`🌐 Language detected: ${languageDetection.language} (confidence: ${(languageDetection.confidence * 100).toFixed(0)}%)`);
    
    // Determinar si la query necesita buscar en la base de conocimientos (CON DEBUG LOGS)
    const classificationResult = needsKnowledgeBase(messageContent, { 
      includeContext: true, 
      debugMode: true 
    }) as ClassificationResult;
    
    let relevantContext: KnowledgeBaseContext = { context: '', score: 0 };
    
    if (classificationResult.needsKB) {
      console.log(`✅ KB Classification approved | Score: ${classificationResult.score.toFixed(2)}`);
      
      // Obtener contexto relevante de la base de conocimientos
      console.log('🔍 Searching knowledge base...');
      const rawContext = await getRelevantContext(messageContent, { 
        threshold: 0.15,
      });
      
      // Normalizar contexto
      if (typeof rawContext === 'string') {
        relevantContext = { context: rawContext, score: 0 };
      } else if (rawContext && typeof rawContext === 'object') {
        const typedContext = rawContext as KnowledgeBaseContext;
        const ctx = typedContext.context || '';
        const score = Number(typedContext.score) || 0;
        relevantContext = { context: ctx, score };
      }
      
      // Actualizar contexto de conversación
      updateConversationContext(true, ['nuxchain', 'platform']);
    } else {
      console.log(`⏭️ Skipping KB - Reason: ${classificationResult.reason || 'unknown'}`);
    }
    
    // Truncar contexto para evitar límites de tokens
    // 🆕 Use Token Counting Service for smart truncation
    const MAX_CONTEXT_TOKENS = 4000;
    if (relevantContext.context && relevantContext.context.length > 0) {
      try {
        const optimizedContext = await tokenCountingService.optimizeContextLength(
          relevantContext.context,
          MAX_CONTEXT_TOKENS,
          'gemini-2.5-flash-lite'
        );
        
        if (optimizedContext.wasTruncated) {
          console.log(`✂️ Context optimized: ${optimizedContext.originalTokens} → ${optimizedContext.tokenCount} tokens (${optimizedContext.reduction})`);
          relevantContext = {
            ...relevantContext,
            context: optimizedContext.optimizedContext
          };
        }
      } catch {
        // Fallback to simple character truncation
        console.warn('⚠️ Token optimization failed, using character limit');
        const MAX_CONTEXT_LENGTH = 8000;
        if (relevantContext.context.length > MAX_CONTEXT_LENGTH) {
          relevantContext = {
            ...relevantContext,
            context: relevantContext.context.substring(0, MAX_CONTEXT_LENGTH) + '...'
          };
          console.log(`⚠️ Context truncated to ${MAX_CONTEXT_LENGTH} chars (fallback)`);
        }
      }
    }
    
    if (relevantContext.context) {
      console.log(`✅ KB found: ${relevantContext.context.length} chars, score: ${relevantContext.score.toFixed(3)}`);
    } else {
      console.log('⚠️ No KB context found');
    }
    
    // Construir system instruction con contexto Y detección de idioma
    const systemInstruction = buildSystemInstructionWithContext(
      relevantContext.context || '',
      relevantContext.score || 0,
      languageDetection
    );
    
    // Inicializar Gemini
    const client = new GoogleGenAI({ apiKey });
    
    // 🔗 URL CONTEXT: Detectar URLs en el mensaje
    const detectedUrls = detectUrls(messageContent);
    const hasUrls = detectedUrls.length > 0;
    
    if (hasUrls) {
      console.log(`🔗 URLs detected in message: ${detectedUrls.length}`);
      console.log(`🔗 URLs: ${detectedUrls.join(', ')}`);
    }
    
    // 🔗 BLOCKCHAIN FUNCTION CALLING: Detectar y ejecutar funciones blockchain
    const blockchainDetection = detectBlockchainQuery(messageContent);
    let blockchainContext = '';
    
    if (blockchainDetection.isBlockchain) {
      console.log(`🔗 Blockchain query detected. Functions: ${blockchainDetection.functions.join(', ')}`);
      
      try {
        // Lazy load blockchain services
        if (!blockchainService) {
          blockchainService = await import('../_services/blockchain-service.js');
        }
        if (!blockchainTools) {
          blockchainTools = await import('../_services/blockchain-tools.js');
        }
        
        const functionResults: FunctionCallResult[] = [];
        
        // Get connected wallet address from request body
        const requestBody = req.body as { walletAddress?: string };
        const connectedWallet = requestBody.walletAddress;
        
        // Ejecutar funciones blockchain detectadas
        for (const funcName of blockchainDetection.functions) {
          try {
            // Extraer argumentos básicos del mensaje si es necesario
            let args: Record<string, unknown> = {};
            
            // Para check_wallet_balance, usar wallet conectada o extraer del mensaje
            if (funcName === 'check_wallet_balance') {
              const addressMatch = messageContent.match(/0x[a-fA-F0-9]{40}/);
              if (addressMatch) {
                // Si el usuario especifica una dirección explícita, usarla
                args = { address: addressMatch[0] };
              } else if (connectedWallet) {
                // Si no, usar la wallet conectada del usuario
                args = { address: connectedWallet };
                console.log(`🔗 Using connected wallet: ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
              } else {
                console.log(`⚠️ Skipping ${funcName}: No wallet address found`);
                continue;
              }
            }

            // Para get_user_staking_position, igual que wallet: dirección explícita o wallet conectada
            if (funcName === 'get_user_staking_position') {
              const addressMatch = messageContent.match(/0x[a-fA-F0-9]{40}/);
              if (addressMatch) {
                args = { address: addressMatch[0] };
              } else if (connectedWallet) {
                args = { address: connectedWallet };
                console.log(`🔗 Using connected wallet for staking: ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
              } else {
                console.log(`⚠️ Skipping ${funcName}: No wallet address found`);
                continue;
              }
            }
            
            // Para estimate_staking_reward, intentar extraer cantidad
            if (funcName === 'estimate_staking_reward') {
              const amountMatch = messageContent.match(/(\d+(?:\.\d+)?)\s*(?:pol|matic)/i);
              if (amountMatch) {
                args = { amount: parseFloat(amountMatch[1]) };
              } else {
                args = { amount: 100 }; // Default amount for estimation
              }
            }
            
            console.log(`🔗 Executing ${funcName} with args:`, args);
            const result = await blockchainService.executeBlockchainFunction(funcName as BlockchainFunctionName, args);
            
            functionResults.push({
              name: funcName,
              args,
              result
            });
            
            console.log(`✅ ${funcName} completed successfully`);
          } catch (funcError) {
            console.error(`❌ Error executing ${funcName}:`, funcError);
          }
        }
        
        // Construir contexto blockchain para incluir en el prompt
        if (functionResults.length > 0) {
          blockchainContext = `\n\n**DATOS BLOCKCHAIN EN TIEMPO REAL:**\n${functionResults.map(fr => {
            const data = fr.result as { 
              success: boolean; 
              price?: number;
              change24h?: number;
              volume24h?: number;
              totalStaked?: string;
              totalStakedUSD?: number;
              apy?: number;
              totalParticipants?: number;
              totalRewardsPaid?: string;
              totalListings?: number;
              activeListings?: unknown[];
              floorPrice?: string;
              note?: string;
              address?: string;
              balancePOL?: string;
              balanceUSD?: number;
              stakedAmount?: string;
              pendingRewards?: string;
              amount?: string;
              duration?: string;
              estimatedReward?: string;
              estimatedRewardUSD?: number;
              lockBonus?: number;
              totalDepositedPOL?: string;
              depositCount?: number;
              pendingRewardsPOL?: string;
              hasAutoCompound?: boolean;
              nextUnlockTime?: string | null;
              apyRates?: { flexible: number; locked30: number; locked90: number; locked180: number; locked365: number };
              depositSummary?: Record<string, { label?: string; count: number; withdrawableCount?: number; totalAmountPOL: number }>;
              recommendations?: string[];
              source?: string;
            };
            
            if (data.success) {
              if (fr.name === 'get_pol_price') {
                return `- Precio POL: $${data.price?.toFixed(4) || 'N/A'} USD ${data.change24h ? `(${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}% 24h)` : ''}${data.volume24h ? ` | Volumen: $${(data.volume24h/1e6).toFixed(2)}M` : ''}`;
              }
              if (fr.name === 'get_staking_info') {
                return `- Staking Pool: ${data.totalStaked || 'N/A'} (~$${data.totalStakedUSD?.toLocaleString() || 'N/A'} USD)\n  APY: ${data.apy || 'N/A'}% | Participantes: ${data.totalParticipants || 'N/A'} | Recompensas: ${data.totalRewardsPaid || 'N/A'}`;
              }
              if (fr.name === 'get_nft_listings') {
                const count = Array.isArray(data.activeListings) ? data.activeListings.length : (data.activeListings || 0);
                return `- NFT Marketplace: ${count} listados activos de ${data.totalListings || 0} total${data.floorPrice ? ` | Floor: ${data.floorPrice}` : ''}${data.note ? `\n  Info: ${data.note}` : ''}`;
              }
              if (fr.name === 'check_wallet_balance') {
                return `- Wallet ${data.address?.slice(0,6)}...${data.address?.slice(-4)}:\n  Balance: ${data.balancePOL || 'N/A'} (~$${data.balanceUSD?.toFixed(2) || 'N/A'} USD)${data.stakedAmount ? ` | Staked: ${data.stakedAmount}` : ''}${data.pendingRewards ? ` | Rewards: ${data.pendingRewards}` : ''}`;
              }
              if (fr.name === 'get_user_staking_position') {
                // Build deposit summary with amounts and detect locked deposits
                let depositSummaryText = '';
                let hasLockedDeposits = false;
                
                type DepositInfo = { label?: string; count: number; withdrawableCount?: number; totalAmountPOL: number };
                
                if (data.depositSummary) {
                  const flexible = (data.depositSummary.flexible || {}) as DepositInfo;
                  const locked30 = (data.depositSummary.locked30 || {}) as DepositInfo;
                  const locked90 = (data.depositSummary.locked90 || {}) as DepositInfo;
                  const locked180 = (data.depositSummary.locked180 || {}) as DepositInfo;
                  const locked365 = (data.depositSummary.locked365 || {}) as DepositInfo;
                  
                  hasLockedDeposits = (locked30.count || 0) + (locked90.count || 0) + (locked180.count || 0) + (locked365.count || 0) > 0;
                  
                  const deposits = [];
                  if ((flexible.count || 0) > 0) {
                    deposits.push(`    🔓 Flexible: ${flexible.count} depósito${flexible.count > 1 ? 's' : ''} (${flexible.totalAmountPOL?.toFixed(2) || '0'} POL) - Retirable cuando quieras`);
                  }
                  if ((locked30.count || 0) > 0) {
                    deposits.push(`    🔒 Locked 30d: ${locked30.count} depósito${locked30.count > 1 ? 's' : ''} (${locked30.totalAmountPOL?.toFixed(2) || '0'} POL) - APY: ${data.apyRates?.locked30?.toFixed(2)}%`);
                  }
                  if ((locked90.count || 0) > 0) {
                    deposits.push(`    🔒 Locked 90d: ${locked90.count} depósito${locked90.count > 1 ? 's' : ''} (${locked90.totalAmountPOL?.toFixed(2) || '0'} POL) - APY: ${data.apyRates?.locked90?.toFixed(2)}%`);
                  }
                  if ((locked180.count || 0) > 0) {
                    deposits.push(`    🔒 Locked 180d: ${locked180.count} depósito${locked180.count > 1 ? 's' : ''} (${locked180.totalAmountPOL?.toFixed(2) || '0'} POL) - APY: ${data.apyRates?.locked180?.toFixed(2)}%`);
                  }
                  if ((locked365.count || 0) > 0) {
                    deposits.push(`    🔒 Locked 365d: ${locked365.count} depósito${locked365.count > 1 ? 's' : ''} (${locked365.totalAmountPOL?.toFixed(2) || '0'} POL) - APY: ${data.apyRates?.locked365?.toFixed(2)}%`);
                  }
                  
                  if (deposits.length > 0) {
                    depositSummaryText = `\n  Tus Depósitos:\n${deposits.join('\n')}`;
                  }
                }
                
                // Only show next unlock if there are locked deposits
                const unlockText = (hasLockedDeposits && data.nextUnlockTime) 
                  ? `\n  📅 Próximo desbloqueo: ${data.nextUnlockTime}` 
                  : '';
                
                const recs = Array.isArray(data.recommendations) && data.recommendations.length
                  ? `\n  💡 Recomendaciones:\n${data.recommendations.map((rec: string, idx: number) => `    ${idx + 1}. ${rec}`).join('\n')}`
                  : '';
                
                return `- Posición Staking:\n  Total depositado: ${data.totalDepositedPOL || 'N/A'}\n  Número de depósitos: ${data.depositCount ?? 'N/A'}\n  Rewards acumulados: ${data.pendingRewardsPOL || 'N/A'}\n  Auto-Compound: ${typeof data.hasAutoCompound === 'boolean' ? (data.hasAutoCompound ? '✅ Activado' : '❌ Desactivado') : 'N/A'}${unlockText}${depositSummaryText}${recs}`;
              }
              if (fr.name === 'estimate_staking_reward') {
                return `- Estimación Staking: ${data.amount} por ${data.duration}\n  Recompensa: ${data.estimatedReward || 'N/A'} (~$${data.estimatedRewardUSD?.toFixed(2) || 'N/A'} USD)\n  APY: ${data.apy || 'N/A'}%${data.lockBonus ? ` (+${data.lockBonus}% bonus lock)` : ''}`;
              }
              return `- ${fr.name}: ${JSON.stringify(data)}`;
            }
            return `- ${fr.name}: Error o sin datos`;
          }).join('\n')}\n`;
          
          console.log(`📊 Blockchain context added: ${blockchainContext.length} chars`);
        }
      } catch (blockchainError) {
        console.error('❌ Blockchain service error:', blockchainError);
        // Continue without blockchain context
      }
    }
    
    // Enriquecer mensaje con contexto blockchain si existe
    const isStakingAdviceQuery = /(optimizar|mejorar|recomend|consej|estrateg|maximiz|aumentar).*(staking|stake|rewards|recompens)/i.test(messageContent);
    const stakingAdvicePreamble = isStakingAdviceQuery
      ? 'INSTRUCCIONES: Usa los datos on-chain del usuario en el CONTEXTO BLOCKCHAIN. Da 3-5 recomendaciones accionables y concretas (qué hacer y por qué), y menciona si hay Auto-Compound, rewards pendientes y si conviene mover Flexible -> Locked segun APY y liquidez.\n\n'
      : '';

    // \ud83d\udd17 Build enriched message with all contexts
    let enrichedMessage = messageContent;
    let urlContext = '';
    
    // Extract URL content if URLs detected
    if (hasUrls) {
      console.log('\ud83d\udd17 Extracting content from URLs:', detectedUrls);
      const webScraper = new WebScraperService();
      
      try {
        const urlContents: string[] = [];
        for (const url of detectedUrls) {
          try {
            const result = await webScraper.extractContent(url, { maxContentLength: 4000 });
            if (result.success && result.content) {
              urlContents.push(`\n[URL: ${url}]\n${result.content}`);
              console.log(`\u2705 URL content extracted: ${result.content.length} chars from ${url}`);
            }
          } catch (urlError) {
            console.warn(`\u26a0\ufe0f Failed to extract ${url}:`, urlError);
          }
        }
        
        if (urlContents.length > 0) {
          urlContext = urlContents.join('\n\n');
        }
      } catch (error) {
        console.error('Error extracting URL content:', error);
      }
    }
    
    // Add blockchain context if available
    if (blockchainContext) {
      enrichedMessage = `${stakingAdvicePreamble}${enrichedMessage}\n\n[CONTEXTO BLOCKCHAIN ACTUAL - USA ESTOS DATOS PARA RESPONDER]:\n${blockchainContext}`;
    } else if (stakingAdvicePreamble) {
      enrichedMessage = `${stakingAdvicePreamble}${enrichedMessage}`;
    }
    
    // Add URL content context if available
    if (urlContext) {
      enrichedMessage = `${enrichedMessage}\n\n[CONTENIDO DE URL - ANALIZA ESTE CONTENIDO PARA RESPONDER]:\n${urlContext}`;
      console.log(`\ud83d\udcc4 URL context added: ${urlContext.length} chars`);
    }
    
    console.log('\ud83e\udd16 Generating response...');
    
    // \ud83d\udd17 Configure tools (keep URL context tool for additional support)
    // Note: We now extract content ourselves for better accuracy, but keep tool as fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configTools: any = hasUrls ? [{ url_context: {} }] : undefined;
    
    if (hasUrls) {
      console.log('\u2705 URL context: explicit content + tool enabled as fallback');
      console.log('\ud83d\udd17 URLs processed:', detectedUrls.length);
    }
    
    // Generar stream con mensaje enriquecido (incluye contexto blockchain si existe)
    const streamResponse = await client.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: enrichedMessage,
      config: {
        systemInstruction,
        ...(configTools && { tools: configTools }), // Solo incluir tools si hay URLs
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        temperature: 0.3,
        topK: 20,
        topP: 0.85,
        maxOutputTokens: 1024,
      }
    });
    
    // Timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.error('⏱️ Request timeout');
        metrics.errors++;
        res.status(504).json({ error: 'Request timeout' });
      }
    }, 25000); // 25s para serverless (Vercel límite: 30s)
    
    res.status(200);
    
    let chunks = 0;
    let totalChars = 0;
    let fullResponse = '';
    
    // Recolectar respuesta completa del stream
    console.log('📥 Collecting response from Gemini...');
    let urlContextMetadata = null;
    
    for await (const chunk of streamResponse) {
      const chunkText = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!chunkText) {
        console.warn('\u26a0\ufe0f Empty chunk received, skipping...');
        continue;
      }
      
      fullResponse += chunkText;
      totalChars += chunkText.length;
      chunks++;
      
      // \ud83d\udd17 Extract URL context metadata if available
      if (hasUrls && chunk.candidates?.[0]?.urlContextMetadata) {
        urlContextMetadata = chunk.candidates[0].urlContextMetadata;
      }
    }
    
    console.log(`\u2705 Collected ${chunks} chunks (${totalChars} chars) from Gemini`);
    
    // \ud83d\udd17 Log URL context results
    if (hasUrls && urlContextMetadata) {
      const urlMetadata = urlContextMetadata.url_metadata || [];
      const successful = urlMetadata.filter((m: { url_retrieval_status: string }) => 
        m.url_retrieval_status === 'URL_RETRIEVAL_STATUS_SUCCESS'
      ).length;
      const failed = urlMetadata.length - successful;
      
      console.log(`\ud83d\udd17 URL Context Results: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        console.warn('\u26a0\ufe0f Some URLs could not be retrieved');
      }
    }
    
    // 🆕 TOKEN TRACKING: Update token metrics
    const estimatedInputTokens = tokenCountingService.quickEstimate(messageContent);
    const estimatedOutputTokens = tokenCountingService.quickEstimate(fullResponse);
    metrics.totalTokensUsed += estimatedInputTokens + estimatedOutputTokens;
    
    console.log(`📊 Token estimate: ~${estimatedInputTokens} input, ~${estimatedOutputTokens} output`);
    
    // ✅ APPLY MARKDOWN FORMATTING: Ensure consistent formatting across all environments
    // This guarantees that both local dev and production responses have proper markdown structure
    const formattedResponse = formatResponseForMarkdown(fullResponse);
    
    if (formattedResponse !== fullResponse) {
      console.log(`📝 Markdown formatting applied: ${fullResponse.length} → ${formattedResponse.length} chars`);
    }
    
    // Streaming semántico: procesar la respuesta completa
    console.log('🎯 Starting semantic streaming...');
    
    const streamConfig: StreamConfig = {
      enableSemanticChunking: true,
      enableContextualPauses: true,
      enableVariableSpeed: true,
      clientInfo: {
        ip: clientIp,
        userAgent: headers['user-agent'] as string | undefined
      }
    };
    
    await semanticStreamingService.streamSemanticContent(res, formattedResponse, streamConfig);
    
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    metrics.success++;
    metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.success - 1) + duration) / metrics.success;
    
    console.log(`✅ Stream completed: ${chunks} chunks, ${totalChars} chars, ${duration}ms`);
    
    // Log de métricas cada 50 requests (enhanced with token stats)
    if (metrics.total % 50 === 0) {
      console.log(`📊 [METRICS] Total: ${metrics.total}, Success: ${metrics.success}, Errors: ${metrics.errors}, Avg: ${Math.round(metrics.avgResponseTime)}ms`);
      console.log(`📊 [TOKENS] Total Used: ${metrics.totalTokensUsed}, Saved: ${metrics.totalTokensSaved}, Est. Savings: $${metrics.estimatedCostSavings.toFixed(4)}`);
    }
    
  } catch (error) {
    metrics.errors++;
    const duration = Date.now() - startTime;
    
    const err = error as Error;
    console.error('❌ Stream error:', err.message);
    console.error('Error name:', err.name);
    console.error('Error stack:', err.stack);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
    
    if (!res.headersSent) {
      if (err.message?.includes('API key') || err.message?.includes('401')) {
        console.error('🔑 API Key error detected');
        res.status(500).json({ 
          error: 'API configuration error',
          message: 'Invalid or missing API key'
        });
        return;
      }
      if (err.message?.includes('quota') || err.message?.includes('rate') || err.message?.includes('429')) {
        console.error('⏱️ Rate limit error detected');
        res.status(429).json({ error: 'Service temporarily unavailable' });
        return;
      }
      if (err.message?.includes('model') || err.message?.includes('not found')) {
        console.error('🤖 Model error detected');
        res.status(500).json({ 
          error: 'Model error',
          message: 'The specified model is not available'
        });
        return;
      }
      
      const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.error(`🆔 Error ID: ${errorId}`);
      
      res.status(500).json({
        error: 'Internal server error',
        errorId,
        message: err.message || 'Unknown error occurred',
        ...(process.env.NODE_ENV === 'development' && { details: err.stack })
      });
    }
    
    console.log(`❌ Request failed after ${duration}ms`);
  }
}

// ============================================================================
// EXPORT CON SEGURIDAD CENTRALIZADA
// ============================================================================
// El wrapper withSecurity aplica automáticamente:
// - CORS headers
// - Security headers (CSP, X-Frame-Options, etc.)
// - Rate limiting
// - Attack detection (XSS, SQL Injection, etc.)
// - API Key validation (si se configura)
// - Timeout protection
// - Error handling
export default withSecurity(streamHandler);

// Configuración de Vercel
export const config = {
  maxDuration: 60
};
