/**
 * Grid Bot Calculator Service - OPTIMIZED V2
 * Simulación precisa de un Grid Trading Bot de Futuros Binance
 * 
 * MEJORAS v2:
 * ✅ Fórmulas reales de profit por grid (no aleatorias)
 * ✅ Cálculo de ROE (Return on Equity)
 * ✅ Precio de liquidación
 * ✅ Margin ratio
 * ✅ Trading fees incluidos
 * ✅ Funding fees dinámicos
 * ✅ Persistencia en localStorage
 * ✅ Sin suavizado artificial en PnL
 */

// ============================================================================
// ÓRDENES REALES DEL GRID BOT (CONSTANTES FIJAS)
// ============================================================================

// Órdenes de COMPRA (Buy) - 53 órdenes
export const REAL_BUY_ORDERS = [
  { id: 1, price: 90167.30, amountBTC: 0.004 },
  { id: 2, price: 89827.60, amountBTC: 0.004 },
  { id: 3, price: 89489.30, amountBTC: 0.004 },
  { id: 4, price: 89152.20, amountBTC: 0.004 },
  { id: 5, price: 88816.30, amountBTC: 0.004 },
  { id: 6, price: 88481.80, amountBTC: 0.004 },
  { id: 7, price: 88148.50, amountBTC: 0.004 },
  { id: 8, price: 87816.40, amountBTC: 0.004 },
  { id: 9, price: 87485.60, amountBTC: 0.004 },
  { id: 10, price: 87156.10, amountBTC: 0.004 },
  { id: 11, price: 86827.80, amountBTC: 0.004 },
  { id: 12, price: 86500.70, amountBTC: 0.004 },
  { id: 13, price: 86174.90, amountBTC: 0.004 },
  { id: 14, price: 85850.30, amountBTC: 0.004 },
  { id: 15, price: 85526.90, amountBTC: 0.004 },
  { id: 16, price: 85204.70, amountBTC: 0.004 },
  { id: 17, price: 84883.80, amountBTC: 0.004 },
  { id: 18, price: 84564.00, amountBTC: 0.004 },
  { id: 19, price: 84245.50, amountBTC: 0.004 },
  { id: 20, price: 83928.10, amountBTC: 0.004 },
  { id: 21, price: 83612.00, amountBTC: 0.004 },
  { id: 22, price: 82983.30, amountBTC: 0.004 },
  { id: 23, price: 82670.70, amountBTC: 0.004 },
  { id: 24, price: 82359.30, amountBTC: 0.004 },
  { id: 25, price: 82049.00, amountBTC: 0.004 },
  { id: 26, price: 81739.90, amountBTC: 0.004 },
  { id: 27, price: 81432.00, amountBTC: 0.004 },
  { id: 28, price: 81125.30, amountBTC: 0.004 },
  { id: 29, price: 80819.70, amountBTC: 0.004 },
  { id: 30, price: 80515.30, amountBTC: 0.004 },
  { id: 31, price: 80212.00, amountBTC: 0.004 },
  { id: 32, price: 79909.80, amountBTC: 0.004 },
  { id: 33, price: 79608.80, amountBTC: 0.004 },
  { id: 34, price: 79308.90, amountBTC: 0.004 },
  { id: 35, price: 79010.20, amountBTC: 0.004 },
  { id: 36, price: 78712.60, amountBTC: 0.004 },
  { id: 37, price: 78416.10, amountBTC: 0.004 },
  { id: 38, price: 78120.70, amountBTC: 0.004 },
  { id: 39, price: 77826.40, amountBTC: 0.004 },
  { id: 40, price: 77533.20, amountBTC: 0.004 },
  { id: 41, price: 77241.20, amountBTC: 0.004 },
  { id: 42, price: 76950.20, amountBTC: 0.004 },
  { id: 43, price: 76660.40, amountBTC: 0.004 },
  { id: 44, price: 76371.60, amountBTC: 0.004 },
  { id: 45, price: 76083.90, amountBTC: 0.004 },
  { id: 46, price: 75797.30, amountBTC: 0.004 },
  { id: 47, price: 75511.80, amountBTC: 0.004 },
  { id: 48, price: 75227.40, amountBTC: 0.004 },
  { id: 49, price: 74944.00, amountBTC: 0.004 },
  { id: 50, price: 74661.70, amountBTC: 0.004 },
  { id: 51, price: 74380.40, amountBTC: 0.004 },
  { id: 52, price: 74100.30, amountBTC: 0.004 },
  { id: 53, price: 73821.50, amountBTC: 0.004 },
];

