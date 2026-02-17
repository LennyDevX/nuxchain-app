/**
 * Firebase Admin SDK Initialization
 * Centralized configuration for serverless functions
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
/**
 * Initialize Firebase Admin SDK (singleton pattern for serverless)
 */
export function initializeFirebaseAdmin() {
    // Check if already initialized (important for serverless cold starts)
    if (getApps().length > 0) {
        return getFirestore();
    }
    try {
        // Try to initialize with service account credentials first
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccount) {
            // Production: Use service account JSON
            try {
                const credentials = JSON.parse(serviceAccount);
                initializeApp({
                    credential: cert(credentials),
                    projectId: credentials.project_id || process.env.VITE_FIREBASE_PROJECT_ID || 'nuxchain1',
                });
                console.log('✅ Firebase Admin initialized with service account');
            }
            catch (parseError) {
                console.error('❌ Failed to parse service account JSON:', parseError);
                throw new Error('Invalid Firebase service account configuration');
            }
        }
        else {
            // Development/Vercel: Use default credentials from environment
            // This works when GOOGLE_APPLICATION_CREDENTIALS is set or in Google Cloud
            initializeApp({
                projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nuxchain1',
            });
            console.log('✅ Firebase Admin initialized with default credentials');
        }
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error);
        throw new Error(`Firebase Admin initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return getFirestore();
}
/**
 * Get Firestore instance (ensures Firebase Admin is initialized)
 * Safe for module-level initialization
 */
export function getDb() {
    try {
        if (getApps().length === 0) {
            return initializeFirebaseAdmin();
        }
        return getFirestore();
    }
    catch (error) {
        console.error('❌ Failed to get Firestore instance:', error);
        throw error;
    }
}
