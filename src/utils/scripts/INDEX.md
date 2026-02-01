# 🎁 Airdrop Management System - Índice Completo

## 📍 Ubicación
```
src/utils/scripts/
```

## 🗂️ Archivos Creados

### 1. **AirdropsWallet.js** ⚙️ [PRINCIPAL]
- **Líneas**: 177
- **Función**: Script principal de gestión
- **Comandos**:
  - `stats` - Ver estadísticas
  - `export` - Descargar datos
  - `validate` - Validar wallets
  - `distribute` - Preparar distribución
  - `list` - Listar usuarios

### 2. **distribute.js** 🚀 [DISTRIBUCIÓN]
- **Líneas**: 176
- **Función**: Preparar datos para blockchain
- **Soporta**:
  - Solana (`solana`)
  - Polygon/EVM (`polygon`)
  - CSV genérico (`csv`)
  - JSON estructurado (`json`)
  - Batch processing (`batch`)

### 3. **setup.js** ⚙️ [CONFIGURACIÓN]
- **Líneas**: 151
- **Función**: Configuración automática inicial
- **Verifica**:
  - Credenciales Firebase
  - Directorio de exportación
  - Dependencias
  - Variables de entorno

### 4. **README.md** 📖 [DOCUMENTACIÓN]
- **Secciones**:
  - Instalación
  - Comandos disponibles
  - Estructura de datos
  - Validación de wallets
  - Troubleshooting
  - Tips para distribución

### 5. **GUIA_RAPIDA.md** ⚡ [INICIO RÁPIDO]
- **Duración**: 5 minutos
- **Contiene**:
  - Setup inicial
  - Comandos diarios
  - Flujo típico
  - Estructura de datos
  - Troubleshooting rápido
  - Parámetros configurables

### 6. **INTEGRACION_BLOCKCHAIN.js** 🔗 [EJEMPLOS]
- **Ejemplos de**:
  - Web3.js (Solana)
  - Ethers.js (EVM)
  - Batch distribution
  - Verificación post-distribución
  - Configuración .env

### 7. **DASHBOARD.md** 📊 [OVERVIEW]
- **Incluye**:
  - Estructura de scripts
  - Características principales
  - Parámetros del airdrop
  - Ejemplo de salida
  - Flujo de trabajo
  - Mantenimiento

### 8. **RESUMEN.md** 📋 [SUMMARY]
- **Lo que se creó**
- **Cómo usar**
- **Parámetros**
- **Flujo típico**
- **Funciones principales**
- **Próximos pasos**

### 9. **airdrop-exports/** 📁 [CARPETA SALIDA]
- Se crea automáticamente con `setup.js`
- Contiene exportaciones:
  - `.csv` - Para Excel/Sheets
  - `.json` - Para procesamiento
  - Reportes datados

---

## 🚀 Inicio Rápido

### Opción 1: 5 Minutos (Lectura Rápida)
```
1. Lee: GUIA_RAPIDA.md
2. Ejecuta: setup.js
3. Ejecuta: AirdropsWallet.js stats
```

### Opción 2: Detallado (30 minutos)
```
1. Lee: README.md
2. Ejecuta: setup.js
3. Ejecuta: todos los comandos en orden
4. Lee: INTEGRACION_BLOCKCHAIN.js
```

### Opción 3: Solo lo que necesito
```
NECESITO → LEE → EJECUTA
├─ Ver estado → GUIA_RAPIDA.md → AirdropsWallet.js stats
├─ Exportar → GUIA_RAPIDA.md → AirdropsWallet.js export
├─ Validar → README.md → AirdropsWallet.js validate
├─ Distribuir → DASHBOARD.md → distribute.js solana
└─ Integración → INTEGRACION_BLOCKCHAIN.js → (copiar código)
```

---

## 📊 Matriz de Referencia Rápida

| Necesito | Archivo | Comando |
|----------|---------|---------|
| Ver estado | GUIA_RAPIDA.md | `AirdropsWallet.js stats` |
| Exportar CSV | README.md | `AirdropsWallet.js export` |
| Validar wallets | README.md | `AirdropsWallet.js validate` |
| Preparar distribución | DASHBOARD.md | `AirdropsWallet.js distribute` |
| Formato Solana | INTEGRACION_BLOCKCHAIN.js | `distribute.js solana` |
| Integración code | INTEGRACION_BLOCKCHAIN.js | Copiar ejemplo |
| Troubleshooting | GUIA_RAPIDA.md | Tabla de errores |

---

## 🔄 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────┐
│                    AIRDROP WORKFLOW                     │
└─────────────────────────────────────────────────────────┘

1. SETUP (Primera vez)
   ├─ Descargar Firebase credentials
   ├─ Ejecutar: setup.js
   └─ Instalar: npm install...
   
2. MONITOREO (Diario)
   ├─ Ver stats: AirdropsWallet.js stats
   └─ Exportar: AirdropsWallet.js export
   