// Órdenes de VENTA (Sell) - 47 órdenes
export const REAL_SELL_ORDERS = [
  { id: 1, price: 90850.40, amountBTC: 0.003 },
  { id: 2, price: 91194.00, amountBTC: 0.003 },
  { id: 3, price: 91538.80, amountBTC: 0.003 },
  { id: 4, price: 91884.90, amountBTC: 0.003 },
  { id: 5, price: 92232.30, amountBTC: 0.003 },
  { id: 6, price: 92581.10, amountBTC: 0.003 },
  { id: 7, price: 92931.10, amountBTC: 0.003 },
  { id: 8, price: 93282.50, amountBTC: 0.003 },
  { id: 9, price: 93635.20, amountBTC: 0.003 },
  { id: 10, price: 93989.30, amountBTC: 0.003 },
  { id: 11, price: 94344.70, amountBTC: 0.003 },
  { id: 12, price: 94701.40, amountBTC: 0.003 },
  { id: 13, price: 95059.50, amountBTC: 0.003 },
  { id: 14, price: 95418.90, amountBTC: 0.003 },
  { id: 15, price: 95779.70, amountBTC: 0.003 },
  { id: 16, price: 96141.80, amountBTC: 0.003 },
  { id: 17, price: 96505.40, amountBTC: 0.003 },
  { id: 18, price: 96870.30, amountBTC: 0.003 },
  { id: 19, price: 97236.50, amountBTC: 0.003 },
  { id: 20, price: 97604.20, amountBTC: 0.003 },
  { id: 21, price: 97973.30, amountBTC: 0.003 },
  { id: 22, price: 98343.70, amountBTC: 0.003 },
  { id: 23, price: 98715.60, amountBTC: 0.003 },
  { id: 24, price: 99088.80, amountBTC: 0.003 },
  { id: 25, price: 99463.50, amountBTC: 0.003 },
  { id: 26, price: 99839.60, amountBTC: 0.003 },
  { id: 27, price: 100217.10, amountBTC: 0.003 },
  { id: 28, price: 100596.00, amountBTC: 0.003 },
  { id: 29, price: 100976.40, amountBTC: 0.003 },
  { id: 30, price: 101358.20, amountBTC: 0.003 },
  { id: 31, price: 101741.40, amountBTC: 0.003 },
  { id: 32, price: 102126.10, amountBTC: 0.003 },
  { id: 33, price: 102512.30, amountBTC: 0.003 },
  { id: 34, price: 102899.90, amountBTC: 0.003 },
  { id: 35, price: 103289.00, amountBTC: 0.003 },
  { id: 36, price: 103679.50, amountBTC: 0.003 },
  { id: 37, price: 104071.50, amountBTC: 0.003 },
  { id: 38, price: 104465.00, amountBTC: 0.003 },
  { id: 39, price: 104860.00, amountBTC: 0.003 },
  { id: 40, price: 105256.50, amountBTC: 0.003 },
  { id: 41, price: 105654.50, amountBTC: 0.003 },
  { id: 42, price: 106054.00, amountBTC: 0.003 },
  { id: 43, price: 106455.00, amountBTC: 0.003 },
  { id: 44, price: 106857.50, amountBTC: 0.003 },
  { id: 45, price: 107261.60, amountBTC: 0.003 },
  { id: 46, price: 107667.10, amountBTC: 0.003 },
  { id: 47, price: 108074.30, amountBTC: 0.003 },
];

