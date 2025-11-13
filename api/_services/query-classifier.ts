/**
 * ✅ TypeScript Migration - Phase 1
 * Query Classifier Service with strict types
 * Determina si una consulta necesita buscar en la base de conocimientos de Nuxchain
 * o si puede ser respondida directamente por el modelo Gemini
 */

import type {
  ClassificationOptions,
  ConversationContext,
  SimpleClassificationResult,
  DetailedClassificationResult
} from '../types/index.js';

/**
 * Palabras clave que indican que la consulta es específica de Nuxchain
 * y requiere buscar en la base de conocimientos
 */
const NUXCHAIN_KEYWORDS: string[] = [
  // Productos/Features de Nuxchain
  'nuxchain', 'nux', 'marketplace', 'airdrop', 'staking', 'tokenization', 'tokenización',
  'nft', 'polygon', 'smart contract', 'contrato inteligente', 'nuxbee',
  
  // ✅ NUEVO: Roadmap y Desarrollo
  'roadmap', 'hoja de ruta', 'ruta', 'development', 'desarrollo',
  'future', 'futuro', 'planes', 'plans', 'planeado', 'planned',
  'vision', 'visión', 'objetivo', 'objectives', 'goals', 'metas',
  'milestones', 'hitos', 'releases', 'lanzamientos', 'updates', 'actualizaciones',
  
  // Acciones específicas de la plataforma
  'buy nft', 'sell nft', 'comprar nft', 'vender nft',
  'create airdrop', 'crear airdrop', 'participar airdrop',
  'stake', 'staking pool', 'pool de staking', 'hacer staking',
  'mint', 'mintear', 'create token', 'crear token',
  'royalties', 'regalías', 'fees', 'tarifas', 'comision', 'comisión',
  
  // ✅ NUEVOS: Términos Financieros y ROI
  'apy', 'roi', 'rendimiento', 'ganancia', 'retorno', 'tasa',
  'interes', 'interés', 'porcentaje', '%', 'yield', 'profit',
  'earnings', 'ganancias', 'beneficio', 'revenue', 'income',
  'performance', 'desempeño', 'resultados',
  
  // ✅ NUEVOS: Límites y Restricciones
  'minimo', 'mínimo', 'minimum', 'min',
  'maximo', 'máximo', 'maximum', 'max',
  'limite', 'límite', 'limit', 'cap',
  'restriccion', 'restricción', 'restriction',
  
  // ✅ NUEVOS: Depósitos y Retiros
  'deposito', 'depósito', 'deposit', 'depositar',
  'retiro', 'retirar', 'withdraw', 'withdrawal',
  'reclamar', 'claim', 'cobrar', 'collect',
  
  // ✅ NUEVOS: Períodos de Lockup
  'lockup', 'bloqueo', 'lock', 'locked',
  'periodo', 'período', 'period', 'plazo',
  'duracion', 'duración', 'duration', 'tiempo', 'time',
  '30 dias', '30 días', '30 days',
  '90 dias', '90 días', '90 days',
  '180 dias', '180 días', '180 days',
  '365 dias', '365 días', '365 days', '1 año', '1 year',
  
  // ✅ NUEVOS: Procesos y Funciones
  'como funciona', 'cómo funciona', 'how works', 'how to',
  'proceso', 'process', 'pasos', 'steps',
  'tutorial', 'guide', 'guía', 'instrucciones', 'instructions',
  'compound', 'componer', 'reinvertir', 'reinvest',
  
  // Economía de la plataforma
  'pol', 'matic', 'token nuxchain', 'governance', 'gobernanza',
  'rewards', 'recompensas', 'incentivos', 'incentives',
  
  // ✅ NUEVOS: Características y Funcionalidades
  'caracteristicas', 'características', 'features',
  'funciones', 'functions', 'funcionalidades', 'functionalities',
  'capacidades', 'capabilities', 'servicios', 'services',
  'ventajas', 'benefits', 'beneficios', 'advantages',
  
  // Características técnicas
  'fractional nft', 'nft fraccionado', 'fraccional',
  'metadata', 'ipfs', 'smart staking', 'liquidity',
  'wallet', 'billetera', 'connect wallet', 'conectar billetera',
  
  // ✅ NUEVOS: Valores Específicos
  '5 pol', '10000 pol', '1000 pol', '300 deposits',
  'base apy', 'hourly rate', 'tasa por hora'
];

/**
 * Patrones que indican preguntas genéricas que NO necesitan la base de conocimientos
 */
const GENERIC_PATTERNS: RegExp[] = [
  /^(hi|hello|hey|hola|buenas|buenos días|buenas tardes)/i,
  /^(what is|qué es|que es|define|explica|explain) (blockchain|crypto|nft|defi|web3)/i,
  /^(how (does|do)|cómo|como) (blockchain|crypto|nft|defi|web3)/i,
  /(en general|in general|generally|básico|basic)/i,
  /^(tell me|dime|cuéntame|háblame) (about|sobre|de) (blockchain|crypto|nft)/i
];

