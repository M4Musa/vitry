const { connectMongoDB } = require('../config/mongodb');
const products = require('../models/products').default;
const { extractKeywords, categorizeProduct } = require('../utils/categorizeProducts');

async function categorizeAllProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();
    
    console.log('Fetching products...');
    const allProducts = await products.find({});
    
    console.log(`Found ${allProducts.length} products to categorize`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const product of allProducts) {
      try {
        // Extract keywords and categorize
        const keywords = extractKeywords(product);
        const category = categorizeProduct(keywords);
        
        // Update product
        await products.findByIdAndUpdate(product._id, {
          $set: { keywords, category }
        });
        
        updatedCount++;
        console.log(`Updated product ${product._id}: ${product.product_name} -> ${category}`);
        
      } catch (error) {
        errorCount++;
        console.error(`Error updating product ${product._id}:`, error.message);
      }
    }
    
    console.log(`\nCategorization complete!`);
    console.log(`Successfully updated: ${updatedCount} products`);
    console.log(`Errors: ${errorCount} products`);
    
    // Print category summary
    console.log('\nCategory Summary:');
    const categorySummary = await products.aggregate([
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
    
    categorySummary.forEach(({ _id, count }) => {
      console.log(`${_id}: ${count} products`);
    });
    
  } catch (error) {
    console.error('Error in categorization script:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
categorizeAllProducts();