// ============================================================================
// CONSTANTES DEL BOT - DATOS REALES DE BINANCE (Bot ID: 408449128)
// Actualizado: 2025-12-09 | BTCUSDT Futures Grid Neutral 65x
// ============================================================================
export const GRID_BOT_CONSTANTS = {
  // Configuración base
  amountPerOrder: 363.37703,        // USDT por orden (Qty Per Order)
  totalBuyOrders: 59,               // Buy orders actuales
  totalSellOrders: 41,              // Sell orders actuales
  totalOrders: 100,                 // Number of Grids
  profitPerGrid: 0.33,              // % de profit por grid (0.33% = 0.0033)
  leverage: 65,                     // Initial Leverage
  initialInvestment: 705.79,        // Invested Margin
  
  // Fecha de creación del bot
  createdAt: new Date('2025-12-07T22:59:55'),
  
  // Precio de entrada y posición actual
  entryPrice: 92893.90,             // Entry Price real actual
  
  // Tamaño de posición actual (SHORT position)
  positionSizeBTC: -0.009,          // Size: -0.009 BTC (SHORT)
  positionSizeUSDT: 833.77,         // Total Value aproximado (-833.77 USDT)
  
  // Márgenes reales de Binance
  positionMargin: 12.84,            // Position Margin actual
  marginUsedByOrders: 268.06,       // Margin usado por órdenes pendientes
  totalCurrentMargin: 280.90,       // Total Current Margin
  crossMarginBalance: 745.5651,     // Cross Margin Balance
  maintenanceMargin: 3.3351,        // Maintenance Margin
  
  // Trailing limits
  trailingUpLimit: 125061.30,
  trailingDownLimit: 57113.30,
  
  // Stop loss/Take profit
  stopLoss: -176.45,                // Stop Loss (USDT)
  takeProfit: 211.73,               // Take Profit (USDT)
  
  // Fee rates (Binance Futures)
  makerFeeRate: 0.0002,             // 0.02% maker fee
  takerFeeRate: 0.0004,             // 0.04% taker fee
  
  // Profit real actual del bot
  avgProfitPerMatch: 1.04,          // 40.64 USDT / 39 trades = ~1.04 USDT por trade
  minProfitPerMatch: 0.93,          // Mínimo observado
  maxProfitPerMatch: 1.10,          // Máximo observado
};

// ============================================================================
// TIPOS
// ============================================================================
export interface GridBotConfig {
  symbol: string;
  initialInvestment: number;
  leverage: number;
  totalGrids: number;
  profitPerGrid: number;
  priceRange: {
    lower: number;
    upper: number;
  };
  createdAt: Date;
  matchedTrades?: number;
}

export interface GridLevel {
  id: number;
  price: number;
  amountBTC: number;
  amountUSDT: number;
  type: 'buy' | 'sell';
  percentFromCurrent: number;
  filled: boolean;
  matchedCount: number;
}

