import { GoogleGenAI } from '@google/genai';

/**
 * Servicio de Embeddings para API de Vercel
 * Versión simplificada para entorno serverless
 */
class EmbeddingsService {
  constructor() {
    this.indexes = new Map(); // nombreIndex -> { vectors: Float32Array[], meta: any[] }
    this.defaultModel = 'text-embedding-004';
    this.initialized = false;
  }

  async embedTexts(texts = [], model = 'text-embedding-004') {
    if (!process.env.GEMINI_API_KEY) throw new Error('API key no configurada');
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      const embeddings = [];
      for (const text of texts) {
        const response = await ai.models.embedContent({
          model: model,
          contents: text
        });
        embeddings.push(new Float32Array(response.embeddings[0].values));
      }
      return embeddings;
    } catch (error) {
      console.error('Error generando embeddings:', error);
      return [];
    }
  }

  // Crea/actualiza un índice en memoria
  async upsertIndex(name, documents = [], options = {}) {
    if (!name) throw new Error('Nombre de índice requerido');
    if (!Array.isArray(documents) || documents.length === 0) return { count: 0 };

    const texts = documents.map(d => (typeof d === 'string' ? d : d.text || ''));
    const metas = documents.map(d => (typeof d === 'string' ? {} : (d.meta || {})));

    const vectors = await this.embedTexts(texts, options.model || this.defaultModel);

    const existing = this.indexes.get(name) || { vectors: [], meta: [] };

    for (let i = 0; i < vectors.length; i++) {
      existing.vectors.push(vectors[i]);
      existing.meta.push({ text: texts[i], ...metas[i] });
    }

    this.indexes.set(name, existing);
    
    // Marcar como inicializado si es el índice principal
    if (name === 'knowledge_base') {
      this.initialized = true;
    }
    
    return { count: vectors.length };
  }

  // Búsqueda por similitud usando coseno
  async search(name, query, topK = 5, options = {}) {
    const index = this.indexes.get(name);
    if (!index || index.vectors.length === 0) return [];

    const [queryVec] = await this.embedTexts([query], options.model || this.defaultModel);
    if (!queryVec) return [];

    const scores = index.vectors.map((vec, idx) => ({
      idx,
      score: this.cosineSimilarity(vec, queryVec)
    }));

    scores.sort((a, b) => b.score - a.score);

    // Aplicar threshold si está especificado
    const threshold = options.threshold || 0;
    const filteredScores = threshold > 0 ? scores.filter(s => s.score >= threshold) : scores;

    return filteredScores.slice(0, topK).map(({ idx, score }) => ({
      score,
      content: index.meta[idx].text || '',
      meta: index.meta[idx]
    }));
  }

  cosineSimilarity(a, b) {
    let dot = 0, na = 0, nb = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
  }

  clearIndex(name) {
    this.indexes.delete(name);
  }

  getIndexStats(name) {
    const idx = this.indexes.get(name);
    return idx ? { size: idx.vectors.length } : { size: 0 };
  }

  isInitialized() {
    return this.initialized && this.indexes.has('knowledge_base') && this.indexes.get('knowledge_base').vectors.length > 0;
  }

  // Alias para compatibilidad
  async searchSimilar(name, query, topK = 5, options = {}) {
    return this.search(name, query, topK, options);
  }
}

// Instancia global para reutilizar en requests
let embeddingsServiceInstance = null;

function getEmbeddingsService() {
  if (!embeddingsServiceInstance) {
    embeddingsServiceInstance = new EmbeddingsService();
  }
  return embeddingsServiceInstance;
}

/**
 * Función para inicializar la base de conocimientos en Vercel
 */
