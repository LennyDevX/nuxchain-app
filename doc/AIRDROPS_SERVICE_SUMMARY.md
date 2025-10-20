# 🎯 Servicio de Airdrops en Nuxchain

## 📌 Sistema en 3 Capas

```
1. FRONTEND (React Hooks)       ← useAirdrops.tsx
       ↓
2. FACTORY CONTRACT             ← AirdropFactory.sol
       ↓
3. AIRDROP CONTRACTS (múltiples) ← Airdrops.sol
       ↓
4. BLOCKCHAIN (Registro)        ← Registro + Distribución
```

---

## 🚀 Cómo Funcionan los Airdrops

### Flujo Completo

```
1. Admin crea campaña → AirdropFactory.deployAirdrop()
2. Se despliega nuevo contrato → Airdrops.sol
3. Admin deposita tokens → Contract recibe tokens
4. Usuarios se registran → register()
5. Período de registro termina
6. Período de claim inicia
7. Usuarios reclaman tokens → claim()
8. ✅ Tokens en wallet del usuario
```

---

## 📊 Arquitectura: Factory Pattern

### AirdropFactory.sol
**Función:** Crear y gestionar múltiples campañas de airdrops

```solidity
// Crear nuevo airdrop
deployAirdrop(
  address tokenAddress,      // Token a distribuir
  string name,               // Nombre campaña
  uint256 amountPerUser,     // Tokens por usuario
  uint64 registrationEnd,    // Fin registro (timestamp)
  uint64 claimStart,         // Inicio claim (timestamp)
  uint64 claimEnd            // Fin claim (timestamp)
) → address airdropContract
```

**Datos Guardados:**
```solidity
struct AirdropInfo {
  address airdropContract;   // Contrato del airdrop
  address token;             // Token ERC-20
  uint64 deploymentTime;     // Cuándo se creó
  bool isActive;             // Si está activo
  string name;               // Nombre campaña
}
```

---

## 🎁 Smart Contract de Airdrop Individual

### Funciones Principales

```solidity
// Usuario se registra
register()
  → Verifica: período de registro activo
  → Verifica: no registrado previamente
  → Guarda: dirección en mapping isRegistered
  → Emite: UserRegistered event
  
// Usuario reclama tokens
claim()
  → Verifica: registrado previamente
  → Verifica: período de claim activo
  → Verifica: no ha reclamado antes
  → Transfiere: amountPerUser tokens
  → Marca: hasClaimed = true
  → Emite: TokensClaimed event
  
// Consultas
isRegistered(address) → bool
hasClaimed(address) → bool
getRegisteredUserCount() → uint256
getClaimedUserCount() → uint256
getContractBalance() → uint256
```

### Períodos de Tiempo
```
Timeline del Airdrop:

|-- Registro --|-- Espera --|-- Claim --|
└─────────────┘            └───────────┘
registrationEnd           claimStart  claimEnd
```

---

## 🔧 Hooks del Frontend

### useAirdrops.tsx

```typescript
const {
  // Datos
  airdrops,              // Array de airdrops activos
  globalStats,           // Estadísticas globales
  
  // Estados
  loading,               // Cargando datos
  error,                 // Error si hay
  
  // Funciones
  registerForAirdrop,    // Registrarse en airdrop
  claimFromAirdrop,      // Reclamar tokens
  refreshData,           // Refrescar datos
  deployAirdrop,         // [Admin] Crear airdrop
  
  // Estados transacciones
  isPending,             // Transacción pendiente
  isConfirming,          // Confirmando en blockchain
  isConfirmed,           // Confirmado
  transactionError,      // Error transacción
  transactionHash        // Hash de tx
} = useAirdrops()
```

### AirdropWithStats Interface
```typescript
interface AirdropWithStats {
  // Info básica
  airdropContract: Address
  token: Address
  name: string
  deploymentTime: bigint
  isActive: boolean
  
  // Estadísticas
  registeredUsers: number
  claimedUsers: number
  
  // Estado usuario
  isUserRegistered: boolean
  isUserClaimed: boolean
  canRegister: boolean
  canClaim: boolean
  
  // Tiempos
  registrationEndTime: bigint
  claimStartTime: bigint
  claimEndTime: bigint
}
```

---

## 📁 Archivos Clave

```
src/
├── hooks/airdrops/
│   ├── useAirdrops.tsx            ← Hook principal (lista)
│   ├── useAirdrop.tsx             ← Hook individual
│   └── useAirdropFactory.tsx      ← Factory hook
├── pages/
│   └── Airdrops.tsx               ← Página airdrops
├── components/airdrops/
│   ├── AirdropCard.tsx            ← Tarjeta de airdrop
│   ├── AirdropList.tsx            ← Lista de airdrops
│   └── AirdropStats.tsx           ← Estadísticas
├── abi/
│   ├── AirdropFactory.json        ← ABI Factory
│   └── Airdrop.json               ← ABI Airdrop individual
└── components/web3/
    ├── AirdropFactory.sol         ← Contrato Factory
    └── Airdrops.sol               ← Contrato Airdrop
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario Participa
```
1. Ver airdrop disponible en dashboard
   └─ "Spring Airdrop 2025" - 100 tokens/user

