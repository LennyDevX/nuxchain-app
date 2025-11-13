# 🎨 Instrucciones de Integración Frontend

## 📋 Configuración de Direcciones

Actualiza tu archivo de configuración de contratos con estas direcciones:

```javascript
// config/contracts.config.js
export const CONTRACT_ADDRESSES = {
  POLYGON_MAINNET: {
    // 📌 USAR ESTA DIRECCIÓN EN TU FRONTEND
    GameifiedMarketplaceProxy: '0xfffaCf763A24F265dea7fea23bF0C7d4E131053c',
    
    // Módulos satelite
    GameifiedMarketplaceSkills: '0x418906d96D40D7f557F86b1Eec27902F5930cFb6',
    GameifiedMarketplaceQuests: '0x2c199bc46E7D5041f1CED8329946662acC482605',
    
    // Staking (opcional para mostrar rewards)
    EnhancedSmartStaking: '0xd332eAF6f64B1ED524B71a53AFf8eF24Bf750422',
    
    // Despliegue anterior (para referencia)
    GameifiedMarketplaceCoreV1: '0xC6f9C827bE011132c077073354dB85D3EBcCC114', // Implementation
  }
};

export const CHAIN_CONFIG = {
  chainId: 137,
  chainName: 'Polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY'],
  blockExplorerUrls: ['https://polygonscan.com'],
};
```

## 🔌 Hooks para React

### 1. Hook de Marketplace

```javascript
// hooks/useGameifiedMarketplace.js
import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react';
import { CONTRACT_ADDRESSES } from '@/config/contracts.config';

export const useGameifiedMarketplace = () => {
  const contract = useContract(
    CONTRACT_ADDRESSES.POLYGON_MAINNET.GameifiedMarketplaceProxy
  );

  // Crear NFT
  const { mutateAsync: createNFT } = useContractWrite(contract, 'createStandardNFT');

  // Obtener perfil de usuario
  const { data: userProfile } = useContractRead(
    contract,
    'userProfiles',
    [address] // address del usuario
  );

  return {
    contract,
    createNFT,
    userProfile,
  };
};
```

### 2. Hook de Skills

```javascript
// hooks/useGameifiedSkills.js
export const useGameifiedSkills = () => {
  const contract = useContract(
    CONTRACT_ADDRESSES.POLYGON_MAINNET.GameifiedMarketplaceSkills
  );

  // Registrar skills
  const { mutateAsync: registerSkills } = useContractWrite(
    contract,
    'registerSkillsForNFT'
  );

  // Obtener skills del NFT
  const { data: skills } = useContractRead(
    contract,
    'getSkillNFTSkills',
    [tokenId]
  );

  return {
    contract,
    registerSkills,
    skills,
  };
};
```

### 3. Hook de Quests

```javascript
// hooks/useGameifiedQuests.js
export const useGameifiedQuests = () => {
  const contract = useContract(
    CONTRACT_ADDRESSES.POLYGON_MAINNET.GameifiedMarketplaceQuests
  );

  // Completar quest
  const { mutateAsync: completeQuest } = useContractWrite(
    contract,
    'completeQuest'
  );

  // Obtener quests completadas
  const { data: completedQuests } = useContractRead(
    contract,
    'getUserCompletedQuests',
    [address]
  );

  return {
    contract,
    completeQuest,
    completedQuests,
  };
};
```

### 4. Hook de Staking (para mostrar rewards)

```javascript
// hooks/useSmartStaking.js
export const useSmartStaking = () => {
  const contract = useContract(
    CONTRACT_ADDRESSES.POLYGON_MAINNET.EnhancedSmartStaking
  );

  // Obtener información de staking
  const { data: stakingInfo } = useContractRead(
    contract,
    'getUserStakingInfo',
    [address]
  );

  return {
    contract,
    stakingInfo,
  };
};
```

## 📱 Componentes Ejemplo

### Crear NFT

```jsx
// components/CreateNFT.jsx
import { useGameifiedMarketplace } from '@/hooks/useGameifiedMarketplace';
import { useState } from 'react';

export const CreateNFT = () => {
  const { createNFT } = useGameifiedMarketplace();
  const [tokenURI, setTokenURI] = useState('');
  const [category, setCategory] = useState('');

  const handleCreate = async () => {
    try {
      const tx = await createNFT({
        args: [tokenURI, category, 500], // 5% royalty
      });
      console.log('NFT creado:', tx);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="create-nft">
      <input 
        placeholder="Token URI" 
        value={tokenURI}
        onChange={(e) => setTokenURI(e.target.value)}
      />
      <input 
        placeholder="Categoría" 
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={handleCreate}>Crear NFT</button>
    </div>
  );
};
```