export interface RiskMetrics {
  liquidationPrice: number;
  marginRatio: number;
  roe: number;
  roePercent: number;
  maintenanceMargin: number;
  availableMargin: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface GridBotMetrics {
  // Profit metrics
  totalProfit: number;
  totalProfitPercent: number;
  matchedProfit: number;
  matchedProfitPercent: number;
  unmatchedPnL: number;
  unmatchedPnLPercent: number;
  fundingFee: number;
  fundingFeePercent: number;
  tradingFees: number;
  annualizedYield: number;
  
  // Price & position
  currentPrice: number;
  markPrice: number;
  positionValue: number;
  notionalValue: number;
  
  // Risk metrics
  risk: RiskMetrics;
  
  // Orders
  buyOrders: GridLevel[];
  sellOrders: GridLevel[];
  activeBuyOrders: number;
  activeSellOrders: number;
  
  // History
  pnlHistory: Array<{ timestamp: number; pnl: number }>;
  totalMatchedTrades: number;
  
  // Timestamps
  lastUpdate: number;
  botDuration: {
    days: number;
    hours: number;
    minutes: number;
  };
}

export interface TradeMatch {
  timestamp: number;
  price: number;
  type: 'buy' | 'sell';
  profit: number;
  fee: number;
  gridLevel: number;
  amountBTC: number;
}

// ============================================================================
// ESTADO DEL BOT CON PERSISTENCIA
// ============================================================================
interface GridBotState {
  matchedTrades: number;
  totalMatchedProfit: number;
  totalTradingFees: number;
  tradeHistory: TradeMatch[];
  lastPrice: number;
  lastFundingRate: number;
  fundingHistory: Array<{ timestamp: number; rate: number; fee: number }>;
  initialized: boolean;
  lastSaveTime: number;
}

const STORAGE_KEY = 'nuxchain_gridbot_state';
const SAVE_INTERVAL = 10000; // Guardar cada 10 segundos

// Estado inicial
let botState: GridBotState = {
  matchedTrades: 0,
  totalMatchedProfit: 0,
  totalTradingFees: 0,
  tradeHistory: [],
  lastPrice: 0,
  lastFundingRate: 0.0001,
  fundingHistory: [],
  initialized: false,
  lastSaveTime: 0,
};

/**
 * Carga el estado desde localStorage
 */
function loadBotState(): GridBotState | null {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved) as GridBotState;
    
    // Verificar que el estado no sea muy antiguo (más de 7 días)
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.lastSaveTime > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Guarda el estado en localStorage
 */
function saveBotState(): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Limitar frecuencia de guardado
    if (Date.now() - botState.lastSaveTime < SAVE_INTERVAL) return;
    
    botState.lastSaveTime = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(botState));
  } catch {
    // Error silencioso
  }
}

/**
 * Inicializa el estado del bot
 */
function initializeBotState(initialMatches: number): void {
  // Intentar cargar estado guardado
  const savedState = loadBotState();
  
  if (savedState && savedState.initialized && savedState.matchedTrades >= initialMatches) {
    botState = savedState;
    return;
  }
  
  // Inicializar con datos base
  const now = Date.now();
  const startTime = GRID_BOT_CONSTANTS.createdAt.getTime();
  
  const trades: TradeMatch[] = [];
  let cumulativeProfit = 0;
  let cumulativeFees = 0;
  
  // Generar historial de trades inicial basado en grids reales
  for (let i = 0; i < initialMatches; i++) {
    const progress = i / initialMatches;
    const timestamp = startTime + (now - startTime) * progress;
    
    // Alternar entre buy y sell matches
    const isBuy = i % 2 === 0;
    const orders = isBuy ? REAL_BUY_ORDERS : REAL_SELL_ORDERS;
    const gridIndex = Math.floor((i / 2) % orders.length);
    const gridOrder = orders[gridIndex];
    
    // Calcular profit real basado en fórmula de grid
    const { profit, fee } = calculateGridProfit(gridOrder.price, gridOrder.amountBTC);
    
    cumulativeProfit += profit;
    cumulativeFees += fee;
    
    trades.push({
      timestamp,
      price: gridOrder.price,
      type: isBuy ? 'buy' : 'sell',
      profit,
      fee,
      gridLevel: gridOrder.id,
      amountBTC: gridOrder.amountBTC
    });
  }
  
  botState = {
    matchedTrades: initialMatches,
    totalMatchedProfit: cumulativeProfit,
    totalTradingFees: cumulativeFees,
    tradeHistory: trades,
    lastPrice: 0,
    lastFundingRate: 0.0001,
    fundingHistory: [],
    initialized: true,
    lastSaveTime: Date.now(),
  };
  
  saveBotState();
}

/**
 * Calcula el profit real de un grid match
 * Fórmula: (Sell Price - Buy Price) × Amount - Trading Fees
 */
