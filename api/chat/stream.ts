import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

import { withSecurity } from '../_middlewares/serverless-security.js';
import WebScraperService from '../_services/web-scraper.js';
import { kv } from '@vercel/kv';
import { FREE_DAILY_LIMIT, SUBSCRIPTION_COLLECTION } from '../../src/constants/subscription.js';
import type { 
  ChatMessage, 
  KnowledgeBaseContext 
} from '../types/index.js';

// Module-level Gemini client — initialized once, reused across warm invocations
let _geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!_geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    _geminiClient = new GoogleGenAI({ apiKey });
  }
  return _geminiClient;
}

// Lazy imports for blockchain services
let blockchainService: typeof import('../_services/blockchain-service.js') | null = null;
let blockchainTools: typeof import('../_services/blockchain-tools.js') | null = null;

// Import type for function names
type BlockchainFunctionName = 'get_pol_price' | 'get_staking_info' | 'get_nft_listings' | 'check_wallet_balance' | 'get_user_staking_position' | 'estimate_staking_reward' | 'get_user_nfts' | 'get_user_history';

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
  
  // ─── Staking queries ─────────────────────────────────────────────────────
  const mentionsStakingKeyword = text.includes('staking') || text.includes('stake') ||
    text.includes('stakear') || text.includes('stakeado') ||
    text.includes('apr') || text.includes('apy');

  const mentionsRewardsOrDeposits = /(reward|recompens|ganancia|pendiente|acumulad|deposit|dep[oó]sit|bloquead|locked|unlock|retirable|withdraw)\b/i.test(text);
  const isUserIntent = /\b(mi|mis|m[ií]o|m[ií]a|revisa|tengo|cu[aá]nto tengo|mi wallet|mi cartera|he|cuántas?|cuantas?|my|mine|i have|my wallet|my balance|my staking|my deposit)\b/i.test(text);
  const isOptimizationIntent = /(optimizar|mejorar|recomend|consej|estrateg|maximiz|aumentar|recommend|suggest|advice|improve|optimize|maximize|strategy|should i|what should|best option|better)\b/i.test(text);

  if (mentionsStakingKeyword) {
    functions.push('get_staking_info');
    if (isUserIntent || isOptimizationIntent || mentionsRewardsOrDeposits) {
      functions.push('get_user_staking_position');
    }
  }

  // ─── Personal rewards queries (WITHOUT "staking" keyword) ────────────────
  // e.g. "y mis recompensas?", "cuántas recompensas he acumulado?", "mis ganancias pendientes"
  if (!mentionsStakingKeyword && mentionsRewardsOrDeposits && isUserIntent) {
    if (!functions.includes('get_staking_info')) functions.push('get_staking_info');
    if (!functions.includes('get_user_staking_position')) functions.push('get_user_staking_position');
  }
  
  // Detectar queries de NFT listings (marketplace global)
  if ((text.includes('nft') || text.includes('marketplace')) && 
      (text.includes('lista') || text.includes('venta') || text.includes('disponible') || text.includes('comprar'))) {
    functions.push('get_nft_listings');
  }
  
  // Detectar queries de NFTs del usuario (mis NFTs, cuántos tengo, etc)
  const isUserNFTQuery = (
    /\b(mis?|my|cuántos?|cuantos?|tengo|have|minteado|minted|listado|listed)\b/.test(text) &&
    text.includes('nft')
  ) || /\b(mis listings|my listings|nfts listados|nfts for sale|mis nfts?|my nfts?)\b/.test(text);
  if (isUserNFTQuery) {
    functions.push('get_user_nfts');
  }
  
  // Detectar queries de wallet/balance
  if ((text.includes('wallet') || text.includes('balance') || text.includes('saldo') || text.includes('cartera')) &&
      (text.includes('0x') || text.includes('direccion') || text.includes('address') || isUserIntent)) {
    functions.push('check_wallet_balance');
  }
  
  // Si la query de wallet es personal, traer también la posición de staking para contexto completo
  // (la cache de 30s garantiza que no se hacen RPC duplicados — getWalletBalance llama getUserStakingPosition internamente)
  if (functions.includes('check_wallet_balance') && !functions.includes('get_user_staking_position')) {
    functions.push('get_user_staking_position');
  }

  // Detectar queries personales sobre depósitos/contratos que NO usan la palabra 'staking'
  // Ej: "mis depósitos", "mis interacciones con los contratos", "mis fondos bloqueados"
  const isPersonalContractQuery =
    /\b(mis?|my|tengo|cu[aá]nto|revisa|dame|muestra|ver)\b/i.test(text) &&
    /(dep[oó]sit|contrat[oa]|interacci[oó]n|fondos?|tokens? bloqueados?|locked|unlock|bloquead|invest|position|portfolio|retir)/i.test(text);
  if (isPersonalContractQuery && !functions.includes('get_user_staking_position')) {
    if (!functions.includes('get_staking_info')) functions.push('get_staking_info');
    functions.push('get_user_staking_position');
  }

  // Detectar queries de reward estimation (potential future earnings)
  // Note: only trigger if the message is clearly about estimating/calculating,
  // not when asking about already-accrued personal rewards (handled above)
  const isEstimationQuery = /(cuánto ganaría|cuanto ganaría|cuanto ganaría|potencial|estimat|calcul|si stake|si deposito|si pongo)/i.test(text);
  if (isEstimationQuery &&
      (text.includes('reward') || text.includes('recompensa') || text.includes('ganancia') || text.includes('ganar')) &&
      (text.includes('staking') || text.includes('stake') || text.includes('pol') || text.includes('matic'))) {
    functions.push('estimate_staking_reward');
  }

  // Detectar queries de historial de actividad (subgraph)
  const isHistoryQuery =
    /\b(historial|history|cu[aá]nto.{0,20}(depositado|ganado|retirado|total)|mis? (retiros?|dep[oó]sitos? total|nfts? mint|ventas?|compras?)|my (withdrawals?|total deposits?|nfts? minted|total activity|transaction history|transactions))\b/i.test(text) ||
    /\b(total deposited|total withdrawn|my activity|my transactions?|all my deposits?)\b/i.test(text);
  if (isHistoryQuery && !functions.includes('get_user_history')) {
    functions.push('get_user_history');
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

// Wallet auth payload sent by the frontend after signing
interface WalletAuthPayload {
  walletAddress: string;
  message: string;
  signature: string;
}

interface ImageAttachmentPayload {
  id:         string;
  url:        string;
  name:       string;
  size:       number;
  type:       string;
  uploadedAt: string;
}

// Tipo para el body que puede venir en diferentes formatos
type ChatRequestBody = 
  | { messages: ChatMessage[]; message?: never; walletAddress?: string; selectedModel?: string; walletAuth?: WalletAuthPayload; attachments?: ImageAttachmentPayload[] }
  | { message: string; messages?: never; walletAddress?: string; selectedModel?: string; walletAuth?: WalletAuthPayload; attachments?: ImageAttachmentPayload[] }
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

    // ──  Subscription check & daily free limit ────────────────────────────────
    const walletAddress = (headers['x-wallet-address'] as string || '').trim();
    let subscriptionTier: 'free' | 'pro' | 'premium' = 'free';
    let chatModel = 'gemini-3.1-flash-lite-preview'; // Default model for free tier
    
    // Extract selected model from request body
    const requestBody = req.body as ChatRequestBody;
    const selectedModel = (typeof requestBody === 'object' && requestBody !== null && 'selectedModel' in requestBody) 
      ? (requestBody as any).selectedModel 
      : null;

    if (walletAddress && walletAddress.length >= 32) {
      try {
        // Check KV cache first
        const cacheKey = `sub:${walletAddress}`;
        let subData: Record<string, unknown> | null = null;
        try { subData = await kv.get<Record<string, unknown>>(cacheKey); } catch { /* fail open */ }

        if (!subData) {
          // Fallback to Firestore
          const { getDb } = await import('../_services/firebase-admin.js');
          const db = getDb();
          const doc = await db.collection(SUBSCRIPTION_COLLECTION).doc(walletAddress).get();
          if (doc.exists) {
            subData = doc.data() as Record<string, unknown>;
            try { await kv.set(cacheKey, subData, { ex: 300 }); } catch { /* ok */ }
          }
        }

        if (subData && subData.status === 'active') {
          const expiryRaw = subData.expiryDate as { _seconds?: number } | string | undefined;
          let expiry: Date;
          if (typeof expiryRaw === 'string') { expiry = new Date(expiryRaw); }
          else if (expiryRaw && '_seconds' in expiryRaw) { expiry = new Date((expiryRaw._seconds as number) * 1000); }
          else { expiry = new Date(0); }

          if (expiry > new Date()) {
            subscriptionTier = subData.tier as 'pro' | 'premium';
            
            // Use selected model if user is Pro/Premium
            if (selectedModel && ['gemini-pro', 'gemini-flash'].includes(selectedModel)) {
              chatModel = selectedModel;
              console.log(`🎯 Using selected model: ${selectedModel}`);
            } else {
              // Default to gemini-3.1-flash-lite-preview for Pro/Premium if no selection
              chatModel = 'gemini-3.1-flash-lite-preview';
            }
          }
        }
      } catch (subErr) {
        console.warn('[chat/stream] Subscription check failed, defaulting to free', subErr);
      }
    }

    // Daily limit for free tier: 20 requests/day per wallet (or IP)
    // Read-first pattern: check current count before incrementing so failed/invalid
    // requests don't burn a slot against the user's quota.
    if (subscriptionTier === 'free') {
      const identifier = walletAddress.length >= 32 ? walletAddress : clientIp;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dailyKey = `chatdaily:${identifier}:${today}`;
      try {
        // Peek current usage without charging yet
        const current = (await kv.get<number>(dailyKey)) ?? 0;
        if (current >= FREE_DAILY_LIMIT) {
          metrics.errors++;
          res.status(429).json({
            error: 'DAILY_LIMIT_REACHED',
            message: `Free tier: ${FREE_DAILY_LIMIT} messages/day. Upgrade to Pro or Premium for unlimited access.`,
            dailyLimit: FREE_DAILY_LIMIT,
            used: current,
            upgradeUrl: '/upgrade',
            resetAt: `${today}T23:59:59Z`,
          });
          return;
        }
        // Charge slot only now that we know the request will be served
        const count = await kv.incr(dailyKey);
        if (count === 1) await kv.expire(dailyKey, 86400); // 24h TTL
        console.log(`📊 Free daily usage: ${count}/${FREE_DAILY_LIMIT} for ${identifier}`);
      } catch (rlErr) {
        console.warn('[chat/stream] Daily limit KV error, failing open', rlErr);
      }
    }

    console.log(`🤖 Model: ${chatModel} | Tier: ${subscriptionTier} | Wallet: ${walletAddress.substring(0, 8) || 'none'}...`);
    // ── End subscription check ────────────────────────────────────────────────

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
    let buildSystemInstructionWithContext, formatResponseForMarkdown;
    let detectLanguage;
    
    try {
      const modules = await Promise.all([
        import('../_services/query-classifier.js').catch(e => { console.error('Error loading query-classifier:', e.message); throw e; }),
        import('../_services/embeddings-service.js').catch(e => { console.error('Error loading embeddings-service:', e.message); throw e; }),
        import('../_config/system-instruction.js').catch(e => { console.error('Error loading system-instruction:', e.message); throw e; }),
        import('../_services/markdown-formatter.js').catch(e => { console.error('Error loading markdown-formatter:', e.message); throw e; }),
        import('../_services/language-detector.js').catch(e => { console.error('Error loading language-detector:', e.message); throw e; })
      ]);
      
      needsKnowledgeBase = modules[0].needsKnowledgeBase;
      updateConversationContext = modules[0].updateConversationContext;
      getRelevantContext = modules[1].getRelevantContext;
      buildSystemInstructionWithContext = modules[2].buildSystemInstructionWithContext;
      formatResponseForMarkdown = modules[3].formatResponseForMarkdown;
      detectLanguage = modules[4].detectLanguage;
      
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
    
    // Truncate context to stay within token limits (~4 chars per token estimate)
    const MAX_CONTEXT_TOKENS = 4000;
    const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * 4;
    if (relevantContext.context && relevantContext.context.length > MAX_CONTEXT_CHARS) {
      relevantContext = {
        ...relevantContext,
        context: relevantContext.context.substring(0, MAX_CONTEXT_CHARS)
      };
      console.log(`✂️ Context truncated to ${MAX_CONTEXT_CHARS} chars`);
    }
    
    if (relevantContext.context) {
      console.log(`✅ KB found: ${relevantContext.context.length} chars, score: ${relevantContext.score.toFixed(3)}`);
    } else {
      console.log('⚠️ No KB context found');
    }
    
    // ── WALLET AUTH: Verify signature & fetch on-chain user context ────────
    let graphUserContext = '';
    let verifiedWallet: string | null = null;
    const walletAuthPayload = (req.body as { walletAuth?: WalletAuthPayload }).walletAuth;

    if (walletAuthPayload?.walletAddress && walletAuthPayload?.message && walletAuthPayload?.signature) {
      try {
        const { verifyWalletSignature } = await import('../_middlewares/wallet-auth.js');
        const authResult = verifyWalletSignature(walletAuthPayload);

        if (authResult.valid && authResult.wallet) {
          verifiedWallet = authResult.wallet;
          console.log(`🔐 Wallet auth valid: ${authResult.wallet.slice(0, 8)}...`);
          const { fetchUserBlockchainData, formatUserContextForAI } = await import('../_services/graph-user-service.js');
          const userData = await fetchUserBlockchainData(authResult.wallet);
          if (userData) {
            graphUserContext = formatUserContextForAI(userData);
            console.log(`📊 Graph context loaded: ${graphUserContext.length} chars`);
          } else {
            console.warn('⚠️ Graph returned no data for wallet (may be new user or subgraph delay)');
          }
        } else {
          console.warn(`⚠️ Wallet auth invalid: ${authResult.error}`);
        }
      } catch (authErr) {
        console.error('❌ Wallet auth error (non-blocking):', authErr);
      }
    }

    // Construir system instruction con contexto, idioma e identidad del usuario
    const attachmentsForInstruction = (req.body as { attachments?: ImageAttachmentPayload[] }).attachments || [];
    const baseSystemInstruction = buildSystemInstructionWithContext(
      relevantContext.context || '',
      relevantContext.score || 0,
      languageDetection,
      attachmentsForInstruction.length,
      verifiedWallet
    );

    // Merge user Graph context into system instruction if available
    const systemInstruction = graphUserContext
      ? {
          parts: [{
            text: `${baseSystemInstruction.parts[0].text}\n\n[VERIFIED ON-CHAIN USER DATA — USE THIS WHEN THE USER ASKS ABOUT THEIR ACTIVITY]:\n${graphUserContext}`
          }]
        }
      : baseSystemInstruction;
    // ── END WALLET AUTH ───────────────────────────────────────────────────
    
    // Get module-level Gemini client (initialized once, reused across warm invocations)
    const client = getGeminiClient();
    
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
        
        // Build argument map for each detected function (synchronously)
        const walletFunctions = ['check_wallet_balance', 'get_user_staking_position', 'get_user_nfts', 'get_user_history'];
        const addressMatch = messageContent.match(/0x[a-fA-F0-9]{40}/);
        
        const functionCalls: Array<{ funcName: string; args: Record<string, unknown> }> = [];
        
        for (const funcName of blockchainDetection.functions) {
          if (walletFunctions.includes(funcName)) {
            if (addressMatch) {
              functionCalls.push({ funcName, args: { address: addressMatch[0] } });
            } else if (connectedWallet) {
              console.log(`🔗 Using connected wallet for ${funcName}: ${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}`);
              functionCalls.push({ funcName, args: { address: connectedWallet } });
            } else {
              console.log(`⚠️ Skipping ${funcName}: No wallet address found`);
            }
          } else if (funcName === 'estimate_staking_reward') {
            const amountMatch = messageContent.match(/(\d+(?:\.\d+)?)\s*(?:pol|matic)/i);
            functionCalls.push({ funcName, args: amountMatch ? { amount: parseFloat(amountMatch[1]) } : { amount: 100 } });
          } else {
            functionCalls.push({ funcName, args: {} });
          }
        }
        
        // Execute all blockchain functions in parallel
        const settled = await Promise.allSettled(
          functionCalls.map(async ({ funcName, args }) => {
            console.log(`🔗 Executing ${funcName} with args:`, args);
            const result = await blockchainService!.executeBlockchainFunction(funcName as BlockchainFunctionName, args);
            console.log(`✅ ${funcName} completed successfully`);
            return { name: funcName, args, result } as FunctionCallResult;
          })
        );
        
        for (const r of settled) {
          if (r.status === 'fulfilled') {
            functionResults.push(r.value);
          } else {
            console.error(`❌ Error executing blockchain function:`, r.reason);
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
              if (fr.name === 'get_user_nfts') {
                const nftData = data as unknown as { nftBalance?: number; activeListings?: number; note?: string };
                return `- NFTs del Usuario: ${nftData.nftBalance ?? 0} Skill NFT(s) en wallet${nftData.activeListings ? ` | ${nftData.activeListings} listado(s) actualmente en venta` : ' | Ninguno listado actualmente'}${nftData.note ? `\n  Info: ${nftData.note}` : ''}`;
              }
              if (fr.name === 'get_user_history') {
                const h = data as unknown as {
                  totalDeposited?: string; totalWithdrawn?: string; depositCount?: number;
                  withdrawalCount?: number; nftMintedCount?: number; nftSoldCount?: number;
                  nftBoughtCount?: number; level?: number; totalXP?: number;
                  recentDeposits?: Array<{ amount: string; lockupDuration: number; timestamp: number }>;
                  recentWithdrawals?: Array<{ amount: string; timestamp: number }>;
                };
                const recentDep = (h.recentDeposits || []).slice(0, 3).map(d => {
                  const date = new Date(d.timestamp * 1000).toLocaleDateString('es-ES');
                  return `    • ${d.amount} (${d.lockupDuration > 0 ? `${d.lockupDuration}d locked` : 'flexible'}) - ${date}`;
                }).join('\n');
                const recentWith = (h.recentWithdrawals || []).slice(0, 3).map(w => {
                  const date = new Date(w.timestamp * 1000).toLocaleDateString('es-ES');
                  return `    • ${w.amount} - ${date}`;
                }).join('\n');
                return `- Historial de Actividad:\n  Total depositado: ${h.totalDeposited || '0 POL'} (${h.depositCount ?? 0} depósitos)\n  Total retirado: ${h.totalWithdrawn || '0 POL'} (${h.withdrawalCount ?? 0} retiros)\n  NFTs minteados: ${h.nftMintedCount ?? 0} | Vendidos: ${h.nftSoldCount ?? 0} | Comprados: ${h.nftBoughtCount ?? 0}\n  Nivel: ${h.level ?? 0} | XP total: ${h.totalXP ?? 0}${recentDep ? `\n  Últimos depósitos:\n${recentDep}` : ''}${recentWith ? `\n  Últimos retiros:\n${recentWith}` : ''}`;
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
    const isStakingAdviceQuery = /(optimizar|mejorar|recomend|consej|estrateg|maximiz|aumentar|recommend|suggest|advice|improve|optimize|maximize|strategy|best|should|better)/i.test(messageContent) &&
      /(staking|stake|rewards|recompens)/i.test(messageContent);
    const stakingAdvicePreamble = isStakingAdviceQuery
      ? 'INSTRUCTIONS: Use the user\'s on-chain data in the BLOCKCHAIN CONTEXT below. Provide 3-5 concrete, actionable recommendations (what to do and why), mentioning Auto-Compound status, pending rewards, and whether moving Flexible → Locked makes sense given APY and liquidity. Respond in the same language the user used.\n\n'
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
    
    // Build full conversation contents for multi-turn context
    // Frontend sends: { messages: [{role:'user'|'model', parts:[{text}]}] }
    // Replace the last user turn with the enriched message (includes blockchain/URL context)

    // Image attachments — fetch from Vercel Blob URL and encode as inline base64
    const attachments = (req.body as { attachments?: ImageAttachmentPayload[] }).attachments || [];
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
    if (attachments.length > 0) {
      console.log(`🖼️ Processing ${attachments.length} image attachment(s)...`);
      for (const att of attachments.slice(0, 3)) {
        try {
          const imgRes = await fetch(att.url, {
            headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
          });
          if (!imgRes.ok) { console.warn(`⚠️ Could not fetch image ${att.url}: ${imgRes.status}`); continue; }
          const imgBuf = await imgRes.arrayBuffer();
          const base64 = Buffer.from(imgBuf).toString('base64');
          imageParts.push({ inlineData: { mimeType: att.type || 'image/webp', data: base64 } });
          console.log(`✅ Image loaded: ${att.name} (${Math.round(imgBuf.byteLength / 1024)} KB)`);
        } catch (imgErr) {
          console.warn(`⚠️ Failed to load image ${att.name}:`, imgErr);
        }
      }
      if (imageParts.length > 0) {
        console.log(`🖼️ ${imageParts.length} image(s) added to Gemini request`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };
    const lastUserParts: GeminiPart[] = [{ text: enrichedMessage }, ...imageParts];

    let geminiContents: Array<{ role: string; parts: GeminiPart[] }>;
    const bodyMessages = (req.body as { messages?: Array<{ role: string; parts: Array<{ text: string }> }> }).messages;
    if (bodyMessages && Array.isArray(bodyMessages) && bodyMessages.length > 1) {
      // Multi-turn: keep history, replace last user message with enriched version (+ images)
      geminiContents = [
        ...bodyMessages.slice(0, -1),
        { role: 'user', parts: lastUserParts }
      ];
    } else {
      geminiContents = [{ role: 'user', parts: lastUserParts }];
    }

    // Generar stream con mensaje enriquecido (incluye contexto blockchain si existe)
    const streamResponse = await client.models.generateContentStream({
      model: chatModel,
      // Always use array format when images are present; use plain string for single-turn text-only (slightly faster)
      contents: (geminiContents.length === 1 && imageParts.length === 0)
        ? enrichedMessage
        : (geminiContents as Parameters<typeof client.models.generateContentStream>[0]['contents']),
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
        maxOutputTokens: 2048,
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
    
    // Set streaming headers so the client receives chunks as they arrive
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Vercel/nginx response buffering
    res.status(200);
    res.flushHeaders(); // open the HTTP streaming connection immediately
    
    let chunks = 0;
    let totalChars = 0;
    let fullResponse = '';
    
    // Stream Gemini chunks directly to the client as they arrive (true streaming)
    console.log('📥 Streaming response from Gemini...');
    let urlContextMetadata = null;
    
    for await (const chunk of streamResponse) {
      const chunkText = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!chunkText) {
        continue;
      }
      
      // Write each chunk immediately — client sees words as Gemini generates them
      res.write(chunkText);
      
      fullResponse += chunkText;
      totalChars += chunkText.length;
      chunks++;
      
      // \ud83d\udd17 Extract URL context metadata if available
      if (hasUrls && chunk.candidates?.[0]?.urlContextMetadata) {
        urlContextMetadata = chunk.candidates[0].urlContextMetadata;
      }
    }
    
    res.end();
    clearTimeout(timeoutId);
    
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
    const estimatedInputTokens = Math.floor(messageContent.length / 4);
    const estimatedOutputTokens = Math.floor(fullResponse.length / 4);
    metrics.totalTokensUsed += estimatedInputTokens + estimatedOutputTokens;
    
    console.log(`📊 Token estimate: ~${estimatedInputTokens} input, ~${estimatedOutputTokens} output`);
    
    // ✅ APPLY MARKDOWN FORMATTING for logging metrics only (response already sent)
    const formattedResponse = formatResponseForMarkdown(fullResponse);
    
    if (formattedResponse !== fullResponse) {
      console.log(`📝 Markdown formatting applied (post-stream): ${fullResponse.length} → ${formattedResponse.length} chars`);
    }
    
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