/**
 * Patrones de preguntas sobre CAPACIDADES de Nuxchain que SÍ necesitan KB
 * Estas son preguntas genéricas pero contextualizadas a Nuxchain
 */
const NUXCHAIN_CAPABILITY_PATTERNS: RegExp[] = [
  /^(qué puedes hacer|que puedes hacer|what can you do)/i,
  /^(cuáles son tus capacidades|cuales son tus capacidades|what are your capabilities)/i,
  /^(qué funciones|que funciones|what features) (ofreces|offers|tienes|have)/i,
  /^(cuáles son (las )?funciones|cuales son (las )?funciones)/i,
  /^(qué servicios|que servicios|what services)/i,
  /^(cuáles son (los )?servicios|cuales son (los )?servicios)/i,
  /(funcionalidades de nuxchain|features of nuxchain|qué puedo hacer en|que puedo hacer en)/i,
  /^(cómo funciona nuxchain|como funciona nuxchain|how does nuxchain work)/i
];

/**
 * ✅ NUEVOS: Patrones para preguntas con NÚMEROS y VALORES ESPECÍFICOS
 * Estas preguntas casi siempre requieren buscar en KB
 */
const NUMERIC_QUERY_PATTERNS: RegExp[] = [
  // Preguntas sobre APY, ROI, tasas
  /(apy|roi|tasa|rendimiento|ganancia|porcentaje|interés|interest|rate|yield)/i,
  
  // Preguntas sobre límites (min/max)
  /(minimo|mínimo|minimum|min|maximo|máximo|maximum|max|limite|límite|limit)/i,
  
  // Preguntas con números específicos
  /\b(5|10|30|90|180|365|1000|10000|300)\b/i,
  
  // Preguntas sobre períodos
  /(dias|días|days|meses|months|años|years|periodo|período|period|plazo|lockup|bloqueo)/i,
  
  // Preguntas sobre valores monetarios
  /(pol|matic|tokens?|cuanto|cuánto|how much|precio|price|costo|cost)/i,
  
  // Preguntas sobre características específicas
  /(caracteristicas|características|features|funciones|functions|capacidades|capabilities)/i,
  
  // Preguntas sobre procesos
  /(como|cómo|how|proceso|process|pasos|steps|tutorial|guía|guide)/i
];

/**
 * Contexto de conversación global (simple para MVP)
 * En producción, esto debería estar asociado a cada sesión del usuario
 */
let conversationContext: ConversationContext = {
  lastQueryWasAboutNuxchain: false,
  previousTopics: []
};

/**
 * Actualiza el contexto de conversación
 * @param isAboutNuxchain - Si la última query fue sobre Nuxchain
 * @param topics - Tópicos mencionados en la última query
 */
export function updateConversationContext(isAboutNuxchain: boolean, topics: string[] = []): void {
  conversationContext.lastQueryWasAboutNuxchain = isAboutNuxchain;
  conversationContext.previousTopics = topics;
}

/**
 * Obtiene el contexto actual de conversación
 */
export function getConversationContext(): ConversationContext {
  return { ...conversationContext };
}

/**
 * Determina si una consulta necesita buscar en la base de conocimientos de Nuxchain
 * @param query - La consulta del usuario
 * @param options - Opciones adicionales: { includeContext: boolean, debugMode: boolean }
 * @returns { needsKB: boolean, reason: string, score: number }
 */
