const knowledgeBase = [
  // === GENERAL INFORMATION ===
  {
    content: "Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation. The platform includes Smart Staking contracts, NFT marketplace, AI-powered chat (Nuvim AI 1.0), and tokenization tools.",
    metadata: { type: "general", category: "platform", topic: "overview" },
    commands: ['Nuxchain', 'Nuxchain platform', 'Nuxchain general']
  },
  {
    content: "Nuxchain Vision: To develop innovative services and products using cutting-edge technologies like blockchain, AI, and dApps. Our mission is to bring the power of security and decentralization to the masses in all possible forms, driving a powerful economy guided by user sentiment and dedication.",
    metadata: { type: "general", category: "company", topic: "vision-mission" },
    commands: ['Nuxchain vision', 'Nuxchain mission', 'Nuxchain philosophy']
  },
  {
    content: "Nuxchain differentiates itself by not having a traditional token or cryptocurrency. Instead, we focus on NFTs 2.0 - digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. This approach creates sustainable value through utility rather than speculation, driving a powerful economy guided by user sentiment and dedication. The platform uses POL (Polygon's native token) for all transactions and gas fees.",
    metadata: { type: "general", category: "strategy", topic: "differentiation" },
    commands: ['Nuxchain differentiation', 'Nuxchain no token', 'Nuxchain NFTs focus', 'Nuxchain user economy', 'Nuxchain POL']
  },

  // === SMART STAKING CONTRACT ===
  {
    content: "Nuxchain SmartStaking contract allows users to deposit POL tokens and earn automatic rewards. Main functions include: deposit() for staking tokens, withdraw() for partial withdrawals, withdrawAll() for complete withdrawal, calculateRewards() for checking pending rewards, claimRewards() for claiming only rewards, compound() for reinvesting rewards, and emergencyWithdraw() for emergency situations.",
    metadata: { type: "smart-contract", category: "staking", topic: "overview" },
    commands: ['Nuxchain smart contract', 'Nuxchain SmartStaking', 'Nuxchain functions']
  },
  {
    content: "Nuxchain SmartStaking has deposit limits: minimum 5 POL and maximum 10000 POL per deposit. Maximum 300 deposits per user. Daily withdrawal limit is 1000 POL for security. The contract includes custom errors like AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable for better error handling.",
    metadata: { type: "smart-contract", category: "staking", topic: "limits" },
    commands: ['Nuxchain limits', 'Nuxchain deposit minimum', 'Nuxchain errors']
  },
  {
    content: "Nuxchain SmartStaking reward calculation: Uses base hourly ROI of 0.01% with lockup bonuses. Maximum ROI cap is 125%. Lockup periods offer enhanced rates: No lockup: 0.01% per hour (87.6% APY), 30 days: 0.012% per hour (105.1% APY), 90 days: 0.016% per hour (140.2% APY), 180 days: 0.02% per hour (175.2% APY), 365 days: 0.03% per hour (262.8% APY). Rewards are calculated in real-time and can be claimed or compounded at any time. Daily withdrawal limit is 1000 POL for security. Commission rate is 6% on rewards.",
    metadata: { type: "smart-contract", category: "staking", topic: "rewards-calculation" },
    commands: ['Nuxchain rewards calculation', 'Nuxchain ROI', 'Nuxchain compound', 'Nuxchain lockup']
  },

  // === STAKING INFORMATION ===
  {
    content: "Nuxchain staking allows depositing POL tokens in the SmartStaking contract to earn automatic rewards. Rewards are calculated based on time held and lockup period selected.",
    metadata: { type: "staking", category: "guide", topic: "basics" },
    commands: ['Nuxchain staking', 'Nuxchain rewards']
  },
  {
    content: "How to stake in Nuxchain: 1) Connect wallet with POL tokens, 2) Go to Staking section, 3) Enter amount (min 5 POL), 4) Select lockup period (0, 30, 90, 180, or 365 days), 5) Confirm transaction. Rewards calculated automatically based on your lockup period.",
    metadata: { type: "staking", category: "tutorial", topic: "how-to" },
    commands: ['Nuxchain how to stake']
  },
  {
    content: "Claiming rewards in Nuxchain: Use claimRewards() to withdraw only rewards or withdrawAll() to withdraw capital + rewards. Funds are locked during the lockup period. After lockup expires, you can withdraw anytime without penalties.",
    metadata: { type: "staking", category: "tutorial", topic: "claiming" },
    commands: ['Nuxchain claim rewards']
  },
  {
    content: "Nuxchain Lockup Periods Explained: When you stake POL tokens, you can choose a lockup period that determines your reward rate. No lockup (0 days): 0.01% per hour, withdraw anytime. 30 days lockup: 0.012% per hour, 20% higher rewards, funds locked for 30 days. 90 days lockup: 0.016% per hour, 60% higher rewards, funds locked for 90 days. 180 days lockup: 0.02% per hour, 100% higher rewards, funds locked for 180 days. 365 days lockup: 0.03% per hour, 200% higher rewards, funds locked for 365 days. The longer you lock your tokens, the higher your hourly rewards. All rewards are calculated and accumulated automatically every hour.",
    metadata: { type: "staking", category: "rewards", topic: "lockup-periods" },
    commands: ['Nuxchain lockup periods', 'Nuxchain staking periods', 'Nuxchain lock duration', 'Nuxchain lockup options']
  },
  {
    content: "Nuxchain APY base is 0.01% per hour with no lockup, which equals approximately 87.6% APY annually. This is the fundamental return a user can expect when depositing POL tokens in the SmartStaking contract without any lockup period. The base APY is calculated hourly and accumulates automatically, allowing users to see their rewards grow in real-time. This is the minimum return, and it can be significantly increased by choosing longer lockup periods.",
    metadata: { type: "staking", category: "rewards", topic: "apy-base" },
    commands: ['Nuxchain APY base', 'Nuxchain base return', 'Nuxchain base rate', 'APY no lockup']
  },
  {
    content: "Nuxchain APY tiers based on lockup periods: No lockup: 0.01% per hour (87.6% APY), 30 days lockup: 0.012% per hour (105.1% APY), 90 days lockup: 0.016% per hour (140.2% APY), 180 days lockup: 0.02% per hour (175.2% APY), 365 days lockup: 0.03% per hour (262.8% APY). Maximum ROI cap of 125% applies to all deposits. Commission rate is 6% on rewards. Daily withdrawal limit is 1000 POL.",
    metadata: { type: "staking", category: "rewards", topic: "apy-tiers" },
    commands: ['Nuxchain APY', 'Nuxchain rates', 'Nuxchain lockup rates']
  },
  {
    content: "Compound feature in Nuxchain SmartStaking: The compound() function allows you to reinvest your accumulated rewards back into staking without withdrawing. When you compound, your rewards are automatically converted into a new deposit, and you can choose a new lockup period for the compounded amount. This creates a powerful compounding effect: your original deposit continues earning at its rate, while your rewards start earning additional rewards. Example: If you have 100 POL staked with 10 POL in rewards, compounding creates a new 10 POL deposit, so you'll now be earning rewards on 110 POL total. You can compound as often as you like, and each compounded amount can have its own lockup period.",
    metadata: { type: "staking", category: "advanced", topic: "compounding" },
    commands: ['Nuxchain compound', 'Nuxchain compounding', 'Nuxchain reinvest rewards']
  },
  {
    content: "Staking risks in Nuxchain: Smart contract risk (mitigated by audits), lockup period restrictions (funds locked for chosen duration), market volatility of POL token. Platform has emergency functions for security. During lockup period, you cannot withdraw your principal amount until the period expires.",
    metadata: { type: "staking", category: "guide", topic: "risks" },
    commands: ['Nuxchain risks']
  },

  // === MARKETPLACE ===
  {
    content: "Nuxchain NFT marketplace allows users to buy, sell and trade NFTs using POL tokens. Supports ERC-721 tokens with metadata display, filtering options, and advanced search. Features include: listing NFTs for sale, purchasing NFTs with POL tokens, viewing detailed NFT information with rarity and traits, marketplace statistics and analytics, collection browsing, and price history tracking. The marketplace integrates with Alchemy and Moralis APIs for comprehensive NFT data.",
    metadata: { type: "marketplace", category: "nft", topic: "overview" },
    commands: ['Nuxchain marketplace', 'Nuxchain NFT', 'Nuxchain buy NFT', 'Nuxchain sell NFT']
  },
  {
    content: "Nuxchain marketplace features advanced filtering and search capabilities. Users can filter NFTs by: collection, price range, rarity, traits/attributes, listing status (for sale, sold, not listed), and creation date. The marketplace dashboard shows real-time statistics including total volume, floor prices, trending collections, and recent sales. Caching system ensures fast loading of NFT metadata and images.",
    metadata: { type: "marketplace", category: "nft", topic: "features" },
    commands: ['Nuxchain marketplace filters', 'Nuxchain NFT search', 'Nuxchain marketplace stats']
  },
  {
    content: "Nuxchain marketplace roadmap includes exciting updates: NFT Marketplace Preview in June 2025, and Marketplace Contracts v2.0 in July 2025 with enhanced features like auction systems, royalty management, and cross-chain compatibility. The marketplace will support multiple blockchain networks and advanced trading mechanisms.",
    metadata: { type: "marketplace", category: "nft", topic: "roadmap" },
    commands: ['Nuxchain marketplace roadmap', 'Nuxchain marketplace v2', 'Nuxchain marketplace future']
  },
  {
    content: "Nuxchain marketplace offers system includes: createOffer(), acceptOffer(), rejectOffer(), cancelOffer(). Offers have expiration date and require POL deposit.",
    metadata: { type: "marketplace", category: "offers", topic: "system" },
    commands: ['Nuxchain marketplace', 'Nuxchain offers']
  },

  // === NFT INFORMATION ===
  {
    content: "Nuxchain NFTs 2.0 represent a revolutionary approach to digital art and utility. Unlike traditional NFTs, our NFTs 2.0 create an exclusive ecosystem that avoids FOMO and liquidity exit losses, increasing perceived value through real utilities. They serve as digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. All NFT transactions use POL as the payment and gas token.",
    metadata: { type: "nft", category: "concept", topic: "nfts-2.0" },
    commands: ['Nuxchain NFTs 2.0', 'Nuxchain digital art', 'Nuxchain NFT ecosystem']
  },
  {
    content: "NFT utility in Nuxchain includes: Governance voting rights, staking bonuses (enhanced APY for NFT holders), exclusive access to features, marketplace fee discounts, participation in special airdrops, gamification rewards, and cross-platform benefits. NFT holders may receive enhanced staking rates on their POL deposits, reduced marketplace fees, and priority access to new features. These utilities make NFTs functional assets rather than just collectibles, providing ongoing value to holders and creating a sustainable ecosystem.",
    metadata: { type: "nft", category: "utility", topic: "benefits" },
    commands: ['Nuxchain NFT', 'Nuxchain NFT utility', 'Nuxchain NFT benefits']
  },

  // === AIRDROPS ===
  {
    content: "Nuxchain airdrops reward early adopters and active users with POL tokens and exclusive NFTs. Eligibility based on wallet activity, staking participation, platform engagement, and holding specific NFTs. Current upcoming airdrops include: POL Token rewards for early platform users with enhanced staking rewards, and Governance NFT airdrop for active community members with voting rights and exclusive access. Registration is required through the Airdrops Dashboard.",
    metadata: { type: "airdrops", category: "rewards", topic: "eligibility" },
    commands: ['Nuxchain airdrop', 'Nuxchain rewards', 'Nuxchain POL airdrop', 'Nuxchain governance NFT']
  },
  {
    content: "Nuxchain airdrop system includes multiple distribution mechanisms: automatic airdrops for eligible users, manual claim processes through the dashboard, and time-limited campaigns. The Airdrop contract handles secure token distribution with functions like claimAirdrop(), checkEligibility(), and getAirdropInfo(). Users can track their airdrop history and upcoming eligibility through their profile dashboard.",
    metadata: { type: "airdrops", category: "process", topic: "distribution" },
    commands: ['Nuxchain airdrop claim', 'Nuxchain airdrop contract', 'Nuxchain airdrop history']
  },
  {
    content: "To participate in Nuxchain airdrops: 1) Keep POL in staking, 2) Participate in community, 3) Own Nuxchain NFTs, 4) Keep wallet connected during snapshots.",
    metadata: { type: "airdrops", category: "tutorial", topic: "participation" },
    commands: ['Nuxchain participate airdrop']
  },
  {
    content: "Nuxchain airdrops are announced on Discord, Twitter and the platform. Snapshots are taken on specific dates and tokens are distributed automatically.",
    metadata: { type: "airdrops", category: "process", topic: "distribution" },
    commands: ['Nuxchain airdrop announcements']
  },

  // === NUVIM AI 1.0 ===
  {
    content: "Nuvim AI 1.0 is Nuxchain's intelligent assistant powered by advanced language models. Provides real-time information about the ecosystem, helps with transactions, answers questions, and offers personalized recommendations.",
    metadata: { type: "ai", category: "nuvim", topic: "overview" },
    commands: ['Nuvim AI', 'AI assistant']
  },
  {
    content: "Nuvim AI capabilities: Natural language processing, multimodal input (text and images), web content analysis, real-time data integration, personalized responses, transaction assistance, and ecosystem guidance. Available 24/7 in multiple languages.",
    metadata: { type: "ai", category: "capabilities", topic: "features" },
    commands: ['AI capabilities', 'what can Nuvim do']
  },
  {
    content: "How to use Nuvim AI: 1) Navigate to Chat page, 2) Type your question or upload image, 3) AI processes and provides contextual response, 4) Follow up with additional questions, 5) Use suggested commands for quick actions. No registration required beyond wallet connection.",
    metadata: { type: "ai", category: "guide", topic: "usage" },
    commands: ['how to use AI', 'AI guide']
  },

  // === TOKENIZATION TOOLS ===
  {
    content: "Nuxchain provides comprehensive tokenization tools for creating and managing digital assets. Features include: ERC-20 token creation with customizable parameters, ERC-721 NFT minting with metadata management, batch minting capabilities, royalty settings for creators, and whitelist management for exclusive launches. The tokenization section offers step-by-step guides and templates for different token types. Integration with IPFS for decentralized metadata storage. All tokenization transactions require POL for gas fees.",
    metadata: { type: "tokenization", category: "tools", topic: "overview" },
    commands: ['Nuxchain tokenization', 'Nuxchain create token', 'Nuxchain mint NFT', 'Nuxchain whitelist']
  },

  // === TECHNICAL INFORMATION ===
  {
    content: "Nuxchain platform supports wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Make sure to have POL tokens for gas fees in all transactions. The platform operates on Polygon network (Chain ID: 137) and uses POL as the native gas token. All staking deposits, marketplace purchases, and contract interactions require POL. The platform uses secure RPC endpoints and implements best practices for wallet security including transaction signing and approval flows. ENS (Ethereum Name Service) is supported for user-friendly addresses.",
    metadata: { type: "technical", category: "wallets", topic: "compatibility" },
    commands: ['Nuxchain wallets', 'Nuxchain ENS', 'Nuxchain POL']
  },
  {
    content: "Gas fees in Nuxchain are paid in POL on Polygon network with average transaction costs under $0.01. Fees vary according to network congestion: ~1-30 gwei for normal transactions. The platform implements gas optimization techniques including batch transactions and efficient contract calls. Use tools like Polygon Gas Station to monitor current rates. Emergency functions may have higher gas costs due to additional security checks. Always ensure you have sufficient POL in your wallet for gas fees before attempting any transaction.",
    metadata: { type: "technical", category: "transactions", topic: "gas-fees" },
    commands: ['Nuxchain gas fees', 'Nuxchain gas optimization', 'Nuxchain POL gas']
  },
  {
    content: "Nuxchain uses smart contracts on Polygon with the following features: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 for maximum security.",
    metadata: { type: "technical", category: "security", topic: "smart-contracts" },
    commands: ['Nuxchain technical']
  },
  {
    content: "Nuxchain contracts are verified on Polygonscan for full transparency. SmartStaking handles deposits/withdrawals with automatic reward calculations, Marketplace handles NFT trading with offer systems. Both contracts include emergency functions and are protected with ReentrancyGuard, Pausable, and AccessControl patterns. Contract addresses and ABIs are publicly available for developers.",
    metadata: { type: "technical", category: "contracts", topic: "verification" },
    commands: ['Nuxchain Polygonscan', 'Nuxchain contract addresses', 'Nuxchain ABI']
  },
  {
    content: "Nuxchain integrates with multiple external APIs and services: Alchemy API for comprehensive NFT data and metadata, Moralis API for blockchain analytics, IPFS for decentralized storage of NFT metadata and images, Google Gemini AI for intelligent chat responses, and Polygon Gas Station for real-time gas price optimization. The platform uses caching mechanisms to ensure fast response times and reduce API costs.",
    metadata: { type: "technical", category: "integrations", topic: "external-apis" },
    commands: ['Nuxchain APIs', 'Nuxchain integrations', 'Nuxchain IPFS', 'Nuxchain Alchemy']
  },
  {
    content: "Asset tokenization in Nuxchain: NUVOS allows tokenizing real-world assets like real estate, art, commodities. Each token represents a fraction of the underlying asset.",
    metadata: { type: "tokenization", category: "assets", topic: "real-world-assets" },
    commands: ['Nuxchain tokenization']
  },
  {
    content: "NUVOS token utility in Nuxchain: Governance (voting on proposals), staking (generating rewards), fees (transaction discounts), premium access to features.",
    metadata: { type: "tokenization", category: "utility", topic: "token-use-cases" },
    commands: ['Nuxchain token utility']
  },
  {
    content: "NFT fractionalization in Nuxchain: High-value NFTs can be fractionalized into multiple ERC-20 tokens, enabling shared ownership and greater liquidity.",
    metadata: { type: "tokenization", category: "nft", topic: "fractionalization" },
    commands: ['Nuxchain fractionalization']
  },

  // === SECURITY ===
  {
    content: "Security audits in Nuxchain: All contracts have been audited by recognized firms. Reports available in official documentation.",
    metadata: { type: "security", category: "audits", topic: "smart-contract-security" },
    commands: ['Nuxchain audits']
  },
  {
    content: "Security best practices in Nuxchain: Use hardware wallets, verify contract addresses, don't share private keys, keep software updated.",
    metadata: { type: "security", category: "best-practices", topic: "user-security" },
    commands: ['Nuxchain security best practices']
  },
  {
    content: "MEV protection in Nuxchain: We implement protections against Maximum Extractable Value to protect users from front-running and sandwich attacks.",
    metadata: { type: "security", category: "mev-protection", topic: "transaction-security" },
    commands: ['Nuxchain MEV protection']
  },

  // === ROADMAP ===
  {
    content: "Nuxchain roadmap spans from 2024 to 2025 with major milestones: Foundation Phase (Q1 2024) - Smart Staking Contract v1 deployment, Development Phase (Q2-Q3 2024) - Alpha v1.0 Platform Release, Launch Phase (Q4 2024) - Beta Platform Launch, Initial Phase (Q1 2025) - Smart Staking 1.0 launch, Innovation Phase (Q2 2025) - NFT Dashboard and Gemini AI Chatbot integration. Future plans include marketplace v2.0, governance token launch, and cross-chain expansion.",
    metadata: { type: "general", category: "roadmap", topic: "timeline" },
    commands: ['Nuxchain roadmap', 'Nuxchain timeline', 'Nuxchain future plans']
  },
  {
    content: "Q1 2024 Nuxchain: Launch of Smart Staking v2.0, integration with more wallets, marketplace UI/UX improvements.",
    metadata: { type: "roadmap", category: "q1-2024", topic: "upcoming-features" },
    commands: ['Nuxchain roadmap Q1 2024']
  },
  {
    content: "Q2 2024 Nuxchain: Implementation of decentralized governance, mobile app launch, Layer 2 solutions integration.",
    metadata: { type: "roadmap", category: "q2-2024", topic: "governance-mobile" },
    commands: ['Nuxchain roadmap Q2 2024']
  },
  {
    content: "Q3-Q4 2024 Nuxchain: Multi-chain expansion, strategic partnerships, advanced DeFi functionalities, real asset tokenization.",
    metadata: { type: "roadmap", category: "h2-2024", topic: "expansion-defi" },
    commands: ['Nuxchain roadmap H2 2024']
  },

  // === FAQ ===
  {
    content: "FAQ - Transaction Issues: If your transaction is stuck, check gas fees and network congestion. Use higher gas prices during peak times. For failed transactions, verify wallet balance and contract approvals. Contact support if issues persist. Common solutions: increase gas limit, check network status, verify contract addresses, ensure sufficient POL balance.",
    metadata: { type: "faq", category: "transactions", topic: "issues" },
    commands: ['Nuxchain transaction help', 'Nuxchain stuck transaction', 'Nuxchain gas issues']
  },
  {
    content: "FAQ - Staking Rewards: Rewards are calculated automatically based on your staking amount, duration, and lockup period. Check your dashboard for real-time calculations. Rewards can be claimed after lockup period expires. APY varies by lockup tier: no lockup (87.6%), 30 days (105.1%), 90 days (140.2%), 180 days (175.2%), 365 days (262.8%). Compound rewards regularly for maximum returns by reinvesting your rewards into new deposits. During lockup period, you cannot withdraw principal but rewards continue to accumulate. Emergency withdrawal available when contract is paused.",
    metadata: { type: "faq", category: "staking", topic: "rewards" },
    commands: ['Nuxchain staking rewards', 'Nuxchain APY calculation', 'Nuxchain compound rewards']
  },
  {
    content: "FAQ - POL Token: POL is Polygon's native token used for all transactions on Nuxchain. You need POL for: gas fees on all transactions, staking deposits to earn rewards, purchasing NFTs in the marketplace, paying marketplace fees. You can acquire POL from exchanges like Binance, Coinbase, or KuCoin, then bridge it to Polygon network. Always keep some POL in your wallet for gas fees. Minimum staking amount is 5 POL, maximum is 10,000 POL per deposit.",
    metadata: { type: "faq", category: "token", topic: "pol-usage" },
    commands: ['Nuxchain POL', 'Nuxchain Polygon token', 'What is POL', 'How to get POL']
  },
  {
    content: "FAQ - NFT Trading: To trade NFTs, connect your wallet and browse the marketplace. All NFT prices are listed in POL. You can buy instantly or make offers. Sellers can accept, reject, or counter offers. All transactions are secured by smart contracts and require POL for gas fees. Check NFT history and authenticity before purchasing. Use filters to find specific collections or price ranges. Marketplace fee is 2.5% paid in POL.",
    metadata: { type: "faq", category: "nft", topic: "trading" },
    commands: ['Nuxchain NFT trading', 'Nuxchain marketplace help', 'Nuxchain NFT offers']
  },
  {
    content: "FAQ - Wallet Connection: Nuxchain supports MetaMask, Trust Wallet, WalletConnect, and Coinbase Wallet. Ensure you're on Polygon network (Chain ID: 137). If connection fails, try refreshing the page, clearing browser cache, or switching networks manually. For mobile, use WalletConnect for best compatibility. Always verify you're on the official Nuxchain domain.",
    metadata: { type: "faq", category: "wallet", topic: "connection" },
    commands: ['Nuxchain wallet connection', 'Nuxchain Polygon network', 'Nuxchain WalletConnect']
  },
  {
    content: "FAQ - Airdrops: To participate in airdrops, connect your wallet and check eligibility requirements. Some airdrops require staking, NFT ownership, or community participation. Distribution is automatic for eligible wallets. Check the airdrops page regularly for new opportunities. Past participation may increase future eligibility.",
    metadata: { type: "faq", category: "airdrops", topic: "participation" },
    commands: ['Nuxchain airdrop participation', 'Nuxchain airdrop eligibility', 'Nuxchain airdrop requirements']
  },

  // === ADVANCED USE CASES ===
  {
    content: "Advanced Nuxchain strategies: 1) Portfolio diversification - combine staking, NFT investments, and airdrop participation, 2) Yield optimization - time compound operations with gas costs, 3) NFT flipping - use marketplace analytics to identify undervalued assets, 4) Community engagement - participate in governance discussions for future airdrops, 5) Cross-platform integration - use APIs for external portfolio tracking.",
    metadata: { type: "advanced", category: "strategies", topic: "optimization" },
    commands: ['Nuxchain advanced strategies', 'Nuxchain portfolio optimization']
  },
  {
    content: "Nuxchain developer resources: Smart contract ABIs available for SmartStaking.json, Marketplace.json, and Airdrop.json. Integration examples include Web3 connection, transaction handling, event listening, and error management. The platform supports custom dApp integrations and provides comprehensive documentation for developers building on top of Nuxchain infrastructure.",
    metadata: { type: "developer", category: "resources", topic: "integration" },
    commands: ['Nuxchain developers', 'Nuxchain API documentation', 'Nuxchain integration']
  },

  // === TECHNICAL ARCHITECTURE ===
  {
    content: "Nuxchain App is built with modern technologies: React 18 for user interface with advanced hooks and concurrent features, Vite 7 as build tool for fast development and hot module replacement, TypeScript for static typing and better developer experience, TailwindCSS for utility styles and responsive design, Wagmi v2 for optimized React hooks for Ethereum, Viem v2 as TypeScript library for blockchain interactions, and TanStack Query for server state management and caching.",
    metadata: { type: "technical", category: "architecture", topic: "tech-stack" },
    commands: ['Nuxchain architecture', 'Nuxchain tech stack', 'Nuxchain React', 'Nuxchain Vite']
  },
  {
    content: "Nuxchain project structure: React frontend with main pages (Home, Staking, Marketplace, NFTs, Airdrops, Chat, Tokenization), components organized by functionality, custom hooks for reusable logic, services for APIs and blockchain, centralized configuration, and routing system with React Router. Backend with Express.js, embedding services, web scraping, and Gemini AI controllers. Deployment on Vercel with serverless functions.",
    metadata: { type: "technical", category: "architecture", topic: "project-structure" },
    commands: ['Nuxchain project structure', 'Nuxchain frontend', 'Nuxchain backend']
  },
  {
    content: "Nuxchain development configuration: npm scripts for development (dev, dev:server, dev:full with concurrently), build for production, linting with ESLint, preview for local testing. Environment variables for different environments (development vs production), automatic API configuration based on environment, support for localhost and production domains. Hot reload and fast refresh enabled for efficient development.",
    metadata: { type: "technical", category: "development", topic: "configuration" },
    commands: ['Nuxchain development', 'Nuxchain npm scripts', 'Nuxchain environment']
  },

  // === PAGE FUNCTIONALITIES ===
  {
    content: "Nuxchain Home page: Hero section with platform introduction, AI section highlighting Nuvim AI 1.0, staking information with real-time statistics, NFT marketplace preview, airdrops section with upcoming events, tokenization information, ecosystem benefits section, and footer with important links. Responsive design optimized for conversion.",
    metadata: { type: "technical", category: "pages", topic: "home" },
    commands: ['Nuxchain home page', 'Nuxchain landing']
  },
  {
    content: "Nuxchain Staking page: Staking form with real-time validation, pool information with current APY, user statistics (balance, rewards, deposits), contract information with verified addresses, informative carousel about benefits, staking bonds for different periods, and position management dashboard. Complete integration with SmartStaking contract.",
    metadata: { type: "technical", category: "pages", topic: "staking" },
    commands: ['Nuxchain staking page', 'Nuxchain staking interface']
  },
  {
    content: "Nuxchain Marketplace page: NFT grid with infinite scroll, advanced filters by collection/price/rarity, real-time marketplace statistics, purchase modal with confirmation, offer system, integration with Alchemy and Moralis APIs, optimized cache for metadata, and support for multiple NFT formats. Design optimized for navigation and discovery.",
    metadata: { type: "technical", category: "pages", topic: "marketplace" },
    commands: ['Nuxchain marketplace page', 'Nuxchain NFT marketplace']
  },
  {
    content: "Nuxchain Chat page with Nuvim AI: Real-time chat interface with streaming, multimodal support (text and images), automatic URL processing with web scraping, embedding system for persistent context, welcome screen with suggestions, input area with autocomplete, and complete integration with Google Gemini AI. Optimized for fast responses and relevant context.",
    metadata: { type: "technical", category: "pages", topic: "chat" },
    commands: ['Nuxchain chat page', 'Nuxchain Nuvim AI interface']
  },
  {
    content: "Nuxchain NFTs page: Infinite grid of user's NFTs, filters by collection and status, personal NFT statistics, listing modal for sale, management of received offers, transaction history, and wallet integration to show owned NFTs. Design optimized for personal collection management.",
    metadata: { type: "technical", category: "pages", topic: "nfts" },
    commands: ['Nuxchain NFTs page', 'Nuxchain my NFTs']
  },
  {
    content: "Nuxchain Airdrops page: Available airdrops dashboard, participation form, airdrop statistics, time counter for upcoming events, participation history, automatic eligibility verification, and notification system. Integration with airdrop contracts for automatic distribution.",
    metadata: { type: "technical", category: "pages", topic: "airdrops" },
    commands: ['Nuxchain airdrops page', 'Nuxchain airdrop dashboard']
  },
  {
    content: "Nuxchain Tokenization page: Tools to create ERC-20 tokens and ERC-721 NFTs, file upload to IPFS, metadata configuration, royalty management, whitelist management, batch minting, progress indicator, technical token details, tokenization FAQ, and process benefits. Step-by-step interface to facilitate creation.",
    metadata: { type: "technical", category: "pages", topic: "tokenization" },
    commands: ['Nuxchain tokenization page', 'Nuxchain create tokens']
  },

  // === EXTERNAL INTEGRATIONS ===
  {
    content: "Nuxchain Alchemy API integration: Complete NFT metadata retrieval, collection information, transaction history, ownership verification, rarity and traits data, and real-time blockchain synchronization. Optimized cache to reduce API calls and improve performance. Support for multiple blockchain networks.",
    metadata: { type: "technical", category: "integrations", topic: "alchemy" },
    commands: ['Nuxchain Alchemy integration', 'Nuxchain NFT metadata']
  },
  {
    content: "Nuxchain Moralis API integration: Advanced blockchain analytics, portfolio tracking, real-time price data, market statistics, liquidity information, and DeFi metrics. Used for analytics dashboard and ecosystem performance reports.",
    metadata: { type: "technical", category: "integrations", topic: "moralis" },
    commands: ['Nuxchain Moralis integration', 'Nuxchain analytics']
  },
  {
    content: "Nuxchain IPFS integration: Decentralized storage of NFT metadata, images and multimedia files, automatic pinning for permanent availability, IPFS hash management, and content loading optimization. Used in tokenization and marketplace to ensure complete decentralization.",
    metadata: { type: "technical", category: "integrations", topic: "ipfs" },
    commands: ['Nuxchain IPFS', 'Nuxchain decentralized storage']
  },
  {
    content: "Nuxchain Google Gemini AI integration: Natural language processing for Nuvim AI 1.0, web content analysis, contextual response generation, multimodal support for text and images, real-time response streaming, and embedding system for persistent memory. Optimized for fast and accurate responses about the Nuxchain ecosystem.",
    metadata: { type: "technical", category: "integrations", topic: "gemini-ai" },
    commands: ['Nuxchain Gemini AI', 'Nuxchain AI integration']
  },

  // === WEB3 AUTHENTICATION ===
  {
    content: "Nuxchain Web3 Authentication System: Integration with Wagmi and Viem for wallet connection, support for MetaMask, WalletConnect, Coinbase Wallet, and Rainbow Wallet, persistent session management, digital signature verification, and multi-blockchain network handling. Includes custom hooks for connection state and automatic network switching.",
    metadata: { type: "technical", category: "authentication", topic: "web3" },
    commands: ['Nuxchain wallet connection', 'Nuxchain Web3 auth']
  },
  {
    content: "Supported Wallets in Nuxchain: MetaMask (main recommended wallet), WalletConnect (for mobile wallets), Coinbase Wallet (native integration), Rainbow Wallet (full support), and compatibility with any wallet implementing EIP-1193. Automatic detection of installed wallets, fallback to WalletConnect for undetected wallets, and connection error handling.",
    metadata: { type: "technical", category: "authentication", topic: "wallets" },
    commands: ['Nuxchain supported wallets', 'Nuxchain wallet compatibility']
  },

  // === DEVELOPMENT AND CONFIGURATION ===
  {
    content: "Nuxchain Local Development Guide: Installation with 'npm install', development with 'npm run dev' (frontend) and 'npm run dev:full' (fullstack), environment variables configuration (.env.local), local database setup, external APIs configuration (Alchemy, Moralis), and testing with 'npm test'. Includes hot reload, debugging tools, and development with mock data.",
    metadata: { type: "developer", category: "development", topic: "local-setup" },
    commands: ['Nuxchain local development', 'Nuxchain dev setup']
  },
  {
    content: "Nuxchain Environment Configuration: Environment variables for development (.env.local) and production (.env), API configuration (ALCHEMY_API_KEY, MORALIS_API_KEY, GOOGLE_AI_API_KEY), endpoint URLs by environment, database configuration, and authentication secrets. Automatic environment detection (localhost vs Vercel), and fallbacks for development without external APIs.",
    metadata: { type: "developer", category: "development", topic: "environment" },
    commands: ['Nuxchain environment config', 'Nuxchain env variables']
  },
  {
    content: "Nuxchain Build and Deploy Scripts: 'npm run build' for production build, 'npm run preview' for local build preview, 'npm run lint' for code linting, 'npm run type-check' for TypeScript verification, and automatic deploy on Vercel with GitHub integration. Bundle optimizations, tree shaking, and automatic code splitting for better performance.",
    metadata: { type: "developer", category: "development", topic: "build-deploy" },
    commands: ['Nuxchain build process', 'Nuxchain deploy']
  },
  {
    content: "Vercel Deployment for Nuxchain: Automatic configuration with GitHub integration, environment variables in Vercel dashboard, optimized build commands, edge functions for APIs, and global CDN for static assets. Includes preview deployments for pull requests, automatic rollback on errors, and real-time performance monitoring.",
    metadata: { type: "developer", category: "deployment", topic: "vercel" },
    commands: ['Nuxchain Vercel deployment', 'Nuxchain production deploy']
  },

  // === ADVANCED COMPONENTS AND FEATURES ===
  {
    content: "Nuxchain Layout and Navigation: Responsive sidebar with main navigation, header with wallet connection and user profile, footer with important links, and optimized mobile navigation. Includes breadcrumbs, active page indicators, and smooth transitions between sections. Support for dark mode and theme customization.",
    metadata: { type: "technical", category: "components", topic: "layout" },
    commands: ['Nuxchain layout', 'Nuxchain navigation']
  },
  {
    content: "Nuxchain Firebase Integration: User authentication, Firestore database for user data, storage for files and images, analytics for event tracking, and hosting for static assets. Includes security rules, automatic backup, and real-time data synchronization.",
    metadata: { type: "technical", category: "integrations", topic: "firebase" },
    commands: ['Nuxchain Firebase', 'Nuxchain database']
  },
  {
    content: "Nuxchain Performance Optimization: Component lazy loading, automatic code splitting, image optimization with Next.js Image, data caching with SWR, and critical route preloading. Includes bundle analysis, tree shaking, and asset compression for minimal loading times.",
    metadata: { type: "technical", category: "performance", topic: "optimization" },
    commands: ['Nuxchain performance', 'Nuxchain optimization']
  },
  {
    content: "Nuxchain Notification System: Toast notifications for user actions, push notifications for important events, blockchain transaction alerts, and NFT activity notifications. Includes preference configuration, notification history, and integration with external services.",
    metadata: { type: "technical", category: "features", topic: "notifications" },
    commands: ['Nuxchain notifications', 'Nuxchain alerts']
  },
  {
    content: "Nuxchain State Management: Context API for global state, Zustand for application state, local state with useState and useReducer, and persistence with localStorage. Includes middleware for logging, devtools integration, and re-render optimization with memoization.",
    metadata: { type: "technical", category: "architecture", topic: "state" },
    commands: ['Nuxchain state management', 'Nuxchain context']
  },
  {
    content: "Nuxchain Security: Input validation, data sanitization, CSRF protection, security headers, and API rate limiting. Includes blockchain transaction validation, smart contract verification, and continuous security auditing.",
    metadata: { type: "technical", category: "security", topic: "protection" },
    commands: ['Nuxchain security', 'Nuxchain validation']
  },

  // === AVAILABLE COMMANDS ===
  {
    content: "Available Nuxchain commands: 'Nuxchain help' (general help), 'Nuxchain staking' (staking information), 'Nuxchain NFT' (NFT marketplace), 'Nuxchain wallet' (wallet connection), 'Nuxchain tokenization' (asset tokenization), 'Nuxchain airdrops' (airdrop information), 'Nuxchain chat' (AI assistant), 'Nuxchain roadmap' (roadmap), 'Nuxchain security' (security), 'Nuxchain development' (development).",
    metadata: { type: "help", category: "commands", topic: "available" },
    commands: ['Nuxchain commands', 'available commands']
  },

  // === TECHNICAL FAQ ===
  {
    content: "Common transaction issues in Nuxchain: 1) Insufficient gas - increase gas limit, 2) Low gas price - increase gas price, 3) Incorrect nonce - wait for pending transactions confirmation, 4) High slippage - adjust slippage tolerance, 5) Contract paused - verify contract status.",
    metadata: { type: "faq", category: "technical", topic: "transactions" },
    commands: ['transaction failed', 'gas issues', 'Nuxchain troubleshooting']
  },
  {
    content: "Staking rewards not showing: 1) Verify active lock period, 2) Confirm stake transaction was successful, 3) Wait at least 1 block for update, 4) Refresh page or reconnect wallet, 5) Check Etherscan for pending rewards. Rewards update every block.",
    metadata: { type: "faq", category: "staking", topic: "rewards-issues" },
    commands: ['staking rewards missing', 'rewards not showing']
  },
  {
    content: "NFT not showing in marketplace: 1) Verify NFT is in connected wallet, 2) Confirm it's ERC-721 or ERC-1155 standard, 3) Wait for metadata sync (up to 10 minutes), 4) Verify collection is verified, 5) Contact support if issue persists.",
    metadata: { type: "faq", category: "marketplace", topic: "nft-visibility" },
    commands: ['NFT not showing', 'marketplace sync issues']
  },
  {
    content: "NFT offers not working: 1) Verify sufficient balance for offer, 2) Approve tokens for marketplace contract, 3) Confirm offer hasn't expired, 4) Verify NFT is still available, 5) Check slippage settings. Offers automatically expire after 7 days.",
    metadata: { type: "faq", category: "marketplace", topic: "offers" },
    commands: ['offer failed', 'NFT offer issues']
  },
  {
    content: "Incorrect NFT royalties: 1) Verify royalty configuration in metadata, 2) Confirm contract supports EIP-2981, 3) Verify creator configured royalties correctly, 4) Contact creator for metadata update, 5) Report issue if royalties exceed 10%.",
    metadata: { type: "faq", category: "marketplace", topic: "royalties" },
    commands: ['royalty issues', 'incorrect royalties']
  },
  {
    content: "Nuxchain platform limits: Minimum staking 100 NUVOS, maximum 1,000,000 NUVOS per transaction. NFT maximum 50 MB per file, supported formats: JPG, PNG, GIF, MP4, MP3. Offers maximum 7 days duration. Recommended gas limit: 300,000 for staking, 150,000 for NFT transfers.",
    metadata: { type: "faq", category: "general", topic: "limits" },
    commands: ['platform limits', 'Nuxchain restrictions']
  }
];

