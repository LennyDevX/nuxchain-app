# 🎯 Cómo Funciona el Servicio de NFTs en Nuxchain

## 📌 El Sistema en 3 Capas

```
1. FRONTEND (React)         ← Lo que ves
       ↓
2. IPFS (Pinata)           ← Almacenamiento de archivos
       ↓
3. BLOCKCHAIN (Polygon)    ← Registro permanente
```

---

## 🚀 Crear un NFT (Paso a Paso)

1. **Subes imagen** → Se envía a Pinata/IPFS → Obtiene un hash único (CID)
2. **Creas metadata** → JSON con nombre, descripción, imagen → Se envía a IPFS
3. **Llamas Smart Contract** → Función `createNFT(metadataUrl, categoría, royalty)`
4. **Confirmas en wallet** → Pagas gas en POL (~0.0001)
5. **✅ NFT creado** → Aparece en blockchain y tu colección

**Archivos clave:**
- `src/hooks/nfts/useMintNFT.tsx` → Lógica de creación
- `src/utils/ipfs/ipfsUtils.ts` → Upload a IPFS/Pinata

---

## 🛍️ Marketplace (Comprar/Vender)

### Para Vender
- Click "Listar para Venta"
- Estableces precio
- Se guarda en blockchain
- NFT aparece en marketplace

### Para Comprar
- Click "Comprar" en marketplace
- Se distribuye: 5% plataforma, 2.5% creador, resto al vendedor
- NFT te pertenece

**Archivo clave:**
- `src/hooks/nfts/useListedNFT.tsx` → Compra/venta/ofertas

---

## 💾 Cómo se Cargan los NFTs

### Mi Colección (`src/pages/NFTs.tsx`)
```
useUserNFTsLazy Hook
├─ Busca tokens que te pertenecen
├─ Carga primeros 20
├─ Al hacer scroll: carga 10 más (lazy loading)
└─ Caché: guarda datos 30 min
```

### Marketplace (`src/pages/Marketplace.tsx`)
```
useMarketplace Hook
├─ Escanea blockchain (tokens 1-100)
├─ Filtra solo "isForSale = true"
├─ Descarga metadata de IPFS
├─ Caché: guarda datos 30 min
└─ Rate limiting: si falla, espera 10 min
```

**Archivos clave:**
- `src/hooks/nfts/useUserNFTsLazy.tsx` → Mi colección
- `src/hooks/nfts/useMarketplace.tsx` → Marketplace

---

## 📤 Pinata + IPFS (Almacenamiento)

### Configuración
```env
VITE_PINATA_JWT=pinata_jwt_xxxx  # Tu API key de Pinata
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### Cómo Funciona
1. **Upload archivo** → API Pinata → Hash IPFS (Qm...)
2. **Pinata pinea** → Replica en red IPFS → Garantiza disponibilidad
3. **Multiple gateways** → Si uno falla, intenta otro automáticamente
4. **URL final** → `https://gateway.pinata.cloud/ipfs/QmXxxx...`

**El flujo:**
```
Imagen → uploadFileToIPFS() → Pinata → IPFS → CID → URL gateway
JSON   → uploadJsonToIPFS()  → Pinata → IPFS → CID → URL gateway
```

**Archivo clave:**
- `src/utils/ipfs/ipfsUtils.ts` → Upload/descarga IPFS

---

## 🔗 Smart Contract (Blockchain)

### Funciones Principales

```solidity
createNFT(uri, categoria, royalty)
  → Crea NFT en blockchain
  
listTokenForSale(tokenId, price, categoria)
  → Lista para vender
  
buyToken(tokenId)
  → Compra NFT
  
makeOffer(tokenId, días)
  → Hace oferta
  
acceptOffer(offerId)
  → Acepta oferta
```

### Datos Guardados (Permanentes)
- **Propiedad**: Quién es dueño
- **Metadata URI**: Apunta a IPFS
- **Precio**: Si está a la venta
- **Royalties**: % que cobra creador
- **Histórico**: Todos los eventos

