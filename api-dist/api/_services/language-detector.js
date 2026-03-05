/**
 * Language Detection Utility - TypeScript Version
 * Hybrid approach: Pattern analysis + Keywords + Probabilistic detection
 */
/**
 * Spanish language patterns
 */
const SPANISH_PATTERNS = {
    diacritics: /[áéíóúñü¿¡]/i,
    commonWords: /\b(qué|cuál|cómo|dónde|cuándo|cuánto|por qué|el|la|los|las|de|del|un|una|es|está|son|están|para|con|sin|sobre|entre|según|desde|hasta|también|muy|más|menos|así|sí|no|yo|tú|él|ella|nosotros|ustedes|ellos|si|pero|aunque|porque|cuando|donde|mientras|después|antes|siempre|nunca|ahora|aquí|allí)\b/gi,
    verbs: /\b(tengo|tienes|tiene|hacen|hace|puedo|puede|quiero|quiere|voy|va|soy|eres|somos|están|estoy|estás|digo|dice|veo|ves|vemos|entiendo|entiendes|necesito|necesitas)\b/gi,
    questionWords: /\b(qué|cuál|cuáles|cómo|dónde|cuándo|cuánto|cuántos|cuánta|cuántas|quién|quiénes|por qué)\b/gi,
    prepositions: /\b(desde|hasta|hacia|mediante|según|durante|contra|entre)\b/gi
};
/**
 * English language patterns
 */
const ENGLISH_PATTERNS = {
    commonWords: /\b(the|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|what|which|when|where|why|how|who|whom|whose|this|that|these|those|am|an|and|or|but|if|because|as|while|for|with|from|by|at|in|on|to|of|about|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|all|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|yes|you|your|yours|he|she|it|we|they|them|their|his|her|its|our)\b/gi,
    verbs: /\b(have|has|do|does|get|gets|make|makes|know|knows|think|thinks|take|takes|see|sees|come|comes|want|wants|use|uses|find|finds|give|gives|tell|tells|work|works|call|calls|try|tries|need|needs|feel|feels)\b/gi,
    questionWords: /\b(what|which|when|where|why|how|who|whom|whose)\b/gi,
    articles: /\b(the|a|an|this|that|these|those)\b/gi,
    contractions: /\b(I'm|I'll|I've|you're|you'll|you've|he's|she's|it's|we're|we'll|we've|they're|they'll|they've|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|couldn't|shouldn't|can't|cannot|mustn't)\b/gi
};
/**
 * Analyze patterns in text
 */
function analyzePatterns(text, patterns) {
    if (!text || typeof text !== 'string')
        return 0;
    let totalScore = 0;
    let totalWeight = 0;
    const weights = {
        diacritics: 3,
        commonWords: 2,
        verbs: 1.5,
        questionWords: 1.5,
        articles: 1,
        prepositions: 1,
        contractions: 2
    };
    for (const [key, pattern] of Object.entries(patterns)) {
        const matches = text.match(pattern);
        const matchCount = matches ? matches.length : 0;
        const weight = weights[key] || 1;
        totalScore += matchCount * weight;
        totalWeight += weight;
    }
    return totalWeight > 0 ? Math.min(totalScore / (totalWeight * 10), 1) : 0;
}
/**
 * Count keyword matches
 */
function countKeywords(text, pattern) {
    if (!text || typeof text !== 'string')
        return 0;
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
}
/**
 * Probabilistic language detection using character frequency analysis
 */
function probabilisticDetection(text) {
    if (!text || typeof text !== 'string' || text.length < 10) {
        return { spanish: 0.5, english: 0.5 };
    }
    const lowerText = text.toLowerCase();
    // Spanish indicators
    const spanishChars = (lowerText.match(/[áéíóúñü]/g) || []).length;
    const invertedQuestions = (text.match(/¿/g) || []).length;
    const invertedExclamations = (text.match(/¡/g) || []).length;
    // English indicators
    const englishPatterns = [
        /\b(th|sh|ch|wh|ph)\b/g,
        /\b\w+ing\b/g,
        /\b\w+ed\b/g,
        /\b\w+tion\b/g,
        /\b\w+ly\b/g
    ];
    const englishScore = englishPatterns.reduce((score, pattern) => {
        return score + (text.match(pattern) || []).length;
    }, 0);
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
 */
export function detectLanguage(text) {
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
    const blockchainTermsEs = /\b(blockchain|cadena de bloques|criptomoneda|staking|apostar)\b/gi;
    const blockchainTermsEn = /\b(blockchain|cryptocurrency|staking|wallet|mining)\b/gi;
    const spanishBlockchainTerms = countKeywords(cleanText, blockchainTermsEs);
    const englishBlockchainTerms = countKeywords(cleanText, blockchainTermsEn);
    // Combine scores with weighted average
    const weights = {
        patterns: 0.4,
        keywords: 0.3,
        probabilistic: 0.2,
        blockchain: 0.1
    };
    const spanishFinalScore = (spanishPatternScore * weights.patterns) +
        (spanishKeywords / (spanishKeywords + englishKeywords + 1) * weights.keywords) +
        (probabilisticScores.spanish * weights.probabilistic) +
        (spanishBlockchainTerms / (spanishBlockchainTerms + englishBlockchainTerms + 1) * weights.blockchain);
    const englishFinalScore = (englishPatternScore * weights.patterns) +
        (englishKeywords / (spanishKeywords + englishKeywords + 1) * weights.keywords) +
        (probabilisticScores.english * weights.probabilistic) +
        (englishBlockchainTerms / (spanishBlockchainTerms + englishBlockchainTerms + 1) * weights.blockchain);
    // Normalize
    const total = spanishFinalScore + englishFinalScore;
    const normalizedSpanish = total > 0 ? spanishFinalScore / total : 0.5;
    const normalizedEnglish = total > 0 ? englishFinalScore / total : 0.5;
    // Determine language and confidence
    const isSpanish = normalizedSpanish > normalizedEnglish;
    const confidence = Math.abs(normalizedSpanish - normalizedEnglish);
    // Require at least 15% difference
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
