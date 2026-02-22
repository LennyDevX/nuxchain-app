# 📁 Organización de Assets - Carpeta Public

## Estructura de Carpetas Creada

```
public/
├── assets/
│   ├── tokens/              # Imágenes de tokens NUX
│   │   ├── NuxLogo.png
│   │   └── NuxCoin.png
│   │
│   ├── wallets/             # Logos de wallets soportadas
│   │   ├── MetaMaskLogo.png
│   │   ├── PhantomLogo.png
│   │   ├── OKXLogo.webp
│   │   └── WalletConnect.png
│   │
│   ├── nfts/                # Colecciones de NFTs
│   │   └── dragonix/        # Colección Dragonix
│   │       ├── Dragonix.png
│   │       └── DragonixRed_Warrior.png
│   │
│   └── unused/              # Imágenes no utilizadas (seguras de borrar)
│       ├── Airdrops.webp
│       ├── DragonixCardMinting.jpg
│       ├── DragonixCardNFTs.png
│       ├── DragonixCientific.png
│       ├── DragonixFire.jpg
│       ├── DragonixInfluencer.png
│       ├── DragonixMods.png
│       ├── DragonixNFT.jpg
│       ├── DragonixPassportCard.jpg
│       ├── DragonixPol.jpg
│       ├── DragonixVIP.png
│       ├── NFT-Coin.webp
│       ├── OpenSeaLogo.jpg
│       ├── RaribleLogo.jpg
│       ├── favicon1.png
│       └── tokenization.webp
│
├── AvatarsNFTs/             # Carpeta existente (vacía)
├── favicon.svg              # Favicon actual
├── init-react.js
├── manifest.json
└── offline.html
```

## 📊 Análisis de Imágenes

### ✅ Imágenes USADAS (7 imágenes)
| Imagen | Ubicación | Uso |
|--------|-----------|-----|
| `NuxLogo.png` | `assets/tokens/` | Múltiples páginas de mantenimiento y Tokenomics |
| `NuxCoin.png` | `assets/tokens/` | Reserva para futuro uso |
| `MetaMaskLogo.png` | `assets/wallets/` | WalletConnect.tsx |
| `PhantomLogo.png` | `assets/wallets/` | WalletConnect.tsx |
| `OKXLogo.webp` | `assets/wallets/` | WalletConnect.tsx y OkxSolanaAdapter.ts |
| `WalletConnect.png` | `assets/wallets/` | WalletConnect.tsx |
| `Dragonix.png` | `assets/nfts/dragonix/` | wagmi.ts (icono de app) |
| `DragonixRed_Warrior.png` | `assets/nfts/dragonix/` | MarketplaceMaintenance.tsx |

### ❌ Imágenes NO USADAS (16 imágenes - Seguras de Borrar)
Todas las imágenes en `assets/unused/` no se encontraron referencias en el código:
- Airdrops.webp (52 KB)
- DragonixCardMinting.jpg (162 KB)
- DragonixCardNFTs.png (268 KB)
- DragonixCientific.png (229 KB)
- DragonixFire.jpg (241 KB)
- DragonixInfluencer.png (235 KB)
- DragonixMods.png (229 KB)
- DragonixNFT.jpg (252 KB)
- DragonixPassportCard.jpg (655 KB) ⚠️ **Más grande**
- DragonixPol.jpg (257 KB)
- DragonixVIP.png (225 KB)
- NFT-Coin.webp (47 KB)
- OpenSeaLogo.jpg (15 KB)
- RaribleLogo.jpg (9 KB)
- favicon1.png (144 KB) - Duplicado (usa favicon.svg)
- tokenization.webp (78 KB)

**Total de espacio recuperable: ~3.5 MB**

## 🔄 Archivos Actualizados

Se han actualizado las siguientes rutas en el código para apuntar a las nuevas ubicaciones:

1. **wagmi.ts** - Ruta de icono Dragonix
2. **WalletConnect.tsx** - Rutas de logos de wallets
3. **OkxSolanaAdapter.ts** - Ruta de logo OKX
4. **NFTsMaintenance.tsx** - Ruta de NuxLogo
5. **NuxMaintenance.tsx** - Ruta de NuxLogo
6. **Tokenomics.tsx** - Ruta de NuxLogo
7. **TokenomicsMaintenance.tsx** - Ruta de NuxLogo
8. **StoreMaintenance.tsx** - Ruta de NuxLogo
9. **StakingMaintenance.tsx** - Ruta de NuxLogo
10. **ColabMaintenance.tsx** - Ruta de NuxLogo
11. **MarketplaceMaintenance.tsx** - Ruta de DragonixRed_Warrior

## 🗑️ Recomendaciones

### Para Borrar Inmediatamente (Seguro)
Puedes eliminar toda la carpeta `assets/unused/` sin riesgo:
```bash
rm -r public/assets/unused/
```

### Para Futuro
- Considera crear más subcarpetas en `assets/nfts/` para otras colecciones (Avatar NFTs, etc.)
- Mantén la estructura consistente: `assets/{tipo}/{colección}/`
- Documenta nuevas imágenes en este archivo

## 📝 Notas
- Todas las rutas en el código han sido actualizadas automáticamente
- Las imágenes en `assets/unused/` están organizadas pero no eliminadas para que puedas revisar antes de borrar
- El favicon actual es `favicon.svg` (más pequeño y escalable que `favicon1.png`)
