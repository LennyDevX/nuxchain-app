import { GoogleGenAI } from '@google/genai';

// Importar la base de conocimientos completa directamente
const knowledgeBase = [
  // === INFORMACIÓN GENERAL ===
  {
    content: "Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation. The platform includes Smart Staking contracts, NFT marketplace, AI-powered chat (Nuvim AI 1.0), and tokenization tools. / Nuxchain es una plataforma descentralizada integral que combina staking, marketplace de NFTs, airdrops y tokenización. Es un ecosistema completo para la gestión de activos digitales y generación de ingresos pasivos. La plataforma incluye contratos Smart Staking, marketplace de NFTs, chat con IA (Nuvim AI 1.0), y herramientas de tokenización. Commands: 'Nuxchain', 'Nuxchain platform', 'Nuxchain general'.",
    metadata: { type: "general", category: "platform", topic: "overview" }
  },
  {
    content: "Nuxchain Vision: To develop innovative services and products using cutting-edge technologies like blockchain, AI, and dApps. Our mission is to bring the power of security and decentralization to the masses in all possible forms, driving a powerful economy guided by user sentiment and dedication. / Visión de Nuxchain: Desarrollar servicios y productos innovadores usando tecnologías de vanguardia como blockchain, IA y dApps. Nuestra misión es llevar el poder de la seguridad y descentralización a las masas en todas las formas posibles, impulsando una economía poderosa regida por el sentimiento y dedicación del usuario. Commands: 'Nuxchain vision', 'Nuxchain mission', 'Nuxchain philosophy'.",
    metadata: { type: "general", category: "company", topic: "vision-mission" }
  },
  {
    content: "Nuxchain differentiates itself by not having a traditional token or cryptocurrency. Instead, we focus on NFTs 2.0 - digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. This approach creates sustainable value through utility rather than speculation, driving a powerful economy guided by user sentiment and dedication. / Nuxchain se diferencia al no tener un token o criptomoneda tradicional. En su lugar, nos enfocamos en NFTs 2.0 - representaciones de arte digital con beneficios únicos y poderosos que gamifican la experiencia del usuario tanto dentro como fuera del ecosistema Nuxchain. Este enfoque crea valor sostenible a través de la utilidad en lugar de la especulación, impulsando una economía poderosa regida por el sentimiento y dedicación del usuario. Commands: 'Nuxchain differentiation', 'Nuxchain no token', 'Nuxchain NFTs focus', 'Nuxchain user economy'.",
    metadata: { type: "general", category: "strategy", topic: "differentiation" }
  },
  {
    content: "Nuxchain uses Polygon and Ethereum as primary blockchain bases, avoiding fragmentation while developing innovations around these established blockchains. Built with advanced smart contracts using ReentrancyGuard, Pausable, AccessControl, ERC721, and ERC2981 standards for maximum security, transparency and decentralization in all operations. / Nuxchain utiliza Polygon y Ethereum como bases blockchain primarias, evitando fragmentación mientras desarrolla innovaciones alrededor de estas blockchains establecidas. Construido con contratos inteligentes avanzados usando estándares ReentrancyGuard, Pausable, AccessControl, ERC721, y ERC2981 para máxima seguridad, transparencia y descentralización en todas las operaciones. Commands: 'Nuxchain technology', 'Nuxchain blockchain', 'Nuxchain security', 'Nux-chain'.",
    metadata: { type: "general", category: "technology", topic: "blockchain" }
  },

  // === ECOSISTEMA NUXCHAIN ===
  {
    content: "Nuxchain Protocol is dedicated to smart contract innovation, serving as the foundation for all platform operations. It focuses on developing cutting-edge blockchain solutions and optimizing contract efficiency for better user experience and security. / Nuxchain Protocol está dedicado a la innovación de contratos inteligentes, sirviendo como la fundación para todas las operaciones de la plataforma. Se enfoca en desarrollar soluciones blockchain de vanguardia y optimizar la eficiencia de contratos para mejor experiencia de usuario y seguridad. Commands: 'Nuxchain Protocol', 'Nuxchain smart contracts', 'Nuxchain innovation'.",
    metadata: { type: "ecosystem", category: "protocol", topic: "smart-contracts" }
  },
  {
    content: "Nux-AI is the AI hub and fundamental part of the Nuxchain core, where we develop AI-based tools and services to optimize user experience. This includes Nuvim AI 1.0 chatbot, AI-powered analytics, automated trading strategies, and intelligent contract interactions. The AI system learns from user behavior to provide personalized recommendations and enhanced platform functionality. / Nux-AI es el hub de IA y parte fundamental del núcleo de Nuxchain, donde desarrollamos herramientas y servicios basados en IA para optimizar la experiencia del usuario. Esto incluye el chatbot Nuvim AI 1.0, análisis impulsados por IA, estrategias de trading automatizadas, e interacciones inteligentes de contratos. El sistema de IA aprende del comportamiento del usuario para proporcionar recomendaciones personalizadas y funcionalidad mejorada de la plataforma. Commands: 'Nux-AI', 'Nuxchain AI hub', 'Nuvim AI', 'Nuxchain artificial intelligence'.",
    metadata: { type: "ecosystem", category: "ai", topic: "hub" }
  },
  {
    content: "Nuvim AI 1.0 is the first stable version of the AI chat integrated into Nuxchain platform. It provides complete platform integration, allowing users to ask questions about staking, marketplace, NFTs, airdrops, and all platform features. The AI uses Gemini models and supports multimodal interactions including text and images. / Nuvim AI 1.0 es la primera versión estable del chat con IA integrado en la plataforma Nuxchain. Proporciona integración completa con la plataforma, permitiendo a los usuarios hacer preguntas sobre staking, marketplace, NFTs, airdrops, y todas las funcionalidades de la plataforma. La IA usa modelos Gemini y soporta interacciones multimodales incluyendo texto e imágenes. Commands: 'Nuvim AI', 'Nuxchain AI', 'Nuxchain chat'.",
    metadata: { type: "general", category: "ai", topic: "nuvim-ai" }
  },

  // === SMART STAKING CONTRACT ===
  {
    content: "Nuxchain SmartStaking contract allows users to deposit POL tokens and earn automatic rewards. Main functions include: deposit() for staking tokens, withdraw() for partial withdrawals, withdrawAll() for complete withdrawal, calculateRewards() for checking pending rewards, claimRewards() for claiming only rewards, compound() for reinvesting rewards, and emergencyWithdraw() for emergency situations. / El contrato SmartStaking de Nuxchain permite a los usuarios depositar tokens POL y ganar recompensas automáticas. Las funciones principales incluyen: deposit() para hacer staking, withdraw() para retiros parciales, withdrawAll() para retiro completo, calculateRewards() para verificar recompensas pendientes, claimRewards() para reclamar solo recompensas, compound() para reinvertir recompensas, y emergencyWithdraw() para situaciones de emergencia. Commands: 'Nuxchain smart contract', 'Nuxchain SmartStaking', 'Nuxchain functions'.",
    metadata: { type: "smart-contract", category: "staking", topic: "overview" }
  },
  {
    content: "Nuxchain SmartStaking has deposit limits: minimum 5 POL and maximum 10000 POL per deposit. Maximum 300 deposits per user. Daily withdrawal limit exists for security. The contract includes custom errors like AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable for better error handling. / SmartStaking de Nuxchain tiene límites de depósito: mínimo 5 POL y máximo 10000 POL por depósito. Máximo 300 depósitos por usuario. Existe límite de retiro diario por seguridad. El contrato incluye errores personalizados como AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable para mejor manejo de errores. Commands: 'Nuxchain limits', 'Nuxchain deposit minimum', 'Nuxchain errors'.",
    metadata: { type: "smart-contract", category: "staking", topic: "limits" }
  },
  {
    content: "Nuxchain SmartStaking reward calculation: Uses hourly ROI of 0.01% (0.0001) with compound interest. Maximum ROI multiplier is 1.25 (25% max return). Rewards are calculated in real-time and can be claimed or compounded at any time. The contract tracks pendingRewards and totalRewards for each user. / Cálculo de recompensas en SmartStaking de Nuxchain: Usa ROI por hora de 0.01% (0.0001) con interés compuesto. El multiplicador máximo de ROI es 1.25 (25% retorno máximo). Las recompensas se calculan en tiempo real y pueden reclamarse o reinvertirse en cualquier momento. El contrato rastrea pendingRewards y totalRewards para cada usuario. Commands: 'Nuxchain rewards calculation', 'Nuxchain ROI', 'Nuxchain compound'.",
    metadata: { type: "smart-contract", category: "staking", topic: "rewards-calculation" }
  },

  // === STAKING INFORMATION ===
  {
    content: "Nuxchain staking allows depositing POL tokens in the SmartStaking contract to earn automatic rewards. Rewards are calculated based on time held. / El staking en Nuxchain permite depositar tokens POL en el contrato SmartStaking para ganar recompensas automáticas. Las recompensas se calculan según el tiempo de permanencia. Commands: 'Nuxchain staking', 'Nuxchain rewards'.",
    metadata: { type: "staking", category: "guide", topic: "basics" }
  },
  {
    content: "How to stake in Nuxchain: 1) Connect wallet, 2) Go to Staking section, 3) Enter amount (min 5 POL), 4) Confirm transaction. Rewards calculated automatically. / Para hacer staking en Nuxchain: 1) Conecta tu wallet, 2) Ve a la sección Staking, 3) Ingresa cantidad (min 5 POL), 4) Confirma transacción. Recompensas se calculan automáticamente. Commands: 'Nuxchain how to stake'.",
    metadata: { type: "staking", category: "tutorial", topic: "how-to" }
  },
  {
    content: "Claiming rewards in Nuxchain: Use claimRewards() to withdraw only rewards or withdrawAll() to withdraw capital + rewards. No penalties for early withdrawal. / Reclamar recompensas en Nuxchain: Usa claimRewards() para retirar solo recompensas o withdrawAll() para retirar capital + recompensas. Sin penalizaciones por retiro temprano. Commands: 'Nuxchain claim rewards'.",
    metadata: { type: "staking", category: "tutorial", topic: "claiming" }
  },

  // === MARKETPLACE ===
  {
    content: "Nuxchain NFT marketplace allows users to buy, sell and trade NFTs. Supports ERC-721 tokens with metadata display, filtering options, and advanced search. Features include: listing NFTs for sale, purchasing NFTs with POL tokens, viewing detailed NFT information with rarity and traits, marketplace statistics and analytics, collection browsing, and price history tracking. The marketplace integrates with Alchemy and Moralis APIs for comprehensive NFT data. / El marketplace de NFT de Nuxchain permite a los usuarios comprar, vender e intercambiar NFTs. Soporta tokens ERC-721 con visualización de metadatos, opciones de filtrado y búsqueda avanzada. Las características incluyen: listar NFTs para venta, comprar NFTs con tokens POL, ver información detallada de NFTs con rareza y características, estadísticas y análisis del marketplace, navegación de colecciones, y seguimiento del historial de precios. El marketplace se integra con las APIs de Alchemy y Moralis para datos completos de NFTs. Commands: 'Nuxchain marketplace', 'Nuxchain NFT', 'Nuxchain buy NFT', 'Nuxchain sell NFT'.",
    metadata: { type: "marketplace", category: "nft", topic: "overview" }
  },

  // === NFT INFORMATION ===
  {
    content: "Nuxchain NFTs 2.0 represent a revolutionary approach to digital art and utility. Unlike traditional NFTs, our NFTs 2.0 create an exclusive ecosystem that avoids FOMO and liquidity exit losses, increasing perceived value through real utilities. They serve as digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. / Los NFTs 2.0 de Nuxchain representan un enfoque revolucionario al arte digital y utilidad. A diferencia de los NFTs tradicionales, nuestros NFTs 2.0 crean un ecosistema exclusivo que evita FOMO y pérdidas de salida de liquidez, aumentando el valor percibido a través de utilidades reales. Sirven como representaciones de arte digital con beneficios únicos y poderosos que gamifican la experiencia del usuario tanto dentro como fuera del ecosistema Nuxchain. Commands: 'Nuxchain NFTs 2.0', 'Nuxchain digital art', 'Nuxchain NFT ecosystem'.",
    metadata: { type: "nft", category: "concept", topic: "nfts-2.0" }
  },

  // === AIRDROPS ===
  {
    content: "Nuxchain airdrops reward early adopters and active users. Eligibility based on wallet activity, staking participation, platform engagement, and holding specific NFTs. Current upcoming airdrops include: NUVO Token Pre-Launch (Q2 2025) for early platform users with enhanced staking rewards, and Governance NFT airdrop for active community members with voting rights and exclusive access. Registration is required through the Airdrops Dashboard. / Los airdrops de Nuxchain recompensan a los primeros adoptantes y usuarios activos. Elegibilidad basada en actividad de wallet, participación en staking, compromiso con la plataforma, y posesión de NFTs específicos. Los próximos airdrops incluyen: NUVO Token Pre-Launch (Q2 2025) para usuarios tempranos de la plataforma con recompensas de staking mejoradas, y airdrop de NFT de Gobernanza para miembros activos de la comunidad con derechos de voto y acceso exclusivo. Se requiere registro a través del Dashboard de Airdrops. Commands: 'Nuxchain airdrop', 'Nuxchain rewards', 'Nuxchain NUVO token', 'Nuxchain governance NFT'.",
    metadata: { type: "airdrop", category: "rewards", topic: "eligibility" }
  },

  // === TOKENIZATION TOOLS ===
  {
    content: "Nuxchain provides comprehensive tokenization tools for creating and managing digital assets. Features include: ERC-20 token creation with customizable parameters, ERC-721 NFT minting with metadata management, batch minting capabilities, royalty settings for creators, and whitelist management for exclusive launches. The tokenization section offers step-by-step guides and templates for different token types. Integration with IPFS for decentralized metadata storage. / Nuxchain proporciona herramientas completas de tokenización para crear y gestionar activos digitales. Las características incluyen: creación de tokens ERC-20 con parámetros personalizables, acuñación de NFTs ERC-721 con gestión de metadatos, capacidades de acuñación por lotes, configuración de regalías para creadores, y gestión de listas blancas para lanzamientos exclusivos. La sección de tokenización ofrece guías paso a paso y plantillas para diferentes tipos de tokens. Integración con IPFS para almacenamiento descentralizado de metadatos. Commands: 'Nuxchain tokenization', 'Nuxchain create token', 'Nuxchain mint NFT', 'Nuxchain whitelist'.",
    metadata: { type: "tokenization", category: "tools", topic: "overview" }
  },

  // === TECHNICAL INFORMATION ===
  {
    content: "Nuxchain platform supports wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Make sure to have POL for gas fees in transactions. The platform uses secure RPC endpoints and implements best practices for wallet security including transaction signing and approval flows. ENS (Ethereum Name Service) is supported for user-friendly addresses. / La plataforma Nuxchain soporta wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Asegúrate de tener POL para gas fees en transacciones. La plataforma usa endpoints RPC seguros e implementa mejores prácticas para seguridad de wallets incluyendo flujos de firma y aprobación de transacciones. ENS (Ethereum Name Service) es soportado para direcciones amigables al usuario. Commands: 'Nuxchain wallets', 'Nuxchain ENS'.",
    metadata: { type: "technical", category: "wallets", topic: "compatibility" }
  },
  {
    content: "Gas fees in Nuxchain are optimized on Polygon network with average transaction costs under $0.01. Fees vary according to network congestion: ~1-30 gwei for normal transactions. The platform implements gas optimization techniques including batch transactions and efficient contract calls. Use tools like Polygon Gas Station to monitor current rates. Emergency functions may have higher gas costs due to additional security checks. / Gas fees en Nuxchain están optimizados en la red Polygon con costos promedio de transacción bajo $0.01. Las tarifas varían según la congestión de la red: ~1-30 gwei para transacciones normales. La plataforma implementa técnicas de optimización de gas incluyendo transacciones por lotes y llamadas eficientes a contratos. Usa herramientas como Polygon Gas Station para monitorear las tarifas actuales. Las funciones de emergencia pueden tener costos de gas más altos debido a verificaciones de seguridad adicionales. Commands: 'Nuxchain gas fees', 'Nuxchain gas optimization'.",
    metadata: { type: "technical", category: "transactions", topic: "gas-fees" }
  },

  // === FAQ ===
  {
    content: "What if my transaction fails in Nuxchain? Check: sufficient POL for gas, wallet connected, limits not exceeded, contract not paused. Try increasing gas limit. Common errors include 'insufficient funds', 'execution reverted', or 'user rejected transaction'. For persistent issues, check Polygonscan for detailed error messages. / ¿Qué pasa si mi transacción falla en Nuxchain? Verifica: suficiente POL para gas, wallet conectada, límites no excedidos, contrato no pausado. Intenta aumentar gas limit. Errores comunes incluyen 'insufficient funds', 'execution reverted', o 'user rejected transaction'. Para problemas persistentes, verifica Polygonscan para mensajes de error detallados. Commands: 'Nuxchain transaction fails', 'Nuxchain troubleshooting'.",
    metadata: { type: "faq", category: "troubleshooting", topic: "transactions" }
  },
  {
    content: "How to maximize staking rewards in Nuxchain? 1) Stake larger amounts for better compound effects, 2) Use compound function regularly to reinvest rewards, 3) Keep funds staked longer for maximum ROI multiplier (up to 1.25x), 4) Monitor gas fees and compound during low-cost periods. The hourly ROI of 0.01% compounds over time for significant returns. / ¿Cómo maximizar las recompensas de staking en Nuxchain? 1) Haz staking de cantidades mayores para mejores efectos de interés compuesto, 2) Usa la función compound regularmente para reinvertir recompensas, 3) Mantén fondos en staking por más tiempo para el multiplicador máximo de ROI (hasta 1.25x), 4) Monitorea las tarifas de gas y haz compound durante períodos de bajo costo. El ROI por hora de 0.01% se compone con el tiempo para retornos significativos. Commands: 'Nuxchain maximize rewards', 'Nuxchain staking tips'.",
    metadata: { type: "faq", category: "optimization", topic: "staking-rewards" }
  },
  {
    content: "How to buy and sell NFTs on Nuxchain marketplace? To buy: 1) Browse marketplace or use filters, 2) Click on desired NFT, 3) Review details and price, 4) Click 'Buy Now' and confirm transaction. To sell: 1) Go to your profile/NFTs section, 2) Select NFT to list, 3) Set price in POL, 4) Confirm listing transaction. You can also make offers on unlisted NFTs or accept offers on your NFTs. / ¿Cómo comprar y vender NFTs en el marketplace de Nuxchain? Para comprar: 1) Navega el marketplace o usa filtros, 2) Haz clic en el NFT deseado, 3) Revisa detalles y precio, 4) Haz clic en 'Buy Now' y confirma la transacción. Para vender: 1) Ve a tu perfil/sección de NFTs, 2) Selecciona NFT para listar, 3) Establece precio en POL, 4) Confirma transacción de listado. También puedes hacer ofertas en NFTs no listados o aceptar ofertas en tus NFTs. Commands: 'Nuxchain buy NFT', 'Nuxchain sell NFT', 'Nuxchain NFT offers'.",
    metadata: { type: "faq", category: "tutorial", topic: "nft-trading" }
  }
];

