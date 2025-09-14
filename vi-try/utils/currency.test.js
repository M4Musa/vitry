// Test file for currency conversion logic
// This file demonstrates how the price conversion works

import { formatPricePkr, convertUsdToPkr, isPriceInPKR } from './currency.js';

// Test cases to demonstrate the logic
const testPrices = [
  { input: 50, expected: 'PKR 13,900', description: 'USD price ($50)' },
  { input: '99.99', expected: 'PKR 27,797', description: 'USD string price ($99.99)' },
  { input: 1500, expected: 'PKR 1,500', description: 'PKR price (already in PKR)' },
  { input: '2500', expected: 'PKR 2,500', description: 'PKR string price (already in PKR)' },
  { input: 150, expected: 'PKR 41,700', description: 'USD price ($150)' },
  { input: 500, expected: 'PKR 139,000', description: 'USD price ($500)' },
  { input: 800, expected: 'PKR 800', description: 'PKR price (800)' },
];

console.log('🧪 Currency Conversion Test Results:\n');

testPrices.forEach(({ input, expected, description }) => {
  const result = formatPricePkr(input);
  const isAlreadyPKR = isPriceInPKR(typeof input === 'string' ? parseFloat(input) : input);
  
  console.log(`📊 ${description}:`);
  console.log(`   Input: ${input}`);
  console.log(`   Result: ${result}`);
  console.log(`   Already PKR: ${isAlreadyPKR ? '✅ Yes' : '❌ No (converted from USD)'}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Match: ${result === expected ? '✅ Pass' : '❌ Fail'}\n`);
});

console.log('🔍 Price Detection Logic:');
console.log('• Prices ≤ 700 → Assumed to be in USD, converted to PKR');
console.log('• Prices > 700 → Assumed to be in PKR, displayed as-is');
console.log('• Exchange Rate: 1 USD = 278 PKR\n');

console.log('💡 Examples:');
console.log('• $50 clothing item → PKR 13,900');
console.log('• $100 clothing item → PKR 27,800');  
console.log('• PKR 1,500 clothing item → PKR 1,500 (no conversion)');
console.log('• PKR 2,500 clothing item → PKR 2,500 (no conversion)');

export default testPrices;