# Airdrop Management Script

Script para gestionar y distribuir el airdrop de $NUX tokens de manera eficiente.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install firebase-admin json2csv chalk
```

### 2. Configurar credenciales de Firebase

Descarga el archivo de credenciales desde Firebase Console:

1. Ve a **Firebase Console** → Tu proyecto **nuxchain1**
2. Haz clic en ⚙️ **Configuración del proyecto**
3. Ir a **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada** (JSON)
5. Coloca el archivo `firebase-credentials.json` en la **raíz del proyecto**

O establece la ruta personalizada:
```bash
export FIREBASE_CREDENTIALS=/ruta/a/credenciales.json
```

## 📋 Comandos Disponibles

### 1. **Mostrar Estadísticas** (Por defecto)
```bash
node src/utils/scripts/AirdropsWallet.js stats
```

Muestra:
- Total de registros
- Wallets válidas e inválidas
- Total NUX y POL a distribuir
- Capacidad del pool
- Slots disponibles

### 2. **Exportar Datos**
```bash
node src/utils/scripts/AirdropsWallet.js export
```

Genera:
- `airdrop-users.csv` - Para Excel/Sheets
- `airdrop-users.json` - Para procesamiento programático

Los archivos se guardan en `src/utils/scripts/airdrop-exports/`

### 3. **Validar Wallets**
```bash
node src/utils/scripts/AirdropsWallet.js validate
```

Valida:
- ✅ Formato correcto (0x + 40 caracteres hex)
- ⚠️ Wallets duplicadas
- ⚠️ Wallets inválidas

### 4. **Preparar Distribución**
```bash
node src/utils/scripts/AirdropsWallet.js distribute
```

Genera:
- Reporte completo de distribución
- Detalles de cada usuario
- Wallets inválidas/duplicadas
- Totales finales

El reporte se guarda como `airdrop-distribution-YYYY-MM-DD.json`

### 5. **Listar Usuarios**
```bash
node src/utils/scripts/AirdropsWallet.js list
```

Muestra:
- Primeros 20 usuarios
- Nombre, email, wallet
- Fecha de registro
- Estadísticas generales

## 📊 Estructura de Datos de Salida

### CSV (airdrop-users.csv)
```
ID Firebase,Nombre,Email,Wallet Address,Tokens NUX,POL Bonus,...
abc123,Juan Pérez,juan@email.com,0x1234...,50000,20,...
```

### JSON (airdrop-distribution-YYYY-MM-DD.json)
```json
{
  "generatedAt": "2026-01-28T10:30:00Z",
  "summary": {
    "totalRegistrations": 150,
    "validWallets": 148,
    "invalidWallets": 2,
    "distribution": {
      "totalNUXTokens": "7400000",
      "totalPOLBonus": "2960",
      "poolCapacity": "14.8%"
    }
  },
  "validUsers": [...],
  "invalidUsers": [...],
  "duplicateWallets": [...]
}
```

## 🔒 Validación de Wallets

El script valida automáticamente:
- **Formato**: Comienza con `0x` y tiene 42 caracteres (0x + 40 hex)
- **Duplicados**: Detecta wallets repetidas
- **Estado**: Marca como "ready_for_distribution"

## 📈 Ejemplo de Flujo de Trabajo

```bash
# 1. Ver estadísticas actuales
node src/utils/scripts/AirdropsWallet.js stats

# 2. Validar integridad de datos
node src/utils/scripts/AirdropsWallet.js validate

# 3. Exportar para procesamiento
node src/utils/scripts/AirdropsWallet.js export

# 4. Preparar distribución final
node src/utils/scripts/AirdropsWallet.js distribute

# 5. Revisar reporte generado
cat src/utils/scripts/airdrop-exports/airdrop-distribution-2026-01-28.json
```

## 💡 Tips para Distribución

1. **Antes de ejecutar**: Asegúrate de que Firebase tenga las reglas correctas:
   ```
   allow read: if true;
   allow create: if true;
   ```

2. **Validación**: Ejecuta `validate` antes de distribuir para detectar problemas

3. **Exportación**: Usa CSV para cargar en sistemas de distribución (Smart Contracts, APIs)

4. **Respaldo**: Los reportes JSON se guardan con fecha para auditoría

## ⚙️ Configuración

Parámetros configurables en el script:

```javascript
const TOKENS_PER_USER = 50000;        // NUX por usuario
const MAX_AIRDROP_POOL = 50000000;    // Pool máximo
const POL_BONUS_PER_USER = 20;        // POL bonus
```

## 🐛 Troubleshooting

**Error: "Missing or insufficient permissions"**
- Verifica las reglas de Firestore
- Asegúrate de que `allow read: if true;` esté habilitado

**Error: "firebase-credentials.json not found"**
- Descarga las credenciales desde Firebase Console
- Colócalas en la raíz del proyecto

**Error: Módulos no encontrados**
```bash
npm install firebase-admin json2csv chalk
```

## 📞 Soporte

Para más detalles sobre la distribución:
- Revisa los JSONs generados en `airdrop-exports/`
- Verifica los logs de validación para problemas
