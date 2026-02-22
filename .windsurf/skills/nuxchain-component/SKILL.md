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

See full skill at: .agents/skills/nuxchain-component/SKILL.md

# NuxChain Component — Quick Reference

## Fonts (ALWAYS use)
- Headings/titles: `jersey-15-regular`
- Body/descriptions/buttons: `jersey-20-regular`

## Typography Size Scale (mobile → desktop)

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page H1 | `text-4xl` | `text-6xl` |
| Section H2 | `text-3xl` | `text-5xl` |
| Card H3 | `text-2xl` | `text-3xl` |
| Sub-heading | `text-xl` | `text-2xl` |
| Body | `text-base` | `text-lg` |
| Label | `text-base` | `text-lg` |
| Micro | `text-sm` | `text-base` |
| Hero H1 | `text-5xl` | `text-8xl` |
| Stat number | `text-3xl` | `text-5xl` |

## Font Size Rules (IMPORTANT)
- **Jersey font requires larger sizes** — text-xs and text-sm are TOO SMALL and ILLEGIBLE on mobile
- **Minimum for mobile**: text-base for labels, text-lg for body text
- **Never use text-xs** — even for "micro" text, use text-sm minimum
- **Always prefer larger**: When in doubt, bump up one size class

## Examples of INCORRECT sizing
```tsx
// ❌ BAD - Too small, illegible on mobile
<p className="text-xs">Some text</p>
<p className="text-sm">Description text</p>
<span className="text-xs text-white/60">Label</span>

// ✅ GOOD - Readable sizes
<p className="text-base">Some text</p>
<p className="text-lg">Description text</p>
<span className="text-base text-white/60">Label</span>
```

## Key Classes
- Cards: `card-unified`, `card-stats`
- Buttons: `btn-primary`, `btn-secondary`
- Text: `text-gradient` (for headings)
- Background page: `<GlobalBackground>` from `../ui/gradientBackground`

## Mobile Pattern
```tsx
const isMobile = useIsMobile(); // from '../../hooks/mobile/useIsMobile'
// Always add pb-32 on mobile, use isMobile ternaries for sizes
// Example: className={`jersey-15-regular ${isMobile ? 'text-3xl' : 'text-5xl'}`}
```

## New Page Registration
Add lazy import + `<Route>` in `src/router/routes.tsx`