2. Click "Registrarse"
   └─ useAirdrops().registerForAirdrop(airdropAddress)

3. Confirmar en wallet (sin costo gas)
   └─ Transacción: ~$0.0001 en gas

4. Esperar período de claim
   └─ Ver countdown en UI

5. Click "Reclamar Tokens"
   └─ useAirdrops().claimFromAirdrop(airdropAddress)

6. ✅ Tokens en wallet
   └─ 100 tokens recibidos
```

### Caso 2: Admin Crea Airdrop
```
1. Preparar tokens
   └─ Tener tokens ERC-20 en wallet

2. Configurar campaña
   name: "Summer Airdrop"
   token: 0x...
   amountPerUser: 50
   registrationEnd: 7 días
   claimStart: 8 días
   claimEnd: 30 días

3. Deploy airdrop
   └─ deployAirdrop(...params)

4. Transferir tokens al contrato
   └─ ERC20.transfer(airdropAddress, total)

5. ✅ Airdrop activo
   └─ Usuarios pueden registrarse
```

---

## 💡 Límites y Restricciones

| Concepto | Restricción |
|----------|-------------|
| **Registro** | Solo durante período de registro |
| **Claim** | Solo durante período de claim |
| **Registros por wallet** | 1 registro por airdrop |
| **Claims por wallet** | 1 claim por airdrop |
| **Tokens por usuario** | Definido por admin |
| **Pausa** | Admin puede pausar/despausar |

---

## ⚡ Características Especiales

### 1. Verificación de Elegibilidad
```solidity
// Usuario verifica si puede participar
function checkEligibility(address user) returns (bool) {
  - ¿Período de registro activo?
  - ¿Ya registrado?
  - ¿Contrato pausado?
  return eligible;
}
```

### 2. Múltiples Airdrops Simultáneos
- Factory puede gestionar infinitos airdrops
- Cada uno es contrato independiente
- No hay interferencia entre campañas

### 3. Recuperación de Tokens No Reclamados
```solidity
// Admin puede recuperar tokens no reclamados después del claim period
withdrawRemainingTokens()
  → Solo después de claimEnd
  → Solo owner del Factory
```

### 4. Pausa de Emergencia
```solidity
pause() / unpause()
  → Admin puede pausar airdrop
  → Bloquea register() y claim()
  → Para casos de emergencia
```

---

## 🎨 Dashboard UI

### Vista Principal
```
┌────────────────────────────────────────┐
│  📊 Estadísticas Globales              │
│  Total Airdrops: 5                     │
│  Total Registrados: 1,234              │
│  Total Reclamados: 856                 │
│  Tus Registros: 3                      │
│  Tus Claims: 2                         │
└────────────────────────────────────────┘

┌─ Spring Airdrop 2025 ──────────────────┐
│ 🎁 100 tokens/usuario                  │
│ 📅 Registro: 5 días restantes          │
│ 👥 Registrados: 345 usuarios           │
│ ✅ Status: Puedes registrarte          │
│ [Registrarse Ahora]                    │
└────────────────────────────────────────┘

┌─ Winter Airdrop 2024 ──────────────────┐
│ 🎁 50 tokens/usuario                   │
│ 📅 Claim: Activo (10 días restantes)   │
│ 👥 Reclamados: 156/234                 │
│ ✅ Status: Registrado → Reclamar       │
│ [Reclamar Tokens] 💰                   │
└────────────────────────────────────────┘
```

---

## 🔄 Flujo Técnico: Registro

```
1. Usuario ve airdrop activo
   └─ canRegister = true (período válido)

2. Click "Registrarse"
   └─ registerForAirdrop(airdropAddress)

3. Frontend llama contrato
   └─ airdrop.write.register()

4. Smart Contract valida
   ├─ block.timestamp < registrationEndTime?
   ├─ !isRegistered[msg.sender]?
   └─ !paused()?

5. Si OK → Guarda registro
   ├─ isRegistered[msg.sender] = true
   ├─ registeredUserCount++
   └─ emit UserRegistered(msg.sender)

6. ✅ Registrado exitosamente
   └─ UI actualiza: "Registrado ✓"
```

---

## 🔄 Flujo Técnico: Claim

```
1. Período de claim activo
   └─ block.timestamp >= claimStartTime
   └─ block.timestamp <= claimEndTime

2. Usuario registrado previamente
   └─ isRegistered[user] = true

3. Click "Reclamar Tokens"
   └─ claimFromAirdrop(airdropAddress)

4. Smart Contract valida
   ├─ isRegistered[msg.sender]?
   ├─ !hasClaimed[msg.sender]?
   ├─ claim period activo?
   └─ balance suficiente?

5. Transferencia
   ├─ token.transfer(msg.sender, amountPerUser)
   ├─ hasClaimed[msg.sender] = true
   ├─ claimedUserCount++
   └─ emit TokensClaimed(msg.sender, amount)

6. ✅ Tokens reclamados
   └─ Balance actualizado en wallet
