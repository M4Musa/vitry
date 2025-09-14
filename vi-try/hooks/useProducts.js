import { useState, useEffect } from "react";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categories, setCategories] = useState([]);

  // Set initial products from server-side props
  const setInitialProducts = (initialProducts) => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      
      // Extract categories from products, ensuring 'Other' is included
      const categoriesSet = new Set();
      initialProducts.forEach(p => {
        if (p.category) {
          categoriesSet.add(p.category);
        } else {
          categoriesSet.add('Other');
        }
      });
      
      const categoryList = Array.from(categoriesSet);
      // Ensure 'Other' is always at the end
      if (categoryList.includes('Other')) {
        const filtered = categoryList.filter(cat => cat !== 'Other');
        filtered.push('Other');
        setCategories(filtered);
      } else {
        setCategories(categoryList);
      }
      
      setLoading(false);
    }
  };

  // Fetch products if no initial products were provided
  useEffect(() => {
    const fetchProducts = async () => {
      if (products.length > 0) return; // Skip if we already have products
      
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await res.json();
        setProducts(data);
        
        // Extract categories, ensuring 'Other' is included
        const categoriesSet = new Set();
        data.forEach(p => {
          if (p.category) {
            categoriesSet.add(p.category);
          } else {
            categoriesSet.add('Other');
          }
        });
        
        const categoryList = Array.from(categoriesSet);
        // Ensure 'Other' is always at the end
        if (categoryList.includes('Other')) {
          const filtered = categoryList.filter(cat => cat !== 'Other');
          filtered.push('Other');
          setCategories(filtered);
        } else {
          setCategories(categoryList);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [products.length]);

  // Apply filters and sorting
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !selectedCategory || product.category === selectedCategory || 
        (selectedCategory === 'Other' && (!product.category || product.category === 'Other'));

      // Price filter - convert string price to number
      const numericPrice = parseFloat(product.price.toString().replace(/[^0-9.]/g, '')) || 0;
      const matchesPrice = numericPrice >= priceRange[0] && numericPrice <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      // Sort products
      if (sortOption === "priceLowToHigh") {
        const priceA = parseFloat(a.price.toString().replace(/[^0-9.]/g, '')) || 0;
        const priceB = parseFloat(b.price.toString().replace(/[^0-9.]/g, '')) || 0;
        return priceA - priceB;
      } else if (sortOption === "priceHighToLow") {
        const priceA = parseFloat(a.price.toString().replace(/[^0-9.]/g, '')) || 0;
        const priceB = parseFloat(b.price.toString().replace(/[^0-9.]/g, '')) || 0;
        return priceB - priceA;
      } else if (sortOption === "alphabetically") {
        return a.product_name.localeCompare(b.product_name);
      }
      return 0;
    });

  return {
    products,
    filteredProducts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    categories,
    setInitialProducts,
  };
};

export default useProducts; 