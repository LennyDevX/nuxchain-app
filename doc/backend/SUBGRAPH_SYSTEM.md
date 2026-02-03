# 📊 Nuxchain Subgraph System - Documentación Visual

**Última actualización:** Octubre 22, 2025  
**Estado:** ✅ Activo y operativo  
**Versión:** v0.0.2

---

## 📖 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Schema GraphQL](#schema-graphql)
4. [Tipos de Entidades](#tipos-de-entidades)
5. [Flujo de Datos](#flujo-de-datos)
6. [Estructura de Archivos](#estructura-de-archivos)
7. [Consultas Comunes](#consultas-comunes)
8. [Deployment](#deployment)

---

## 🎯 Visión General

El **Subgraph de Nuxchain** es una capa de indexación descentralizada que utiliza **The Graph Protocol** para indexar eventos de blockchain e indexar datos de smart contracts (Staking, Marketplace, NFTs).

```
┌─────────────────────────────────────────────────────────┐
│            BLOCKCHAIN EVENTS (Ethereum/Arbitrum)       │
│  - SmartStaking Deposits/Withdrawals                    │
│  - NFT Mints/Sales/Transfers                            │
│  - Marketplace Listings/Offers                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          SUBGRAPH INDEXER (The Graph)                   │
│  ✓ Event Listeners                                      │
│  ✓ Mappers (Event → Entity)                             │
│  ✓ Schema Validators                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         INDEXED ENTITIES (GraphQL Database)             │
│  - Users                                                │
│  - Deposits, Withdrawals, Compounds                      │
│  - NFT Mints, Sales, Transfers                          │
│  - Marketplace Listings & Offers                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            GRAPHQL QUERIES (Apollo Client)              │
│  Frontend ◄──────► Studio Hosted Service                │
│  Apps ◄───────────► https://thegraph.com/studio        │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
subgraph/
├── schema.graphql          # Definición de tipos GraphQL
├── subgraph.yaml          # Configuración del subgraph
├── abis/                  # Archivos ABI de smart contracts
│   ├── SmartStaking.json
│   ├── Marketplace.json
│   └── NFTToken.json
├── src/
│   └── mappings.ts        # Handlers que transforman eventos en entidades
├── build/                 # Artefactos compilados
├── generated/             # Tipos TypeScript generados automáticamente
└── docs/                  # Documentación técnica
```

### Flujo de Procesamiento

```
EVENT ON BLOCKCHAIN
        │
        ▼
SUBGRAPH DETECTS EVENT
        │
        ▼
MATCHER IDENTIFIES HANDLER
(mappings.ts)
        │
        ▼
HANDLER PROCESSES EVENT
- Valida datos
- Calcula derivadas
- Actualiza entidades
        │
        ▼
ENTITIES STORED
(GraphQL Database)
        │
        ▼
GRAPHQL QUERY RESULT
Enviado a Apollo Client
```

---

## 📊 Schema GraphQL

### Entidad Principal: User

```graphql
type User @entity(immutable: false) {
  # Identificador único - dirección de wallet
  id: Bytes!
  
  # Relaciones derivadas (computed from events)
  deposits: [Deposit!]! @derivedFrom(field: "user")
  withdrawals: [Withdrawal!]! @derivedFrom(field: "user")
  compounds: [Compound!]! @derivedFrom(field: "user")
  
  # NFT Relations
  nftsMinted: [NFTMint!]! @derivedFrom(field: "creator")
  nftsListed: [NFTList!]! @derivedFrom(field: "seller")
  nftsSold: [NFTSale!]! @derivedFrom(field: "seller")
  nftsPurchased: [NFTPurchase!]! @derivedFrom(field: "buyer")
  
  # Marketplace Relations
  offersMade: [OfferCreated!]! @derivedFrom(field: "buyer")
  offersReceived: [OfferAccepted!]! @derivedFrom(field: "seller")
  
  # Agregados
  totalDeposited: BigInt!      # Total stakeado
  totalWithdrawn: BigInt!      # Total retirado
  totalCompounded: BigInt!     # Total compounded
  nftCount: Int!               # NFTs poseídos
  
  # Timestamps
  createdAt: BigInt!           # Primer evento del usuario
  updatedAt: BigInt!           # Último evento del usuario
}
```

### Eventos de Staking

```graphql
# DEPÓSITO EN STAKING
type Deposit @entity(immutable: true) {
  id: ID!                      # tx hash + log index (único)
  user: User!                  # Referencia al usuario
  amount: BigInt!              # Cantidad staqueada
  lockupDuration: BigInt!      # Duración del lock (segundos)
  timestamp: BigInt!           # Timestamp del evento
  transactionHash: Bytes!      # Hash de la transacción
  blockNumber: BigInt!         # Número de bloque
}

# RETIRO DE STAKING
type Withdrawal @entity(immutable: true) {
  id: ID!
  user: User!
  amount: BigInt!
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}

# AUTO-COMPOUND DE REWARDS
type Compound @entity(immutable: true) {
  id: ID!
  user: User!
  amount: BigInt!              # Rewards reinvertidos
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}
```

### Eventos de NFT

```graphql
# MINT DE NFT
type NFTMint @entity(immutable: true) {
  id: ID!
  tokenId: BigInt!
  creator: User!
  tokenURI: String!            # Metadata URI
  category: String!            # Categoría de NFT
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}

# LISTADO EN MARKETPLACE
type NFTList @entity(immutable: true) {
  id: ID!
  tokenId: BigInt!
  seller: User!
  price: BigInt!               # Precio en wei
  category: String!
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}

# VENTA DE NFT
type NFTSale @entity(immutable: true) {
  id: ID!
  tokenId: BigInt!
  seller: User!
  buyer: User!
  price: BigInt!
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}

# DESLISTADO DE NFT
type NFTUnlist @entity(immutable: true) {
  id: ID!
  tokenId: BigInt!
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}
```

### Ofertas en Marketplace

```graphql
# OFERTA CREADA
type OfferCreated @entity(immutable: true) {
  id: ID!
  offerId: BigInt!
  tokenId: BigInt!
  buyer: User!
  amount: BigInt!              # Cantidad ofertada
  expiresAt: BigInt!           # Timestamp de expiración
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}

# OFERTA ACEPTADA
type OfferAccepted @entity(immutable: true) {
  id: ID!
  offerId: BigInt!
  tokenId: BigInt!
  seller: User!
  buyer: User!
  amount: BigInt!
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
}
```

### Entidad Agregada de Actividad

```graphql
type Activity @entity(immutable: true) {
  id: ID!
  type: ActivityType!          # Tipo de actividad (enum)
  user: Bytes!                 # Usuario involucrado
  timestamp: BigInt!
  transactionHash: Bytes!
  blockNumber: BigInt!
  
  # Campos polimórficos (algunos llenan según el tipo)
  amount: BigInt
  tokenId: BigInt
  lockupDuration: BigInt
  category: String
  buyer: Bytes
  seller: Bytes
  offerId: BigInt
}

enum ActivityType {
  STAKING_DEPOSIT
  STAKING_WITHDRAW
  STAKING_COMPOUND
  NFT_MINT
  NFT_LIST
  NFT_SALE
  NFT_PURCHASE
  NFT_UNLIST
  OFFER_MADE
  OFFER_ACCEPTED
}
```

---

## 🔄 Tipos de Entidades

### Relaciones Derivadas

Las relaciones derivadas (`@derivedFrom`) **NO** se almacenan como campos en la base de datos. Se calculan dinámicamente cuando se consultan:

```graphql
# En la definición de User:
deposits: [Deposit!]! @derivedFrom(field: "user")

# Esto es equivalente a:
SELECT * FROM Deposit WHERE user = ?
```

### Entidades Inmutables

```graphql
@entity(immutable: true)  # Los datos nunca cambian después de crearse
@entity(immutable: false) # Los datos pueden ser actualizados
```

**Ejemplos:**
- ✅ **Immutable:** Deposit, Withdrawal, NFTMint (eventos históricos)
- ❌ **Mutable:** User (los conteos pueden cambiar), NFTList (puede ser actualizada)

---

## 📈 Flujo de Datos

### Paso 1: Detección de Evento

```javascript
// SmartStaking Contract emite:
event StakingDeposit(
  indexed address user,
  uint256 amount,
  uint256 lockupDuration
)
```

### Paso 2: Mapping del Evento

```typescript
// En src/mappings.ts
export function handleStakingDeposit(event: StakingDeposit): void {
  // 1. Crear o cargar User
  let user = User.load(event.params.user)
  if (!user) {
    user = new User(event.params.user)
    user.totalDeposited = BigInt.zero()
  }
  
  // 2. Actualizar agregados
  user.totalDeposited = user.totalDeposited.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()
  
  // 3. Crear entidad de Deposit
  let deposit = new Deposit(
    event.transaction.hash.concatI32(event.logIndex)
  )
  deposit.user = user.id
  deposit.amount = event.params.amount
  deposit.lockupDuration = event.params.lockupDuration
  deposit.timestamp = event.block.timestamp
  deposit.transactionHash = event.transaction.hash
  deposit.blockNumber = event.block.number
  deposit.save()
}
```

### Paso 3: Almacenamiento en GraphQL

```json
{
  "user": {
    "id": "0x123abc...",
    "totalDeposited": "1000000000000000000",
    "totalWithdrawn": "0",
    "nftCount": 2,
    "updatedAt": "1697644800",
    "deposits": [
      {
        "id": "0xdef456...",
        "amount": "1000000000000000000",
        "lockupDuration": "31536000",
        "timestamp": "1697644800"
      }
    ]
  }
}
```

### Paso 4: Consulta GraphQL

```graphql
query GetUserActivity($address: Bytes!) {
  user(id: $address) {
    id
    totalDeposited
    totalCompounded
    nftCount
    
    # Relaciones derivadas
    deposits(orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
    }
    
    nftsMinted {
      tokenId
      category
      tokenURI
    }
    
    nftsSold {
      buyer
      price
      timestamp
    }
  }
}
```

---

## 📁 Estructura de Archivos

```
subgraph/
│
├── 📄 package.json
│   └── Scripts: codegen, build, deploy
│
├── 📄 schema.graphql
│   └── Definición completa de tipos GraphQL
│       (User, Deposit, Withdrawal, NFTMint, etc.)
│
├── 📄 subgraph.yaml
│   └── Configuración principal del subgraph
│       - Data sources (Smart contracts)
│       - Event handlers
│       - Network config (Ethereum, Arbitrum)
│
├── 📁 abis/
│   ├── SmartStaking.json
│   │   └── Event signatures para Staking
│   ├── Marketplace.json
│   │   └── Event signatures para NFT Marketplace
│   └── NFTToken.json
│       └── Event signatures para NFT Transfer
│
├── 📁 src/
│   └── mappings.ts
│       └── Handlers que procesan eventos:
│           - handleStakingDeposit()
│           - handleNFTMint()
│           - handleNFTSale()
│           - handleOfferCreated()
│           - handleOfferAccepted()
│
├── 📁 build/
│   ├── subgraph.yaml (compilado)
│   ├── schema.graphql (validado)
│   └── *.wasm (Web Assembly para indexación)
│
├── 📁 generated/
│   ├── schema.ts (Tipos TypeScript generados)
│   ├── templates.ts
│   └── [...]/types.ts
│
└── 📁 docs/
    └── Technical documentation
```

---

## 🔍 Consultas Comunes

### 1. Obtener Actividad de Usuario

```graphql
query GetUserActivity {
  user(id: "0x123...") {
    id
    totalDeposited
    totalWithdrawn
    totalCompounded
    nftCount
    
    deposits(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
    }
    
    withdrawals(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
    }
    
    nftsMinted(first: 10) {
      id
      tokenId
      category
    }
    
    offersMade(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      expiresAt
    }
  }
}
```

### 2. Obtener Actividad Global

```graphql
query GetGlobalActivity {
  activities(
    first: 50
    orderBy: timestamp
    orderDirection: desc
    where: { type: NFT_SALE }
  ) {
    id
    type
    user
    amount
    tokenId
    buyer
    seller
    timestamp
  }
}
```

### 3. Obtener Estadísticas de Staking

```graphql
query GetStakingStats {
  users(first: 1000) {
    id
    totalDeposited
    totalWithdrawn
    totalCompounded
  }
}

# En el frontend, calcular:
# - Total staqueado global
# - Total compounded
# - APY promedio
```

### 4. Obtener NFTs en Venta

```graphql
query GetNFTsForSale {
  nftLists(
    where: { active: true }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    tokenId
    seller
    price
    category
  }
}
```

### 5. Obtener Ofertas Activas

```graphql
query GetActiveOffers {
  offerCreateds(
    where: { expiresAt_gt: $currentTimestamp }
    orderBy: amount
    orderDirection: desc
  ) {
    id
    offerId
    tokenId
    buyer
    amount
    expiresAt
  }
}
```

---

## 🚀 Deployment

### Flujo de Deploy

```
1. DESARROLLO LOCAL
   └── npm run subgraph:codegen
       (Genera tipos TypeScript)
   
2. BUILD
   └── npm run subgraph:build
       (Compila mappings.ts a WebAssembly)
   
3. AUTENTICACIÓN
   └── npm run subgraph:auth
       (Autentica con The Graph Studio)
   
4. DEPLOY A STUDIO
   └── npm run subgraph:deploy
       (Sube a The Graph Studio)
   
5. INDEXACIÓN EN VIVO
   └── The Graph indexa nuevos eventos
       └── Apollo Client consulta GraphQL
```

### Configuración de Network

```yaml
# subgraph.yaml
dataSources:
  - kind: ethereum
    network: arbitrum-one  # o ethereum (mainnet)
    source:
      address: "0x..."
      abi: SmartStaking
      startBlock: 12345678
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - User
        - Deposit
        - Withdrawal
      abis:
        - name: SmartStaking
          file: ./abis/SmartStaking.json
      eventHandlers:
        - event: StakingDeposit(indexed address,uint256,uint256)
          handler: handleStakingDeposit
        - event: StakingWithdrawal(indexed address,uint256)
          handler: handleStakingWithdrawal
```

### Deploy Command

```bash
# Versión v0.0.2 desplegada
npm run subgraph:deploy

# Output:
# ✔ Build completed
# ✔ Authentication successful
# ✔ Deployed to https://thegraph.com/studio/subgraph/nuxchain-subgraph
# ✔ Status: SYNCING
```

---

## 🔗 Endpoints GraphQL

### Studio GraphQL API

```
Endpoint: https://api.studio.thegraph.com/query/
Subgraph ID: 4Ezc4zP6aqkQvk2riKiHc9ZcqfxaLbqg3t8vfbWjGKb
URL: https://api.studio.thegraph.com/query/4Ezc4zP6aqkQvk2riKiHc9ZcqfxaLbqg3t8vfbWjGKb
```

### Desde Apollo Client

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/4Ezc4zP6...',
  cache: new InMemoryCache(),
});

const query = gql`
  query GetUser {
    user(id: "0x123") {
      id
      totalDeposited
      deposits {
        amount
      }
    }
  }
`;

const { data } = await client.query({ query });
```

---

## 📊 Monitoreo y Sincronización

### Estados de Indexación

```
SYNCING ──► HEALTHY ──► FAILED ──► (reindexing)
  ↑
  └── Blockchain → Subgraph
```

### Verificar Estado

```bash
curl https://api.studio.thegraph.com/index-node/graphql \
  -X POST \
  -d '{
    "query": "{ indexingStatusForCurrentVersion(subgraphName: \"nuxchain\") { synced health fatalError { message } } }"
  }'
```

---

## 🔐 Consideraciones de Seguridad

1. **Datos Públicos:** Todo lo indexado es público en la blockchain
2. **Gas Optimization:** Los eventos son más baratos que alternativos on-chain
3. **Validación:** Siempre validar datos en el frontend
4. **Rate Limiting:** The Graph limita a 1000 queries/minuto por IP

---

## 📚 Referencias

- [The Graph Docs](https://thegraph.com/docs/)
- [GraphQL Spec](https://spec.graphql.org/)
- [AssemblyScript](https://www.assemblyscript.org/)
- [Nuxchain Studio](https://thegraph.com/studio/subgraph/nuxchain)

---

**Documento Versión:** 1.0  
**Última actualización:** Octubre 22, 2025  
**Autor:** Nuxchain Development Team  
**Status:** ✅ Producción