3. VALIDACIÓN (Antes de distribuir)
   ├─ Validar: AirdropsWallet.js validate
   └─ Revisar: GUIA_RAPIDA.md
   
4. PREPARACIÓN (Semana de distribución)
   ├─ Distribuir: AirdropsWallet.js distribute
   └─ Exportar formato: distribute.js solana
   
5. INTEGRACIÓN (Blockchain)
   ├─ Leer: INTEGRACION_BLOCKCHAIN.js
   └─ Implementar: Copiar código relevante
   
6. EJECUCIÓN (Smart Contract)
   ├─ Usar datos exportados
   └─ Verificar en blockchain
```

---

## 📚 Guía de Lectura Recomendada

### Para Gerentes/PMs
```
1. RESUMEN.md (2 minutos)
2. DASHBOARD.md (5 minutos)
3. GUIA_RAPIDA.md (5 minutos)
```

### Para Desarrolladores
```
1. README.md (15 minutos)
2. INTEGRACION_BLOCKCHAIN.js (10 minutos)
3. Código fuente: AirdropsWallet.js (20 minutos)
```

### Para DevOps/Infra
```
1. setup.js (5 minutos)
2. README.md (10 minutos)
3. DASHBOARD.md (5 minutos)
```

---

## 🛠️ Herramientas Necesarias

### Instalación
```bash
npm install firebase-admin json2csv chalk
```

### Credenciales
- `firebase-credentials.json` (en raíz del proyecto)

### Versión Node
- Node.js 14+ recomendado

---

## 📊 Parámetros del Sistema

```javascript
TOKENS_PER_USER = 50,000          // NUX por usuario
MAX_AIRDROP_POOL = 50,000,000     // Pool máximo
MAX_USERS = 1,000                 // Límite usuarios
POL_BONUS_PER_USER = 20           // POL bonus
FIRESTORE_COLLECTION = "nuxchainAirdropRegistrations"
```

---

## 🎯 Casos de Uso

### Caso 1: "¿Cuántos registrados?"
```bash
node AirdropsWallet.js stats
# → Ver "Registros Totales" en salida
```

### Caso 2: "Exportar para análisis"
```bash
node AirdropsWallet.js export
# → Archivos en airdrop-exports/
```

### Caso 3: "Encontrar problemas"
```bash
node AirdropsWallet.js validate
# → Ver wallets inválidas/duplicadas
```

### Caso 4: "Preparar para blockchain"
```bash
node distribute.js solana
# → Archivo distribution-solana-*.json
```

### Caso 5: "Primeros 100 usuarios"
```bash
node distribute.js csv 100
# → Archivo con 100 usuarios
```

---

## ✨ Características Destacadas

✅ **Completamente automatizado**
- No requiere intervención manual
- Validación automática
- Exportación directa

✅ **Múltiples formatos**
- CSV para Excel
- JSON para procesamiento
- Blockchain-ready (Solana, EVM)

✅ **Seguro y validado**
- Verifica wallets
- Detecta duplicados
- Reportes completos

✅ **Fácil de usar**
- Comandos simples
- Documentación exhaustiva
- Ejemplos incluidos

✅ **Escalable**
- Soporta 1000+ usuarios
- Batch processing
- Pool de 50M tokens

---

## 📞 Navegación Rápida

### "Necesito empezar ahora"
→ [GUIA_RAPIDA.md](GUIA_RAPIDA.md)

### "Quiero entender todo"
→ [README.md](README.md)

### "Necesito integración blockchain"
→ [INTEGRACION_BLOCKCHAIN.js](INTEGRACION_BLOCKCHAIN.js)

### "Quiero un overview"
→ [DASHBOARD.md](DASHBOARD.md)

### "Quiero ver un resumen"
→ [RESUMEN.md](RESUMEN.md)

---

## 🎯 Próximos Pasos

1. **Hoy**
   ```bash
   node setup.js
   ```

2. **Mañana**
   ```bash
   node AirdropsWallet.js stats
   ```

3. **Esta semana**
   ```bash
   node AirdropsWallet.js export
   ```

4. **Antes de distribuir**
   ```bash
   node AirdropsWallet.js validate
   node AirdropsWallet.js distribute
   ```

5. **Día de distribución**
   ```bash
   node distribute.js solana
   # Usar output en smart contract
   ```

---

## 📋 Checklist

- [ ] Descargar credenciales Firebase
- [ ] `npm install firebase-admin json2csv chalk`
- [ ] `node setup.js`
- [ ] `node AirdropsWallet.js stats`
- [ ] `node AirdropsWallet.js export`
- [ ] Revisar archivos en `airdrop-exports/`
- [ ] Ejecutar `validate` antes de distribuir
- [ ] Preparar distribución con `distribute.js`
- [ ] Integrar en smart contract
- [ ] ✅ Distribuir!

---

**Sistema de gestión de airdrop completamente funcional y listo para producción! 🚀**
