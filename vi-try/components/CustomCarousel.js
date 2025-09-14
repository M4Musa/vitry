import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(2);
  const images = [
    '/collage_img1.png',
    '/collage_img2.png',
    '/collage_img3.png',
    '/collage_img4.png',
    '/collage_img5.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getImageStyle = (index) => {
    const isCurrent = index === currentIndex;
    return {
      width: isCurrent ? '300px' : '200px',
      height: isCurrent ? '225px' : '150px',
      transition: 'all 0.3s ease',
      margin: '0 10px',
    };
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div className="flex items-center justify-center">
        <button onClick={handlePrev} className="absolute left-4 z-10">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center transition-transform duration-300 ease-in-out" style={{
          transform: `translateX(${-(currentIndex * 220) + 440}px)`
        }}>
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Carousel image ${index + 1}`}
              style={getImageStyle(index)}
              className="object-cover"
            />
          ))}
        </div>
        <button onClick={handleNext} className="absolute right-4 z-10">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default CustomCarousel;