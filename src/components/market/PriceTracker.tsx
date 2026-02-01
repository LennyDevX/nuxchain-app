/**
 * Price Tracker Component - Simplified
 * TODO: Actualizar para usar la nueva API de market/prices
 */

import { memo } from 'react';

const PriceTracker = memo(() => {
  return (
    <div className="text-center py-8 lg:py-12 rounded-xl lg:rounded-2xl border border-purple-500/20 bg-black/20 backdrop-blur-xl p-6">
      <span className="text-4xl mb-3 block">🚧</span>
      <p className="text-gray-400 text-sm lg:text-base">
        Price Tracker component is being updated
      </p>
      <p className="text-gray-500 text-xs mt-2">
        Coming soon with the new unified API
      </p>
    </div>
  );
});

PriceTracker.displayName = 'PriceTracker';

export default PriceTracker;
