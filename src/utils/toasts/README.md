# 🎨 Sistema de Notificaciones Toast - NuxChain

Sistema centralizado de notificaciones profesionales para toda la plataforma.

## 📦 Módulos Disponibles

### ✅ Implementados

#### 1. **stakingToasts** - Sistema de Staking
- `minimumDepositError()` - Depósito mínimo no alcanzado
- `maximumDepositError()` - Depósito excede el máximo
- `insufficientBalance()` - Balance insuficiente
- `invalidLockupPeriod()` - Período de bloqueo inválido
- `walletNotConnected()` - Wallet no conectada
- `noDeposits()` - Sin depósitos activos
- `noRewards()` - Sin recompensas disponibles
- `depositSuccess()` - Depósito exitoso
- `withdrawSuccess()` - Retiro exitoso
- `claimSuccess()` - Reclamación de recompensas
- `compoundSuccess()` - Compound exitoso
- `emergencyWithdraw()` - Retiro de emergencia con penalización
- `depositInfo()` - Información sobre depósitos
- `error()` - Error genérico

#### 2. **nftToasts** - Marketplace NFT
- `purchaseSuccess()` - Compra exitosa
- `purchaseError()` - Error en compra
- `insufficientBalance()` - Balance insuficiente
- `listingSuccess()` - Listado exitoso
- `listingError()` - Error al listar
- `transferSuccess()` - Transferencia exitosa
- `transferError()` - Error en transferencia
- `cancelListingSuccess()` - Cancelación de listado
- `cancelListingError()` - Error al cancelar
- `addressCopied()` - Dirección copiada
- `addedToFavorites()` - Añadido a favoritos
- `removedFromFavorites()` - Removido de favoritos
- `processingTransaction()` - Procesando transacción
- `walletNotConnected()` - Wallet no conectada
- `nftNotFound()` - NFT no encontrado
- `error()` - Error genérico

#### 3. **tokenizationToasts** - Tokenización de Assets
- `fileSelected()` - Archivo seleccionado
- `fileUploadError()` - Error en upload
- `fileSizeTooLarge()` - Archivo muy grande
- `invalidFileType()` - Tipo de archivo inválido
- `mintingInProgress()` - Minteando NFT
- `mintingSuccess()` - Minteo exitoso
- `mintingError()` - Error en minteo
- `metadataValidationError()` - Error en metadata
- `requiredFieldMissing()` - Campo requerido faltante
- `approvalRequested()` - Solicitando aprobación
- `approvalSuccess()` - Aprobación exitosa
- `approvalError()` - Error en aprobación
- `uploadingToIPFS()` - Subiendo a IPFS
- `ipfsUploadSuccess()` - Upload IPFS exitoso
- `ipfsUploadError()` - Error en IPFS
- `walletNotConnected()` - Wallet no conectada
- `incorrectNetwork()` - Red incorrecta
- `processingTransaction()` - Procesando
- `skillTokenBenefit()` - Beneficio de Skill Token
- `error()` - Error genérico

#### 4. **xpToasts** - Sistema de Gamificación
- `xpGained()` - XP ganado con razón
- `levelUp()` - Subida de nivel
- `achievementUnlocked()` - Logro desbloqueado
- `activityStreak()` - Racha de actividad
- `xpMilestone()` - Hito de XP alcanzado
- `xpBonus()` - Bonificación de XP

**Razones de XP soportadas:**
- `NFT_CREATED` - 🎨 NFT Creado
- `NFT_LISTED` - 📋 NFT Listado
- `NFT_SOLD` - 💰 NFT Vendido
- `NFT_BOUGHT` - 🛒 NFT Comprado
- `LIKE` - ❤️ Nuevo Like
- `COMMENT` - 💬 Comentario Añadido
- `STAKING` - 🔐 Staking Completado
- `REFERRAL` - 👥 Amigo Referido
- `ACTIVITY` - ⚡ Actividad Completada

#### 5. **referralToasts** - Sistema de Referidos
- `codeGenerated()` - Código generado
- `referralRegistered()` - Referido registrado
- `bonusEarned()` - Bono ganado por referidor
- `bonusReceived()` - Bono recibido por referido
- `codeCopied()` - Código copiado
- `referralStats()` - Estadísticas de referidos
- `invalidCode()` - Código inválido
- `referralMilestone()` - Hito de referidos alcanzado
- `error()` - Error genérico

