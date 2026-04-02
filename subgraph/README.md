# Nuxchain Subgraph

Subgraph para indexar los contratos activos de Nuxchain en Polygon usando The Graph Studio.

## Estado actual

- Red: Polygon (`matic`)
- Start block base: `83626688`
- Slug objetivo para el siguiente deploy: `nuxgraph`
- Fuente de verdad de addresses: `src/deployments/addresses.json` y `src/lib/export/config/contracts.generated.ts`

## Contratos indexados

### EnhancedSmartStaking Core
- Address: `0x96D6F29d5046CB4422e5e3BC2bdF185Fd21f302D`

### EnhancedSmartStakingRewards
- Address: `0x3d9E78Fe36fD89C96dd27a84b0837324316279BB`

### EnhancedSmartStakingGamification
- Address: `0x0753920050340ABb3e005435bEd838d0EaB282ce`

### EnhancedSmartStakingSkills
- Address: `0xdBab58a4E28F1b3E22145F051994e05ef8f5aef7`

### GameifiedMarketplaceCore Proxy
- Address: `0xB39421d34479aa4bFe560DefB66eA6A46cA5909A`

### IndividualSkillsMarketplace
- Address: `0xb9F7De1560C97100D84D550b330AC99a35533481`

### GameifiedMarketplaceQuests
- Address: `0x126712d66b5AC71fCe1117A36D2BDd69Af141e6B`

## Instalación

```bash
# Instalar dependencias
npm install

# Instalar Graph CLI globalmente
npm install -g @graphprotocol/graph-cli
```

## Comandos

### 1. Generar código TypeScript
```bash
graph codegen
```

### 2. Build el subgraph
```bash
graph build
```

### 3. Deploy a The Graph Studio
```bash
npm run deploy
```

El script `npm run deploy` carga automáticamente `../.env` y `../.env.local` si existen, y usa estas variables de entorno:

- `SUBGRAPH_STUDIO_SLUG`
- `SUBGRAPH_DEPLOY_KEY`
- `SUBGRAPH_VERSION_LABEL` (opcional, default `0.1.0`)

Ejemplo:

```bash
SUBGRAPH_STUDIO_SLUG=nuxgraph
SUBGRAPH_DEPLOY_KEY=your_deploy_key
SUBGRAPH_VERSION_LABEL=0.1.0
npm run deploy
```

## Estructura de Entidades

### User
- Wallet address del usuario
- Totales de staking (deposited, withdrawn, compounded)
- NFTs minteados/vendidos/comprados
- Nivel y XP total
- Relaciones con todas las actividades

### Staking Entities
- `Deposit`: Depósitos en staking
- `Withdrawal`: Retiros
- `Compound`: Compounding manual
- `AutoCompound`: Auto-compound ejecutado
- `SkillProfile`: Perfil de gamificación
- `NFTSkill`: Skills NFT activados
- `QuestCompletion`: Quests completados
- `AchievementUnlock`: Achievements desbloqueados

### Marketplace Entities
- `NFTMint`: NFTs minteados
- `NFTList`: NFTs listados para venta
- `NFTSale`: Ventas realizadas
- `NFTPurchase`: Compras realizadas
- `NFTUnlist`: NFTs retirados de venta
- `OfferCreated`: Ofertas creadas
- `OfferAccepted`: Ofertas aceptadas
- `OfferCancelled`: Ofertas canceladas
- `RoyaltyPaid`: Royalties pagadas
- `MarketplaceProfile`: Perfil de usuario

### Activity
Registro unificado de todas las actividades del usuario con tipos:
- `STAKING_DEPOSIT`, `STAKING_WITHDRAW`, `STAKING_COMPOUND`, `STAKING_AUTO_COMPOUND`
- `SKILL_ACTIVATED`, `SKILL_DEACTIVATED`, `SKILL_UPGRADED`
- `QUEST_COMPLETED`, `ACHIEVEMENT_UNLOCKED`
- `NFT_MINT`, `NFT_LIST`, `NFT_SALE`, `NFT_PURCHASE`, `NFT_UNLIST`
- `OFFER_MADE`, `OFFER_ACCEPTED`, `OFFER_CANCELLED`
- `ROYALTY_PAID`, `XP_GAINED`, `LEVEL_UP`

## Queries de Ejemplo

### Obtener actividades de un usuario
```graphql
{
  user(id: "0x...") {
    id
    totalDeposited
    totalWithdrawn
    nftCount
    level
    totalXP
    deposits(orderBy: timestamp, orderDirection: desc) {
      amount
      lockupDuration
      timestamp
    }
    nftsMinted {
      tokenId
      tokenURI
      category
      timestamp
    }
    activeSkills {
      skillType
      effectValue
      isActive
    }
  }
}
```

### Últimas ventas NFT
```graphql
{
  nftSales(first: 10, orderBy: timestamp, orderDirection: desc) {
    tokenId
    seller {
      id
    }
    buyer {
      id
    }
    price
    royaltyPaid
    timestamp
  }
}
```

### Actividades recientes
```graphql
{
  activities(first: 20, orderBy: timestamp, orderDirection: desc) {
    id
    type
    user
    amount
    tokenId
    timestamp
  }
}
```

### Perfil de usuario completo
```graphql
{
  user(id: "0x...") {
    id
    skillProfile {
      level
      totalXP
      maxActiveSkills
      stakingBoostTotal
      hasAutoCompound
    }
    marketplaceProfile {
      level
      totalXP
      nftsCreated
      nftsSold
      nftsBought
    }
    questsCompleted {
      questId
      rewardAmount
      timestamp
    }
    achievementsUnlocked {
      achievementId
      rewardAmount
      timestamp
    }
  }
}
```

## Notas de Desarrollo

- Los ABIs deben estar sincronizados con los contratos desplegados
- Los start blocks deben ser anteriores al primer evento emitido
- Actualizar los handlers cuando se agreguen nuevos eventos
- Verificar que los tipos en schema.graphql coincidan con los eventos

## Troubleshooting

### Error: "failed to deploy"
1. Verificar autenticación: `graph auth --studio <KEY>`
2. Verificar build exitoso: `graph build`
3. Verificar network name en subgraph.yaml

### Error: "No data"
1. Verificar start block es correcto
2. Verificar address del contrato
3. Verificar que los eventos se estén emitiendo

### Error: "Schema validation failed"
1. Ejecutar `graph codegen` después de cambios en schema
2. Verificar tipos coincidan en handlers y schema

## Recursos

- [The Graph Docs](https://thegraph.com/docs/)
- [AssemblyScript API](https://thegraph.com/docs/en/developing/assemblyscript-api/)
- [Polygon Explorer](https://polygonscan.com/)
