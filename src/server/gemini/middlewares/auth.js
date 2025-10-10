import env from '../config/environment.js';

function auth(req, res, next) {
  // En desarrollo local, permitir todas las requests
  if (env.nodeEnv === 'development' && !env.isVercel) {
    return next();
  }

  const publicEndpoints = [
    /^\/health$/,
    /^\/hello$/,
    /^\/check-api$/
  ];

  const isPublic = publicEndpoints.some(pattern => pattern.test(req.path));
  if (isPublic) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!env.serverApiKey) {
    console.warn('⚠️ SERVER_API_KEY no está configurada');
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'API configuration missing'
    });
  }

  if (!apiKey || apiKey !== env.serverApiKey) {
    console.warn('Auth middleware - Unauthorized access attempt', {
      hasApiKey: Boolean(apiKey),
      environment: env.nodeEnv,
      endpoint: req.path
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key requerida para este endpoint'
    });
  }

  next();
}

export default auth;
export { auth };
