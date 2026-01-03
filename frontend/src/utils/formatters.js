/**
 * Number and data formatting utilities for visualizations
 */

/**
 * Format a number with commas for thousands separator
 * @param {number} value - Number to format
 * @returns {string} Formatted number (e.g., "1,234,567")
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a number as currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency (e.g., "$1,234.56")
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a number as percentage
 * @param {number} value - Number to format (0-100 or 0-1)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} isDecimal - Whether value is 0-1 (true) or 0-100 (false)
 * @returns {string} Formatted percentage (e.g., "45.5%")
 */
export const formatPercentage = (value, decimals = 1, isDecimal = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  const percentValue = isDecimal ? value * 100 : value;
  return `${percentValue.toFixed(decimals)}%`;
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Abbreviated number (e.g., "1.2K", "3.5M")
 */
export const formatCompact = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(decimals) + 'B';
  } else if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(decimals) + 'M';
  } else if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(decimals) + 'K';
  }
  
  return sign + absValue.toFixed(0);
};

/**
 * Smart number formatter - chooses appropriate format based on value
 * @param {number} value - Number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number
 */
export const formatSmart = (value, options = {}) => {
  const {
    isCurrency = false,
    isPercentage = false,
    compact = false,
    decimals = 1
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return isCurrency ? '$0.00' : '0';
  }
  
  if (isPercentage) {
    return formatPercentage(value, decimals);
  }
  
  if (isCurrency) {
    return compact && Math.abs(value) >= 1000 
      ? formatCurrency(value).replace(/\$[\d,]+\.\d{2}/, '$' + formatCompact(value, decimals))
      : formatCurrency(value);
  }
  
  if (compact && Math.abs(value) >= 1000) {
    return formatCompact(value, decimals);
  }
  
  return formatNumber(value);
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Title-cased text
 */
export const toTitleCase = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Limit array to top N items, group rest as "Others"
 * @param {Array} data - Array of data objects
 * @param {string} valueKey - Key for the value to sum
 * @param {number} topN - Number of top items to keep
 * @returns {Array} Processed array with "Others" category if needed
 */
export const limitWithOthers = (data, valueKey, topN = 10) => {
  if (!data || data.length <= topN) return data;
  
  // Sort by value descending
  const sorted = [...data].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));
  
  // Take top N
  const topItems = sorted.slice(0, topN);
  const others = sorted.slice(topN);
  
  // Sum others
  if (others.length > 0) {
    const othersSum = others.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
    topItems.push({
      ...others[0],
      [Object.keys(others[0]).find(k => k !== valueKey)]: 'Others',
      [valueKey]: othersSum
    });
  }
  
  return topItems;
};
