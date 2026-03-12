---
name: chat-feature-extension
description: Safely extend the Nuxbee AI chat (Chat.tsx). Use when user says "add a feature to chat", "extend the AI chat", "new button in chat", "add skill to chat", "chat tool", "upload feature", "new chat input", "streaming changes", or "wallet context in chat". Provides dependency map, safe extension zones, and anti-patterns to avoid.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Chat Feature Extension Skill

Safely add features to the Nuxbee AI chat without breaking streaming, state, or subscriptions.

## Dependency Map

```
src/pages/Chat.tsx (~950 lines)
  ├── useChatStreaming (primary state hook)
  │     src/hooks/chat/useChatStreaming.ts
  │     └── StreamingService
  │           src/components/chat/core/streamingService.ts  ← TextDecoder stream handler
  │           └── api/chat/stream.ts (prod) │ src/server/gemini/ (local)
  ├── useSkillInvocation
  │     src/hooks/skills/useSkillInvocation.ts
  │     └── api/skills/*.ts
  ├── useWalletAuth / useWalletAuthContext
  │     src/context/WalletAuthContext.tsx
  │     └── api/_middlewares/wallet-auth.ts
  ├── useSubscription
  │     src/context/SubscriptionContext.tsx  ← tier, dailyUsed, trackUsage
  ├── pendingImages state → api/chat/upload-image.ts
  ├── attachments map (messageId → File[])  ← for rendering thumbnails
  └── isAnalyzingImage state (shows spinner during Gemini image processing)
```

## Safe Extension Zones

### ✅ Add a toolbar button (below textarea)
```tsx
// Find the toolbar div (contains send button, image upload button, etc.)
// Add your button here — does NOT affect streaming
<button
  onClick={handleMyAction}
  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
  title="My Action"
>
  <span>🔧</span>
</button>
```

### ✅ Add a new message type / UI decoration
```tsx
// After the message rendering loop, add conditional render
// based on message.role or message.id — does NOT affect streaming
{message.role === 'assistant' && message.hasSpecialData && (
  <MySpecialComponent data={message.specialData} />
)}
```

### ✅ Add pre-send hook (runs before streaming starts)
```tsx
// In the submit handler, before calling streamMessage():
const handleSendMessage = async (text: string) => {
  // ADD: validate, enrich, or log before sending
  const enrichedText = await enrichWithContext(text);
  await streamMessage(enrichedText, walletAuth, pendingImages);
};
```

### ✅ Add a skill trigger button
```tsx
// Skills are invoked via useSkillInvocation
const { invokeSkill, isLoading: isSkillLoading } = useSkillInvocation();

<button
  onClick={() => invokeSkill('portfolio-analyzer', { wallet: address })}
  disabled={isSkillLoading || !isPaid}
>
  Analyze Portfolio
</button>
```

## ⚠️ Dangerous Touch Points — Read Before Editing

| What | Why risky |
|------|-----------|
| `streamingService.ts` — TextDecoder block | Split multi-byte chars = ◆◆◆ artifacts. Use `stream: true` on TextDecoder. |
| `useChatStreaming.ts` — messages useMemo | Invalidated on every render if deps added carelessly |
| `Chat.tsx` — image attachment state | `pendingImages` + `attachments` map must BOTH be updated |
| `api/chat/stream.ts` — response flush | Never buffer; must call `res.write()` per chunk, `res.end()` at finish |
| `walletAuth` object shape | Must be exact `{ address, signature, message, timestamp }` — any change breaks backend verify |

## Adding Image Upload / Attachment Support

```tsx
// Current pattern in Chat.tsx:
const [pendingImages, setPendingImages] = useState<File[]>([]);
const [attachments, setAttachments] = useState<Map<string, File[]>>(new Map());

// On file select:
setPendingImages(prev => [...prev, file]);

// On send — uploads happen inside streamingService before streaming:
// POST api/chat/upload-image → { url, pathname }
// Then url sent to stream.ts as imageUrls[]

// On message rendered — show thumbnail:
const msgAttachments = attachments.get(message.id) ?? [];
```

## Adding Wallet Context to Requests

```typescript
// walletAuth is already sent with every streamed message if wallet connected
// To access wallet context server-side:
// api/chat/stream.ts receives req.body.walletAuth

// Uses verifyWalletSignature() from wallet-auth.ts:
const result = verifyWalletSignature(body.walletAuth);
if (result.valid) {
  const wallet = result.wallet!;
  // fetch user blockchain context
}
```

## Adding a New Streaming Feature to Backend

```typescript
// api/chat/stream.ts
// Safe to add new fields to request body:
const { message, history, walletAuth, imageCount, myNewField } = req.body;

// Safe to add new content BEFORE the messages array:
const systemParts = [
  { text: NUXBEE_SYSTEM_INSTRUCTION },
  { text: kbContext },         // existing
  { text: blockchainContext }, // existing
  { text: myNewContext },      // ← add last in system parts
];
```

## Quick Test Checklist After Extension

- [ ] Send a plain text message → streaming works
- [ ] Send with wallet connected → personalized response
- [ ] Send image → thumbnail shows, image analyzed
- [ ] Check Free tier daily limit enforced
- [ ] Mobile layout not broken (test at 375px)
