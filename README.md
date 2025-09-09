# Nuvos App - Web3 DApp

Una aplicación Web3 moderna construida con las últimas versiones de React, Vite, TailwindCSS, Wagmi y Viem.

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **Vite 7** - Herramienta de construcción rápida
- **TypeScript** - Tipado estático
- **TailwindCSS** - Framework de CSS utilitario
- **Wagmi** - Hooks de React para Ethereum
- **Viem** - Biblioteca TypeScript para Ethereum
- **TanStack Query** - Gestión de estado del servidor

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd nuvos-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura tu Project ID de WalletConnect:
   - Edita `src/wagmi.ts`
   - Reemplaza `'YOUR_PROJECT_ID'` con tu Project ID real de [WalletConnect Cloud](https://cloud.walletconnect.com/)

## 🚀 Desarrollo

Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`

## 📦 Construcción

Para construir la aplicación para producción:
```bash
npm run build
```

## 🔗 Funcionalidades

- ✅ Conexión de wallet (MetaMask, WalletConnect, etc.)
- ✅ Visualización de dirección de wallet
- ✅ Visualización de balance ETH
- ✅ Soporte para múltiples redes (Mainnet, Sepolia)
- ✅ Interfaz moderna con TailwindCSS
- ✅ TypeScript para mayor seguridad de tipos

## 🌐 Redes Soportadas

- Ethereum Mainnet
- Sepolia Testnet

## 📝 Notas

- Asegúrate de tener MetaMask u otro wallet compatible instalado
- Para usar WalletConnect, necesitas configurar tu Project ID
- La aplicación está configurada para funcionar con las últimas versiones de todas las dependencias

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## 📄 Licencia

MIT
