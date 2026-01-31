# 🔗 Solana & Polygon Dual Network Support

## Implementación de Compatibilidad Multi-Blockchain

Esta documentación describe cómo está implementada la compatibilidad dual entre **Solana** y **Polygon (EVM)** en Nuxchain.

### 📋 Tabla de Contenidos
1. [Arquitectura](#arquitectura)
2. [Componentes Principales](#componentes-principales)
3. [Cómo Usar](#cómo-usar)
4. [Wallets Soportados](#wallets-soportados)

---

## Arquitectura

### Stack de Tecnologías

```
┌─────────────────────────────────────────────────┐
│          App (NetworkProvider)                   │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │   WagmiProvider (Polygon - EVM)           │  │
│  ├───────────────────────────────────────────┤  │
│  │   ConnectionProvider + WalletProvider     │  │
│  │   (Solana)                                │  │
│  ├───────────────────────────────────────────┤  │
│  │   WalletConnect Component                 │  │
│  │   - EVM Wallet Selector                   │  │
│  │   - Solana Wallet Selector                │  │
│  │   - Network Switcher (Mainnet/Devnet)    │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Flujo de Selección de Red

1. **Usuario abre WalletConnect**
2. **Selecciona pestaña (EVM o Solana)**
3. **Selecciona wallet específico**
4. **Red se detecta automáticamente y se guarda en NetworkContext**
5. **Todos los componentes pueden acceder a `activeNetwork` globalmente**

---

## Componentes Principales

### 1. **NetworkContext** (`src/context/NetworkContext.tsx`)
Gestiona el estado global de la red seleccionada.

**Propiedades:**
```typescript
activeNetwork: 'evm' | 'solana'      // Red activa
setActiveNetwork: (network) => void  // Cambiar red
solanaNetwork: 'mainnet-beta' | 'devnet'
setSolanaNetwork: (network) => void
isEVMConnected: boolean
isSolanaConnected: boolean
evmAddress: string | null
solanaAddress: string | null
```

### 2. **WalletConnect Component** (`src/components/web3/WalletConnect.tsx`)
Interfaz de usuario para conectar wallets.

**Features:**
- ✅ Tabs para EVM y Solana
- ✅ Detección automática de Phantom
- ✅ Selector explícito de red para OKX
- ✅ Mainnet/Devnet switcher para Solana
- ✅ Soporte para múltiples wallets

### 3. **Solana Configuration** (`src/constants/solana.ts`)
Configuración de redes Solana.

```typescript
SOLANA_NETWORKS = {
  'mainnet-beta': { ... },
  'devnet': { ... }
}
```

### 4. **useSolanaWallet Hook** (`src/hooks/web3/useSolanaWallet.ts`)
Hook para gestionar estado de Solana wallet.

```typescript
const solanaWallet = useSolanaWallet()
// Retorna:
// - address
// - publicKey
// - isConnected
// - wallet name
// - balance
// - network
```

### 5. **useActiveNetwork Hook** (`src/hooks/web3/useActiveNetwork.ts`)
Hook para acceder al contexto de red en cualquier componente.

```typescript
const { activeNetwork, setActiveNetwork } = useActiveNetwork()
```

---

## Cómo Usar

### En Componentes

#### Acceder a la Red Seleccionada
```tsx
import { useActiveNetwork } from '@/hooks/web3/useActiveNetwork'

function MyComponent() {
  const { activeNetwork, evmAddress, solanaAddress } = useActiveNetwork()

  return (
    <div>
      {activeNetwork === 'evm' && <p>EVM Address: {evmAddress}</p>}
      {activeNetwork === 'solana' && <p>Solana Address: {solanaAddress}</p>}
    </div>
  )
}
```

#### Cambiar la Red Activa
```tsx
const { setActiveNetwork, setSolanaNetwork } = useActiveNetwork()

// Cambiar a Solana
setActiveNetwork('solana')
setSolanaNetwork('mainnet-beta')

// Cambiar a Polygon
setActiveNetwork('evm')
```

#### Verificar Conexión
```tsx
const { isEVMConnected, isSolanaConnected } = useActiveNetwork()

if (isEVMConnected) {
  // Usuario conectado a Polygon
}

if (isSolanaConnected) {
  // Usuario conectado a Solana
}
```

---

## Wallets Soportados

### EVM (Polygon)
| Wallet | Soporte |
|--------|---------|
| MetaMask | ✅ |
| Injected (cualquier extensión) | ✅ |
| WalletConnect (QR) | ✅ |
| OKX Wallet | ✅ (modo EVM) |

### Solana
| Wallet | Soporte | Auto-Detectado |
|--------|---------|----------------|
| Phantom | ✅ | ✅ Sí |
| Solflare | ✅ | ❌ Manual |
| OKX Wallet | ✅ | ❌ Manual |
| Trust Wallet | ✅ | ❌ Manual |

---

## Configuración Inicial

### 1. **main.tsx** ya está configurado con:
```tsx
<ConnectionProvider endpoint={solanaRpcUrl}>
  <WalletProvider wallets={solanaWallets} autoConnect>
    <WalletModalProvider>
      {/* App */}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

### 2. **App.tsx** ya envuelve con:
```tsx
<NetworkProvider>
  <Router>
    <AppContent />
  </Router>
</NetworkProvider>
```

### 3. **Variables de Entorno Necesarias**
```env
VITE_WALLETCONNECT_PROJECT_ID=<your_project_id>
VITE_ALCHEMY=<your_alchemy_key>
```

---

## Notas Importantes

### Solana vs Polygon
- **Solana**: No hay "switch network" nativo. El cambio es solo cambiar el RPC endpoint.
- **Polygon**: Usa el hook `useSwitchChain()` de Wagmi para cambiar redes.

### Detección Automática
- Phantom se detecta automáticamente en el tab de Solana
- OKX requiere selección explícita de red
- Las direcciones se auto-rellenan cuando hay conexión activa

### Estados
- Un usuario puede estar conectado a EVM y Solana simultáneamente
- Solo UNA red puede estar "activa" a la vez
- El estado global se mantiene en NetworkContext

---

## Testing

Para testear la implementación:

1. **Conectar a Polygon**
   - Usar MetaMask o Phantom
   - Verificar que `activeNetwork === 'evm'`

2. **Conectar a Solana**
   - Usar Phantom o Solflare
   - Verificar que `activeNetwork === 'solana'`

3. **Cambiar Solana Network**
   - Seleccionar Mainnet o Devnet
   - Verificar que `solanaNetwork` cambia

4. **OKX Network Selector**
   - Conectar con OKX
   - Seleccionar EVM o Solana
   - Verificar cambio de red

---

## Troubleshooting

### Phantom no se detecta
- Verificar que la extensión está instalada
- Recargar la página
- Verificar que `window.phantom.solana.isPhantom` retorna `true`

### OKX Wallet no aparece
- Verificar que OKX está instalado
- Verificar en DevTools: `window.okxwallet`

### Cambio de red no funciona
- Verificar que hay conexión activa
- Revisar logs en consola
- Asegurarse de que NetworkContext está envolviendo la app

---

**Implementación completada: 30/01/2026**
