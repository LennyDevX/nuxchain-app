/**
 * Language Detection Middleware
 * Hybrid approach: Pattern analysis + Keywords + Probabilistic detection
 */

/**
 * Spanish language patterns and indicators
 */
const SPANISH_PATTERNS = {
  // Diacritics and special characters
  diacritics: /[áéíóúñü¿¡]/i,
  
  // Common Spanish words (high frequency)
  commonWords: /\b(qué|cuál|cómo|dónde|cuándo|cuánto|por qué|el|la|los|las|de|del|un|una|es|está|son|están|para|con|sin|sobre|entre|según|desde|hasta|también|muy|más|menos|así|sí|no|yo|tú|él|ella|nosotros|ustedes|ellos|si|pero|aunque|porque|cuando|donde|mientras|después|antes|siempre|nunca|ahora|aquí|allí)\b/gi,
  
  // Spanish verbs (present tense)
  verbs: /\b(tengo|tienes|tiene|hacen|hace|puedo|puede|quiero|quiere|voy|va|soy|eres|somos|están|estoy|estás|digo|dice|veo|ves|vemos|entiendo|entiendes|necesito|necesitas)\b/gi,
  
  // Spanish question words
  questionWords: /\b(qué|cuál|cuáles|cómo|dónde|cuándo|cuánto|cuántos|cuánta|cuántas|quién|quiénes|por qué)\b/gi,
  
  // Spanish prepositions
  prepositions: /\b(desde|hasta|hacia|mediante|según|durante|contra|entre)\b/gi
};

/**
 * English language patterns and indicators
 */
const ENGLISH_PATTERNS = {
  // Common English words (high frequency)
  commonWords: /\b(the|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|what|which|when|where|why|how|who|whom|whose|this|that|these|those|am|an|and|or|but|if|because|as|while|for|with|from|by|at|in|on|to|of|about|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|all|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|yes|you|your|yours|he|she|it|we|they|them|their|his|her|its|our)\b/gi,
  
  // English verbs (present tense)
  verbs: /\b(have|has|do|does|get|gets|make|makes|know|knows|think|thinks|take|takes|see|sees|come|comes|want|wants|use|uses|find|finds|give|gives|tell|tells|work|works|call|calls|try|tries|need|needs|feel|feels|become|becomes|leave|leaves|put|puts|mean|means|keep|keeps|let|lets|begin|begins|seem|seems|help|helps|show|shows|hear|hears|play|plays|run|runs|move|moves|live|lives|believe|believes|bring|brings|happen|happens|write|writes|sit|sits|stand|stands|lose|loses|pay|pays|meet|meets|include|includes|continue|continues|set|sets|learn|learns|change|changes|lead|leads|understand|understands|watch|watches|follow|follows|stop|stops|create|creates|speak|speaks|read|reads|spend|spends|grow|grows|open|opens|walk|walks|win|wins|teach|teaches|offer|offers|remember|remembers|consider|considers|appear|appears|buy|buys|serve|serves|die|dies|send|sends|expect|expects|build|builds|stay|stays|fall|falls|cut|cuts|reach|reaches|kill|kills|raise|raises|pass|passes|sell|sells|decide|decides|return|returns|explain|explains|hope|hopes|develop|develops|carry|carries|break|breaks|receive|receives|agree|agrees|support|supports|hit|hits|produce|produces|eat|eats|cover|covers|catch|catches|draw|draws|choose|chooses|cause|causes|point|points|pull|pulls|accept|accepts|wear|wears|suggest|suggests|wait|waits|require|requires|lay|lays|avoid|avoids|represent|represents|rise|rises|apply|applies|prepare|prepares|hold|holds|maintain|maintains|indicate|indicates|claim|claims|improve|improves)\b/gi,
  
  // English question words
  questionWords: /\b(what|which|when|where|why|how|who|whom|whose)\b/gi,
  
  // English articles and determiners
  articles: /\b(the|a|an|this|that|these|those)\b/gi,
  
  // Contractions (unique to English)
  contractions: /\b(I'm|I'll|I've|you're|you'll|you've|he's|she's|it's|we're|we'll|we've|they're|they'll|they've|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|couldn't|shouldn't|can't|cannot|mustn't|mightn't|shan't)\b/gi
};

/**
 * Blockchain and crypto terms (context-aware detection)
 */
const BLOCKCHAIN_TERMS = {
  spanish: /\b(blockchain|cadena de bloques|criptomoneda|moneda digital|billetera|cartera|minería|minado|consenso|descentralizado|token|ficha|staking|apostar|validador|nodo|red|transacción|bloque|contrato inteligente|dapp|aplicación descentralizada|airdrop|lanzamiento aéreo|preventa|preventivo|recompensa|rendimiento|apr|apy|tasa|porcentaje)\b/gi,
  english: /\b(blockchain|cryptocurrency|crypto|wallet|mining|consensus|decentralized|token|staking|stake|validator|node|network|transaction|block|smart contract|dapp|decentralized application|airdrop|presale|reward|yield|apr|apy|rate|percentage)\b/gi
};

/**
 * Analyze patterns in text
 * @param {string} text - Text to analyze
 * @param {Object} patterns - Pattern object to match against
 * @returns {number} - Score between 0 and 1
 */
function analyzePatterns(text, patterns) {
  if (!text || typeof text !== 'string') return 0;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  const weights = {
    diacritics: 3,      // Very strong indicator for Spanish
    commonWords: 2,     // Strong indicator
    verbs: 1.5,         // Moderate indicator
    questionWords: 1.5, // Moderate indicator
    articles: 1,        // Weak indicator
    prepositions: 1,    // Weak indicator
    contractions: 2     // Strong indicator for English
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern);
    const matchCount = matches ? matches.length : 0;
    const weight = weights[key] || 1;
    
    totalScore += matchCount * weight;
    totalWeight += weight;
  }
  
  // Normalize score (0-1)
  return totalWeight > 0 ? Math.min(totalScore / (totalWeight * 10), 1) : 0;
}

