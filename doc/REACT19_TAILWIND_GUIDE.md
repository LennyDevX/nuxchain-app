# ⚛️ React 19 & Tailwind CSS - Guía Avanzada con Implementaciones Nuxchain

**Última actualización:** Octubre 22, 2025  
**Versiones:** React 19.2.0 | Tailwind CSS 4.1.14  
**Status:** ✅ Implementadas en producción  
**Compatibilidad:** Node.js 18+

---

## 📖 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [React 19 - Características Avanzadas](#react-19---características-avanzadas)
3. [Tailwind CSS 4 - Utilidades Avanzadas](#tailwind-css-4---utilidades-avanzadas)
4. [Implementaciones en Nuxchain](#implementaciones-en-nuxchain)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Performance y Optimización](#performance-y-optimización)

---

## 🎯 Visión General

### React 19 + Tailwind CSS 4

```
┌─────────────────────────────────────────────────────────┐
│         REACT 19 FEATURES                               │
│  ✨ Compiler Improvements                               │
│  🎛️  New Hooks (useTransition, useOptimistic)          │
│  📦 Component Improvements                              │
│  ⚡ Auto batching & Concurrency                         │
│  🔄 Automatic Form Revalidation                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│      TAILWIND CSS 4 - NEW FEATURES                      │
│  🎨 CSS Variable Updates                                │
│  🔌 Plugin System v3                                    │
│  📐 New Grid Utilities                                  │
│  ✨ Enhanced Animations                                 │
│  🌈 Dynamic Color System                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│      NUXCHAIN IMPLEMENTATION                            │
│  ✓ Chat Interface with Streaming                        │
│  ✓ Complex State Management                             │
│  ✓ Custom Animations                                    │
│  ✓ Responsive Layouts                                   │
│  ✓ Dark Mode Support                                    │
└─────────────────────────────────────────────────────────┘
```

---

## ⚛️ React 19 - Características Avanzadas

### 1. Compiler Improvements (Automatic Memoization)

**Qué es:** React 19 optimiza automáticamente el re-rendering sin necesidad de `useMemo` o `useCallback`.

```typescript
// ❌ ANTES (React 18) - Necesitaba memoización manual
import { useMemo, useCallback } from 'react';

function ChatList({ messages, onDelete }) {
  // Memoizar función
  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);

  // Memoizar datos
  const sortedMessages = useMemo(() => {
    return messages.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [messages]);

  return (
    <div>
      {sortedMessages.map(msg => (
        <ChatMessage 
          key={msg.id} 
          message={msg} 
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// ✅ AHORA (React 19) - Automático
function ChatList({ messages, onDelete }) {
  // React 19 optimiza automáticamente
  const handleDelete = (id) => {
    onDelete(id);
  };

  // No necesita useMemo
  const sortedMessages = messages.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div>
      {sortedMessages.map(msg => (
        <ChatMessage 
          key={msg.id} 
          message={msg} 
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

**Implementación en Nuxchain:**

```typescript
// src/components/chat/ChatMessage.tsx
import React from 'react';

interface ChatMessageProps {
  message: ChatMessage;
  onDelete?: (id: string) => void;
  isStreaming?: boolean;
}

// React 19 auto-memoiza este componente
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onDelete,
  isStreaming
}) => {
  // Función sin useCallback - React 19 lo maneja
  const handleDelete = () => {
    onDelete?.(message.id);
  };

  return (
    <div className="chat-message group">
      <div className="flex gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            {message.sender === 'user' ? 'Tú' : 'Nuxbee'}
          </p>
          <div className="bg-gray-100 rounded-lg p-3">
            {isStreaming ? (
              <p className="animate-pulse">{message.text}</p>
            ) : (
              <p>{message.text}</p>
            )}
          </div>
        </div>
        
        {onDelete && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
```

### 2. New Hooks: useTransition

**Qué es:** Permite marcar actualizaciones como "non-blocking" para mantener la UI responsiva.

```typescript
// ❌ ANTES - UI se congela durante operaciones pesadas
function StakingForm() {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Esto congela la UI
    const result = await submitStake(amount);
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={amount} onChange={e => setAmount(e.target.value)} />
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Procesando...' : 'Stake'}
      </button>
    </form>
  );
}

// ✅ REACT 19 - useTransition mantiene UI responsiva
import { useTransition } from 'react';

function StakingForm() {
  const [amount, setAmount] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await submitStake(amount);
      // UI sigue siendo responsiva mientras procesa
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={amount} 
        onChange={e => setAmount(e.target.value)}
        disabled={isPending}
      />
      <button disabled={isPending}>
        {isPending ? 'Procesando...' : 'Stake'}
      </button>
    </form>
  );
}
```

**Implementación en Nuxchain:**

```typescript
// src/pages/Staking.tsx
import { useTransition } from 'react';
import { submitStakingDeposit } from '@/hooks/staking';

export default function StakingPage() {
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<StakingResult | null>(null);

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();

    // startTransition mantiene la UI responsiva
    startTransition(async () => {
      try {
        const res = await submitStakingDeposit({
          amount,
          lockupPeriod: '12 months'
        });
        
        setResult(res);
        setAmount('');
        
      } catch (error) {
        console.error('Staking failed:', error);
      }
    });
  };

  return (
    <div className="p-6">
      <form onSubmit={handleStake} className="space-y-4">
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount to stake"
          className="w-full px-4 py-2 border rounded-lg"
          disabled={isPending}
        />

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚙️</span>
              Procesando...
            </span>
          ) : (
            'Stake Tokens'
          )}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ Staking completado</p>
          <p className="text-green-600">TX: {result.txHash}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. useOptimistic Hook

