# Nuxchain Subgraph

Subgraph para indexar eventos de los contratos EnhancedSmartStaking y GameifiedMarketplace en Polygon.

## Contratos Indexados (Updated Feb 15, 2026)

### EnhancedSmartStaking Core (v5.0.0)
- **Address**: `0xAA334176a6f94Dfdb361a8c9812E8019558E9E1c`
- **Network**: Polygon (matic)
- **Start Block**: 83023000
- **Features**:
  - Depósitos y retiros con lockup
  - Auto-compound
  - Sistema de Skills NFT
  - Quests y Achievements
  - Gamificación con XP y niveles

### EnhancedSmartStakingRewards (v5.0.0)
- **Address**: `0x6844540B3DFb79D33FBbd458D5Ea3A62c2bB5CBA`
- **Network**: Polygon (matic)
- **Start Block**: 83023000

### EnhancedSmartStakingGamification (v5.0.0)
- **Address**: `0xc47929beab8EFc09690aDF9e0d0266ae7380Ec97`
- **Network**: Polygon (matic)
- **Start Block**: 83023000

### EnhancedSmartStakingSkills (v5.0.0)
- **Address**: `0xe2eed56a88a756A3E1339b0a80b001fEBEA907d5`
- **Network**: Polygon (matic)
- **Start Block**: 83023000

### GameifiedMarketplace (v3.0 - PROXY)
- **Address**: `0xe99f85503aa287a1C06D7c3487DD1c4cE1DfbEe1`
- **Network**: Polygon (matic)
- **Start Block**: 83023000
- **Features**:
  - Mint, list, buy/sell NFTs
  - Sistema de ofertas
  - Royalties automáticas
  - Perfil de usuario con XP y niveles
  - Tracking de actividades

### Individual Skills Contract
- **Address**: `0x462b22c7Ac1Bf9C035258D6510E5404Fd97010F1`
- **Network**: Polygon (matic)
- **Start Block**: 83023000

### Marketplace Quests
- **Address**: `0x1ae4244d1678776b068A29dDE3417CF5710D04A0`
- **Network**: Polygon (matic)
- **Start Block**: 83023000

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

### 3. Autenticar con The Graph
```bash
graph auth --studio <DEPLOY_KEY>
```

### 4. Deploy a The Graph Studio
```bash
graph deploy --studio nuxchain-subgraph
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
