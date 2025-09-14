// Simple test endpoint that returns mock data
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mockProducts = [
      {
        _id: '1',
        product_name: 'Cotton Shirt',
        brand: 'Test Brand',
        price: '29.99',
        cloth_type: 'Cotton',
        design_type: 'Casual',
        images: ['/placeholder-product.jpg', '/placeholder-product.jpg'],
        category: 'Shirts',
        keywords: ['cotton', 'shirt', 'casual'],
        details: 'A comfortable cotton shirt'
      },
      {
        _id: '2',
        product_name: 'Blue Jeans',
        brand: 'Test Brand',
        price: '59.99',
        cloth_type: 'Denim',
        design_type: 'Casual',
        images: ['/placeholder-product.jpg', '/placeholder-product.jpg'],
        category: 'Pants',
        keywords: ['jeans', 'denim', 'pants'],
        details: 'Classic blue jeans'
      }
    ];
    
    return res.status(200).json(mockProducts);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}