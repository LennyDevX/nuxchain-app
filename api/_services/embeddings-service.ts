import { GoogleGenAI } from '@google/genai';
import type { KnowledgeBaseContext } from '../types/index.js';

/**
 * Servicio de Embeddings para Vercel con Gemini API
 * Usa gemini-embedding-001 para búsqueda semántica de alta calidad
 */

// ============================================================================
// TYPES
// ============================================================================

interface Document {
  content: string;
  metadata?: {
    type?: string;
    topic?: string;
    [key: string]: unknown;
  };
}

interface SearchResult {
  content: string;
  metadata?: Document['metadata'];
  score: number;
  embeddingScore?: number;
  bm25Score?: number;
  boost: number;
  fromCache?: boolean;
}

interface EmbeddingCacheEntry {
  embedding: number[];
  timestamp: number;
}

interface SearchOptions {
  threshold?: number;
  limit?: number;
  [key: string]: unknown;
}

interface PrecomputeResult {
  precomputed: number;
  skipped?: number;
  failed?: number;
  total?: number;
  error?: string;
}

interface ContextResult extends KnowledgeBaseContext {
  documentsFound: number;
  topScore?: number;
  usedEmbeddings: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Stopwords en ES/EN
const STOPWORDS = new Set([
  // Español
  'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar', 'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar', 'algo', 'solo', 'aquí', 'hola',
  // Inglés
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having', 'may', 'hello', 'hi'
]);

// Sinónimos multilingües
const SYNONYMS: Record<string, string[]> = {
  // Español
  'caracteristicas': ['features', 'funciones', 'capacidades', 'servicios', 'funcionalidades'],
  'marketplace_es': ['mercado', 'tienda', 'market', 'comercio'],
  'nft': ['nfts', 'token', 'coleccionable', 'coleccionables'],
  'staking_es': ['stake', 'apostar', 'depositar', 'bloquear'],
  'recompensa': ['recompensas', 'reward', 'rewards', 'premio', 'premios', 'roi', 'apy', 'tasa', 'tasa de rendimiento'],
  'apy_es': ['roi', 'rendimiento', 'tasa', 'porcentaje', 'recompensa', 'reward', 'rate', 'annual percentage yield'],
  'base': ['basica', 'fundamental', 'inicial', 'estandar', 'basic', 'standard'],
  'pool': ['pools', 'fondo', 'fondos'],
  'contrato': ['smart contract', 'contract', 'contratos'],
  'wallet_es': ['billetera', 'monedero', 'cartera'],
  'blockchain': ['cadena', 'red', 'network'],
  
  // Inglés
  'features': ['caracteristicas', 'funciones', 'capabilities', 'functions'],
  'marketplace': ['market', 'tienda', 'store', 'commerce'],
  'staking': ['stake', 'lock', 'deposit'],
  'reward': ['recompensa', 'premio', 'incentive', 'roi', 'apy', 'rate'],
  'apy': ['roi', 'rate', 'yield', 'percentage', 'recompensa', 'tasa'],
  'contract': ['contrato', 'smart contract'],
  'wallet': ['billetera', 'monedero']
};

// Pesos para términos clave (boost)
const KEYWORD_BOOST: Record<string, number> = {
  'nuxchain': 2.5,
  'staking': 2.0,
  'marketplace': 2.0,
  'nft': 2.0,
  'apy': 2.2,
  'roi': 2.2,
  'tasa': 2.0,
  'performance': 2.0,
  'rewards': 1.8,
  'caracteristicas': 1.8,
  'features': 1.8,
  'funcionalidad': 1.8,
  'pol': 1.8,
  'polygon': 1.8,
  'contract': 1.5,
  'contrato': 1.5,
  'reward': 1.5,
  'platform': 1.5,
  'decentralized': 1.6,
  'ecosystem': 1.6,
  'blockchain': 1.6,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string, expandSynonyms = false): string[] {
  const normalized = normalizeText(text);
  let tokens = normalized
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
  
  // Verificar que términos clave no se pierdan
  const keywordsToKeep = ['caracteristicas', 'funcionalidades', 'features', 'capacidades', 'servicios'];
  const normalizedKeywords = keywordsToKeep.map(k => normalizeText(k));
  
  const textTokens = normalized.split(/\s+/);
  normalizedKeywords.forEach(keyword => {
    if (textTokens.includes(keyword) && !tokens.includes(keyword)) {
      tokens.push(keyword);
    }
  });
  
  // Expandir sinónimos para queries
  if (expandSynonyms) {
    const expanded = new Set(tokens);
    for (const token of tokens) {
      if (SYNONYMS[token]) {
        SYNONYMS[token].forEach(syn => {
          const synNorm = normalizeText(syn);
          if (synNorm && synNorm.length > 2) expanded.add(synNorm);
        });
      }
    }
    tokens = Array.from(expanded);
  }
  
  return tokens;
}

function extractBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigrams;
}

