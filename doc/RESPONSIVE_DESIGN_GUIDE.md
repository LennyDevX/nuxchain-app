# 📱 Responsive Design Guide

## Breakpoint System

Nuxchain uses a **mobile-first** approach with centralized breakpoints matching Tailwind CSS defaults.

### Breakpoint Reference

| Breakpoint | Min Width | Max Width | Device Type |
|------------|-----------|-----------|-------------|
| `sm` | 640px | 767px | Large phones |
| `md` | 768px | 1023px | Tablets |
| `lg` | 1024px | 1279px | Laptops |
| `xl` | 1280px | 1535px | Desktops |
| `2xl` | 1536px+ | - | Large desktops |

### CSS Custom Properties

All breakpoints are defined in `src/styles/breakpoints.css`:

```css
:root {
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
  --screen-2xl: 1536px;
}
```

## Usage Guidelines

### ✅ Recommended: Tailwind Classes

Use Tailwind's responsive prefixes in components:

```tsx
<div className="
  text-sm md:text-base lg:text-lg
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
  Content
</div>
```

### ✅ CSS Media Queries

For custom styles, use standardized breakpoints:

```css
/* Mobile first (recommended) */
.my-component {
  font-size: 14px; /* Mobile default */
}

@media (min-width: 768px) {
  .my-component {
    font-size: 16px; /* Tablet and up */
  }
}

@media (min-width: 1024px) {
  .my-component {
    font-size: 18px; /* Laptop and up */
  }
}
```

### ❌ Avoid: Hardcoded Breakpoints

**Don't do this:**
```css
@media (max-width: 768px) { ... }  /* ❌ Inconsistent */
@media (max-width: 800px) { ... }  /* ❌ Non-standard */
@media (max-width: 1200px) { ... } /* ❌ Random value */
```

**Do this instead:**
```css
@media (max-width: 767px) { ... }   /* ✅ Below md */
@media (min-width: 768px) { ... }  /* ✅ md and up */
@media (min-width: 1024px) { ... } /* ✅ lg and up */
```

## Migration Guide

### Old Pattern (Hardcoded)
```css
@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
}
```

### New Pattern (Standardized)
```css
/* Mobile (below md) */
@media (max-width: 767px) {
  .card {
    padding: 1rem;
  }
}

/* Tablet and up (md breakpoint) */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}
```

## Common Patterns

### Container Responsive
```tsx
<div className="container-responsive">
  {/* Auto-adjusts padding and max-width */}
</div>
```

### Hide/Show by Screen Size
```tsx
<div className="mobile-only md:hidden">Mobile menu</div>
<div className="desktop-only hidden md:block">Desktop nav</div>
```

### Responsive Text
```tsx
<h1 className="text-responsive-xl">
  {/* Auto-scales: 20px mobile → 24px tablet → 30px desktop */}
</h1>
```

### Touch Targets (WCAG 2.1 AA)
```tsx
<button className="btn-touch">
  {/* Min 44px on mobile, 48px on desktop */}
</button>
```

## Performance Tips

### 1. Disable Complex Animations on Mobile
```css
@media (max-width: 767px) {
  .animate-complex {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### 2. Optimize Images
```tsx
<img 
  src="/image-mobile.jpg"
  srcSet="/image-tablet.jpg 768w, /image-desktop.jpg 1280w"
  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
  alt="Responsive image"
/>
```

### 3. Lazy Load Below Fold
```tsx
<img 
  src="/hero.jpg" 
  loading="eager"  // Above fold
/>
<img 
  src="/section-2.jpg" 
  loading="lazy"  // Below fold
/>
```

## Testing Checklist

- [ ] Test on iPhone SE (375px) - smallest modern phone
- [ ] Test on iPad (768px) - tablet portrait
- [ ] Test on laptop (1280px) - common desktop
- [ ] Test touch targets (min 44px)
- [ ] Test text readability (min 16px body)
- [ ] Verify no horizontal scroll
- [ ] Check DevTools → Lighthouse → Mobile
- [ ] Validate WCAG 2.1 AA (contrast, touch size)

## Resources

- [Tailwind Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile First Design](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first)

## File Structure

```
src/styles/
├── breakpoints.css       # ⭐ Centralized breakpoints
├── index.css             # Main entry (imports breakpoints)
├── animations.css        # ✅ Migrated to standard breakpoints
├── ai-analysis.css       # ✅ Migrated to standard breakpoints
├── markdown-chat.css     # ✅ Migrated to standard breakpoints
├── AnimatedAILogo.css    # ✅ Migrated to standard breakpoints
└── ...other styles
```

## Questions?

Contact: Development Team
Last Updated: October 2025
