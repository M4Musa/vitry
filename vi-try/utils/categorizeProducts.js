// Predefined categories with their associated keywords
const PREDEFINED_CATEGORIES = {
  'Shirts': ['shirt', 'blouse', 'top', 'tunic', 'polo', 'button-up', 'dress shirt'],
  'Pants': ['pants', 'trousers', 'jeans', 'chinos', 'slacks', 'bottoms'],
  'Dresses': ['dress', 'gown', 'frock', 'maxi', 'midi', 'mini', 'sundress'],
  'Traditional': ['shalwar', 'kameez', 'kurta', 'dupatta', 'lehenga', 'saree', 'churidar', 'traditional'],
  'Formal': ['suit', 'blazer', 'coat', 'formal', 'tuxedo', 'jacket', 'waistcoat'],
  'Casual': ['t-shirt', 'tshirt', 'casual', 'hoodie', 'sweater', 'cardigan'],
  'Accessories': ['belt', 'bag', 'scarf', 'hat', 'cap', 'jewelry', 'watch', 'sunglasses'],
  'Footwear': ['shoes', 'boots', 'sandals', 'sneakers', 'flats', 'heels', 'loafers']
};

/**
 * Extract keywords from product data
 * @param {Object} product - Product object
 * @returns {Array} Array of extracted keywords
 */
export function extractKeywords(product) {
  const keywords = new Set();
  
  // Extract from product name
  if (product.product_name) {
    const nameWords = product.product_name.toLowerCase().split(/\s+/);
    nameWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word.replace(/[^a-zA-Z]/g, ''));
      }
    });
  }
  
  // Extract from design type
  if (product.design_type) {
    const designWords = product.design_type.toLowerCase().split(/\s+/);
    designWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word.replace(/[^a-zA-Z]/g, ''));
      }
    });
  }
  
  // Extract from cloth type
  if (product.cloth_type) {
    const clothWords = product.cloth_type.toLowerCase().split(/\s+/);
    clothWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word.replace(/[^a-zA-Z]/g, ''));
      }
    });
  }
  
  // Extract from details if it's a string
  if (product.details && typeof product.details === 'string') {
    const detailWords = product.details.toLowerCase().split(/\s+/);
    detailWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word.replace(/[^a-zA-Z]/g, ''));
      }
    });
  }
  
  return Array.from(keywords).filter(keyword => keyword.length > 0);
}

/**
 * Categorize a product based on its keywords
 * @param {Array} keywords - Array of product keywords
 * @returns {String} Category name or 'Other'
 */
export function categorizeProduct(keywords) {
  if (!keywords || keywords.length === 0) {
    return 'Other';
  }
  
  // Convert keywords to lowercase for comparison
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  // Find the best matching category
  let bestMatch = 'Other';
  let maxMatches = 0;
  
  Object.entries(PREDEFINED_CATEGORIES).forEach(([category, categoryKeywords]) => {
    const matches = lowerKeywords.filter(keyword => 
      categoryKeywords.some(catKeyword => 
        keyword.includes(catKeyword) || catKeyword.includes(keyword)
      )
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = category;
    }
  });
  
  return bestMatch;
}

/**
 * Process multiple products and categorize them
 * @param {Array} products - Array of products
 * @returns {Array} Array of products with categories and keywords
 */
export function categorizeProducts(products) {
  return products.map(product => {
    const keywords = extractKeywords(product);
    const category = categorizeProduct(keywords);
    
    return {
      ...product,
      keywords,
      category
    };
  });
}

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
export function getAvailableCategories() {
  return Object.keys(PREDEFINED_CATEGORIES).concat(['Other']);
}