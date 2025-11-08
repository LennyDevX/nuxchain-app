# 🧩 Components Library Guide

**Last Updated:** November 2025  
**Status:** ✅ Current - Beta 7.0  
**Audience:** Developers

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [UI Components](#ui-components)
3. [NFT Components](#nft-components)
4. [Marketplace Components](#marketplace-components)
5. [Forms & Inputs](#forms--inputs)
6. [Modals & Dialogs](#modals--dialogs)
7. [Loading States](#loading-states)
8. [Web3 Components](#web3-components)

---

## 🎯 Overview

Nuxchain uses a component-based architecture with reusable, accessible, and animated UI components. All components are built with:

- ✅ **TypeScript** for type safety
- ✅ **TailwindCSS** for styling
- ✅ **Framer Motion** for animations
- ✅ **Accessibility** (WCAG 2.1 AA)
- ✅ **Responsive** design

---

## 🎨 UI Components

### SkeletonLoader

**Purpose:** Loading placeholders with fixed heights to prevent CLS (Cumulative Layout Shift).

**Location:** `src/components/ui/SkeletonLoader.tsx`

**Variants:**
- `SkeletonLoader` - Generic base with customizable props
- `CardSkeletonLoader` - For card grids (300px height)
- `ListSkeletonLoader` - For lists with avatars (40px per item)
- `TableSkeletonLoader` - For data tables (50px per row)
- `HeroSkeletonLoader` - For hero/banner sections (600px height)

**Usage:**

```tsx
import { 
  SkeletonLoader, 
  CardSkeletonLoader, 
  HeroSkeletonLoader 
} from '@/components/ui/SkeletonLoader';

// Generic skeleton
<SkeletonLoader 
  width="100%" 
  height="200px" 
  variant="rounded" 
/>

// Card grid skeleton
<div className="grid grid-cols-3 gap-4">
  <CardSkeletonLoader count={6} />
</div>

// Hero section skeleton
<HeroSkeletonLoader />
```

**Props:**

```typescript
interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  variant?: 'rounded' | 'rectangular' | 'circular';
  count?: number;
  className?: string;
}
```

**Features:**
- Fixed heights prevent layout shift
- Framer Motion pulse animation
- Staggered delays for natural loading
- `aria-busy` for accessibility

---

### Card Component

**Purpose:** Reusable card container with glass effect and hover animations.

**Location:** Uses `card-base` and `card-unified` CSS classes from `src/styles/components.css`

**Usage:**

```tsx
// Base card
<div className="card-base">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Glass effect card
<div className="card-unified">
  <h3>Glass Card</h3>
  <p>With backdrop filter</p>
</div>

// Animated card with Framer Motion
import { motion } from 'framer-motion';

<motion.div 
  className="card-base"
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  <h3>Animated Card</h3>
</motion.div>
```

**CSS Classes:**

```css
.card-base {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 300ms ease-out;
}

.card-base:hover {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 20px 35px -5px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}
```

---

### Button Components

**Purpose:** Consistent button styling across the app.

**CSS Classes:** `btn-primary`, `btn-secondary`

**Usage:**

```tsx
// Primary button
<button className="btn-primary">
  Click Me
</button>

// Secondary button
<button className="btn-secondary">
  Cancel
</button>

// Button with loading state
<button 
  className="btn-primary" 
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="animate-spin">⏳</span>
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>

// Animated button
import { motion } from 'framer-motion';

<motion.button
  className="btn-primary"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Buy NFT
</motion.button>
```

**Styles:**

```css
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  min-height: 44px;  /* WCAG touch target */
  transition: all 300ms ease-out;
}

.btn-secondary {
  background: transparent;
  border: 2px solid rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
  padding: 0.75rem 1.5rem;
  min-height: 44px;
}
```

---

### ResponsiveImage

**Purpose:** Optimized image component with lazy loading and fallback.

**Location:** `src/components/ui/ResponsiveImage.tsx`

**Usage:**

```tsx
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

<ResponsiveImage
  src="https://ipfs.io/ipfs/..."
  alt="NFT artwork"
  width={400}
  height={400}
  loading="lazy"
  fallback="/placeholder.jpg"
/>
```

**Props:**

```typescript
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fallback?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}
```

**Features:**
- Automatic IPFS gateway handling
- Image caching with `ImageCache` utility
- Lazy loading support
- Error fallback
- Loading skeleton

---

## 🖼️ NFT Components

### NFTCard (Desktop)

**Purpose:** Display NFT details on desktop with 2-column hero layout.

**Location:** `src/components/nfts/NFTCard.tsx`

**Usage:**

```tsx
import { NFTCard } from '@/components/nfts/NFTCard';

<NFTCard
  nft={{
    id: '1',
    name: 'Cool NFT #123',
    image: 'ipfs://...',
    description: 'Awesome NFT',
    price: 100n,
    owner: '0x123...',
    skills: [...]
  }}
  onBuy={(id) => console.log('Buy', id)}
/>
```

**Features:**
- 2-column layout (image + details)
- Glass effect background
- Gradient border with purple accent
- Hover glow animation
- Owner detection (hide buy button if owner)

---

### NFTCardMobile

**Purpose:** Mobile-optimized NFT card with 3-slide carousel.

**Location:** `src/components/nfts/NFTCardMobile.tsx`

**Usage:**

```tsx
import { NFTCardMobile } from '@/components/nfts/NFTCardMobile';

<NFTCardMobile
  nft={nftData}
  onBuy={(id) => handlePurchase(id)}
/>
```

**Features:**
- 3-slide carousel (100% width each)
  - Slide 1: Description + Price
  - Slide 2: Addresses & Identities
  - Slide 3: Attributes Gallery (2-column grid)
- Optimized typography for mobile
- Touch-friendly controls
- Swipe navigation

---

### NFTGrid

**Purpose:** Responsive grid layout for NFT collections.

**Location:** `src/components/nfts/NFTGrid.tsx`

**Usage:**

```tsx
import { NFTGrid } from '@/components/nfts/NFTGrid';

<NFTGrid
  nfts={nftsArray}
  isLoading={loading}
  onSelectNFT={(nft) => navigate(`/nfts/${nft.id}`)}
/>
```

**Features:**
- Responsive grid (1 col mobile → 4 cols desktop)
- Infinite scroll support
- Loading skeletons
- Empty state
- Virtualization for large lists

---

### NFTFilters

**Purpose:** Filter controls for NFT marketplace.

**Location:** `src/components/nfts/NFTFilters.tsx`

**Usage:**

```tsx
import { NFTFilters } from '@/components/nfts/NFTFilters';

<NFTFilters
  filters={currentFilters}
  onChange={(newFilters) => setFilters(newFilters)}
/>
```

**Available Filters:**
- Category (Art, Music, Gaming, etc.)
- Price range
- Rarity (Common, Rare, Legendary)
- Skills (Stake Boost, Auto Compound, etc.)
- For Sale / All

---

## 🏪 Marketplace Components

### MarketplaceStats

**Purpose:** Display marketplace statistics (total sales, volume, etc.).

**Location:** `src/components/marketplace/MarketplaceStats.tsx`

**Usage:**

```tsx
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats';

<MarketplaceStats
  totalSales={1234}
  volume="45,678 POL"
  activeListings={567}
  uniqueOwners={234}
/>
```

**Features:**
- Animated counters
- Icon indicators
- Responsive grid
- Loading skeleton

---

### MarketplaceFilters

**Purpose:** Advanced filtering sidebar for marketplace.

**Location:** `src/components/marketplace/MarketplaceFilters.tsx`

**Usage:**

```tsx
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';

<MarketplaceFilters
  onFilterChange={(filters) => applyFilters(filters)}
  categories={categories}
  priceRange={{ min: 0, max: 1000 }}
/>
```

**Filter Options:**
- Search by name
- Category selection
- Price range slider
- Sort by (newest, price, popularity)
- Filter by skills
- For sale toggle

---

## 📝 Forms & Inputs

### FileUpload (Tokenization)

**Purpose:** NFT artwork upload with preview and validation.

**Location:** `src/components/tokenization/FileUpload.tsx`

**Usage:**

```tsx
import { FileUpload } from '@/components/tokenization/FileUpload';

<FileUpload
  onFileSelect={(file) => handleFile(file)}
  accept="image/*"
  maxSize={10 * 1024 * 1024}  // 10MB
/>
```

**Features:**
- Drag & drop support
- File preview
- Size validation
- Format validation (PNG, JPG, GIF, WEBP)
- Remove file button
- Animated upload icon (floating animation)
- Error messages

**Animations:**
- Container: fade-in + slide-up (0.5s)
- Upload icon: floating (y: [0, -8, 0], 2.5s loop)
- Preview: zoom on hover
- Remove button: scale feedback

---

### NFTDetails Form (Tokenization)

**Purpose:** NFT metadata input form with skills configuration.

**Location:** `src/components/tokenization/NFTDetails.tsx`

**Usage:**

```tsx
import { NFTDetails } from '@/components/tokenization/NFTDetails';

<NFTDetails
  onSubmit={(data) => mintNFT(data)}
  availableSkills={SKILL_CONFIGS}
/>
```

**Form Fields:**
- Name (text input)
- Description (textarea)
- Category (select)
- NFT Type (Standard/Skill NFT)
- Skills selection (if Skill NFT)
- Rarity selection

**Animations:**
- Title: fade-in (0.1s)
- Name field: slide-in (0.15s)
- Description: slide-in (0.2s)
- Category: slide-in (0.25s)
- NFT Type buttons: hover scale
- Submit: delayed slide-up (0.35s)

---

## 🔔 Modals & Dialogs

### BuyModal

**Purpose:** Purchase confirmation modal for NFTs.

**Location:** `src/components/marketplace/BuyModal.tsx`

**Usage:**

```tsx
import { BuyModal } from '@/components/marketplace/BuyModal';

<BuyModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  nft={selectedNFT}
  onConfirm={(nftId) => purchaseNFT(nftId)}
/>
```

**Features:**
- Backdrop blur
- ESC key to close
- Focus trap (keyboard navigation)
- Price display
- Balance check
- Confirmation button
- Loading state during transaction

---

### ListingModal

**Purpose:** List NFT for sale on marketplace.

**Location:** `src/components/marketplace/ListingModal.tsx`

**Usage:**

```tsx
import { ListingModal } from '@/components/marketplace/ListingModal';

<ListingModal
  isOpen={showListing}
  onClose={() => setShowListing(false)}
  nft={nftToList}
  onSubmit={(price) => listNFT(nft.id, price)}
/>
```

**Features:**
- Price input (POL)
- Duration selection (7, 14, 30 days)
- Preview of listing
- Fee calculation
- Form validation

---

### ApiOverloadToast

**Purpose:** Display notification when API rate limit is reached.

**Location:** `src/components/ui/ApiOverloadToast.tsx`

**Usage:**

```tsx
import { ApiOverloadToast } from '@/components/ui/ApiOverloadToast';

// Automatically shown when API overload detected
// No manual usage needed - handled by global state
```

**Features:**
- Auto-dismiss after 5 seconds
- Slide-in animation
- Warning icon
- Action button (Retry)
- Stacks multiple toasts

---

## ⏳ Loading States

### ProgressIndicator (Tokenization)

**Purpose:** NFT creation progress tracking with multiple steps.

**Location:** `src/components/tokenization/ProgressIndicator.tsx`

**Usage:**

```tsx
import { ProgressIndicator } from '@/components/tokenization/ProgressIndicator';

<ProgressIndicator
  currentStep={2}
  steps={[
    'Upload artwork',
    'Add details',
    'Configure skills',
    'Mint NFT'
  ]}
  progress={50}  // 0-100
/>
```

**Features:**
- Progress bar with shimmer effect
- Step indicators (completed/active/pending)
- Dynamic tips based on current step
- Spinner during processing
- Success animation (bounce)

**Animations:**
- Progress bar: width animation + shimmer
- Steps: stagger animation (0.1s delay each)
- Spinner: 360° rotation (linear, 2s)
- Success: spring bounce
- Tips: fade-in with delay (0.5s)

---

### HeroSkeletonLoader

**Purpose:** Loading skeleton for hero/banner sections.

**Location:** `src/components/ui/SkeletonLoader.tsx`

**Usage:**

```tsx
import { HeroSkeletonLoader } from '@/components/ui/SkeletonLoader';

// In Home page
{isLoading ? (
  <HeroSkeletonLoader />
) : (
  <HeroSection data={heroData} />
)}
```

**Features:**
- Fixed 600px height
- Multiple skeleton blocks
- Pulse animation
- Prevents CLS

---

## 🌐 Web3 Components

### WalletConnectButton

**Purpose:** Connect wallet with multiple provider support.

**Location:** `src/components/web3/WalletConnectButton.tsx`

**Usage:**

```tsx
import { WalletConnectButton } from '@/components/web3/WalletConnectButton';

<WalletConnectButton />
```

**Supported Wallets:**
- MetaMask
- WalletConnect
- Coinbase Wallet
- Injected providers

**Features:**
- Auto-detect installed wallets
- Connection status indicator
- Balance display (when connected)
- Network switcher (Polygon)
- Disconnect button

---

### StakingCard

**Purpose:** Display staking position with APY calculator.

**Location:** `src/components/staking/StakingCard.tsx`

**Usage:**

```tsx
import { StakingCard } from '@/components/staking/StakingCard';

<StakingCard
  stakedAmount={1000n}
  apy={20}
  rewards={50n}
  duration={30}
  onClaim={() => claimRewards()}
  onUnstake={() => unstakeTokens()}
/>
```

**Features:**
- Real-time APY calculation
- Countdown timer for lock period
- Rewards display
- Claim button (enabled when claimable)
- Unstake button (enabled when lock expired)
- Skills indicators (if Skill NFT staked)

---

## 🎨 Styling Patterns

### Common Class Combinations

```tsx
// Card with animation
<div className="card-base hover:scale-105 transition-transform">

// Button with glow on hover
<button className="btn-primary hover:shadow-purple-glow">

// Text gradient
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">

// Glass effect
<div className="glass-effect backdrop-blur-lg">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Centered container
<div className="container mx-auto px-4 py-8">
```

---

## 🔗 Related Documentation

- [Tech Stack Guide](STACK.md) - Technologies used
- [Architecture Guide](ARCHITECTURE.md) - Project structure
- [Design System](frontend/02-DESIGN_SYSTEM_AND_UI.md) - Design tokens
- [Performance Guide](frontend/01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md)

---

## 📝 Component Checklist

When creating new components, ensure:

- [ ] TypeScript interfaces for all props
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (aria-labels, keyboard navigation)
- [ ] Loading states (skeletons)
- [ ] Error states
- [ ] Hover/focus animations
- [ ] TailwindCSS classes (avoid inline styles)
- [ ] JSDoc comments for complex logic

---

**Created:** November 2025  
**Maintained by:** Nuxchain Team
