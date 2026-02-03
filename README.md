# Nuxchain App - Web3 DApp

> **Advanced Web3 platform for NFT interaction, staking, airdrops, and AI-powered services built on Ethereum.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)

---

## � Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Nuxchain is a comprehensive Web3 platform that combines DeFi, NFTs, and AI-powered tools for a seamless blockchain experience. Built with modern technologies for performance, security, and scalability.

**Key Capabilities:**
- 🎨 **NFT Marketplace** - Trade and manage digital assets
- 💰 **Smart Staking** - AI-optimized token staking
- 🎁 **Airdrops** - Easy participation in token distributions
- 🤖 **AI Assistant** - Nuxbee AI powered by Google Gemini
- 🔗 **Multi-Wallet** - MetaMask, WalletConnect support
- 📱 **Responsive** - Optimized for desktop and mobile

---

## ✨ Features

### Core Platform
- ✅ **Multi-Wallet Connection** - MetaMask, WalletConnect, Coinbase Wallet
- ✅ **NFT Marketplace** - Buy, sell, and browse digital collectibles
- ✅ **Smart Staking** - Stake tokens with AI-powered optimization
- ✅ **Airdrop System** - Participate in token distributions
- ✅ **Real-time Dashboard** - Track balances and transactions
- ✅ **Profile Management** - User profiles and activity history

### AI Services - Nuxbee Assistant
- ✅ **Real-time Chat** - Conversational AI powered by Google Gemini 2.5
- ✅ **Knowledge Base** - Platform-specific contextual answers
- ✅ **Web Analysis** - Extract insights from URLs and documents
- ✅ **Semantic Search** - Intelligent query classification
- ✅ **Staking Recommendations** - AI-driven portfolio optimization

### Technical Features
- ✅ **TypeScript** - Full type safety across frontend and backend
- ✅ **React Query** - Intelligent server state management
- ✅ **Service Worker** - Offline support and caching
- ✅ **Responsive Design** - Mobile-first TailwindCSS
- ✅ **Performance Optimized** - Lazy loading and code splitting
- ✅ **Smart Contracts** - ERC-721 and ERC-20 integration
- ✅ **Multi-Network** - Ethereum Mainnet and Sepolia Testnet

---

## 🚀 Tech Stack