function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const total = tokens.length;
  
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  
  for (const [token, count] of tf) {
    const boost = KEYWORD_BOOST[token] || 1.0;
    tf.set(token, (count / total) * boost);
  }
  
  return tf;
}

// ============================================================================
// IDF CACHE
// ============================================================================

let idfCache: Map<string, number> | null = null;
let lastKnowledgeBaseLength = 0;

function calculateIDF(documents: Document[]): Map<string, number> {
  if (idfCache && documents.length === lastKnowledgeBaseLength) {
    return idfCache;
  }
  
  const idf = new Map<string, number>();
  const numDocs = documents.length;
  
  const docFreq = new Map<string, number>();
  for (const doc of documents) {
    const tokens = tokenize(doc.content);
    const bigrams = extractBigrams(tokens);
    const allTerms = new Set([...tokens, ...bigrams]);
    
    for (const token of allTerms) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }
  
  for (const [token, freq] of docFreq) {
    idf.set(token, Math.log((numDocs + 1) / (freq + 1)) + 1.5);
  }
  
  idfCache = idf;
  lastKnowledgeBaseLength = numDocs;
  
  console.log(`💾 IDF cache updated: ${idf.size} unique terms`);
  
  return idf;
}

// ============================================================================
// BM25 ALGORITHM
// ============================================================================

function bm25Score(
  queryTokens: string[], 
  docTokens: string[], 
  idf: Map<string, number>, 
  avgDocLength: number, 
  k1 = 1.5, 
  b = 0.75
): number {
  const docLength = docTokens.length;
  const docTF = calculateTF(docTokens);
  
  let score = 0;
  
  for (const term of new Set(queryTokens)) {
    const idfValue = idf.get(term) || 0;
    const termFreq = docTF.get(term) || 0;
    
    if (termFreq === 0) continue;
    
    const numerator = termFreq * (k1 + 1);
    const denominator = termFreq + k1 * (1 - b + b * (docLength / avgDocLength));
    
    score += idfValue * (numerator / denominator);
  }
  
  return score;
}

function normalizeBM25(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.min(1.0, score / maxScore);
}

// ============================================================================
// SEMANTIC BOOST
// ============================================================================

