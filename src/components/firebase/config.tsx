import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AD || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Log config for debugging (remove in production)
console.log('🔥 Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
  projectId: firebaseConfig.projectId || '❌ Missing'
});

// Inicializar Firebase
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApp();
    console.log('ℹ️ Firebase app already initialized, reusing existing instance');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Configurar Firestore con fallback automático para entornos restringidos
let firestore;
try {
  firestore = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  });
  console.log('✅ Firestore configured with network fallbacks');
} catch (error) {
  console.warn('ℹ️ Firestore already configured, using existing instance', error);
  firestore = getFirestore(app);
}

// Exportar la instancia de Firestore con configuración optimizada
export const db = firestore;

export default app;