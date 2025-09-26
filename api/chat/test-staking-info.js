import { getRelevantContext } from '../services/knowledge-base.js';
import { initializeKnowledgeBaseForVercel } from '../services/embeddings-service.js';

// Prueba de contexto relevante para información de staking
async function testStakingContext() {
    console.log('=== Prueba de recuperación de información de staking ===');
    
    // Consulta de ejemplo sobre staking
    const testQuery = '¿Cuál es el APY base para diferentes períodos de bloqueo en Nuxchain?';
    console.log('Consulta de prueba:', testQuery);
    
    try {
        // Probamos el fallback simple primero
        console.log('\n--- Probando getRelevantContext (fallback simple) ---');
        const fallbackContext = getRelevantContext(testQuery);
        console.log('Context fallback obtenido:');
        console.log(fallbackContext);
        
        // Probamos el servicio de embeddings
        console.log('\n--- Probando initializeKnowledgeBaseForVercel (embeddings) ---');
        const embeddingsService = await initializeKnowledgeBaseForVercel();
        const searchResults = await embeddingsService.search('knowledge_base', testQuery, 2, {
            threshold: 0.25
        });
        
        // Aplicamos nuestro nuevo filtro mejorado
        const filteredResults = searchResults.filter(r =>
            (r.meta?.language || '').toLowerCase() === 'en' ||
            r.content.toLowerCase().includes('staking') ||
            r.content.toLowerCase().includes('apy') ||
            r.content.toLowerCase().includes('lockup') ||
            /[a-zA-Z]/.test(r.content) // Al menos algunos caracteres en inglés
        );
        
        console.log('Resultados de búsqueda filtrados:');
        filteredResults.forEach((result, index) => {
            console.log(`\nResultado ${index + 1}:`);
            console.log('Puntuación:', result.score);
            console.log('Contenido:', result.content.substring(0, 300) + '...');
        });
        
        // Comprobamos si se encontraron los datos de APY y períodos de bloqueo
        const hasApyData = filteredResults.some(r => 
            r.content.toLowerCase().includes('apy') && 
            r.content.toLowerCase().includes('lockup')
        );
        
        if (hasApyData) {
            console.log('\n✅ PRUEBA SUPERADA: Se encontró información de APY y períodos de bloqueo.');
        } else {
            console.log('\n❌ PRUEBA FALLIDA: No se encontró información de APY y períodos de bloqueo.');
        }
        
    } catch (error) {
        console.error('\n❌ Error durante la prueba:', error);
    }
}

// Ejecutar la prueba
if (import.meta.url === new URL(import.meta.url).href) {
    testStakingContext();
}

export { testStakingContext };