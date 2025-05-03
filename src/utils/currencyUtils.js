/**
 * Format a number as Nepalese Rupees
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted amount with Rs symbol
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rs 0';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with thousand separators (Nepalese format uses commas like 1,00,000)
  const formatted = numAmount.toLocaleString('en-IN');
  
  return `Rs ${formatted}`;
}; 