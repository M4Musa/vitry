import { useRouter } from 'next/router';

const ProductCard = ({ id, imagePath, brandName, itemName, itemPrice, rating, sales }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/clora_result/${id}`);
  };

  return (
<div 
  className="max-w-xs p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
  onClick={handleClick}
>
  <div className="w-full h-56 relative">  
    <img
      src={imagePath}
      alt={itemName}
      className="rounded-lg object-cover w-full h-full mb-2"  
    />
  </div>

  <div className="mt-4">
    <div className="flex justify-between items-center">
      <p className="text-sm font-bold" style={{ color: 'rgb(127, 29, 29)' }}>{brandName}</p>  
      <p className="mt-2 text-xl font-bold text-gray-900">${itemPrice}</p>
    </div>
    <h3 className="text-lg font-semibold text-gray-300 mt-2">{itemName}</h3>
  </div>
</div>


  );
};

export default ProductCard;