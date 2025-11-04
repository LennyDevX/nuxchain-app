// APY Constants for Enhanced Smart Staking Contract
// Based on hourly ROI percentages from the contract

export const STAKING_PERIODS = [
  {
    value: "0",
    label: "Flexible",
    description: "0.005% per hour",
    hourlyRate: 0.005,
    roi: {
      daily: "~0.12%",
      monthly: "~3.6%",
      annual: "~43.8%"
    }
  },
  {
    value: "30",
    label: "30 Days",
    description: "0.010% per hour",
    hourlyRate: 0.010,
    roi: {
      daily: "~0.24%",
      monthly: "~7.2%",
      annual: "~87.6%"
    }
  },
  {
    value: "90",
    label: "90 Days",
    description: "0.014% per hour",
    hourlyRate: 0.014,
    roi: {
      daily: "~0.336%",
      monthly: "~10.1%",
      annual: "~122.6%"
    }
  },
  {
    value: "180",
    label: "180 Days",
    description: "0.017% per hour",
    hourlyRate: 0.017,
    roi: {
      daily: "~0.408%",
      monthly: "~12.2%",
      annual: "~148.9%"
    }
  },
  {
    value: "365",
    label: "365 Days",
    description: "0.021% per hour",
    hourlyRate: 0.021,
    roi: {
      daily: "~0.504%",
      monthly: "~15.1%",
      annual: "~184.0%"
    }
  }
];

// Contract constants from EnhancedSmartStaking.sol
export const CONTRACT_CONSTANTS = {
  HOURLY_ROI_PERCENTAGE: 50, // 0.005% per hour (in basis points)
  ROI_30_DAYS_LOCKUP: 100,   // 0.010% per hour
  ROI_90_DAYS_LOCKUP: 140,   // 0.014% per hour
  ROI_180_DAYS_LOCKUP: 170,  // 0.017% per hour
  ROI_365_DAYS_LOCKUP: 210,  // 0.021% per hour
  BASIS_POINTS: 10000,
  MAX_ROI_PERCENTAGE: 12500, // 125%
  COMMISSION_PERCENTAGE: 600, // 6%
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
