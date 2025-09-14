import Image from 'next/image';

const CategoryComponent = ({ wd, hg }) => {
  return (
    <div className={`relative w-[${wd}] h-[${hg}]`}>
      {/* Background Image */}
      <Image
        src="/Bg_category.png"
        alt="Background Image"
        layout="fill" // Use layout fill to cover the entire parent div
        objectFit="cover" // Maintain the aspect ratio
        className="absolute inset-0 z-20" // Position the image behind everything
      />
      {/* Semi-transparent Overlay */}
      <div className="absolute inset-0 bg-yellow-50 z-10" /> {/* Adjust the opacity value here */}


      {/* Overlay Container for Buttons */}
      <div className="flex items-center justify-center relative z-30 h-full">
        {/* Replace these images with your own */}
        <button className="mb-4 lg:mb-6 lg:w-32 lg:h-32 lg:mx-6">
            <Image src="/pants.png" alt="Category 1" width={120} height={120} />
        </button>
        <button className="mb-4 lg:mb-6 lg:w-32 lg:h-32 lg:mx-6">
            <Image src="/shirt.png" alt="Category 2" width={120} height={120} />
        </button>
        <button className="mb-4 lg:mb-6 lg:w-32 lg:h-32 lg:mx-6">
            <Image src="/Dresses.png" alt="Category 3" width={120} height={120} />
        </button>
        <button className="mb-4 lg:mb-6 lg:w-32 lg:h-32 lg:mx-6">
            <Image src="/Shalwar_kameez.png" alt="Category 4" width={120} height={120} />
        </button>
        <button className="mb-4 lg:mb-6 lg:w-32 lg:h-32 lg:mx-6">
            <Image src="/pent_coats.png" alt="Category 5" width={120} height={120} />
        </button>
      </div>

    </div>
  );
};

export default CategoryComponent;
