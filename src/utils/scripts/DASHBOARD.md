# 🎯 Sistema de Gestión de Airdrop $NUX

## 📂 Estructura de Scripts

```
src/utils/scripts/
├── AirdropsWallet.js              # 🎛️  Script principal de gestión
├── setup.js                       # ⚙️  Configuración inicial
├── distribute.js                  # 🚀 Preparar para distribución
├── GUIA_RAPIDA.md                # 📖 Instrucciones rápidas
├── README.md                      # 📚 Documentación completa
├── INTEGRACION_BLOCKCHAIN.js      # 🔗 Ejemplos de blockchain
└── airdrop-exports/               # 📁 Carpeta de exportaciones
    ├── airdrop-users.csv
    ├── airdrop-users.json
    ├── airdrop-distribution-*.json
    └── distribution-*.json
```

---

## 🚀 Inicio Rápido

### Paso 1: Configuración (2 minutos)
```bash
# Descargar credenciales de Firebase
# (Firebase Console → Configuración → Cuentas de servicio)

# Instalar dependencias
npm install firebase-admin json2csv chalk

# Ejecutar setup
node src/utils/scripts/setup.js
```

### Paso 2: Verificar Estado
```bash
node src/utils/scripts/AirdropsWallet.js stats
```

### Paso 3: Distribuir
```bash
node src/utils/scripts/distribute.js solana
```

---

## 📊 Características Principales

### ✅ AirdropsWallet.js

| Comando | Función | Salida |
|---------|---------|--------|
| `stats` | Ver estadísticas | Consola + tabla |
| `export` | Descargar datos | CSV + JSON |
| `validate` | Verificar wallets | Problemas encontrados |
| `distribute` | Preparar distribución | Reporte JSON |
| `list` | Listar usuarios | Primeros 20 |

**Funcionalidades:**
- 📈 Conteo en tiempo real de registrados
- ✔️ Validación automática de wallets
- 🔍 Detección de duplicados
- 📊 Estadísticas de pool
- 💾 Exportación en múltiples formatos

### 🚀 distribute.js

| Formato | Para | Salida |
|---------|------|--------|
| `csv` | Excel / Hojas | CSV plano |
| `json` | Procesamiento | JSON estructurado |
| `solana` | Solana blockchain | Instrucciones SPL |
| `polygon` | EVM (Polygon) | ABI compatible |
| `batch` | Distribución por lotes | Formato por lotes |

**Ejemplo:**
```bash
node distribute.js solana      # Todos los usuarios
node distribute.js csv 100     # Primeros 100
node distribute.js json 500    # Primeros 500
```

---

## 📋 Parámetros del Airdrop

```javascript
TOKENS_PER_USER = 50,000        // NUX por usuario
MAX_AIRDROP_POOL = 50,000,000   // Pool máximo
MAX_USERS = 1,000               // Usuarios máximo
POL_BONUS_PER_USER = 20         // POL por usuario
```

---

## 📊 Ejemplo de Salida

### stats
```
============================================================
📊 ESTADÍSTICAS DEL AIRDROP
============================================================

  Registros Totales:        150
  Wallets Válidas:          148
  Wallets Inválidas:        2
  Wallets Duplicadas:       0
  
  Pool Máximo NUX:          50,000,000
  Tokens por Usuario:       50,000
  POL Bonus por Usuario:    20
  
  NUX Total a Distribuir:   7,400,000
  POL Total a Distribuir:   2,960
  
  Capacidad del Pool:       15.00% (150/1000 usuarios)
  Slots Disponibles:        850

============================================================
```

### distribute.js solana
```json
{
  "network": "solana",
  "timestamp": "2026-01-28T10:30:00Z",
  "totalTransfers": 150,
  "distributions": [
    {
      "id": 1,
      "recipient": "0x1234567890abcdef...",
      "nuxTokens": 50000,
      "polBonus": 20,
      "metadata": {
        "email": "juan@email.com",
        "name": "Juan Pérez"
      }
    }
  ],
  "summary": {
    "totalNUX": "7400000",
    "totalPOL": "2960",
    "gasEstimate": "~0.0375 SOL"
  }
}
```

---

## 🔄 Flujo de Trabajo Típico

