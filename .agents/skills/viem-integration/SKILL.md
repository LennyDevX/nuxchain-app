---
name: viem-integration
description: Integrate EVM blockchains using viem. Use when user says "read blockchain data", "send transaction", "interact with smart contract", "connect to Ethereum", "use viem", "use wagmi", "wallet integration", "viem setup", or mentions blockchain/EVM development with TypeScript.
license: MIT
metadata:
  author: uniswap
  version: '1.0.0'
---

# viem Integration

Integrate EVM blockchains using viem for TypeScript/JavaScript applications.

## Quick Decision Guide

| Building...                | Use This                       |
| -------------------------- | ------------------------------ |
| Node.js script/backend     | viem with http transport       |
| React/Next.js frontend     | wagmi hooks (built on viem)    |
| Real-time event monitoring | viem with webSocket transport  |
| Browser wallet integration | wagmi or viem custom transport |

## Installation

```bash
# Core library
npm install viem

# For React apps, also install wagmi
npm install wagmi viem @tanstack/react-query
```

## Core Concepts

### Clients

viem uses two client types:

| Client           | Purpose              | Example Use                              |
| ---------------- | -------------------- | ---------------------------------------- |
| **PublicClient** | Read-only operations | Get balances, read contracts, fetch logs |
| **WalletClient** | Write operations     | Send transactions, sign messages         |

### Transports

| Transport     | Use Case                          |
| ------------- | --------------------------------- |
| `http()`      | Standard RPC calls (most common)  |
| `webSocket()` | Real-time event subscriptions     |
| `custom()`    | Browser wallets (window.ethereum) |

### Chains

viem includes 50+ chain definitions. Import from `viem/chains`:

```typescript
import { mainnet, arbitrum, optimism, base, polygon } from 'viem/chains';
```

## Quick Start Examples

### Read Balance

```typescript
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const balance = await client.getBalance({
  address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
});

console.log(formatEther(balance)); // "1.5"
```

### Read Contract

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({ chain: mainnet, transport: http() });

const result = await client.readContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: [
    {
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
  ],
  functionName: 'balanceOf',
  args: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
});
```

### Send Transaction

```typescript
import { createWalletClient, http, parseEther } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

const hash = await client.sendTransaction({
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('0.001'),
});
```

### Write to Contract

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');
const publicClient = createPublicClient({ chain: mainnet, transport: http() });
const walletClient = createWalletClient({ account, chain: mainnet, transport: http() });

// Simulate first (recommended)
const { request } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 1000n],
  account,
});

const hash = await walletClient.writeContract(request);
```

## wagmi React Hooks

### Setup (App.tsx)

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* your app */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Common Hooks

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useReadContract, useWriteContract } from 'wagmi';
import { useBalance } from 'wagmi';

// Wallet connection
const { address, isConnected } = useAccount();
const { connect, connectors } = useConnect();
const { disconnect } = useDisconnect();

// Read contract
const { data: balance } = useReadContract({
  address: '0x...',
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address],
});

// Write contract
const { writeContract, isPending } = useWriteContract();
writeContract({
  address: '0x...',
  abi: erc20Abi,
  functionName: 'transfer',
  args: ['0x...', 1000n],
});
```

## Common Utilities

### Unit Conversion

```typescript
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';

parseEther('1.5')        // 1500000000000000000n
formatEther(1500000000000000000n) // "1.5"
parseUnits('1.5', 6)     // 1500000n  (USDC has 6 decimals)
formatUnits(1500000n, 6) // "1.5"
```

### Address Utilities

```typescript
import { getAddress, isAddress, checksumAddress } from 'viem';

isAddress('0x...')           // true/false
getAddress('0x...')          // checksummed address
```

### Hashing

```typescript
import { keccak256, encodePacked, encodeAbiParameters } from 'viem';

keccak256('0x...')
encodePacked(['address', 'uint256'], ['0x...', 1000n])
```

## Error Handling

```typescript
import { ContractFunctionRevertedError, BaseError } from 'viem';

try {
  await client.readContract({ ... });
} catch (err) {
  if (err instanceof BaseError) {
    const revertError = err.walk(e => e instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      console.error('Revert reason:', revertError.data?.errorName);
    }
  }
}
```

## Resources

- [viem Documentation](https://viem.sh)
- [wagmi Documentation](https://wagmi.sh)
- [Swap Integration Skill](../swap-integration/SKILL.md) — Build on viem basics with Uniswap swaps
