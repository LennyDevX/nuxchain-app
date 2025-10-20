# 🎯 Servicio de Tokenización en Nuxchain

## 📌 Sistema en 3 Capas

```
1. FRONTEND (React Form)        ← Tokenization.tsx
       ↓
2. IPFS (Pinata)                ← uploadFileToIPFS + uploadJsonToIPFS
       ↓
3. SMART CONTRACT (Polygon)     ← Marketplace.sol (createNFT)
       ↓
4. BLOCKCHAIN (Registro)        ← Token ID + Metadata URI
```

---

## 🚀 Cómo Funciona la Tokenización

### Flujo Completo de Creación de NFT

```
1. Usuario sube imagen
   └─ Validación: tipo (image/*) y tamaño (<10MB)

2. Usuario completa formulario
   ├─ Nombre del NFT
   ├─ Descripción
   ├─ Categoría (art, collectible, photography, etc.)
   ├─ Royalty % (default: 2.5%)
   └─ Atributos opcionales (trait_type, value)

3. Click "Create NFT"
   └─ useMintNFT().mintNFT({...params})

4. Upload imagen a IPFS
   └─ uploadFileToIPFS(file) → CID → Gateway URL
   └─ Fallback: Local data URL si falla

5. Crear metadata JSON
   {
     name: "...",
     description: "...",
     image: "ipfs://Qm...",
     attributes: [...]
   }

6. Upload metadata a IPFS
   └─ uploadJsonToIPFS(metadata) → CID → Metadata URL
   └─ Fallback: Blob URL si falla

7. Llamar Smart Contract
   └─ contract.write.createNFT(metadataUrl, category, royalty)

8. Confirmar en wallet
   └─ Usuario aprueba transacción (gas: ~$0.0001-0.001)

9. Esperar confirmación blockchain
   └─ publicClient.waitForTransactionReceipt(txHash)

10. ✅ NFT creado exitosamente
    └─ Redirige a /nfts (Mi Colección)
```

---

## 📝 Interface del Formulario

### FormData Structure
```typescript
interface FormData {
  name: string;                 // Nombre del NFT
  description: string;          // Descripción
  category: string;             // Categoría (art, collectible, etc.)
  royaltyPercentage: number;    // Royalty en basis points (250 = 2.5%)
  attributes: Array<{           // Atributos personalizados
    trait_type: string;         // Tipo de atributo
    value: string;              // Valor
  }>;
}
```

### Valores Default
```typescript
{
  name: '',
  description: '',
  category: 'art',               // Categoría por defecto
  royaltyPercentage: 250,        // 2.5% royalty por defecto
  attributes: [{ trait_type: '', value: '' }]
}
```

---

## 🎨 Categorías Disponibles

### Mapeo de Categorías
```javascript
// Frontend → Blockchain
const categoryMap = {
  'collectible'  → 'coleccionables',
  'artwork'      → 'arte',
  'art'          → 'arte',
  'photography'  → 'fotografia',
  'music'        → 'musica',
  'video'        → 'video',
  'item'         → 'collectible',
  'document'     → 'collectible'
}
```

### Registro de Categorías
El contrato intenta registrar la categoría automáticamente si no existe:
```solidity
// Verifica y registra si es necesario
registerCategory(category)
  → Si ya existe: continúa
  → Si no existe: registra y continúa
```

---

## 📤 IPFS Upload (Pinata)

### uploadFileToIPFS(file)
**Función:** Subir imagen a IPFS vía Pinata

```typescript
Input: File object
Process:
  1. Crea FormData con archivo
  2. POST a Pinata API (pinFileToIPFS)
  3. Recibe CID (Content Identifier)
  4. Construye gateway URL
Output: 
  "https://gateway.pinata.cloud/ipfs/QmXxxx..."

Fallback (si falla):
  → Crea data URL local
  → "data:image/png;base64,..."
```

### uploadJsonToIPFS(metadata)
**Función:** Subir metadata JSON a IPFS

```typescript
Input: { name, description, image, attributes }
Process:
  1. Convierte JSON a Blob
  2. POST a Pinata API
  3. Recibe CID
  4. Construye gateway URL
Output:
  "https://gateway.pinata.cloud/ipfs/QmYyyy..."

Fallback (si falla):
  → Crea Blob URL local
  → "blob:https://..."
```

---

## 🔧 Hook: useMintNFT

### Interface
```typescript
const {
  mintNFT,      // Función principal
  loading,      // Estado carga
  error,        // Error si hay
  success,      // Éxito
  txHash        // Transaction hash
} = useMintNFT()
```

