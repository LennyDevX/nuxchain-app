# 📋 Configuración de Contratos Inteligentes

Guía completa para actualizar y gestionar las direcciones y ABIs de tus contratos inteligentes en Polygon.

## 🚀 Inicio Rápido

### 1. **Actualizar Direcciones desde Variables de Entorno**

Las direcciones se cargan automáticamente desde variables de entorno. Actualiza tu `.env`:

```bash
# Contratos Principales
VITE_GAMEIFIED_MARKETPLACE_PROXY=0x...
VITE_GAMEIFIED_MARKETPLACE_SKILLS=0x...
VITE_GAMEIFIED_MARKETPLACE_QUESTS=0x...
VITE_ENHANCED_SMART_STAKING=0x...

# Módulos Adicionales
VITE_LEVELING_SYSTEM=0x...
VITE_REFERRAL_SYSTEM=0x...
# ... etc
```

Ver [`.env.contracts.example`](.env.contracts.example) para la lista completa.

### 2. **Actualizar Automáticamente desde Hardhat**

Si tienes un proyecto Hardhat que despliega los contratos:

```bash
# En tu proyecto Hardhat, ejecuta:
npx hardhat run scripts/export-contract-addresses.ts --network polygon

# Esto genera: ./deployments/deployed-addresses.json

# En el frontend, ejecuta:
node scripts/update-contract-config.js ./deployments/deployed-addresses.json
```

## 📖 Uso en Componentes React

### Obtener Dirección de un Contrato

```typescript
import { getContractAddress, CONTRACT_ADDRESSES } from '@/abi/contracts.config';

// Opción 1: Función helper
const proxyAddress = getContractAddress('GameifiedMarketplaceProxy');

// Opción 2: Constante directa
const { GameifiedMarketplaceProxy } = CONTRACT_ADDRESSES;
```

### Obtener ABI de un Contrato

```typescript
import { getContractABI } from '@/abi/contracts.config';

// Obtener ABI
const abi = getContractABI('GameifiedMarketplaceProxy');

// Usar con Viem
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({
  chain: polygon,
  transport: http()
});

// Leer datos del contrato
const balance = await client.readContract({
  address: '0x...',
  abi: abi,
  functionName: 'balanceOf',
  args: ['0x...']
});
```

### Usar con Wagmi (Hooks)

```typescript
import { useReadContract } from 'wagmi';
import { getContractAddress, getContractABI } from '@/abi/contracts.config';

export const UserProfile = ({ address }: { address: string }) => {
  const { data } = useReadContract({
    address: getContractAddress('GameifiedMarketplaceProxy'),
    abi: getContractABI('GameifiedMarketplaceProxy'),
    functionName: 'getUserProfile',
    args: [address]
  });

  return <div>{/* render data */}</div>;
};
```

## 🛠️ Estructura de Archivos

```
src/abi/
├── contracts.config.ts          ← Configuración principal
├── index.ts                     ← Exportaciones públicas
├── GameifiedMarketplaceProxy/
│   └── GameifiedMarketplaceProxy.json
├── GameifiedMarketplaceSkillsV2/
│   └── GameifiedMarketplaceSkillsV2.json
├── SmartStaking/
│   ├── EnhancedSmartStaking.json
│   ├── EnhancedSmartStakingView.json
│   ├── EnhancedSmartStakingSkills.json
│   └── EnhancedSmartStakingRewards.json
└── ... (otros contratos)
```

## 🔄 Workflow de Desarrollo

### Workflow Local

```bash
# 1. Desplegar contratos en Hardhat
cd hardhat-project
npx hardhat run scripts/deploy.ts

# 2. Exportar direcciones y actualizar frontend
npx hardhat run scripts/export-contract-addresses.ts

# 3. En el frontend
npm run dev
```

### Workflow CI/CD

En tu pipeline de CI/CD (GitHub Actions, etc.):

```yaml
- name: Export Contract Addresses
  run: |
    cd hardhat-project
    npx hardhat run scripts/export-contract-addresses.ts --network polygon
    
- name: Update Frontend Config
  run: |
    node scripts/update-contract-config.js hardhat-project/deployments/deployed-addresses.json
    
- name: Build Frontend
  run: npm run build
```

