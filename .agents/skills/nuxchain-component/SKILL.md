---
name: nuxchain-component
description: Create or modify React components for the NuxChain app. Use when user says "create a component", "add a section", "build a card", "new page", "update UI", or any frontend work in src/components/ or src/pages/. Enforces NuxChain design system — fonts, colors, mobile-first layout, and class conventions.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Component Skill

Create React components that match the NuxChain design system exactly.

## Typography — ALWAYS use these font classes

| Class | Use for |
|-------|---------|
| `jersey-15-regular` | Headings, titles, section headers, h1–h3 |
| `jersey-20-regular` | Body text, descriptions, labels, buttons, tags |

**Never use default Tailwind font sizes without a jersey class on text that is user-facing.**

```tsx
// ✅ Correct
<h2 className="text-4xl font-bold jersey-15-regular text-gradient">Section Title</h2>
<p className="text-base jersey-20-regular text-slate-400">Description text here.</p>

// ❌ Wrong — missing jersey font
<h2 className="text-4xl font-bold">Section Title</h2>
```

## Color Palette

- **Backgrounds**: `bg-black/20`, `bg-black/30`, `bg-white/5`
- **Borders**: `border-white/5`, `border-white/10`, `border-purple-500/20`, `border-pink-500/20`
- **Text primary**: `text-white`
- **Text secondary**: `text-slate-300`, `text-slate-400`
- **Text muted**: `text-slate-500`, `text-slate-600`
- **Gradient text**: `text-gradient` (class defined in global CSS)
- **Accent colors**: `text-purple-400`, `text-pink-400`, `text-emerald-400`, `text-violet-400`, `text-blue-400`, `text-amber-400`

## Reusable CSS Classes (defined in global styles)

```tsx
// Cards
<div className="card-unified p-6">         // Main card style
<div className="card-stats border-green-500/20">  // Stat card

// Buttons
<button className="btn-primary jersey-20-regular">   // Primary CTA
<button className="btn-secondary jersey-20-regular"> // Secondary CTA

// Backgrounds
<GlobalBackground>  // import from '../ui/gradientBackground'
```

## Mobile-First Pattern — ALWAYS implement

```tsx
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const MyComponent: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'px-4 py-6' : 'px-8 py-12'}`}>
      <h2 className={`font-bold jersey-15-regular text-gradient ${
        isMobile ? 'text-3xl mb-4' : 'text-5xl mb-8'
      }`}>
        Title
      </h2>
      <p className={`jersey-20-regular text-slate-400 ${
        isMobile ? 'text-xl' : 'text-2xl'
      }`}>
        Description
      </p>
    </div>
  );
};
```

## Navigation

```tsx
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Programmatic navigation
const navigate = useNavigate();
navigate('/staking');

// Link component
<Link to="/labs/price-feed" className="...">Open</Link>
```

## Component File Structure

```
src/
  components/
    <feature>/          ← Feature folder (labs, staking, nfts, etc.)
      MyComponent.tsx   ← Component file
  pages/
    MyPage.tsx          ← Page (imported in src/router/routes.tsx)
  hooks/
    useMyHook.ts        ← Custom hooks
```

## Page Registration (routes.tsx)

When creating a new page, always add it to `src/router/routes.tsx`:

```tsx
const MyPage = lazy(() => import(/* webpackChunkName: "my-page" */ '../pages/MyPage'));
// Then inside <Routes>:
<Route path="/my-route" element={<MyPage />} />
```

## Standard Page Template

```tsx
import React from 'react';
import GlobalBackground from '../ui/gradientBackground';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import { Link } from 'react-router-dom';

const MyPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <GlobalBackground>
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-6 pb-32' : 'px-4 sm:px-6 lg:px-8 py-16'}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-slate-500">
          <Link to="/parent" className="hover:text-purple-400 transition-colors">Parent</Link>
          <span>/</span>
          <span className="text-slate-300">Current Page</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`font-bold text-gradient jersey-15-regular ${isMobile ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>
            Page Title
          </h1>
          <p className={`text-slate-400 max-w-2xl mx-auto jersey-20-regular ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Page description.
          </p>
        </div>

        {/* Content */}
        <div className={`card-unified ${isMobile ? 'p-4' : 'p-8'}`}>
          {/* ... */}
        </div>
      </div>
    </GlobalBackground>
  );
};

export default MyPage;
```

## Standard Section Template (inside Labs/Home/etc.)

```tsx
<section>
  <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
    <h2 className={`font-bold mb-4 jersey-15-regular text-gradient ${
      isMobile ? 'text-4xl' : 'text-5xl'
    }`}>Section Title</h2>
    <p className={`text-slate-400 max-w-3xl mx-auto jersey-20-regular ${
      isMobile ? 'text-xl px-4' : 'text-2xl'
    }`}>
      Section description.
    </p>
  </div>
  <MyComponent />
</section>
```

## Grid Layouts

```tsx
// 4-column desktop, 2-column mobile
<div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>

// 3-column desktop, 1-column mobile
<div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>

// 5-column desktop with sidebar
<div className={`grid gap-8 ${isMobile ? '' : 'lg:grid-cols-5'}`}>
  <div className="lg:col-span-3">...</div>
  <div className="lg:col-span-2">...</div>
</div>
```

## Live Indicator (pulsing dot)

```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
</span>
```

## Badge / Tag

```tsx
<span className="inline-block text-xs font-semibold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
  Label
</span>
```

## Mobile Bottom Padding

Always add `pb-32` on mobile to avoid content being hidden behind the bottom nav bar:
```tsx
<div className={`${isMobile ? 'px-4 py-8 pb-32' : 'px-8 py-16'}`}>
```
