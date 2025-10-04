import { GoogleGenAI } from '@google/genai';
import ai from '../config/ai-config.js';
import env from '../config/environment.js';

/**
 * Servicio de Embeddings y Búsqueda Semántica
 */
class EmbeddingsService {
  constructor() {
    this.indexes = new Map(); // nombreIndex -> { vectors: Float32Array[], meta: any[] }
    // CORRECTED: Use the official Gemini embedding model
    this.defaultModel = 'gemini-embedding-001';
  }

  async embedTexts(texts = [], model = 'gemini-embedding-001') {
    if (!process.env.GEMINI_API_KEY) throw new Error('API key no configurada');
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      const embeddings = [];
      for (const text of texts) {
        const response = await ai.models.embedContent({
          // UPDATED: Use text-embedding-004 instead of gemini-embedding-001
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

  // Alias para compatibilidad
  async searchSimilar(name, query, topK = 5, options = {}) {
    return this.search(name, query, topK, options);
  }
}

const embeddingsService = new EmbeddingsService();

/**
 * Función para inicializar automáticamente la base de conocimientos al arrancar el servidor
 */
export async function initializeKnowledgeBaseOnStartup() {
  try {
    console.log('🚀 Inicializando base de conocimientos automáticamente...');
    console.log('📚 Inicializando base de conocimientos con contenido bilingüe y referencias POL...');
    
    // Importar dinámicamente para evitar dependencia circular
    const { knowledgeBase } = await import('./knowledge-base.js');
    
    // Inicializar el índice con los documentos
    const result = await embeddingsService.upsertIndex('knowledge_base', knowledgeBase.map(doc => ({
      text: doc.content,
      meta: doc.metadata
    })));

    console.log(`✅ Base de conocimientos inicializada: ${knowledgeBase.length} documentos indexados`);
    console.log('📊 Categorías disponibles:', [...new Set(knowledgeBase.map(d => d.metadata.type))]);
    
    // Mostrar estadísticas detalladas
    const categoryStats = {};
    knowledgeBase.forEach(doc => {
      const category = doc.metadata.type;
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    console.log('📈 Distribución por categorías:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} documentos`);
    });
    
  } catch (error) {
    console.error('❌ Error inicializando base de conocimientos:', error.message);
    console.error('Stack trace:', error.stack);
    // No lanzar error para no interrumpir el arranque del servidor
  }
}

export default embeddingsService;