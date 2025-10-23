module.exports = {
  ci: {
    collect: {
      // Build output directory para Vite
      staticDistDir: './dist',
      
      // Configuración de Lighthouse
      numberOfRuns: 3, // Ejecutar 3 veces para reducir varianza
      
      // URLs a auditar (después del build)
      url: [
        'http://localhost:4173/', // Vite preview server - SPA root
      ],
      
      // Configuración de Chrome headless - Detecta Edge o Chrome automáticamente
      settings: {
        preset: 'desktop',
        // Detectar navegadores en Windows (Edge > Chrome)
        // Soporta ARM64, x86 y x64
        chromePath: process.env.CHROME_PATH || (process.platform === 'win32' 
          ? (() => {
              const fs = require('fs');
              const paths = [
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',      // ARM64 native
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', // x86/x64
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',        // Chrome x86/x64
                'C:\\Program Files (ARM64)\\Microsoft\\Edge\\Application\\msedge.exe' // ARM64 fallback
              ];
              for (const path of paths) {
                if (fs.existsSync(path)) return path;
              }
              return undefined;
            })()
          : undefined),
        // Opciones de Chrome/Edge
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        // Límite de tiempo por página
        maxWaitForLoad: 60000,
        // Throttling para resultados consistentes
        throttlingMethod: 'provided',
      },
    },
    
    assert: {
      // Presupuestos de performance - Configuración realista
      // No usar preset, solo assertions explícitas
      assertions: {
        // Core Web Vitals (las métricas más importantes)
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        
        // Performance score
        'categories:performance': ['warn', { minScore: 0.75 }],
        
        // Accessibility
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        
        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        
        // SEO
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Resource budgets (ajustados a tu aplicación)
        'resource-summary:script:size': ['warn', { maxNumericValue: 900000 }], // 900KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 400000 }],  // 400KB
        'resource-summary:font:size': ['warn', { maxNumericValue: 150000 }],   // 150KB
      },
    },
    
    upload: {
      // Método de almacenamiento
      target: 'temporary-public-storage',
      
      // Tiempo de expiración (7 días)
      // Para Lighthouse CI Server propio, cambiar a:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-build-token',
      
      // GitHub token (desde variable de entorno en GitHub Actions)
      // En local no es requerido
      token: process.env.LHCI_GITHUB_APP_TOKEN || undefined,
    },
    
    // Servidor local (opcional para desarrollo)
    server: {
      // Si quieres correr tu propio servidor LHCI
      // Descomenta y configura:
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDialect: 'sqlite',
      //   sqlDatabasePath: './lhci-data.db',
      // },
    },
  },
};