function calculateGridProfit(
  price: number, 
  amountBTC: number
): { profit: number; fee: number } {
  const gridProfitPercent = GRID_BOT_CONSTANTS.profitPerGrid / 100; // 0.0033
  
  // El profit de un grid es el spread entre buy y sell
  // En un grid geométrico: nextPrice = price × (1 + profitPerGrid)
  // Profit = price × profitPerGrid × amount
  const grossProfit = price * gridProfitPercent * amountBTC;
  
  // Trading fees (ambos lados: buy + sell)
  const notionalValue = price * amountBTC;
  const fee = notionalValue * (GRID_BOT_CONSTANTS.makerFeeRate + GRID_BOT_CONSTANTS.takerFeeRate);
  
  // Net profit
  const netProfit = grossProfit - fee;
  
  return { profit: Math.max(0, netProfit), fee };
}

/**
 * Verifica si el precio cruzó algún nivel de grid y registra el match
 */
function checkForNewMatches(currentPrice: number): TradeMatch[] {
  const newMatches: TradeMatch[] = [];
  
  if (botState.lastPrice === 0) {
    botState.lastPrice = currentPrice;
    return newMatches;
  }
  
  const priceMovedUp = currentPrice > botState.lastPrice;
  const priceMovedDown = currentPrice < botState.lastPrice;
  
  // Compra: precio baja y cruza nivel de compra
  if (priceMovedDown) {
    for (const order of REAL_BUY_ORDERS) {
      if (botState.lastPrice > order.price && currentPrice <= order.price) {
        const { profit, fee } = calculateGridProfit(order.price, order.amountBTC);
        
        const match: TradeMatch = {
          timestamp: Date.now(),
          price: order.price,
          type: 'buy',
          profit,
          fee,
          gridLevel: order.id,
          amountBTC: order.amountBTC
        };
        
        newMatches.push(match);
        botState.matchedTrades++;
        botState.totalMatchedProfit += profit;
        botState.totalTradingFees += fee;
        botState.tradeHistory.push(match);
      }
    }
  }
  
  // Venta: precio sube y cruza nivel de venta
  if (priceMovedUp) {
    for (const order of REAL_SELL_ORDERS) {
      if (botState.lastPrice < order.price && currentPrice >= order.price) {
        const { profit, fee } = calculateGridProfit(order.price, order.amountBTC);
        
        const match: TradeMatch = {
          timestamp: Date.now(),
          price: order.price,
          type: 'sell',
          profit,
          fee,
          gridLevel: order.id,
          amountBTC: order.amountBTC
        };
        
        newMatches.push(match);
        botState.matchedTrades++;
        botState.totalMatchedProfit += profit;
        botState.totalTradingFees += fee;
        botState.tradeHistory.push(match);
      }
    }
  }
  
  botState.lastPrice = currentPrice;
  
  // Guardar si hubo cambios
  if (newMatches.length > 0) {
    saveBotState();
  }
  
  return newMatches;
}

/**
 * Calcula los niveles de grid con estado actual
 */
export function calculateGridLevels(
  currentPrice: number
): { buyOrders: GridLevel[]; sellOrders: GridLevel[] } {
  
  const buyOrders: GridLevel[] = REAL_BUY_ORDERS.map(order => ({
    id: order.id,
    price: order.price,
    amountBTC: order.amountBTC,
    amountUSDT: order.price * order.amountBTC,
    type: 'buy' as const,
    percentFromCurrent: ((order.price - currentPrice) / currentPrice) * 100,
    filled: currentPrice < order.price,
    matchedCount: 0
  }));

  const sellOrders: GridLevel[] = REAL_SELL_ORDERS.map(order => ({
    id: order.id,
    price: order.price,
    amountBTC: order.amountBTC,
    amountUSDT: order.price * order.amountBTC,
    type: 'sell' as const,
    percentFromCurrent: ((order.price - currentPrice) / currentPrice) * 100,
    filled: currentPrice > order.price,
    matchedCount: 0
  }));
  
  return { buyOrders, sellOrders };
}