export function needsKnowledgeBase(query: string, options: ClassificationOptions = {}): DetailedClassificationResult {
  const { includeContext = true, debugMode = false } = options;
  
  if (!query || typeof query !== 'string') {
    const result = { needsKB: false, reason: 'empty_query', score: 0 };
    if (debugMode) console.log(`[CLASSIFIER] Invalid query:`, result);
    return result;
  }
  
  const lowerQuery: string = query.toLowerCase().trim();
  let reasoning: string[] = [];
  let finalScore: number = 0;
  
  // Paso 1: Detectar si es una pregunta completamente genérica
  // que NO sea sobre capacidades de Nuxchain
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(lowerQuery)) {
      reasoning.push('matches_generic_pattern');
      if (debugMode) {
        console.log(`[CLASSIFIER] ⚠️  Generic pattern detected`);
      }
      return {
        needsKB: false,
        reason: 'generic_question',
        score: 0.1,
        reasoning
      };
    }
  }
  
  // ✅ NUEVO Paso 2: Detectar patrones NUMÉRICOS o ESPECÍFICOS (alta prioridad)
  let hasNumericPattern = false;
  for (const pattern of NUMERIC_QUERY_PATTERNS) {
    if (pattern.test(lowerQuery)) {
      hasNumericPattern = true;
      reasoning.push('matches_numeric_pattern');
      finalScore += 0.35; // Alto boost para preguntas numéricas
      if (debugMode) {
        console.log(`[CLASSIFIER] 🔢 Numeric/specific pattern detected`);
      }
      break;
    }
  }
  
  // Paso 3: Detectar si es una pregunta sobre CAPACIDADES específicamente
  let isCapabilityQuestion = false;
  for (const pattern of NUXCHAIN_CAPABILITY_PATTERNS) {
    if (pattern.test(lowerQuery)) {
      isCapabilityQuestion = true;
      reasoning.push('matches_capability_pattern');
      finalScore += 0.4;
      if (debugMode) {
        console.log(`[CLASSIFIER] 🎯 Nuxchain capability question detected`);
      }
      break;
    }
  }
  
  // Paso 4: Detectar palabras clave específicas de Nuxchain
  let keywordMatches: number = 0;
  const matchedKeywords: string[] = [];
  
  // ✅ CRITICAL KEYWORDS: Dan +0.20 (en lugar de +0.10)
  const CRITICAL_KEYWORDS: string[] = [
    'apy', 'roi', 'staking', 'marketplace', 'nuxchain', 'nux',
    'roadmap', 'hoja de ruta', 'desarrollo', 'planes', 'futuro', // ✅ AGREGADOS
    'lockup', 'compound', 'depositar', 'retiro', 'minimo', 'maximo'
  ];
  
  for (const keyword of NUXCHAIN_KEYWORDS) {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      keywordMatches++;
      matchedKeywords.push(keyword);
      // ✅ MEJORADO: Boost variable según importancia del keyword
      if (CRITICAL_KEYWORDS.includes(keyword.toLowerCase())) {
        finalScore += 0.20; // Keywords críticos
      } else {
        finalScore += 0.10; // Keywords normales
      }
    }
  }
  
  if (keywordMatches > 0) {
    reasoning.push(`found_${keywordMatches}_keywords`);
    if (debugMode) {
      console.log(`[CLASSIFIER] 🔑 Found ${keywordMatches} keywords: ${matchedKeywords.slice(0, 5).join(', ')}`);
    }
  }
  
  // Paso 5: Considerar contexto de conversación
  if (includeContext && (isCapabilityQuestion || hasNumericPattern) && conversationContext.lastQueryWasAboutNuxchain) {
    reasoning.push('context_suggests_nuxchain');
    finalScore += 0.15;
    if (debugMode) {
      console.log(`[CLASSIFIER] 📝 Previous context: was about Nuxchain`);
    }
  }
  
  // ✅ MEJORADO: Decisión final con threshold más bajo
  const needsKB: boolean = finalScore >= 0.20; // Bajado de 0.25 a 0.20 (permite 1 critical keyword)
  const reason: string = needsKB ? 'needs_kb' : 'general_response';
  
  if (debugMode) {
    console.log(`[CLASSIFIER] Final Score: ${finalScore.toFixed(2)} | Decision: ${needsKB ? '✅ USE KB' : '❌ SKIP KB'}`);
    console.log(`[CLASSIFIER] Reasoning: [${reasoning.join(', ')}]`);
    console.log(`[CLASSIFIER] Matched Keywords (${keywordMatches}): ${matchedKeywords.slice(0, 5).join(', ')}`);
  }
  
  return {
    needsKB,
    reason,
    score: finalScore,
    reasoning,
    keywordMatches,
    matchedKeywords: matchedKeywords.slice(0, 10),
    isCapabilityQuestion,
    hasNumericPattern,
    hasNuxchainContext: conversationContext.lastQueryWasAboutNuxchain
  };
}

/**
 * Wrapper compatible con versión anterior (solo retorna boolean)
 * Usado en el código existente
 */
export function needsKnowledgeBaseSimple(query: string): boolean {
  const result = needsKnowledgeBase(query, { includeContext: true, debugMode: false });
  
  // Log simple para mantener compatibilidad
  if (result.needsKB) {
    console.log('🎯 Query classified as needing KB search');
  } else {
    console.log(`⏭️ Skipping KB search (${result.reason})`);
  }
  
  return result.needsKB;
}

/**
 * Obtiene el nivel de confianza de que la query necesita KB (0-1)
 * Útil para debugging y métricas
 */
export function getKnowledgeBaseConfidence(query: string): number {
  const result = needsKnowledgeBase(query, { includeContext: true, debugMode: false });
  return Math.max(0, Math.min(1, result.score));
}

/**
 * Resets el contexto de conversación (útil para testing)
 */
export function resetConversationContext(): void {
  conversationContext = {
    lastQueryWasAboutNuxchain: false,
    previousTopics: []
  };
}

export default {
  needsKnowledgeBase,
  needsKnowledgeBaseSimple,
  getKnowledgeBaseConfidence,
  updateConversationContext,
  getConversationContext,
  resetConversationContext
};