// Function to search the knowledge base - Optimized for intelligent searches
function searchKnowledgeBase(query, limit = 5, docs = knowledgeBase) {
  console.log('Knowledge base loaded with', docs.length, 'items');
  const queryLower = query.toLowerCase();
  
  // Preprocess query to remove stop words
  const stopWords = ['this', 'that', 'these', 'those', 'the', 'a', 'an', 'and', 'or', 'is', 'are', 'in', 'on', 'at', 'for', 'with'];
  const queryWords = queryLower.split(/\s+/) 
    .filter(word => !stopWords.includes(word) && word.length > 2)
    .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
  
  // Determine query categories
  const categories = {
    staking: queryLower.includes('staking') || queryLower.includes('apy') || queryLower.includes('lockup'),
    nft: queryLower.includes('nft') || queryLower.includes('marketplace') || queryLower.includes('collection'),
    airdrop: queryLower.includes('airdrop') || queryLower.includes('reward'),
    general: !queryWords.length || (queryWords.length === 1 && queryWords[0].length < 5)
  };
  
  // Search for exact matches in commands
  const exactMatches = docs.filter(item => 
    (item.commands && item.commands.some(cmd => cmd.toLowerCase() === queryLower)) ||
    (item.metadata?.category && queryLower.includes(item.metadata.category.toLowerCase())) ||
    (item.metadata?.topic && queryLower.includes(item.metadata.topic.toLowerCase()))
  );
  
  // Search for matches in content using improved scoring algorithm
  const scoredMatches = docs
    .filter(item => !exactMatches.includes(item))
    .map(item => {
      const contentLower = item.content.toLowerCase();
      let score = 0;
      
      // Score for direct match
      if (contentLower.includes(queryLower)) {
        score += 0.5;
      }
      
      // Score for query keywords
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          // Higher score for longer words
          score += (word.length / 100) * 3;
        }
      });
      
      // Score for matching category
      if (categories.staking && ['staking', 'smart-contract'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.nft && ['nft', 'marketplace'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.airdrop && ['airdrops'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.general && ['general'].includes(item.metadata?.type)) {
        score += 0.1;
      }
      
      return { ...item, score };
    })
    .filter(item => item.score > 0.1) // Filter results with minimum score
    .sort((a, b) => b.score - a.score); // Sort by descending score
  
  // Combine exact and scored results
  const combinedResults = [...exactMatches, ...scoredMatches.slice(0, limit - exactMatches.length)];
  
  // Ensure limit is not exceeded
  return combinedResults.slice(0, limit);
}

// Function to get relevant context
function getRelevantContext(query) {
  console.log('Searching context for query:', query);
  const results = searchKnowledgeBase(query, 3);
  console.log('Results found:', results.length);
  const context = results.map(item => item.content).join('\n\n');
  console.log('Generated context (first 300 chars):', context.substring(0, 300));
  return context;
}

export {
  knowledgeBase,
  searchKnowledgeBase,
  getRelevantContext
};