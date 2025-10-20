# 🎯 Servicio de Staking en Nuxchain

## 📌 Sistema en 3 Capas

```
1. FRONTEND (React Hooks)      ← useUserStaking.ts
       ↓
2. SMART CONTRACT (Polygon)    ← SmartStaking.sol
       ↓
3. BLOCKCHAIN (Registro)       ← Posiciones + Rewards
```

---

## 🚀 Cómo Funciona el Staking

### Flujo Completo
```
1. Conectas wallet
2. Eliges monto + lockup (días)
3. Depositas POL → Smart Contract
4. Sistema calcula rewards automáticamente
5. Reclamas rewards cuando quieras
6. Retiras después del lockup
```

---

## 💰 Sistema de Rewards

### APY Dinámico
| Lockup | Base APY | Boost APY | Total APY |
|--------|----------|-----------|-----------|
| Sin lockup | 5% | 0% | **5%** |
| 30 días | 5% | +2% | **7%** |
| 90 días | 5% | +5% | **10%** |
| 180 días | 5% | +8% | **13%** |
| 365 días | 5% | +12% | **17%** |

**Cálculo de Rewards:**
```
rewards = (deposito × APY × tiempo_en_días) / (365 × 100)
```

---

## 📊 Funciones del Smart Contract

### Principales Funciones

```solidity
// Depositar POL
deposit(uint256 lockupDuration) payable
  → Crea posición de staking
  → Mínimo: 1 POL
  → Máximo: 10,000 POL por depósito
  
// Calcular rewards pendientes
calculateRewards(address user) returns (uint256)
  → Calcula rewards acumulados
  → Se actualiza en tiempo real
  
// Reclamar rewards
claimRewards()
  → Envía rewards a tu wallet
  → No afecta depósito principal
  
// Retirar depósito
withdraw(uint256 depositId)
  → Solo después del lockup
  → Incluye rewards pendientes
  → Límite diario de retiro
```

### Funciones de Consulta
```solidity
getTotalDeposit(address) → Total depositado
getUserDeposits(address) → Lista de posiciones
getDepositInfo(address, uint256) → Info de posición específica
getUserInfo(address) → Total deposits + rewards
```

---

## 🔧 Hooks del Frontend

### useUserStaking.ts
```typescript
const {
  totalStaked,           // Total depositado (string)
  totalStakedBigInt,     // Total en BigInt
  pendingRewards,        // Rewards pendientes (string)
  pendingRewardsBigInt,  // Rewards en BigInt
  apy,                   // APY actual calculado
  activePositions,       // # de posiciones activas
  isLoading,             // Estado de carga
  error                  // Errores si hay
} = useUserStaking()
```

**Actualización automática:**
- Total deposit: cada 30 segundos
- Pending rewards: cada 15 segundos
- Active positions: cada 30 segundos

---

## 📁 Archivos Clave

```
src/
├── hooks/staking/
│   └── useUserStaking.ts          ← Hook principal
├── pages/
│   └── Staking.tsx                ← Página de staking
├── components/staking/
│   ├── StakingForm.tsx            ← Formulario depósito
│   ├── StakingPositions.tsx       ← Lista posiciones
│   └── RewardsPanel.tsx           ← Panel de rewards
└── abi/
    └── SmartStaking.json          ← ABI del contrato
```

---

## 💡 Límites y Restricciones

| Concepto | Valor |
|----------|-------|
| **Depósito mínimo** | 1 POL |
| **Depósito máximo** | 10,000 POL por depósito |
| **Máx. posiciones** | 10 por wallet |
| **Retiro diario máx.** | 50% del total |
| **Período mínimo** | Sin mínimo (APY base 5%) |
| **Período máximo** | 365 días (APY 17%) |

---

## ⚡ Características Especiales

### 1. Múltiples Posiciones
- Puedes tener hasta 10 depósitos activos
- Cada uno con lockup diferente
- Rewards calculados independientemente

### 2. Compound Automático
- Los rewards NO se auto-componen
- Debes reclamarlos manualmente
- Puedes re-depositar rewards para compound manual

### 3. Emergency Withdraw
```solidity
emergencyUserWithdraw(uint256 depositId)
  → Retiro de emergencia
  → Pierdes 20% del depósito como penalización
  → Para casos críticos únicamente
```

### 4. Lockup Flexible
- **Sin lockup**: APY base (5%)
- **Con lockup**: APY boost (hasta 17%)
- El lockup empieza al depositar
- No se puede cambiar después

---

## 🎯 Casos de Uso Reales

### Caso 1: Staking Corto Plazo
```
Depósito: 100 POL
Lockup: Sin lockup
APY: 5%
Tiempo: 30 días

Rewards = (100 × 5 × 30) / (365 × 100) = 0.41 POL
```

### Caso 2: Staking Largo Plazo
```
Depósito: 1,000 POL
Lockup: 365 días
APY: 17%
Tiempo: 365 días

Rewards = (1,000 × 17 × 365) / (365 × 100) = 170 POL
```

### Caso 3: Múltiples Posiciones
```
Posición 1: 500 POL × 30 días (7% APY)
Posición 2: 1,000 POL × 180 días (13% APY)
Posición 3: 2,000 POL × 365 días (17% APY)

Total staked: 3,500 POL
Rewards estimados (1 año): ~480 POL
```

---

## 🔒 Seguridad

