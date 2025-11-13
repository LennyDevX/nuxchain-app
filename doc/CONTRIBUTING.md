# 🤝 Contributing to Nuxchain

> **Welcome! This guide will help you set up the project, understand our standards, and contribute effectively.**

**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Adding Features](#adding-features)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Pull Request Process](#pull-request-process)

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** v20+ installed
- **pnpm** v9+ (package manager)
- **Git** configured
- **VS Code** (recommended IDE)
- **MetaMask** or compatible Web3 wallet

### Quick Start

```bash
# Clone repository
git clone https://github.com/nuxchain/nuxchain-app.git
cd nuxchain-app

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# http://localhost:5173
```

---

## Development Setup

### 1. Install Dependencies

```bash
# Frontend dependencies
pnpm install

# Backend dependencies (optional)
cd api
pnpm install
cd ..

# Subgraph dependencies (optional)
cd subgraph
pnpm install
cd ..
```

### 2. Environment Variables

Create `.env` file in the root directory:

```bash
# Required for development
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Optional (for AI features)
GOOGLE_API_KEY=your_gemini_api_key

# Optional (for subgraph)
SUBGRAPH_API_KEY=your_subgraph_key
```

### 3. VS Code Extensions (Recommended)

Install these extensions for the best development experience:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Vue Plugin** (`Vue.vscode-typescript-vue-plugin`)

### 4. Start Development Server

```bash
# Start frontend (port 5173)
pnpm dev

# Start backend (port 3000)
pnpm server

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## Project Structure

```
nuxchain-app/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Route pages
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS files
│   └── types/              # TypeScript types
├── api/                    # Backend API
│   ├── _services/          # Backend services
│   ├── _middlewares/       # Express middlewares
│   └── chat/               # Chat API endpoints
├── subgraph/               # The Graph subgraph
│   ├── src/                # Subgraph mappings
│   └── schema.graphql      # GraphQL schema
├── public/                 # Static assets
└── doc/                    # Documentation
    ├── STACK.md            # Tech stack guide
    ├── COMPONENTS.md       # Component library
    ├── ARCHITECTURE.md     # Architecture guide
    ├── CONTRIBUTING.md     # This file
    └── frontend/           # Frontend docs
```

For detailed structure, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## Coding Standards

### TypeScript

- **Strict Mode:** Always use TypeScript strict mode
- **Types:** Define explicit types (avoid `any`)
- **Interfaces:** Use interfaces for object shapes
- **Enums:** Use enums for fixed sets of values

```typescript
// ✅ GOOD: Explicit types
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

function fetchNFT(tokenId: string): Promise<NFTMetadata> {
  return fetch(`/api/nfts/${tokenId}`).then(r => r.json());
}

// ❌ BAD: Implicit any
function fetchNFT(tokenId) {
  return fetch(`/api/nfts/${tokenId}`).then(r => r.json());
}
```

### React Components

- **Functional Components:** Use function components (not classes)
- **Hooks:** Use hooks for state and side effects
- **Props:** Define prop types with interfaces
- **Naming:** PascalCase for components, camelCase for functions

```typescript
// ✅ GOOD: Typed functional component
interface NFTCardProps {
  nft: NFT;
  onBuy: (tokenId: string) => void;
}

export function NFTCard({ nft, onBuy }: NFTCardProps) {
  return (
    <div className="nft-card">
      <img src={nft.image} alt={nft.name} />
      <button onClick={() => onBuy(nft.tokenId)}>Buy</button>
    </div>
  );
}

// ❌ BAD: Untyped component
export function NFTCard(props) {
  return <div>{props.nft.name}</div>;
}
```

### Styling

- **TailwindCSS:** Prefer Tailwind utility classes
- **CSS Variables:** Use design tokens from `styles/spacing.css`
- **Mobile-First:** Start with mobile, add `md:` `lg:` breakpoints
- **Animations:** Use consolidated animations from `styles/animations.css`

```tsx
// ✅ GOOD: Tailwind with mobile-first
<div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 p-4 md:p-6
">
  {nfts.map(nft => <NFTCard key={nft.id} nft={nft} />)}
</div>

// ❌ BAD: Inline styles
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
  {nfts.map(nft => <NFTCard nft={nft} />)}
</div>
```

### ESLint & Prettier

- **Auto-format:** Save files to auto-format with Prettier
- **Lint:** Fix ESLint errors before committing
- **Rules:** Follow project ESLint config

```bash
# Run ESLint
pnpm lint

# Auto-fix ESLint errors
pnpm lint:fix

# Format with Prettier
pnpm format
```

---

## Git Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

```bash
# Examples
git checkout -b feature/add-nft-filters
git checkout -b fix/wallet-connection-error
git checkout -b docs/update-readme
```

### Commit Messages

Write clear, concise commit messages:

```bash
# ✅ GOOD: Descriptive commit
git commit -m "Add NFT filtering by price range"
git commit -m "Fix wallet connection timeout issue"
git commit -m "Update CONTRIBUTING.md with setup instructions"

# ❌ BAD: Vague commit
git commit -m "Update"
git commit -m "Fix bug"
git commit -m "Changes"
```

### Commit Guidelines

- **Atomic commits:** One feature/fix per commit
- **Present tense:** "Add feature" not "Added feature"
- **Imperative:** "Fix bug" not "Fixes bug"
- **Reference issues:** Include issue number if applicable

```bash
# With issue reference
git commit -m "Fix #123: Wallet connection timeout"
```

---

## Adding Features

### 1. Create a New Component

```bash
# Create component file
src/components/marketplace/MarketplaceFilters.tsx
```

```typescript
interface MarketplaceFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export function MarketplaceFilters({ onFilterChange }: MarketplaceFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  return (
    <div className="filters">
      {/* Filter UI */}
    </div>
  );
}
```

### 2. Create a Custom Hook

```bash
# Create hook file
src/hooks/marketplace/useMarketplaceFilters.ts
```

```typescript
interface UseMarketplaceFiltersReturn {
  filters: FilterState;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

export function useMarketplaceFilters(): UseMarketplaceFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  
  const setFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const resetFilters = () => {
    setFilters(defaultFilters);
  };
  
  return { filters, setFilter, resetFilters };
}
```

### 3. Create a New Page

```bash
# Create page file
src/pages/Marketplace.tsx
```

```typescript
import { lazy } from 'react';

// Lazy load page for code splitting
export const Marketplace = lazy(() =>
  import(/* webpackChunkName: "marketplace" */ './MarketplaceContent')
);

// MarketplaceContent.tsx
export default function MarketplaceContent() {
  return (
    <div className="marketplace">
      {/* Page content */}
    </div>
  );
}
```

### 4. Add Route

```typescript
// src/router/routes.tsx
import { Marketplace } from '@/pages/Marketplace';

const routes = [
  // ... existing routes
  {
    path: '/marketplace',
    element: <Marketplace />
  }
];
```

### 5. Add API Endpoint (Optional)

```typescript
// api/marketplace/filters.ts
import { Request, Response } from 'express';

export async function getFilters(req: Request, res: Response) {
  try {
    const filters = await fetchFiltersFromDB();
    res.json(filters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
}
```

---

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] **Desktop:** Chrome, Firefox, Safari
- [ ] **Mobile:** Chrome Android, Safari iOS
- [ ] **Wallet:** MetaMask connection works
- [ ] **Responsive:** All breakpoints display correctly
- [ ] **Accessibility:** Keyboard navigation works
- [ ] **Errors:** Error states display properly

### Browser Console

Check for:

- [ ] No console errors
- [ ] No console warnings
- [ ] No failed network requests
- [ ] Proper logging (development only)

### Performance

- [ ] Lighthouse score > 90 (performance)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast initial load (< 3s)
- [ ] Smooth 60fps animations

---

## Documentation

### When to Update Docs

Update documentation when:

- Adding new components → Update `COMPONENTS.md`
- Adding new utilities → Update `03-ARCHITECTURE_AND_UTILS.md`
- Changing architecture → Update `ARCHITECTURE.md`
- Adding dependencies → Update `STACK.md`

### Documentation Style

- **Clear headings:** Use descriptive headings
- **Code examples:** Include usage examples
- **Comments:** Explain why, not what
- **English:** All documentation in English

```typescript
// ✅ GOOD: Explains why
// Use debounce to prevent excessive re-renders during window resize
const debouncedWidth = useDebounce(windowWidth, 150);

// ❌ BAD: States the obvious
// Debounce window width
const debouncedWidth = useDebounce(windowWidth, 150);
```

---

## Pull Request Process

### Before Creating PR

1. **Test locally:** Ensure everything works
2. **Run linter:** `pnpm lint` passes
3. **Format code:** `pnpm format` applied
4. **Update docs:** Documentation is current
5. **Commit clean:** No console.logs, commented code

### Creating PR

1. **Push branch:**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create PR on GitHub:**
   - Clear title: "Add NFT filtering by price range"
   - Description: Explain what and why
   - Screenshots: Include for UI changes
   - Reference issues: Link related issues

3. **PR Template:**
   ```markdown
   ## Description
   Add NFT filtering by price range to Marketplace page.
   
   ## Changes
   - Added MarketplaceFilters component
   - Created useMarketplaceFilters hook
   - Updated Marketplace page with filters
   
   ## Screenshots
   [Include screenshots]
   
   ## Testing
   - [ ] Tested on desktop (Chrome, Firefox)
   - [ ] Tested on mobile (iOS Safari, Android Chrome)
   - [ ] Wallet connection works
   - [ ] No console errors
   
   ## Related Issues
   Closes #123
   ```

### PR Review Process

1. **Automated checks:** CI/CD runs lint, build
2. **Code review:** Maintainers review code
3. **Feedback:** Address review comments
4. **Approval:** PR approved by maintainer
5. **Merge:** Maintainer merges to main

---

## 🎯 Quick Reference

### Common Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix               # Auto-fix ESLint errors
pnpm format                 # Format with Prettier

# Backend
pnpm server                 # Start Express server

# Subgraph
cd subgraph
pnpm codegen                # Generate types
pnpm build                  # Build subgraph
pnpm deploy                 # Deploy to The Graph
```

### File Creation Checklist

Creating a new component?

- [ ] TypeScript file with `.tsx` extension
- [ ] Exported component with props interface
- [ ] Tailwind classes for styling
- [ ] Mobile-first responsive design
- [ ] Accessibility attributes (aria-label, etc.)
- [ ] Usage example in component docs

Creating a new hook?

- [ ] TypeScript file with `.ts` extension
- [ ] Exported function starting with `use`
- [ ] Return type interface defined
- [ ] Usage example in comments
- [ ] Cleanup in useEffect if needed

Creating a new page?

- [ ] Lazy loaded for code splitting
- [ ] Added to router configuration
- [ ] SEO meta tags configured
- [ ] Responsive layout
- [ ] Error boundary wrapped

---

## 📚 Related Documentation

- **[STACK.md](STACK.md)** - Complete technology stack guide
- **[COMPONENTS.md](COMPONENTS.md)** - UI component library reference
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Project structure and patterns
- **[Frontend README](frontend/README.md)** - Frontend documentation index

---

## 💬 Getting Help

- **GitHub Issues:** Open an issue for bugs or feature requests
- **GitHub Discussions:** Ask questions or propose ideas
- **Discord:** Join our Discord for real-time chat
- **Twitter:** Follow [@nuxchain](https://twitter.com/nuxchain) for updates

---

## ✅ Contribution Checklist

Before submitting your PR, ensure:

- [ ] Code follows project standards
- [ ] TypeScript types are defined
- [ ] ESLint passes (`pnpm lint`)
- [ ] Prettier formatting applied
- [ ] Tested on desktop and mobile
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] PR description is complete
- [ ] Screenshots included (for UI changes)

---

**Thank you for contributing to Nuxchain! 🚀**

**Created:** January 2025  
**Maintained by:** Nuxchain Team