**Archivo clave:**
- `src/abi/Marketplace.json` → Interface del contrato

---

## 💰 Comisiones y Royalties

En cada venta de 10 POL:
```
5% Plataforma → 0.5 POL
2.5% Creador  → 0.25 POL (recurrente en cada reventa)
Vendedor      → 9.25 POL
```

---

## 🎨 Componentes Principales

| Componente | Ubicación | Función |
|-----------|----------|---------|
| NFTCard | `components/nfts/NFTCard.tsx` | Tarjeta de 1 NFT |
| NFTGrid | `components/nfts/NFTGrid.tsx` | Grid de NFTs |
| ListingModal | `components/nfts/ListingModal.tsx` | Modal para listar |
| MarketplaceFilters | `components/marketplace/MarketplaceFilters.tsx` | Filtros |

---

## ⚙️ Caché y Performance

```
Caché de 30 minutos (localStorage)
├─ Si existe y es válido: usa caché (instantáneo)
└─ Si no: descarga de blockchain (5-10 segundos)

Lazy loading de imágenes
└─ Carga 3 en paralelo mientras haces scroll
```

---

## 🐛 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Pinata JWT not configured" | .env.local vacío | Agregar VITE_PINATA_JWT |
| "NFT no aparece" | Blockchain lento | Esperar 1-2 minutos |
| "Imagen no carga" | Gateway congestionado | Sistema reintentas automático |
| "Insufficient funds" | Sin POL | Compra POL |

---

## 📊 En Números

- **Gas**: $0.0001 - $0.001 USD
- **Tiempo crear**: 30-60 segundos
- **Tiempo vender**: 30-60 segundos
- **Comisión**: 5%
- **Max royalty**: 10%
- **Max archivo**: 50 MB

---

## 🔍 Flujo Completo: Crear → Listar → Vender

```
1. Sube imagen a IPFS (Pinata)
   └─ `uploadFileToIPFS(file)` → CID_IMAGEN

2. Crea metadata JSON
   └─ { name, description, image: CID_IMAGEN, attributes }

3. Sube metadata a IPFS
   └─ `uploadJsonToIPFS(metadata)` → CID_METADATA

4. Llama createNFT(CID_METADATA, "art", 250)
   └─ Smart Contract crea NFT #1

5. Espera confirmación blockchain
   └─ ~30 segundos

6. ✅ NFT visible en "Mi Colección"

7. Click "Listar para Venta"
   └─ `listTokenForSale(1, 2.5, "art")`

8. NFT aparece en Marketplace

9. Comprador compra por 2.5 POL
   └─ `buyToken(1)` con value=2.5

10. ✅ NFT vendido
    └─ 0.125 POL → Plataforma
    └─ 0.0625 POL → Creador
    └─ 2.3125 POL → Vendedor
```

---

## 📁 Archivos Importantes

```
src/
├── hooks/nfts/
│   ├── useMintNFT.tsx              ← Crear NFT
│   ├── useMarketplace.tsx          ← Cargar marketplace
│   ├── useUserNFTsLazy.tsx         ← Cargar mi colección
│   └── useListedNFT.tsx            ← Compra/venta
├── components/nfts/
│   ├── NFTCard.tsx
│   ├── NFTGrid.tsx
│   ├── ListingModal.tsx
│   └── InfiniteScrollNFTGrid.tsx
├── utils/ipfs/
│   └── ipfsUtils.ts                ← Upload/descarga IPFS
├── pages/
│   ├── NFTs.tsx                    ← Mi colección
│   └── Marketplace.tsx             ← Marketplace
└── abi/
    └── Marketplace.json            ← Smart Contract ABI
```

---

## ✅ Checklist para Empezar

- [ ] Wallet conectada (MetaMask)
- [ ] Red en Polygon
- [ ] POL en wallet (>0.1)
- [ ] .env.local con VITE_PINATA_JWT
- [ ] `npm run dev` corriendo

---

**Eso es.** El sistema en una página.
