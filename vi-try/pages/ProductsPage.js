import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useProducts from "@/hooks/useProducts";
import { ReactLenis } from "lenis/react";
import { getSession, signIn } from "next-auth/react";
import Webcam from "react-webcam";
import TryOnModal from "@/components/TryOnModal";
import MagneticButton from "@/components/MagneticButton";
import Link from "next/link";

// Added getServerSideProps for server-side rendering
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  // Skip server-side product fetching to avoid build-time issues
  // Products will be fetched client-side instead
  return {
    props: {
      session,
      initialProducts: []
    }
  };
}


const ProductsPage = ({ session, initialProducts }) => {
  const router = useRouter();
  const {
    filteredProducts,
    products,
    searchTerm,
    sortOption,
    setSearchTerm,
    setSortOption,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    categories,
    setInitialProducts
  } = useProducts();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ email: "", password: "" });
  const [showTryOn, setShowTryOn] = useState(false);
  const [selectedProductForTryOn, setSelectedProductForTryOn] = useState(null);
  const productsPerPage = 12;

  // Initialize products with server-side fetched data
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setInitialProducts(initialProducts);
    }
  }, [initialProducts, setInitialProducts]);

  useEffect(() => {
    if (router.query.category) {
      setSelectedCategory(router.query.category);
    }
    setLoading(false);
  }, [router.query]);

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Use the first product image or a placeholder
  //**********************************************
  // TO WORK ON
  // either make this useState then give update after on click when try-on is clicked
  // else download it then and send to server as image
  const productImage = products?.[0]?.images?.[0] || "/placeholder-product.jpg";

  // Handle Try-On click to set the selected product and open the modal
  const handleTryOnClick = async (product, e) => {
    e.stopPropagation();
    
    try {
      // Check tokens before allowing try-on
      const response = await fetch('/api/tokens/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error message and redirect to subscription page if needed
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
        return;
      }

      // If we get here, user has enough tokens or is on Enterprise plan
      setSelectedProductForTryOn(product.images?.[1] || "/placeholder-product.jpg");
      setShowTryOn(true);
    } catch (error) {
      console.error('Error checking tokens:', error);
      alert('An error occurred while checking tokens. Please try again.');
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/clora_result/${productId}`);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email: loginCredentials.email,
      password: loginCredentials.password,
    });
    if (result.ok) {
      setShowLogin(false);
      router.reload();
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading)
    return (
      <div
        style={{
          backgroundImage: "url('/neon-back.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ fontSize: "24px", textShadow: "0 0 10px #0ff, 0 0 20px #0ff" }}>Loading...</p>
      </div>
    );

  return (
    <ReactLenis root>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#4B003B" }}>Login</h2>
                <button onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginCredentials.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ borderColor: "#4B003B" }}
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginCredentials.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ borderColor: "#4B003B" }}
                  />
                </div>
                <button type="submit" className="w-full py-2 px-4 rounded-md font-medium text-white" style={{ backgroundColor: "#4B003B" }}>
                  Sign In
                </button>
                <div className="mt-4 text-center">
                  <Link href="/forgotpassword" className="text-sm" style={{ color: "#4B003B" }}>Forgot password?</Link>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account? <Link href="/Register" style={{ color: "#4B003B" }}>Register</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hero Banner - Server optimized image */}
        <div className="relative w-full h-64 bg-gray-900">
          <Image 
            src="/product-banner.jpg" 
            alt="Products Collection" 
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-70"
            priority={true}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwAcof/Z"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-2">Our Collection</h1>
            <p className="text-lg">Discover our latest fashion items</p>
            {!session && (
              <button onClick={() => setShowLogin(true)} className="mt-4 px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: "#4B003B" }}>
                Login to Shop
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Try-On Button-- NO need here now */}
          {/* <div className="flex justify-end mb-4">
            <button onClick={() => setShowTryOn(true)} className="bg-purple-600 text-white px-4 py-2 rounded-md">
              Try On
            </button>
          </div> */}

          {/* Filter and Sort Controls */}
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center px-4 py-2 text-white rounded-md mr-4" style={{ backgroundColor: "#4B003B" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md">
                <option value="">Sort By</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="alphabetically">Alphabetically</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="flex items-center">
                      <input
                        id="all-categories"
                        type="radio"
                        name="category"
                        onChange={() => setSelectedCategory('')}
                        checked={!Boolean(categories.find(cat => cat === ''))}
                        className="h-4 w-4"
                        style={{ color: "#4B003B" }}
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                        All Categories ({filteredProducts.length})
                      </label>
                    </div>
                    {/* Popular Categories */}
                    {[
                      { name: 'Dresses', icon: '👗', count: products.filter(p => p.category?.toLowerCase().includes('dress')).length },
                      { name: 'Tops & Shirts', icon: '👕', count: products.filter(p => p.category?.toLowerCase().includes('shirt') || p.category?.toLowerCase().includes('top')).length },
                      { name: 'Pants & Jeans', icon: '👖', count: products.filter(p => p.category?.toLowerCase().includes('pant') || p.category?.toLowerCase().includes('jean')).length },
                      { name: 'Jackets & Coats', icon: '🧥', count: products.filter(p => p.category?.toLowerCase().includes('jacket') || p.category?.toLowerCase().includes('coat')).length },
                      { name: 'Traditional Wear', icon: '🥻', count: products.filter(p => p.category?.toLowerCase().includes('traditional') || p.category?.toLowerCase().includes('ethnic')).length },
                      { name: 'Formal Wear', icon: '🤵', count: products.filter(p => p.category?.toLowerCase().includes('formal') || p.category?.toLowerCase().includes('suit')).length }
                    ].map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer" onClick={() => setSelectedCategory(category.name)}>
                        <div className="flex items-center">
                          <input
                            id={`category-${index}`}
                            type="radio"
                            name="category"
                            onChange={() => setSelectedCategory(category.name)}
                            className="h-4 w-4"
                            style={{ color: "#4B003B" }}
                          />
                          <span className="ml-2 mr-2 text-lg">{category.icon}</span>
                          <label htmlFor={`category-${index}`} className="text-sm text-gray-700 cursor-pointer">
                            {category.name}
                          </label>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>
                    ))}
                    {/* Dynamic Categories from products */}
                    {categories && categories.filter(cat => cat && ![
                      'Dresses', 'Tops & Shirts', 'Pants & Jeans', 'Jackets & Coats', 'Traditional Wear', 'Formal Wear'
                    ].some(popular => cat.toLowerCase().includes(popular.toLowerCase()))).map((category, index) => (
                      <div key={`dynamic-${index}`} className="flex items-center">
                        <input
                          id={`dynamic-category-${index}`}
                          type="radio"
                          name="category"
                          onChange={() => setSelectedCategory(category)}
                          className="h-4 w-4"
                          style={{ color: "#4B003B" }}
                        />
                        <label htmlFor={`dynamic-category-${index}`} className="ml-2 text-sm text-gray-700">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">${priceRange[0]}</span>
                      <span className="text-sm text-gray-600">${priceRange[1]}</span>
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newRange = [...priceRange];
                          newRange[0] = Number(e.target.value);
                          setPriceRange(newRange);
                        }}
                        className="w-full"
                        style={{ accentColor: "#4B003B" }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newRange = [...priceRange];
                          newRange[1] = Number(e.target.value);
                          setPriceRange(newRange);
                        }}
                        className="w-full"
                        style={{ accentColor: "#4B003B" }}
                      />
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newRange = [...priceRange];
                          newRange[0] = Number(e.target.value);
                          setPriceRange(newRange);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        min={priceRange[0]}
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newRange = [...priceRange];
                          newRange[1] = Number(e.target.value);
                          setPriceRange(newRange);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Material & Style</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {/* Popular Materials */}
                    {[
                      { name: 'Cotton', icon: '🌿', popular: true },
                      { name: 'Silk', icon: '✨', popular: true },
                      { name: 'Denim', icon: '👖', popular: true },
                      { name: 'Wool', icon: '🐑', popular: true },
                      { name: 'Polyester', icon: '🧵', popular: true },
                      { name: 'Linen', icon: '🌾', popular: true }
                    ].map((material, index) => {
                      const count = products.filter(p => 
                        p.cloth_type?.toLowerCase().includes(material.name.toLowerCase()) ||
                        p.material?.toLowerCase().includes(material.name.toLowerCase())
                      ).length;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                          <div className="flex items-center">
                            <input
                              id={`material-${index}`}
                              type="checkbox"
                              className="h-4 w-4"
                              style={{ accentColor: "#4B003B" }}
                            />
                            <span className="ml-2 mr-2">{material.icon}</span>
                            <label htmlFor={`material-${index}`} className="text-sm text-gray-700 cursor-pointer">
                              {material.name}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Divider */}
                    {products && Array.from(new Set(products.map(p => p.cloth_type))).filter(Boolean).length > 0 && (
                      <div className="border-t border-gray-200 my-2 pt-2">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">OTHER TYPES</h5>
                      </div>
                    )}
                    
                    {/* Other cloth types from database */}
                    {products && Array.from(new Set(products.map(p => p.cloth_type))).filter(type => 
                      type && !['Cotton', 'Silk', 'Denim', 'Wool', 'Polyester', 'Linen'].some(popular => 
                        type.toLowerCase().includes(popular.toLowerCase())
                      )
                    ).map((type, index) => (
                      <div key={`other-${index}`} className="flex items-center pl-4">
                        <input
                          id={`type-${index}`}
                          type="checkbox"
                          className="h-4 w-4"
                          style={{ accentColor: "#4B003B" }}
                        />
                        <label htmlFor={`type-${index}`} className="ml-2 text-sm text-gray-600">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange([0, 1000]);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2 text-white rounded-md"
                  style={{ backgroundColor: "#4B003B" }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Products Count & Results */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </p>
          </div>

          {/* Products Grid/List with server-optimized images */}
          {filteredProducts.length > 0 ? (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    : "flex flex-col space-y-6"
                }
              >
                {currentProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.3 } }}
                    onClick={() => handleProductClick(product._id)}
                    className={`bg-white rounded-lg overflow-hidden shadow-md cursor-pointer transition duration-300 hover:shadow-xl ${
                      viewMode === "list" ? "flex flex-col md:flex-row" : ""
                    } relative`}
                  >
                    <div
                      className={
                        viewMode === "list" ? "md:w-1/3" : "relative pb-[100%]"
                      }
                    >
                      <Image
                        src={product.images?.[1] || "/placeholder-product.jpg"}
                        alt={product.product_name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-t-lg"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwAcof/Z"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div
                      className={`p-4 ${
                        viewMode === "list" ? "md:w-2/3" : ""
                      } relative`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {product.product_name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                        </div>
                        <p className="text-lg font-bold" style={{ color: "#4B003B" }}>
                          ${product.price}
                        </p>
                      </div>
                      {viewMode === "list" && (
                        <p className="mt-2 text-gray-600 line-clamp-2">
                          {product.details}
                        </p>
                      )}
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {product.cloth_type}
                        </span>
                        {/* Modified MagneticButton */}
                        <MagneticButton
                          onClick={(e) => handleTryOnClick(product, e)}
                          customClass="absolute bottom-4 right-4 transform px-2 py-1 text-xs border border-[#4B003B] text-[#4B003B] rounded-lg hover:bg-[#4B003B] hover:text-white transition-colors transition-transform hover:transform"
                        >
                          Try-On
                        </MagneticButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === page ? "text-white" : "text-gray-700 hover:bg-gray-100"}`}
                        style={{ backgroundColor: currentPage === page ? "#4B003B" : "transparent" }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange([0, 1000]);
                  setSearchTerm('');
                  setSortOption('');
                }}
                className="mt-4 px-4 py-2 text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: "#4B003B" }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
        

        <Footer />
      </div>
      {showTryOn && (
        <TryOnModal
          productImage={selectedProductForTryOn}
          onClose={() => setShowTryOn(false)}
        />
      )}
    </ReactLenis>
  );
};

export default ProductsPage;