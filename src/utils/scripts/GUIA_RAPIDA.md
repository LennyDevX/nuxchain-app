# 🎁 Guía Rápida - Gestión del Airdrop $NUX

## ⚡ Setup Inicial (5 minutos)

### 1. Descargar credenciales Firebase
```bash
# Firebase Console → nuxchain1 → ⚙️ Configuración → Cuentas de servicio
# Descargar JSON y colocar en raíz como: firebase-credentials.json
```

### 2. Instalar dependencias
```bash
npm install firebase-admin json2csv chalk
```

### 3. Ejecutar setup
```bash
node src/utils/scripts/setup.js
```

---

## 📊 Comandos Diarios

### Ver estado del airdrop
```bash
node src/utils/scripts/AirdropsWallet.js stats
```
**Mostrará:**
- Total de registros ✅
- Wallets válidas ✅
- Total NUX/POL a distribuir 💰
- Capacidad del pool % 📈

### Exportar datos
```bash
node src/utils/scripts/AirdropsWallet.js export
```
**Genera:**
- `airdrop-users.csv` (para Excel)
- `airdrop-users.json` (para procesamiento)

### Validar wallets
```bash
node src/utils/scripts/AirdropsWallet.js validate
```
**Detecta:**
- Wallets con formato inválido ❌
- Duplicadas 📌
- Problemas antes de distribuir ⚠️

---

## 🚀 Distribución

### Preparar para Smart Contract
```bash
# Solana
node src/utils/scripts/distribute.js solana

# Polygon/EVM
node src/utils/scripts/distribute.js polygon

# Formato genérico
node src/utils/scripts/distribute.js csv
```

### Distribuir a usuarios específicos
```bash
# Primeros 100 usuarios
node src/utils/scripts/distribute.js json 100

# Primeros 500 usuarios
node src/utils/scripts/distribute.js csv 500
```

---

## 📈 Flujo Típico de Distribución

```bash
# Lunes
1. Ver estadísticas
   node src/utils/scripts/AirdropsWallet.js stats

# Martes
2. Validar integridad
   node src/utils/scripts/AirdropsWallet.js validate

# Miércoles
3. Preparar distribución final
   node src/utils/scripts/AirdropsWallet.js distribute

# Jueves
4. Exportar para contrato
   node src/utils/scripts/distribute.js solana

# Viernes
5. Ejecutar distribución en blockchain
   # (Usar herramienta de deployment)
```

---

## 📂 Archivos Generados

```
src/utils/scripts/airdrop-exports/
├── airdrop-users.csv                    # Todos los usuarios (CSV)
├── airdrop-users.json                   # Todos los usuarios (JSON)
├── airdrop-distribution-2026-01-28.json # Reporte completo
├── distribution-solana-2026-01-28.json  # Formato Solana
├── distribution-evm-2026-01-28.json     # Formato Polygon
└── distribution-2026-01-28.csv          # Exportación simple
```

---

## 💾 Estructura de Datos

### Usuario en Firebase
```javascript
{
  id: "abc123",
  name: "Juan Pérez",
  email: "juan@email.com",
  wallet: "0x1234567890abcdef...",
  status: "pending",
  createdAt: timestamp,
  airdropAmount: "20" // POL
}
```

### Usuario en reporte de distribución
```javascript
{
  name: "Juan Pérez",
  email: "juan@email.com",
  wallet: "0x1234567890abcdef...",
  nuxTokens: 50000,
  polBonus: 20,
  status: "ready_for_distribution",
  createdAt: "2026-01-28T10:30:00Z"
}
```

---

## 🔍 Troubleshooting

| Problema | Solución |
|----------|----------|
| ❌ "Missing or insufficient permissions" | Actualiza reglas Firestore: `allow read: if true;` |
| ❌ "firebase-credentials.json not found" | Descarga desde Firebase Console y coloca en raíz |
| ❌ "Módulos no encontrados" | `npm install firebase-admin json2csv chalk` |
| ❌ "Wallets duplicadas detectadas" | Revisa duplicados en `airdrop-distribution.json` |
| ⚠️ "Pool capacity > 100%" | Hay más usuarios que slots (1000 máximo) |

---

## 💡 Tips

1. **Respalda exportaciones**: Los archivos JSON se guardan con fecha
2. **Valida primero**: Siempre ejecuta `validate` antes de distribuir
3. **Test pequeño**: Usa `distribute.js csv 10` para probar primero
4. **Monitorea Pool**: Revisa `stats` regularmente para ver ocupación
5. **Email confirmación**: Los usuarios reciben confirmación al registrarse

---

## 📞 Parámetros Configurables

Edita `AirdropsWallet.js` línea 14-17:

```javascript
const TOKENS_PER_USER = 50000;        // 50K NUX
const MAX_AIRDROP_POOL = 50000000;    // 50M máximo
const MAX_USERS = 1000;                // 1000 usuarios máximo
const POL_BONUS_PER_USER = 20;        // 20 POL bonus
```

---

## 🎯 Resumen

| Comando | Para | Salida |
|---------|------|--------|
| `stats` | Ver estado del airdrop | Consola |
| `export` | Guardar todos los datos | CSV + JSON |
| `validate` | Revisar wallets | Problemas detectados |
| `distribute` | Generar reporte final | JSON detallado |
| `distribute.js solana` | Preparar para blockchain | JSON blockchain |

---

## 📅 Calendario de Distribución

- **Ahora**: Recibiendo registros
- **Antes del 10 Feb**: Validar y preparar
- **10 Feb**: Distribución del airdrop
- **Después**: Confirmación en blockchain

---

¡Listo para distribuir! 🚀
