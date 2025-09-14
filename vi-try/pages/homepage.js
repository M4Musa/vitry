import React from "react"
// import { ReactLenis } from "@studio-freight/react-lenis"
import { ReactLenis } from "../components/LenisWrapper"
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Category from "@/components/Category";
import Bodymesh from "@/components/Bodymesh";
import CustomCarousel from "@/components/CustomCarousel";
import BrandFeature from "@/components/BrandFeature";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import DoorHandle from "@/components/DoorHandle";
import useProducts from '@/hooks/useProducts';
import { useRouter } from "next/router";


const Homepage = () => {
  const router = useRouter();
  const [doorOpen, setDoorOpen] = useState(false);
  const [scrollToCategory, setScrollToCategory] = useState(false);
  const containerRef = useRef(null);
  const categoryRef = useRef(null); // Ref to Category component
  
  const [showScrollTop, setShowScrollTop] = useState(false);
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
    setFilteredProducts


  } = useProducts();

  console.log("filtered products",products);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start", "end start"],
  });

  const leftDoorX = useTransform(scrollYProgress, [0, 0.5], ["0%", "-50%"]);
  const rightDoorX = useTransform(scrollYProgress, [0, 0.5], ["0%", "50%"]);
  const doorOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

 


  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setDoorOpen(latest >= 0.5); // Set doorOpen to true when progress reaches or exceeds 50%
    });


    
    // Trigger scroll to category when the door is fully open
    if (doorOpen && categoryRef.current) {
      setScrollToCategory(true);
    }

    return () => unsubscribe();
  }, [scrollYProgress, doorOpen]);

  const handleButtonClick = () => {
    router.push("/clora");
  };

  return (
    <ReactLenis root>
      <>
        {/* Conditional Sticky Container */}
        <div className={`${doorOpen ? "" : "sticky"} inset-0 z-100`}>
          <div className="relative">
            <Navbar />
            <div className="w-full h-screen relative overflow-hidden">
              <Image
                src="/background.png"
                alt="Background"
                layout="fill"
                objectFit="cover"
              />
              {/* Left Door */}
              <motion.div
                className="absolute top-0 left-0 w-1/2 h-full bg-transparent backdrop-blur-md z-10"
                style={{
                  translateX: leftDoorX,
                  opacity: doorOpacity,
                }}
              >
                {/* <DoorHandle position="right" /> */}
              </motion.div>
              {/* Right Door */}
              <motion.div
                className="absolute top-0 right-0 w-1/2 h-full bg-transparent backdrop-blur-md z-10"
                style={{
                  translateX: rightDoorX,
                  opacity: doorOpacity,
                }}
              >
                {/* <DoorHandle position="left" /> */}
              </motion.div>
            </div>
            {/* Magnetic Button */}
            <MagneticButton
              color="bg-pink-950"
              customClass="absolute left-[53%] bottom-[10%] bg-pink-950 text-white p-2 rounded-3xl
              transform -translate-x-1/2 
              md:left-[46%] md:bottom-[10%] md:translate-x-0 
              sm:left-[53%] sm:bottom-[10%]"
              onClick={handleButtonClick}
            >
              <div className="flex">
                <Image src="/ic_try_on_now.png" alt="btn" width={20} height={10} />
                Try-On Now!
              </div>
            </MagneticButton>
          </div>
        </div>
        <div className="h-[220vh] bg-white"></div>

        {/* Main content */}
        <div className="bg-white">
          <Category ref={categoryRef} />
          <div className="bg-white">
            <BrandFeature />
          </div>
          <Bodymesh />
          <CustomCarousel />
          <Footer />
        </div>
      </>
    </ReactLenis>
  );
};

export default Homepage;