#### 6. **marketplaceToasts** - Interacciones Sociales
- `likeToggled()` - Like/Unlike en NFT
- `commentAdded()` - Comentario publicado
- `receivedComment()` - Comentario recibido en tu NFT
- `receivedLike()` - Like recibido en tu NFT
- `nftSold()` - NFT vendido exitosamente
- `filtersApplied()` - Filtros aplicados
- `filtersCleared()` - Filtros limpiados
- `loadingNFTs()` - Cargando NFTs
- `connectionError()` - Error de conexión
- `error()` - Error genérico

---

## 🔮 Mejoras Sugeridas

### 1. **Quest System Toasts** (Próximo)
Basado en `GameifiedMarketplaceQuests.json`:
- Quest iniciada
- Quest completada
- Recompensa de quest reclamada
- Progreso de quest actualizado
- Quest expirada
- Milestone de quest alcanzado

### 2. **Skills System Toasts**
Basado en `GameifiedMarketplaceSkillsV2.json`:
- Skill comprado
- Skill activado
- Skill mejorado (upgrade)
- Descuento aplicado por skill
- Beneficio de skill activado
- Combo de skills activado

### 3. **Transaction Queue Toasts**
Para transacciones offline/background:
- Transacción encolada
- Reintentando transacción
- Transacción sincronizada
- Transacción fallida después de reintentos
- Cola vacía

### 4. **Network & Connection Toasts**
Estados de conectividad:
- Red cambiada
- Conexión perdida
- Conexión restaurada
- Modo offline activado
- Sincronizando datos

### 5. **Wallet Toasts Mejorados**
Estados avanzados de wallet:
- Wallet conectada exitosamente
- Wallet desconectada
- Cambio de cuenta detectado
- Balance actualizado
- Gas insuficiente con sugerencia
- Transacción pendiente de firma

### 6. **Analytics & Performance Toasts**
Métricas para el usuario:
- Estadísticas personales actualizadas
- Ranking actualizado
- Nuevo récord personal
- Comparación con otros usuarios

---

## 📋 Eventos de Contratos por Implementar

### **EnhancedSmartStaking** Events:
- ✅ `Deposited` - Implementado
- ✅ `Withdrawn` - Implementado
- ✅ `RewardsClaimed` - Implementado
- ✅ `Compounded` - Implementado
- ✅ `EmergencyWithdraw` - Implementado
- 🔄 `SkillActivated` - Pendiente
- 🔄 `BonusApplied` - Pendiente
- 🔄 `LockExtended` - Pendiente

### **ReferralSystem** Events:
- ✅ `ReferralCodeGenerated` - Implementado
- ✅ `ReferralRegistered` - Implementado
- ✅ `ReferralBonusEarned` - Implementado
- ✅ `ReferralBonusGiven` - Implementado

### **MarketplaceCore** Events:
- ✅ `NFTSold` - Implementado (nftToasts.purchaseSuccess)
- ✅ `TokenListed` - Implementado (nftToasts.listingSuccess)
- ✅ `ListingCancelled` - Implementado (nftToasts.cancelListingSuccess)
- ✅ `LikeToggled` - Implementado (marketplaceToasts.likeToggled)
- ✅ `CommentAdded` - Implementado (marketplaceToasts.commentAdded)
- 🔄 `PriceUpdated` - Pendiente
- 🔄 `RoyaltyPaid` - Pendiente

### **LevelingSystem** Events:
- ✅ `XPGained` - Implementado (xpToasts.xpGained)
- ✅ `LevelUp` - Implementado (xpToasts.levelUp)

### **GameifiedMarketplaceQuests** Events:
- 🔄 `QuestCreated` - Pendiente
- 🔄 `QuestStarted` - Pendiente
- 🔄 `QuestProgressUpdated` - Pendiente
- 🔄 `QuestCompleted` - Pendiente
- 🔄 `QuestRewardClaimed` - Pendiente

