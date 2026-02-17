# 📚 Documentación de Nuxchain

Bienvenido a la documentación técnica y operativa de **Nuxchain** - La plataforma multichain de tokenización, airdrop y gestión de wallets.

---

## � Estructura Organizada

```
doc/
├── README.md (este archivo)
├── ARCHITECTURE.md
├── IMPLEMENTATION_GUIDE.md
├── RECOMENDACION_OPCION_A.md
├── WEBSOCKET_FIX.md
├── airdrop/
│   ├── AIRDROP_COMPLETE_GUIDE.md
│   ├── AIRDROP_FIRESTORE_SETUP.md
│   ├── AIRDROP_REGISTRATION_SYSTEM.md
│   └── AIRDROP_WALLET_SECURITY_SYSTEM.md
├── security/
│   ├── BOT_SECURITY.md
│   └── BOT_DETECTION_QUERIES.md
├── features/
│   ├── WALLET_MENU_IMPROVEMENTS.md
│   ├── MAINTENANCE_PAGE_GUIDE.md
│   ├── SKILLS_PRICING_UPDATES.md
│   ├── WALLET_ANALYSIS_GUIDE.md
│   └── SOLANA_POLYGON_DUAL_SUPPORT.md
├── setup/
│   ├── DEVELOPMENT_SERVERS.md
│   ├── BINANCE_READ_ONLY_GUIDE.md
│   └── IMPLEMENTATION_GUIDE.md
├── infrastructure/
│   ├── EMERGENCY_429_FIX.md
│   └── RATE_LIMITING_FIX.md
├── backend/
│   ├── CHAT_GEMINI_API.md
│   ├── CHAT_LOGGER_ENHANCED.md
│   ├── LOCAL_SERVER.md
│   ├── LOGS_OPTIMIZATION.md
│   ├── ReactCompiler.md
│   ├── SUBGRAPH_SYSTEM.md
│   └── URL_CONTEXT_IMPROVEMENTS.md
└── frontend/
    ├── 01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md
    ├── 02-DESIGN_SYSTEM_AND_UI.md
    ├── 03-ARCHITECTURE_AND_UTILS.md
    └── README.md
```

---

## 🚀 **Guías Principales**

### 📋 Airdrop System

**[airdrop/AIRDROP_COMPLETE_GUIDE.md](airdrop/AIRDROP_COMPLETE_GUIDE.md)**
- Arquitectura del sistema de airdrop
- Componentes principales
- Guía de uso rápido
- Estadísticas de seguridad
- Troubleshooting

**[airdrop/AIRDROP_REGISTRATION_SYSTEM.md](airdrop/AIRDROP_REGISTRATION_SYSTEM.md)**
- Sistema de registro para airdrops
- Flujo de usuario completo
- Validaciones de seguridad
- Datos capturados en Firestore

**[airdrop/AIRDROP_FIRESTORE_SETUP.md](airdrop/AIRDROP_FIRESTORE_SETUP.md)**
- Configuración de Firebase/Firestore
- Estructura de colecciones
- Índices y rules de seguridad

**[airdrop/AIRDROP_WALLET_SECURITY_SYSTEM.md](airdrop/AIRDROP_WALLET_SECURITY_SYSTEM.md)**
- Sistema de seguridad de wallets
- Validaciones on-chain
- Device fingerprinting

### 🔐 Security System

**[security/BOT_SECURITY.md](security/BOT_SECURITY.md)**
- Sistema anti-bot multi-capa
- Detección de emails disposables
- Detección de IP farms y datacenters
- Device fingerprinting
- Rate limiting

**[security/BOT_DETECTION_QUERIES.md](security/BOT_DETECTION_QUERIES.md)**
- Queries para auditar bots
- Scripts de análisis
- Interpretación de datos

### 🎨 Features & Components

**[features/WALLET_MENU_IMPROVEMENTS.md](features/WALLET_MENU_IMPROVEMENTS.md)**
- Grid 2x2 en mobile y desktop
- Animaciones smooth de slide
- Soporte multichain (EVM + Solana)

**[features/MAINTENANCE_PAGE_GUIDE.md](features/MAINTENANCE_PAGE_GUIDE.md)**
- Sistema de página de mantenimiento
- Activación/desactivación rápida
- Mensajes personalizados

**[features/SKILLS_PRICING_UPDATES.md](features/SKILLS_PRICING_UPDATES.md)**
- Sistema de precificación
- Gestión de skills
- Modelo de precios dinámico

**[features/WALLET_ANALYSIS_GUIDE.md](features/WALLET_ANALYSIS_GUIDE.md)**
- Sistema de análisis de wallets
- Scripts de análisis on-chain
- Detección de patrones

**[features/SOLANA_POLYGON_DUAL_SUPPORT.md](features/SOLANA_POLYGON_DUAL_SUPPORT.md)**
- Soporte multichain
- Providers de red
- Transacciones cruzadas

