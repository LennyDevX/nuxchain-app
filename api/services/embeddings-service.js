/**
 * Servicio de Embeddings para Vercel
 * Usa embeddings simulados + TF-IDF avanzado para igualar scores de producción
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
  'recompensa': ['recompensas', 'reward', 'rewards', 'premio', 'premios'],
  'pool': ['pools', 'fondo', 'fondos'],
  'contrato': ['smart contract', 'contract', 'contratos'],
  'wallet': ['billetera', 'monedero', 'cartera'],
  'blockchain': ['cadena', 'red', 'network'],
  
  // Inglés
  'features': ['caracteristicas', 'funciones', 'capabilities', 'functions'],
  'marketplace': ['market', 'tienda', 'store', 'commerce'],
  'staking': ['stake', 'lock', 'deposit'],
  'reward': ['recompensa', 'premio', 'incentive'],
  'contract': ['contrato', 'smart contract'],
  'wallet': ['billetera', 'monedero']
};

// Pesos para términos clave (boost)
const KEYWORD_BOOST = {
  'nuxchain': 2.5,
  'staking': 2.0,
  'marketplace': 2.0,
  'nft': 2.0,
  'caracteristicas': 1.8,
  'features': 1.8,
  'funcionalidad': 1.8,
  'pol': 1.8,
  'polygon': 1.8,
  'contract': 1.5,
  'contrato': 1.5,
  'reward': 1.5,
  'recompensa': 1.5
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

// BM25 Score - Superior para recuperación de texto
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

// Re-ranking con boost semántico
function applySemanticBoost(doc, query, baseScore) {
  let boostScore = 0;
  const docLower = doc.content.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Boost 1: Match exacto de frase completa (+0.3)
  if (docLower.includes(queryLower)) {
    boostScore += 0.3;
  }
  
  // Boost 2: Términos clave del dominio (+0.15 cada uno)
  const domainTerms = ['nuxchain', 'staking', 'marketplace', 'nft', 'polygon', 'pol'];
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

// Búsqueda de documentos similares
export async function searchSimilar(indexName, query, limit = 5, options = {}) {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js');
    
    if (!knowledgeBase || knowledgeBase.length === 0) {
      console.warn('⚠️ Knowledge base is empty');
      return [];
    }
    
    // Tokenizar query con expansión de sinónimos
    const queryTokens = tokenize(query, true);
    const queryBigrams = extractBigrams(queryTokens);
    const allQueryTerms = [...queryTokens, ...queryBigrams];
    
    if (allQueryTerms.length === 0) {
      console.warn('⚠️ Query has no meaningful tokens');
      return [];
    }
    
    console.log(`🔍 Query tokens (${queryTokens.length}): ${queryTokens.slice(0, 10).join(', ')}${queryTokens.length > 10 ? '...' : ''}`);
    console.log(`📊 Bigrams (${queryBigrams.length}): ${queryBigrams.slice(0, 5).join(', ')}${queryBigrams.length > 5 ? `... (${queryBigrams.length - 5} more)` : ''}`);
    
    // Calcular IDF para toda la colección
    const idf = calculateIDF(knowledgeBase);
    
    // Calcular longitud promedio de documentos para BM25
    const avgDocLength = knowledgeBase.reduce((sum, doc) => {
      return sum + tokenize(doc.content).length;
    }, 0) / knowledgeBase.length;
    
    console.log(`📏 Avg doc length: ${Math.round(avgDocLength)} tokens`);
    
    // Fase 1: Calcular BM25 scores
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
    
    // Encontrar max score para normalización
    const maxRawScore = Math.max(...bm25Results.map(r => r.rawScore), 0.001);
    
    // Fase 2: Normalizar y aplicar re-ranking semántico
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
    
    // Ordenar por score final
    results.sort((a, b) => b.score - a.score);
    
    // ✅ MEJORA: Threshold optimizado (aumentado de 0.20 a 0.25)
    const baseThreshold = options.threshold || 0.25;
    const maxScore = results[0]?.score || 0;
    
    // Threshold dinámico más restrictivo
    const dynamicThreshold = maxScore < 0.5 
      ? Math.max(baseThreshold, maxScore * 0.7) // Exigir 70% del max
      : baseThreshold;
    
    console.log(`🎯 BM25 algorithm | Threshold: ${dynamicThreshold.toFixed(3)} | Max score: ${maxScore.toFixed(3)}`);
    
    const filtered = results
      .filter(r => r.score >= dynamicThreshold)
      .slice(0, limit);
    
    console.log(`📚 Found ${filtered.length} relevant documents (threshold: ${dynamicThreshold.toFixed(3)})`);
    if (filtered.length > 0) {
      console.log(`🎯 Top scores: ${filtered.slice(0, 3).map(r => r.score.toFixed(3)).join(', ')}`);
      console.log(`🚀 Boost applied: ${filtered.slice(0, 3).map(r => (r.boost >= 0 ? '+' : '') + r.boost.toFixed(3)).join(', ')}`);
      
      // Estadísticas de calidad
      const highQuality = filtered.filter(r => r.score > 0.7).length;
      const mediumQuality = filtered.filter(r => r.score > 0.5 && r.score <= 0.7).length;
      console.log(`📊 Quality: ${highQuality} high (>0.7), ${mediumQuality} medium (0.5-0.7)`);
    }
    
    return filtered;
  } catch (error) {
    console.error('❌ Error in searchSimilar:', error);
    return [];
  }
}

// Obtener contexto relevante
export async function getRelevantContext(query, options = {}) {
  try {
    const results = await searchSimilar('knowledge_base', query, 5, {
      threshold: 0.25, // Optimizado de 0.20 a 0.25
      ...options
    });
    
    if (results.length === 0) {
      console.log('ℹ️ No relevant context found');
      return '';
    }
    
    // Construir contexto estructurado
    const contextParts = results.map((r, i) => {
      const source = r.metadata?.type || 'general';
      const topic = r.metadata?.topic || '';
      const score = r.score.toFixed(3);
      return `[Source ${i + 1} - ${source}${topic ? ` - ${topic}` : ''} | Score: ${score}]:\n${r.content}`;
    });
    
    const context = contextParts.join('\n\n---\n\n');
    
    console.log(`✅ Context built from ${results.length} documents (${context.length} chars)`);
    console.log(`📊 Average score: ${(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(3)}`);
    
    return context;
  } catch (error) {
    console.error('❌ Error getting relevant context:', error);
    return '';
  }
}

// Inicializar KB para Vercel (fallback sin embeddings reales)
export async function initializeKnowledgeBaseForVercel() {
  try {
    const { knowledgeBase } = await import('./knowledge-base.js');
    console.log(`✅ Knowledge base loaded: ${knowledgeBase.length} documents`);
    return {
      fallbackMode: true,
      fallbackReason: 'Using TF-IDF + Synonyms (Vercel optimized)',
      documentsCount: knowledgeBase.length
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