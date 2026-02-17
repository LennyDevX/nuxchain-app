# 💾 Backup & Wipe Registrations Script

Script para hacer backup de todas las wallets registradas en el airdrop y luego borrar la colección de Firebase para iniciar una nueva ronda con medidas de seguridad mejorada.

## ⚠️ Advertencia Crítica

Este script **BORRARÁ permanentemente** todos los registros de la colección `nuxchainAirdropRegistrations` en Firebase después de hacer el backup. Asegúrate de revisar los archivos de backup antes de confirmar la eliminación.

## 📋 Funcionalidades

- ✅ Extrae todos los registros de Firestore
- ✅ Exporta a formato CSV (compatible con Excel/Sheets)
- ✅ Exporta a formato JSON (para análisis programático)
- ✅ Incluye metadatos de validación y fingerprinting
- ✅ Genera timestamps automáticos en los nombres de archivos
- ✅ Calcula estadísticas de registros por estado y network
- ✅ Requiere confirmación explícita antes de borrar datos
- ✅ Proporciona logs detallados de operaciones

## 🚀 Uso

### Paso 1: Generar Backup (Sin Eliminar)

```bash
node scripts/maintenance/backup-and-wipe-registrations.cjs
```

Este comando:
1. Conecta a Firebase
2. Extrae todos los registros
3. Genera archivos de backup en `scripts/reports/airdrop-backup-YYYY-MM-DD-HH-mm-ss.{csv,json}`
4. Muestra estadísticas de los registros
5. **NO elimina nada** - espera confirmación

**Output esperado:**
```
═══════════════════════════════════════════════════════════
💾 BACKUP & WIPE REGISTRATIONS
═══════════════════════════════════════════════════════════

📥 Obteniendo todos los registros de Firestore...
✅ Se encontraron 1,234 registros

📊 Guardando backup en CSV: scripts/reports/airdrop-backup-2024-01-15-14-30-25.csv...
✅ CSV guardado exitosamente: scripts/reports/airdrop-backup-2024-01-15-14-30-25.csv
   Tamaño: 156,789 bytes

📄 Guardando backup en JSON: scripts/reports/airdrop-backup-2024-01-15-14-30-25.json...
✅ JSON guardado exitosamente: scripts/reports/airdrop-backup-2024-01-15-14-30-25.json
   Tamaño: 234,567 bytes

📋 RESUMEN DEL BACKUP:
   Total de wallets: 1,234
   Archivo CSV: scripts/reports/airdrop-backup-2024-01-15-14-30-25.csv
   Archivo JSON: scripts/reports/airdrop-backup-2024-01-15-14-30-25.json

📊 ESTADÍSTICAS:
   Por estado: { validated: 1,150, pending: 84 }
   Por network: { ethereum: 700, solana: 534 }

⏸️  Para confirmar y proceder con la eliminación, ejecuta:

   CONFIRM_DELETE=true node scripts/maintenance/backup-and-wipe-registrations.cjs

   o

   node scripts/maintenance/backup-and-wipe-registrations.cjs --confirm
```

### Paso 2: Revisar Backups

Los archivos se encuentran en `scripts/reports/`:

**Archivo CSV:**
- Apto para Excel, Google Sheets, o cualquier herramienta de análisis
- Columnas: `id`, `name`, `email`, `wallet`, `status`, `network`, `airdropAmount`, etc.
- Fácil para filtrado y análisis rápido

**Archivo JSON:**
- Estructura completa con metadatos
- Incluye campo `exportedAt` con timestamp
- Ideal para importar en bases de datos o procesamiento programático

### Paso 3: Confirmar Eliminación

Una vez verificado que el backup se creó correctamente:

```bash
CONFIRM_DELETE=true node scripts/maintenance/backup-and-wipe-registrations.cjs
```

O con flag:

```bash
node scripts/maintenance/backup-and-wipe-registrations.cjs --confirm
```

## 📊 Campos del Backup

Cada registro incluye:

