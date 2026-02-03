# 🎨 Design System & UI

**Last Updated:** November 2025  
**Status:** ✅ Production Ready  
**Audience:** Developers & Designers

---

## � Table of Contents

1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Component Patterns](#component-patterns)
4. [Animation System](#animation-system)
5. [Responsive Grid](#responsive-grid)
6. [Usage Examples](#usage-examples)

---

## 🎯 Overview

Nuxchain's design system provides a consistent, accessible, and performant foundation for building UI. Built with TailwindCSS 4.0, CSS variables, and consolidated animations, the system ensures visual consistency across all components.

**Key Features:**
- ✅ CSS Variables for theming
- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA accessibility
- ✅ GPU-accelerated animations
- ✅ Consolidated CSS architecture

---

## � Design Tokens

## 🎨 Design Tokens

### Colors

**Location:** CSS variables in `src/styles/index.css`

```css
/* Primary Colors */
--color-primary: #8b5cf6        /* Purple - Main brand color */
--color-secondary: #6366f1      /* Indigo - Secondary actions */
--color-accent: #ec4899         /* Pink - Highlights */

/* Semantic Colors */
--color-success: #10b981        /* Green - Success states */
--color-warning: #f59e0b        /* Orange - Warnings */
--color-error: #ef4444          /* Red - Errors */
--color-info: #3b82f6           /* Blue - Information */

/* Neutrals */
--color-bg-primary: #1f2937     /* Main background (dark gray) */
--color-bg-secondary: #111827   /* Darker background */
--color-text-primary: #f3f4f6   /* Light text */
--color-text-secondary: #d1d5db /* Muted text */
--color-border: rgba(139, 92, 246, 0.1)  /* Subtle purple border */
```

**Usage:**

```tsx
// Direct CSS variable
<div style={{ color: 'var(--color-primary)' }}>

// TailwindCSS (configured in tailwind.config.js)
<div className="bg-primary text-white border-purple-500/20">
```

---

### Typography

**Scale:** Based on rem units (16px base)

```css
--text-xs: 0.75rem      /* 12px - Small labels */
--text-sm: 0.875rem     /* 14px - Secondary text */
--text-base: 1rem       /* 16px - Body text */
--text-lg: 1.125rem     /* 18px - Large body */
--text-xl: 1.25rem      /* 20px - Headings */
--text-2xl: 1.5rem      /* 24px - Sub-headings */
--text-3xl: 1.875rem    /* 30px - Page titles */
--text-4xl: 2.25rem     /* 36px - Hero text */
```

**Usage:**

```tsx
// TailwindCSS classes
<h1 className="text-4xl font-bold">Hero Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<p className="text-base text-gray-400">Body text</p>
<span className="text-sm text-gray-500">Small label</span>
```

---

### Spacing

**Mobile-first with `clamp()` for fluid scaling:**

```css
--space-xs: clamp(0.25rem, 1vw, 0.5rem)    /* 4-8px */
--space-sm: clamp(0.5rem, 2vw, 1rem)       /* 8-16px */
--space-md: clamp(1rem, 3vw, 1.5rem)       /* 16-24px */
--space-lg: clamp(1.5rem, 4vw, 2rem)       /* 24-32px */
--space-xl: clamp(2rem, 5vw, 3rem)         /* 32-48px */
--space-2xl: clamp(3rem, 6vw, 4rem)        /* 48-64px */
--space-4xl: clamp(4rem, 8vw, 6rem)        /* 64-96px */
```

**Accessibility:**

```css
--touch-target: 44px    /* Minimum touch target (WCAG 2.1 AA) */
```

**Usage:**

```tsx
// TailwindCSS spacing (p-4 = 1rem = 16px)
<div className="p-4 md:p-6 lg:p-8">
<button className="px-6 py-3">  {/* Meets 44px touch target */}
```

---

### Transitions

```css
--transition-fast: 150ms            /* Quick feedback */
--transition-normal: 300ms          /* Standard transitions */
--transition-slow: 500ms            /* Slower animations */

/* Easing functions */
--easing-ease-in: cubic-bezier(0.4, 0, 1, 1)
--easing-ease-out: cubic-bezier(0, 0, 0.2, 1)
--easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

**Usage:**

```css
.button {
  transition: all var(--transition-normal) var(--easing-ease-out);
}
```

---

## 🧩 Component Patterns
```css
.card-base {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 300ms ease-out;
}

.card-base:hover {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 20px 35px -5px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}

.card-unified {
  /* Enhanced version with glass effect */
  background: rgba(31, 41, 55, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

#### Button System
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  min-height: 44px;              /* Accessibility: Touch target */
  transition: all 300ms ease-out;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  border: 2px solid rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  transition: all 300ms ease-out;
}

.btn-secondary:hover {
  border-color: rgba(139, 92, 246, 0.6);
  background: rgba(139, 92, 246, 0.05);
}
```

#### Glass Effect
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
}

.glass-effect-strong {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

---

### Shadow & Glow Effects

#### Shadow System
```css
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.shadow-purple-glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3),
              inset 0 0 10px rgba(139, 92, 246, 0.1);
}
```

#### Glow Effects (Animated)
```css
.glow-high {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
  animation: pulse-glow 3s ease-in-out infinite;
}

.glow-medium {
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
  animation: pulse-glow 4s ease-in-out infinite;
}

.glow-low {
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
  animation: pulse-glow 5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.2); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); }
}
```

---

## 🎬 Animation System

### Core Animations (Consolidated)

#### Gradient Animations
```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes gradient-flow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
```

#### Transform Animations
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes fade-in-left {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes smooth-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Shimmer & Pulse Animations
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes score-shimmer {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.3); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

@keyframes badge-shimmer {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
```

