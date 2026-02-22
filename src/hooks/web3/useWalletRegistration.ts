import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface WalletRegistrationData {
  polygonAddress: string;
  solanaAddress: string;
  solanaWalletName: string | null;
  registeredAt: Date;
  isActive: boolean;
}

export function useWalletRegistration(polygonAddress: string | undefined) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<WalletRegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already registered
  useEffect(() => {
    if (!polygonAddress) {
      setIsLoading(false);
      return;
    }

    const checkRegistration = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const docRef = doc(db, 'walletRegistrations', polygonAddress.toLowerCase());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsRegistered(true);
          setRegistrationData({
            polygonAddress: data.polygonAddress,
            solanaAddress: data.solanaAddress,
            solanaWalletName: data.solanaWalletName,
            registeredAt: data.registeredAt?.toDate() || new Date(),
            isActive: data.isActive ?? true,
          });
        } else {
          setIsRegistered(false);
          setRegistrationData(null);
        }
      } catch (err) {
        console.error('Error checking wallet registration:', err);
        setError('Failed to check registration status');
        // Don't set isRegistered to false on error - keep current state
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [polygonAddress]);

  // Save registration to Firebase
  const saveRegistration = useCallback(async (
    solanaAddress: string,
    solanaWalletName: string | null
  ): Promise<boolean> => {
    if (!polygonAddress) {
      setError('Polygon wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const polygonAddressLower = polygonAddress.toLowerCase();
      const registrationData = {
        polygonAddress: polygonAddressLower,
        solanaAddress: solanaAddress,
        solanaWalletName: solanaWalletName,
        registeredAt: serverTimestamp(),
        isActive: true,
        lastUpdated: serverTimestamp(),
      };

      // Use polygonAddress as document ID for verification
      await setDoc(
        doc(db, 'walletRegistrations', polygonAddressLower),
        registrationData
      );

      setIsRegistered(true);
      setRegistrationData({
        polygonAddress: polygonAddressLower,
        solanaAddress: solanaAddress,
        solanaWalletName: solanaWalletName,
        registeredAt: new Date(),
        isActive: true,
      });

      console.log('✅ Wallet registration saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving wallet registration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [polygonAddress]);

  return {
    isRegistered,
    registrationData,
    isLoading,
    error,
    saveRegistration,
  };
}
