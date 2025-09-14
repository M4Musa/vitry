import { ArrowRight, ArrowLeft } from "lucide-react";
import ProductCard from "./ProductCard";
import MagneticButton from "./MagneticButton";
import useProducts from "@/hooks/useProducts";
import { useState, useEffect } from "react";
import styles from "./BrandFeature.module.css";

const BrandFeature = () => {
  const { products, loading, error } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [cardWidth, setCardWidth] = useState(100 / 6); // Default to 6 items

  // Monitor products loading state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('BrandFeature - Products:', products.length, 'Loading:', loading, 'Error:', error);
    }
  }, [products, loading, error]);

  // Update items per page based on screen width
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setItemsPerPage(6);
        setCardWidth(100 / 6);
      } else if (width >= 1280) {
        setItemsPerPage(5);
        setCardWidth(100 / 5);
      } else if (width >= 1024) {
        setItemsPerPage(4);
        setCardWidth(100 / 4);
      } else if (width >= 768) {
        setItemsPerPage(3);
        setCardWidth(100 / 3);
      } else if (width >= 640) {
        setItemsPerPage(2);
        setCardWidth(100 / 2);
      } else {
        setItemsPerPage(1);
        setCardWidth(100);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const handleNext = () => {
    if (currentIndex + itemsPerPage < products.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  // Show loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Brands</h1>
          <div className={styles.divider}></div>
        </div>
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Brands</h1>
          <div className={styles.divider}></div>
        </div>
        <div className="flex justify-center items-center py-8">
          <p className="text-red-600">Error loading products: {error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!products || products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Brands</h1>
          <div className={styles.divider}></div>
        </div>
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-600">No products available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Brands</h1>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.carousel}>
        <MagneticButton
          customClass={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ''}`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-2" />
        </MagneticButton>

        <div className={styles.productGridContainer}>
          <div 
            className={styles.productGrid}
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
            }}
          >
            {products.map((product, index) => {
              // Add safety checks for product data
              if (!product || !product.images || !product.images[0]) {
                console.warn('Invalid product data at index:', index, product);
                return null;
              }
              
              return (
                <div 
                  key={product._id || index} 
                  className={styles.productCard}
                  style={{ flexBasis: `${cardWidth}%`, maxWidth: `${cardWidth}%` }}
                >
                  <ProductCard
                    id={product._id}
                    imagePath={product.images[0]}
                    itemName={product.product_name}
                    brandName={product.brand}
                    itemPrice={product.price}
                    rating={4}
                    sales={product.sku}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <MagneticButton
          customClass={`${styles.navButton} ${
            currentIndex + itemsPerPage >= products.length ? styles.disabled : ''
          }`}
          onClick={handleNext}
          disabled={currentIndex + itemsPerPage >= products.length}
        >
          <ArrowRight className="ml-2" />
        </MagneticButton>
      </div>
    </div>
  );
};

export default BrandFeature;