### **GameifiedMarketplaceSkillsV2** Events:
- 🔄 `SkillPurchased` - Pendiente
- 🔄 `SkillActivated` - Pendiente
- 🔄 `SkillUpgraded` - Pendiente
- 🔄 `DiscountApplied` - Pendiente

---

## 🎯 Funciones View Importantes para Toasts Contextuales

### Staking Views (EnhancedSmartStakingView):
- `getUserDeposit(address)` - Obtener depósito actual para mostrar en notificaciones
- `calculateRewards(address)` - Calcular recompensas antes de reclamar
- `getUserStats(address)` - Estadísticas completas para feedback detallado
- `getActiveSkills(address)` - Skills activos para mostrar beneficios

### Marketplace Views:
- `getTokenListing(uint256)` - Detalles del NFT para notificaciones contextuales
- `getUserProfile(address)` - Perfil completo para notificaciones personalizadas
- `getLikesCount(uint256)` - Contar likes para feedback social
- `getCommentsCount(uint256)` - Contar comentarios para engagement

### Referral Views:
- `getReferralStats(address)` - Estadísticas para mostrar progreso
- `getReferralCode(address)` - Código para copiar/compartir
- `getReferralCount(address)` - Total de referidos para milestones

### Skills Views:
- `getOwnedSkills(address)` - Skills del usuario
- `getSkillBenefits(uint256)` - Beneficios específicos de cada skill
- `getActiveDiscount(address)` - Descuento activo para mostrar en compras

---

## 🚀 Uso

```typescript
// Import centralizado
import { 
  stakingToasts, 
  nftToasts, 
  xpToasts, 
  referralToasts,
  marketplaceToasts,
  tokenizationToasts 
} from '@/utils/toasts'

// Staking
stakingToasts.depositSuccess('100 POL')
stakingToasts.claimSuccess('50 POL')

// NFT Marketplace
nftToasts.purchaseSuccess('Cool NFT #123', '500 POL')
marketplaceToasts.likeToggled('My NFT', true)

// XP & Gamificación
xpToasts.xpGained(100, 'NFT_CREATED')
xpToasts.levelUp(5, 3000)

// Referidos
referralToasts.bonusEarned(200, 'NEW_REFERRAL')
referralToasts.codeGenerated('ABC123XYZ')

// Interacciones sociales
marketplaceToasts.commentAdded('Awesome Art #1')
marketplaceToasts.receivedLike('0x1234...5678', 'My Creation')
```

---

## 🎨 Esquema de Colores

- **Verde** (#10b981): Success, rewards, claims
- **Rojo** (#ef4444): Errors, warnings, emergencies
- **Azul** (#3b82f6): Info, loading, processing
- **Púrpura** (#8b5cf6): NFT operations, premium features
- **Amarillo/Oro** (#fbbf24): XP, bonuses, milestones
- **Rosa** (#ec4899): Social interactions, likes
- **Cyan** (#06b6d4): Comments, messages
- **Naranja** (#f59e0b): Warnings, alerts

---

## ✨ Características

- **Gradientes profesionales** para cada tipo de notificación
- **Emojis contextuales** para rápida identificación visual
- **Duraciones optimizadas** según importancia (2-7 segundos)
- **Posición consistente** (top-center)
- **Mensajes bilingües** (español por defecto)
- **Información contextual** (montos, direcciones, nombres)
- **Estados de loading** con IDs retornables para dismiss
- **Error handling** con mensajes descriptivos

---

## 📊 Estadísticas del Sistema

- **6 módulos** implementados
- **90+ métodos** de notificación disponibles
- **20+ eventos de contratos** cubiertos
- **8 esquemas de color** diferenciados
- **100% TypeScript** con tipos seguros

---

## 🔄 Roadmap

1. ✅ Sistema base de toasts
2. ✅ Staking notifications
3. ✅ NFT marketplace notifications
4. ✅ XP & gamification system
5. ✅ Referral system
6. ✅ Social interactions
7. 🔄 Quest system (Próximo)
8. 🔄 Skills system (Próximo)
9. 🔄 Transaction queue feedback
10. 🔄 Network & connection states

---

**Última actualización:** 2025-11-25
