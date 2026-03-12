---
name: ai-chat-gemini
description: Extend or modify the Nuxbee AI chat system powered by Gemini. Use when user says "Nuxbee AI", "chat AI", "Gemini", "AI assistant", "system prompt", "chat endpoint", "streaming response", "AI 2.0", "knowledge base", "KB entry", "image analysis", or any AI chat feature work. Covers server architecture, system instructions, rate limiting, subscription tiers, image uploads, and KB editing.
license: MIT
metadata:
  author: nuxchain
  version: '2.0.0'
---

# NuxChain Nuxbee AI / Gemini Chat Skill

Extend the Nuxbee AI chat system built on Google Gemini (`@google/genai`).

## Architecture Map

```
PRODUCTION (Vercel)
  api/chat/stream.ts               ← Main streaming endpoint (POST)
  api/chat/upload-image.ts         ← Image upload → Vercel Blob (POST)
  api/_config/system-instruction.ts  ← NUXBEE_SYSTEM_INSTRUCTION export
  api/_services/
    knowledge-base.ts              ← 150+ KB entries, searchKnowledgeBase()
    embeddings-service.ts          ← RAG / semantic search
    blockchain-service.ts          ← on-chain data (POL price, staking, NFTs)
    blockchain-tools.ts            ← Gemini function-calling tool definitions
    web-scraper.ts                 ← URL context extraction
    markdown-formatter.ts          ← Post-process streaming output
    audit-logger.ts                ← Request logging to Firestore
  api/_middlewares/
    serverless-security.ts         ← withSecurity() wrapper — ALWAYS use
    wallet-auth.ts                 ← verifyWalletSignature()
    subscription-auth.ts           ← checkSkillAccess(), skillsRateLimit()

LOCAL DEV (Express :3002)
  src/server/gemini/
    index.js                       ← Express entry (npm run dev:gemini)
    config/
      system-instruction.js        ← MUST stay in sync with api/_config/
      environment.js
    controllers/gemini-controller.js
    services/gemini-service.js
    services/embeddings-service.js

FRONTEND
  src/pages/Chat.tsx               ← Main UI (~950 lines)
  src/hooks/chat/useChatStreaming.ts ← Streaming state machine
  src/components/chat/core/
    streamingService.ts            ← TextDecoder stream handler
    chatReducer.ts                 ← Message state
  src/context/SubscriptionContext.tsx ← dailyUsed, dailyLimit, trackUsage
```

## ⚠️ TWO-FILE SYNC RULE

Every change to `api/_config/system-instruction.ts` MUST also be applied to
`src/server/gemini/config/system-instruction.js`. They must stay identical in behavior.

## System Instruction Export

```typescript
// api/_config/system-instruction.ts
export const NUXBEE_SYSTEM_INSTRUCTION = `You are Nuxbee...`;

// src/server/gemini/config/system-instruction.js  
module.exports = { NUXBEE_SYSTEM_INSTRUCTION: `You are Nuxbee...` };
```

## Response Format Rules (CRITICAL)

Always enforce in system instruction:
```
- CLEAN TEXT: Never output ◆, □, ▪, ▸, ◆◆ or \uFFFD replacement chars
- PARAGRAPH BREAKS REQUIRED: Always double newline (\n\n) between sentences
- SENTENCE ENDINGS REQUIRED: Every sentence ends with . ? or !
- Use emojis sparingly (1-2 max) — skip if user's message has none
- Max 2-3 paragraphs per response
```

## Streaming Endpoint Pattern (`api/chat/stream.ts`)

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';  // NOT @google/generative-ai
import { withSecurity } from '../_middlewares/serverless-security.js';
import { FREE_DAILY_LIMIT, SUBSCRIPTION_COLLECTION } from '../../src/constants/subscription.js';
import { NUXBEE_SYSTEM_INSTRUCTION } from '../_config/system-instruction.js';
import { kv } from '@vercel/kv';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS+Security via withSecurity wrapper
  // 2. Rate limiting — check Firestore subscription for tier
  //    Free: FREE_DAILY_LIMIT (10/day) via KV counter key `daily:${wallet}:${date}`
  //    Pro/Premium: dailyLimit = -1 (unlimited)
  // 3. Extract: message, history, walletAuth, imageCount
  // 4. If walletAuth → get blockchain context via blockchainService
  // 5. KB search via searchKnowledgeBase(message)
  // 6. Build model input with system instruction + KB context + history
  // 7. Stream response using generateContentStream()
  // 8. Pipe chunks to res with res.write(chunk)
  // 9. res.end() when done
}

export default withSecurity(handler);
```

## Knowledge Base Entry Format

```typescript
// api/_services/knowledge-base.ts
interface KnowledgeBaseItem {
  content: string;        // The actual text (1-4 sentences)
  metadata: {
    type: 'general' | 'smart-contract' | 'ai';
    category: 'staking' | 'token' | 'nft' | 'marketplace' | 'launchpad' |
              'airdrop' | 'community' | 'labs' | 'platform' | 'company' | 'strategy';
    topic: string;        // Specific topic slug
  };
  commands: string[];     // Keywords/phrases that trigger this KB entry
}