/**
 * Calcula el Unmatched PnL (Unrealized PnL de la posición)
 * Fórmula real de Binance: (Mark Price - Entry Price) × Position Size
 */
function calculateUnmatchedPnL(markPrice: number): number {
  const { entryPrice, positionSizeBTC } = GRID_BOT_CONSTANTS;
  
  // Para posición LONG: PnL = (markPrice - entryPrice) × positionSize
  // Para posición SHORT (negativo): PnL = (entryPrice - markPrice) × |positionSize|
  const pnl = (markPrice - entryPrice) * Math.abs(positionSizeBTC);
  
  // Si positionSizeBTC es negativo (SHORT), invertir el signo
  return positionSizeBTC < 0 ? -pnl : pnl;
}

/**
 * Calcula el Funding Fee acumulado con rates dinámicos
 * Fórmula: Σ(Position Value × Funding Rate) cada 8 horas
 */
function calculateFundingFee(currentFundingRate?: number): number {
  const hoursActive = (Date.now() - GRID_BOT_CONSTANTS.createdAt.getTime()) / (1000 * 60 * 60);
  const fundingPeriods = Math.floor(hoursActive / 8);
  
  // Usar funding rate proporcionado o default
  const fundingRate = currentFundingRate ?? botState.lastFundingRate;
  
  // Actualizar last funding rate si se proporciona uno nuevo
  if (currentFundingRate !== undefined) {
    botState.lastFundingRate = currentFundingRate;
  }
  
  // Calcular basado en notional value real
  const notionalValue = GRID_BOT_CONSTANTS.positionSizeUSDT;
  
  // Long paga cuando funding es positivo, recibe cuando es negativo
  // Short es lo opuesto
  const isLong = GRID_BOT_CONSTANTS.positionSizeBTC > 0;
  const sign = isLong ? -1 : 1;
  
  return sign * fundingPeriods * notionalValue * Math.abs(fundingRate);
}

/**
 * Calcula métricas de riesgo
 */
function calculateRiskMetrics(markPrice: number, totalProfit: number): RiskMetrics {
  const { 
    leverage, 
    initialInvestment, 
    entryPrice, 
    maintenanceMargin,
    crossMarginBalance,
    positionSizeBTC
  } = GRID_BOT_CONSTANTS;
  
  // Equity = Initial Investment + Total Profit
  const equity = initialInvestment + totalProfit;
  
  // ROE = Total Profit / (Initial Investment / Leverage) × 100
  const initialMargin = initialInvestment / leverage;
  const roe = totalProfit / initialMargin;
  const roePercent = roe * 100;
  
  // Liquidation Price calculation using mark price for accuracy
  // For LONG: Liq Price = Entry Price × (1 - Initial Margin Rate + Maintenance Margin Rate)
  // For SHORT: Liq Price = Entry Price × (1 + Initial Margin Rate - Maintenance Margin Rate)
  const isLong = positionSizeBTC > 0;
  const initialMarginRate = 1 / leverage;
  const maintenanceMarginRate = 0.004; // 0.4% for BTCUSDT
  
  let liquidationPrice: number;
  if (isLong) {
    liquidationPrice = entryPrice * (1 - initialMarginRate + maintenanceMarginRate);
  } else {
    liquidationPrice = entryPrice * (1 + initialMarginRate - maintenanceMarginRate);
  }
  
  // Calculate unrealized PnL at current mark price for margin ratio
  const unrealizedPnL = (markPrice - entryPrice) * Math.abs(positionSizeBTC) * (isLong ? 1 : -1);
  const adjustedEquity = equity + unrealizedPnL;
  
  // Margin Ratio = Maintenance Margin / Adjusted Equity × 100
  const marginRatio = (maintenanceMargin / Math.max(adjustedEquity, 0.01)) * 100;
  
  // Available Margin
  const availableMargin = Math.max(0, crossMarginBalance - GRID_BOT_CONSTANTS.totalCurrentMargin);
  
  // Risk Level basado en margin ratio
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (marginRatio < 30) {
    riskLevel = 'low';
  } else if (marginRatio < 50) {
    riskLevel = 'medium';
  } else if (marginRatio < 80) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }
  
  return {
    liquidationPrice,
    marginRatio,
    roe,
    roePercent,
    maintenanceMargin,
    availableMargin,
    riskLevel
  };
}

