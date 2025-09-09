import { http, createConfig } from 'wagmi'
import { polygon, polygonAmoy } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
const alchemyApiKey = import.meta.env.VITE_ALCHEMY

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
    safe(),
  ],
  transports: {
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [polygonAmoy.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}