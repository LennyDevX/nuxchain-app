import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// For a cleaner and more consistent configuration, it's recommended to use a single,
// consistent naming convention for your environment variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isDevelopment = import.meta.env.DEV;

// In development, log the status of the Firebase config to help with debugging.
// In production, this information will not be logged to the console.
if (isDevelopment) {
  console.log('🔥 Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
    authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
    projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing'
  });
}

// Throw an error if essential configuration is missing in production.
if (!isDevelopment && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
    console.error('❌ Critical Firebase configuration is missing. The app cannot start.');
    // You might want to throw an error here to halt execution
    // throw new Error('Critical Firebase configuration is missing.');
}


// Initialize Firebase
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    if (isDevelopment) console.log('✅ Firebase initialized successfully');
  } else {
    app = getApp();
    if (isDevelopment) console.log('ℹ️ Firebase app already initialized, reusing existing instance');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // In a production environment, you might want to handle this more gracefully,
  // for example, by showing a user-friendly error message.
  throw error;
}

// Initialize Firestore with network fallback for restricted environments.
// This is done lazily to only initialize it when first requested.
let firestore;
try {
    firestore = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        // Consider enabling persistence for offline capabilities
        // persistence: true
    });
    if (isDevelopment) console.log('✅ Firestore configured with network fallbacks');
} catch (error) {
    if (isDevelopment) console.warn('ℹ️ Firestore might already be configured, using existing instance');
    firestore = getFirestore(app);
}


// Export the Firestore instance with the optimized configuration.
// IMPORTANT: Remember to set up strong security rules in your Firebase console
// to protect your data from unauthorized access.
export const db = firestore;

export default app;
