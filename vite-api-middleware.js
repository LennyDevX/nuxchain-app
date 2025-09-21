import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          // Extraer la ruta de la API
          const apiPath = req.url.replace('/api/', '');
          const apiFilePath = join(__dirname, 'api', `${apiPath}.js`);
          
          // Verificar si existe el archivo de la API
          if (fs.existsSync(apiFilePath)) {
            // Importar dinámicamente la función de la API
            const apiModule = await import(`file://${apiFilePath}`);
            const handler = apiModule.default;
            
            if (handler && typeof handler === 'function') {
              // Crear objetos req y res compatibles con Vercel
              const mockReq = {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body || {},
                query: new URL(req.url, `http://${req.headers.host}`).searchParams
              };
              
              const mockRes = {
                status: (code) => {
                  res.statusCode = code;
                  return mockRes;
                },
                json: (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end: (data) => {
                  res.end(data);
                },
                write: (data) => {
                  res.write(data);
                },
                setHeader: (name, value) => {
                  res.setHeader(name, value);
                }
              };
              
              // Parsear el body para POST requests
              if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    mockReq.body = JSON.parse(body);
                    await handler(mockReq, mockRes);
                  } catch (error) {
                    console.error('API Error:', error);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
                  }
                });
              } else {
                await handler(mockReq, mockRes);
              }
            } else {
              next();
            }
          } else {
            next();
          }
        } catch (error) {
          console.error('Middleware Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
        }
      });
    }
  };
}