```

---

## 🐛 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Not in registration period" | Fuera de período | Esperar fecha de registro |
| "Already registered" | Ya registrado | Esperar período de claim |
| "Not registered" | Intentas claim sin registro | Registrarte primero |
| "Already claimed" | Ya reclamaste | No puedes reclamar dos veces |
| "Claim period not started" | Muy temprano | Esperar fecha de claim |
| "Claim period ended" | Muy tarde | Perdiste esta campaña |
| "Contract paused" | Airdrop pausado | Esperar que admin reactive |
| "Insufficient contract balance" | Sin tokens en contrato | Contactar admin |

---

## 💻 Variables de Entorno

```env
# .env.local
VITE_AIRDROP_FACTORY_ADDRESS=0x... # Dirección Factory
```

---

## 📊 Eventos del Smart Contract

### Factory Events
```solidity
event AirdropDeployed(
  address indexed airdropContract,
  address indexed owner,
  address indexed token,
  string name,
  uint256 index
)
```

### Airdrop Individual Events
```solidity
event UserRegistered(address indexed user)

event TokensClaimed(
  address indexed user,
  uint256 amount
)

event Paused(address account)
event Unpaused(address account)
```

---

## 🔒 Seguridad

### Funciones de Protección
- ✅ **Ownable**: Solo owner puede administrar
- ✅ **Pausable**: Pausa de emergencia
- ✅ **ReentrancyGuard**: Previene reentrada
- ✅ **Validaciones**: Checks exhaustivos

### Validaciones Principales
```solidity
// Registro
require(!isRegistered[msg.sender], "AlreadyRegistered")
require(block.timestamp < registrationEndTime, "RegistrationEnded")
require(!paused(), "ContractPaused")

// Claim
require(isRegistered[msg.sender], "NotRegistered")
require(!hasClaimed[msg.sender], "AlreadyClaimed")
require(block.timestamp >= claimStartTime, "ClaimNotStarted")
require(block.timestamp <= claimEndTime, "ClaimEnded")
require(token.balanceOf(address(this)) >= amountPerUser, "InsufficientBalance")
```

---

## 📈 Estadísticas y Analytics

### Métricas Disponibles
```typescript
// Global Stats
interface GlobalStats {
  totalAirdrops: number          // Total campañas
  totalRegisteredUsers: number   // Registros totales
  totalClaimedUsers: number      // Claims totales
  userRegistrations: number      // Tus registros
  userClaims: number             // Tus claims
}

// Por Airdrop
interface AirdropStats {
  registeredUsers: number        // Usuarios registrados
  claimedUsers: number           // Usuarios que reclamaron
  claimRate: number              // % que reclamó
  remainingTokens: bigint        // Tokens no reclamados
}
```

---

## 🎯 Estrategias de Participación

### Para Usuarios

**1. Monitorear Dashboard**
```
- Revisar airdrops activos semanalmente
- Registrarse ASAP (primeros tienen ventaja)
- Configurar alertas para claim periods
```

**2. No Perder Deadlines**
```
Registro:
  - Registrarse en primeros 24h
  - No esperar último día

Claim:
  - Reclamar en primeros días del período
  - No esperar al último minuto
```

**3. Multi-Wallet Strategy**
```
⚠️ Prohibido: Intentar claim múltiple con misma persona
✅ Permitido: Wallets separadas legítimas
```

### Para Admins

**1. Timing Óptimo**
```
Duración Registro: 7-14 días
Gap: 1-2 días
Duración Claim: 14-30 días

Total campaña: ~1 mes
```

**2. Cantidad de Tokens**
```
Ejemplo para 1,000 usuarios esperados:

Opción A (Conservadora):
  500 usuarios × 100 tokens = 50,000 tokens

Opción B (Generosa):
  1,000 usuarios × 100 tokens = 100,000 tokens
  + 20% buffer = 120,000 tokens
```

---

## ✅ Checklist Usuario

**Para Registrarse:**
- [ ] Wallet conectada
- [ ] Red en Polygon
- [ ] POL para gas (~$0.0001)
- [ ] Período de registro activo
- [ ] No registrado previamente

**Para Reclamar:**
- [ ] Ya registrado
- [ ] Período de claim activo
- [ ] No reclamado previamente
- [ ] Contrato tiene tokens suficientes

---

## 🎁 Historial de Airdrops (Ejemplo)

| Campaña | Fecha | Tokens/User | Participantes | Distribución Total |
|---------|-------|-------------|---------------|-------------------|
| Genesis Airdrop | Q4 2024 | 50 | 1,000 | 50,000 tokens |
| Staking Rewards | Q1 2025 | 150 | 666 | 100,000 tokens |
| Community Drop | Q2 2025 | 100 | 750 | 75,000 tokens |
| NFT Holders | Q3 2025 | 200 | 250 | 50,000 tokens |

**Total Histórico:** 275,000 tokens distribuidos

---

**Resumen:** El sistema de airdrops de Nuxchain usa Factory Pattern para gestionar múltiples campañas simultáneas. Cada airdrop es un contrato independiente con períodos de registro y claim bien definidos. Sistema seguro, eficiente y fácil de usar tanto para usuarios como admins.
