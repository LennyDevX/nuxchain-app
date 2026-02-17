# 🔍 Advanced Wallet Analysis Tools - Complete Guide

Este conjunto de herramientas permite depurar, validar y analizar las wallets registradas en tu airdrop con inteligencia avanzada.

## 📦 Scripts Disponibles

### 1. **search-wallet-advanced.cjs** - Búsqueda Individual de Wallets
Permite buscar y analizar una wallet específica en tiempo real con todos los datos disponibles.

#### Características:
- ✅ Validación on-chain (balance, transacciones, edad)
- ✅ Análisis de email intelligence (dominios desechables, patrones sospechosos)
- ✅ Análisis de nombre (patrones de bot)
- ✅ Información de dispositivo/navegador (browser, OS, device type)
- ✅ Detección de IP farms (múltiples registros desde la misma IP)
- ✅ Risk scoring individual (0-100)
- ✅ Exportación a CSV

#### Uso:
```bash
node scripts/search-wallet-advanced.cjs
```

#### Comandos Interactivos:
```
📍 Enter wallet address to search (or type "export" to save CSV report, "exit" to quit): [wallet_address]
```

**Ejemplo:**
```
📍 Enter wallet address: 9B5X1CwQQwgh... (tu wallet)
```

**Output esperado:**
```
📝 REGISTRATION DETAILS
─────────────────────────────────────────────────────
Document ID:    doc_12345678
Name:           John Doe
Email:          john@example.com
Wallet:         9B5X1CwQQwgh...
IP Address:     192.168.1.1
Created:        2/1/2026 10:30:45 AM
Time to Submit: 15.3s

📧 EMAIL ANALYSIS
─────────────────────────────────────────────────────
Risk Score: 15/100
Reasons:
  • (none - clean email)

👤 NAME ANALYSIS
─────────────────────────────────────────────────────
Risk Score: 0/100

🔗 ON-CHAIN DATA ANALYSIS
─────────────────────────────────────────────────────
Exists on-chain: ✅ Yes
Balance:         2.543210 SOL
Transactions:    45 transaction(s)
Wallet Age:      180 days old

🖥️ DEVICE & BROWSER INFORMATION
─────────────────────────────────────────────────────
Browser:        Chrome 130.0
OS:             Windows
Device Type:    desktop
Resolution:     1920x1080
Timezone:       America/New_York
Language:       en-US

🌐 IP FARM DETECTION
─────────────────────────────────────────────────────
Registrations from IP: 1

📊 OVERALL RISK ASSESSMENT
─────────────────────────────────────────────────────
Total Risk Score: 12/100
Category Breakdown:
  Email:     15/100
  Name:      0/100
  On-Chain:  5/100
  Device:    15/100

✅ REAL USER
Confidence: HIGH
```

#### Cómo Exportar Reporte:
1. Ejecuta el script
2. Haz varias búsquedas de wallets que quieras analizar
3. Cuando termines, escribe: `export`
4. El script generará un archivo CSV con todos los datos

---

### 2. **bulk-wallet-analysis.cjs** - Análisis Masivo de Todas las Wallets
Analiza TODAS las wallets registradas en una sola ejecución y genera un reporte completo.

#### Características:
- 📊 Análisis de todas las wallets en batch
- 📈 Estadísticas globales
- 🔴 Top 10 wallets más sospechosas
- 🌐 Análisis de IP farms
- 📄 Exportación automática a CSV
- ⚡ Procesamiento optimizado en lotes

#### Uso:
```bash
node scripts/bulk-wallet-analysis.cjs
```

#### Output esperado:
```
═══════════════════════════════════════════════════════════════════════
📊 COMPREHENSIVE ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════════

📈 REGISTRATION STATISTICS:
  Total Registrations:     1,250
  Processed Successfully:  1,250
  Wallets Existing On-Chain: 1,180/1,250

🚩 RISK CLASSIFICATION:
  ✅ Real Users:           920 (73.6%)
  ❓ Uncertain:            180 (14.4%)
  ⚠️  Likely Bot:           100 (8.0%)
  🚩 Suspicious/Bot:       50 (4.0%)

💰 WALLET STATISTICS:
  Average Balance:         1.245320 SOL
  Average Wallet Age:      45 days
  Zero Transaction Count:  280 (22.4%)

🎯 OVERALL METRICS:
  Average Risk Score:      28/100
  Highest Risk Score:      100/100 (Fake User)
  Lowest Risk Score:       0/100

🔴 TOP 10 SUSPICIOUS WALLETS:
  1. TestUser123           | Risk: 100 | test123@tempmail.com
  2. Admin Bot             | Risk: 98  | admin@10minutemail.com
  3. User0001              | Risk: 95  | user0001@yopmail.com
  ...

🌐 IP FARM DETECTION:
  IP 192.168.1.50: 25 registrations
  IP 10.0.0.100: 18 registrations
  IP 172.16.0.200: 12 registrations

✨ Analysis complete!
```

---

## 📊 Sistema de Risk Scoring

El sistema calcula un **risk score** (0-100) basado en 4 categorías:

### **1. Email Intelligence (25% del peso)**
| Factor | Puntuación |
|--------|-----------|
| Dominio desechable | +30 |
| Patrón sospechoso | +20 |
| Solo números | +25 |
| **Máximo** | **100** |

**Dominios desechables detectados:**
- tempmail.com, guerrillamail.com, 10minutemail.com
- mailinator.com, throwaway.email, yopmail.com
- Y 24 más...

### **2. Name Analysis (15% del peso)**
| Factor | Puntuación |
|--------|-----------|
| Patrón de bot (user, test, admin) | +35 |
| Exceso de mayúsculas | +15 |
| Nombre muy corto | +20 |
| **Máximo** | **100** |

