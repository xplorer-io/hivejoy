/**
 * Hive Joy Commission Configuration
 * 
 * Commission rates are configurable and can be updated as needed.
 * The launch commission rate is set here and can be adjusted for different phases.
 */

export const COMMISSION_CONFIG = {
  // Launch commission rate (as percentage)
  LAUNCH_RATE: 8, // 8% per completed sale
  
  // Future rates can be added here
  // STANDARD_RATE: 10,
  // PREMIUM_RATE: 12,
} as const;

/**
 * Calculate commission amount from sale total
 * @param saleTotal - Total sale amount in AUD
 * @param rate - Commission rate percentage (defaults to launch rate)
 * @returns Commission amount in AUD
 */
export function calculateCommission(
  saleTotal: number,
  rate: number = COMMISSION_CONFIG.LAUNCH_RATE
): number {
  return Math.round((saleTotal * rate) / 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate seller payout amount after commission
 * @param saleTotal - Total sale amount in AUD
 * @param rate - Commission rate percentage (defaults to launch rate)
 * @returns Seller payout amount in AUD
 */
export function calculateSellerPayout(
  saleTotal: number,
  rate: number = COMMISSION_CONFIG.LAUNCH_RATE
): number {
  const commission = calculateCommission(saleTotal, rate);
  return saleTotal - commission;
}

/**
 * Get current commission rate
 */
export function getCommissionRate(): number {
  return COMMISSION_CONFIG.LAUNCH_RATE;
}
