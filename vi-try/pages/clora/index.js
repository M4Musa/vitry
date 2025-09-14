import React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CloraUploadComponenet from '@/components/CloraUploadComponenet';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Sample product data to display when no product is selected
const sampleProducts = [
  {
    _id: "sample1",
    product_name: "Classic T-Shirt",
    brand: "Fashionista",
    price: 29.99,
    images: [
      "https://c8.alamy.com/comp/2DE8XPC/womens-white-blank-t-shirt-template-from-two-sides-natural-shape-on-invisible-mannequin-for-your-fashion-design-mockup-for-print-isolated-on-white-bac-2DE8XPC.jpg"
    ]
  },
  {
    _id: "sample2",
    product_name: "Summer Dress",
    brand: "Urban Chic",
    price: 59.99,
    images: [
      "https://i.etsystatic.com/23588121/r/il/23f812/3115969329/il_1080xN.3115969329_n0gm.jpg"
    ]
  },
  {
    _id: "sample3",
    product_name: "Casual Polo",
    brand: "StreamLine",
    price: 39.99,
    images: [
      "https://c8.alamy.com/comp/2H7FKMR/black-striped-polo-shirt-isolated-on-white-background-2H7FKMR.jpg"
    ]
  }
];

const CloraPage = () => {
  const router=useRouter();
  const { data: session, status } = useSession();
  const [Product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNoProductGuide, setShowNoProductGuide] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isCheckingTokens, setIsCheckingTokens] = useState(false);
  
  // Fetch user profile photo
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await axios.get('/api/user/profile');
          if (response.data && response.data.avatar && response.data.avatar !== '/images/default-avatar.svg') {
            setProfilePhoto(response.data.avatar);
          }
        } catch (error) {
          console.error('Error fetching user profile photo:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session, status]);
  
  useEffect(() => {
    const id = router.query.productId;
    console.log(id);
    
    // If no product ID in query, show sample products instead
    if (!id) {
      setIsLoading(false);
      setShowNoProductGuide(true);
      return;
    }
    
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
          setShowNoProductGuide(true);
          setIsLoading(false);
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
        console.log(formattedProduct);
        setProduct(formattedProduct);
        setSelectedImage(formattedProduct.images[0]);
        setShowNoProductGuide(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setShowNoProductGuide(true);
      } finally {
        setIsLoading(false);
      }
    };
  
    getProduct();
  }, [router.query]);

  const handleSelectSampleProduct = (product) => {
    setProduct(product);
    setSelectedImage(product.images[0]);
    setShowNoProductGuide(false);
  };
  
  const scrollToRight = () => {
    const rightComponent = document.getElementById('right-panel');
    rightComponent.scrollIntoView({ behavior: 'smooth' });
    rightComponent.classList.add('highlight');
    setTimeout(() => {
      rightComponent.classList.remove('highlight');
    }, 1000);
  };
  
  const checkTokensAndSubscription = async () => {
    if (!session) {
      if (confirm('You need to be logged in to use the try-on feature. Would you like to log in?')) {
        router.push('/welcome');
      }
      return false;
    }

    setIsCheckingTokens(true);
    try {
      const response = await fetch('/api/tokens/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'No active subscription') {
          if (confirm('You need an active subscription to use try-on features. Would you like to view our subscription plans?')) {
            router.push('/subscription');
          }
        } else if (data.error === 'Insufficient tokens') {
          if (confirm('You have run out of tokens. Would you like to upgrade your plan?')) {
            router.push('/subscription');
          }
        } else {
          alert(data.message || 'An error occurred while checking tokens');
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking tokens:', error);
      alert('An error occurred while checking tokens. Please try again.');
      return false;
    } finally {
      setIsCheckingTokens(false);
    }
  };

  const handleTryOn = async () => {
    const canProceed = await checkTokensAndSubscription();
    if (!canProceed) return;

    // Continue with the try-on process
    scrollToRight();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar className="h-16" />
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      <main className="flex-grow relative overflow-y-auto">
        <div className="absolute inset-0 z-0">
          <Image
            src="/neon-back.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col md:flex-row items-start justify-between h-full">
          <div className="w-full md:w-[35%] mb-8 md:mb-0 relative">
            <div onClick={scrollToRight} className="bg-gradient-to-br from-[#4B003B]/60 to-gray-900/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl h-[80vh] flex flex-col justify-start items-center border border-[#4B003B]/30">
              <h1 className="text-4xl font-bold text-white mb-4 border-b-4 border-dashed border-white/50">
                TRY <span className="font-extrabold">CLORA</span>
              </h1>
              <p className="text-white font-semibold mb-6 text-center">
                Change your clothes in photos and tailor the virtual outfits
                to any desired style. Do it in seconds with online
                AI clothes changer and editor.
              </p>
              
              {showNoProductGuide ? (
                <div className="flex-grow w-full flex flex-col items-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 w-full mb-4">
                    <h2 className="text-[#4B003B] font-bold text-lg mb-2">No Product Selected</h2>
                    <p className="text-gray-700 text-sm mb-3">
                      Please select a product from the options below to continue with the virtual try-on experience.
                    </p>
                    <div className="flex justify-center items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-sm text-gray-600">Or browse our product catalog for more options</span>
                    </div>
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-3">Sample Products</h3>
                  <div className="grid grid-cols-1 gap-4 w-full overflow-y-auto" style={{ maxHeight: "45vh" }}>
                    {sampleProducts.map((product) => (
                      <div 
                        key={product._id}
                        className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#4B003B]/50"
                        onClick={() => handleSelectSampleProduct(product)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100">
                            <Image 
                              src={product.images[0]} 
                              alt={product.product_name}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#4B003B]">{product.product_name}</h3>
                            <p className="text-sm text-gray-600">{product.brand}</p>
                            <p className="text-sm font-medium">${product.price}</p>
                          </div>
                          <div className="bg-[#4B003B]/10 rounded-full p-2">
                            <svg className="w-5 h-5 text-[#4B003B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-2 text-center">
                      <button 
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30 text-sm hover:bg-white/30 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Browse All Products
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Enhanced Image Container - Only shown when a product is selected
                <div className="flex-grow w-full flex flex-col items-center">
                  <div className="bg-gradient-to-br from-[#4B003B]/10 to-purple-900/10 backdrop-blur-sm rounded-xl shadow-lg p-4 w-full relative border border-[#4B003B]/20">
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#4B003B] to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Selected
                    </div>
                    
                    <div className="relative w-full h-[40vh] mb-2 border-2 border-dashed border-[#4B003B] border-opacity-30 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
                      {Product ? (
                        <Image
                          src={selectedImage || Product.images[0]}
                          alt={Product.product_name || "Selected product"}
                          layout="fill"
                          objectFit="contain"
                        />
                      ) : (
                        <Image
                          src="/change-clothes-ai.png"
                          alt="CLORA example image"
                          layout="fill"
                          objectFit="contain"
                        />
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#4B003B]/20 to-transparent h-16"></div>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="text-[#4B003B] font-semibold text-lg">
                        {Product ? Product.product_name : "Example Product"}
                      </h3>
                      {Product && (
                        <div className="text-sm text-gray-600 mt-1 flex justify-between">
                          <span>{Product.brand}</span>
                          <span className="font-medium">${Product.price}</span>
                        </div>
                      )}
                    </div>
                    
                    {Product && Product.images.length > 1 && (
                      <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
                        {Product.images.slice(0, 4).map((img, index) => (
                          <div 
                            key={index} 
                            onClick={() => setSelectedImage(img)}
                            className={`w-14 h-14 rounded-md cursor-pointer relative overflow-hidden ${
                              selectedImage === img 
                                ? 'ring-2 ring-[#4B003B] ring-offset-2' 
                                : 'border border-gray-200'
                            } hover:ring-1 hover:ring-[#4B003B]/70 transition-all duration-200`}
                          >
                            <Image 
                              src={img} 
                              alt={`Product view ${index + 1}`} 
                              layout="fill" 
                              objectFit="cover"
                            />
                            {selectedImage === img && (
                              <div className="absolute inset-0 bg-[#4B003B]/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleTryOn}
                      disabled={isCheckingTokens}
                      className="mt-4 w-full bg-[#4B003B] text-white py-2 px-4 rounded-lg hover:bg-[#9b0079] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCheckingTokens ? 'Checking...' : 'Try On'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-[35%] relative">
            <div id='right-panel' className="bg-gradient-to-br from-[#4B003B]/60 to-gray-900/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl h-[80vh] flex flex-col justify-start items-center border border-[#4B003B]/30">
              <CloraUploadComponenet 
                productImage={selectedImage || (Product && Product.images[0]) || null} 
                userProfilePhoto={profilePhoto}
              />
            </div>
            <style jsx>{`
              .highlight {
                box-shadow: 0 0 15px 5px rgba(255, 100, 130, 0.7);
                transition: box-shadow 0.4s ease-in-out;
              }
            `}</style>
          </div>
        </div>
      </main>
      <Footer className="mt-3" />
    </div>
  );
};

export default CloraPage;
