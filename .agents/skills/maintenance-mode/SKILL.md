---
name: maintenance-mode
description: Toggle maintenance mode for any NuxChain page/feature. Use when user says "put X in maintenance", "enable maintenance", "disable maintenance", "show maintenance page", "toggle maintenance", or "estimated time". Also handles adding maintenance support to new pages. Covers MAINTENANCE_CONFIG, routes.tsx swap, and dev override patterns.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Maintenance Mode Skill

Toggle maintenance mode for any page or add maintenance support to new pages.

## Config File: `src/config/maintenance.ts`

```typescript
// Interface per route:
interface MaintenanceRoute {
  enabled: boolean;         // true = show maintenance page
  estimatedTime: number;    // minutes until completion (e.g. 4320 = 3 days)
  message: string;          // shown to user
  startTime: string;        // ISO string, set once via getOrInitializeStartTime()
}
```

## All 12 Routes Available

| Key | Page | Path |
|-----|------|------|
| `airdrop` | Airdrop | /airdrop |
| `staking` | Smart Staking | /staking |
| `nfts` | NFT Marketplace | /nfts |
| `marketplace` | Marketplace | /marketplace |
| `tokenomics` | Tokenomics | /tokenomics |
| `colab` | Colab | /colab |
| `store` | Store | /store |
| `labs` | Labs | /labs |
| `devhub` | Dev Hub | /devhub |
| `nux` | NUX Token | /nux |
| `burntoken` | Burn Token | /burntoken |
| `chat` | AI Chat | /chat |

## Toggle Maintenance ON/OFF

```typescript
// src/config/maintenance.ts
staking: {
  enabled: true,          // ← change false→true to ENABLE, true→false to DISABLE
  estimatedTime: 7200,    // 7200 min = 5 days
  message: 'Smart Staking v6.2 upgrade in progress. Funds are safe!',
  startTime: getOrInitializeStartTime('staking', new Date().toISOString()),
},
```

## Dev Override (browser console)

```javascript
// Bypass maintenance in dev without editing config:
window.__NUX_DEV_OVERRIDES__ = { staking: true }   // forces maintenance screen on
window.__NUX_DEV_OVERRIDES__ = { staking: false }  // forces page to show normally
window.__NUX_DEV_OVERRIDES__ = {}                  // reset all overrides
```

## Adding Maintenance to a NEW Page

### Step 1 — `src/config/maintenance.ts`

```typescript
// Add to window.__NUX_DEV_OVERRIDES__ interface:
newfeature?: boolean;

// Add to MAINTENANCE_CONFIG type (if typed explicitly):
newfeature: MaintenanceRoute;

// Add to MAINTENANCE_CONFIG object:
newfeature: {
  enabled: false,
  estimatedTime: 4320,   // 3 days
  message: 'Feature coming soon!',
  startTime: getOrInitializeStartTime('newfeature', new Date().toISOString()),
},
```

### Step 2 — Create `src/pages/NewFeatureMaintenance.tsx`

```tsx
import MaintenancePage from './MaintenancePage'
import { MAINTENANCE_CONFIG } from '../config/maintenance'

export default function NewFeatureMaintenance() {
  const cfg = MAINTENANCE_CONFIG.newfeature
  return (
    <MaintenancePage
      title="New Feature"
      message={cfg.message}
      estimatedTime={cfg.estimatedTime}
      startTime={cfg.startTime}
    />
  )
}
```

### Step 3 — Add guard to `src/pages/NewFeature.tsx`

```tsx
import { MAINTENANCE_CONFIG } from '../config/maintenance'
import NewFeatureMaintenance from './NewFeatureMaintenance'

export default function NewFeature() {
  if (MAINTENANCE_CONFIG.newfeature.enabled) return <NewFeatureMaintenance />
  return <div>/* real content */</div>
}
```

## Time Reference

| Minutes | Human |
|---------|-------|
| 60 | 1 hour |
| 1440 | 1 day |
| 4320 | 3 days |
| 7200 | 5 days |
| 10080 | 1 week |
| 43200 | 1 month |
