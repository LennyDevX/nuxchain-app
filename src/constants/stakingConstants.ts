// APY Constants for Enhanced Smart Staking Contract v6.2.0
// ⚠️  v6.2.0 RATES — THESE ARE FALLBACK UI VALUES ONLY
// ⚠️  NEVER rely on these in production calculations.
// ✅  Always call getStakingRatesInfo() on-chain via useStakingV620().stakingRates
// Updated Feb 27, 2026 new deployment (previously ~25% lower than current)

export const STAKING_PERIODS = [
  {
    value: "0",
    label: "Flexible",
    description: "0.001096% per hour",
    hourlyRate: 0.001096,
    roi: {
      daily: "~0.026%",
      monthly: "~0.8%",
      annual: "~9.6%"
    }
  },
  {
    value: "30",
    label: "30 Days",
    description: "0.001963% per hour",
    hourlyRate: 0.001963,
    roi: {
      daily: "~0.047%",
      monthly: "~1.42%",
      annual: "~17.2%"
    }
  },
  {
    value: "90",
    label: "90 Days",
    description: "0.002592% per hour",
    hourlyRate: 0.002592,
    roi: {
      daily: "~0.062%",
      monthly: "~1.86%",
      annual: "~22.7%"
    }
  },
  {
    value: "180",
    label: "180 Days",
    description: "0.003457% per hour",
    hourlyRate: 0.003457,
    roi: {
      daily: "~0.083%",
      monthly: "~2.49%",
      annual: "~30.3%"
    }
  },
  {
    value: "365",
    label: "365 Days",
    description: "0.003640% per hour",
    hourlyRate: 0.003640,
    roi: {
      daily: "~0.087%",
      monthly: "~2.62%",
      annual: "~31.9%"
    }
  }
];

// Contract constants from EnhancedSmartStaking v6.2.0
// ⚠️  v6.2.0 RATES — FALLBACK ONLY. Always read from chain via getStakingRatesInfo()
// Deployment: Feb 27, 2026
export const CONTRACT_CONSTANTS = {
  // Hourly ROI rates in micro-percent (divide by 1e6 for %)
  HOURLY_ROI_PERCENTAGE: 10.96,  // 0.001096% per hour (Flexible) — 9.6% APY
  ROI_30_DAYS_LOCKUP: 19.63,     // 0.001963% per hour — 17.2% APY
  ROI_90_DAYS_LOCKUP: 25.92,     // 0.002592% per hour — 22.7% APY
  ROI_180_DAYS_LOCKUP: 34.57,    // 0.003457% per hour — 30.3% APY
  ROI_365_DAYS_LOCKUP: 36.40,    // 0.003640% per hour — 31.9% APY

  // Deposit limits
  MIN_DEPOSIT: 10,             // 10 POL minimum
  MAX_DEPOSIT: 100000,         // 100,000 POL maximum
  MAX_DEPOSITS_PER_USER: 400,  // Maximum deposits per user

  // Withdrawal limits
  DAILY_WITHDRAWAL_LIMIT: 2000, // 2,000 POL per day
  WITHDRAWAL_LIMIT_PERIOD: 86400, // 1 day in seconds

  // Fees
  COMMISSION_PERCENTAGE: 600,  // 6% commission
  COMPOUND_FEE_BPS: 25,        // 0.25% compound fee (v6.2.0)
  EARLY_EXIT_FEE_BPS: 50,      // 0.5% early exit fee for <7d flexible (v6.2.0)
  BASIS_POINTS: 10000,
  MAX_ACTIVE_SKILL_SLOTS: 5,
};

// Helper function to calculate APY
export function calculateAPY(hourlyRate: number): {
  daily: number;
  monthly: number;
  annual: number;
} {
  const daily = hourlyRate * 24;
  const monthly = daily * 30;
  const annual = daily * 365;
  
  return { daily, monthly, annual };
}