/**
 * Count keyword matches
 * @param {string} text - Text to analyze
 * @param {RegExp} pattern - Pattern to match
 * @returns {number} - Count of matches
 */
function countKeywords(text, pattern) {
  if (!text || typeof text !== 'string') return 0;
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Probabilistic language detection using character frequency analysis
 * @param {string} text - Text to analyze
 * @returns {Object} - { spanish: score, english: score }
 */
function probabilisticDetection(text) {
  if (!text || typeof text !== 'string' || text.length < 10) {
    return { spanish: 0.5, english: 0.5 }; // Neutral for very short text
  }
  
  // Character frequency analysis
  const lowerText = text.toLowerCase();
  
  // Spanish indicators
  const spanishChars = (lowerText.match(/[áéíóúñü]/g) || []).length;
  const invertedQuestions = (text.match(/¿/g) || []).length;
  const invertedExclamations = (text.match(/¡/g) || []).length;
  
  // English indicators
  const englishPatterns = [
    /\b(th|sh|ch|wh|ph)\b/g,  // Common English digraphs
    /\b\w+ing\b/g,            // -ing endings
    /\b\w+ed\b/g,             // -ed endings
    /\b\w+tion\b/g,           // -tion endings
    /\b\w+ly\b/g              // -ly adverbs
  ];
  
  const englishScore = englishPatterns.reduce((score, pattern) => {
    return score + (text.match(pattern) || []).length;
  }, 0);
  
  // Calculate probabilities
  const spanishScore = spanishChars * 5 + invertedQuestions * 10 + invertedExclamations * 10;
  
  const total = spanishScore + englishScore;
  if (total === 0) {
    return { spanish: 0.5, english: 0.5 };
  }
  
  return {
    spanish: spanishScore / total,
    english: englishScore / total
  };
}

/**
 * Detect language with hybrid approach
 * @param {string} text - Text to analyze
 * @returns {Object} - Detection result
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      language: 'en',
      confidence: 0.5,
      scores: { spanish: 0.5, english: 0.5 },
      method: 'default'
    };
  }
  
  const cleanText = text.trim();
  
  // 1. Pattern Analysis
  const spanishPatternScore = analyzePatterns(cleanText, SPANISH_PATTERNS);
  const englishPatternScore = analyzePatterns(cleanText, ENGLISH_PATTERNS);
  
  // 2. Keyword Counting
  const spanishKeywords = countKeywords(cleanText, SPANISH_PATTERNS.commonWords);
  const englishKeywords = countKeywords(cleanText, ENGLISH_PATTERNS.commonWords);
  
  // 3. Probabilistic Detection
  const probabilisticScores = probabilisticDetection(cleanText);
  
  // 4. Blockchain Context (minor adjustment)
  const spanishBlockchainTerms = countKeywords(cleanText, BLOCKCHAIN_TERMS.spanish);
  const englishBlockchainTerms = countKeywords(cleanText, BLOCKCHAIN_TERMS.english);
  
  // Combine scores with weighted average
  const weights = {
    patterns: 0.4,
    keywords: 0.3,
    probabilistic: 0.2,
    blockchain: 0.1
  };
  
  const spanishFinalScore = 
    (spanishPatternScore * weights.patterns) +
    (spanishKeywords / (spanishKeywords + englishKeywords + 1) * weights.keywords) +
    (probabilisticScores.spanish * weights.probabilistic) +
    (spanishBlockchainTerms / (spanishBlockchainTerms + englishBlockchainTerms + 1) * weights.blockchain);
  
  const englishFinalScore = 
    (englishPatternScore * weights.patterns) +
    (englishKeywords / (spanishKeywords + englishKeywords + 1) * weights.keywords) +
    (probabilisticScores.english * weights.probabilistic) +
    (englishBlockchainTerms / (spanishBlockchainTerms + englishBlockchainTerms + 1) * weights.blockchain);
  
  // Normalize to ensure they sum to 1
  const total = spanishFinalScore + englishFinalScore;
  const normalizedSpanish = total > 0 ? spanishFinalScore / total : 0.5;
  const normalizedEnglish = total > 0 ? englishFinalScore / total : 0.5;
  
  // Determine language and confidence
  const isSpanish = normalizedSpanish > normalizedEnglish;
  const confidence = Math.abs(normalizedSpanish - normalizedEnglish);
  
  // Require at least 15% difference for non-neutral detection
  const threshold = 0.15;
  const detectedLanguage = confidence < threshold ? 'en' : (isSpanish ? 'es' : 'en');
  
  return {
    language: detectedLanguage,
    confidence: confidence < threshold ? 0.5 : (isSpanish ? normalizedSpanish : normalizedEnglish),
    scores: {
      spanish: normalizedSpanish,
      english: normalizedEnglish
    },
    details: {
      patterns: { spanish: spanishPatternScore, english: englishPatternScore },
      keywords: { spanish: spanishKeywords, english: englishKeywords },
      probabilistic: probabilisticScores,
      blockchain: { spanish: spanishBlockchainTerms, english: englishBlockchainTerms }
    },
    method: 'hybrid'
  };
}

/**
 * Get language instruction for Gemini based on detected language
 * @param {string} language - Detected language code ('es' or 'en')
 * @param {number} confidence - Confidence score
 * @returns {string} - Instruction text
 */
function getLanguageInstruction(language, confidence = 0.8) {
  if (language === 'es') {
    return `🌐 INSTRUCCIÓN DE IDIOMA (Confianza: ${(confidence * 100).toFixed(0)}%)
═══════════════════════════════════════════════════════════
Responde SIEMPRE en ESPAÑOL. El usuario ha escrito en español.
- Usa terminología en español cuando sea posible
- Mantén consistencia en el idioma durante toda la conversación
- Solo usa inglés para términos técnicos sin traducción común (ej: "blockchain", "staking")
═══════════════════════════════════════════════════════════`;
  } else {
    return `🌐 LANGUAGE INSTRUCTION (Confidence: ${(confidence * 100).toFixed(0)}%)
═══════════════════════════════════════════════════════════
ALWAYS respond in ENGLISH. The user has written in English.
- Use English terminology throughout
- Maintain language consistency during the entire conversation
- Keep technical terms in English
═══════════════════════════════════════════════════════════`;
  }
}

/**
 * Express middleware for language detection
 * Detects language and adds it to req object
 */
function languageDetectorMiddleware(req, res, next) {
  try {
    // Extract text from different request formats
    let textToAnalyze = '';
    
    if (req.body.message) {
      textToAnalyze = req.body.message;
    } else if (req.body.contents) {
      if (typeof req.body.contents === 'string') {
        textToAnalyze = req.body.contents;
      } else if (Array.isArray(req.body.contents)) {
        const lastMessage = req.body.contents[req.body.contents.length - 1];
        if (lastMessage && lastMessage.parts && lastMessage.parts[0]) {
          textToAnalyze = lastMessage.parts[0].text || '';
        }
      }
    }
    
    // Detect language
    const detection = detectLanguage(textToAnalyze);
    
    // Add to request object
    req.detectedLanguage = detection;
    
    // Log detection (optional)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Language Detection]', {
        language: detection.language,
        confidence: detection.confidence.toFixed(2),
        text: textToAnalyze.substring(0, 50) + '...'
      });
    }
    
    next();
  } catch (error) {
    console.error('[Language Detector] Error:', error);
    // Default to English on error
    req.detectedLanguage = {
      language: 'en',
      confidence: 0.5,
      scores: { spanish: 0.5, english: 0.5 },
      method: 'fallback'
    };
    next();
  }
}

export {
  detectLanguage,
  getLanguageInstruction,
  languageDetectorMiddleware,
  SPANISH_PATTERNS,
  ENGLISH_PATTERNS,
  BLOCKCHAIN_TERMS
};
