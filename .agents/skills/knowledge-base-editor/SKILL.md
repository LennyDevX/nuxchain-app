---
name: knowledge-base-editor
description: Add, update, reorganize, or audit entries in the Nuxbee AI knowledge base. Use when user says "add to the KB", "update knowledge base", "Nuxbee doesn't know about X", "add AI knowledge", "wrong answer from AI", "update system knowledge", "KB entry", "add commands", or "regenerate embeddings". Covers KnowledgeBaseItem format, categories, commands array, and the two-file sync requirement.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Knowledge Base Editor Skill

Add or update Nuxbee AI's knowledge base entries.

## ⚠️ TWO-FILE SYNC RULE

Every KB change must be reflected in **both** files:
1. `api/_services/knowledge-base.ts` — production (Vercel)
2. `src/server/gemini/services/knowledge-base.js` — local dev (Express :3002)

## KnowledgeBaseItem Format

```typescript
interface KnowledgeBaseItem {
  content: string;        // 1-4 sentences of factual information
  metadata: {
    type: 'general' | 'smart-contract' | 'ai';
    category: KBCategory;  // see list below
    topic: string;         // kebab-case slug, e.g. 'boost-slot-apy'
  };
  commands: string[];     // trigger phrases \u2014 CRITICAL for search accuracy
}
```

## All Categories

| category | Used for |
|----------|---------|
| `general` | Platform overview, company info |
| `staking` | Smart Staking, APY, deposits, rewards |
| `token` | NUX token, NUXB, tokenomics, price |
| `nft` | NuxPass NFTs, Skills NFT, avatars, metadata |
| `marketplace` | NFT marketplace, listings, trading |
| `launchpad` | Token launches, IDO, presale |
| `airdrop` | Airdrop campaigns, eligibility, claims |
| `community` | Social, Discord, governance |
| `labs` | R&D, experimental features |
| `ai` | Nuxbee AI features, skills, chat |
| `smart-contract` | Contracts, security, audits |
| `platform` | General platform features, navigation |

## Adding a New Entry

```typescript
// api/_services/knowledge-base.ts
export const KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // ... existing entries ...

  // ADD NEW ENTRY:
  {
    content: 'Smart Staking v6.2 introduces Boost Slots for Skills NFT V2 holders. ' +
             'Each Boost Slot adds +2.5% APY to your active deposits. ' +
             'Maximum 3 boost slots can be active simultaneously per wallet.',
    metadata: {
      type: 'smart-contract',
      category: 'staking',
      topic: 'boost-slots-v2',
    },
    commands: [
      'boost slot', 'skills nft boost', 'APY boost', 'staking boost',
      'skills nft v2', 'boost apy', 'how to boost', 'boost slots',
    ],
  },
];
```

## Editing an Existing Entry

1. `grep_search` for the topic or part of the content
2. Edit `content` for factual updates
3. Update `commands` if new phrasing patterns expected
4. Mirror the same change to the other file

## Regenerating Embeddings (after bulk edits)

```bash
node scripts/test-embedding-v2.mjs
```

This verifies that the KB entries are being found correctly by semantic search.

## Commands Array — Best Practices

```typescript
// ✅ Good: varied phrasing, user-natural language
commands: ['how to stake', 'deposit tokens', 'start staking', 'stake NUX', 'lock tokens']

// ❌ Bad: only one phrasing or too technical
commands: ['deposit()']

// ✅ Include: Spanish phrasing if users ask in Spanish
commands: ['como hacer staking', 'depositar tokens', 'how to stake']
```

## System Instruction Updates

If the AI's **general behavior** needs changing (tone, rules, formatting):
- Edit `api/_config/system-instruction.ts` → `NUXBEE_SYSTEM_INSTRUCTION`
- Mirror to `src/server/gemini/config/system-instruction.js`
- See `ai-chat-gemini` skill for response format rules

## Audit — Check Coverage

To find KB gaps, search for user questions with no KB match:
- Check `api/_services/audit-logger.ts` logs in Firestore `/audit-logs` collection
- Look for responses with `kbMatch: false` or `kbScore < 0.5`
- Those are topics needing new KB entries