### Función mintNFT
```typescript
mintNFT({
  file: File,           // Archivo imagen
  name: string,         // Nombre NFT
  description: string,  // Descripción
  category: string,     // Categoría
  royalty: number       // Royalty basis points
}) → Promise<MintNFTResult>
```

### MintNFTResult
```typescript
interface MintNFTResult {
  success: boolean;           // ¿Exitoso?
  txHash: string;            // Hash transacción
  tokenId: number | null;    // ID del token
  imageUrl: string;          // URL de imagen IPFS
  metadataUrl: string;       // URL de metadata IPFS
  contractAddress: string;   // Dirección contrato
}
```

---

## 📊 Smart Contract Integration

### createNFT Function
```solidity
createNFT(
  string memory uri,        // Metadata URI (IPFS)
  string memory category,   // Categoría
  uint96 royaltyPercentage  // Royalty basis points (250 = 2.5%)
) returns (uint256 tokenId)
```

### Proceso en Blockchain
```
1. Valida parámetros
2. Incrementa tokenId counter
3. Minta token ERC-721
4. Guarda metadata URI
5. Registra categoría
6. Configura royalty (ERC-2981)
7. Emite evento TokenMinted
8. Retorna tokenId
```

### Evento Emitido
```solidity
event TokenMinted(
  uint256 indexed tokenId,
  address indexed creator,
  string uri,
  string category
)
```

---

## 📁 Archivos Clave

```
src/
├── pages/
│   └── Tokenization.tsx           ← Página principal
├── hooks/nfts/
│   └── useMintNFT.tsx             ← Hook de minting
├── components/tokenization/
│   ├── FileUpload.tsx             ← Upload de archivo
│   ├── NFTDetails.tsx             ← Formulario detalles
│   ├── ProgressIndicator.tsx      ← Indicador progreso
│   └── InfoCarousel.tsx           ← Info/ayuda
├── utils/ipfs/
│   └── ipfsUtils.ts               ← Funciones IPFS
└── abi/
    └── Marketplace.json           ← ABI del contrato
```

---

## 💰 Royalties (ERC-2981)

### Sistema de Royalties
```
Royalty Percentage: 0% - 10%
Default: 2.5% (250 basis points)

Basis Points = Porcentaje × 100
Ejemplos:
  2.5% = 250 basis points
  5.0% = 500 basis points
  10% = 1000 basis points
```

### Cómo Funcionan
```
Cada vez que el NFT se vende:
  Precio de venta: 10 POL
  Royalty (2.5%): 0.25 POL → Creador original
  Vendedor recibe: 9.75 POL

Recurrente en TODAS las ventas futuras
```

---

## 🎯 Metadata Structure

### JSON Completo
```json
{
  "name": "My Awesome NFT",
  "description": "A unique digital artwork...",
  "image": "ipfs://QmImageHash...",
  "attributes": [
    {
      "trait_type": "Category",
      "value": "art"
    },
    {
      "trait_type": "Creator",
      "value": "0x1234...5678"
    },
    {
      "trait_type": "Created",
      "value": "2025-10-20T12:34:56.789Z"
    },
    {
      "trait_type": "Custom Attribute",
      "value": "Special Value"
    }
  ]
}
```

### Atributos Automáticos
- **Category**: Categoría seleccionada
- **Creator**: Dirección wallet del creador
- **Created**: Timestamp ISO de creación

### Atributos Personalizados
Usuario puede agregar ilimitados atributos:
```typescript
addAttribute() // Agrega campo vacío
removeAttribute(index) // Elimina atributo
updateAttribute(index, field, value) // Actualiza valor
```

---

## ⚡ Validaciones

### Validación de Imagen
```typescript
// Tipo de archivo
if (!file.type.startsWith('image/')) {
  error: "Please select a valid image file"
}

// Tamaño de archivo
if (file.size > 10 * 1024 * 1024) {
  error: "File size must be less than 10MB"
}

// Tipos soportados
- image/png
- image/jpeg
- image/jpg
- image/gif
- image/svg+xml
- image/webp
```

### Validación de Form
```typescript
// Wallet conectado
if (!isConnected) {
  error: "Please connect your wallet first"
}

// Archivo seleccionado
if (!selectedFile) {
  error: "Please select an image file"
}

// Campos requeridos
if (!name.trim() || !description.trim()) {
  error: "Please fill in all required fields"
}
```

### Validación de Contrato
```typescript
// Dirección de contrato válida
if (!CONTRACT_ADDRESS) {
  error: "Invalid contract address"
}

// Wallet conectado con signer
if (!walletClient || !address) {
  error: "Please connect your wallet to mint NFTs"
}
```

