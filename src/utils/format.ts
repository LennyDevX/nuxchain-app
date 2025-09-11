/**
 * Utility functions for formatting currency and numbers
 */

/**
 * Format a number as currency with proper decimal places
 * @param value - The numeric value to format
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = '$'): string {
  if (value === 0) return `${currency}0.00`;
  if (value < 0.01) return `<${currency}0.01`;
  return `${currency}${value.toFixed(2)}`;
}

/**
 * Format POL values with appropriate decimal places
 * @param value - The POL value to format
 * @returns Formatted POL string
 */
export function formatPolValue(value: number): string {
  if (value === 0) return '0';
  if (value < 0.001) return '<0.001';
  if (value < 1) return value.toFixed(3);
  if (value < 10) return value.toFixed(2);
  return value.toFixed(1);
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Format percentage values
 * @param value - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format decimal numbers with specified precision
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}