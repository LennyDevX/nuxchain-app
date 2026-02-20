---
name: nuxchain-deploy
description: Deploy the NuxChain app to Vercel or prepare a production build. Use when user says "deploy", "push to production", "build", "vercel deploy", "publish", "go live", "sync env vars", or "pre-deploy checklist".
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/nuxchain-deploy/SKILL.md

# NuxChain Deploy — Quick Reference

## Pre-Deploy Checklist
- [ ] `npm run build` passes (no TS errors)
- [ ] New API endpoints in `vercel.json`
- [ ] New env vars in Vercel dashboard + `.env.example`
- [ ] Firestore rules updated if new collections added
- [ ] ABIs in sync with deployed contracts

## Commands
```powershell
npm run build          # Production build
vercel --prod          # Deploy to production
./sync-vercel-env.ps1  # Sync env vars to Vercel
firebase deploy --only firestore:rules  # Deploy Firestore rules
```

## Local Dev
```powershell
npm run dev:full    # Vite + API server + Gemini (all)
npm run dev         # Frontend only (port 5173)
npm run dev:market  # Market API server (port 3003)
npm run dev:gemini  # Gemini AI server (port 3002)
```

## Post-Deploy Checks
```
GET https://www.nuxchain.com/api/health/status
GET https://www.nuxchain.com/api/market/prices
GET https://www.nuxchain.com/api/uniswap/prices
```
