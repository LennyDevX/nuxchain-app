// This file MUST load before anything else
// It ensures React is available in the global scope
// This prevents "Cannot read properties of undefined (reading 'createContext')" errors

;(function() {
  'use strict';
  
  // Create a promise that resolves when React is loaded
  window.__reactReady = new Promise((resolve) => {
    window.__resolveReact = resolve;
  });
  
  console.log('[Nuxchain] React initialization started');
})();