// Example new entry:
{
  content: 'Smart Staking v6.2 supports Boost Slots for Skills NFT V2 holders, giving +15% APY boost.',
  metadata: { type: 'smart-contract', category: 'staking', topic: 'boost-slots' },
  commands: ['boost slot', 'skills nft boost', 'APY boost', 'staking boost']
}
```

After editing KB: run `node scripts/test-embedding-v2.mjs` to verify embeddings.

## Subscription Tiers & Rate Limits

```typescript
// src/constants/subscription.ts
export const FREE_DAILY_LIMIT = 10;           // requests/day
// Pro:     dailyLimit = -1  (unlimited)
// Premium: dailyLimit = -1  (unlimited)

// Tiers
type SubscriptionTier = 'free' | 'pro' | 'premium';
// Pro:     $10/mo — 3 core skills, model selection
// Premium: $25/mo — ALL skills, model selection
```

## Image Analysis Flow

```
1. User attaches image in Chat.tsx → setPendingImages([...pendingImages, img])
2. On send: POST api/chat/upload-image.ts with FormData
3. upload-image.ts → Vercel Blob (put()) → returns { url, pathname }
4. stream.ts receives { imageCount: number, imageUrls: string[] }
5. Gemini receives images as inlineData parts alongside text prompt
```

## Models in Use

| Use case | Model |
|---|---|
| Free tier / default | `gemini-3.1-flash-lite-preview` |
| Pro/Premium option | `gemini-3-pro` or `gemini-3-flash` |
| Skills endpoints | `gemini-3.1-flash-lite-preview` |

## Adding a New AI Feature — Checklist

- [ ] Update `api/_config/system-instruction.ts` → sync to `src/server/gemini/config/system-instruction.js`
- [ ] If new KB data needed → add entries to `knowledge-base.ts` → run embedding test
- [ ] If new API endpoint → register in `vercel.json` → wrap with `withSecurity`
- [ ] If subscription-gated → add to `SKILLS` in `subscription.ts` + `subscription-auth.ts`
- [ ] If changes to streaming → test with `npm run dev:gemini` locally first


## Architecture Overview

```
src/server/gemini/           ← Local dev server (port 3002)
  index.js                   ← Express app entry point
  config/
    environment.js           ← Env config
  controllers/               ← Request handlers
  routes/
    index.js                 ← Route registration
  services/
    embeddings-service.js    ← Knowledge base / RAG
  middlewares/
    error-handler.js
    websocket-handler.js

api/chat/
  stream.ts                  ← Vercel serverless (production streaming)

api/_config/
  system-instruction.ts      ← Nuxbee AI system prompt / personality
```

## System Instruction (AI Personality)

Located at `api/_config/system-instruction.ts`. This defines Nuxbee's personality, knowledge scope, and behavior rules.

```typescript
// api/_config/system-instruction.ts
export const SYSTEM_INSTRUCTION = `
You are Nuxbee, the AI assistant for NuxChain — a DeFi platform on Polygon.

Your expertise:
- NuxChain staking (EnhancedSmartStaking contracts)
- NFT collections and utility
- DeFi concepts: APY, liquidity, yield farming
- Uniswap swaps and price feeds
- Polygon network

Personality: Helpful, concise, friendly. Use simple language.
Always recommend users verify on-chain data independently.
Never provide financial advice — only educational information.
`;
```

## Streaming Chat Endpoint Pattern

```typescript
// api/chat/stream.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_INSTRUCTION } from '../_config/system-instruction';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(message);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();
}
```

## Frontend Chat Hook Pattern

```typescript
// src/hooks/useNuxbeeChat.ts
import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export function useNuxbeeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (userText: string) => {
    const userMsg: Message = { role: 'user', parts: [{ text: userText }] };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    let aiText = '';
    const aiMsg: Message = { role: 'model', parts: [{ text: '' }] };
    setMessages(prev => [...prev, aiMsg]);

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, history: messages }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          const { text } = JSON.parse(line.slice(6));
          aiText += text;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'model', parts: [{ text: aiText }] };
            return updated;
          });
        }
      }
    }

    setIsStreaming(false);
  }, [messages]);

  return { messages, sendMessage, isStreaming };
}
```

## Rate Limiting for Chat

Chat endpoints use stricter rate limits than data APIs:

```typescript
// In api/chat/stream.ts
import { rateLimiter } from '../_middlewares/rate-limiter';

// 20 messages per minute per IP
const limited = await rateLimiter(req, res, { max: 20, window: 60 });
if (limited) return;
```

## Audit Logging

```typescript
import { auditLogger } from '../_services/audit-logger';

await auditLogger.log({
  action: 'chat_message',
  userId: userAddress || 'anonymous',
  metadata: { messageLength: message.length, model: 'gemini-2.0-flash' },
});
```

## Knowledge Base / RAG (Embeddings)

The embeddings service at `src/server/gemini/services/embeddings-service.js` provides RAG (Retrieval Augmented Generation) for NuxChain-specific knowledge.

To add new knowledge:
1. Add documents to the knowledge base directory
2. Call `initializeKnowledgeBaseForVercel()` to re-index
3. The service will automatically inject relevant context into Gemini prompts

## Environment Variables

```
GEMINI_API_KEY              ← Google AI Studio API key (backend only)
VITE_GEMINI_MODEL           ← Model name (e.g., gemini-2.0-flash)
```

## Chat Component Location

```
src/components/chat/        ← All chat UI components
src/pages/Chat.tsx          ← Chat page
```

## Nuxbee AI 2.0 Roadmap (Q3 2026)

Planned improvements:
- Multi-modal support (image analysis of NFTs/charts)
- Persistent conversation history per wallet
- On-chain data integration (live staking stats in context)
- Dedicated Nuxbee platform at separate subdomain
- Voice input support