| Campo | Descripción |
|-------|-------------|
| `id` | ID único del documento |
| `name` | Nombre del usuario |
| `email` | Email del usuario |
| `wallet` | Dirección de wallet |
| `status` | Estado (`validated`, `pending`, etc.) |
| `network` | Red blockchain (`ethereum`, `solana`) |
| `airdropAmount` | Cantidad de tokens asignada |
| `fingerprint` | Hash del navegador/dispositivo |
| `ipAddress` | IP del registro |
| `userAgent` | User Agent del navegador |
| `browserName` | Navegador utilizado |
| `browserVersion` | Versión del navegador |
| `osName` | Sistema operativo |
| `deviceType` | Tipo de dispositivo (desktop/mobile) |
| `screenResolution` | Resolución de pantalla |
| `timezone` | Zona horaria del usuario |
| `language` | Idioma preferido |
| `timeToSubmit` | Tiempo en segundos para completar registro |
| `createdAt` | Timestamp de creación |
| `validatedAt` | Timestamp de validación |

## 🔍 Análisis de Datos

Después del backup, puedes analizar los datos:

### Con CSV en Excel/Sheets:
1. Abre el archivo CSV
2. Filtra por `status = validated`
3. Analiza distribución por `network`
4. Examina `fingerprint` duplicados para detectar fraude

### Con JSON mediante Node.js:

```javascript
const backup = require('./scripts/reports/airdrop-backup-2024-01-15-14-30-25.json');

// Contar por status
const byStatus = backup.data.reduce((acc, reg) => {
    acc[reg.status] = (acc[reg.status] || 0) + 1;
    return acc;
}, {});
console.log('Por status:', byStatus);

// Encontrar wallets duplicadas
const duplicates = backup.data.reduce((acc, reg) => {
    if (acc[reg.wallet]) {
        acc[reg.wallet].push(reg.id);
    } else {
        acc[reg.wallet] = [reg.id];
    }
    return acc;
}, {});

const duplicateWallets = Object.entries(duplicates)
    .filter(([_, ids]) => ids.length > 1)
    .map(([wallet, ids]) => ({ wallet, count: ids.length, ids }));

console.log('Wallets duplicadas:', duplicateWallets);
```

## 🛡️ Medidas de Seguridad Mejorada para Nueva Ronda

Después de limpiar la base de datos, considera implementar:

1. **Rate Limiting Mejorado**: Limita registros por IP a 1-2 por día
2. **Análisis de Fingerprint**: Detecta múltiples registros del mismo dispositivo
3. **Validación de Email**: Requiere confirmación por email
4. **Timeouts**: Detecta registros muy rápidos (bots)
5. **CAPTCHA**: Agrega verificación adicional
6. **Blacklist de Wallets**: Mantén registro de direcciones rechazadas
7. **Análisis de Comportamiento**: Historial de intentos fallidos por IP

## 📁 Archivos Generados

Los backups se guardan en:
```
scripts/reports/
├── airdrop-backup-2024-01-15-14-30-25.csv
├── airdrop-backup-2024-01-15-14-30-25.json
├── airdrop-backup-2024-01-14-10-15-30.csv
├── airdrop-backup-2024-01-14-10-15-30.json
└── ... (otros backups anteriores)
```

## 🚨 Troubleshooting

### Error: "No se encontró el archivo del Service Account"

**Solución**: Asegúrate de que el archivo `nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json` esté en:
- `src/utils/scripts/` (ubicación recomendada)
- O copia el archivo a la raíz del proyecto

### Error: "Permission denied"

**Solución**: Verifica que tu cuenta de Firebase/Service Account tenga permisos:
```
collection: nuxchainAirdropRegistrations {
  allow read, write: if request.auth != null;
}
```

### Los registros que quería no aparecen

**Solución**: Revisa que estés conectando a la base de datos correcta:
- Verifica `projectId` en el Service Account
- Confirma que `COLLECTION_NAME = 'nuxchainAirdropRegistrations'`

## ✅ Checklist Antes de Eliminar

- [ ] Ejecutaste el script sin `--confirm` para generar backup
- [ ] Verificaste que los archivos CSV y JSON se crearon
- [ ] Revisaste los archivos de backup (abre CSV en Excel/Sheets)
- [ ] Confirmaste el número de registros a eliminar
- [ ] Realizaste backup adicional/manual si es necesario
- [ ] Guardaste los archivos en ubicación segura (cloud, USB, etc.)
- [ ] Informaste al equipo sobre la limpieza
- [ ] Ejecutaste el comando con `--confirm` para proceder

## 📞 Soporte

Si encuentras errores, revisa:
1. Logs detallados en la consola
2. Permisos de Firebase/Firestore
3. Existencia del Service Account JSON
4. Conexión a internet

---

**Última actualización**: Enero 2024
**Status**: ✅ Listo para producción
**Próximo paso**: Nueva ronda de airdrop con medidas mejoradas
