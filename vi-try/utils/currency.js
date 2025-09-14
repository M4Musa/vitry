// Currency conversion utility
// USD to PKR conversion rate (you can make this dynamic by fetching from API)
const USD_TO_PKR_RATE = 278; // Current approximate rate (update as needed)

/**
 * Detect if a price is likely already in PKR based on value
 * @param {number} price - Numeric price value
 * @returns {boolean} True if likely PKR, false if likely USD
 */
const isPriceInPKR = (price) => {
  // If price is greater than 700, assume it's already in PKR
  // Reasoning: Typical USD clothing prices are $10-200 ($200 = PKR 55,600)
  // While PKR clothing prices typically start from PKR 1000+
  return price > 700;
};

/**
 * Convert USD price to PKR (or detect if already in PKR)
 * @param {string|number} price - Price in USD or PKR
 * @returns {number} Price in PKR
 */
export const convertUsdToPkr = (price) => {
  if (!price) return 0;
  
  // Extract numeric value from string if it contains symbols
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.toString().replace(/[^0-9.]/g, ''))
    : parseFloat(price);
  
  if (isNaN(numericPrice)) return 0;
  
  // Smart currency detection
  if (isPriceInPKR(numericPrice)) {
    return numericPrice; // Already in PKR, return as-is
  }
  
  // Convert from USD to PKR
  return numericPrice * USD_TO_PKR_RATE;
};

/**
 * Format price for display in PKR
 * @param {string|number} price - Price in USD or PKR
 * @returns {string} Formatted PKR price
 */
export const formatPricePkr = (price) => {
  const pkrPrice = convertUsdToPkr(price);
  return `PKR ${pkrPrice.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Get current USD to PKR exchange rate
 * @returns {number} Exchange rate
 */
export const getUsdToPkrRate = () => {
  return USD_TO_PKR_RATE;
};

/**
 * Update exchange rate (for future API integration)
 * @param {number} newRate - New exchange rate
 */
export const updateExchangeRate = (newRate) => {
  // This could be expanded to fetch from a live API
  console.log(`Exchange rate updated to: ${newRate}`);
  // For now, this is just a placeholder
};

export default {
  convertUsdToPkr,
  formatPricePkr,
  getUsdToPkrRate,
  updateExchangeRate,
  isPriceInPKR
};

// Also export the helper function
export { isPriceInPKR };
