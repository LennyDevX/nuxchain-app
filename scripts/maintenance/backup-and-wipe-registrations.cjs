/**
 * 💾 BACKUP & WIPE REGISTRATIONS SCRIPT
 * Hace backup de todas las wallets registradas y luego borra la colección de Firebase
 * para iniciar una nueva ronda de airdrop con varias medidas de seguridad mejorada.
 * 
 * Uso: node scripts/maintenance/backup-and-wipe-registrations.cjs
 * 
 * ⚠️ ADVERTENCIA: Este script BORRARÁ todos los registros después de hacer backup.
 * Asegúrate de que el backup se haya completado exitosamente antes de confirmar.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');
const { createWriteStream } = require('fs');
const { stringify } = require('csv-stringify/sync');

// Configuración de la ruta del Service Account
const SERVICE_ACCOUNT_PATHS = [
    path.join(__dirname, '../../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json'),
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

/**
 * Obtiene todos los registros de la colección
 */
async function getAllRegistrations() {
    console.log('📥 Obteniendo todos los registros de Firestore...');
    
    const registrations = [];
    
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        
        if (snapshot.empty) {
            console.warn('⚠️ No se encontraron registros en la colección.');
            return registrations;
        }
        
        console.log(`✅ Se encontraron ${snapshot.size} registros`);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            registrations.push({
                id: doc.id,
                ...data,
                // Convertir timestamps de Firestore a ISO string
                createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
                validatedAt: data.validatedAt?.toDate?.()?.toISOString?.() || data.validatedAt || null,
            });
        });
        
        return registrations;
    } catch (error) {
        console.error('❌ Error obteniendo registros:', error.message);
        throw error;
    }
}

/**
 * Guarda los registros en un archivo CSV
 */
function saveToCSV(registrations, filename) {
    console.log(`📊 Guardando backup en CSV: ${filename}...`);
    
    if (registrations.length === 0) {
        console.warn('⚠️ No hay registros para guardar.');
        return;
    }
    
    // Definir las columnas del CSV
    const columns = [
        'id',
        'name',
        'email',
        'wallet',
        'status',
        'network',
        'airdropAmount',
        'fingerprint',
        'ipAddress',
        'userAgent',
        'browserName',
        'browserVersion',
        'osName',
        'deviceType',
        'screenResolution',
        'timezone',
        'language',
        'timeToSubmit',
        'createdAt',
        'validatedAt'
    ];
    
    try {
        const csv = stringify(registrations, {
            header: true,
            columns: columns,
            quote: true,
            delimiter: ','
        });
        
        fs.writeFileSync(filename, csv, 'utf-8');
        console.log(`✅ CSV guardado exitosamente: ${filename}`);
        console.log(`   Tamaño: ${fs.statSync(filename).size} bytes`);
    } catch (error) {
        console.error('❌ Error guardando CSV:', error.message);
        throw error;
    }
}

/**
 * Guarda los registros en un archivo JSON
 */
function saveToJSON(registrations, filename) {
    console.log(`📄 Guardando backup en JSON: ${filename}...`);
    
    try {
        const jsonData = {
            exportedAt: new Date().toISOString(),
            totalRecords: registrations.length,
            data: registrations
        };
        
        fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2), 'utf-8');
        console.log(`✅ JSON guardado exitosamente: ${filename}`);
        console.log(`   Tamaño: ${fs.statSync(filename).size} bytes`);
    } catch (error) {
        console.error('❌ Error guardando JSON:', error.message);
        throw error;
    }
}

/**
 * Borra todos los registros de la colección en lotes (Firestore tiene límite de 500 ops/batch)
 */
async function wipeCollection() {
    console.log('\n🗑️  Borrando todos los registros de la colección...');
    
    try {
        const BATCH_SIZE = 500; // Límite de Firestore
        let totalDeleted = 0;
        let batchNumber = 1;
        
        while (true) {
            const snapshot = await db.collection(COLLECTION_NAME).limit(BATCH_SIZE).get();
            
            if (snapshot.empty) {
                console.log('✅ Colección completamente vacía.');
                break;
            }
            
            console.log(`   Lote ${batchNumber}: Eliminando ${snapshot.size} registros...`);
            
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            totalDeleted += snapshot.size;
            console.log(`   ✅ Lote ${batchNumber} completado (Total: ${totalDeleted})`);
            batchNumber++;
        }
        
        console.log(`\n✅ ${totalDeleted} registros borrados exitosamente.`);
        return totalDeleted;
    } catch (error) {
        console.error('❌ Error borrando registros:', error.message);
        throw error;
    }
}

