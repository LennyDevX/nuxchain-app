# 🚀 Deployment Checklist - Vercel

**Fecha**: Enero 3, 2026  
**Estado**: ✅ LISTO PARA DEPLOY

---

## ✅ Verificación Completada

### 1. **API Key Configuration**
- ✅ `ALCHEMY_API_KEY` configurado en `.env.local` (desarrollo local)
- ✅ Prioridad correcta: `ALCHEMY_API_KEY` → `VITE_ALCHEMY` (fallback)
- ✅ Sin API keys viejas hardcoded (`Oyk0XqXD7K2HQO4bkbDm1w8iZQ6fHulV`)
- ✅ Fallback RPC público (polygon-rpc.com) si Alchemy falla

### 2. **Blockchain Query Detection**
- ✅ Frontend detecta "mi balance", "cuánto staking tengo" sin requerir 0x
- ✅ Backend API (`/api/chat/stream.ts`) detecta queries blockchain
- ✅ Función `check_wallet_balance` implementada
- ✅ Función `get_user_staking_position` implementada
- ✅ Fallback a wallet conectada automáticamente

### 3. **TypeScript Compilation**
- ✅ Cero errores en `api/_services/blockchain-service.ts`
- ✅ Cero errores en `api/chat/stream.ts`
- ✅ Cero errores en `api/types/index.ts`
- ✅ Tipos correctos para `UserStakingPositionResult`, `WalletBalanceResult`

### 4. **RPC Fallback System**
- ✅ `safeRpcCall()` wrapper implementado
- ✅ Detección automática de rate limits (429)
- ✅ Detección de API inactivas ("App is ina")
- ✅ Fallback automático a RPCs públicos después de 3 fallos

### 5. **Error Handling**
- ✅ Retorna `success: false` con mensajes reales en lugar de datos falsos
- ✅ PolygonScan links para verificación de contratos
- ✅ Mensajes de error útiles para debugging

### 6. **Server Local (Desarrollo)**
- ✅ Actualizado `src/server/gemini/config/environment.js` para cargar `.env.local`
- ✅ Actualizado `src/server/gemini/services/blockchain-service.js` sin API keys hardcoded
- ✅ Logging detallado para debugging

---

## 🔧 **Pasos para Deploy a Vercel**

### Paso 1: Configurar Variables en Vercel Dashboard

```bash
# Abre: https://vercel.com/dashboard → Proyecto → Settings → Environment Variables

# Agregar estas variables:
ALCHEMY_API_KEY=Q824AGLLIcvfVNDU_WGvb_gl9h35sG9M
POLYGONSCAN_API_KEY=SRB2ZM4PVPAAU1EP5IEGMUE5BWBQ86CDZC
GEMINI_API_KEY=AIzaSyCP0efFs2JHlQus2CKL9NzGz0BR63IEppw
SERVER_API_KEY=nuxchain987654321

# Asegúrate de seleccionar: Production, Preview, Development
```

### Paso 2: Deploy

```bash
# Opción A: Via CLI
vercel --prod

# Opción B: Git push (si tienes CI/CD configurado)
git add .
git commit -m "fix: actualizar blockchain service con fallback RPC y ALCHEMY_API_KEY"
git push origin test
```

### Paso 3: Verificar Logs en Vercel

```bash
# Abre: https://vercel.com/dashboard → Proyecto → Deployments

# Busca logs como:
# [BlockchainService] 🔗 Using Alchemy RPC with API key: Q824AGLL...
# [BlockchainService] Environment check: { hasALCHEMY_API_KEY: true }
```

---

## 📋 **Checklist Local Pre-Deploy**

```bash
# 1. Verifica que el chat funciona con queries naturales:
npm run dev:full

# En el chat prueba:
- "cual es mi balance"
- "cuanto staking tengo actualmente"
- "mi wallet"

# 2. Verifica logs del servidor
# Deberías ver:
# ✅ [Environment] ✅ ALCHEMY_API_KEY present: true
# ✅ [BlockchainService] 🔗 RPC configured: { hasAlchemyKey: true, keyPreview: 'Q824AGLL...' }
```

---

## ⚠️ **Puntos Críticos**

| Item | Estado | Detalles |
|------|--------|----------|
| API Key Alchemy | ✅ | Q824AGLLIcvfVNDU_WGvb_gl9h35sG9M |
| Fallback RPC | ✅ | polygon-rpc.com + otros públicos |
| Query Detection | ✅ | "mi balance", "tengo staking" |
| Wallet Pasado | ✅ | Via `walletAddress` en request |
| Error Handling | ✅ | Honesto, sin datos inventados |
| Tipos TypeScript | ✅ | Todos los interfaces completos |

---

## 🎯 **Resultado Esperado Post-Deploy**

### Usuario pregunta: "cual es mi balance"
**Frontend detecta**: ✅ check_wallet_balance (sin requerir 0x)  
**Backend recibe**: ✅ walletAddress conectada  
**RPC intenta**: Alchemy → Si falla, intenta polygon-rpc.com  
**Usuario ve**: ✅ Balance real O error claro con retry  

### Usuario pregunta: "cuanto staking tengo"
**Frontend detecta**: ✅ get_staking_info + get_user_staking_position  
**Backend recibe**: ✅ walletAddress conectada  
**Usuario ve**: ✅ Posición de staking real del contrato O error claro  

---

## 📞 **Troubleshooting Post-Deploy**

### Si ves error 429:
```
Solución: Rate limit de Alchemy
- Verifica que ALCHEMY_API_KEY está en Vercel Settings
- Sistema intenta fallback automático a RPC público
- Espera 60 segundos y reintenta
```

### Si ves "App is ina":
```
Solución: Alchemy app inactivo
- Verifica: https://dashboard.alchemy.com/apps
- Reactiva la app si está pausada
```

### Si no se ejecutan funciones blockchain:
```
Solución: Verificar logs
1. Abre Vercel Deployments → Función → Logs
2. Busca: [BlockchainService] 🔗 RPC configured
3. Si no aparece: ALCHEMY_API_KEY no está configurada
```

---

**Creado**: 2026-01-03  
**Próximo Review**: Después del primer deploy