## 📚 Tipos TypeScript

### Enums Compilados a Constantes

**Antes (enum - genera código runtime):**
```typescript
enum SkillType {
  CODING = 0,
  DESIGN = 1,
  // ...
}
// ❌ No permitido con erasableSyntaxOnly
```

**Ahora (const con `as const` - solo tipos):**
```typescript
export const SkillType = {
  CODING: 0,
  DESIGN: 1,
  // ...
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

// Uso:
const skillType: SkillType = SkillType.CODING; // ✅ Type-safe
```

### Tipos de ABIs

```typescript
export type AbiType = readonly Record<string, unknown>[];

export interface ContractABIs {
  GameifiedMarketplaceProxy: AbiType;
  GameifiedMarketplaceSkills: AbiType;
  // ...
}
```

## 🔑 Variables de Entorno Soportadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_GAMEIFIED_MARKETPLACE_PROXY` | Contrato proxy principal | `0xfffaCf...` |
| `VITE_GAMEIFIED_MARKETPLACE_SKILLS` | Módulo de habilidades | `0x4189...` |
| `VITE_GAMEIFIED_MARKETPLACE_QUESTS` | Módulo de misiones | `0x2c19...` |
| `VITE_ENHANCED_SMART_STAKING` | Staking con gamificación | `0xd332...` |
| `VITE_LEVELING_SYSTEM` | Sistema de niveles | `0x...` |
| `VITE_REFERRAL_SYSTEM` | Sistema de referidos | `0x...` |
| `VITE_TREASURY_MANAGER` | Gestor de tesorería | `0x...` |

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Leer Balance en Staking

```typescript
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, getContractABI } from '@/abi/contracts.config';
import { formatEther } from 'viem';

export function StakingBalance({ account }: { account: string }) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESSES.EnhancedSmartStaking,
    abi: getContractABI('EnhancedSmartStaking'),
    functionName: 'stakingBalance',
    args: [account]
  });

  return (
    <div>
      Balance: {formatEther(data || 0n)} MATIC
    </div>
  );
}
```

### Ejemplo 2: Crear NFT con Skills

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, getContractABI, Rarity } from '@/abi/contracts.config';

export function CreateNFT() {
  const { writeContract, data: hash } = useWriteContract();

  const handleCreateNFT = async (metadata: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.GameifiedMarketplaceProxy,
      abi: getContractABI('GameifiedMarketplaceProxy'),
      functionName: 'createNFT',
      args: [metadata, Rarity.RARE]
    });
  };

  return (
    <button onClick={() => handleCreateNFT('...')}>
      Crear NFT
    </button>
  );
}
```

## ⚙️ Desarrollo Avanzado

### Validar Direcciones al Iniciar

```typescript
// En tu main.tsx o App.tsx
import { CONTRACT_ADDRESSES } from '@/abi/contracts.config';

function validateAddresses() {
  const addresses = Object.entries(CONTRACT_ADDRESSES);
  const invalid = addresses.filter(([_, addr]) => !addr || addr === '');
  
  if (invalid.length > 0) {
    console.warn('⚠️  Direcciones no configuradas:', invalid.map(([name]) => name));
  }
}

validateAddresses();
```

### Usar con Ethers.js (si lo prefieres)

```typescript
import { Contract, JsonRpcProvider } from 'ethers';
import { getContractAddress, getContractABI } from '@/abi/contracts.config';

const provider = new JsonRpcProvider('https://polygon-rpc.com');
const contract = new Contract(
  getContractAddress('GameifiedMarketplaceProxy'),
  getContractABI('GameifiedMarketplaceProxy'),
  provider
);

const balance = await contract.balanceOf('0x...');
```

## 📞 Soporte

- **Docs**: Ver `src/abi/USAGE_GUIDE.js`
- **Scripts**: Ver `scripts/update-contract-config.js`
- **Hardhat**: Ver `scripts/export-contract-addresses.example.ts`

---

**Última actualización:** Febrero 2026