### ⚙️ Setup & Installation

**[setup/DEVELOPMENT_SERVERS.md](setup/DEVELOPMENT_SERVERS.md)**
- Firebase Emulator setup
- Vite dev server
- APIs locales
- Variables de entorno

**[setup/BINANCE_READ_ONLY_GUIDE.md](setup/BINANCE_READ_ONLY_GUIDE.md)**
- Integración con API de Binance
- Autenticación
- Rate limits
- Ejemplos de código

**[setup/IMPLEMENTATION_GUIDE.md](setup/IMPLEMENTATION_GUIDE.md)**
- Guía completa de implementación
- Componentes implementados
- Arquitectura de seguridad
- Estadísticas

### 🛠️ Infrastructure & Fixes

**[infrastructure/EMERGENCY_429_FIX.md](infrastructure/EMERGENCY_429_FIX.md)**
- Solución de HTTP 429 (Too Many Requests)
- Rate limiting estratégico
- Retry logic con backoff exponencial

**[infrastructure/RATE_LIMITING_FIX.md](infrastructure/RATE_LIMITING_FIX.md)**
- Sistema de rate limiting
- Límites por endpoint
- Whitelist de IPs

### 🏗️ Architecture & General

**[ARCHITECTURE.md](ARCHITECTURE.md)**
- Stack tecnológico
- Estructura de carpetas
- Patrones de diseño
- Flujos de datos

**[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)**
- Implementación general
- Tecnologías usadas
- Decisiones de diseño

---

## 🎯 Cómo Usar Esta Documentación

### 📖 Para Nuevos Desarrolladores
1. Lee [ARCHITECTURE.md](ARCHITECTURE.md)
2. Luego [setup/DEVELOPMENT_SERVERS.md](setup/DEVELOPMENT_SERVERS.md)
3. Luego la sección específica que necesites

### 🐛 Para Fixes de Bugs
1. Busca en `infrastructure/` para problemas de infraestructura
2. Busca en `security/` para problemas de seguridad
3. Busca en `features/` para problemas de features
4. Si no encuentras, crea un issue con:
   - Error exacto
   - Stack trace
   - Pasos para reproducir

### ✨ Para Nuevas Features
1. Crea documentación en rama
2. Incluye: descripción, cambios, testing
3. Mueve a carpeta apropiada
4. Crea PR con referencia

### 🚀 Para Operaciones
- [features/MAINTENANCE_PAGE_GUIDE.md](features/MAINTENANCE_PAGE_GUIDE.md) - Activar mantenimiento
- [setup/DEVELOPMENT_SERVERS.md](setup/DEVELOPMENT_SERVERS.md) - Iniciar servidores
- [airdrop/AIRDROP_FIRESTORE_SETUP.md](airdrop/AIRDROP_FIRESTORE_SETUP.md) - Gestionar BD

---

## 🔄 Historial de Cambios

### Febrero 3, 2026
- ✅ **Reorganización completa de documentación**
  - Consolidación de ~30 archivos duplicados a estructura clara
  - Creadas 5 carpetas temáticas: airdrop, security, features, setup, infrastructure
  - Eliminados archivos redundantes (AIRDROP_IMPLEMENTATION_COMPLETE.md, BOT_SECURITY_DEPLOYED.md, etc.)
  
- ✅ **Mejoras en interfaz de usuario**
  - Grid 2x2 para menú de wallets (mobile y desktop)
  - Animaciones smooth de close/open
  - Soporte multichain (EVM + Solana)
  
- ✅ **Desactivación de mantenimiento**
  - NFTs page: Mantenimiento → Página real
  
- ✅ **Sistema de seguridad consolidado**
  - BOT_SECURITY.md unificado
  - AIRDROP_REGISTRATION_SYSTEM.md consolidado
  - IMPLEMENTATION_GUIDE.md centralizado

---

## 📊 Estadísticas de Documentación

- **Total de archivos:** 32 documentos
- **Carpetas temáticas:** 6 (airdrop, security, features, setup, infrastructure, backend, frontend)
- **Líneas de documentación:** ~15,000
- **Última reorganización:** 3 de Febrero, 2026

---

## 📞 Contacto y Soporte

Para reportar errores o sugerencias:
1. Crea un issue en GitHub
2. Sé específico y proporciona contexto
3. Incluye logs/screenshots si es posible
4. Referencia el archivo de documentación relevante

---

## 📄 Licencia

Este proyecto está bajo licencia privada.

---

## ✨ Contribución a la Documentación

Si encuentras:
- ❌ Errores o inconsistencias
- ❌ Información desactualizada
- ❌ Secciones poco claras
- ✅ Mejoras posibles

**Por favor:** Crea un PR o issue describiendo el problema.

---

**Última actualización:** 3 de Febrero, 2026  
**Responsable:** Lenny DevX  
**Estado:** ✅ Documentación Reorganizada y Limpia