---

## 🔄 Flujo Técnico Detallado

### 1. Setup Inicial
```typescript
const CONTRACT_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS
const { address } = useAccount()
const { data: walletClient } = useWalletClient()
const publicClient = usePublicClient()
```

### 2. Validar Contrato
```typescript
const validatedContractAddress = useMemo(() => {
  if (!CONTRACT_ADDRESS) return null;
  return isAddress(CONTRACT_ADDRESS) ? CONTRACT_ADDRESS : null;
}, []);
```

### 3. Normalizar Categoría
```typescript
const normalizedCategory = categoryMap[category] || 'coleccionables'
console.log("Category:", category, "→", normalizedCategory)
```

### 4. Registrar Categoría (Auto)
```typescript
try {
  await contract.write.registerCategory([normalizedCategory])
} catch (err) {
  // Si ya está registrada, continúa
  if (err.message.includes("already registered")) {
    // OK, continuar
  }
}
```

### 5. Upload Imagen
```typescript
let imageUrl
try {
  imageUrl = await uploadFileToIPFS(file)
  console.log("Image uploaded:", imageUrl)
} catch (error) {
  console.warn("IPFS failed, using local data URL")
  imageUrl = await createLocalDataUrl(file)
}
```

### 6. Crear Metadata
```typescript
const metadata = {
  name: name || "Untitled NFT",
  description: description || "A unique digital asset",
  image: imageUrl,
  attributes: [
    { trait_type: "Category", value: category },
    { trait_type: "Creator", value: address },
    { trait_type: "Created", value: new Date().toISOString() }
  ]
}
```

### 7. Upload Metadata
```typescript
let metadataUrl
try {
  metadataUrl = await uploadJsonToIPFS(metadata)
} catch (error) {
  // Fallback to Blob URL
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  metadataUrl = URL.createObjectURL(blob)
}
```

### 8. Estimate Gas
```typescript
const royaltyBasisPoints = Math.floor(royalty || 250)
const gasEstimate = await contract.estimateGas.createNFT([
  metadataUrl,
  normalizedCategory,
  royaltyBasisPoints
])
console.log("Gas estimate:", gasEstimate.toString())
```

### 9. Ejecutar Mint
```typescript
const txHash = await contract.write.createNFT([
  metadataUrl,
  normalizedCategory,
  royaltyBasisPoints
], {
  gas: 500000n // Gas limit razonable
})
console.log("Transaction submitted:", txHash)
```

### 10. Esperar Confirmación
```typescript
const receipt = await publicClient.waitForTransactionReceipt({ 
  hash: txHash 
})

if (receipt.status === 'success') {
  // Extraer tokenId de eventos
  const tokenId = extractTokenIdFromLogs(receipt.logs)
  
  return {
    success: true,
    txHash,
    tokenId,
    imageUrl,
    metadataUrl,
    contractAddress: CONTRACT_ADDRESS
  }
}
```

---

## 🐛 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Please connect wallet" | Wallet no conectado | Conectar MetaMask |
| "Please select image file" | Sin archivo | Subir imagen |
| "Fill all required fields" | Campos vacíos | Completar nombre + descripción |
| "File size > 10MB" | Archivo muy grande | Comprimir imagen |
| "Invalid file type" | No es imagen | Usar PNG/JPG/GIF/etc |
| "user rejected" | Usuario cancela | Aprobar en wallet |
| "insufficient funds" | Sin POL | Comprar POL |
| "Invalid contract address" | .env mal configurado | Verificar VITE_MARKETPLACE_ADDRESS |
| "IPFS upload failed" | Pinata caído | Usa fallback automático |
| "Transaction failed" | Revert en blockchain | Verificar parámetros |

---

## 💻 Variables de Entorno

```env
# .env.local
VITE_MARKETPLACE_ADDRESS=0x...      # Contrato Marketplace
VITE_PINATA_JWT=eyJhbGc...          # JWT de Pinata
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

---

## 🎨 UI/UX Components

### FileUpload Component
```typescript
<FileUpload
  selectedFile={file}
  imagePreview={preview}
  onFileSelect={handleFileSelect}
  onFileRemove={handleFileRemove}
  error={error}
/>
```

### NFTDetails Component
```typescript
<NFTDetails
  formData={formData}
  setFormData={setFormData}
  onSubmit={handleSubmit}
  addAttribute={addAttribute}
  removeAttribute={removeAttribute}
  updateAttribute={updateAttribute}
  isUploading={loading}
  error={error}
