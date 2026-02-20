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

## Key Classes
- Cards: `card-unified`, `card-stats`
- Buttons: `btn-primary`, `btn-secondary`
- Text: `text-gradient` (for headings)
- Background page: `<GlobalBackground>` from `../ui/gradientBackground`

## Mobile Pattern
```tsx
const isMobile = useIsMobile(); // from '../../hooks/mobile/useIsMobile'
// Always add pb-32 on mobile, use isMobile ternaries for sizes
```

## New Page Registration
Add lazy import + `<Route>` in `src/router/routes.tsx`