**Qué es:** Actualiza la UI optimistamente antes de que el servidor responda.

```typescript
// IMPLEMENTACIÓN EN NUXCHAIN
// src/components/chat/useChatOptimistic.ts

import { useOptimistic } from 'react';

interface OptimisticMessage extends ChatMessage {
  _optimistic?: boolean;
}

export function useChatOptimistic(messages: ChatMessage[]) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: ChatMessage) => {
      return [...state, { ...newMessage, _optimistic: true }];
    }
  );

  const sendMessage = async (content: string) => {
    // Optimista: mostrar mensaje inmediatamente
    const message: ChatMessage = {
      id: `temp_${Date.now()}`,
      text: content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    addOptimisticMessage(message);

    try {
      // Luego enviamos al servidor
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify({ message: content })
      });

      // El mensaje se confirma cuando el servidor responde
    } catch (error) {
      // Si falla, el estado vuelve a lo anterior
      console.error('Failed to send message:', error);
    }
  };

  return { optimisticMessages, sendMessage };
}
```

**Uso en componente:**

```typescript
// src/components/chat/ChatContainer.tsx
import { useChatOptimistic } from './useChatOptimistic';

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { optimisticMessages, sendMessage } = useChatOptimistic(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes con optimistic updates */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {optimisticMessages.map(msg => (
          <ChatMessage
            key={msg.id}
            message={msg}
            // Visual indicator para mensajes optimistas
            className={msg._optimistic ? 'opacity-70' : 'opacity-100'}
          />
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
```

### 4. useFormStatus Hook (Server Components)

**Qué es:** Accede al estado de formularios en Server Components.

```typescript
// Disponible en React 19 con React Router 7

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={pending ? 'opacity-50' : ''}
    >
      {pending ? 'Enviando...' : 'Enviar'}
    </button>
  );
}
```

### 5. Ref Cleanup Functions

**Qué es:** Refs pueden limpiar automáticamente en React 19.

```typescript
// ✅ REACT 19 - Cleanup automático
function WebSocketComponent() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002/ws/streaming');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
    };

    // React 19 automáticamente limpia esto
    return () => ws.close();
  }, []);

  return <div>WebSocket conectado</div>;
}
```

---

## 🎨 Tailwind CSS 4 - Utilidades Avanzadas

### 1. Dynamic Color System

**Configuración en `tailwind.config.js`:**

```javascript
export default {
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          black: {
            50: '#f8f8f8',
            100: '#e5e5e5',
            500: '#333333',
            900: '#050505',
            DEFAULT: '#0a0a0a',
          },
          purple: {
            50: '#faf5ff',
            500: '#8b5cf6',
            900: '#4c1d95',
            DEFAULT: '#8b5cf6',
          },
          red: {
            50: '#fef2f2',
            500: '#ef4444',
            900: '#7f1d1d',
            DEFAULT: '#ef4444',
          },
        },
      },
    },
  },
};
```

**Uso en Componentes:**

```tsx
// Chat Message con brand colors
<div className="bg-brand-black-50 border-brand-purple">
  <p className="text-brand-black-900">Nuxbee</p>
</div>

// Botón con gradiente
<button className="bg-gradient-to-r from-brand-purple to-brand-red text-brand-white">
  Send
</button>
```

### 2. Advanced Grid System

**Layouts complejos con Tailwind:**

