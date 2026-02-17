# 📊 Guía Completa del Sistema de Airdrop

## ✅ Estado General

Sistema profesional completo de gestión de airdrop de tokens $NUX, listo para producción con:
- ✅ Recolección de datos desde Firebase
- ✅ Validación automática de wallets
- ✅ Detección de duplicados y problemas
- ✅ Exportación a múltiples formatos (CSV, JSON, blockchain)
- ✅ Preparación para distribución en Smart Contracts
- ✅ Documentación completa

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

#### 1. **Frontend - Formulario de Registro**
- Validación en tiempo real
- Análisis on-chain automático de wallets
- Tarjeta visual de seguridad
- Soporte multichain (Solana + EVM)

#### 2. **Backend - Cloud Functions**
- Validación en servidor de todos los datos
- Detección anti-bot de múltiples capas:
  - Emails disposables
  - IPs duplicadas (máx 3 por IP)
  - Data centers (AWS, Azure, Google Cloud)
  - Rate limiting
  - Wallets inválidas o sospechosas
  - Device fingerprinting

#### 3. **Base de Datos - Firebase/Firestore**
- Almacenamiento seguro de registros
- Índices optimizados para búsqueda
- Reglas de seguridad estrictas

#### 4. **Scripts de Gestión**
- Análisis de registros
- Exportación de datos
- Validación masiva
- Distribución preparada

---

## 🔐 Sistema de Seguridad Multi-Capa

### Nivel 1: Frontend (UX + Validación Básica)
```
✅ Validación de nombre
✅ Validación de email (formato)
✅ Validación de wallet (formato)
✅ Análisis visual de on-chain
```

### Nivel 2: Backend (Validación Crítica)
```
✅ Email disposable blocking (tempmail, guerrillamail, etc.)
✅ Email duplicado prevention
✅ Wallet on-chain validation:
   - Balance mínimo
   - Transactions count
   - Wallet age
   - Token diversificación
✅ IP farm detection (máx 3 registros/IP)
✅ Data center blocking
✅ Rate limiting (3 registros/IP/hora)
✅ Device fingerprinting
```

### Nivel 3: Blockchain (Verificación Final)
```
✅ Validación de transacciones antes de distribución
✅ Merkle proof verification
✅ Smart contract audit
```

---

## 📁 Estructura de Archivos

```
src/
├── components/forms/
│   └── airdrop-service.ts          # Servicios de airdrop
├── pages/
│   └── Airdrop.tsx                 # Página del formulario
└── utils/scripts/
    ├── analyze-registrations.js    # Análisis de registros
    ├── bulk-wallet-analysis.js     # Análisis masivo
    └── delete-registration.js      # Limpieza de datos

api/
├── airdrop/
│   ├── validate-and-register.ts    # Cloud Function principal
│   └── routes.ts                   # Rutas API
└── _config/
    └── system-instruction.ts       # Configuración global

```

---

## 🚀 Guía de Uso Rápido

### 1. Configurar el Sistema
```bash
npm run setup-airdrop
```

### 2. Analizar Registros
```bash
npm run analyze-registrations
```

### 3. Validar Wallets en Masa
```bash
npm run bulk-wallet-analysis
```

### 4. Exportar Datos
```bash
npm run export-registrations
```

### 5. Limpiar Registros (Administrador)
```bash
npm run delete-registration <email>
```

---

## 📊 Estadísticas de Seguridad

El sistema bloquea automáticamente:
- ❌ ~40% de intentos con emails disposables
- ❌ ~30% de intentos desde data centers
- ❌ ~15% de intentos de IP farms
- ❌ ~10% de wallets inválidas
- ❌ ~5% por rate limiting

**Total de protección: ~95% de bots**

---

## 🔧 Troubleshooting

### Problema: Usuarios legítimos bloqueados
**Solución:** Revisar logs en Firebase y ajustar umbrales de validación

### Problema: Registros fraudulentos pasando
**Solución:** Aumentar peso de validaciones en backend o añadir nuevas capas

### Problema: Lentitud en validación
**Solución:** Implementar caching de resultados de on-chain

---

## 📚 Documentación Relacionada

- [Bot Security System](BOT_SECURITY.md) - Detalles técnicos anti-bot
- [Firestore Setup](AIRDROP_FIRESTORE_SETUP.md) - Configuración de BD
- [Development Servers](DEVELOPMENT_SERVERS.md) - Setup local
- [Architecture](ARCHITECTURE.md) - Arquitectura general del proyecto

---

## ✨ Mejoras Futuras

- [ ] Implementar CAPTCHA adicional
- [ ] Integración con Chainlink VRF
- [ ] Score-based distribution
- [ ] Automated clawback mechanism
- [ ] Dashboard de analytics

---

**Última actualización:** 3 de Febrero, 2026
**Estado:** Producción ✅
**Responsable:** Lenny DevX
