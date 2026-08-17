import React from 'react'
import Title from './Title'
import StarRating from './StarRating'
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useEffect } from 'react'
import { seedReviews } from '../content/reviewsData';

const Testimonial = () => {
  const { axios } = useAppContext();
    const [reviews, setReviews] = useState(() => seedReviews);
  
    useEffect(() => {
      const loadReviews = async () => {
        try {
          const { data } = await axios.get('/api/reviews/getallreviews');
          if (data.success) {
            setReviews(data.reviews);
          }
        } catch {
          setReviews(seedReviews);
        }
      };
  
      loadReviews();
    }, [axios]);
  
  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30'>
      
      <Title 
        title='What Our Guests Say' 
        subTitle='Discover why discerning travelers consistently choose QuickStay for their exclusive and luxurious accommodations around the world.'
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 w-full">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <img className="w-12 h-12 rounded-full" src={review.image} alt={review.name} />
              <div>
                <p className="font-playfair text-xl">{review.name}</p>
                <p className="text-gray-500">{review.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-4">
              <StarRating rating={review.rating} />
            </div>

            <p className="text-gray-500 max-w-90 mt-4">"{review.review}"</p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Testimonial