```tsx
// src/components/layout/Dashboard.tsx
export function Dashboard() {
  return (
    // Grid responsive
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* Sidebar - 1 col en mobile, 1 en md, 1 en lg */}
      <aside className="md:col-span-1 lg:col-span-1">
        <nav className="sticky top-0">Navigation</nav>
      </aside>

      {/* Main content - 1 col en mobile, 2 en md, 3 en lg */}
      <main className="md:col-span-2 lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Staking">Content</Card>
          <Card title="NFTs">Content</Card>
        </div>
      </main>
    </div>
  );
}
```

### 3. Custom Animations en Tailwind

**Definidas en `tailwind.config.js`:**

```javascript
export default {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'water-flow': {
          '0%, 100%': {
            transform: 'rotate(0deg) translateX(0)',
            borderRadius: '48% 52% 45% 55%'
          },
          '50%': {
            transform: 'rotate(120deg) translateX(10%)',
            borderRadius: '52% 48% 55% 45%'
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'gradient-flow': 'gradient-flow 8s ease infinite',
        'water-flow': 'water-flow 15s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
};
```

**Uso en Componentes:**

```tsx
// Animated AI Logo
export function AnimatedAILogo() {
  return (
    <div className="w-32 h-32 animate-water-flow">
      <div className="w-full h-full bg-gradient-to-r from-purple-600 to-red-600 rounded-full" />
    </div>
  );
}

// Chat Message con slide-up
export function ChatMessage({ message }: Props) {
  return (
    <div className="animate-slide-up">
      <p className="text-gray-800">{message.text}</p>
    </div>
  );
}

// Loading State con fade-in
export function LoadingPlaceholder() {
  return (
    <div className="animate-fade-in">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
```

### 4. Responsive Design Utilities

```tsx
// Componente completamente responsive
export function StakingCard() {
  return (
    <div className="
      w-full                    // Mobile: 100%
      md:w-1/2                  // Tablet: 50%
      lg:w-1/3                  // Desktop: 33%
      xl:w-1/4                  // XL: 25%
      
      p-4                       // Mobile padding
      md:p-6                    // Tablet padding
      lg:p-8                    // Desktop padding
      
      grid grid-cols-1          // Mobile: 1 columna
      md:grid-cols-2            // Tablet: 2 columnas
      lg:grid-cols-3            // Desktop: 3 columnas
      
      gap-2                     // Mobile gap
      md:gap-4                  // Tablet gap
      
      text-sm                   // Mobile text
      md:text-base              // Tablet text
      lg:text-lg                // Desktop text
    ">
      <div>Card content</div>
    </div>
  );
}
```

### 5. Dark Mode Support

**Tailwind Dark Mode:**

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // usar class strategy
  // ...
};
```

**Uso:**

```tsx
// El proyecto automáticamente soporta dark mode
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-800
">
  Content that adapts to dark/light mode
</div>
```

---

## 🚀 Implementaciones en Nuxchain

### 1. Chat Interface con Streaming

**Combina React 19 + Tailwind CSS:**

```typescript
// src/components/chat/ChatContainer.tsx
import { useReducer, useTransition, useEffect } from 'react';
import { chatReducer, initialChatState } from './core/chatReducer';
import { useStreamingService } from '@/hooks/chat/useStreamingService';
import ChatMessage from './ChatMessage';
import InputTextArea from './InputTextArea';

