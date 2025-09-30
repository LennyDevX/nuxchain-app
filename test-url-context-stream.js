// Test para verificar el funcionamiento del stream con URL context tool
// Formato ES Module

import { SemanticStreamingService } from './api/services/semantic-streaming-service.js';
import urlContextService from './api/services/url-context-service.js';

try {
  console.log('=== Prueba de Stream con URL Context Tool ===');
  
  // Verificar que el servicio de contexto de URL está disponible
  if (!urlContextService || typeof urlContextService.fetchUrlContext !== 'function') {
    throw new Error('El servicio de contexto de URL no está disponible o no tiene el método fetchUrlContext');
  }
  
  console.log('✓ Servicio de contexto de URL importado correctamente');
  
  // Crear instancia del servicio de streaming semántico
  const streamingService = new SemanticStreamingService();
  console.log('✓ Instancia del servicio de streaming semántico creada');
  
  // Crear un mock de respuesta HTTP
  const mockRes = {
    setHeader: (name, value) => { console.log(`  [Mock Res] Set header: ${name}=${value}`); },
    write: (chunk) => { console.log(`  [Mock Res] Escribiendo chunk: ${chunk.substring(0, 60)}${chunk.length > 60 ? '...' : ''}`); },
    end: () => { console.log(`  [Mock Res] Stream finalizado`); },
    writableEnded: false,
    destroyed: false
  };
  
  // Probar el análisis de URL (usando una URL de prueba)
  const testUrl = 'https://www.nuxchain.com/docs';
  console.log(`\nProbando integración con el servicio de contexto de URL...`);
  
  // Simular la extracción de contexto de URL y el posterior streaming
  (async () => {
    try {
      // Crear un mock del servicio de web scraper para evitar llamadas reales
      const originalExtractContent = urlContextService.webScraper.extractContent;
      urlContextService.webScraper.extractContent = async () => ({
        success: true,
        url: testUrl,
        title: 'Documentación de Nuxchain',
        content: 'Nuxchain es una plataforma descentralizada que combina staking, marketplace de NFT, airdrops y tokenización. Ofrece herramientas avanzadas para la gestión de activos digitales y generación de ingresos pasivos.',
        metadata: { domain: 'nuxchain.com' }
      });
      
      console.log('✓ Mock del web scraper configurado correctamente');
      
      // Intentar obtener contexto real (con mock) de la URL
      const urlContext = await urlContextService.fetchUrlContext(testUrl);
      console.log('✓ Contexto de URL obtenido correctamente');
      console.log(`  - Título: ${urlContext.title}`);
      console.log(`  - Longitud del contenido: ${urlContext.content.length} caracteres`);
      
      // Crear un mensaje que incluye el contexto de la URL
      const messageWithContext = `Contexto de URL: ${urlContext.content}\n\nPor favor, explica los beneficios del staking en Nuxchain.`;
      
      console.log('\nProbando el streaming con el contexto de URL...');
      
      // Probar el streaming con el mensaje que incluye el contexto de URL
      await streamingService.streamSemanticContent(mockRes, messageWithContext, {
        enableSemanticChunking: true,
        enableContextualPauses: true,
        enableVariableSpeed: false // Desactivar velocidad variable para una prueba más rápida
      });
      
      // Restaurar el método original
      urlContextService.webScraper.extractContent = originalExtractContent;
      
      console.log('\n✅ Prueba completada con éxito!');
      console.log('El stream con URL context tool funciona correctamente.');
      console.log('Se han verificado las siguientes funcionalidades:');
      console.log('1. Importación correcta de los servicios necesarios');
      console.log('2. Obtención de contexto desde una URL (con mock)');
      console.log('3. Integración con el servicio de streaming semántico');
      console.log('4. Streaming de respuestas que incluyen contexto de URL');
      
    } catch (error) {
      console.error('Error durante la prueba:', error);
      process.exit(1);
    }
  })();
  
  // Evitar que Node.js salga inmediatamente
  setTimeout(() => {}, 3000);
  
} catch (error) {
  console.error('Error fatal durante la configuración de la prueba:', error);
  process.exit(1);
}