#### AI & Special Animations
```css
@keyframes ai-thinking {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes celebration {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 0; }
}
```

---

## 📐 Responsive Grid System

### CSS Grid Utilities

#### Auto-Fit Grid
```css
.grid-responsive-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(16px, 3vw, 32px);
}

/* Example: 4 cols on desktop, 2 on tablet, 1 on mobile */
.grid-responsive-auto > * {
  min-width: 0;  /* Prevent grid blowout */
}
```

#### Fixed Column Grids
```css
.grid-responsive-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.grid-responsive-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.grid-responsive-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}
```

#### Masonry Layout
```css
.grid-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: minmax(auto, max-content);
  gap: var(--space-lg);
}

.grid-masonry > * {
  min-height: 200px;
}
```

#### Container Queries (Future-Ready)
```css
@supports @container (min-width: 400px) {
  .grid-responsive-auto {
    @container (min-width: 700px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

/* Fallback to media queries */
@media (min-width: 1024px) {
  .grid-responsive-auto {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🎯 Responsive Design Breakpoints

### Breakpoint System (Mobile-First)

| Breakpoint | Min Width | Device Type | Usage |
|------------|-----------|-------------|-------|
| **Mobile** | 0px - 639px | Phones | Base styles |
| **sm** | 640px - 767px | Large Phones | Minor adjustments |
| **md** | 768px - 1023px | Tablets | 2-column layouts |
| **lg** | 1024px - 1279px | Laptops | 3-column layouts |
| **xl** | 1280px - 1535px | Desktops | Full width layouts |
| **2xl** | 1536px+ | Large Desktops | Multi-section layouts |

### Responsive Utilities (Tailwind Classes)

```tsx
/* Example: NFT Card Grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards automatically responsive */}
</div>

/* Example: Typography Scaling */
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Responsive Heading
</h1>

/* Example: Spacing Responsive */
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  Content with responsive padding
</div>

/* Example: Hidden/Shown at Breakpoints */
<div className="hidden md:block">
  Desktop Only
</div>

<div className="md:hidden">
  Mobile Only
</div>
```

---

## 📁 File Structure

### CSS Architecture
```
src/styles/
├── animations.css           /* All 18+ animations consolidated */
├── components.css           /* Card, button, glass effect classes */
├── responsive-grid.css      /* Grid utilities & layouts */
├── spacing.css              /* Spacing variables & touch targets */
├── ai-analysis.css          /* AI-specific styles (optimized) */
├── index.css                /* Main entry point */
└── tailwind.css             /* Tailwind directives & config */
```

### Component Organization
```
src/components/
├── ui/
│   ├── SkeletonLoader.tsx           /* Loading placeholders */
│   ├── Button.tsx                   /* Button component */
│   └── Card.tsx                     /* Reusable card */
├── nfts/
│   ├── NFTCard.tsx                  /* Desktop NFT display */
│   └── NFTCardMobile.tsx            /* Mobile NFT display */
├── marketplace/
│   ├── MarketplaceFilters.tsx       /* Filter component */
│   └── BuyModal.tsx                 /* Purchase modal */
└── profile/
    └── ProfileOverview.tsx          /* User profile card */
```

---

## ✨ Component Examples

### NFT Card (Desktop)
- **2-column Hero:** Image + Details
- **Glass Effect:** Semi-transparent background
- **Gradient Border:** Purple accent
- **Hover State:** Glow effect + lift animation
- **Status:** ✅ Production Ready

### NFT Card (Mobile)
- **3-Slide Carousel:** 100% width slides
  - Slide 1: Description + Price
  - Slide 2: Addresses
  - Slide 3: Attributes
- **Optimized Typography:** Scaled for mobile
- **Status:** ✅ Production Ready

### Skeleton Loader
- **Variants:** Card, List, Table, Hero
- **Fixed Heights:** Prevent CLS
- **Animations:** Staggered pulse effect
- **Status:** ✅ Production Ready

---

## 🎨 Design Principles

### 1. **Mobile-First**
All styles start with mobile experience, scale up with media queries.

### 2. **Accessibility First (WCAG 2.1 AA)**
- 44px minimum touch targets
- High contrast ratios (4.5:1+)
- Semantic HTML
- Keyboard navigation support

### 3. **Performance**
- CSS-only animations (no JS)
- CSS Grid for layout (no flexbox nesting)
- System fonts (no custom fonts)
- Minimal bundle impact

### 4. **Consistency**
- Design tokens for all values
- Reusable component classes
- Unified animation library
- Standard naming conventions

---

---

## 📚 Related Documentation

- **[STACK.md](../STACK.md)** - Complete technology stack guide
- **[COMPONENTS.md](../COMPONENTS.md)** - UI component library reference
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Project structure and patterns
- **[01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md](01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md)** - Performance hooks and optimization
- **[03-ARCHITECTURE_AND_UTILS.md](03-ARCHITECTURE_AND_UTILS.md)** - Architecture utilities and helpers

---

## 🎯 Quick Reference

### When to Use Design Tokens
- Creating new components → Use CSS variables
- Custom styling → Use Tailwind utility classes
- Animations → Use consolidated @keyframes from animations.css
- Responsive layouts → Use grid utilities with clamp()

### Component Pattern Selection
- **Card Pattern:** Lists, grids, profile displays
- **Glass Effect:** Overlays, modals, floating UI
- **Button Patterns:** CTAs, forms, navigation
- **Animation:** Micro-interactions, loading states, celebrations

### Accessibility Checklist
- [ ] Minimum 44px touch targets on mobile
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation support
- [ ] ARIA labels for icons
- [ ] Focus visible indicators
- [ ] Respect prefers-reduced-motion

---

**Created:** November 1, 2025  
**Last Updated:** January 2025  
**Maintained by:** Nuxchain Team