export default function ChatContainer() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [isPending, startTransition] = useTransition();
  const { stream } = useStreamingService();

  const handleSendMessage = (content: string) => {
    // Dispatch user message
    dispatch({
      type: 'ADD_USER_MESSAGE',
      payload: {
        id: `user_${Date.now()}`,
        text: content,
        sender: 'user',
        timestamp: new Date().toISOString(),
      }
    });

    // Start streaming with useTransition
    startTransition(async () => {
      dispatch({ type: 'START_STREAMING' });

      try {
        for await (const chunk of stream(content)) {
          dispatch({
            type: 'UPDATE_STREAM',
            payload: chunk
          });
        }
        dispatch({ type: 'FINISH_STREAM' });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            error: error.message,
            messageId: `assistant_${Date.now()}`
          }
        });
      }
    });
  };

  return (
    <div className="
      flex flex-col h-screen
      bg-gradient-to-b from-gray-50 to-white
      dark:from-gray-900 dark:to-gray-800
    ">
      {/* Messages Container */}
      <div className="
        flex-1 overflow-y-auto
        p-4 md:p-6 lg:p-8
        space-y-4
      ">
        {state.messages.map(msg => (
          <ChatMessage 
            key={msg.id}
            message={msg}
            isStreaming={
              msg.isStreaming || 
              (isPending && msg.sender === 'assistant')
            }
          />
        ))}

        {state.error && (
          <div className="
            p-4 bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800
            rounded-lg
            text-red-800 dark:text-red-200
            animate-slide-up
          ">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{state.error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="
        border-t border-gray-200 dark:border-gray-700
        p-4 md:p-6 lg:p-8
        bg-white dark:bg-gray-800
      ">
        <InputTextArea
          onSend={handleSendMessage}
          disabled={isPending}
          placeholder="Ask Nuxbee..."
        />
      </div>
    </div>
  );
}
```

### 2. Animated AI Logo con Framer Motion + Tailwind

```typescript
// src/ui/AnimatedAILogo.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AIAgentSphereProps {
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export const AIAgentSphere: React.FC<AIAgentSphereProps> = ({
  size = 'medium',
  onClick,
}) => {
  const [isActive, setIsActive] = useState(false);

  const sizeMap = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  };

  const waveVariants = {
    wave1: {
      scale: [1, 1.5, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: isActive ? 0.6 : 2,
        repeat: Infinity,
      }
    },
  };

  const handleClick = () => {
    setIsActive(true);
    onClick?.();
    setTimeout(() => setIsActive(false), 1200);
  };

  return (
    <motion.div
      className={`
        ${sizeMap[size]}
        relative
        cursor-pointer
        flex items-center justify-center
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Center Sphere */}
      <motion.div
        className="
          absolute inset-0
          bg-gradient-to-br
          from-purple-600 to-purple-800
          rounded-full
          shadow-lg shadow-purple-500/50
        "
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{
          duration: isActive ? 0.6 : 3,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Wave 1 */}
      <motion.div
        className="
          absolute inset-0
          border-2 border-purple-400
          rounded-full
          opacity-60
        "
        variants={waveVariants}
      />

      {/* Wave 2 */}
      <motion.div
        className="
          absolute inset-0
          border-2 border-purple-300
          rounded-full
          opacity-40
        "
        variants={{
          ...waveVariants,
          wave1: {
            ...waveVariants.wave1,
            transition: {
              ...waveVariants.wave1.transition,
              delay: 0.3,
            }
          }
        }}
      />

      {/* Center Icon */}
      <div className="
        absolute inset-0
        flex items-center justify-center
        text-white text-2xl font-bold
      ">
        🤖
      </div>
    </motion.div>
  );
};
```

### 3. Responsive Dashboard Layout

```typescript
// src/pages/Profile.tsx
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br
      from-brand-black-50
      via-white
      to-brand-purple-50
      dark:from-brand-black-900
      dark:via-brand-black-800
      dark:to-brand-black-900
    ">
      {/* Header */}
      <header className="
        sticky top-0 z-10
        backdrop-blur-md
        bg-white/80 dark:bg-gray-900/80
        border-b border-gray-200 dark:border-gray-800
        p-4 md:p-6
      ">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
      </header>

      {/* Main Content - Responsive Grid */}
      <main className="
        p-4 md:p-6 lg:p-8
        max-w-7xl mx-auto
      ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Stats Cards - Mobile: full width, Tablet: 1 card, Desktop: 1 card */}
          <div className="
            md:col-span-1
            bg-white dark:bg-gray-800
            rounded-lg
            p-6
            border border-gray-200 dark:border-gray-700
            shadow-sm
            hover:shadow-md
            transition-shadow
            duration-300
          ">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
              Total Staked
            </h3>
            <p className="text-3xl font-bold mt-2">
              {profile?.totalStaked}
            </p>
          </div>

          <div className="
            md:col-span-1
            bg-gradient-to-br from-purple-50 to-purple-100
            dark:from-purple-900/20 dark:to-purple-800/20
            rounded-lg
            p-6
            border border-purple-200 dark:border-purple-700
          ">
            <h3 className="text-purple-600 dark:text-purple-400 text-sm font-semibold">
              APY
            </h3>
            <p className="text-3xl font-bold mt-2 text-purple-700 dark:text-purple-300">
              {profile?.apy}%
            </p>
          </div>

          <div className="
            md:col-span-1
            bg-gradient-to-br from-green-50 to-green-100
            dark:from-green-900/20 dark:to-green-800/20
            rounded-lg
            p-6
            border border-green-200 dark:border-green-700
          ">
            <h3 className="text-green-600 dark:text-green-400 text-sm font-semibold">
              Rewards
            </h3>
            <p className="text-3xl font-bold mt-2 text-green-700 dark:text-green-300">
              {profile?.rewards}
            </p>
          </div>
        </div>

        {/* NFT Gallery - Responsive columns */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6">Your NFTs</h2>
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-4
          ">
            {profile?.nfts.map(nft => (
              <div
                key={nft.id}
                className="
                  group relative
                  overflow-hidden
                  rounded-lg
                  bg-gray-200 dark:bg-gray-700
                  aspect-square
                  cursor-pointer
                  hover:shadow-lg
                  transition-all
                  duration-300
                "
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="
                    w-full h-full
                    object-cover
                    group-hover:scale-110
                    transition-transform
                    duration-300
                  "
                />
                <div className="
                  absolute inset-0
                  bg-black/0
                  group-hover:bg-black/60
                  transition-colors
                  duration-300
                  flex items-end p-4
                ">
                  <p className="
                    text-white
                    font-semibold
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-300
                  ">
                    {nft.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## ✅ Mejores Prácticas

### 1. Performance Optimization

```typescript
// ✅ BIEN - Component splitting
import { memo } from 'react';

interface SmallComponentProps {
  value: string;
  onChange: (value: string) => void;
}

// Memoización automática en React 19
const InputField = memo(function InputField({ 
  value, 
  onChange 
}: SmallComponentProps) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
});

// ✅ BIEN - Lazy loading pages
import { lazy, Suspense } from 'react';

const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/chat"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Chat />
          </Suspense>
        }
      />
    </Routes>
  );
}

