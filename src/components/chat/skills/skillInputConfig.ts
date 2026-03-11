/**
 * Skill Input Configuration
 * Defines the form fields required for each AI Skill invocation.
 * Used by SkillInputModal to render dynamic forms per skill.
 */

import type { SkillId } from '../../../constants/subscription';

export type FieldType = 'text' | 'textarea' | 'select' | 'number';

export interface SkillField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  autoFillWallet?: boolean;  // auto-fill with connected wallet address
  hint?: string;
  maxLength?: number;
}

export interface SkillInputConfig {
  fields: SkillField[];
  /** Auto-analysis prompt sent to Gemini after the skill result is received */
  analysisPrompt: (params: Record<string, unknown>, result: unknown) => string;
}

const CHAIN_OPTIONS = [
  { value: 'polygon', label: 'Polygon' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'base', label: 'Base' },
  { value: 'optimism', label: 'Optimism' },
];

const RISK_OPTIONS = [
  { value: 'low', label: 'Low — preserve capital' },
  { value: 'medium', label: 'Medium — balanced' },
  { value: 'high', label: 'High — maximize yield' },
];

export const SKILL_INPUT_CONFIG: Record<SkillId, SkillInputConfig> = {
  'nft-listing': {
    fields: [
      {
        key: 'ipfsHash',
        label: 'IPFS Hash (or NFT contract address)',
        type: 'text',
        required: false,
        placeholder: 'QmXoypiz... or 0x...',
        hint: 'Provide IPFS hash or contract address. At least one is required.',
      },
      {
        key: 'nftAddress',
        label: 'NFT Contract Address',
        type: 'text',
        required: false,
        placeholder: '0xAbc123...',
      },
      {
        key: 'collectionName',
        label: 'Collection Name',
        type: 'text',
        required: false,
        placeholder: 'My Awesome Collection',
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
      {
        key: 'additionalInfo',
        label: 'Additional Context',
        type: 'textarea',
        required: false,
        placeholder: 'Art style, story, special traits...',
        maxLength: 500,
      },
    ],
    analysisPrompt: (params, result) =>
      `[NFT Listing Skill Result]\nI just generated an NFT listing package for "${(params.collectionName as string) || 'my NFT'}" and got this result:\n${JSON.stringify(result, null, 2)}\n\nAnaliza brevemente los puntos más importantes para maximizar el éxito del listado. ¿El título y descripción están optimizados? ¿Hay algo que mejorarías?`,
  },

  'risk-analysis': {
    fields: [
      {
        key: 'tokenAddress',
        label: 'Token or Pool Address',
        type: 'text',
        required: false,
        placeholder: '0xToken... or 0xPool...',
        hint: 'At least one of token address or pool address is required.',
      },
      {
        key: 'tokenSymbol',
        label: 'Token Symbol',
        type: 'text',
        required: false,
        placeholder: 'NUX, WMATIC, USDC...',
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
      {
        key: 'additionalContext',
        label: 'Additional Context',
        type: 'textarea',
        required: false,
        placeholder: 'Recent events, team info, any context that helps the analysis...',
        maxLength: 500,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { overallRiskScore?: number; riskLevel?: string };
      return `[Risk Analysis Skill Result]\nEl análisis de riesgo para "${(params.tokenSymbol as string) || params.tokenAddress}" arrojó: Risk Score ${r?.overallRiskScore ?? '?'}/100 — Nivel ${r?.riskLevel ?? '?'}.\n\nDame una conclusión en 3-4 oraciones: ¿vale la pena invertir en este token dado su perfil de riesgo? ¿Cuál es el factor más crítico?`;
    },
  },

  'market-alpha': {
    fields: [
      {
        key: 'tokenA',
        label: 'Token A',
        type: 'text',
        required: false,
        placeholder: 'POL, ETH, USDC...',
      },
      {
        key: 'tokenB',
        label: 'Token B',
        type: 'text',
        required: false,
        placeholder: 'USDC, WETH...',
      },
      {
        key: 'poolAddress',
        label: 'Pool Address (optional)',
        type: 'text',
        required: false,
        placeholder: '0xPool...',
      },
      {
        key: 'tvl',
        label: 'TVL in USD (optional)',
        type: 'number',
        required: false,
        placeholder: '1000000',
      },
      {
        key: 'volume24h',
        label: '24h Volume in USD (optional)',
        type: 'number',
        required: false,
        placeholder: '500000',
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { marketCondition?: string; headline?: string };
      return `[Market Alpha Skill Result]\nAnálisis del par ${params.tokenA || '?'}/${params.tokenB || '?'}: ${r?.headline ?? ''}\nCondición de mercado: ${r?.marketCondition ?? '?'}.\n\nEn base a este análisis, ¿cuál es la mejor estrategia a seguir hoy? Dame 2-3 acciones concretas.`;
    },
  },

  'content-moderation': {
    fields: [
      {
        key: 'content',
        label: 'Content to Analyze',
        type: 'textarea',
        required: true,
        placeholder: 'Paste the text, NFT description, or message to analyze...',
        maxLength: 5000,
        hint: 'Max 5,000 characters.',
      },
      {
        key: 'context',
        label: 'Platform Context',
        type: 'text',
        required: false,
        placeholder: 'NFT marketplace, Discord, etc.',
      },
      {
        key: 'platform',
        label: 'Platform Name',
        type: 'text',
        required: false,
        placeholder: 'NuxChain',
      },
    ],
    analysisPrompt: (_params, result) => {
      const r = result as { verdict?: string; confidence?: number; category?: string };
      return `[Content Moderation Result]\nVerdicto: ${r?.verdict?.toUpperCase() ?? '?'} (${Math.round((r?.confidence ?? 0) * 100)}% confianza) — Categoría: ${r?.category ?? '?'}.\n\n¿Debo tomar alguna acción? ¿Cómo debería comunicarle el resultado al usuario si el contenido es rechazado?`;
    },
  },

  'contract-auditor': {
    fields: [
      {
        key: 'contractName',
        label: 'Contract Name',
        type: 'text',
        required: false,
        placeholder: 'MyToken, Staking, etc.',
      },
      {
        key: 'sourceCode',
        label: 'Solidity Source Code',
        type: 'textarea',
        required: false,
        placeholder: 'pragma solidity ^0.8.0;\n// Paste contract here...',
        hint: 'Paste source code OR ABI JSON. At least one is required.',
        maxLength: 8000,
      },
      {
        key: 'abi',
        label: 'ABI JSON (alternative to source)',
        type: 'textarea',
        required: false,
        placeholder: '[{"name":"transfer","type":"function",...}]',
        maxLength: 6000,
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { overallRisk?: string; securityScore?: number; vulnerabilities?: unknown[] };
      return `[Contract Audit Result]\nContrato "${(params.contractName as string) || 'sin nombre'}": Risk ${r?.overallRisk ?? '?'}, Score ${r?.securityScore ?? '?'}/100, ${r?.vulnerabilities?.length ?? 0} vulnerabilidades.\n\n¿Cuáles son las 2-3 vulnerabilidades más críticas que hay que corregir antes de hacer deploy? ¿El contrato es seguro para producción?`;
    },
  },

  'whale-tracker': {
    fields: [
      {
        key: 'walletAddress',
        label: 'Whale Wallet Address',
        type: 'text',
        required: true,
        placeholder: '0xWhale...',
        autoFillWallet: true,
        hint: 'Auto-filled with your connected wallet. Change to analyze any address.',
      },
      {
        key: 'tokenSymbol',
        label: 'Focus Token (optional)',
        type: 'text',
        required: false,
        placeholder: 'NUX, WMATIC...',
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { whaleClassification?: string; behavioralPattern?: string };
      return `[Whale Tracker Result]\nWallet ${(params.walletAddress as string).slice(0, 8)}...: Clasificación "${r?.whaleClassification ?? '?'}", patrón "${r?.behavioralPattern ?? '?'}".\n\n¿Qué significa este comportamiento para el mercado? ¿Debo preocuparme o aprovechar alguna oportunidad basada en los movimientos de esta wallet?`;
    },
  },

  'portfolio-analyzer': {
    fields: [
      {
        key: 'walletAddress',
        label: 'Wallet Address',
        type: 'text',
        required: true,
        placeholder: '0xYourWallet...',
        autoFillWallet: true,
        hint: 'Auto-filled with your connected wallet.',
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { portfolioGrade?: string; riskProfile?: string; diversificationScore?: number };
      return `[Portfolio Analysis Result]\nWallet ${(params.walletAddress as string).slice(0, 8)}...: Grade ${r?.portfolioGrade ?? '?'}, Riesgo ${r?.riskProfile ?? '?'}, Diversificación ${r?.diversificationScore ?? '?'}/100.\n\n¿Cuáles son las 3 acciones más importantes que debería tomar hoy para mejorar mi portafolio? ¿Dónde estoy más expuesto?`;
    },
  },

  'token-research': {
    fields: [
      {
        key: 'tokenSymbol',
        label: 'Token Symbol',
        type: 'text',
        required: false,
        placeholder: 'NUX, ETH, ARB...',
        hint: 'Provide token symbol or address. At least one is required.',
      },
      {
        key: 'tokenAddress',
        label: 'Token Contract Address (optional)',
        type: 'text',
        required: false,
        placeholder: '0xToken...',
      },
      {
        key: 'tokenName',
        label: 'Token Name (optional)',
        type: 'text',
        required: false,
        placeholder: 'NuxChain Token',
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
      {
        key: 'additionalContext',
        label: 'Research Focus (optional)',
        type: 'textarea',
        required: false,
        placeholder: 'Focus on tokenomics, team risk, use case viability...',
        maxLength: 300,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { researchGrade?: string; investmentThesis?: string };
      return `[Token Research Result]\nToken ${(params.tokenSymbol as string) || params.tokenAddress}: Research Grade ${r?.researchGrade ?? '?'}.\n\nEn base a este research, dame una recomendación de inversión concreta: comprar, mantener, evitar. Justifica tu respuesta en 3-5 oraciones.`;
    },
  },

  'liquidity-advisor': {
    fields: [
      {
        key: 'tokenA',
        label: 'Token A',
        type: 'text',
        required: true,
        placeholder: 'POL, ETH...',
      },
      {
        key: 'tokenB',
        label: 'Token B',
        type: 'text',
        required: true,
        placeholder: 'USDC, WETH...',
      },
      {
        key: 'currentPrice',
        label: 'Current Price (Token A in Token B)',
        type: 'number',
        required: false,
        placeholder: '0.43',
      },
      {
        key: 'investmentAmount',
        label: 'Investment Amount in USD',
        type: 'number',
        required: false,
        placeholder: '1000',
      },
      {
        key: 'feeTier',
        label: 'Fee Tier',
        type: 'select',
        required: false,
        options: [
          { value: '500', label: '0.05% — Stablecoins' },
          { value: '3000', label: '0.3% — Most pairs' },
          { value: '10000', label: '1% — Exotic pairs' },
        ],
      },
      {
        key: 'riskTolerance',
        label: 'Risk Tolerance',
        type: 'select',
        required: false,
        options: RISK_OPTIONS,
      },
      {
        key: 'chain',
        label: 'Chain',
        type: 'select',
        required: false,
        options: CHAIN_OPTIONS,
      },
    ],
    analysisPrompt: (params, result) => {
      const r = result as { strategyType?: string; impermanentLossRisk?: string };
      return `[Liquidity Advisor Result]\nPar ${params.tokenA}/${params.tokenB}: Estrategia "${r?.strategyType ?? '?'}", IL Risk ${r?.impermanentLossRisk ?? '?'}.\n\nExplícame el rango óptimo sugerido en términos simples. ¿Cuándo debería rebalancear mi posición? ¿Cuál es el mayor riesgo de esta posición?`;
    },
  },
};