function applySemanticBoost(doc: Document, query: string, baseScore: number): number {
  let boostScore = 0;
  const docLower = doc.content.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Boost 1: Match exacto de frase completa (+0.3)
  if (docLower.includes(queryLower)) {
    boostScore += 0.3;
  }
  
  // Boost 2: Términos clave del dominio (+0.15 cada uno)
  const domainTerms = ['nuxchain', 'staking', 'marketplace', 'nft', 'polygon', 'pol', 'nuxbee', 'chat', 'ecosystem', 'blockchain'];
  const queryTerms = queryLower.split(/\s+/);
  const matchedDomainTerms = domainTerms.filter(term => 
    docLower.includes(term) && queryTerms.some(qt => qt.includes(term) || term.includes(qt))
  );
  boostScore += matchedDomainTerms.length * 0.15;
  
  // Boost 3: Match de NÚMEROS específicos (+0.25)
  const numberPattern = /\b(\d+(\.\d+)?)\b/g;
  const queryNumbers = (queryLower.match(numberPattern) || []).map(n => parseFloat(n));
  const docNumbers = (docLower.match(numberPattern) || []).map(n => parseFloat(n));
  
  for (const qNum of queryNumbers) {
    if (docNumbers.some(dNum => Math.abs(dNum - qNum) < 0.01)) {
      boostScore += 0.25;
    }
  }
  
  // Boost 4: Match de PORCENTAJES y APY/ROI (+0.20)
  const financeTerms = ['apy', 'roi', '%', 'percent', 'porcentaje', 'tasa', 'rate', 'rendimiento'];
  const hasFinanceQuery = financeTerms.some(term => queryLower.includes(term));
  const hasFinanceDoc = financeTerms.some(term => docLower.includes(term));
  if (hasFinanceQuery && hasFinanceDoc) {
    boostScore += 0.20;
  }
  
  // Boost 5: Match de LÍMITES (min/max) (+0.20)
  const limitTerms = ['minimo', 'mínimo', 'minimum', 'min', 'maximo', 'máximo', 'maximum', 'max', 'limite', 'limit'];
  const hasLimitQuery = limitTerms.some(term => queryLower.includes(term));
  const hasLimitDoc = limitTerms.some(term => docLower.includes(term));
  if (hasLimitQuery && hasLimitDoc) {
    boostScore += 0.20;
  }
  
  // Boost 6: Densidad de información
  const uniqueTerms = new Set(tokenize(doc.content));
  const totalWords = doc.content.split(/\s+/).length;
  const density = totalWords > 0 ? uniqueTerms.size / totalWords : 0;
  boostScore += Math.min(0.15, density * 0.3);
  
  // Boost 7: Keywords con KEYWORD_BOOST
  const docTokens = tokenize(doc.content);
  let keywordBoostScore = 0;
  for (const token of docTokens) {
    if (KEYWORD_BOOST[token] && queryTerms.includes(token)) {
      keywordBoostScore += (KEYWORD_BOOST[token] - 1) * 0.1;
    }
  }
  boostScore += Math.min(0.20, keywordBoostScore);
  
  return Math.min(1.0, baseScore + boostScore);
}

// ============================================================================
// EMBEDDINGS
// ============================================================================

const embeddingsCache = new Map<string, EmbeddingCacheEntry>();
const precomputedEmbeddings = new Map<string, number[]>();
const CACHE_TTL = 3600000; // 1 hora

let embeddingCallCount = 0;
let lastResetTime = Date.now();
const EMBEDDING_RATE_LIMIT = {
  maxCallsPerMinute: 50,
  resetIntervalMs: 60000
};

