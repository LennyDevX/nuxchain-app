---
name: ai-chat-gemini
description: Extend or modify the Nuxbee AI chat system powered by Gemini. Use when user says "Nuxbee AI", "chat AI", "Gemini", "AI assistant", "system prompt", "chat endpoint", "streaming response", "AI 2.0", "knowledge base", or any AI chat feature work.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/ai-chat-gemini/SKILL.md

# Nuxbee AI / Gemini — Quick Reference

## Key Files
- System prompt: `api/_config/system-instruction.ts`
- Streaming endpoint: `api/chat/stream.ts`
- Local server: `src/server/gemini/` (port 3002)
- Chat components: `src/components/chat/`
- Chat page: `src/pages/Chat.tsx`

## Gemini Model
- Production: `gemini-2.0-flash`
- Env var: `GEMINI_API_KEY` (backend only, no VITE_ prefix)

## Streaming Pattern
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: SYSTEM_INSTRUCTION,
});
const chat = model.startChat({ history });
const result = await chat.sendMessageStream(message);
// Stream SSE: res.write(`data: ${JSON.stringify({ text })}\n\n`)
```

## Rate Limit
- Chat: 20 requests/minute per IP (stricter than data APIs)

## Nuxbee AI 2.0 (Q3 2026)
Multi-modal, persistent history per wallet, on-chain data in context.
