/**
 * Query Classifier Service
 * Determina si una consulta necesita buscar en la base de conocimientos de Nuxchain
 * o si puede ser respondida directamente por el modelo Gemini
 */

/**
 * Palabras clave que indican que la consulta es específica de Nuxchain
 * y requiere buscar en la base de conocimientos
 */
const NUXCHAIN_KEYWORDS = [
  // Productos/Features de Nuxchain
  'nuxchain', 'nux', 'marketplace', 'airdrop', 'staking', 'tokenization', 'tokenización',
  'nft', 'polygon', 'smart contract', 'contrato inteligente',
  
  // Acciones específicas de la plataforma
  'buy nft', 'sell nft', 'comprar nft', 'vender nft',
  'create airdrop', 'crear airdrop', 'participar airdrop',
  'stake', 'staking pool', 'pool de staking', 'hacer staking',
  'mint', 'mintear', 'create token', 'crear token',
  'royalties', 'regalías', 'fees', 'tarifas',
  
  // Economía de la plataforma
  'pol', 'matic', 'token nuxchain', 'governance', 'gobernanza',
  'rewards', 'recompensas', 'incentivos', 'incentives',
  
  // Características técnicas
  'fractional nft', 'nft fraccionado', 'fraccional',
  'metadata', 'ipfs', 'smart staking', 'liquidity',
  'wallet', 'billetera', 'connect wallet', 'conectar billetera'
];

/**
 * Patrones que indican preguntas genéricas que NO necesitan la base de conocimientos
 */
const GENERIC_PATTERNS = [
  /^(hi|hello|hey|hola|buenas|buenos días|buenas tardes)/i,
  /^(what is|qué es|que es|define|explica|explain) (blockchain|crypto|nft|defi|web3)/i,
  /^(how (does|do)|cómo|como) (blockchain|crypto|nft|defi|web3)/i,
  /(en general|in general|generally|básico|basic)/i,
  /^(tell me|dime|cuéntame|háblame) (about|sobre|de) (blockchain|crypto|nft)/i
];

/**
 * Determina si una consulta necesita buscar en la base de conocimientos de Nuxchain
 * @param {string} query - La consulta del usuario
 * @returns {boolean} - true si necesita KB, false si puede responder directamente
 */
export function needsKnowledgeBase(query) {
  if (!query || typeof query !== 'string') {
    return false;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  // 1. Si es una pregunta muy genérica, NO buscar en KB
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(lowerQuery)) {
      console.log('🎯 Generic question detected - skipping KB search');
      return false;
    }
  }
  
  // 2. Si contiene palabras clave de Nuxchain, SÍ buscar en KB
  const hasNuxchainKeyword = NUXCHAIN_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword.toLowerCase())
  );
  
  if (hasNuxchainKeyword) {
    console.log('🎯 Nuxchain-specific query detected - searching KB');
    return true;
  }
  
  // 3. Por defecto, si no es genérico pero tampoco específico, NO buscar
  // Esto permite que Gemini responda con su conocimiento general
  console.log('🎯 General query - letting Gemini respond directly');
  return false;
}

/**
 * Obtiene el nivel de confianza de que la query necesita KB (0-1)
 * Útil para debugging y métricas
 */
export function getKnowledgeBaseConfidence(query) {
  if (!query || typeof query !== 'string') {
    return 0;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  let confidence = 0;
  
  // Penalizar preguntas genéricas
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(lowerQuery)) {
      confidence -= 0.5;
    }
  }
  
  // Aumentar por cada keyword de Nuxchain
  const keywordMatches = NUXCHAIN_KEYWORDS.filter(keyword => 
    lowerQuery.includes(keyword.toLowerCase())
  ).length;
  
  confidence += keywordMatches * 0.2;
  
  // Normalizar entre 0 y 1
  return Math.max(0, Math.min(1, confidence));
}

export default {
  needsKnowledgeBase,
  getKnowledgeBaseConfidence
};
