// APY Constants for Enhanced Smart Staking Contract
// Based on hourly ROI percentages from the contract
// Updated December 2024 - Reduced APYs for sustainability

export const STAKING_PERIODS = [
  {
    value: "0",
    label: "Flexible",
    description: "0.003% per hour",
    hourlyRate: 0.003,
    roi: {
      daily: "~0.072%",
      monthly: "~2.19%",
      annual: "~26.3%"
    }
  },
  {
    value: "30",
    label: "30 Days",
    description: "0.005% per hour",
    hourlyRate: 0.005,
    roi: {
      daily: "~0.12%",
      monthly: "~3.65%",
      annual: "~43.8%"
    }
  },
  {
    value: "90",
    label: "90 Days",
    description: "0.009% per hour",
    hourlyRate: 0.009,
    roi: {
      daily: "~0.216%",
      monthly: "~6.57%",
      annual: "~78.8%"
    }
  },
  {
    value: "180",
    label: "180 Days",
    description: "0.012% per hour",
    hourlyRate: 0.012,
    roi: {
      daily: "~0.288%",
      monthly: "~8.76%",
      annual: "~105.1%"
    }
  },
  {
    value: "365",
    label: "365 Days",
    description: "0.018% per hour",
    hourlyRate: 0.018,
    roi: {
      daily: "~0.432%",
      monthly: "~13.14%",
      annual: "~157.7%"
    }
  }
];

// Contract constants from EnhancedSmartStaking.sol
// Updated December 2024 - New contract parameters
export const CONTRACT_CONSTANTS = {
  // Hourly ROI rates (in basis points where 100 = 0.01%)
  HOURLY_ROI_PERCENTAGE: 30,   // 0.003% per hour (No Lock) - 26.3% APY
  ROI_30_DAYS_LOCKUP: 50,      // 0.005% per hour - 43.8% APY
  ROI_90_DAYS_LOCKUP: 90,      // 0.009% per hour - 78.8% APY
  ROI_180_DAYS_LOCKUP: 120,    // 0.012% per hour - 105.1% APY
  ROI_365_DAYS_LOCKUP: 180,    // 0.018% per hour - 157.7% APY
  
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