### Registrar Skills

```jsx
// components/RegisterSkills.jsx
import { useGameifiedSkills } from '@/hooks/useGameifiedSkills';
import { useState } from 'react';

export const RegisterSkills = ({ tokenId }) => {
  const { registerSkills } = useGameifiedSkills();
  const [selectedSkills, setSelectedSkills] = useState([]);

  const SkillTypes = {
    CODING: 0,
    DESIGN: 1,
    MARKETING: 2,
    TRADING: 3,
    COMMUNITY: 4,
    WRITING: 5,
  };

  const Rarities = {
    COMMON: 0,
    UNCOMMON: 1,
    RARE: 2,
    EPIC: 3,
    LEGENDARY: 4,
  };

  const handleRegister = async () => {
    try {
      const skillTypes = selectedSkills.map(s => SkillTypes[s.type]);
      const rarities = selectedSkills.map(s => Rarities[s.rarity]);
      const levels = selectedSkills.map(s => s.level);

      const tx = await registerSkills({
        args: [tokenId, skillTypes, rarities, levels, 1000], // basePrice
      });
      console.log('Skills registrados:', tx);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="register-skills">
      {/* Componente para seleccionar skills */}
      <button onClick={handleRegister}>Registrar Skills</button>
      {/* Automáticamente notificará al staking */}
    </div>
  );
};
```

### Dashboard de Usuario

```jsx
// components/UserDashboard.jsx
import { useGameifiedMarketplace } from '@/hooks/useGameifiedMarketplace';
import { useGameifiedQuests } from '@/hooks/useGameifiedQuests';
import { useSmartStaking } from '@/hooks/useSmartStaking';

export const UserDashboard = ({ address }) => {
  const { userProfile } = useGameifiedMarketplace();
  const { completedQuests } = useGameifiedQuests();
  const { stakingInfo } = useSmartStaking();

  return (
    <div className="dashboard">
      <div className="profile-card">
        <h2>Perfil</h2>
        <p>XP Total: {userProfile?.totalXP}</p>
        <p>Nivel: {userProfile?.level}</p>
        <p>NFTs Creados: {userProfile?.nftsCreated}</p>
        <p>NFTs Comprados: {userProfile?.nftsBought}</p>
      </div>

      <div className="quests-card">
        <h2>Quests Completados</h2>
        <p>{completedQuests?.length || 0} quests</p>
      </div>

      <div className="staking-card">
        <h2>Rewards en Staking</h2>
        <p>Rewards: {stakingInfo?.totalRewards}</p>
        <p>Skill Boosts Aplicados: {stakingInfo?.skillBoostMultiplier}x</p>
      </div>
    </div>
  );
};
```

## 🔄 Sincronización en Tiempo Real

La sincronización ocurre automáticamente:

```
Usuario registra skill
       ↓
Event: SkillAdded emitido
       ↓
✅ Core.updateUserXP() ejecutado
✅ Staking.notifySkillActivation() ejecutado
       ↓
Frontend recibe ambos eventos
```

Para escuchar eventos:

```javascript
// Escuchar evento de skill
const skillFilter = contract.filters.SkillAdded();
contract.on(skillFilter, (tokenId, skillType, rarity) => {
  console.log('Skill agregado:', tokenId, skillType, rarity);
  // Refrescar UI
});

// Escuchar eventos de staking (si integras)
const stakingFilter = stakingContract.filters.SkillActivationNotified();
stakingContract.on(stakingFilter, (user, nftId, skillType, value) => {
  console.log('Staking notificado:', user, nftId);
  // Refrescar rewards
});
```

## 🚀 Deployment en Vercel/Production

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xfffaCf763A24F265dea7fea23bF0C7d4E131053c
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### Build Script

```bash
npm run build  # Compilar con direcciones correctas
npm run start  # Iniciar servidor
```

---

## ✅ Checklist de Integración

- [ ] Actualizar `CONTRACT_ADDRESSES` en config
- [ ] Importar hooks en componentes
- [ ] Crear componentes de UI
- [ ] Conectar Web3 wallet (MetaMask, WalletConnect, etc.)
- [ ] Testear crear NFT
- [ ] Testear registrar skills
- [ ] Testear completar quests
- [ ] Verificar synchronización en Polygonscan
- [ ] Deploy a Vercel/Production

---

**¡Tu frontend ya puede interactuar con todos los contratos desplegados! 🚀**
