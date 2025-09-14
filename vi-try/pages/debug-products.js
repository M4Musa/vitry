import { useState, useEffect } from 'react';

export default function DebugProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const response = await fetch('/api/products');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Products data:', data);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Products Page</h1>
      <p className="mb-4">Found {products.length} products:</p>
      
      {products.length === 0 ? (
        <p className="text-gray-500">No products found in database</p>
      ) : (
        <div className="grid gap-4">
          {products.slice(0, 5).map((product, index) => (
            <div key={product._id || index} className="border p-4 rounded">
              <h3 className="font-bold">{product.product_name}</h3>
              <p className="text-gray-600">Brand: {product.brand}</p>
              <p className="text-gray-600">Price: {product.price}</p>
              <p className="text-gray-600">Category: {product.category || 'Not categorized'}</p>
              <p className="text-sm text-gray-500">Keywords: {product.keywords?.join(', ') || 'None'}</p>
            </div>
          ))}
          {products.length > 5 && (
            <p className="text-gray-500">...and {products.length - 5} more products</p>
          )}
        </div>
      )}
    </div>
  );
}