import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const HotelCard = ({ room, index }) => {
  const { axios } = useAppContext();
  
  // Keep only the review count state needed for the "Best Seller" badge layout
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadReviewCount = async () => {
      try {
        const { data } = await axios.get(`/api/reviews/stats?roomId=${room._id}`);
        
        if (isMounted) {
          // Extract only the total number of reviews from your backend payload
          setTotalReviews(data.success && data.stats ? (data.stats.totalReviews || 0) : 0);
        }
      } catch {
        if (isMounted) {
          setTotalReviews(0);
        }
      }
    };

    loadReviewCount();
    
    return () => {
      isMounted = false;
    };
  }, [axios, room._id]);

  // Badge condition based purely on review numbers and list order
  const isBestSeller = totalReviews > 10 || index === 0;

  return (
    <Link 
      to={'/rooms/' + room._id} 
      onClick={() => window.scrollTo(0, 0)} 
      className='relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)]'
    >
      <img src={room.images[0]} alt={room.hotel.name} />

      {isBestSeller && (
        <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full shadow-sm'>
          Best Seller
        </p>
      )}

      <div className='p-4 pt-5'>
        <div className='flex items-center justify-between mb-1'>
          <p className='font-playfair text-xl font-medium text-gray-800'>{room.hotel.name}</p>
        </div>
        
        <div className='flex items-center gap-1 text-sm mb-4'>
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.hotel.address}</span>
        </div>
        
        <div className='flex items-center justify-between'>
          <p><span className='text-xl text-gray-800'>${room.pricePerNight}</span>/night</p>
          <button className='px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer'>
            Book Now
          </button>
        </div>
      </div>
    </Link>
  )
}

export default HotelCard