### Frontend
- **[React 19](https://reactjs.org/)** - UI library with latest features
- **[Vite 7.1](https://vitejs.dev/)** - Lightning-fast build tool
- **[TypeScript 5.7](https://www.typescriptlang.org/)** - Type-safe development
- **[TailwindCSS 4.0](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[React Query 5.90](https://tanstack.com/query/)** - Server state management

### Web3 & Blockchain
- **[Wagmi](https://wagmi.sh/)** - React hooks for Ethereum
- **[Viem 2.38](https://viem.sh/)** - TypeScript Ethereum library
- **[WalletConnect](https://walletconnect.com/)** - Multi-wallet connection
- **[The Graph](https://thegraph.com/)** - Blockchain data indexing

### Backend & AI
- **[Express 5](https://expressjs.com/)** - API server (Vercel Serverless)
- **[Google Gemini API](https://ai.google.dev/)** - AI integration (v2.5 Flash Lite)
- **[Node.js 20+](https://nodejs.org/)** - Runtime environment

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Lighthouse CI** - Performance audits
- **TypeScript Compiler** - Type checking

For detailed stack information, see **[doc/STACK.md](doc/STACK.md)**.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **pnpm** v9+ (recommended) or npm
- **MetaMask** browser extension or compatible Web3 wallet
- **WalletConnect Project ID** ([Create one](https://cloud.walletconnect.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/LennyDevX/nuxchain-app.git
cd nuxchain-app

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173/`

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Required
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Optional (for AI features)
GOOGLE_API_KEY=your_gemini_api_key

# Optional (for subgraph)
SUBGRAPH_API_KEY=your_subgraph_key
```

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Start backend server
pnpm server
```

For detailed setup instructions, see **[doc/CONTRIBUTING.md](doc/CONTRIBUTING.md)**.

---

## � Documentation

### 🚀 Quick Links

- **[Tech Stack Guide](doc/STACK.md)** - Complete technology stack overview
- **[Component Library](doc/COMPONENTS.md)** - UI components reference
- **[Architecture Guide](doc/ARCHITECTURE.md)** - Project structure and patterns
- **[Contributing Guide](doc/CONTRIBUTING.md)** - How to contribute to the project

### 📖 Frontend Documentation

- **[Performance & Mobile](doc/frontend/01-PERFORMANCE_AND_MOBILE_OPTIMIZATION.md)** - Performance hooks and optimization
- **[Design System](doc/frontend/02-DESIGN_SYSTEM_AND_UI.md)** - Design tokens and UI patterns
- **[Architecture & Utils](doc/frontend/03-ARCHITECTURE_AND_UTILS.md)** - Utilities and helper functions

### 🤖 Backend & AI

- **[Chat & AI Services](doc/backend/CHAT_GEMINI_API.md)** - Nuxbee AI integration
- **[Local Server](doc/backend/LOCAL_SERVER.md)** - Backend development guide
- **[Subgraph System](doc/backend/SUBGRAPH_SYSTEM.md)** - The Graph integration

### 📝 Additional Resources

- **[Cache Optimization](doc/CACHE_OPTIMIZATION_SUMMARY.md)** - Caching strategies
- **[Skill NFT System](doc/SKILL_NFT_SYSTEM.md)** - Skill-based NFTs
- **[Issues Tracker](doc/ISSUES.md)** - Known issues and roadmap

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Read the [Contributing Guide](doc/CONTRIBUTING.md)** - Setup instructions and standards
2. **Browse [Open Issues](https://github.com/LennyDevX/nuxchain-app/issues)** - Find something to work on
3. **Fork the repository** - Create your own copy
4. **Create a branch** - `git checkout -b feature/your-feature`
5. **Make changes** - Follow our coding standards
6. **Test thoroughly** - Ensure everything works
7. **Submit a Pull Request** - Clear description and screenshots

### Development Standards

- ✅ **TypeScript** - All new code must be typed
- ✅ **ESLint & Prettier** - Code must pass linting
- ✅ **Functional Components** - Use React hooks
- ✅ **TailwindCSS** - Utility-first styling
- ✅ **Testing** - Test your changes across browsers
- ✅ **Documentation** - Update docs for new features

### Issue Categories

- 🎯 **NFT & Analytics** - Marketplace features
- 🤖 **AI & Chat** - AI integration
- 🎮 **Gaming** - Gamification features
- 📱 **Mobile** - Mobile development
- 🏛️ **Governance** - DAO features
- 🔗 **Smart Contracts** - Blockchain development
- 🌐 **Platform** - Infrastructure improvements
- 📚 **Documentation** - Documentation updates

See the [full roadmap](doc/ISSUES.md) for details.

---

## 🔐 Security

- 🛡️ **Smart Contracts** - Regular security audits
- 🔒 **Wallet Security** - Private keys never exposed
- 🔑 **API Security** - Rate limiting and CORS protection
- ✅ **Content Filtering** - Harmful content detection
- 🔄 **Regular Updates** - Security patches and monitoring

**Found a vulnerability?** Email: security@nuxchain.com

---

## 📞 Community & Support

- 🌐 **Website:** [nuxchain.com](https://nuxchain.com)
- 💬 **Discord:** [Join Community](https://discord.gg/nuxchain)
- 🐦 **Twitter:** [@nuxchain](https://twitter.com/nuxchain)
- 📧 **Email:** dev@nuxchain.com
- 💼 **GitHub:** [LennyDevX/nuxchain-app](https://github.com/LennyDevX/nuxchain-app)

---

##  License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ by the Nuxchain team and our contributors.

**Special Thanks:**
- Google Gemini AI team
- WalletConnect
- Ethereum Foundation
- Open source community

---

<div align="center">

**[⬆ Back to Top](#nuxchain-app---web3-dapp)**

Made with 💜 by [LennyDevX](https://github.com/LennyDevX)

</div>