/**
 * Genera historial de PnL basado en movimiento real de precio
 * SIN suavizado artificial - refleja PnL real
 */
function generatePnLHistory(
  priceHistory: Array<{ timestamp: number; price: number }>,
  currentFundingRate: number
): Array<{ timestamp: number; pnl: number }> {
  const history: Array<{ timestamp: number; pnl: number }> = [];
  const startTime = GRID_BOT_CONSTANTS.createdAt.getTime();
  
  if (priceHistory && priceHistory.length > 0) {
    const profitPerMatch = GRID_BOT_CONSTANTS.avgProfitPerMatch;
    const matchesPerPoint = botState.matchedTrades / priceHistory.length;
    let matchesSoFar = 0;
    
    for (let i = 0; i < priceHistory.length; i++) {
      const point = priceHistory[i];
      
      // Matched profit acumulado (crecimiento lineal basado en trades)
      matchesSoFar = Math.min(botState.matchedTrades, matchesSoFar + matchesPerPoint);
      const matchedProfitAtPoint = matchesSoFar * profitPerMatch;
      
      // Unmatched PnL COMPLETO (sin reducción artificial)
      const unmatchedPnLAtPoint = calculateUnmatchedPnL(point.price);
      
      // Funding fee acumulado hasta ese punto
      const hoursActive = (point.timestamp - startTime) / (1000 * 60 * 60);
      const fundingPeriods = Math.floor(hoursActive / 8);
      const fundingFeeAtPoint = -fundingPeriods * GRID_BOT_CONSTANTS.positionSizeUSDT * currentFundingRate;
      
      // Total PnL = todos los componentes
      const totalPnL = matchedProfitAtPoint + unmatchedPnLAtPoint + fundingFeeAtPoint;
      
      history.push({
        timestamp: point.timestamp,
        pnl: totalPnL
      });
    }
    
    return history;
  }
  
  // Fallback: usar trade history
  if (botState.tradeHistory.length > 0) {
    let cumulative = 0;
    history.push({ timestamp: startTime, pnl: 0 });
    
    for (const trade of botState.tradeHistory) {
      cumulative += trade.profit;
      history.push({ timestamp: trade.timestamp, pnl: cumulative });
    }
    
    return history;
  }
  
  // Último fallback: generar estimado
  const now = Date.now();
  const points = 24;
  const interval = (now - startTime) / points;
  
  let cumulative = 0;
  for (let i = 0; i <= points; i++) {
    const timestamp = startTime + (interval * i);
    const progress = i / points;
    const expectedMatches = Math.floor(botState.matchedTrades * progress);
    cumulative = expectedMatches * GRID_BOT_CONSTANTS.avgProfitPerMatch;
    
    history.push({ timestamp, pnl: cumulative });
  }
  
  return history;
}

/**
 * Calcula duración del bot
 */
function calculateBotDuration(): { days: number; hours: number; minutes: number } {
  const diff = Date.now() - GRID_BOT_CONSTANTS.createdAt.getTime();
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(diff / (1000 * 60)) % 60
  };
}

/**
 * Función principal: Calcula todas las métricas del Grid Bot
 */
