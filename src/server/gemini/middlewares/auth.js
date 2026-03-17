import env from '../config/environment.js';

function auth(req, res, next) {
  // En desarrollo local, permitir todas las requests
  if (env.nodeEnv === 'development' && !env.isVercel) {
    return next();
  }
  
  // Public endpoints que no requieren autenticación
  const publicEndpoints = ['/stream', '/subscriptions/'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.path.includes(endpoint));
  
  // En producción (Vercel), verificar API key solo para endpoints sensibles
  const sensitiveEndpoints = ['/batch/', '/analytics/', '/admin/'];
  const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => req.path.includes(endpoint));
  
  // Para endpoints públicos como /stream y /subscriptions, permitir acceso sin API key
  if (isPublicEndpoint || !isSensitiveEndpoint) {
    return next();
  }
  
  // Para endpoints sensibles, verificar API key
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!env.serverApiKey) {
    console.warn('⚠️ SERVER_API_KEY no está configurada');
    return next(); // Permitir en caso de configuración faltante
  }
  
  if (!apiKey || apiKey !== env.serverApiKey) {
    console.log('Auth middleware - Unauthorized access attempt', { 
      hasApiKey: !!apiKey, 
      environment: env.nodeEnv,
      isVercel: env.isVercel,
      endpoint: req.path
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key requerida para este endpoint'
    });
  }
  
  next();
}

export default auth;
export { auth };