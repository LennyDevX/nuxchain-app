/**
 * AI Analysis Configuration
 * Configuración avanzada para personalizar el comportamiento del sistema de análisis
 */

export interface AnalysisConfig {
  // Pesos máximos para cada componente del score (total debe ser 100)
  weights: {
    amountScore: number;      // Default: 25
    consistencyScore: number; // Default: 20
    rewardsScore: number;     // Default: 25
    diversificationScore: number; // Default: 15
    engagementScore: number;  // Default: 15
  };
  
  // Umbrales para los niveles de score
  scoreLevels: {
    master: number;      // Default: 90
    expert: number;      // Default: 75
    advanced: number;    // Default: 60
    intermediate: number; // Default: 40
    // Beginner es todo lo que esté por debajo de intermediate
  };
  
  // Configuración de recomendaciones
  recommendations: {
    maxRecommendations: number; // Default: 10
    priorityThresholds: {
      high: number;    // Score threshold para recomendaciones high priority
      medium: number;  // Score threshold para recomendaciones medium priority
    };
  };
  
  // Configuración de actualizaciones
  updates: {
    autoRefreshInterval: number; // En milisegundos, default: 30000 (30s)
    enableAutoRefresh: boolean;  // Default: true
  };
  
  // Configuración de percentiles (para simulación)
  percentiles: {
    useRealData: boolean; // Default: false (usa distribución simulada)
    distributionCurve: 'normal' | 'exponential' | 'uniform'; // Default: 'normal'
  };
}

// Configuración por defecto
export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  weights: {
    amountScore: 25,
    consistencyScore: 20,
    rewardsScore: 25,
    diversificationScore: 15,
    engagementScore: 15,
  },
  scoreLevels: {
    master: 90,
    expert: 75,
    advanced: 60,
    intermediate: 40,
  },
  recommendations: {
    maxRecommendations: 10,
    priorityThresholds: {
      high: 50,
      medium: 70,
    },
  },
  updates: {
    autoRefreshInterval: 30000, // 30 segundos
    enableAutoRefresh: true,
  },
  percentiles: {
    useRealData: false,
    distributionCurve: 'normal',
  },
};

// Configuración para modo "Strict" (más exigente)
export const STRICT_ANALYSIS_CONFIG: AnalysisConfig = {
  ...DEFAULT_ANALYSIS_CONFIG,
  scoreLevels: {
    master: 95,
    expert: 85,
    advanced: 70,
    intermediate: 50,
  },
  recommendations: {
    maxRecommendations: 15,
    priorityThresholds: {
      high: 60,
      medium: 80,
    },
  },
};

// Configuración para modo "Lenient" (más permisivo)
export const LENIENT_ANALYSIS_CONFIG: AnalysisConfig = {
  ...DEFAULT_ANALYSIS_CONFIG,
  scoreLevels: {
    master: 85,
    expert: 70,
    advanced: 50,
    intermediate: 30,
  },
  recommendations: {
    maxRecommendations: 8,
    priorityThresholds: {
      high: 40,
      medium: 60,
    },
  },
};

/**
 * Valida que la configuración sea correcta
 */
export function validateConfig(config: AnalysisConfig): boolean {
  // Verificar que los pesos sumen 100
  const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(totalWeight - 100) > 0.1) {
    console.error(`Invalid weights: total is ${totalWeight}, should be 100`);
    return false;
  }
  
  // Verificar que los umbrales estén en orden descendente
  const { master, expert, advanced, intermediate } = config.scoreLevels;
  if (master <= expert || expert <= advanced || advanced <= intermediate || intermediate <= 0) {
    console.error('Invalid score level thresholds: must be in descending order');
    return false;
  }
  
  // Verificar que los umbrales estén entre 0 y 100
  if (master > 100 || intermediate < 0) {
    console.error('Invalid score level thresholds: must be between 0 and 100');
    return false;
  }
  
  return true;
}

/**
 * Aplica una configuración personalizada (para uso futuro)
 */
export function applyConfig(config: Partial<AnalysisConfig>): AnalysisConfig {
  const mergedConfig = {
    ...DEFAULT_ANALYSIS_CONFIG,
    ...config,
    weights: {
      ...DEFAULT_ANALYSIS_CONFIG.weights,
      ...(config.weights || {}),
    },
    scoreLevels: {
      ...DEFAULT_ANALYSIS_CONFIG.scoreLevels,
      ...(config.scoreLevels || {}),
    },
    recommendations: {
      ...DEFAULT_ANALYSIS_CONFIG.recommendations,
      ...(config.recommendations || {}),
    },
    updates: {
      ...DEFAULT_ANALYSIS_CONFIG.updates,
      ...(config.updates || {}),
    },
    percentiles: {
      ...DEFAULT_ANALYSIS_CONFIG.percentiles,
      ...(config.percentiles || {}),
    },
  };
  
  if (!validateConfig(mergedConfig)) {
    console.warn('Invalid configuration, using default config');
    return DEFAULT_ANALYSIS_CONFIG;
  }
  
  return mergedConfig;
}
