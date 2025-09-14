import { connectMongoDB } from '@/config/mongodb';
import products from '@/models/products';
const { getAvailableCategories } = require('@/utils/categorizeProducts');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectMongoDB();
    
    // Get all predefined categories
    const predefinedCategories = getAvailableCategories();
    
    // Get categories that actually have products
    const productsWithCategories = await products.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Merge predefined categories with actual categories
    const categoryMap = new Map();
    
    // Add all predefined categories with 0 count initially
    predefinedCategories.forEach(cat => {
      categoryMap.set(cat, { name: cat, count: 0, isPredefined: true });
    });
    
    // Update counts for categories that have products
    productsWithCategories.forEach(({ _id, count }) => {
      if (categoryMap.has(_id)) {
        categoryMap.set(_id, { name: _id, count, isPredefined: true });
      } else {
        // This is a custom category not in predefined list, put it under "Other"
        const otherCategory = categoryMap.get('Other');
        categoryMap.set('Other', {
          name: 'Other',
          count: otherCategory.count + count,
          isPredefined: true
        });
      }
    });
    
    // Convert to array and filter out categories with 0 count (except "Other")
    const categories = Array.from(categoryMap.values())
      .filter(cat => cat.count > 0 || cat.name === 'Other')
      .sort((a, b) => {
        // Keep "Other" at the end
        if (a.name === 'Other') return 1;
        if (b.name === 'Other') return -1;
        return b.count - a.count;
      });
    
    return res.status(200).json({ categories });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}