### Funciones de Protección
- ✅ **ReentrancyGuard**: Previene ataques de reentrada
- ✅ **Pausable**: Admin puede pausar en emergencias
- ✅ **AccessControl**: Solo admin puede cambiar parámetros
- ✅ **Rate limiting**: Límite de retiros diarios

### Validaciones
```solidity
// Depósito
require(msg.value >= minDeposit, "DepositTooLow")
require(msg.value <= maxDeposit, "DepositTooHigh")
require(deposits.length < maxDepositsPerUser, "MaxDepositsReached")

// Retiro
require(block.timestamp >= lockEndTime, "LockupNotExpired")
require(amount <= dailyWithdrawLimit, "DailyLimitExceeded")
```

---

## 🐛 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "DepositTooLow" | Menos de 1 POL | Depositar mínimo 1 POL |
| "DepositTooHigh" | Más de 10,000 POL | Dividir en varios depósitos |
| "MaxDepositsReached" | Ya tienes 10 posiciones | Retirar alguna posición |
| "LockupNotExpired" | Intentas retirar antes | Esperar o usar emergency withdraw |
| "DailyLimitExceeded" | Excedes 50% diario | Esperar 24 horas |
| "NoDepositsFound" | No tienes depósitos | Depositar primero |
| "Insufficient funds" | Sin POL en wallet | Comprar POL |

---

## 📊 Dashboard y UI

### Información Mostrada
```
┌─────────────────────────────────┐
│  Total Staked: 3,500 POL        │
│  Pending Rewards: 48.5 POL      │
│  Active Positions: 3            │
│  Current APY: 14.2% (promedio)  │
└─────────────────────────────────┘

┌─ Posición 1 ─────────────────────┐
│ Monto: 500 POL                   │
│ Lockup: 30 días (15 días restantes)│
│ APY: 7%                          │
│ Rewards: 5.8 POL                 │
│ [Claim Rewards] [Withdraw] (bloqueado)│
└──────────────────────────────────┘
```

---

## 🔄 Flujo Técnico: Depósito

```
1. Usuario ingresa monto + lockup
   └─ Frontend valida (1-10k POL)

2. Click "Stake"
   └─ Llama contract.write.deposit()

3. Wallet solicita confirmación
   └─ Usuario aprueba transacción

4. Smart Contract ejecuta
   ├─ Valida monto
   ├─ Crea struct Deposit
   ├─ Emite evento DepositMade
   └─ Guarda en blockchain

5. Frontend detecta evento
   └─ Actualiza UI (30s refresh)

6. ✅ Depósito activo
   └─ Rewards empiezan a acumular
```

---

## 🔄 Flujo Técnico: Claim Rewards

```
1. Usuario ve rewards pendientes
   └─ calculateRewards() consulta contrato

2. Click "Claim Rewards"
   └─ Llama contract.write.claimRewards()

3. Smart Contract ejecuta
   ├─ Calcula rewards actualizados
   ├─ Transfiere POL a usuario
   ├─ Actualiza lastClaimTime
   └─ Emite evento RewardsClaimed

4. Frontend actualiza
   └─ pendingRewards = 0
   └─ Balance wallet aumenta

5. ✅ Rewards reclamados
   └─ Puedes reclamar de nuevo cuando acumulen
```

---

## 🔄 Flujo Técnico: Withdraw

```
1. Usuario selecciona posición
   └─ Verifica lockup expirado

2. Click "Withdraw"
   └─ Llama contract.write.withdraw(depositId)

3. Smart Contract valida
   ├─ Lockup expirado?
   ├─ Límite diario OK?
   └─ Calcula total (depósito + rewards)

4. Transferencia
   ├─ Envía total a usuario
   ├─ Elimina posición
   └─ Emite evento WithdrawalMade

5. ✅ Retiro exitoso
   └─ POL en tu wallet
```

---

## 💻 Variables de Entorno

```env
# .env.local
VITE_STAKING_ADDRESS_V2=0x... # Dirección del contrato
```

---

## ✅ Checklist para Usar Staking

- [ ] Wallet conectada (MetaMask)
- [ ] Red en Polygon
- [ ] POL en wallet (>1)
- [ ] Decidir monto + lockup
- [ ] Aprobar transacción
- [ ] Esperar confirmación (30-60s)
- [ ] Monitorear rewards en dashboard

---

## 📈 Estadísticas del Contrato

### Datos Globales Disponibles
```solidity
totalStaked()           → Total POL en staking
activeStakers()         → # wallets con depósitos activos
totalRewardsPaid()      → Total rewards pagados (histórico)
contractBalance()       → POL disponible en contrato
```

---

## 🎯 Optimización de Staking

### Estrategias Recomendadas

**1. Diversificación de Lockup**
```
25% → Sin lockup (liquidez inmediata)
25% → 30 días (corto plazo)
25% → 180 días (mediano plazo)
25% → 365 días (máximo APY)
```

**2. Compound Manual Estratégico**
```
Cada 30 días:
1. Claim rewards acumulados
2. Re-depositar con lockup de 365 días
3. Maximizar APY (17%)
```

**3. Uso de Múltiples Posiciones**
```
Ventaja: Vencimientos escalonados
→ Siempre tienes liquidez disponible
→ Mantienes APY alto en el resto
```

---

**Resumen:** El sistema de staking de Nuxchain ofrece flexibilidad y rewards competitivos con APYs desde 5% hasta 17% según el lockup elegido. Totalmente descentralizado en Polygon con seguridad auditada.
