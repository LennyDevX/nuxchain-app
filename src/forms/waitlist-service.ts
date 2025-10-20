import { collection, addDoc, serverTimestamp, type Firestore, type DocumentReference, type DocumentData } from 'firebase/firestore';

export async function submitToWaitlist(
  db: Firestore,
  name: string | undefined | null,
  specialization: string | undefined | null,
  email: string
) {
  try {
    console.log('📝 Starting waitlist submission...');
    console.log('Received data:', { name, specialization, email });
    
    // Verificar que Firestore esté inicializado
    if (!db) {
      console.error('❌ Firestore instance is undefined');
      throw new Error('Database connection not initialized. Please refresh the page.');
    }
    
    // Validar email
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    
    if (!emailRegex.test(trimmedEmail)) {
      console.error('❌ Email validation failed:', trimmedEmail);
      throw new Error('Invalid email format');
    }

    // Normalizar datos
    const normalizedEmail = trimmedEmail.toLowerCase();
    let finalName = (name ?? '').toString().trim();
    if (!finalName) {
      const localPart = normalizedEmail.split('@')[0] || 'anonymous';
      finalName = localPart.length > 0 ? localPart : 'Anonymous';
    }
    
    let finalSpecialization = (specialization ?? '').toString().trim();
    if (!finalSpecialization) {
      finalSpecialization = 'General';
    }

    // Crear documento con estructura exacta
    const waitlistData = {
      name: finalName,
      specialization: finalSpecialization,
      email: normalizedEmail,
      createdAt: serverTimestamp()
    };

    console.log('📤 Sending to Firestore:', waitlistData);

    // Intentar agregar a Firestore con timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout. Please check your connection.')), 10000);
    });

    const addDocPromise = addDoc(collection(db, 'nuxchainKitWaitlist'), waitlistData);
    
    const docRef: DocumentReference<DocumentData> = await Promise.race([addDocPromise, timeoutPromise]);

    console.log('✅ Successfully added to waitlist:', docRef.id);
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('❌ Error in submitToWaitlist:', error);
    
    if (error instanceof Error) {
      // Error específico de permisos
      if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Access denied. Please check Firestore security rules or contact support.');
      }
      
      // Error de configuración de Firebase
      if (error.message.includes('not initialized') || error.message.includes('Firebase') || error.message.includes('app/invalid-credential')) {
        throw new Error('Database configuration error. Please refresh and try again.');
      }
      
      // Error de red o conexión
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Re-lanzar errores de validación
      if (error.message.includes('Invalid') || error.message.includes('required')) {
        throw error;
      }
    }

    throw new Error('Failed to submit to waitlist. Please try again later.');
  }
}

export { submitToWaitlist as registerForWaitlist };