// Eliminada importación de embeddingsService para evitar dependencia circular

/**
 * Clean knowledge base with English content
 */
export const knowledgeBase = [
  // === GENERAL INFORMATION ===
  {
    content: "Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation. The platform includes Smart Staking contracts, NFT marketplace, AI-powered chat (Nuvim AI 1.0), and tokenization tools. Commands: 'Nuxchain', 'Nuxchain platform', 'Nuxchain general'.",
    metadata: { type: "general", category: "platform", topic: "overview" }
  },
  {
    content: "Nuxchain Vision: To develop innovative services and products using cutting-edge technologies like blockchain, AI, and dApps. Our mission is to bring the power of security and decentralization to the masses in all possible forms, driving a powerful economy guided by user sentiment and dedication. Commands: 'Nuxchain vision', 'Nuxchain mission', 'Nuxchain philosophy'.",
    metadata: { type: "general", category: "company", topic: "vision-mission" }
  },
  {
    content: "Nuxchain differentiates itself by not having a traditional token or cryptocurrency. Instead, we focus on NFTs 2.0 - digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. This approach creates sustainable value through utility rather than speculation, driving a powerful economy guided by user sentiment and dedication. The platform uses POL (Polygon's native token) for all transactions and gas fees. Commands: 'Nuxchain differentiation', 'Nuxchain no token', 'Nuxchain NFTs focus', 'Nuxchain user economy', 'Nuxchain POL'.",
    metadata: { type: "general", category: "strategy", topic: "differentiation" }
  },
  {
    content: "Nuxchain's economy is powered by user sentiment and dedication rather than traditional tokenomics. Our approach focuses on creating genuine value through user engagement, NFT utilities, and ecosystem participation. This sentiment-driven economy ensures that value creation is aligned with user satisfaction and long-term platform growth, avoiding speculative bubbles and focusing on sustainable development. Commands: 'Nuxchain economy', 'Nuxchain user sentiment', 'Nuxchain sustainable economy'.",
    metadata: { type: "general", category: "economy", topic: "sentiment-driven" }
  },
  {
    content: "Nuxchain uses Polygon and Ethereum as primary blockchain bases, avoiding fragmentation while developing innovations around these established blockchains. Built with advanced smart contracts using ReentrancyGuard, Pausable, AccessControl, ERC721, and ERC2981 standards for maximum security, transparency and decentralization in all operations. Commands: 'Nuxchain technology', 'Nuxchain blockchain', 'Nuxchain security', 'Nux-chain'.",
    metadata: { type: "general", category: "technology", topic: "blockchain" }
  },

  // === NUXCHAIN ECOSYSTEM ===
  {
    content: "Nuxchain Protocol is dedicated to smart contract innovation, serving as the foundation for all platform operations. It focuses on developing cutting-edge blockchain solutions and optimizing contract efficiency for better user experience and security. Commands: 'Nuxchain Protocol', 'Nuxchain smart contracts', 'Nuxchain innovation'.",
    metadata: { type: "ecosystem", category: "protocol", topic: "smart-contracts" }
  },
  {
    content: "Nux-AI is the AI hub and fundamental part of the Nuxchain core, where we develop AI-based tools and services to optimize user experience. This includes Nuvim AI 1.0 chatbot, AI-powered analytics, automated trading strategies, and intelligent contract interactions. The AI system learns from user behavior to provide personalized recommendations and enhanced platform functionality. Commands: 'Nux-AI', 'Nuxchain AI hub', 'Nuvim AI', 'Nuxchain artificial intelligence'.",
    metadata: { type: "ecosystem", category: "ai", topic: "hub" }
  },
  {
    content: "Nuxchain Labs is our R&D laboratory designed to attract talent, collaborate with exceptional teams, and develop innovative and experimental ideas in the Web3 ecosystem. The lab focuses on researching emerging technologies, testing new blockchain implementations, developing experimental features, and fostering partnerships with other innovative projects in the space. Commands: 'Nuxchain Labs', 'Nuxchain R&D', 'Nuxchain research', 'Nuxchain innovation lab'.",
    metadata: { type: "ecosystem", category: "labs", topic: "research" }
  },
  {
    content: "Nux-Vault is an advanced security system focused on tracking, investment strategies, and diversification, functioning as a treasury to manage platform resources. It implements sophisticated risk management protocols, automated portfolio rebalancing, multi-signature security, and strategic asset allocation to ensure platform sustainability and growth. The vault system protects user funds and optimizes returns through intelligent investment strategies. Commands: 'Nux-Vault', 'Nuxchain treasury', 'Nuxchain security system', 'Nuxchain vault'.",
    metadata: { type: "ecosystem", category: "vault", topic: "security-treasury" }
  },
  {
    content: "Nuvim AI 1.0 is the first stable version of the AI chat integrated into Nuxchain platform. It provides complete platform integration, allowing users to ask questions about staking, marketplace, NFTs, airdrops, and all platform features. The AI uses Gemini models and supports multimodal interactions including text and images. Commands: 'Nuvim AI', 'Nuxchain AI', 'Nuxchain chat'.",
    metadata: { type: "general", category: "ai", topic: "nuvim-ai" }
  },

  // === SMART STAKING CONTRACT ===
  {
    content: "Nuxchain SmartStaking contract allows users to deposit POL tokens and earn automatic rewards. Main functions include: deposit() for staking tokens, withdraw() for partial withdrawals, withdrawAll() for complete withdrawal, calculateRewards() for checking pending rewards, claimRewards() for claiming only rewards, compound() for reinvesting rewards, and emergencyWithdraw() for emergency situations. Commands: 'Nuxchain smart contract', 'Nuxchain SmartStaking', 'Nuxchain functions'.",
    metadata: { type: "smart-contract", category: "staking", topic: "overview" }
  },
  {
    content: "Nuxchain SmartStaking has deposit limits: minimum 5 POL and maximum 10000 POL per deposit. Maximum 300 deposits per user. Daily withdrawal limit is 1000 POL for security. The contract includes custom errors like AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable for better error handling. Commands: 'Nuxchain limits', 'Nuxchain deposit minimum', 'Nuxchain errors'.",
    metadata: { type: "smart-contract", category: "staking", topic: "limits" }
  },
  {
    content: "Nuxchain SmartStaking reward calculation: Uses base hourly ROI of 0.01% with lockup bonuses. Maximum ROI cap is 125%. Lockup periods offer enhanced rates: No lockup: 0.01% per hour (87.6% APY), 30 days: 0.012% per hour (105.1% APY), 90 days: 0.016% per hour (140.2% APY), 180 days: 0.02% per hour (175.2% APY), 365 days: 0.03% per hour (262.8% APY). Rewards are calculated in real-time and can be claimed or compounded at any time. Daily withdrawal limit is 1000 POL for security. Commands: 'Nuxchain rewards calculation', 'Nuxchain ROI', 'Nuxchain compound', 'Nuxchain lockup'.",
    metadata: { type: "smart-contract", category: "staking", topic: "rewards-calculation" }
  },

  // === STAKING INFORMATION ===
  {
    content: "Nuxchain staking allows depositing POL tokens in the SmartStaking contract to earn automatic rewards. Rewards are calculated based on time held and lockup period selected. Commands: 'Nuxchain staking', 'Nuxchain rewards'.",
    metadata: { type: "staking", category: "guide", topic: "basics" }
  },
  {
    content: "How to stake in Nuxchain: 1) Connect wallet with POL tokens, 2) Go to Staking section, 3) Enter amount (min 5 POL), 4) Select lockup period (0, 30, 90, 180, or 365 days), 5) Confirm transaction. Rewards calculated automatically based on your lockup period. Commands: 'Nuxchain how to stake'.",
    metadata: { type: "staking", category: "tutorial", topic: "how-to" }
  },
  {
    content: "Claiming rewards in Nuxchain: Use claimRewards() to withdraw only rewards or withdrawAll() to withdraw capital + rewards. Funds are locked during the lockup period. After lockup expires, you can withdraw anytime without penalties. Commands: 'Nuxchain claim rewards'.",
    metadata: { type: "staking", category: "tutorial", topic: "claiming" }
  },
  {
    content: "Nuxchain Lockup Periods Explained: When you stake POL tokens, you can choose a lockup period that determines your reward rate. No lockup (0 days): 0.01% per hour, withdraw anytime. 30 days lockup: 0.012% per hour, 20% higher rewards, funds locked for 30 days. 90 days lockup: 0.016% per hour, 60% higher rewards, funds locked for 90 days. 180 days lockup: 0.02% per hour, 100% higher rewards, funds locked for 180 days. 365 days lockup: 0.03% per hour, 200% higher rewards, funds locked for 365 days. The longer you lock your tokens, the higher your hourly rewards. All rewards are calculated and accumulated automatically every hour. Commands: 'Nuxchain lockup periods', 'Nuxchain staking periods', 'Nuxchain lock duration', 'Nuxchain lockup options'.",
    metadata: { type: "staking", category: "rewards", topic: "lockup-periods" }
  },
  {
    content: "Nuxchain APY tiers based on lockup periods: No lockup: 0.01% per hour (87.6% APY), 30 days lockup: 0.012% per hour (105.1% APY), 90 days lockup: 0.016% per hour (140.2% APY), 180 days lockup: 0.02% per hour (175.2% APY), 365 days lockup: 0.03% per hour (262.8% APY). Maximum ROI cap of 125% applies to all deposits. Commission rate is 6% on rewards. Daily withdrawal limit is 1000 POL. Commands: 'Nuxchain APY', 'Nuxchain rates', 'Nuxchain lockup rates'.",
    metadata: { type: "staking", category: "rewards", topic: "apy-tiers" }
  },
  {
    content: "Compound feature in Nuxchain SmartStaking: The compound() function allows you to reinvest your accumulated rewards back into staking without withdrawing. When you compound, your rewards are automatically converted into a new deposit, and you can choose a new lockup period for the compounded amount. This creates a powerful compounding effect: your original deposit continues earning at its rate, while your rewards start earning additional rewards. Example: If you have 100 POL staked with 10 POL in rewards, compounding creates a new 10 POL deposit, so you'll now be earning rewards on 110 POL total. You can compound as often as you like, and each compounded amount can have its own lockup period. Commands: 'Nuxchain compound', 'Nuxchain compounding', 'Nuxchain reinvest rewards'.",
    metadata: { type: "staking", category: "advanced", topic: "compounding" }
  },
  {
    content: "Staking risks in Nuxchain: Smart contract risk (mitigated by audits), lockup period restrictions (funds locked for chosen duration), market volatility of POL token. Platform has emergency functions for security. During lockup period, you cannot withdraw your principal amount until the period expires. Commands: 'Nuxchain risks'.",
    metadata: { type: "staking", category: "guide", topic: "risks" }
  },

  // === MARKETPLACE ===
  {
    content: "Nuxchain NFT marketplace allows users to buy, sell and trade NFTs using POL tokens. Supports ERC-721 tokens with metadata display, filtering options, and advanced search. Features include: listing NFTs for sale, purchasing NFTs with POL tokens, viewing detailed NFT information with rarity and traits, marketplace statistics and analytics, collection browsing, and price history tracking. The marketplace integrates with Alchemy and Moralis APIs for comprehensive NFT data. Commands: 'Nuxchain marketplace', 'Nuxchain NFT', 'Nuxchain buy NFT', 'Nuxchain sell NFT'.",
    metadata: { type: "marketplace", category: "nft", topic: "overview" }
  },
  {
    content: "Nuxchain marketplace features advanced filtering and search capabilities. Users can filter NFTs by: collection, price range, rarity, traits/attributes, listing status (for sale, sold, not listed), and creation date. The marketplace dashboard shows real-time statistics including total volume, floor prices, trending collections, and recent sales. Caching system ensures fast loading of NFT metadata and images. Commands: 'Nuxchain marketplace filters', 'Nuxchain NFT search', 'Nuxchain marketplace stats'.",
    metadata: { type: "marketplace", category: "nft", topic: "features" }
  },
  {
    content: "Nuxchain marketplace roadmap includes exciting updates: NFT Marketplace Preview in June 2025, and Marketplace Contracts v2.0 in July 2025 with enhanced features like auction systems, royalty management, and cross-chain compatibility. The marketplace will support multiple blockchain networks and advanced trading mechanisms. Commands: 'Nuxchain marketplace roadmap', 'Nuxchain marketplace v2', 'Nuxchain marketplace future'.",
    metadata: { type: "marketplace", category: "nft", topic: "roadmap" }

  },
  {
    content: "Nuxchain marketplace offers system includes: createOffer(), acceptOffer(), rejectOffer(), cancelOffer(). Offers have expiration date and require POL deposit. Commands: 'Nuxchain marketplace', 'Nuxchain offers'.",
    metadata: { type: "marketplace", category: "offers", topic: "system" }
  },

  // === NFT INFORMATION ===
  {
    content: "Nuxchain NFTs 2.0 represent a revolutionary approach to digital art and utility. Unlike traditional NFTs, our NFTs 2.0 create an exclusive ecosystem that avoids FOMO and liquidity exit losses, increasing perceived value through real utilities. They serve as digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. All NFT transactions use POL as the payment and gas token. Commands: 'Nuxchain NFTs 2.0', 'Nuxchain digital art', 'Nuxchain NFT ecosystem'.",
    metadata: { type: "nft", category: "concept", topic: "nfts-2.0" }
  },
  {
    content: "NFT utility in Nuxchain includes: Governance voting rights, staking bonuses (enhanced APY for NFT holders), exclusive access to features, marketplace fee discounts, participation in special airdrops, gamification rewards, and cross-platform benefits. NFT holders may receive enhanced staking rates on their POL deposits, reduced marketplace fees, and priority access to new features. These utilities make NFTs functional assets rather than just collectibles, providing ongoing value to holders and creating a sustainable ecosystem. Commands: 'Nuxchain NFT', 'Nuxchain NFT utility', 'Nuxchain NFT benefits'.",
    metadata: { type: "nft", category: "utility", topic: "benefits" }
  },

  // === AIRDROPS ===
  {
    content: "Nuxchain airdrops reward early adopters and active users with POL tokens and exclusive NFTs. Eligibility based on wallet activity, staking participation, platform engagement, and holding specific NFTs. Current upcoming airdrops include: POL Token rewards for early platform users with enhanced staking rewards, and Governance NFT airdrop for active community members with voting rights and exclusive access. Registration is required through the Airdrops Dashboard. Commands: 'Nuxchain airdrop', 'Nuxchain rewards', 'Nuxchain POL airdrop', 'Nuxchain governance NFT'.",
    metadata: { type: "airdrop", category: "rewards", topic: "eligibility" }
  },
  {
    content: "Nuxchain airdrop system includes multiple distribution mechanisms: automatic airdrops for eligible users, manual claim processes through the dashboard, and time-limited campaigns. The Airdrop contract handles secure token distribution with functions like claimAirdrop(), checkEligibility(), and getAirdropInfo(). Users can track their airdrop history and upcoming eligibility through their profile dashboard. Commands: 'Nuxchain airdrop claim', 'Nuxchain airdrop contract', 'Nuxchain airdrop history'.",
    metadata: { type: "airdrop", category: "system", topic: "distribution" }
  },
  {
    content: "To participate in Nuxchain airdrops: 1) Keep POL in staking, 2) Participate in community, 3) Own Nuxchain NFTs, 4) Keep wallet connected during snapshots. Commands: 'Nuxchain participate airdrop'.",
    metadata: { type: "airdrop", category: "tutorial", topic: "participation" }
  },
  {
    content: "Nuxchain airdrops are announced on Discord, Twitter and the platform. Snapshots are taken on specific dates and tokens are distributed automatically. Commands: 'Nuxchain airdrop announcements'.",
    metadata: { type: "airdrop", category: "process", topic: "distribution" }
  },

  // === TOKENIZATION TOOLS ===
  {
    content: "Nuxchain provides comprehensive tokenization tools for creating and managing digital assets. Features include: ERC-20 token creation with customizable parameters, ERC-721 NFT minting with metadata management, batch minting capabilities, royalty settings for creators, and whitelist management for exclusive launches. The tokenization section offers step-by-step guides and templates for different token types. Integration with IPFS for decentralized metadata storage. All tokenization transactions require POL for gas fees. Commands: 'Nuxchain tokenization', 'Nuxchain create token', 'Nuxchain mint NFT', 'Nuxchain whitelist'.",
    metadata: { type: "tokenization", category: "tools", topic: "overview" }
  },
  {
    content: "Nuxchain roadmap spans from 2024 to 2025 with major milestones: Foundation Phase (Q1 2024) - Smart Staking Contract v1 deployment, Development Phase (Q2-Q3 2024) - Alpha v1.0 Platform Release, Launch Phase (Q4 2024) - Beta Platform Launch, Initial Phase (Q1 2025) - Smart Staking 1.0 launch, Innovation Phase (Q2 2025) - NFT Dashboard and Gemini AI Chatbot integration. Future plans include marketplace v2.0, governance token launch, and cross-chain expansion. Commands: 'Nuxchain roadmap', 'Nuxchain timeline', 'Nuxchain future plans'.",
    metadata: { type: "general", category: "roadmap", topic: "timeline" }
  },

  // === TECHNICAL INFORMATION ===
  {
    content: "Nuxchain platform supports wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Make sure to have POL tokens for gas fees in all transactions. The platform operates on Polygon network (Chain ID: 137) and uses POL as the native gas token. All staking deposits, marketplace purchases, and contract interactions require POL. The platform uses secure RPC endpoints and implements best practices for wallet security including transaction signing and approval flows. ENS (Ethereum Name Service) is supported for user-friendly addresses. Commands: 'Nuxchain wallets', 'Nuxchain ENS', 'Nuxchain POL'.",
    metadata: { type: "technical", category: "wallets", topic: "compatibility" }
  },
  {
    content: "Gas fees in Nuxchain are paid in POL on Polygon network with average transaction costs under $0.01. Fees vary according to network congestion: ~1-30 gwei for normal transactions. The platform implements gas optimization techniques including batch transactions and efficient contract calls. Use tools like Polygon Gas Station to monitor current rates. Emergency functions may have higher gas costs due to additional security checks. Always ensure you have sufficient POL in your wallet for gas fees before attempting any transaction. Commands: 'Nuxchain gas fees', 'Nuxchain gas optimization', 'Nuxchain POL gas'.",
    metadata: { type: "technical", category: "transactions", topic: "gas-fees" }
  },
  {
    content: "Nuxchain uses smart contracts on Polygon with the following features: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 for maximum security. Commands: 'Nuxchain technical'.",
    metadata: { type: "technical", category: "security", topic: "smart-contracts" }
  },
  {
    content: "Nuxchain contracts are verified on Polygonscan for full transparency. SmartStaking handles deposits/withdrawals with automatic reward calculations, Marketplace handles NFT trading with offer systems. Both contracts include emergency functions and are protected with ReentrancyGuard, Pausable, and AccessControl patterns. Contract addresses and ABIs are publicly available for developers. Commands: 'Nuxchain Polygonscan', 'Nuxchain contract addresses', 'Nuxchain ABI'.",
    metadata: { type: "technical", category: "contracts", topic: "verification" }
  },
  {
    content: "Nuxchain integrates with multiple external APIs and services: Alchemy API for comprehensive NFT data and metadata, Moralis API for blockchain analytics, IPFS for decentralized storage of NFT metadata and images, Google Gemini AI for intelligent chat responses, and Polygon Gas Station for real-time gas price optimization. The platform uses caching mechanisms to ensure fast response times and reduce API costs. Commands: 'Nuxchain APIs', 'Nuxchain integrations', 'Nuxchain IPFS', 'Nuxchain Alchemy'.",
    metadata: { type: "technical", category: "integrations", topic: "external-apis" }
  },

  // === FAQ ===
  {
    content: "FAQ - Staking Rewards: Rewards are calculated automatically based on your staking amount, duration, and lockup period. Check your dashboard for real-time calculations. Rewards can be claimed after lockup period expires. APY varies by lockup tier: no lockup (87.6%), 30 days (105.1%), 90 days (140.2%), 180 days (175.2%), 365 days (262.8%). Compound rewards regularly for maximum returns by reinvesting your rewards into new deposits. During lockup period, you cannot withdraw principal but rewards continue to accumulate. Emergency withdrawal available when contract is paused. Commands: 'Nuxchain staking rewards', 'Nuxchain APY calculation', 'Nuxchain compound rewards'.",
    metadata: { type: "faq", category: "staking", topic: "rewards" }
  },
  {
    content: "FAQ - POL Token: POL is Polygon's native token used for all transactions on Nuxchain. You need POL for: gas fees on all transactions, staking deposits to earn rewards, purchasing NFTs in the marketplace, paying marketplace fees. You can acquire POL from exchanges like Binance, Coinbase, or KuCoin, then bridge it to Polygon network. Always keep some POL in your wallet for gas fees. Minimum staking amount is 5 POL, maximum is 10,000 POL per deposit. Commands: 'Nuxchain POL', 'Nuxchain Polygon token', 'What is POL', 'How to get POL'.",
    metadata: { type: "faq", category: "token", topic: "pol-usage" }
  },
  {
    content: "FAQ - NFT Trading: To trade NFTs, connect your wallet and browse the marketplace. All NFT prices are listed in POL. You can buy instantly or make offers. Sellers can accept, reject, or counter offers. All transactions are secured by smart contracts and require POL for gas fees. Check NFT history and authenticity before purchasing. Use filters to find specific collections or price ranges. Marketplace fee is 2.5% paid in POL. Commands: 'Nuxchain NFT trading', 'Nuxchain marketplace help', 'Nuxchain NFT offers'.",
    metadata: { type: "faq", category: "nft", topic: "trading" }
  },
  {
    content: "Can I cancel an offer in Nuxchain marketplace? Yes, you can cancel offers you've made using cancelOffer(). The deposited POL is automatically returned. Commands: 'Nuxchain cancel offer'.",
    metadata: { type: "faq", category: "marketplace", topic: "offers" }
  },
  {
    content: "How long does it take to receive staking rewards in Nuxchain? Rewards are calculated in real-time and available for withdrawal immediately after deposit. Commands: 'Nuxchain FAQ rewards timing'.",
    metadata: { type: "faq", category: "staking", topic: "timing" }
  },
  {
    content: "Can I unstake at any time in Nuxchain? Yes, you can withdraw your funds and rewards at any time without penalties using withdraw() or withdrawAll(). Commands: 'Nuxchain unstake'.",
    metadata: { type: "faq", category: "staking", topic: "unstaking" }
  },
  {
    content: "How do royalties work in Nuxchain marketplace? Royalties (max 10%) are automatically paid to the original creator on each secondary sale of the NFT. Commands: 'Nuxchain royalties'.",
    metadata: { type: "faq", category: "marketplace", topic: "royalties" }
  },
  {
    content: "Are there limits in Nuxchain marketplace? Yes: maximum 50 NFTs per batch mint, configurable minimum price, maximum 10% royalty, and gas limits per transaction. Commands: 'Nuxchain marketplace limits'.",
    metadata: { type: "faq", category: "marketplace", topic: "limits" }
  },

  // === TOKENIZATION ===
  {
    content: "Asset tokenization in Nuxchain: The platform allows tokenizing real-world assets like real estate, art, commodities. Each token represents a fraction of the underlying asset. All tokenization transactions use POL for gas fees. Commands: 'Nuxchain tokenization'.",
    metadata: { type: "tokenization", category: "assets", topic: "real-world-assets" }
  },
  {
    content: "NFT fractionalization in Nuxchain: High-value NFTs can be fractionalized into multiple ERC-20 tokens, enabling shared ownership and greater liquidity. Transactions require POL for gas fees. Commands: 'Nuxchain fractionalization'.",
    metadata: { type: "tokenization", category: "nft", topic: "fractionalization" }
  },

  // === SECURITY ===
  {
    content: "Security audits in Nuxchain: All contracts have been audited by recognized firms. Reports available in official documentation. / Auditorías de seguridad en Nuxchain: Todos los contratos han sido auditados por firmas reconocidas. Reportes disponibles en la documentación oficial. Commands: 'Nuxchain audits'.",
    metadata: { type: "security", category: "audits", topic: "smart-contract-security" }
  },
  {
    content: "Security best practices in Nuxchain: Use hardware wallets, verify contract addresses, don't share private keys, keep software updated. / Mejores prácticas de seguridad en Nuxchain: Usa wallets hardware, verifica direcciones de contratos, no compartas claves privadas, mantén software actualizado. Commands: 'Nuxchain security best practices'.",
    metadata: { type: "security", category: "best-practices", topic: "user-security" }
  },
  {
    content: "MEV protection in Nuxchain: We implement protections against Maximum Extractable Value to protect users from front-running and sandwich attacks. / Protección contra MEV en Nuxchain: Implementamos protecciones contra Maximum Extractable Value para proteger a los usuarios de front-running y sandwich attacks. Commands: 'Nuxchain MEV protection'.",
    metadata: { type: "security", category: "mev-protection", topic: "transaction-security" }
  },

  // === ROADMAP ===
  {
    content: "Q1 2024 Nuxchain: Launch of Smart Staking v2.0, integration with more wallets, marketplace UI/UX improvements. / Q1 2024 Nuxchain: Lanzamiento de Smart Staking v2.0, integración con más wallets, mejoras en UI/UX del marketplace. Commands: 'Nuxchain roadmap Q1 2024'.",
    metadata: { type: "roadmap", category: "q1-2024", topic: "upcoming-features" }
  },
  {
    content: "Q2 2024 Nuxchain: Implementation of decentralized governance, mobile app launch, Layer 2 solutions integration. / Q2 2024 Nuxchain: Implementación de governance descentralizada, lanzamiento de mobile app, integración con Layer 2 solutions. Commands: 'Nuxchain roadmap Q2 2024'.",
    metadata: { type: "roadmap", category: "q2-2024", topic: "governance-mobile" }
  },
  {
    content: "Q3-Q4 2024 Nuxchain: Multi-chain expansion, strategic partnerships, advanced DeFi functionalities, real asset tokenization. / Q3-Q4 2024 Nuxchain: Expansión multi-chain, partnerships estratégicos, funcionalidades avanzadas de DeFi, tokenización de activos reales. Commands: 'Nuxchain roadmap H2 2024'.",
    metadata: { type: "roadmap", category: "h2-2024", topic: "expansion-defi" }
  },

  // === ADVANCED USE CASES ===
  {
    content: "Advanced Nuxchain strategies: 1) Portfolio diversification - combine staking, NFT investments, and airdrop participation, 2) Yield optimization - time compound operations with gas costs, 3) NFT flipping - use marketplace analytics to identify undervalued assets, 4) Community engagement - participate in governance discussions for future airdrops, 5) Cross-platform integration - use APIs for external portfolio tracking. / Estrategias avanzadas de Nuxchain: 1) Diversificación de portafolio - combina staking, inversiones en NFTs, y participación en airdrops, 2) Optimización de rendimiento - programa operaciones compound con costos de gas, 3) Trading de NFTs - usa análisis del marketplace para identificar activos subvalorados, 4) Participación comunitaria - participa en discusiones de gobernanza para futuros airdrops, 5) Integración entre plataformas - usa APIs para seguimiento externo de portafolio. Commands: 'Nuxchain advanced strategies', 'Nuxchain portfolio optimization'.",
    metadata: { type: "advanced", category: "strategies", topic: "optimization" }
  },
  {
    content: "Nuxchain developer resources: Smart contract ABIs available for SmartStaking.json, Marketplace.json, and Airdrop.json. Integration examples include Web3 connection, transaction handling, event listening, and error management. The platform supports custom dApp integrations and provides comprehensive documentation for developers building on top of Nuxchain infrastructure. / Recursos para desarrolladores de Nuxchain: ABIs de contratos inteligentes disponibles para SmartStaking.json, Marketplace.json, y Airdrop.json. Ejemplos de integración incluyen conexión Web3, manejo de transacciones, escucha de eventos, y gestión de errores. La plataforma soporta integraciones de dApps personalizadas y proporciona documentación completa para desarrolladores construyendo sobre la infraestructura de Nuxchain. Commands: 'Nuxchain developers', 'Nuxchain API documentation', 'Nuxchain integration'.",
    metadata: { type: "developer", category: "resources", topic: "integration" }
  },

  // === ARQUITECTURA TÉCNICA ===
  {
    content: "Nuxchain App está construida con tecnologías modernas: React 18 para la interfaz de usuario con hooks avanzados y concurrent features, Vite 7 como build tool para desarrollo rápido y hot module replacement, TypeScript para tipado estático y mejor experiencia de desarrollo, TailwindCSS para estilos utilitarios y diseño responsive, Wagmi v2 para hooks de React optimizados para Ethereum, Viem v2 como biblioteca TypeScript para interacciones blockchain, y TanStack Query para gestión de estado del servidor y caché. / Nuxchain App is built with modern technologies: React 18 for user interface with advanced hooks and concurrent features, Vite 7 as build tool for fast development and hot module replacement, TypeScript for static typing and better developer experience, TailwindCSS for utility styles and responsive design, Wagmi v2 for optimized React hooks for Ethereum, Viem v2 as TypeScript library for blockchain interactions, and TanStack Query for server state management and caching. Commands: 'Nuxchain architecture', 'Nuxchain tech stack', 'Nuxchain React', 'Nuxchain Vite'.",
    metadata: { type: "technical", category: "architecture", topic: "tech-stack" }
  },
  {
    content: "Estructura del proyecto Nuxchain: Frontend en React con páginas principales (Home, Staking, Marketplace, NFTs, Airdrops, Chat, Tokenization), componentes organizados por funcionalidad, hooks personalizados para lógica reutilizable, servicios para APIs y blockchain, configuración centralizada, y sistema de routing con React Router. Backend con Express.js, servicios de embeddings, web scraping, y controladores para Gemini AI. Deployment en Vercel con serverless functions. / Nuxchain project structure: React frontend with main pages (Home, Staking, Marketplace, NFTs, Airdrops, Chat, Tokenization), components organized by functionality, custom hooks for reusable logic, services for APIs and blockchain, centralized configuration, and routing system with React Router. Backend with Express.js, embedding services, web scraping, and Gemini AI controllers. Deployment on Vercel with serverless functions. Commands: 'Nuxchain project structure', 'Nuxchain frontend', 'Nuxchain backend'.",
    metadata: { type: "technical", category: "architecture", topic: "project-structure" }
  },
  {
    content: "Configuración de desarrollo en Nuxchain: Scripts npm para desarrollo (dev, dev:server, dev:full con concurrently), build para producción, linting con ESLint, preview para testing local. Variables de entorno para diferentes ambientes (desarrollo vs producción), configuración automática de APIs según el entorno, soporte para localhost y dominios de producción. Hot reload y fast refresh habilitados para desarrollo eficiente. / Nuxchain development configuration: npm scripts for development (dev, dev:server, dev:full with concurrently), build for production, linting with ESLint, preview for local testing. Environment variables for different environments (development vs production), automatic API configuration based on environment, support for localhost and production domains. Hot reload and fast refresh enabled for efficient development. Commands: 'Nuxchain development', 'Nuxchain npm scripts', 'Nuxchain environment'.",
    metadata: { type: "technical", category: "development", topic: "configuration" }
  },

  // === FUNCIONALIDADES DE PÁGINAS ===
  {
    content: "Página Home de Nuxchain: Sección hero con introducción a la plataforma, sección de IA destacando Nuvim AI 1.0, información sobre staking con estadísticas en tiempo real, preview del marketplace NFT, sección de airdrops con próximos eventos, información de tokenización, sección de beneficios del ecosistema, y footer con enlaces importantes. Diseño responsive y optimizado para conversión. / Nuxchain Home page: Hero section with platform introduction, AI section highlighting Nuvim AI 1.0, staking information with real-time statistics, NFT marketplace preview, airdrops section with upcoming events, tokenization information, ecosystem benefits section, and footer with important links. Responsive design optimized for conversion. Commands: 'Nuxchain home page', 'Nuxchain landing'.",
    metadata: { type: "technical", category: "pages", topic: "home" }
  },
  {
    content: "Página de Staking en Nuxchain: Formulario de staking con validación en tiempo real, información del pool con APY actual, estadísticas de usuario (balance, rewards, deposits), información del contrato con direcciones verificadas, carousel informativo sobre beneficios, bonds de staking para diferentes períodos, y dashboard de gestión de posiciones. Integración completa con SmartStaking contract. / Nuxchain Staking page: Staking form with real-time validation, pool information with current APY, user statistics (balance, rewards, deposits), contract information with verified addresses, informative carousel about benefits, staking bonds for different periods, and position management dashboard. Complete integration with SmartStaking contract. Commands: 'Nuxchain staking page', 'Nuxchain staking interface'.",
    metadata: { type: "technical", category: "pages", topic: "staking" }
  },
  {
    content: "Página de Marketplace en Nuxchain: Grid de NFTs con scroll infinito, filtros avanzados por colección/precio/rareza, estadísticas del marketplace en tiempo real, modal de compra con confirmación, sistema de ofertas, integración con Alchemy y Moralis APIs, caché optimizado para metadatos, y soporte para múltiples formatos de NFT. Diseño optimizado para navegación y descubrimiento. / Nuxchain Marketplace page: NFT grid with infinite scroll, advanced filters by collection/price/rarity, real-time marketplace statistics, purchase modal with confirmation, offer system, integration with Alchemy and Moralis APIs, optimized cache for metadata, and support for multiple NFT formats. Design optimized for navigation and discovery. Commands: 'Nuxchain marketplace page', 'Nuxchain NFT marketplace'.",
    metadata: { type: "technical", category: "pages", topic: "marketplace" }
  },
  {
    content: "Página de Chat con Nuvim AI: Interfaz de chat en tiempo real con streaming, soporte multimodal (texto e imágenes), procesamiento automático de URLs con web scraping, sistema de embeddings para contexto persistente, welcome screen con sugerencias, área de input con autocompletado, y integración completa con Google Gemini AI. Optimizado para respuestas rápidas y contexto relevante. / Nuxchain Chat page with Nuvim AI: Real-time chat interface with streaming, multimodal support (text and images), automatic URL processing with web scraping, embedding system for persistent context, welcome screen with suggestions, input area with autocomplete, and complete integration with Google Gemini AI. Optimized for fast responses and relevant context. Commands: 'Nuxchain chat page', 'Nuxchain Nuvim AI interface'.",
    metadata: { type: "technical", category: "pages", topic: "chat" }
  },
  {
    content: "Página de NFTs en Nuxchain: Grid infinito de NFTs del usuario, filtros por colección y estado, estadísticas personales de NFTs, modal de listing para venta, gestión de ofertas recibidas, historial de transacciones, y integración con wallet para mostrar NFTs owned. Diseño optimizado para gestión de colecciones personales. / Nuxchain NFTs page: Infinite grid of user's NFTs, filters by collection and status, personal NFT statistics, listing modal for sale, management of received offers, transaction history, and wallet integration to show owned NFTs. Design optimized for personal collection management. Commands: 'Nuxchain NFTs page', 'Nuxchain my NFTs'.",
    metadata: { type: "technical", category: "pages", topic: "nfts" }
  },
  {
    content: "Página de Airdrops en Nuxchain: Dashboard de airdrops disponibles, formulario de participación, estadísticas de airdrops, contador de tiempo para próximos eventos, historial de participación, verificación de elegibilidad automática, y sistema de notificaciones. Integración con contratos de airdrop para distribución automática. / Nuxchain Airdrops page: Available airdrops dashboard, participation form, airdrop statistics, time counter for upcoming events, participation history, automatic eligibility verification, and notification system. Integration with airdrop contracts for automatic distribution. Commands: 'Nuxchain airdrops page', 'Nuxchain airdrop dashboard'.",
    metadata: { type: "technical", category: "pages", topic: "airdrops" }
  },
  {
    content: "Página de Tokenización en Nuxchain: Herramientas para crear tokens ERC-20 y NFTs ERC-721, upload de archivos a IPFS, configuración de metadatos, gestión de royalties, whitelist management, batch minting, indicador de progreso, detalles técnicos de tokens, FAQ sobre tokenización, y beneficios del proceso. Interfaz step-by-step para facilitar la creación. / Nuxchain Tokenization page: Tools to create ERC-20 tokens and ERC-721 NFTs, file upload to IPFS, metadata configuration, royalty management, whitelist management, batch minting, progress indicator, technical token details, tokenization FAQ, and process benefits. Step-by-step interface to facilitate creation. Commands: 'Nuxchain tokenization page', 'Nuxchain create tokens'.",
    metadata: { type: "technical", category: "pages", topic: "tokenization" }
  },

  // === INTEGRACIONES EXTERNAS ===
  {
    content: "Integración con Alchemy API en Nuxchain: Obtención de metadatos completos de NFTs, información de colecciones, historial de transacciones, verificación de ownership, datos de rareza y traits, y sincronización en tiempo real con blockchain. Caché optimizado para reducir llamadas API y mejorar rendimiento. Soporte para múltiples redes blockchain. / Nuxchain Alchemy API integration: Complete NFT metadata retrieval, collection information, transaction history, ownership verification, rarity and traits data, and real-time blockchain synchronization. Optimized cache to reduce API calls and improve performance. Support for multiple blockchain networks. Commands: 'Nuxchain Alchemy integration', 'Nuxchain NFT metadata'.",
    metadata: { type: "technical", category: "integrations", topic: "alchemy" }
  },
  {
    content: "Integración con Moralis API en Nuxchain: Analytics avanzados de blockchain, tracking de portfolios, datos de precios en tiempo real, estadísticas de mercado, información de liquidez, y métricas de DeFi. Utilizado para dashboard analytics y reportes de rendimiento del ecosistema. / Nuxchain Moralis API integration: Advanced blockchain analytics, portfolio tracking, real-time price data, market statistics, liquidity information, and DeFi metrics. Used for analytics dashboard and ecosystem performance reports. Commands: 'Nuxchain Moralis integration', 'Nuxchain analytics'.",
    metadata: { type: "technical", category: "integrations", topic: "moralis" }
  },
  {
    content: "Integración con IPFS en Nuxchain: Almacenamiento descentralizado de metadatos de NFTs, imágenes y archivos multimedia, pinning automático para disponibilidad permanente, gestión de hashes IPFS, y optimización de carga de contenido. Utilizado en tokenización y marketplace para garantizar descentralización completa. / Nuxchain IPFS integration: Decentralized storage of NFT metadata, images and multimedia files, automatic pinning for permanent availability, IPFS hash management, and content loading optimization. Used in tokenization and marketplace to ensure complete decentralization. Commands: 'Nuxchain IPFS', 'Nuxchain decentralized storage'.",
    metadata: { type: "technical", category: "integrations", topic: "ipfs" }
  },
  {
    content: "Integración con Google Gemini AI en Nuxchain: Procesamiento de lenguaje natural para Nuvim AI 1.0, análisis de contenido web, generación de respuestas contextuales, soporte multimodal para texto e imágenes, streaming de respuestas en tiempo real, y sistema de embeddings para memoria persistente. Optimizado para respuestas rápidas y precisas sobre el ecosistema Nuxchain. / Nuxchain Google Gemini AI integration: Natural language processing for Nuvim AI 1.0, web content analysis, contextual response generation, multimodal support for text and images, real-time response streaming, and embedding system for persistent memory. Optimized for fast and accurate responses about the Nuxchain ecosystem. Commands: 'Nuxchain Gemini AI', 'Nuxchain AI integration'.",
    metadata: { type: "technical", category: "integrations", topic: "gemini-ai" }
  },

  // === AUTENTICACIÓN WEB3 ===
  {
    content: "Sistema de Autenticación Web3 en Nuxchain: Integración con Wagmi y Viem para conexión de wallets, soporte para MetaMask, WalletConnect, Coinbase Wallet, y Rainbow Wallet, gestión de sesiones persistentes, verificación de firmas digitales, y manejo de múltiples redes blockchain. Incluye hooks personalizados para estado de conexión y switching de redes automático. / Nuxchain Web3 Authentication System: Integration with Wagmi and Viem for wallet connection, support for MetaMask, WalletConnect, Coinbase Wallet, and Rainbow Wallet, persistent session management, digital signature verification, and multi-blockchain network handling. Includes custom hooks for connection state and automatic network switching. Commands: 'Nuxchain wallet connection', 'Nuxchain Web3 auth'.",
    metadata: { type: "technical", category: "authentication", topic: "web3" }
  },
  {
    content: "Wallets Soportadas en Nuxchain: MetaMask (wallet principal recomendada), WalletConnect (para wallets móviles), Coinbase Wallet (integración nativa), Rainbow Wallet (soporte completo), y compatibilidad con cualquier wallet que implemente EIP-1193. Detección automática de wallets instaladas, fallback a WalletConnect para wallets no detectadas, y gestión de errores de conexión. / Supported Wallets in Nuxchain: MetaMask (main recommended wallet), WalletConnect (for mobile wallets), Coinbase Wallet (native integration), Rainbow Wallet (full support), and compatibility with any wallet implementing EIP-1193. Automatic detection of installed wallets, fallback to WalletConnect for undetected wallets, and connection error handling. Commands: 'Nuxchain supported wallets', 'Nuxchain wallet compatibility'.",
    metadata: { type: "technical", category: "authentication", topic: "wallets" }
  },

  // === DESARROLLO Y CONFIGURACIÓN ===
  {
    content: "Guía de Desarrollo Local en Nuxchain: Instalación con 'npm install', desarrollo con 'npm run dev' (frontend) y 'npm run dev:full' (fullstack), configuración de variables de entorno (.env.local), setup de base de datos local, configuración de APIs externas (Alchemy, Moralis), y testing con 'npm test'. Incluye hot reload, debugging tools, y desarrollo con mock data. / Nuxchain Local Development Guide: Installation with 'npm install', development with 'npm run dev' (frontend) and 'npm run dev:full' (fullstack), environment variables configuration (.env.local), local database setup, external APIs configuration (Alchemy, Moralis), and testing with 'npm test'. Includes hot reload, debugging tools, and development with mock data. Commands: 'Nuxchain local development', 'Nuxchain dev setup'.",
    metadata: { type: "developer", category: "development", topic: "local-setup" }
  },
  {
    content: "Configuración de Entorno en Nuxchain: Variables de entorno para desarrollo (.env.local) y producción (.env), configuración de APIs (ALCHEMY_API_KEY, MORALIS_API_KEY, GOOGLE_AI_API_KEY), URLs de endpoints según entorno, configuración de base de datos, y secrets de autenticación. Detección automática de entorno (localhost vs Vercel), y fallbacks para desarrollo sin APIs externas. / Nuxchain Environment Configuration: Environment variables for development (.env.local) and production (.env), API configuration (ALCHEMY_API_KEY, MORALIS_API_KEY, GOOGLE_AI_API_KEY), endpoint URLs by environment, database configuration, and authentication secrets. Automatic environment detection (localhost vs Vercel), and fallbacks for development without external APIs. Commands: 'Nuxchain environment config', 'Nuxchain env variables'.",
    metadata: { type: "developer", category: "development", topic: "environment" }
  },
  {
    content: "Scripts de Build y Deploy en Nuxchain: 'npm run build' para build de producción, 'npm run preview' para preview local del build, 'npm run lint' para linting del código, 'npm run type-check' para verificación de TypeScript, y deploy automático en Vercel con GitHub integration. Optimizaciones de bundle, tree shaking, y code splitting automático para mejor performance. / Nuxchain Build and Deploy Scripts: 'npm run build' for production build, 'npm run preview' for local build preview, 'npm run lint' for code linting, 'npm run type-check' for TypeScript verification, and automatic deploy on Vercel with GitHub integration. Bundle optimizations, tree shaking, and automatic code splitting for better performance. Commands: 'Nuxchain build process', 'Nuxchain deploy'.",
    metadata: { type: "developer", category: "development", topic: "build-deploy" }
  },

  {
    content: "Deployment en Vercel para Nuxchain: Configuración automática con GitHub integration, variables de entorno en dashboard de Vercel, build commands optimizados, edge functions para APIs, y CDN global para assets estáticos. Incluye preview deployments para pull requests, rollback automático en caso de errores, y monitoring de performance en tiempo real. / Vercel Deployment for Nuxchain: Automatic configuration with GitHub integration, environment variables in Vercel dashboard, optimized build commands, edge functions for APIs, and global CDN for static assets. Includes preview deployments for pull requests, automatic rollback on errors, and real-time performance monitoring. Commands: 'Nuxchain Vercel deployment', 'Nuxchain production deploy'.",
    metadata: { type: "developer", category: "deployment", topic: "vercel" }
  },

  // === COMPONENTES AVANZADOS Y FUNCIONALIDADES ===
  {
    content: "Layout y Navegación en Nuxchain: Sidebar responsive con navegación principal, header con conexión de wallet y perfil de usuario, footer con links importantes, y navegación móvil optimizada. Incluye breadcrumbs, indicadores de página activa, y transiciones suaves entre secciones. Soporte para modo oscuro y personalización de tema. / Nuxchain Layout and Navigation: Responsive sidebar with main navigation, header with wallet connection and user profile, footer with important links, and optimized mobile navigation. Includes breadcrumbs, active page indicators, and smooth transitions between sections. Support for dark mode and theme customization. Commands: 'Nuxchain layout', 'Nuxchain navigation'.",
    metadata: { type: "technical", category: "components", topic: "layout" }
  },
  {
    content: "Integración con Firebase en Nuxchain: Autenticación de usuarios, base de datos Firestore para datos de usuario, storage para archivos e imágenes, analytics para tracking de eventos, y hosting para assets estáticos. Incluye reglas de seguridad, backup automático, y sincronización en tiempo real de datos. / Nuxchain Firebase Integration: User authentication, Firestore database for user data, storage for files and images, analytics for event tracking, and hosting for static assets. Includes security rules, automatic backup, and real-time data synchronization. Commands: 'Nuxchain Firebase', 'Nuxchain database'.",
    metadata: { type: "technical", category: "integrations", topic: "firebase" }
  },
  {
    content: "Optimización de Performance en Nuxchain: Lazy loading de componentes, code splitting automático, optimización de imágenes con Next.js Image, caching de datos con SWR, y preloading de rutas críticas. Incluye bundle analysis, tree shaking, y compresión de assets para tiempos de carga mínimos. / Nuxchain Performance Optimization: Component lazy loading, automatic code splitting, image optimization with Next.js Image, data caching with SWR, and critical route preloading. Includes bundle analysis, tree shaking, and asset compression for minimal loading times. Commands: 'Nuxchain performance', 'Nuxchain optimization'.",
    metadata: { type: "technical", category: "performance", topic: "optimization" }
  },
  {
    content: "Sistema de Notificaciones en Nuxchain: Toast notifications para acciones de usuario, notificaciones push para eventos importantes, alertas de transacciones blockchain, y notificaciones de actividad de NFTs. Incluye configuración de preferencias, historial de notificaciones, y integración con servicios externos. / Nuxchain Notification System: Toast notifications for user actions, push notifications for important events, blockchain transaction alerts, and NFT activity notifications. Includes preference configuration, notification history, and integration with external services. Commands: 'Nuxchain notifications', 'Nuxchain alerts'.",
    metadata: { type: "technical", category: "features", topic: "notifications" }
  },
  {
    content: "Gestión de Estado en Nuxchain: Context API para estado global, Zustand para estado de aplicación, estado local con useState y useReducer, y persistencia con localStorage. Incluye middleware para logging, devtools integration, y optimización de re-renders con memoización. / Nuxchain State Management: Context API for global state, Zustand for application state, local state with useState and useReducer, and persistence with localStorage. Includes middleware for logging, devtools integration, and re-render optimization with memoization. Commands: 'Nuxchain state management', 'Nuxchain context'.",
    metadata: { type: "technical", category: "architecture", topic: "state" }
  },
  {
    content: "Seguridad en Nuxchain: Validación de inputs, sanitización de datos, protección CSRF, headers de seguridad, y rate limiting en APIs. Incluye validación de transacciones blockchain, verificación de contratos inteligentes, y auditoría de seguridad continua. / Nuxchain Security: Input validation, data sanitization, CSRF protection, security headers, and API rate limiting. Includes blockchain transaction validation, smart contract verification, and continuous security auditing. Commands: 'Nuxchain security', 'Nuxchain validation'.",
    metadata: { type: "technical", category: "security", topic: "protection" }
  },

  // === COMANDOS DISPONIBLES ===
  {
    content: "Comandos de Nuxchain disponibles: 'Nuxchain help' (ayuda general), 'Nuxchain staking' (información de staking), 'Nuxchain NFT' (marketplace de NFTs), 'Nuxchain wallet' (conexión de wallet), 'Nuxchain tokenization' (tokenización de activos), 'Nuxchain airdrops' (información de airdrops), 'Nuxchain chat' (asistente AI), 'Nuxchain roadmap' (hoja de ruta), 'Nuxchain security' (seguridad), 'Nuxchain development' (desarrollo). / Available Nuxchain commands: 'Nuxchain help' (general help), 'Nuxchain staking' (staking information), 'Nuxchain NFT' (NFT marketplace), 'Nuxchain wallet' (wallet connection), 'Nuxchain tokenization' (asset tokenization), 'Nuxchain airdrops' (airdrop information), 'Nuxchain chat' (AI assistant), 'Nuxchain roadmap' (roadmap), 'Nuxchain security' (security), 'Nuxchain development' (development).",
    metadata: { type: "help", category: "commands", topic: "available" }
  },

  // === FAQ TÉCNICO ===
  {
    content: "Problemas comunes de transacciones en Nuxchain: 1) Gas insuficiente - aumentar gas limit, 2) Precio de gas bajo - aumentar gas price, 3) Nonce incorrecto - esperar confirmación de transacciones pendientes, 4) Slippage alto - ajustar tolerancia de slippage, 5) Contrato pausado - verificar estado del contrato. / Common transaction issues in Nuxchain: 1) Insufficient gas - increase gas limit, 2) Low gas price - increase gas price, 3) Incorrect nonce - wait for pending transactions confirmation, 4) High slippage - adjust slippage tolerance, 5) Contract paused - verify contract status. Commands: 'transaction failed', 'gas issues', 'Nuxchain troubleshooting'.",
    metadata: { type: "faq", category: "technical", topic: "transactions" }
  },
  {
    content: "Recompensas de staking no aparecen: 1) Verificar período de bloqueo activo, 2) Confirmar que la transacción de stake fue exitosa, 3) Esperar al menos 1 bloque para actualización, 4) Refrescar la página o reconectar wallet, 5) Verificar en Etherscan si hay recompensas pendientes. Las recompensas se actualizan cada bloque. / Staking rewards not showing: 1) Verify active lock period, 2) Confirm stake transaction was successful, 3) Wait at least 1 block for update, 4) Refresh page or reconnect wallet, 5) Check Etherscan for pending rewards. Rewards update every block. Commands: 'staking rewards missing', 'rewards not showing'.",
    metadata: { type: "faq", category: "staking", topic: "rewards-issues" }
  },
  {
    content: "NFT no aparece en marketplace: 1) Verificar que el NFT esté en la wallet conectada, 2) Confirmar que es estándar ERC-721 o ERC-1155, 3) Esperar sincronización de metadatos (hasta 10 minutos), 4) Verificar que la colección esté verificada, 5) Contactar soporte si persiste el problema. / NFT not showing in marketplace: 1) Verify NFT is in connected wallet, 2) Confirm it's ERC-721 or ERC-1155 standard, 3) Wait for metadata sync (up to 10 minutes), 4) Verify collection is verified, 5) Contact support if issue persists. Commands: 'NFT not showing', 'marketplace sync issues'.",
    metadata: { type: "faq", category: "marketplace", topic: "nft-visibility" }
  },
  {
    content: "Ofertas de NFT no funcionan: 1) Verificar balance suficiente para la oferta, 2) Aprobar tokens para el contrato de marketplace, 3) Confirmar que la oferta no ha expirado, 4) Verificar que el NFT sigue disponible, 5) Revisar configuración de slippage. Las ofertas expiran automáticamente después de 7 días. / NFT offers not working: 1) Verify sufficient balance for offer, 2) Approve tokens for marketplace contract, 3) Confirm offer hasn't expired, 4) Verify NFT is still available, 5) Check slippage settings. Offers automatically expire after 7 days. Commands: 'offer failed', 'NFT offer issues'.",
    metadata: { type: "faq", category: "marketplace", topic: "offers" }
  },
  {
    content: "Royalties de NFT incorrectos: 1) Verificar configuración de royalties en metadatos, 2) Confirmar que el contrato soporta EIP-2981, 3) Verificar que el creador configuró royalties correctamente, 4) Contactar al creador para actualización de metadatos, 5) Reportar problema si los royalties exceden 10%. / Incorrect NFT royalties: 1) Verify royalty configuration in metadata, 2) Confirm contract supports EIP-2981, 3) Verify creator configured royalties correctly, 4) Contact creator for metadata update, 5) Report issue if royalties exceed 10%. Commands: 'royalty issues', 'incorrect royalties'.",
    metadata: { type: "faq", category: "marketplace", topic: "royalties" }
  },
  {
    content: "Límites de la plataforma Nuxchain: Staking mínimo 100 NUVOS, máximo 1,000,000 NUVOS por transacción. NFT máximo 50 MB por archivo, formatos soportados: JPG, PNG, GIF, MP4, MP3. Ofertas máximo 7 días de duración. Gas limit recomendado: 300,000 para staking, 150,000 para NFT transfers. / Nuxchain platform limits: Minimum staking 100 NUVOS, maximum 1,000,000 NUVOS per transaction. NFT maximum 50 MB per file, supported formats: JPG, PNG, GIF, MP4, MP3. Offers maximum 7 days duration. Recommended gas limit: 300,000 for staking, 150,000 for NFT transfers. Commands: 'platform limits', 'Nuxchain restrictions'.",
    metadata: { type: "faq", category: "general", topic: "limits" }
  }
];