### **3. On-Chain Data (40% del peso - más importante)**
| Factor | Puntuación |
|--------|-----------|
| No existe en blockchain | +100 |
| Balance < 0.001 SOL | +25 |
| Cero transacciones | +30 |
| Wallet < 30 días | +20 |
| **Máximo** | **100** |

**On-Chain Validations:**
- ✅ Verifica que la wallet exista
- ✅ Consulta balance en tiempo real
- ✅ Obtiene historial de transacciones
- ✅ Calcula edad de la wallet

### **4. Device & Browser (20% del peso)**
| Factor | Puntuación |
|--------|-----------|
| Navegador desconocido | +10 |
| Dispositivo móvil | +5 |
| Sumisión muy rápida (< 5s) | +15 |
| **Máximo** | **100** |

### **Clasificación Final:**
- 🚩 **70-100**: SUSPICIOUS/BOT - Acción recomendada: INVESTIGAR/ELIMINAR
- ⚠️ **50-69**: LIKELY BOT - Acción recomendada: REVISIÓN MANUAL
- ❓ **30-49**: UNCERTAIN - Acción recomendada: MONITOREO
- ✅ **0-29**: REAL USER - Acción recomendada: ACEPTAR

---

## 🎯 Datos Capturados por Registro

Cada registro ahora incluye:

### Datos de Usuario
- `name` - Nombre del usuario
- `email` - Email
- `wallet` - Dirección de wallet

### Datos Técnicos Nuevos
- `userAgent` - User agent completo del navegador
- `fingerprint` - Canvas fingerprint (identificador de device)
- `browserName` - Nombre del navegador
- `browserVersion` - Versión del navegador
- `osName` - Sistema operativo
- `deviceType` - mobile o desktop
- `screenResolution` - Resolución de pantalla (1920x1080)
- `timezone` - Zona horaria del usuario
- `language` - Idioma del navegador

### Datos de Comportamiento
- `timeToSubmit` - Tiempo desde que se cargó la página hasta submit (ms)
- `ipAddress` - Dirección IP del cliente
- `createdAt` - Timestamp de creación (server-side)

---

## 💡 Uso Recomendado

### Scenario 1: Verificar una Wallet Individual
```bash
node scripts/search-wallet-advanced.cjs
# Busca una wallet específica y obtén análisis detallado
```

### Scenario 2: Auditar Todas las Wallets
```bash
node scripts/bulk-wallet-analysis.cjs
# Ejecuta y espera a que termine
# Se generará automáticamente un CSV
```

### Scenario 3: Buscar Múltiples Wallets y Exportar
```bash
node scripts/search-wallet-advanced.cjs
# Busca: wallet1
# Busca: wallet2
# Busca: wallet3
# Escribe: export
# ✅ CSV generado
```

---

## 📁 Archivos Generados

### CSV Reports
Los archivos se guardan en `/scripts/` con timestamps:

- `all-wallets-analysis-2026-02-01.csv` - Análisis masivo
- `wallet-analysis-report-2026-02-01T10-30-45.csv` - Búsquedas individuales

### Columnas en CSV
```
docId
name
email
wallet
ipAddress
createdAt
browser
osName
deviceType
timeToSubmit
solBalance
transactionCount
walletAge
walletExists
ipRegistrationCount
emailRiskScore
nameRiskScore
riskScore
classification
```

---

## 🔍 Interpretando Resultados

### ✅ Good Signs (Usuario Real)
- Balance > 0.5 SOL
- Múltiples transacciones (> 10)
- Wallet > 60 días de antigüedad
- Email de dominio conocido (@gmail.com, @outlook.com, etc)
- Nombre normal (no patrones de bot)
- Desktop/Chrome/Windows (patrones normales)
- Tiempo de submit > 10 segundos

### 🚩 Red Flags (Probable Bot)
- Balance < 0.001 SOL
- Cero transacciones
- Wallet recién creada (< 7 días)
- Email desechable (tempmail, guerrillamail, etc)
- Nombre sospechoso (test123, user0001, Bot_v2)
- Unknown browser / raro OS
- Sumisión casi instantánea (< 3 segundos)
- Múltiples registros desde la misma IP

---

## 🛠️ Troubleshooting

### Error: "Failed to initialize Firebase"
```
✅ Solución: Verifica que el archivo de credenciales exista:
src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json
```

### Error: "RPC timeout"
```
✅ Solución: El script automáticamente espera y reintentas.
Espera a que termine (puede tomar varios minutos para muchas wallets).
```

### Error: "Wallet not found"
```
✅ Verifica que la dirección sea correcta y esté registrada.
```

---

## 📈 Análisis de Datos

### Interpretar Estadísticas
```
Average Risk Score: 28/100
→ El sistema detecta que la mayoría son usuarios reales

Real Users: 73.6%
→ Excelente quality de registros

IP Farm Detection: 3 IPs sospechosas
→ Considera bloquear estas IPs en futuras campañas
```

---

## 🔐 Privacidad y Seguridad

- ✅ Los datos se analizan localmente
- ✅ Las contraseñas/keys nunca se transmiten
- ✅ Solo lectura de datos públicos de Solana
- ✅ Los CSV se generan en tu máquina

---

## 📞 Comandos Rápidos

```bash
# Buscar una wallet
node scripts/search-wallet-advanced.cjs

# Analizar todas las wallets
node scripts/bulk-wallet-analysis.cjs

# Ver un report anterior
cat scripts/*.csv

# Contar wallets sospechosas
grep "SUSPICIOUS" scripts/*.csv | wc -l

# Exportar solo usuarios reales
grep "REAL USER" scripts/*.csv > real-users.csv
```

---

**¡Listo!** Ya tienes un sistema completo de análisis y validación de wallets. 🚀
