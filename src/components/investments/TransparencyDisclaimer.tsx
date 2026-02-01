/**
 * Transparency Disclaimer Component
 * Muestra información sobre la verificación de datos y transparencia
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TransparencyDisclaimer = memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-br from-blue-900/30 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔐</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Transparencia Total</h3>
          <p className="text-blue-400 text-sm">Datos verificados en tiempo real</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <p className="text-gray-300">
          Nos comprometemos con la transparencia total hacia nuestra comunidad. 
          Todos los datos de inversiones que mostramos son obtenidos directamente 
          desde la API pública de CoinGecko.
        </p>

        {/* Verification Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-3">
            <span className="text-green-400">✓</span>
            <div>
              <span className="text-white font-medium block">Datos en Tiempo Real</span>
              <span className="text-gray-400 text-sm">Actualizados cada minuto</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-3">
            <span className="text-green-400">✓</span>
            <div>
              <span className="text-white font-medium block">API Oficial</span>
              <span className="text-gray-400 text-sm">CoinGecko API</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-3">
            <span className="text-green-400">✓</span>
            <div>
              <span className="text-white font-medium block">Sin Manipulación</span>
              <span className="text-gray-400 text-sm">Datos crudos del exchange</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-3">
            <span className="text-green-400">✓</span>
            <div>
              <span className="text-white font-medium block">Auditable</span>
              <span className="text-gray-400 text-sm">Código abierto verificable</span>
            </div>
          </div>
        </div>

        {/* Expandable Section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <span>{isExpanded ? '▼' : '▶'}</span>
          <span>Ver más información</span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">🔒 Seguridad de las Claves API</h4>
                  <p className="text-gray-400 text-sm">
                    CoinGecko API no requiere credenciales (datos públicos). 
                    backend y nunca se exponen al navegador. Solo utilizamos permisos de lectura, 
                    sin capacidad de realizar operaciones o retiros.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">📊 Qué Mostramos</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Posiciones activas en Futuros (Long/Short)</li>
                    <li>• PnL no realizado actual</li>
                    <li>• Grid Trading Bots en ejecución</li>
                    <li>• Métricas generales de rendimiento</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">⚠️ Disclaimer</h4>
                  <p className="text-gray-400 text-sm">
                    El trading de criptomonedas y futuros conlleva riesgos significativos. 
                    Los resultados pasados no garantizan rendimientos futuros. 
                    Esta información se proporciona solo con fines de transparencia y 
                    no constituye asesoramiento financiero.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Badge */}
      <div className="mt-6 pt-4 border-t border-blue-500/20 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>🛡️</span>
          <span>Solo Lectura</span>
        </div>
        <div className="w-px h-4 bg-gray-600"></div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>🔗</span>
          <span>Verificable On-Chain</span>
        </div>
        <div className="w-px h-4 bg-gray-600"></div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>💯</span>
          <span>100% Transparente</span>
        </div>
      </div>
    </motion.div>
  );
});

TransparencyDisclaimer.displayName = 'TransparencyDisclaimer';

export default TransparencyDisclaimer;