// Función simple de búsqueda semántica
function searchKnowledgeBase(query) {
  const queryLower = query.toLowerCase();
  const results = [];
  
  for (const doc of knowledgeBase) {
    const content = doc.content.toLowerCase();
    let score = 0;
    
    // Búsqueda por palabras clave
    const keywords = ['staking', 'nux', 'validator', 'smart', 'contract', 'blockchain', 'tokens', 'rewards'];
    for (const keyword of keywords) {
      if (queryLower.includes(keyword) && content.includes(keyword)) {
        score += 0.1;
      }
    }
    
    // Búsqueda por coincidencias de texto
    const queryWords = queryLower.split(' ').filter(word => word.length > 3);
    for (const word of queryWords) {
      if (content.includes(word)) {
        score += 0.05;
      }
    }
    
    if (score > 0) {
      results.push({ ...doc, score });
    }
  }
  
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { prompt, messages, model = 'gemini-2.5-flash-lite', stream = true } = req.body;

    // Handle both prompt and messages format
    let contents;
    let userQuery = '';
    
    if (messages && Array.isArray(messages)) {
      // Convert messages to Gemini format
      contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
      }));
      // Get the last user message for knowledge base search
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      userQuery = lastUserMessage?.content || lastUserMessage?.parts?.[0]?.text || '';
    } else if (prompt) {
      contents = prompt;
      userQuery = typeof prompt === 'string' ? prompt : prompt.parts?.[0]?.text || '';
    } else {
      return res.status(400).json({ error: 'Either prompt or messages is required' });
    }

    console.log('🔍 Vercel: Buscando en base de conocimientos:', userQuery);
    
    // Search knowledge base
    const knowledgeResults = searchKnowledgeBase(userQuery);
    console.log('📚 Vercel: Encontrados', knowledgeResults.length, 'documentos relevantes');
    
    // Enhance prompt with knowledge base context if relevant results found
    if (knowledgeResults.length > 0) {
      const contextInfo = knowledgeResults.map(doc => doc.content).join('\n\n');
      
      // Add context to the conversation
      if (Array.isArray(contents)) {
        contents.push({
          role: 'user',
          parts: [{ text: `Contexto relevante de la base de conocimientos de Nuxchain:\n\n${contextInfo}\n\nPor favor, usa esta información para responder de manera más precisa y específica sobre Nuxchain.` }]
        });
      } else {
        contents = [
          { role: 'user', parts: [{ text: `Contexto relevante de la base de conocimientos de Nuxchain:\n\n${contextInfo}\n\nPregunta del usuario: ${userQuery}\n\nPor favor, responde usando la información del contexto.` }] }
        ];
      }
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    console.log('🚀 Vercel: Starting stream with model:', model);
    
    // Generate streaming content
    const streamResponse = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    console.log('✅ Vercel: Stream response received');

    // Process the stream
    for await (const chunk of streamResponse) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || chunk.text || '';
      if (text) {
        res.write(text);
      }
    }

    res.end();

  } catch (error) {
    console.error('❌ Vercel: Error in streaming:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Streaming failed',
        message: error.message,
        model: req.body.model || 'gemini-2.5-flash-lite'
      });
    } else {
      res.end('\n\nError: ' + error.message);
    }
  }
}