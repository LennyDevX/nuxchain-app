# Tutorial Section Image Mapping

## Current Image Assignments

This document maps which images from `/public` are used in each tutorial section.

### Staking Section
- **Image**: `/DragonixPol.jpg`
- **Purpose**: Hero image showing dragon with POL staking concept
- **Location**: Right side of section

### NFT Minting Section
- **Image**: `/DragonixFire.jpg`
- **Purpose**: Hero image showing dragon with fire (creation/power concept)
- **Location**: Right side of section

### Airdrop Section
- **Image**: `/DragonixPassportCard.jpg`
- **Purpose**: Hero image showing dragon with passport/NFT concept
- **Location**: Left side of section

### Comparison Section (Marketplace Logos)
- **Nuxchain**: `/Dragonix.png` - Dragon mascot logo
- **OpenSea**: `/OpenSeaLogo.jpg` - Official OpenSea logo
- **Rarible**: `/RaribleLogo.jpg` - Official Rarible logo

## Available Images in /public

### Dragon/Mascot Images
- `Dragonix.png` - Main dragon logo (purple/green)
- `DragonixCardMinting.jpg` - Dragon card variant
- `DragonixCardNFTs.png` - Dragon card for NFTs
- `DragonixFire.jpg` - Dragon with fire effects
- `DragonixNFT.jpg` - Dragon NFT art
- `DragonixPol.jpg` - Dragon with POL coin/staking
- `DragonixPassportCard.jpg` - Dragon with passport card

### Platform Logos
- `OpenSeaLogo.jpg` - OpenSea marketplace logo
- `RaribleLogo.jpg` - Rarible marketplace logo

### Other Assets
- `Airdrops.webp` - Airdrop concept image
- `NeoHumanNFT.webp` - NFT artwork
- `NFT-Coin.webp` - NFT coin concept
- `NUXCoin.gif` - NUX token animation
- `tokenization.webp` - Tokenization concept
- `MetaMaskLogo.png`, `PhantomLogo.png`, `OKXLogo.webp`, `WalletConnect.png` - Wallet logos
- `favicon.svg`, `favicon1.png` - Site favicons

## Background System

All sections now use the **GlobalBackground component** from `/src/ui/gradientBackground.tsx` which provides a consistent:
- Deep space radial gradient background
- Purple/indigo nebula effect
- Smooth animation
- Applied site-wide across all pages

This replaces individual background gradients in each section for a cohesive visual experience.
