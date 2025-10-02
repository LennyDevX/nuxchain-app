# Nuxchain App - Web3 DApp

Una plataforma Web3 avanzada para interacción con NFTs, staking, airdrops y servicios de IA integrados. La aplicación está diseñada para ofrecer una experiencia intuitiva y segura en el ecosistema blockchain.

## 🚀 Tecnologías Utilizadas

- **React** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **TypeScript** - Tipado estático
- **TailwindCSS** - Framework de CSS utilitario
- **Wagmi** - Hooks de React para Ethereum
- **Viem** - Biblioteca TypeScript para Ethereum
- **Google Gemini API** - Integración de inteligencia artificial
- **WebSocket** - Streaming en tiempo real
- **WalletConnect** - Conexión de wallets multiplataforma

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd nuxchain-app
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
npm run dev:full
```

La aplicación estará disponible en `http://localhost:5173/`

## 📦 Construcción

Para construir la aplicación para producción:
```bash
npm run build
```

## 🔗 Funcionalidades

- ✅ Conexión de wallet (MetaMask, WalletConnect, etc.)
- ✅ Visualización de dirección de wallet y balance ETH
- ✅ Navegación y gestión de NFTs
- ✅ Marketplace de NFTs
- ✅ Servicios de staking inteligente
- ✅ Participación en airdrops
- ✅ Chat con asistente AI (basado en Google Gemini)
- ✅ Web scraping y análisis de contenido
- ✅ Streaming semántico para respuestas más naturales
- ✅ Servicios de embeddings y knowledge base
- ✅ Integración con contratos inteligentes ERC-721 y ERC-20
- ✅ Soporte para múltiples redes (Mainnet, Sepolia)
- ✅ Interfaz moderna con TailwindCSS y animaciones

## 🌐 Redes Soportadas

- Ethereum Mainnet
- Sepolia Testnet

## 📝 Notas

- Asegúrate de tener MetaMask u otro wallet compatible instalado
- Para usar WalletConnect, necesitas configurar tu Project ID
- La aplicación está configurada para funcionar con las últimas versiones de todas las dependencias

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## 🧠 Servicios de IA Integrados

La aplicación integra servicios avanzados de inteligencia artificial a través de la API de Google Gemini:

- **Asistente de chat** con streaming en tiempo real
- **Análisis de contenido** y extracción de información
- **Servicios de embeddings** para búsquedas semánticas
- **Contexto de URL** para análisis de páginas web
- **Streaming semántico** con pausas contextuales

## 📄 Licencia

MIT
