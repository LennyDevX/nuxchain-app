// APY Constants for Enhanced Smart Staking Contract
// Based on hourly ROI percentages from the contract
// Updated Feb 2025 - ALL rates reduced 25% on-chain for sustainability

export const STAKING_PERIODS = [
  {
    value: "0",
    label: "Flexible",
    description: "0.00225% per hour",
    hourlyRate: 0.00225,
    roi: {
      daily: "~0.054%",
      monthly: "~1.62%",
      annual: "~19.7%"
    }
  },
  {
    value: "30",
    label: "30 Days",
    description: "0.00375% per hour",
    hourlyRate: 0.00375,
    roi: {
      daily: "~0.09%",
      monthly: "~2.7%",
      annual: "~32.9%"
    }
  },
  {
    value: "90",
    label: "90 Days",
    description: "0.00675% per hour",
    hourlyRate: 0.00675,
    roi: {
      daily: "~0.162%",
      monthly: "~4.86%",
      annual: "~59.1%"
    }
  },
  {
    value: "180",
    label: "180 Days",
    description: "0.009% per hour",
    hourlyRate: 0.009,
    roi: {
      daily: "~0.216%",
      monthly: "~6.48%",
      annual: "~78.8%"
    }
  },
  {
    value: "365",
    label: "365 Days",
    description: "0.0135% per hour",
    hourlyRate: 0.0135,
    roi: {
      daily: "~0.324%",
      monthly: "~9.72%",
      annual: "~118.3%"
    }
  }
];

// Contract constants from EnhancedSmartStaking.sol
// Updated Feb 2025 - All rates reduced 25%
export const CONTRACT_CONSTANTS = {
  // Hourly ROI rates (in basis points where 100 = 0.01%)
  HOURLY_ROI_PERCENTAGE: 22.5,   // 0.00225% per hour (No Lock) - 19.7% APY
  ROI_30_DAYS_LOCKUP: 37.5,      // 0.00375% per hour - 32.9% APY
  ROI_90_DAYS_LOCKUP: 67.5,      // 0.00675% per hour - 59.1% APY
  ROI_180_DAYS_LOCKUP: 90,       // 0.009% per hour - 78.8% APY
  ROI_365_DAYS_LOCKUP: 135,      // 0.0135% per hour - 118.3% APY
  
  // Deposit limits
  MIN_DEPOSIT: 10,             // 10 POL minimum
  MAX_DEPOSIT: 100000,         // 100,000 POL maximum
  MAX_DEPOSITS_PER_USER: 400,  // Maximum deposits per user
  
  // Withdrawal limits
  DAILY_WITHDRAWAL_LIMIT: 2000, // 2,000 POL per day
  WITHDRAWAL_LIMIT_PERIOD: 86400, // 1 day in seconds
  
  // Fees and limits
  COMMISSION_PERCENTAGE: 600,  // 6% commission
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