// Función para buscar en la base de conocimiento
function searchKnowledgeBase(query, limit = 5) {
  console.log('Base de conocimiento cargada con', knowledgeBase.length, 'elementos');
  const queryLower = query.toLowerCase();
  console.log('Query en minúsculas:', queryLower);
  
  // Buscar coincidencias exactas en comandos
  const exactMatches = knowledgeBase.filter(item => 
    item.content.toLowerCase().includes(`commands: '${queryLower}'`) ||
    item.content.toLowerCase().includes(`'${queryLower}'`)
  );
  
  // Buscar coincidencias en contenido
  const contentMatches = knowledgeBase.filter(item => 
    item.content.toLowerCase().includes(queryLower) &&
    !exactMatches.includes(item)
  );
  
  // Buscar coincidencias en metadatos
  const metadataMatches = knowledgeBase.filter(item => 
    (item.metadata.type.toLowerCase().includes(queryLower) ||
     item.metadata.category.toLowerCase().includes(queryLower) ||
     item.metadata.topic.toLowerCase().includes(queryLower)) &&
    !exactMatches.includes(item) &&
    !contentMatches.includes(item)
  );
  
  // Combinar resultados priorizando coincidencias exactas
  const allMatches = [...exactMatches, ...contentMatches, ...metadataMatches];
  
  return allMatches.slice(0, limit);
}

// Función para obtener contexto relevante
function getRelevantContext(query) {
  console.log('Buscando contexto para query:', query);
  const results = searchKnowledgeBase(query, 3);
  console.log('Resultados encontrados:', results.length);
  const context = results.map(item => item.content).join('\n\n');
  console.log('Contexto generado (primeros 200 chars):', context.substring(0, 200));
  return context;
}

export {
  searchKnowledgeBase,
  getRelevantContext
};

// Función de inicialización movida a embeddings-service.js para evitar dependencia circular