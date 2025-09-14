import Image from 'next/image';
import MagneticButton from './MagneticButton';
const Bodymesh = () => {
  return (
    <div className="flex w-full bg-yellow-50 flex-col md:flex-row">
      {/* Text Section */}
      <div className="w-full md:w-8/12 p-2">
        <h1 className="text-3xl font-bold mb-2 mt-2 p-4 text-pink-200">
          Why 3D Meshes Are Important for Virtual Try-Ons?
        </h1>
        <div className="w-9/12 h-1 border-b-4 ml-0 md:ml-16 border-pink-200 border-dotted"></div>
        
        {/* Grid Layout for Text Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-16 pl-0 pt-10 md:pl-16">
          <div className="m-3">
            <Image
              src="/Accuracy.png" // Replace with the actual image path
              alt="Accuracy and Realism Image"
              width={120} // Adjust size
              height={120} // Adjust size
            />
            <h2 className="text-lg font-semibold mb-2 text-black">Accuracy and Realism</h2>
            <p className='text-black'>
              3D meshes accurately capture the shape, texture, and drape of clothing items, providing a highly
              realistic representation of how they would look in real life.
            </p>
          </div>

          <div className="m-3">
            <Image
              src="/Inclusiveness.png" // Replace with the actual image path
              alt="Inclusiveness Image"
              width={120} // Adjust size
              height={120} // Adjust size
            />
            <h2 className="text-lg font-semibold mb-2 text-black">Inclusiveness</h2>
            <p className='text-black'>
              3D meshes are inclusive and accommodate diverse body types precisely, regardless of age, gender, or race.
            </p>
          </div>

          <div className="m-3">
            <Image
              src="/Intertive.png" // Replace with the actual image path
              alt="Interactive Experience Image"
              width={120} // Adjust size
              height={120} // Adjust size
            />
            <h2 className="text-lg font-semibold mb-2 text-black">Interactive Experience</h2>
            <p className='text-black'>
              3D meshes enable users to interact with the clothing, such as adjusting the fit or viewing it from different
              angles, providing a more engaging and personalized experience.
            </p>
          </div>
        </div>
                {/* Button Below the Image */}
        <div className='left-0 pl-4 p-4'>
          <MagneticButton customClass="bg-pink-950 text-white p-2 rounded-3xl flex items-center justify-center">
            <div className="flex items-center">
              <Image
                src="/ic_try_on_now.png" // Make sure to use the correct path
                alt="btn"
                width={20}
                height={10}
                className="mr-2" // Add some margin to the right of the icon
              />
              <p className='text-xs md:text-sm lg:text-base'>Scan Body</p>
            </div>
          </MagneticButton>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-5/12 relative justify-center flex">
        <div className="w-full md:w-5/12 relative h-72 md:h-full"> {/* Set height for mobile and full for larger screens */}
            <Image
                src="/body_mesh.png" // Replace with your actual image path
                alt="3D Model"
                layout="fill" // Make the image fill the parent container
                objectFit="contain" // Maintain aspect ratio
                className="rounded-3xl"
            />
        </div>
      </div>
    </div>
  );
};

export default Bodymesh;
