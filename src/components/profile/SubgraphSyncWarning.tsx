import React, { useEffect, useState } from 'react';
import { useSubgraphStatus } from '../../hooks/subgraph/useSubgraphStatus';

interface SubgraphSyncWarningProps {
  show?: boolean;
  onDismiss?: () => void;
}

/**
 * Componente para mostrar advertencia cuando el subgraph no está completamente sincronizado
 * Se muestra cuando:
 * - El usuario acaba de hacer una transacción
 * - El subgraph está detrás del bloque actual
 * - Las actividades recientes pueden no estar completas
 */
export const SubgraphSyncWarning: React.FC<SubgraphSyncWarningProps> = ({ 
  show = false,
  onDismiss
}) => {
  const { status } = useSubgraphStatus();
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible || !status) {
    return null;
  }

  const isBehind = !status.isUpToDate && !status.hasIndexingErrors;
  const hasErrors = status.hasIndexingErrors;

  if (status.isUpToDate && !hasErrors) {
    return null; // Don't show warning if everything is fine
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="mb-4 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">
          {hasErrors ? (
            <span className="text-2xl">⚠️</span>
          ) : (
            <span className="text-2xl">⏳</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-yellow-400 mb-1">
            {hasErrors ? 'Subgraph Indexing' : 'Syncing Activities'}
          </h3>
          <p className="text-xs text-yellow-300 mb-2">
            {hasErrors
              ? 'The subgraph encountered indexing errors. Your recent activities may not be complete.'
              : 'The subgraph is catching up with the blockchain. Your recent deposits may take another minute to appear.'}
          </p>

          {/* Status details */}
          <div className="text-xs text-yellow-200/80 space-y-1">
            {status && (
              <>
                <p>📦 Block: {status.blockNumber.toLocaleString()}</p>
                <p>⏱️ Last update: {status.timeAgo}</p>
                {isBehind && (
                  <p>💡 Tip: Activities typically appear within 1-2 minutes of the transaction</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-yellow-400 hover:text-yellow-300 transition-colors p-1"
          title="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SubgraphSyncWarning;
