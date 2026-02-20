---
name: ai-chat-gemini
description: Extend or modify the Nuxbee AI chat system powered by Gemini. Use when user says "Nuxbee AI", "chat AI", "Gemini", "AI assistant", "system prompt", "chat endpoint", "streaming response", "AI 2.0", "knowledge base", or any AI chat feature work. Covers server architecture, system instructions, rate limiting, and audit logging.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Nuxbee AI / Gemini Chat Skill

Extend the Nuxbee AI chat system built on Google Gemini.

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
