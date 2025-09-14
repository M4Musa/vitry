import products from "@/models/products";
import { connectMongoDB } from '@/config/mongodb';
import { categorizeProducts, extractKeywords, categorizeProduct } from '@/utils/categorizeProducts';

export default async function handler(req, res) {
  await connectMongoDB();

  if (req.method === 'GET') {
    try {
      const Products = await products.find(); 

      // Process products for categorization
      const processedProducts = Products.map(product => {
        const productData = product._doc || product.toObject();
        
        // If product doesn't have category or keywords, generate them
        if (!productData.category || !productData.keywords || productData.keywords.length === 0) {
          const keywords = extractKeywords(productData);
          const category = categorizeProduct(keywords);
          
          // Update product in database asynchronously (don't wait for it)
          products.findByIdAndUpdate(productData._id, {
            $set: { keywords, category }
          }).catch(err => console.error('Error updating product categorization:', err));
          
          productData.keywords = keywords;
          productData.category = category;
        }
        
        return {
          ...productData,
          image: productData.imageUrl ? `${productData.imageUrl}` : 'default.jpg',
        };
      });

      return res.status(200).json(processedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}