export async function initializeKnowledgeBaseForVercel() {
  try {
    console.log('🚀 Inicializando base de conocimientos en Vercel...');
    console.log('🔧 Variables de entorno:', {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });
    
    // Importar la base de conocimientos
    const { knowledgeBase } = await import('./knowledge-base.js');
    // Filtrado inteligente de documentos para indexación
    // En lugar de filtrar estrictamente por idioma, evaluamos la calidad y la utilidad del documento
    const filteredDocs = knowledgeBase.filter(doc => {
      const contentLower = doc.content.toLowerCase();
      const hasUsefulContent = 
        // Priorizar documentos con categorías definidas
        !!doc.metadata?.category && 
        !!doc.metadata?.topic &&
        // Excluir documentos vacíos o con contenido irrelevante
        contentLower.length > 50 && 
        !contentLower.includes('placeholder') && 
        !contentLower.includes('ejemplo') && 
        !contentLower.includes('example');
      
      // Incluir todos los documentos de calidad
      return hasUsefulContent;
    });
    
    // Clasificar documentos por categorías para una mejor organización
    const categorizedDocs = filteredDocs.map(doc => {
      const contentLower = doc.content.toLowerCase();
      return {
        ...doc,
        searchCategory: doc.metadata?.type || 
          (contentLower.includes('staking') || contentLower.includes('apy') ? 'staking' :
           contentLower.includes('nft') || contentLower.includes('marketplace') ? 'nft' :
           contentLower.includes('airdrop') ? 'airdrop' : 'general')
      };
    });
    
    console.log(`📚 Base de conocimientos optimizada: ${categorizedDocs.length} documentos listos para indexación`);
    console.log('📊 Distribución por categorías:', 
      categorizedDocs.reduce((acc, doc) => {
        acc[doc.searchCategory] = (acc[doc.searchCategory] || 0) + 1;
        return acc;
      }, {}));
    console.log(`📚 Base de conocimientos cargada: ${categorizedDocs.length} documentos optimizados`);

    const embeddingsService = getEmbeddingsService();
    
    // Verificar si ya está inicializada
    if (embeddingsService.isInitialized()) {
      console.log('✅ Base de conocimientos ya inicializada');
      const stats = embeddingsService.getIndexStats('knowledge_base');
      console.log('📊 Estadísticas del índice:', stats);
      return embeddingsService;
    }
    
    console.log('🔄 Iniciando proceso de indexación...');
    
    // Inicializar el índice con los documentos categorizados y optimizados
    const result = await embeddingsService.upsertIndex('knowledge_base', categorizedDocs.map(doc => ({
      text: doc.content,
      meta: { ...doc.metadata, searchCategory: doc.searchCategory }
    })));

    console.log(`✅ Base de conocimientos inicializada en Vercel: ${englishDocs.length} documentos indexados`);
    console.log('📊 Resultado de indexación:', result);
    console.log('📊 Categorías disponibles:', [...new Set(englishDocs.map(d => d.metadata.type))]);
    
    // Verificar que la inicialización fue exitosa
    if (embeddingsService.isInitialized()) {
      console.log('✅ Verificación exitosa: servicio marcado como inicializado');
    } else {
      console.warn('⚠️ Advertencia: servicio no marcado como inicializado después del proceso');
    }
    
    return embeddingsService;
    
  } catch (error) {
    console.error('❌ Error inicializando base de conocimientos en Vercel:', error.message);
    console.error('📍 Tipo de error:', error.constructor.name);
    console.error('📍 Stack trace:', error.stack);
    
    // Log adicional para debugging
    if (error.message.includes('API key')) {
      console.error('🔑 Error relacionado con API key - verificar configuración en Vercel');
    }
    
    // Sistema de fallback mejorado con múltiples niveles
    const fallbackService = getEmbeddingsService();
    
    // Marcar el servicio como en modo fallback
    fallbackService.fallbackMode = true;
    fallbackService.fallbackReason = error.message;
    fallbackService.fallbackTimestamp = new Date().toISOString();
    
    // Implementar búsqueda de fallback usando coincidencias de texto
    fallbackService.search = async function(indexName, query, topK = 5, options = {}) {
      console.log('🔄 Usando búsqueda de fallback para:', query);
      
      try {
        const { searchKnowledgeBase, knowledgeBase } = await import('./knowledge-base.js');
        // No filtrar tan estrictamente en el fallback
        const filteredDocs = knowledgeBase.filter(doc =>
          doc.content.toLowerCase().includes('staking') ||
          doc.content.toLowerCase().includes('apy') ||
          doc.content.toLowerCase().includes('lockup') ||
          doc.content.toLowerCase().includes('bloqueo') ||
          true // Incluir todos los documentos como último recurso
        );
        const results = searchKnowledgeBase(query, topK, filteredDocs);
        
        // Convertir al formato esperado por el sistema de embeddings
        return results.map((item, index) => ({
          content: item.content,
          metadata: item.metadata,
          score: Math.max(0.8 - (index * 0.1), 0.3), // Score simulado decreciente
          index: index
        }));
      } catch (fallbackError) {
        console.error('❌ Error en búsqueda de fallback:', fallbackError.message);
        return [];
      }
    };
    
    console.log('🔄 Retornando servicio de fallback con búsqueda mejorada');
    return fallbackService;
  }
}

export default getEmbeddingsService;
export { getEmbeddingsService };