/**
 * Función principal
 */
async function main() {
    try {
        console.log('═'.repeat(70));
        console.log('💾 BACKUP & WIPE REGISTRATIONS');
        console.log('═'.repeat(70));
        console.log('');
        
        // Crear directorio de reportes si no existe
        const reportsDir = path.join(process.cwd(), 'scripts/reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        // Obtener todos los registros
        const registrations = await getAllRegistrations();
        
        if (registrations.length === 0) {
            console.log('⚠️ No hay registros para hacer backup.');
            console.log('✅ Proceso completado sin cambios.');
            process.exit(0);
        }
        
        // Generar nombres de archivos con timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const csvFilename = path.join(reportsDir, `airdrop-backup-${timestamp}.csv`);
        const jsonFilename = path.join(reportsDir, `airdrop-backup-${timestamp}.json`);
        
        // Guardar backups
        saveToCSV(registrations, csvFilename);
        saveToJSON(registrations, jsonFilename);
        
        // Mostrar resumen
        console.log('');
        console.log('📋 RESUMEN DEL BACKUP:');
        console.log(`   Total de wallets: ${registrations.length}`);
        console.log(`   Archivo CSV: ${path.relative(process.cwd(), csvFilename)}`);
        console.log(`   Archivo JSON: ${path.relative(process.cwd(), jsonFilename)}`);
        
        // Estadísticas
        const statuses = {};
        const networks = {};
        registrations.forEach(reg => {
            statuses[reg.status] = (statuses[reg.status] || 0) + 1;
            networks[reg.network] = (networks[reg.network] || 0) + 1;
        });
        
        console.log('');
        console.log('📊 ESTADÍSTICAS:');
        console.log('   Por estado:', statuses);
        console.log('   Por network:', networks);
        
        // Confirmación para borrar
        console.log('');
        console.log('═'.repeat(70));
        console.log('⚠️ ADVERTENCIA CRÍTICA');
        console.log('═'.repeat(70));
        console.log('Se procederá a BORRAR todos los registros de Firebase.');
        console.log(`Total de registros a eliminar: ${registrations.length}`);
        console.log('');
        console.log('✅ Backups creados:');
        console.log(`   - ${path.relative(process.cwd(), csvFilename)}`);
        console.log(`   - ${path.relative(process.cwd(), jsonFilename)}`);
        console.log('');
        
        // Confirmación automática (usar variable de entorno para automatizar)
        const confirmDelete = process.env.CONFIRM_DELETE === 'true' || process.argv.includes('--confirm');
        
        if (!confirmDelete) {
            console.log('⏸️  Para confirmar y proceder con la eliminación, ejecuta:');
            console.log('');
            console.log('   CONFIRM_DELETE=true node scripts/maintenance/backup-and-wipe-registrations.cjs');
            console.log('');
            console.log('   o');
            console.log('');
            console.log('   node scripts/maintenance/backup-and-wipe-registrations.cjs --confirm');
            console.log('');
            process.exit(0);
        }
        
        // Borrar la colección
        const deletedCount = await wipeCollection();
        
        // Resumen final
        console.log('');
        console.log('═'.repeat(70));
        console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
        console.log('═'.repeat(70));
        console.log(`Total de registros procesados: ${registrations.length}`);
        console.log(`Total de registros eliminados: ${deletedCount}`);
        console.log('');
        console.log('📁 Archivos de backup guardados en: scripts/reports/');
        console.log('');
        console.log('🚀 Listo para iniciar nueva ronda de airdrop con medidas mejoradas.');
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('═'.repeat(70));
        console.error('❌ ERROR DURANTE LA EJECUCIÓN');
        console.error('═'.repeat(70));
        console.error('Error:', error.message);
        console.error('');
        console.error('⚠️ Los registros NO han sido eliminados. Verifica el error e intenta nuevamente.');
        console.error('');
        process.exit(1);
    }
}

// Ejecutar
main();
