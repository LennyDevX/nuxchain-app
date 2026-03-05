import { GoogleGenAI } from '@google/genai';
import chatLogger from '../utils/chat-logger.js';

/**
 * Servicio de Embeddings para Vercel con Gemini API
 * Usa gemini-embedding-001 para búsqueda semántica de alta calidad
 */

// Stopwords en ES/EN
const STOPWORDS = new Set([
  // Español
  'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero', 'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar', 'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar', 'algo', 'solo', 'aquí', 'hola',
  // Inglés
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having', 'may', 'hello', 'hi'
]);

// Sinónimos multilingües
const SYNONYMS = {
  // Español
  'caracteristicas': ['features', 'funciones', 'capacidades', 'servicios', 'funcionalidades'],
  'marketplace': ['mercado', 'tienda', 'market', 'comercio'],
  'nft': ['nfts', 'token', 'coleccionable', 'coleccionables'],
  'staking': ['stake', 'apostar', 'depositar', 'bloquear'],
  'recompensa': ['recompensas', 'reward', 'rewards', 'premio', 'premios', 'roi', 'apy', 'tasa', 'tasa de rendimiento'],
  'apy': ['roi', 'rendimiento', 'tasa', 'porcentaje', 'recompensa', 'reward', 'rate', 'annual percentage yield'],
  'base': ['basica', 'fundamental', 'inicial', 'estandar', 'basic', 'standard'],
  'pool': ['pools', 'fondo', 'fondos'],
  'contrato': ['smart contract', 'contract', 'contratos'],
  'wallet': ['billetera', 'monedero', 'cartera'],
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
const KEYWORD_BOOST = {
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

// Normalizar texto
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tokenizar y expandir sinónimos
function tokenize(text, expandSynonyms = false) {
  const normalized = normalizeText(text);
  let tokens = normalized
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
  
  // ⚠️ AJUSTE: Verificar que términos clave no se pierdan
  const keywordsToKeep = ['caracteristicas', 'funcionalidades', 'features', 'capacidades', 'servicios'];
  const normalizedKeywords = keywordsToKeep.map(k => normalizeText(k));
  
  // Agregar keywords que se hayan perdido
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

// Extraer bigrams para mejor matching
function extractBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigrams;
}

// Calcular TF (Term Frequency)
function calculateTF(tokens) {
  const tf = new Map();
  const total = tokens.length;
  
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  
  for (const [token, count] of tf) {
    // Aplicar boost si es keyword
    const boost = KEYWORD_BOOST[token] || 1.0;
    tf.set(token, (count / total) * boost);
  }
  
  return tf;
}

// ✅ CACHE GLOBAL DE IDF
let idfCache = null;
let lastKnowledgeBaseLength = 0;

// Calcular IDF (Inverse Document Frequency)
function calculateIDF(documents) {
  // Cache hit: si la KB no cambió, reusar IDF
  if (idfCache && documents.length === lastKnowledgeBaseLength) {
    return idfCache;
  }
  
  const idf = new Map();
  const numDocs = documents.length;
  
  const docFreq = new Map();
  for (const doc of documents) {
    const tokens = tokenize(doc.content);
    const bigrams = extractBigrams(tokens);
    const allTerms = new Set([...tokens, ...bigrams]);
    
    for (const token of allTerms) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }
  
  for (const [token, freq] of docFreq) {
    // IDF mejorado con smoothing
    idf.set(token, Math.log((numDocs + 1) / (freq + 1)) + 1.5);
  }
  
  // Actualizar cache
  idfCache = idf;
  lastKnowledgeBaseLength = numDocs;
  
  console.log(`💾 IDF cache updated: ${idf.size} unique terms`);
  
  return idf;
}

// Similitud coseno con TF-IDF (legacy - para comparación)
function cosineSimilarityTFIDF(queryTokens, docTokens, idf) {
  const queryTF = calculateTF(queryTokens);
  const docTF = calculateTF(docTokens);
  
  const allTerms = new Set([...queryTokens, ...docTokens]);
  const queryVector = [];
  const docVector = [];
  
  for (const term of allTerms) {
    const idfValue = idf.get(term) || 1.0;
    queryVector.push((queryTF.get(term) || 0) * idfValue);
    docVector.push((docTF.get(term) || 0) * idfValue);
  }
  
  const dotProduct = queryVector.reduce((sum, a, i) => sum + a * docVector[i], 0);
  const magnitudeA = Math.sqrt(queryVector.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(docVector.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// ✅ BM25 Score - Configuración estándar y probada
// Formula: IDF(q) * (f(q,D) * (k1 + 1)) / (f(q,D) + k1 * (1 - b + b * |D|/avgDl))
function bm25Score(queryTokens, docTokens, idf, avgDocLength, k1 = 1.5, b = 0.75) {
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

// Normalizar BM25 score a rango [0, 1] similar a cosine similarity
function normalizeBM25(score, maxScore) {
  if (maxScore === 0) return 0;
  return Math.min(1.0, score / maxScore);
}

// ✅ Re-ranking con boost semántico - Configuración simple y funcional
function applySemanticBoost(doc, query, baseScore) {
  let boostScore = 0;
  const docLower = doc.content.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Boost 1: Match exacto de frase completa (+0.3)
  if (docLower.includes(queryLower)) {
    boostScore += 0.3;
  }
  
  // Boost 2: Términos clave del dominio (+0.15 cada uno)
  const domainTerms = ['nuxchain', 'staking', 'marketplace', 'nft', 'polygon', 'pol', 'nuxbee', 'airdrop', 'blockchain', 'ecosystem'];
  const queryTerms = queryLower.split(/\s+/);
  const matchedDomainTerms = domainTerms.filter(term => 
    docLower.includes(term) && queryTerms.some(qt => qt.includes(term) || term.includes(qt))
  );
  boostScore += matchedDomainTerms.length * 0.15;
  
  // Boost 3: Densidad de información (términos únicos / total)
  const uniqueTerms = new Set(tokenize(doc.content));
  const totalWords = doc.content.split(/\s+/).length;
  const density = totalWords > 0 ? uniqueTerms.size / totalWords : 0;
  boostScore += Math.min(0.2, density * 0.4);
  
  // Boost 4: Boost por términos con KEYWORD_BOOST
  const docTokens = tokenize(doc.content);
  let keywordBoostScore = 0;
  for (const token of docTokens) {
    if (KEYWORD_BOOST[token] && queryTerms.includes(token)) {
      keywordBoostScore += (KEYWORD_BOOST[token] - 1) * 0.1;
    }
  }
  boostScore += Math.min(0.25, keywordBoostScore);
  
  return Math.min(1.0, baseScore + boostScore);
}

// ✅ OPTIMIZADO: Cache de embeddings con gestión de memoria mejorada
const embeddingsCache = new Map();
const precomputedEmbeddings = new Map(); // ✅ Cache separado para embeddings pre-computados (KB docs)
const CACHE_TTL = 3600000; // 1 hora
const MAX_CACHE_SIZE = 500; // Máximo 500 embeddings en cache

// ✅ Función para limpiar cache antiguo y mantener límite
function cleanupEmbeddingsCache() {
  const now = Date.now();
  let cleanedCount = 0;
  
  // Eliminar entradas expiradas
  for (const [key, value] of embeddingsCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      embeddingsCache.delete(key);
      cleanedCount++;
    }
  }
  
  // Si sigue siendo muy grande, eliminar las más antiguas
  if (embeddingsCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(embeddingsCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = embeddingsCache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      embeddingsCache.delete(entries[i][0]);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned ${cleanedCount} old embeddings from cache (${embeddingsCache.size} remaining)`);
  }
}

// ✅ Limpieza automática cada 10 minutos
setInterval(cleanupEmbeddingsCache, 600000);

// ✅ Rate limiting para embeddings API
let embeddingCallCount = 0;
let lastResetTime = Date.now();
const EMBEDDING_RATE_LIMIT = {
  maxCallsPerMinute: 50, // Límite estándar de Google para tier gratuito
  resetIntervalMs: 60000
};

function checkEmbeddingRateLimit() {
  const now = Date.now();
  
  // Reset counter cada minuto
  if (now - lastResetTime > EMBEDDING_RATE_LIMIT.resetIntervalMs) {
    embeddingCallCount = 0;
    lastResetTime = now;
    checkEmbeddingRateLimit._warningShown = false;
  }
  
  if (embeddingCallCount >= EMBEDDING_RATE_LIMIT.maxCallsPerMinute) {
    if (!checkEmbeddingRateLimit._warningShown) {
      console.warn(`⚠️ Embedding rate limit reached (${embeddingCallCount}/${EMBEDDING_RATE_LIMIT.maxCallsPerMinute}) - switching to BM25`);
      checkEmbeddingRateLimit._warningShown = true;
    }
    return false;
  }
  
  return true;
}

// ✅ CORREGIDO: Usar GoogleGenAI correctamente según documentación oficial
async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    if (!generateEmbedding._warningShown) {
      console.warn('⚠️ GEMINI_API_KEY not configured - using BM25 fallback');
      console.warn('💡 Configure GEMINI_API_KEY in .env for better semantic search');
      generateEmbedding._warningShown = true;
    }
    return null;
  }
  
  // ✅ Verificar rate limit ANTES de hacer llamada
  if (!checkEmbeddingRateLimit()) {
    return null; // Fallback a BM25
  }
  
  // Cache hit
  const cacheKey = text.substring(0, 100);
  const cached = embeddingsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.embedding;
  }
  
  try {
    // ✅ CORREGIDO: Usar GoogleGenAI según documentación oficial
    const ai = new GoogleGenAI({ apiKey });
    
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;
    
    // ✅ IMPORTANTE: embedContent (NO embeddings.embedContent)
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: truncatedText
    });
    
    // ✅ CORREGIDO: Acceder correctamente a los embeddings
    const embedding = response.embeddings?.[0]?.values || response.embedding?.values;
    
    if (!embedding || !Array.isArray(embedding)) {
      console.error('❌ Invalid embedding response:', response);
      return null;
    }
    
    // ✅ Incrementar contador solo si fue exitoso
    embeddingCallCount++;
    
    // Cache result
    embeddingsCache.set(cacheKey, {
      embedding,
      timestamp: Date.now()
    });
    
    // ✅ Solo log en modo verbose (no en precomputation)
    if (!generateEmbedding._silentMode) {
      console.log(`✅ Generated embedding: ${embedding.length} dimensions`);
    }
    return embedding;
  } catch (error) {
    // ✅ MEJORADO: Detectar error de cuota y cambiar a BM25 automáticamente
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      if (!generateEmbedding._quotaWarningShown) {
        console.warn('⚠️  Embeddings quota exceeded - Using BM25 fallback');
        generateEmbedding._quotaWarningShown = true;
      }
      // Marcar rate limit como alcanzado para evitar más llamadas
      embeddingCallCount = EMBEDDING_RATE_LIMIT.maxCallsPerMinute;
      return null;
    }
    
    if (error.message?.includes('API key not valid')) {
      console.error('❌ Invalid GEMINI_API_KEY');
    } else if (error.status === 503) {
      // Silenciar errores 503 (overloaded) en la precomputation en background
      if (process.env.NODE_ENV === 'development') {
        // Solo en dev, mostrar mensaje silenciosamente
      }
    } else {
      console.error('❌ Embedding error:', error.message);
    }
    return null;
  }
}

// ✅ NUEVO: Similitud coseno entre embeddings
function cosineSimilarity(vecA, vecB) {
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

// ✅ MEJORADO: Búsqueda híbrida (Embeddings + BM25 fallback)
export async function searchSimilar(indexName, query, limit = 5, options = {}) {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js');
    
    if (!knowledgeBase || knowledgeBase.length === 0) {
      console.warn('⚠️ Knowledge base is empty');
      return [];
    }
    
    console.log(`🔍 Searching with gemini-embedding-001 for: "${query.substring(0, 50)}..."`);
    
    // Intentar búsqueda con embeddings reales
    const queryEmbedding = await generateEmbedding(query);
    
    if (queryEmbedding) {
      console.log('✅ Using Gemini embeddings for search');
      
      // ✅ OPTIMIZACIÓN: Batch embeddings con Promise.allSettled para no fallar todo
      const embeddingPromises = knowledgeBase.map(async (doc) => {
        // Verificar cache primero
        const cacheKey = doc.content.substring(0, 100);
        const cached = precomputedEmbeddings.get(cacheKey);
        
        if (cached) {
          return { doc, embedding: cached, fromCache: true };
        }
        
        // Generar nuevo embedding
        const docEmbedding = await generateEmbedding(doc.content);
        
        if (docEmbedding) {
          // Guardar en cache persistente
          precomputedEmbeddings.set(cacheKey, docEmbedding);
        }
        
        return { doc, embedding: docEmbedding, fromCache: false };
      });
      
      // ✅ NUEVO: Ejecutar en paralelo pero con límite
      const BATCH_SIZE = 10; // Procesar 10 documentos a la vez
      const results = [];
      
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
            
            // ✅ Solo log para non-cached items y solo en verbose mode
            if (!fromCache && !searchSimilar._silentMode) {
              console.log(`✅ Processed: ${doc.metadata?.topic || 'unknown'} (${similarity.toFixed(3)})`);
            }
          }
        }
        
        // Si alcanzamos rate limit, salir del loop
        if (!checkEmbeddingRateLimit()) {
          if (!searchSimilar._rateLimitWarningShown) {
            console.warn('⚠️ Rate limit reached during batch processing, using partial results');
            searchSimilar._rateLimitWarningShown = true;
          }
          break;
        }
      }
      
      // Si tenemos suficientes resultados con embeddings, usarlos
      if (results.length >= 3) {
        results.sort((a, b) => b.score - a.score);
        
        // ✅ Threshold simple y funcional (Google recomienda valores permisivos para RAG)
        const threshold = options.threshold || 0.25;
        const filtered = results
          .filter(r => r.score >= threshold)
          .slice(0, limit);
        
        const cacheHitRate = results.filter(r => r.fromCache).length / results.length;
        console.log(`📚 Found ${filtered.length} documents with embeddings (threshold: ${threshold.toFixed(2)})`);
        console.log(`💾 Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);
        if (filtered.length > 0) {
          console.log(`🎯 Top scores: ${filtered.slice(0, 3).map(r => r.score.toFixed(3)).join(', ')}`);
        }
        
        return filtered;
      }
    }
    
    // Fallback a BM25 si embeddings fallan o no hay suficientes resultados
    console.log('⚠️ Falling back to BM25 algorithm');
    
    // Tokenizar query con expansión de sinónimos
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
    
    const results = bm25Results.map(({ doc, rawScore, docTokens }) => {
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
    
    const baseThreshold = options.threshold || 0.25;
    const maxScore = results[0]?.score || 0;
    const dynamicThreshold = maxScore < 0.5 
      ? Math.max(baseThreshold, maxScore * 0.7)
      : baseThreshold;
    
    const filtered = results
      .filter(r => r.score >= dynamicThreshold)
      .slice(0, limit);
    
    console.log(`📚 Found ${filtered.length} documents with BM25 (fallback mode)`);
    
    return filtered;
  } catch (error) {
    console.error('❌ Error in searchSimilar:', error);
    return [];
  }
}

// ✅ BATCH API OPTIMIZATION: Enhanced pre-compute strategy
// Strategy: Batch 50 docs into single embedContent call + intelligent delays
async function batchEmbedMultipleTexts(texts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Truncate long texts
    const truncatedTexts = texts.map(text => 
      text.length > 8000 ? text.substring(0, 8000) : text
    );

    // embedContent accepts multiple contents
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: truncatedTexts
    });

    // Return array of embeddings
    if (response.embeddings && Array.isArray(response.embeddings)) {
      return response.embeddings.map(e => e.values || e);
    }
    
    return null;
  } catch (error) {
    if (error.status === 429 || error.status === 503) {
      // Rate limit or overload - return null to trigger fallback
      return null;
    }
    console.error('Batch embedding error:', error.message);
    return null;
  }
}

// ✅ SMART BATCHING with adaptive delays
async function precomputeWithSmartBatching(knowledgeBase) {
  let precomputed = 0;
  let skipped = 0;
  let failed = 0;
  
  // ✅ STRATEGY: Batch 40-50 docs per API call (not individual requests)
  // This respects the batch quota much better than individual calls
  const BATCH_SIZE = 50; // Embed 50 docs per single API call
  const BATCH_DELAY_BASE = 2000; // 2 seconds between batches (safe margin)
  const totalBatches = Math.ceil(knowledgeBase.length / BATCH_SIZE);
  
  console.log(`📦 Pre-computing with batch strategy: ${totalBatches} batches of ${BATCH_SIZE} docs`);
  
  for (let i = 0; i < knowledgeBase.length; i += BATCH_SIZE) {
    const batch = knowledgeBase.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    // Collect all texts in batch
    const batchTexts = batch.map(doc => {
      const cacheKey = doc.content.substring(0, 100);
      if (precomputedEmbeddings.has(cacheKey)) {
        skipped++;
        return null; // Skip already cached
      }
      return doc.content;
    }).filter(Boolean);
    
    if (batchTexts.length === 0) {
      /* Progress logs silenced for cleaner terminal 
      if (batchNum % 5 === 0 || batchNum === totalBatches) {
        const percentage = ((batchNum / totalBatches) * 100).toFixed(0);
        console.log(`  Progress: ${percentage}% | ✅ ${precomputed} | ⏭️ ${skipped} | ❌ ${failed}`);
      }
      */
      continue;
    }
    
    // Process entire batch with single API call
    const embeddings = await batchEmbedMultipleTexts(batchTexts);
    
    if (embeddings && embeddings.length === batchTexts.length) {
      // Success: cache all embeddings from this batch
      let batchPrecomputed = 0;
      let textIndex = 0;
      
      for (const doc of batch) {
        const cacheKey = doc.content.substring(0, 100);
        if (!precomputedEmbeddings.has(cacheKey)) {
          // Find corresponding embedding (account for skipped cached docs)
          const embedding = embeddings[textIndex];
          if (embedding && Array.isArray(embedding)) {
            precomputedEmbeddings.set(cacheKey, embedding);
            batchPrecomputed++;
            textIndex++;
          }
        }
      }
      
      precomputed += batchPrecomputed;
      embeddingCallCount++; // Count as one API call
      
      // Adaptive delay: if rate limit approaching, increase delay
      let delayMs = 3000;
      if (embeddingCallCount > 40) delayMs = 4000;
      if (embeddingCallCount > 45) delayMs = 5000;
      
      /* Log progress silenced for cleaner terminal
      if (batchNum % 5 === 0 || batchNum === totalBatches) {
        const percentage = ((batchNum / totalBatches) * 100).toFixed(0);
        console.log(`  Progress: ${percentage}% | ✅ ${precomputed} | ⏭️ ${skipped} | ❌ ${failed} | 📊 API calls: ${embeddingCallCount}/45`);
      }
      */
      
      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } else {
      // Batch failed: mark all as failed and use BM25 fallback
      failed += batchTexts.length;
      
      if (batchNum % 5 === 0 || batchNum === totalBatches) {
        const percentage = ((batchNum / totalBatches) * 100).toFixed(0);
        console.log(`  Progress: ${percentage}% | ✅ ${precomputed} | ⏭️ ${skipped} | ❌ ${failed} (batch failed)`);
      }
      
      // Longer delay after failure
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  return { precomputed, skipped, failed };
}

export async function precomputeKnowledgeBaseEmbeddings() {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js');
    
    if (!process.env.GEMINI_API_KEY) {
      return { precomputed: 0 };
    }
    
    console.log('🔄 Pre-computing embeddings in background (using batch API)...');
    
    // ✅ Enable silent mode to avoid log spam
    generateEmbedding._silentMode = true;
    
    // Use optimized smart batching strategy
    const { precomputed, skipped, failed } = await precomputeWithSmartBatching(knowledgeBase);
    
    // ✅ Disable silent mode
    generateEmbedding._silentMode = false;
    
    const total = precomputed + skipped;
    const percentage = ((total / knowledgeBase.length) * 100).toFixed(1);
    
    console.log(`✅ Pre-computation done: ${total}/${knowledgeBase.length} (${percentage}%)`);
    if (failed > 0) {
      console.log(`  ⚠️ ${failed} fallback to BM25`);
    }
    
    return { precomputed, skipped, failed, total: knowledgeBase.length };
  } catch (error) {
    generateEmbedding._silentMode = false;
    console.error('Pre-computation error:', error.message);
    return { precomputed: 0, error: error.message };
  }
}

// ✅ Obtener contexto relevante - Configuración simple y funcional
export async function getRelevantContext(query, options = {}) {
  try {
    // ✅ SIMPLIFICADO: Límite fijo de 5 documentos (recomendación de Google para RAG)
    const limit = options.limit || 5;
    
    // ✅ SIMPLIFICADO: Threshold fijo de 0.25 (permisivo para encontrar contexto relevante)
    const threshold = options.threshold || 0.25;
    
    const results = await searchSimilar('knowledge_base', query, limit, {
      threshold,
      ...options
    });
    
    if (results.length === 0) {
      return {
        context: '',
        score: 0,
        documentsFound: 0,
        usedEmbeddings: false
      };
    }
    
    // Construir contexto estructurado
    const contextParts = results.map((r, i) => {
      const source = r.metadata?.type || 'general';
      const topic = r.metadata?.topic || '';
      const score = r.score.toFixed(3);
      return `[Source ${i + 1} - ${source}${topic ? ` - ${topic}` : ''} | Score: ${score}]:\n${r.content}`;
    });
    
    const context = contextParts.join('\n\n---\n\n');
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    // ✅ Detectar si se usaron embeddings o BM25
    const usedEmbeddings = results.some(r => r.embeddingScore !== undefined);
    
    // Log using professional chat logger
    chatLogger.logKBSearch(query, results);
    
    return {
      context,
      score: avgScore,
      documentsFound: results.length,
      topScore: results[0].score,
      usedEmbeddings
    };
  } catch (error) {
    chatLogger.logError(error, 'Knowledge Base Search');
    return {
      context: '',
      score: 0,
      documentsFound: 0,
      error: error.message,
      usedEmbeddings: false
    };
  }
}

// Inicializar KB para Vercel con pre-computación opcional
export async function initializeKnowledgeBaseForVercel(precompute = false) {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js');
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    
    console.log(`✅ Knowledge base loaded: ${knowledgeBase.length} documents`);
    console.log(`🔑 Gemini API Key: ${hasApiKey ? 'Available' : 'Missing'}`);
    console.log(`🤖 Embedding model: gemini-embedding-001`);
    
    if (!hasApiKey) {
      console.warn('⚠️ Running in fallback mode (BM25) - Configure GEMINI_API_KEY for better results');
    }
    
    // ✅ NUEVO: Pre-computar embeddings en background si se solicita
    if (precompute && hasApiKey) {
      // No await - ejecutar en background
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
    console.error('❌ Error initializing KB:', error);
    return {
      fallbackMode: true,
      fallbackReason: 'Error loading KB',
      documentsCount: 0
    };
  }
}

// ✅ Export default para compatibilidad con servidor Express
export default {
  searchSimilar,
  getRelevantContext,
  initializeKnowledgeBaseForVercel,
  precomputeKnowledgeBaseEmbeddings
};