# 🔍 Wallet Analysis Scripts

Herramientas avanzadas para depurar y analizar wallets registradas en el airdrop.

## 🚀 Quick Start

### 1. Buscar una wallet individual
```bash
npm run wallet:search
# o
node scripts/search-wallet-advanced.cjs
```

**Ejemplo de uso:**
```
📍 Enter wallet address to search: 9B5X1CwQQwgh...
# Espera el análisis completo
# Escribe "export" para guardar en CSV
# Escribe "exit" para salir
```

### 2. Analizar TODAS las wallets registradas
```bash
npm run wallet:analyze
# o
node scripts/bulk-wallet-analysis.cjs
```

**Genera automáticamente:**
- Reporte CSV completo
- Estadísticas de riesgo
- Top 10 wallets sospechosas
- Análisis de IP farms

### 3. Eliminar bots detectados
```bash
npm run wallet:wipe-bots
# o
node scripts/wipe-bots.cjs
```

> ⚠️ **ADVERTENCIA**: Este script elimina registros. Usa solo después de confirmar que deseas hacerlo.

---

## 📊 Sistema de Risk Score

| Rango | Clasificación | Acción |
|-------|---------------|--------|
| 0-29 | ✅ REAL USER | Aceptar |
| 30-49 | ❓ UNCERTAIN | Monitorear |
| 50-69 | ⚠️ LIKELY BOT | Revisar manualmente |
| 70-100 | 🚩 SUSPICIOUS/BOT | Eliminar |

---

## 📋 Datos Analizados

### Email Intelligence
- ✅ Dominio desechable (tempmail, guerrillamail, etc)
- ✅ Patrones sospechosos
- ✅ Estructura inusual

### Name Analysis
- ✅ Patrones de bot (test, admin, user123, etc)
- ✅ Mayúsculas excesivas
- ✅ Longitud sospechosa

### On-Chain Validation
- ✅ Existe en blockchain Solana
- ✅ Balance mínimo (0.001 SOL)
- ✅ Historial de transacciones
- ✅ Edad de la wallet

### Device & Browser
- ✅ Navegador y versión
- ✅ Sistema operativo
- ✅ Tipo de dispositivo
- ✅ Resolución de pantalla
- ✅ Zona horaria
- ✅ Velocidad de sumisión

---

## 📁 Archivos en Este Directorio

| Archivo | Propósito |
|---------|-----------|
| `search-wallet-advanced.cjs` | Búsqueda individual interactiva |
| `bulk-wallet-analysis.cjs` | Análisis masivo de todas las wallets |
| `analyze-registrations.cjs` | Analizador de registraciones (original) |
| `wipe-bots.cjs` | Eliminador de bots (original) |
| `search-wallet.cjs` | Búsqueda simple (deprecated) |

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Verificar una sola wallet
```bash
npm run wallet:search
# Escribe la dirección de wallet
# Analiza todos los datos
# Escribe "export" si deseas guardar el resultado
```

### Ejemplo 2: Auditoría completa
```bash
npm run wallet:analyze
# Espera a que termine automáticamente
# Se genera: all-wallets-analysis-FECHA.csv
# Se muestran estadísticas en consola
```

### Ejemplo 3: Búsqueda múltiple
```bash
npm run wallet:search
# Wallet 1
# Wallet 2
# Wallet 3
# export (guarda todas en CSV)
# exit
```

---

## 📈 Interpretando Resultados

### Usuario Real (Score < 30)
```
✅ Real User
Indicadores:
- Balance > 0.5 SOL
- Múltiples transacciones
- Email conocido (@gmail, @outlook)
- Nombre normal
- Wallet > 60 días
```

### Bot Probable (Score > 70)
```
🚩 Suspicious/Bot
Indicadores:
- Balance < 0.001 SOL
- Cero transacciones
- Email desechable (tempmail)
- Nombre sospechoso (test123, admin)
- Wallet recién creada (< 7 días)
```

---

## 🔍 Buscar Información Específica en CSV

```bash
# Encontrar solo usuarios reales
grep "REAL USER" all-wallets-analysis*.csv > real-users.csv

# Encontrar bots
grep "SUSPICIOUS" all-wallets-analysis*.csv > bots.csv

# Contar usuarios sospechosos
grep "SUSPICIOUS" all-wallets-analysis*.csv | wc -l

# Wallets con balance muy bajo
awk -F',' '$11 < 0.001' all-wallets-analysis*.csv
```

---

## ⚙️ Configuración

Puedes editar estos valores en los scripts si necesitas ajustar:

```javascript
const MIN_SOL_BALANCE = 0.001; // Balance mínimo
const MIN_WALLET_AGE_DAYS = 30; // Antigüedad mínima
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com'; // RPC endpoint
```

---

## 📞 Soporte

- 📖 Guía completa: `doc/WALLET_ANALYSIS_GUIDE.md`
- 🐛 Errores: Revisa que la credencial Firebase esté presente
- ⏱️ Lento: El análisis masivo puede tardar (respeta rate limits)

---

**¡Listo para analizar wallets!** 🚀