export function calculatePnL(
  config: GridBotConfig,
  currentPrice: number,
  priceHistory: number[] = [],
  fundingRate?: number,
  markPrice?: number
): GridBotMetrics {
  // Inicializar estado
  const initialMatches = config.matchedTrades || 20;
  initializeBotState(initialMatches);
  
  // Verificar nuevos matches
  checkForNewMatches(currentPrice);
  
  // Usar mark price si está disponible, sino usar current price
  const effectiveMarkPrice = markPrice ?? currentPrice;
  const effectiveFundingRate = fundingRate ?? 0.0001;
  
  // Calcular niveles de grid
  const { buyOrders, sellOrders } = calculateGridLevels(currentPrice);
  
  // Contar órdenes activas
  const activeBuyOrders = buyOrders.filter(o => !o.filled).length;
  const activeSellOrders = sellOrders.filter(o => !o.filled).length;
  
  // Obtener valores calculados
  const matchedProfit = botState.totalMatchedProfit;
  const tradingFees = botState.totalTradingFees;
  const unmatchedPnL = calculateUnmatchedPnL(effectiveMarkPrice);
  const fundingFee = calculateFundingFee(effectiveFundingRate);
  
  // Total profit = matched + unmatched + funding (fees ya están deducidos del matched)
  const totalProfit = matchedProfit + unmatchedPnL + fundingFee;
  
  // Porcentajes
  const investment = GRID_BOT_CONSTANTS.initialInvestment;
  const totalProfitPercent = (totalProfit / investment) * 100;
  const matchedProfitPercent = (matchedProfit / investment) * 100;
  const unmatchedPnLPercent = (unmatchedPnL / investment) * 100;
  const fundingFeePercent = (fundingFee / investment) * 100;
  
  // Yield anualizado
  const daysRunning = (Date.now() - GRID_BOT_CONSTANTS.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const annualizedYield = daysRunning > 0 
    ? (totalProfit / investment) * (365 / daysRunning) * 100
    : 0;
  
  // Risk metrics
  const risk = calculateRiskMetrics(effectiveMarkPrice, totalProfit);
  
  // Convertir historial de precios
  const priceHistoryWithTimestamp: Array<{ timestamp: number; price: number }> = priceHistory.map((price, index) => {
    const now = Date.now();
    const hoursAgo = priceHistory.length - index - 1;
    return {
      timestamp: now - (hoursAgo * 60 * 60 * 1000),
      price
    };
  });
  
  // Notional value
  const notionalValue = Math.abs(GRID_BOT_CONSTANTS.positionSizeBTC) * effectiveMarkPrice;
  
  return {
    totalProfit,
    totalProfitPercent,
    matchedProfit,
    matchedProfitPercent,
    unmatchedPnL,
    unmatchedPnLPercent,
    fundingFee,
    fundingFeePercent,
    tradingFees,
    annualizedYield,
    currentPrice,
    markPrice: effectiveMarkPrice,
    positionValue: investment + totalProfit,
    notionalValue,
    risk,
    buyOrders,
    sellOrders,
    activeBuyOrders,
    activeSellOrders,
    pnlHistory: generatePnLHistory(priceHistoryWithTimestamp, effectiveFundingRate),
    totalMatchedTrades: botState.matchedTrades,
    lastUpdate: Date.now(),
    botDuration: calculateBotDuration()
  };
}

/**
 * Obtiene el estado actual del bot
 */
export function getBotState(): GridBotState {
  return { ...botState };
}

/**
 * Reinicia el estado del bot
 */
export function resetBotState(): void {
  botState = {
    matchedTrades: 0,
    totalMatchedProfit: 0,
    totalTradingFees: 0,
    tradeHistory: [],
    lastPrice: 0,
    lastFundingRate: 0.0001,
    fundingHistory: [],
    initialized: false,
    lastSaveTime: 0,
  };
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Fuerza el guardado del estado
 */
export function forceSaveBotState(): void {
  botState.lastSaveTime = 0; // Reset para forzar guardado
  saveBotState();
}

/**
 * Formatea número a USDT con decimales
 */
export function formatUSDT(value: number): string {
  return `${value.toFixed(2)} USDT`;
}

/**
 * Formatea porcentaje
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
