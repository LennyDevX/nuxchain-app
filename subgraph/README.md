# Nuxchain Subgraph

Subgraph para indexar eventos de los contratos EnhancedSmartStaking y GameifiedMarketplace en Polygon.

## Contratos Indexados

### EnhancedSmartStaking (v4.0.0)
- **Address**: `0xae57acBf4efE2F6536D992F86145a20e11DB8C3D`
- **Network**: Polygon (matic)
- **Start Block**: 64419650
- **Features**:
  - Depósitos y retiros con lockup
  - Auto-compound
  - Sistema de Skills NFT
  - Quests y Achievements
  - Gamificación con XP y niveles

### GameifiedMarketplace (v2.0)
- **Address**: `0xB948cC766CBE97Ce822bF4c915D2319fbc48Ad38`
- **Network**: Polygon (matic)
- **Start Block**: 64419800
- **Features**:
  - Mint, list, buy/sell NFTs
  - Sistema de ofertas
  - Royalties automáticas
  - Perfil de usuario con XP y niveles
  - Tracking de actividades

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