```
Lunes
  ├─ Ver estado
  │  └─ node AirdropsWallet.js stats
  │
Martes
  ├─ Validar datos
  │  └─ node AirdropsWallet.js validate
  │
Miércoles
  ├─ Preparar distribución
  │  └─ node AirdropsWallet.js distribute
  │
Jueves
  ├─ Exportar para blockchain
  │  └─ node distribute.js solana
  │
Viernes
  └─ Distribuir en blockchain
     └─ (Usar smart contract)
```

---

## 📁 Archivos Generados

### CSV
```
Wallet,NUX Tokens,POL Bonus,Name,Email,Registered At
0x1234...,50000,20,Juan Pérez,juan@email.com,2026-01-28
```

### JSON (distribution)
```json
{
  "validUsers": [...],
  "invalidUsers": [...],
  "summary": {
    "totalNUX": 7400000,
    "totalPOL": 2960
  }
}
```

---

## 🔐 Requisitos de Seguridad

1. **Firebase Credentials** 🔑
   - Descargadas desde Firebase Console
   - Guardadas en archivo `.json` en la raíz
   - ⚠️ Nunca commitear al repositorio

2. **Reglas de Firestore** ✅
   ```
   match /nuxchainAirdropRegistrations/{registrationId} {
     allow create: if true;
     allow read: if true;
   }
   ```

3. **Privacidad de Datos** 🔒
   - Los reportes contienen wallets públicas (OK)
   - Emails no se comparten públicamente
   - Usar SFTP/seguro para transferencias

---

## 🛠️ Mantenimiento

### Actualizar parámetros
Edit `AirdropsWallet.js` línea 14-17:
```javascript
const TOKENS_PER_USER = 50000;
const MAX_AIRDROP_POOL = 50000000;
const MAX_USERS = 1000;
const POL_BONUS_PER_USER = 20;
```

### Limpiar exportaciones antiguas
```bash
rm -rf src/utils/scripts/airdrop-exports/*
```

### Ver logs de Firebase
```bash
npm run firebase:logs
# o en Firebase Console → Logs
```

---

## 🐛 Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| ❌ "Missing permissions" | Reglas Firestore | Permitir `read` |
| ❌ "Credenciales no encontradas" | Archivo no descargado | Descargar desde Console |
| ❌ "Wallets inválidas" | Formato incorrecto | Contactar usuarios |
| ⚠️ "Pool capacity > 100%" | Demasiados usuarios | Aumentar MAX_AIRDROP_POOL |

---

## 📞 Soporte

- 📖 **Documentación**: [README.md](README.md)
- ⚡ **Guía Rápida**: [GUIA_RAPIDA.md](GUIA_RAPIDA.md)
- 🔗 **Blockchain**: [INTEGRACION_BLOCKCHAIN.js](INTEGRACION_BLOCKCHAIN.js)
- 💬 **Issues**: GitHub Issues

---

## 📈 Estadísticas Esperadas

| Métrica | Estimado | Actual |
|---------|----------|--------|
| Usuarios max | 1,000 | - |
| Pool NUX | 50M | - |
| NUX por usuario | 50K | - |
| POL bonus total | 20K | - |
| Capacidad (%) | 0-100% | - |

---

## ✨ Características Futuras

- [ ] Dashboard web en tiempo real
- [ ] API REST para integración
- [ ] Notificaciones por email
- [ ] Historiales de distribución
- [ ] Análisis de datos
- [ ] Refunds automáticos
- [ ] Métricas de airdrop

---

## 📅 Timeline del Airdrop

- **27 Enero 2026**: Abre registro
- **10 Febrero 2026**: Cierre registro
- **11 Febrero 2026**: Validación final
- **12-14 Febrero**: Distribución
- **15+ Febrero**: Confirmaciones

---

## 📊 Dashboard Rápido

```bash
#!/bin/bash
# dashboard.sh - Ver estado en tiempo real

clear
echo "🎁 Dashboard Airdrop $NUX"
node src/utils/scripts/AirdropsWallet.js stats

# Repetir cada 30 segundos
sleep 30
exec $0
```

Usa con: `bash dashboard.sh`

---

¡Sistema de gestión de airdrop completamente funcional! 🚀
