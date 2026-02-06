/**
 * 🛠️ DELETE REGISTRATION SCRIPT
 * Permite eliminar un registro del airdrop por wallet o email para pruebas.
 * Uso: node scripts/delete-registration.cjs [wallet-address-or-email]
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Configuración de la ruta del Service Account
// Intentar múltiples rutas comunes en este proyecto
const SERVICE_ACCOUNT_PATHS = [
    path.join(__dirname, '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json'),
    path.join(__dirname, './nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json'),
    path.join(process.cwd(), 'src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json')
];

let serviceAccountPath = null;
for (const p of SERVICE_ACCOUNT_PATHS) {
    if (fs.existsSync(p)) {
        serviceAccountPath = p;
        break;
    }
}

if (!serviceAccountPath) {
    console.error('❌ Error: No se encontró el archivo del Service Account de Firebase.');
    console.error('Buscado en:', SERVICE_ACCOUNT_PATHS);
    process.exit(1);
}

// Inicializar Firebase Admin
const serviceAccount = require(serviceAccountPath);
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';

async function deleteRegistration(identifier) {
    if (!identifier) {
        console.error('❌ Error: Debes proporcionar un wallet address o un email.');
        console.log('Ejemplo: node scripts/delete-registration.cjs MiWalletAddress123');
        return;
    }

    console.log(`🔍 Buscando registro para: ${identifier}...`);

    try {
        let query;
        if (identifier.includes('@')) {
            // Es un email
            query = db.collection(COLLECTION_NAME).where('email', '==', identifier.toLowerCase());
        } else {
            // Es un wallet
            query = db.collection(COLLECTION_NAME).where('wallet', '==', identifier);
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            console.log('❌ No se encontró ningún registro coincidente.');
            
            // Intento adicional: búsqueda parcial o sensible a mayúsculas si es wallet
            if (!identifier.includes('@')) {
                console.log('Probando búsqueda exacta sin normalización...');
                const backupQuery = db.collection(COLLECTION_NAME).where('wallet', '==', identifier);
                const backupSnapshot = await backupQuery.get();
                if (backupSnapshot.empty) {
                    console.log('Tampoco se encontró en búsqueda alternativa.');
                    return;
                }
                // Si llegamos aquí, procedemos con backupSnapshot
                return await proceedWithDeletion(backupSnapshot);
            }
            return;
        }

        await proceedWithDeletion(snapshot);

    } catch (error) {
        console.error('❌ Error crítico:', error);
    }
}

async function proceedWithDeletion(snapshot) {
    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
        console.log(`🗑️ Preparando eliminación de: ${doc.id}`);
        console.log(`   - Nombre: ${doc.data().name}`);
        console.log(`   - Email: ${doc.data().email}`);
        console.log(`   - Wallet: ${doc.data().wallet}`);
        batch.delete(doc.ref);
        count++;
    });

    if (count > 0) {
        await batch.commit();
        console.log(`✅ ¡Éxito! Se eliminaron ${count} registros.`);
    }
}

// Ejecutar script
const args = process.argv.slice(2);
deleteRegistration(args[0]).then(() => process.exit(0));
