/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENHANCED_SMARTSTAKING_ADDRESS: string
  readonly VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS: string
  readonly VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS: string
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// PWA Register
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: Error) => void
  }
  export function registerSW(options?: RegisterSWOptions): void
}

// Solana wallet types
interface Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean
      connect(): Promise<{ publicKey: { toString(): string } }>
      disconnect(): Promise<void>
    }
  }
  solflare?: {
    isConnected: boolean
  }
  okxwallet?: {
    solana?: {
      connect(): Promise<void>
      disconnect(): Promise<void>
    }
  }
  trustwallet?: {
    solana?: {
      connect(): Promise<void>
      disconnect(): Promise<void>
    }
  }
}
/// <reference types="vite-plugin-pwa/client" />

// React initialization and global scope
interface Window {
  __reactReady?: Promise<void>;
  __resolveReact?: () => void;
  React?: typeof import('react');
  ReactDOM?: typeof import('react-dom');
}