function checkEmbeddingRateLimit(): boolean {
  const now = Date.now();
  
  if (now - lastResetTime > EMBEDDING_RATE_LIMIT.resetIntervalMs) {
    embeddingCallCount = 0;
    lastResetTime = now;
  }
  
  if (embeddingCallCount >= EMBEDDING_RATE_LIMIT.maxCallsPerMinute) {
    console.warn(`⚠️ Embedding rate limit reached (${embeddingCallCount}/${EMBEDDING_RATE_LIMIT.maxCallsPerMinute}) - switching to BM25`);
    return false;
  }
  
  return true;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    if (!(generateEmbedding as unknown as { _warningShown?: boolean })._warningShown) {
      console.warn('⚠️ GEMINI_API_KEY not configured - using BM25 fallback');
      console.warn('💡 Configure GEMINI_API_KEY in .env for better semantic search');
      (generateEmbedding as unknown as { _warningShown: boolean })._warningShown = true;
    }
    return null;
  }
  
  if (!checkEmbeddingRateLimit()) {
    return null;
  }
  
  const cacheKey = text.substring(0, 100);
  const cached = embeddingsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.embedding;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;
    
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: truncatedText
    });
    
    const embedding = (response as { embeddings?: Array<{ values: number[] }>; embedding?: { values: number[] } }).embeddings?.[0]?.values || 
                     (response as { embedding?: { values: number[] } }).embedding?.values;
    
    if (!embedding || !Array.isArray(embedding)) {
      console.error('❌ Invalid embedding response:', response);
      return null;
    }
    
    embeddingCallCount++;
    
    embeddingsCache.set(cacheKey, {
      embedding,
      timestamp: Date.now()
    });
    
    console.log(`✅ Generated embedding: ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    const err = error as Error & { message?: string };
    
    if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      if (!(generateEmbedding as unknown as { _quotaWarningShown?: boolean })._quotaWarningShown) {
        console.error('❌ Gemini Embeddings quota exceeded');
        console.warn('⚠️ Switching to BM25 fallback for all future requests');
        console.warn('💡 To use embeddings: upgrade to paid tier at https://aistudio.google.com/apikey');
        (generateEmbedding as unknown as { _quotaWarningShown: boolean })._quotaWarningShown = true;
      }
      embeddingCallCount = EMBEDDING_RATE_LIMIT.maxCallsPerMinute;
      return null;
    }
    
    if (err.message?.includes('API key not valid')) {
      console.error('❌ Invalid GEMINI_API_KEY - Check your .env file');
      console.error('💡 Get a valid key from: https://aistudio.google.com/apikey');
    } else {
      console.error('❌ Error generating embedding:', err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
    }
    return null;
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

export async function searchSimilar(
  indexName: string, 
  query: string, 
  limit = 5, 
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js') as { knowledgeBase: Document[] };
    
    if (!knowledgeBase || knowledgeBase.length === 0) {
      console.warn('⚠️ Knowledge base is empty');
      return [];
    }
    
    console.log(`🔍 Searching with gemini-embedding-001 for: "${query.substring(0, 50)}..."`);
    
    const queryEmbedding = await generateEmbedding(query);
    
    if (queryEmbedding) {
      console.log('✅ Using Gemini embeddings for search');
      
      const embeddingPromises = knowledgeBase.map(async (doc) => {
        const cacheKey = doc.content.substring(0, 100);
        const cached = precomputedEmbeddings.get(cacheKey);
        
        if (cached) {
          return { doc, embedding: cached, fromCache: true };
        }
        
        const docEmbedding = await generateEmbedding(doc.content);
        
        if (docEmbedding) {
          precomputedEmbeddings.set(cacheKey, docEmbedding);
        }
        
        return { doc, embedding: docEmbedding, fromCache: false };
      });
      
      const BATCH_SIZE = 10;
      const results: SearchResult[] = [];
      
      for (let i = 0; i < embeddingPromises.length; i += BATCH_SIZE) {
        const batch = embeddingPromises.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(batch);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled' && result.value.embedding) {
            const { doc, embedding, fromCache } = result.value;
            const similarity = cosineSimilarity(queryEmbedding, embedding);
            const boostedScore = applySemanticBoost(doc, query, similarity);
            
            results.push({
              content: doc.content,
              metadata: doc.metadata,
              score: boostedScore,
              embeddingScore: similarity,
              boost: boostedScore - similarity,
              fromCache
            });
            
            console.log(`${fromCache ? '💾' : '✅'} Processed: ${doc.metadata?.topic || 'unknown'} (${similarity.toFixed(3)})`);
          }
        }
        
        if (!checkEmbeddingRateLimit()) {
          console.warn('⚠️ Rate limit reached during batch processing, using partial results');
          break;
        }
      }
      
      if (results.length >= 3) {
        results.sort((a, b) => b.score - a.score);
        
        const threshold = options.threshold || 0.15;
        const filtered = results
          .filter(r => r.score >= threshold)
          .slice(0, limit);
        
        const cacheHitRate = results.filter(r => r.fromCache).length / results.length;
        console.log(`📚 Found ${filtered.length} documents with embeddings (threshold: ${threshold})`);
        console.log(`💾 Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);
        if (filtered.length > 0) {
          console.log(`🎯 Top scores: ${filtered.slice(0, 3).map(r => r.score.toFixed(3)).join(', ')}`);
        }
        
        return filtered;
      }
    }
    
    console.log('⚠️ Falling back to BM25 algorithm');
    
    const queryTokens = tokenize(query, true);
    const queryBigrams = extractBigrams(queryTokens);
    const allQueryTerms = [...queryTokens, ...queryBigrams];
    
    if (allQueryTerms.length === 0) {
      console.warn('⚠️ Query has no meaningful tokens');
      return [];
    }
    
    const idf = calculateIDF(knowledgeBase);
    const avgDocLength = knowledgeBase.reduce((sum, doc) => {
      return sum + tokenize(doc.content).length;
    }, 0) / knowledgeBase.length;
    
    const bm25Results = knowledgeBase.map(doc => {
      const docTokens = tokenize(doc.content);
      const docBigrams = extractBigrams(docTokens);
      const allDocTerms = [...docTokens, ...docBigrams];
      
      const rawScore = bm25Score(allQueryTerms, allDocTerms, idf, avgDocLength);
      
      return {
        doc,
        rawScore,
        docTokens: allDocTerms
      };
    });
    
    const maxRawScore = Math.max(...bm25Results.map(r => r.rawScore), 0.001);
    
    const results = bm25Results.map(({ doc, rawScore }) => {
      const normalizedScore = normalizeBM25(rawScore, maxRawScore);
      const finalScore = applySemanticBoost(doc, query, normalizedScore);
      
      return {
        content: doc.content,
        metadata: doc.metadata,
        score: finalScore,
        bm25Score: normalizedScore,
        boost: finalScore - normalizedScore
      };
    });
    
    results.sort((a, b) => b.score - a.score);
    
    const baseThreshold = options.threshold || 0.15;
    const maxScore = results[0]?.score || 0;
    const dynamicThreshold = maxScore < 0.5 
      ? Math.max(baseThreshold, maxScore * 0.6)
      : baseThreshold;
    
    const filtered = results
      .filter(r => r.score >= dynamicThreshold)
      .slice(0, limit);
    
    console.log(`📚 Found ${filtered.length} documents with BM25 (fallback mode)`);
    console.log(`🎯 Threshold: ${dynamicThreshold.toFixed(3)} | Top scores: ${filtered.slice(0, 3).map(r => r.score.toFixed(3)).join(', ')}`);
    
    return filtered;
  } catch (error) {
    console.error('❌ Error in searchSimilar:', error);
    return [];
  }
}