// ✅ BIEN - Image optimization
import { lazy } from 'react';

export function ProfileImage({ src, alt }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-16 h-16 rounded-full"
    />
  );
}
```

### 2. Tailwind CSS Best Practices

```tsx
// ✅ BIEN - Usar clases predefinidas
const buttonClasses = "
  px-4 py-2
  rounded-lg
  font-semibold
  transition-all
  duration-300
  focus:outline-none
  focus:ring-2
  focus:ring-offset-2
";

// ❌ MAL - Clases inline demasiado largas
<button className="px-4 py-2 rounded-lg font-semibold...">

// ✅ BIEN - Usar @apply en CSS
/* globals.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300;
  }

  .btn-secondary {
    @apply px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300 transition-all duration-300;
  }
}

// Luego usar en JSX
<button className="btn-primary">Send</button>
```

### 3. Accessibility

```tsx
// ✅ BIEN - Accesibilidad
<button
  aria-label="Delete message"
  aria-pressed={isActive}
  onClick={handleDelete}
  className="p-2 hover:bg-gray-100"
>
  <TrashIcon />
</button>

// ✅ BIEN - Focus visible
<input
  className="
    focus:outline-none
    focus:ring-2
    focus:ring-purple-500
    focus:ring-offset-2
  "
/>

// ✅ BIEN - Color contrast
<p className="text-gray-900 dark:text-gray-100">Text</p>
```

---

## 📈 Performance y Optimización

### 1. Bundle Size Optimization

```javascript
// vite.config.ts - Code splitting automático
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom', 'react-router-dom'],
          'ui': [
            '@tanstack/react-query',
            'framer-motion',
            'react-hot-toast'
          ],
          'chat': [
            // Chat-specific imports
          ]
        }
      }
    }
  }
});
```

### 2. Metrics Tracking

```typescript
// Medir performance
const performanceMetrics = {
  FCP: performance.getEntriesByName('first-contentful-paint')[0],
  LCP: performance.getEntriesByName('largest-contentful-paint'),
  CLS: new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      console.log('CLS entry:', entry);
    }
  }),
};
```

### 3. Lighthouse Scores

```bash
# Ejecutar auditoría Lighthouse
npm run lighthouse

# Obtener puntuaciones:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 92+
# SEO: 90+
```

---

## 📚 Resumen de Features

| Feature | React 19 | Tailwind 4 | Nuxchain |
|---------|----------|-----------|----------|
| **Auto Memoization** | ✅ | - | ✅ Usado |
| **useTransition** | ✅ | - | ✅ Staking |
| **useOptimistic** | ✅ | - | ✅ Chat |
| **Dynamic Colors** | - | ✅ | ✅ Brand |
| **Grid System** | - | ✅ | ✅ Dashboard |
| **Animations** | - | ✅ | ✅ AI Logo |
| **Dark Mode** | - | ✅ | ✅ Support |
| **Responsive** | - | ✅ | ✅ Mobile-first |

---

## 🔗 Referencias

- [React 19 Docs](https://react.dev/)
- [React 19 Blog Post](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Framer Motion](https://www.framer.com/motion/)
- [Web Vitals](https://web.dev/vitals/)

---

**Documento Versión:** 1.0  
**Última actualización:** Octubre 22, 2025  
**Autor:** Nuxchain Development Team  
**Status:** ✅ Producción