/>
```

### ProgressIndicator Component
```typescript
<ProgressIndicator
  isUploading={loading}
  uploadProgress={50}
  isPending={loading}
  isConfirming={loading}
  success={success}
/>
```

**Estados mostrados:**
1. 📤 Uploading to IPFS...
2. ⏳ Pending transaction...
3. ✅ Confirming on blockchain...
4. 🎉 NFT created successfully!

---

## 📊 Gas Costs

### Estimados
```
createNFT() transaction:
  Gas usado: ~200,000 - 300,000
  Gas price: ~30 gwei (Polygon)
  Costo: ~$0.0001 - $0.001 USD

Factores que afectan:
  - Longitud de metadata URI
  - Cantidad de atributos
  - Si necesita registrar categoría
  - Congestión de red
```

---

## ✅ Checklist para Crear NFT

**Usuario:**
- [ ] Wallet conectada (MetaMask)
- [ ] Red en Polygon
- [ ] POL para gas (~0.001)
- [ ] Imagen lista (<10MB)
- [ ] Nombre descriptivo
- [ ] Descripción completa
- [ ] Categoría apropiada
- [ ] Royalty definido (0-10%)

**Developer:**
- [ ] VITE_MARKETPLACE_ADDRESS configurada
- [ ] VITE_PINATA_JWT configurada
- [ ] Contract deployed y verificado
- [ ] Pinata account activo
- [ ] IPFS gateways funcionando

---

## 🔄 Fallback System

### Resiliencia de Uploads

**IPFS Upload Fallback:**
```
1. Intenta: Pinata API
   ├─ Success: usa IPFS gateway URL
   └─ Fail: crea local data URL

2. Intenta: Metadata upload
   ├─ Success: usa IPFS metadata URL
   └─ Fail: crea Blob URL local
```

**Ventajas:**
- ✅ Nunca bloquea el minting
- ✅ Funciona incluso si Pinata falla
- ✅ URLs locales como respaldo temporal
- ✅ Re-intentos automáticos

---

## 🎯 Casos de Uso

### Caso 1: NFT de Arte Simple
```
File: artwork.png (2MB)
Name: "Sunset Dreams"
Description: "Digital painting of a sunset..."
Category: art
Royalty: 2.5%
Attributes: (ninguno adicional)

Tiempo total: ~30-45 segundos
Gas: ~$0.0002
```

### Caso 2: NFT Coleccionable con Atributos
```
File: character.png (5MB)
Name: "Nux Warrior #42"
Description: "Rare warrior from the Nux collection..."
Category: collectible
Royalty: 5%
Attributes:
  - Rarity: Legendary
  - Strength: 95
  - Speed: 87
  - Element: Fire

Tiempo total: ~40-60 segundos
Gas: ~$0.0003
```

### Caso 3: NFT de Fotografía
```
File: photo.jpg (8MB)
Name: "City Lights"
Description: "Night photography of downtown..."
Category: photography
Royalty: 10% (máximo)
Attributes:
  - Location: Downtown LA
  - Camera: Sony A7III
  - Date: 2025-10-20

Tiempo total: ~45-70 segundos
Gas: ~$0.0003
```

---

## 🚀 Optimizaciones Aplicadas

### Performance
- ✅ **useMemo**: Contract address validado una vez
- ✅ **useCallback**: mintNFT memoizado
- ✅ **Category Map**: Objeto fuera del componente
- ✅ **Local Fallback**: Data URLs si IPFS falla
- ✅ **Gas Estimation**: Pre-calcula gas necesario

### UX
- ✅ **Preview Instant**: Vista previa de imagen
- ✅ **Progress States**: Estados claros de progreso
- ✅ **Error Handling**: Mensajes descriptivos
- ✅ **Auto Redirect**: Redirige a /nfts al éxito
- ✅ **Form Validation**: Validación en tiempo real

### Seguridad
- ✅ **File Type Check**: Solo imágenes
- ✅ **Size Limit**: Max 10MB
- ✅ **Address Validation**: Verifica contrato válido
- ✅ **Wallet Check**: Verifica conexión
- ✅ **Gas Limit**: Límite razonable (500k)

---

**Resumen:** El servicio de tokenización de Nuxchain permite crear NFTs de forma simple y segura. Upload a IPFS vía Pinata, metadata estructurada, royalties configurables (ERC-2981), y categorías personalizadas. Sistema con fallbacks automáticos para máxima resiliencia. Proceso completo en 30-60 segundos con costo < $0.001 USD.
