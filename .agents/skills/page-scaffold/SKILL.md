---
name: page-scaffold
description: Scaffold a complete new NuxChain page with all required files in one shot. Use when user says "create a new page", "add a new section", "scaffold page", "new route", or "add page to the app". Creates the 4 required files and updates router + maintenance config automatically.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Page Scaffold Skill

Create a complete new page with all 4 required files + router registration in one pass.

## Required Files Checklist

For a page called "Analytics" at route `/analytics`:

```
src/pages/Analytics.tsx             ← 1. Main page with maintenance guard
src/pages/AnalyticsMaintenance.tsx  ← 2. Maintenance page
src/config/maintenance.ts           ← 3. Add config entry  
src/router/routes.tsx               ← 4. Add lazy import + Route
```

---

## File 1: `src/pages/Analytics.tsx`

```tsx
import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '../hooks/mobile/useIsMobile'
import { MAINTENANCE_CONFIG } from '../config/maintenance'
import AnalyticsMaintenance from './AnalyticsMaintenance'

export default function Analytics() {
  const isMobile = useIsMobile()

  // Maintenance gate — always first
  if (MAINTENANCE_CONFIG.analytics?.enabled) return <AnalyticsMaintenance />

  return (
    <div className={`min-h-screen bg-black text-white ${isMobile ? 'px-4 py-6' : 'px-8 py-10'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={`jersey-15-regular text-gradient ${isMobile ? 'text-4xl' : 'text-6xl'} mb-4`}>
          Analytics
        </h1>
        <p className={`jersey-20-regular text-white/70 ${isMobile ? 'text-base' : 'text-lg'}`}>
          Page description here.
        </p>
        {/* Add sections here */}
      </motion.div>
    </div>
  )
}
```

---

## File 2: `src/pages/AnalyticsMaintenance.tsx`

```tsx
import MaintenancePage from './MaintenancePage'
import { MAINTENANCE_CONFIG } from '../config/maintenance'

export default function AnalyticsMaintenance() {
  const cfg = MAINTENANCE_CONFIG.analytics
  return (
    <MaintenancePage
      title="Analytics"
      message={cfg?.message ?? 'This feature is temporarily unavailable.'}
      estimatedTime={cfg?.estimatedTime ?? 4320}
      startTime={cfg?.startTime ?? new Date().toISOString()}
    />
  )
}
```

---

## File 3: `src/config/maintenance.ts` — 3 edits

### Edit A — Add to `window.__NUX_DEV_OVERRIDES__` interface:
```typescript
analytics?: boolean;
```

### Edit B — Add to MAINTENANCE_CONFIG type (if explicitly typed):
```typescript
analytics: MaintenanceRoute;
```

### Edit C — Add to MAINTENANCE_CONFIG object:
```typescript
analytics: {
  enabled: false,
  estimatedTime: 4320,
  message: 'Analytics dashboard is being enhanced. Back in 3 days!',
  startTime: getOrInitializeStartTime('analytics', new Date().toISOString()),
},
```

---

## File 4: `src/router/routes.tsx` — 2 edits

### Edit A — Add lazy import (with all other lazy imports, alphabetically):
```tsx
const Analytics = lazy(() => import(/* webpackChunkName: "analytics" */ '../pages/Analytics'));
```

### Edit B — Add Route inside `<Routes>`:
```tsx
<Route path="/analytics" element={<Analytics />} />
```

---

## Common Page Sections

### With subscription gate:
```tsx
import { useSubscription } from '../context/SubscriptionContext'
const { isPaid, tier } = useSubscription()

{!isPaid && (
  <div className="border border-purple-500/30 rounded-xl p-4 bg-black/20 text-center">
    <p className="jersey-20-regular text-white/60 text-sm">🔒 Pro feature</p>
  </div>
)}
```

### With wallet check:
```tsx
import { useAccount } from 'wagmi'
const { isConnected, address } = useAccount()

{!isConnected && (
  <p className="jersey-20-regular text-white/50">Connect your wallet to continue.</p>
)}
```

### With data loading state:
```tsx
{isLoading ? (
  <div className="animate-pulse bg-white/5 rounded-xl h-32" />
) : (
  <DataComponent data={data} />
)}
```

---

## Add to Navigation (optional)

If the page should appear in the sidebar/nav:
- Check `src/components/nav/Navbar.tsx` or `src/components/layout/Sidebar.tsx`
- Add as `{ label: 'Analytics', path: '/analytics', icon: '📊' }` to the nav items array