// ============================================================================
// PRECOMPUTE FUNCTIONS
// ============================================================================

async function batchEmbedMultipleTexts(texts: string[]): Promise<number[][] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const truncatedTexts = texts.map(text => 
      text.length > 8000 ? text.substring(0, 8000) : text
    );

    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: truncatedTexts
    });

    if ((response as { embeddings?: Array<{ values: number[] }> }).embeddings && 
        Array.isArray((response as { embeddings: Array<{ values: number[] }> }).embeddings)) {
      return (response as { embeddings: Array<{ values: number[] }> }).embeddings.map(e => e.values || e);
    }
    
    return null;
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 429 || err.status === 503) {
      return null;
    }
    return null;
  }
}

async function precomputeWithSmartBatching(knowledgeBase: Document[]): Promise<PrecomputeResult> {
  let precomputed = 0;
  let skipped = 0;
  let failed = 0;
  
  const BATCH_SIZE = 50;
  const BATCH_DELAY_BASE = 2000;
  
  for (let i = 0; i < knowledgeBase.length; i += BATCH_SIZE) {
    const batch = knowledgeBase.slice(i, i + BATCH_SIZE);
    
    const batchTexts = batch.map(doc => {
      const cacheKey = doc.content.substring(0, 100);
      if (precomputedEmbeddings.has(cacheKey)) {
        skipped++;
        return null;
      }
      return doc.content;
    }).filter((text): text is string => text !== null);
    
    if (batchTexts.length === 0) {
      continue;
    }
    
    const embeddings = await batchEmbedMultipleTexts(batchTexts);
    
    if (embeddings && embeddings.length === batchTexts.length) {
      let textIndex = 0;
      
      for (const doc of batch) {
        const cacheKey = doc.content.substring(0, 100);
        if (!precomputedEmbeddings.has(cacheKey)) {
          const embedding = embeddings[textIndex];
          if (embedding && Array.isArray(embedding)) {
            precomputedEmbeddings.set(cacheKey, embedding);
            precomputed++;
            textIndex++;
          }
        }
      }
      
      embeddingCallCount++;
      
      let delayMs = BATCH_DELAY_BASE;
      if (embeddingCallCount > 40) {
        delayMs = 4000;
      }
      if (embeddingCallCount > 45) {
        delayMs = 5000;
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } else {
      failed += batchTexts.length;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  return { precomputed, skipped, failed };
}

export async function precomputeKnowledgeBaseEmbeddings(): Promise<PrecomputeResult> {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js') as { knowledgeBase: Document[] };
    
    if (!process.env.GEMINI_API_KEY) {
      return { precomputed: 0 };
    }
    
    const { precomputed, skipped, failed } = await precomputeWithSmartBatching(knowledgeBase);
    
    const total = precomputed + (skipped || 0);
    const percentage = ((total / knowledgeBase.length) * 100).toFixed(1);
    
    console.log(`✅ Pre-computation done: ${total}/${knowledgeBase.length} (${percentage}%)`);
    if (failed && failed > 0) {
      console.log(`  ⚠️ ${failed} fallback to BM25`);
    }
    
    return { precomputed, skipped, failed, total: knowledgeBase.length };
  } catch (error) {
    const err = error as Error;
    console.error('Pre-computation error:', err.message);
    return { precomputed: 0, error: err.message };
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function getRelevantContext(query: string, options: SearchOptions = {}): Promise<ContextResult> {
  try {
    const limit = options.limit || 5;
    const threshold = options.threshold || 0.15;
    
    const results = await searchSimilar('knowledge_base', query, limit, {
      threshold,
      ...options
    });
    
    if (results.length === 0) {
      console.log(`ℹ️ No relevant context found (limit: ${limit}, threshold: ${threshold})`);
      return {
        context: '',
        score: 0,
        documentsFound: 0,
        usedEmbeddings: false
      };
    }
    
    const contextParts = results.map((r, i) => {
      const source = r.metadata?.type || 'general';
      const topic = r.metadata?.topic || '';
      const score = r.score.toFixed(3);
      return `[Source ${i + 1} - ${source}${topic ? ` - ${topic}` : ''} | Score: ${score}]:\n${r.content}`;
    });
    
    const context = contextParts.join('\n\n---\n\n');
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const usedEmbeddings = results.some(r => r.embeddingScore !== undefined);
    
    console.log(`✅ Context built from ${results.length} documents (${context.length} chars)`);
    console.log(`📊 Average score: ${avgScore.toFixed(3)} | Top score: ${results[0].score.toFixed(3)}`);
    console.log(`🔧 Method: ${usedEmbeddings ? 'Gemini Embeddings' : 'BM25 Fallback'}`);
    
    return {
      context,
      score: avgScore,
      documentsFound: results.length,
      topScore: results[0].score,
      usedEmbeddings
    };
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error getting relevant context:', err);
    return {
      context: '',
      score: 0,
      documentsFound: 0,
      error: err.message,
      usedEmbeddings: false
    };
  }
}

export async function initializeKnowledgeBaseForVercel(precompute = false): Promise<{
  fallbackMode: boolean;
  fallbackReason: string;
  documentsCount: number;
  embeddingModel: string;
  hasApiKey: boolean;
  precomputeStarted?: boolean;
}> {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js') as { knowledgeBase: Document[] };
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    
    console.log(`✅ Knowledge base loaded: ${knowledgeBase.length} documents`);
    console.log(`🔑 Gemini API Key: ${hasApiKey ? 'Available' : 'Missing'}`);
    console.log(`🤖 Embedding model: gemini-embedding-001`);
    
    if (!hasApiKey) {
      console.warn('⚠️ Running in fallback mode (BM25) - Configure GEMINI_API_KEY for better results');
    }
    
    if (precompute && hasApiKey) {
      precomputeKnowledgeBaseEmbeddings().catch(err => {
        console.error('Background precomputation error:', err.message);
      });
    }
    
    return {
      fallbackMode: !hasApiKey,
      fallbackReason: hasApiKey 
        ? 'Using gemini-embedding-001 for semantic search' 
        : 'GEMINI_API_KEY not configured - using BM25 fallback',
      documentsCount: knowledgeBase.length,
      embeddingModel: 'gemini-embedding-001',
      hasApiKey,
      precomputeStarted: precompute && hasApiKey
    };
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error initializing KB:', err);
    return {
      fallbackMode: true,
      fallbackReason: 'Error loading KB',
      documentsCount: 0,
      embeddingModel: 'gemini-embedding-001',
      hasApiKey: false
    };
  }
}
