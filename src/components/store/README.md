# Skills Store - Documentación

## 📦 Resumen del Sistema

La tienda de skills (Skills Store) es una interfaz completa para comprar, activar y gestionar habilidades NFT que mejoran la experiencia del usuario en la plataforma Nuxchain.

## 🏗️ Arquitectura de Componentes

### Página Principal
- **`store.tsx`**: Página principal con navegación por tabs (Catalog / My Skills)

### Componentes de Catálogo
- **`SkillsCatalog.tsx`**: Grid de skills con filtrado y búsqueda
- **`StoreSkillCard.tsx`**: Tarjeta individual de skill con precios y badges
- **`SkillsPricingGuide.tsx`**: Tabla comparativa de precios por rareza

### Componentes de Gestión
- **`MySkills.tsx`**: Vista de skills del usuario (activos/inactivos)
- **`PurchaseSkillModal.tsx`**: Modal de compra con validaciones

### Configuración
- **`pricing-config.ts`**: Sistema de precios diferenciados

### Hooks
- **`useSkillsStore.ts`**: Custom hook para interactuar con el contrato

## 💰 Sistema de Precios

### Estrategia de Pricing (Basada en IndividualSkillsMarketplace)

**STAKING SKILLS (Tipos 1-7) - Precios Base:**
- Common: 50 POL
- Uncommon: 80 POL
- Rare: 100 POL
- Epic: 150 POL
- Legendary: 220 POL

**ACTIVE SKILLS (Tipos 8-16) - 30% Markup:**
- Common: 65 POL (50 * 1.3)
- Uncommon: 104 POL (80 * 1.3)
- Rare: 130 POL (100 * 1.3)
- Epic: 195 POL (150 * 1.3)
- Legendary: 286 POL (220 * 1.3)

**Renovaciones:**
- 🔄 **Renovación: 50% del precio original**

### Funciones de Pricing

```typescript
// Calcular precio de una skill basado en tipo y rareza
calculateSkillPrice(skillType, rarity, isRenewal)

// Obtener porcentaje de markup para active skills
getMarkupPercentage(skillType)

// Verificar si es una active skill (con markup)
isActiveSkill(skillType)

// Formatear precio
formatPrice(price)
```

## 🎯 Tipos de Skills

### Staking Skills (Tipos 1-7) - Precios Base
1. **Stake Boost I** - +5% APY
2. **Stake Boost II** - +10% APY
3. **Stake Boost III** - +20% APY
4. **Auto Compound** - Reinversión automática
5. **Lock Reducer** - -25% tiempo de bloqueo
6. **Fee Reducer I** - -10% fees
7. **Fee Reducer II** - -25% fees

### Active Skills (Tipos 8-16) - 30% Markup
8. **Priority Listing** - Destacar en homepage
9. **Batch Minter** - Mintear múltiples NFTs
10. **Verified Creator** - Badge verificado
11. **Influencer** - 2x peso social
12. **Curator** - Crear colecciones destacadas
13. **Ambassador** - 2x bonos de referidos
14. **VIP Access** - Acceso exclusivo a drops
15. **Early Access** - 24h acceso anticipado
16. **Private Auctions** - Acceso a subastas privadas

## 🔄 Flujo de Usuario

### 1. Catálogo (Catalog Tab)

```
Usuario → Filtrar por categoría/rareza → Buscar skill → 
Click en skill → Modal de compra → Confirmar transacción → 
Skill agregada a "My Skills"
```

**Características:**
- Filtros: Categoría (Staking/Marketplace), Rareza, Búsqueda
- Badges: "FREE" para primera skill, "-%XX" para descuentos
- Indicador de skills ya poseídas

### 2. Mis Skills (My Skills Tab)

```
Usuario → Ver skills activas/inactivas → 
Activar skill (requiere 250 POL staked) → 
Skill activa por 30 días → Renovar antes de expirar
```

**Secciones:**
- **Active Skills**: Máximo 3, con countdown de expiración
- **Expired Skills**: Disponibles para renovar (50% off)
- **Inactive Skills**: Compradas pero no activadas

## 🛠️ Integración con Smart Contracts

### Contrato: IndividualSkillsMarketplace

#### Funciones de Lectura
```solidity
// Obtener información de un skill
getSkillInfo(uint8 skillType, uint8 rarity) → (uint256 price, bool exists)
```

