import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import useProducts from '../../hooks/useProducts';

const CloraResult = () => {
  const router = useRouter();
  const { products } = useProducts();
  
  const [selectedSize, setSelectedSize] = useState('100 cm');
  const [selectedColor, setSelectedColor] = useState('beige');
  const [selectedImage, setSelectedImage] = useState(null);
  const [Product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const sizes = ['90 cm', '100 cm', '110 cm', '120 cm', '130 cm', '140 cm', '150 cm', '160 cm'];

  const handleOnClick = (productId) => {
    router.push(`/clora?productId=${encodeURIComponent(productId)}`);
  };

  const handleBuyNow = () => {
    if (Product && Product.url) {
      window.open(Product.url, '_blank');
    } else {
      console.error("Product URL not found");
    }
  };

  useEffect(() => {
    const { id } = router.query;
  
    const getProduct = async () => {
      try {
        if (!id) return;
        
        setIsLoading(true);
        const res = await fetch('/api/product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
  
        if (!res.ok) {
          throw new Error('Failed to fetch product details');
        }
  
        const { Products: product } = await res.json();
  
        if (!product) {
          console.error('Product not found');
          return;
        }

        const formattedProduct = {
          _id: product._id,
          url: product.url,
          brand: product.brand,
          design_type: product.design_type,
          cloth_type: product.cloth_type,
          product_name: product.product_name,
          price: parseFloat(product.price.replace(/[^\d.]/g, '')),
          product_id: product.product_id,
          sku: product.sku,
          details: product.details,
          images: product.images,
          created_at: new Date(product.created_at),
        };
  
        setProduct(formattedProduct);
        setSelectedImage(formattedProduct.images[0]);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    getProduct();
  }, [router.query]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!Product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-14x2">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images Section */}
          <div className="lg:w-1/2">
            <div className="flex flex-col-reverse sm:flex-row lg:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex flex-row sm:flex-col gap-2 mt-4 sm:mt-0 overflow-x-auto sm:overflow-x-visible  max-h-96 sm:max-h-screen sm:w-20 lg:w-24">
                {Product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 border rounded-lg p-1 cursor-pointer transition-all duration-200 ${selectedImage === image ? 'border-black shadow-md' : 'border-gray-200'}`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative w-16 h-16 lg:w-20 lg:h-20">
                      <Image
                        src={image}
                        alt={`Thumbnail ${index}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-grow relative bg-gray-50 rounded-xl">
                <div className="relative w-full pt-[100%]">
                  <Image
                    src={selectedImage || Product.images[0]}
                    alt={Product.product_name}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-xl"
                  />
                </div>
                
                {/* Image Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#e0d5c0] to-transparent p-2 rounded-b-xl">
                  <div className="flex justify-center p-2 gap-4 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:w-1/2 mt-6 lg:mt-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-black line-clamp-2">{Product.product_name}</h1>
            
            <div className="flex items-center mb-4">
              <span className="text-lg font-semibold text-black">${Product.price.toFixed(2)}</span>
            </div>
            
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-black">Cloth Details</h2>
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Type: <span className="text-gray-900">{Product.cloth_type}</span>
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Design: <span className="text-gray-900">{Product.design_type}</span>
                </p>
                {Product.brand && (
                  <p className="text-sm font-semibold text-gray-700">
                    Brand: <span className="text-gray-900">{Product.brand}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-black">Size</h2>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-3 py-1 border rounded-md transition-colors ${
                      size === selectedSize 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-gray-300 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex-grow sm:flex-grow-0">
              <MagneticButton children={"Virtual Try On"} onClick={() => handleOnClick(Product._id)} />
              </div>
              <button className="border border-black p-3 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Heart className="h-5 w-5" stroke="black" />
              </button>
            </div>
            
            <div className="mb-5">
              <MagneticButton children={"Buy Now"} onClick={handleBuyNow}/>
            </div>

            {/* Recommended Products */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4 text-black">Best mix style with</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.slice(0, 8).map((pro, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                    onClick={() => {
                      setSelectedImage(pro.images[0]);
                      setProduct(pro);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="relative pt-[100%]">
                      <Image
                        src={pro.images[0]}
                        alt={pro.product_name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1" title={pro.product_name}>
                        {pro.product_name}
                      </p>
                      <p className="text-xs text-gray-700 mt-1 line-clamp-1" title={pro.design_type}>
                        {pro.design_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CloraResult;