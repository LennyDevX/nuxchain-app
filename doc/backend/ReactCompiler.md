Plan: Integrar React Compiler para optimizar rendimiento
TL;DR: React Compiler es una herramienta de compilación que automatiza la memoización. Tu proyecto (React 19.2.3 + Vite) es candidato excelente por ya usar memoización manual extensiva. Adopción incremental en chat/market primero reducirá ~200 líneas de código y mejorará UX en 10-20% en Core Web Vitals, especialmente en mobile.

Steps
Instalar babel-plugin-react-compiler y eslint-plugin-react-hooks, revisar ESLint para detectar violaciones de Rules of React.
Actualizar vite.config.ts para integrar Babel plugin React Compiler.
Adopción incremental comenzando en chat y market (menor complejidad de dependencias).
Ejecutar tests existentes (npm run test:production, npm run test:comprehensive) y Lighthouse audit (npm run lighthouse).
Expandir a components principales tras validación en fase 1.
Full rollout después de 2-3 semanas de validación.
Further Considerations
Métricas de rendimiento esperadas: FCP +5-15%, LCP +10-20%, TTI +8-15%. Impacto significativo en mobile (~15-25% reduction de CPU waste). Build time +5-10% due to Babel compilation. Tu memoización manual actual ya minimiza janks; compiler eliminará bugs sutiles de referential equality.

Riesgo y compatibilidad: Cero breaking changes si sigues Rules of React (ESLint detectará problemas). Rollback trivial (remover plugin). Tu stack (React 19, TypeScript 5.9, Vite 7.2) tiene soporte first-class. Recomendación: A/B testing opcional en production.

Áreas de mayor impacto: Chat page (re-renders al escribir), NFTs page (5+ hooks + filtros dinámicos), Market data (WebSocket updates), Tokenization carousel (ya memozada, compiler hará automático). Podrías eliminar todos los memo(), useMemo(), useCallback() que actualmente tienen 200+ líneas en tu codebase.