#### Funciones de Escritura
```solidity
purchaseIndividualSkill(uint8 skillType, uint8 rarity, uint256 level, string memory metadata) payable
renewSkill(uint8 skillType, uint8 rarity) payable
```

### Uso del Hook

```typescript
import { useSkillsStore } from '@/hooks/skills/useSkillsStore';

const {
  isLoading,
  error,
  activeSkills,
  hasPurchasedBefore,
  purchaseSkill,
  activateSkill,
  renewSkill,
  deactivateSkill,
} = useSkillsStore();

// Comprar skill
await purchaseSkill(skillData);

// Activar skill (requiere 250 POL staked)
await activateSkill(skillType);

// Renovar skill expirada
await renewSkill(skillData);
```

## 🎨 Diseño y UX

### Principios de Diseño
1. **Claridad**: Precios y beneficios visibles de inmediato
2. **Feedback**: Loading states y mensajes de error claros
3. **Accesibilidad**: Focus traps, ARIA labels, navegación por teclado
4. **Performance**: Lazy loading, memoización, virtualization

### Animaciones
- **Entrada**: Fade in + slide up (staggered)
- **Hover**: Scale + glow effect
- **Click**: Scale down (tap feedback)
- **Transiciones**: 0.3s ease-out

### Responsive Design
- **Mobile**: 1 columna, filtros colapsables
- **Tablet**: 2 columnas
- **Desktop**: 3 columnas

## 📝 Validaciones

### Pre-compra
- ✅ Wallet conectado
- ✅ Balance suficiente de POL
- ✅ No poseer la skill (evitar duplicados)

### Pre-activación
- ✅ Mínimo 250 POL staked
- ✅ Máximo 3 skills activas
- ✅ No tener el mismo tipo activo

### Pre-renovación
- ✅ Skill expirada
- ✅ Balance suficiente (50% del precio)

## 🚀 Optimizaciones Implementadas

### Performance
1. **React.memo** en SkillCard y SkillsCatalog
2. **useMemo** para cálculos de precios
3. **useCallback** para handlers
4. **Lazy loading** del PurchaseModal
5. **Skeleton loaders** durante carga

### Code Splitting
```typescript
const PurchaseSkillModal = lazy(() => 
  import('./PurchaseSkillModal').then(m => ({ 
    default: m.PurchaseSkillModal 
  }))
);
```

## 📊 Estados del Sistema

### Estado de Loading
```typescript
{
  isLoading: boolean,
  error: string | null,
  activeSkills: number[] | undefined,
  hasPurchasedBefore: boolean
}
```

### Estado de Skills
```typescript
interface UserSkillData {
  skill: SkillData,
  isActive: boolean,
  expiresAt?: number,  // Unix timestamp
  purchasedAt: number  // Unix timestamp
}
```

## 🔐 Seguridad

### Validaciones de Contrato
- Prevención de duplicados (mismo skill type)
- Límite de 3 skills activas
- Expiración después de 30 días
- Renovación solo para skills expiradas

### Frontend
- Validación de balance antes de transacción
- Prevención de double-spending con loading states
- Error handling comprehensivo

## 📱 Mobile Optimizations

1. **Touch feedback** con haptic hooks
2. **Simplified layouts** en mobile
3. **Bottom sheets** para modales en móvil (opcional)
4. **Swipe gestures** para navegación de tabs

## 🧪 Testing

### Puntos de Test Críticos
1. Compra de primera skill (debe ser gratis)
2. Descuentos correctos para staking skills
3. Activación con 250+ POL staked
4. Límite de 3 skills activas
5. Renovación al 50%
6. Countdown de expiración preciso

## 🔮 Mejoras Futuras

1. **Búsqueda avanzada** con filtros combinados
2. **Wishlist** para skills deseadas
3. **Comparador** de skills lado a lado
4. **Historial** de compras y activaciones
5. **Notificaciones** de próximas expiraciones
6. **Bundles** de skills con descuento
7. **Gifting** de skills a otros usuarios

## 📖 Recursos

- **Documentación del contrato**: `/doc/SKILL_NFT_SYSTEM.md`
- **Cálculo de boost**: `/doc/SKILLS_BOOST_CALCULATION.md`
- **Seguridad**: `/doc/SKILL_SECURITY_IMPLEMENTATION.md`
- **ABIs**: `/src/abi/GameifiedMarketplaceSkillsV2.json`

---

**Última actualización**: 13 de Noviembre, 2025
**Autor**: GitHub Copilot
**Estado**: ✅ Producción Ready
