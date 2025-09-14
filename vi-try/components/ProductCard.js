import { useRouter } from 'next/router';
import { formatPricePkr } from '@/utils/currency';

const ProductCard = ({ id, imagePath, brandName, itemName, itemPrice, rating, sales }) => {
  const router = useRouter();

  // Add safety checks for product data

  const handleClick = () => {
    if (id) {
      router.push(`/clora_result/${id}`);
    } else {
      console.warn('ProductCard: No ID provided for navigation');
    }
  };

  return (
<div 
  className="max-w-xs p-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
  onClick={handleClick}
>
  <div className="w-full h-56 relative">  
    <img
      src={imagePath || '/image_35.png'}
      alt={itemName || 'Product image'}
      className="rounded-lg object-cover w-full h-full mb-2"
      onError={(e) => {
        e.target.src = '/image_35.png';
      }}
    />
  </div>

  <div className="mt-4">
    <div className="flex justify-between items-center">
      <p className="text-sm font-bold" style={{ color: 'rgb(127, 29, 29)' }}>{brandName || 'Unknown Brand'}</p>  
      <p className="mt-2 text-xl font-bold text-gray-900">
        {itemPrice ? formatPricePkr(itemPrice) : 'Price N/A'}
      </p>
    </div>
    <h3 className="text-lg font-semibold text-gray-300 mt-2">{itemName || 'Product Name'}</h3>
  </div>
</div>


  );
};

export default ProductCard;