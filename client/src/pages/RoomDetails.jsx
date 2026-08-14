import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/experience/ReviewForm';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RoomDetails = () => {

    const {id} = useParams();
    const {rooms, getToken, axios, navigate, user} = useAppContext()
    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [reviewEligibility, setReviewEligibility] = useState({ loading: true, canReview: false });

    const [isAvailable, setIsAvailable] = useState(false);

    // Check if the Room is Available
    const checkAvailability = async () => {
      try {
        // Check is Check-In Date is greater than Check-Out Date
        if (checkInDate >= checkOutDate){
          toast.error('Check-In Date should be less than Check-Out Date')
          return;
        }
        // API call
        const {data} = await axios.post('/api/bookings/check-availability', {room: id, checkInDate, checkOutDate})
        // checking data
        if(data.success) {
          if(data.isAvailable){
            setIsAvailable(true)
            toast.success('Room is available')
          }else{
            setIsAvailable(false)
            toast.error('Room is not available')
          }
        } else {
          // error msg from api response
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    // onSubmitHandler function to check availability & book the room
    const onSubmitHandler = async (e) => {
      try {
        e.preventDefault();
        if(!isAvailable){
          return checkAvailability();
        }else {
          // Calling API to book the room
          const { data } = await axios.post('/api/bookings/book', {room: id, checkInDate, checkOutDate, guests, paymentMethod: "Pay At Hotel"}, {headers: { Authorization: `Bearer ${await getToken()}`}})
          // checking response
          if(data.success){
            toast.success(data.message)
            // after success navigating user to my-bookings
            navigate('/my-bookings')
            // Scrolling web page to top
            scrollTo(0, 0)
          } else {
            toast.error(data.message)
          }
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
    const onContactHandler =async ()=>{
      try {
        navigate('/');
        scrollTo(0,0);
      } catch (error) {
        console.log(error)
      }
    }

    const loadReviews = useCallback(async () => {
      try {
        const { data } = await axios.get(`/api/reviews?roomId=${id}`);
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch {
        setReviews([]);
      }
    }, [axios, id]);

    const averageRating = useMemo(() => {
      if (!reviews.length) return 0;
      const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
      return Math.round((total / reviews.length) * 10) / 10;
    }, [reviews]);

    const checkReviewEligibility = useCallback(async () => {
      if (!user || !id) {
        setReviewEligibility({ loading: false, canReview: false });
        return;
      }

      try {
        const { data } = await axios.get('/api/bookings/user', {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });

        if (data.success) {
          const hasCompletedStay = data.bookings.some((booking) => {
            const bookingRoomId = booking.room?._id || booking.room;
            const checkoutDate = new Date(booking.checkOutDate);
            return bookingRoomId === id && checkoutDate < new Date();
          });

          setReviewEligibility({ loading: false, canReview: hasCompletedStay });
        } else {
          setReviewEligibility({ loading: false, canReview: false });
        }
      } catch {
        setReviewEligibility({ loading: false, canReview: false });
      }
    }, [axios, getToken, id, user]);

    const handleReviewSubmit = async (payload) => {
      try {
        const { data } = await axios.post('/api/reviews', payload, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });

        if (data.success) {
          setReviews((prev) => [data.review, ...prev]);
          toast.success('Your review has been submitted.');
        } else {
          toast.error(data.message || 'Unable to submit review.');
        }
      } catch (error) {
        toast.error(error.message || 'Unable to submit review.');
      }
    };

    //Finding Rooms 
    useEffect(()=>{
        const room = rooms.find(room => room._id === id)
        room && setRoom(room)
        room && setMainImage(room.images[0])
    },[rooms, id])

    useEffect(() => {
      loadReviews();
      checkReviewEligibility();
    }, [loadReviews, checkReviewEligibility]);

  return room && (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        {/* Room Details  */}
        <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
            <h1 className='text-3xl md:text-4xl font-playfair'>{room.hotel.name} <span className='font-inter text-sm'>({room.roomType})</span></h1>
            {room.discount > 0 ? <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>{room.discount}% OFF</p> :'' }
        </div>

         {/* Room Rating  */}
        <div className='flex items-center gap-1 mt-2'>
          <StarRating rating={averageRating} />
          <p className='ml-2'>{averageRating} ({reviews.length}{reviews.length > 2 ? '+' : ''} review{reviews.length === 1 ? '' : 's'})</p>
        </div>

        {/* Room Address  */}
        <div className='flex items-center gap-1 text-gray-500 mt-2'>
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.hotel.address}</span>
        </div>

        {/* Room Images  */}
        <div className='flex flex-col lg:flex-row mt-6 gap-6'>

          {/* main image  */}
          <div className='lg:w-1/2 w-full'>
            <img src={mainImage} alt="Room Image" 
            className='w-full rounded-xl shadow-lg object-cover'/>
          </div>
          {/* Other images  */}
          <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
            {room?.images.length > 1 && room.images.map((image, index)=>(
              <img onClick={()=> setMainImage(image)}
              key={index} src={image} alt="Room Image" 
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 'outline outline-orange-500'}`}/>
            ))}
          </div>
        </div>

        {/* Room Highlights  */}
        <div className='flex flex-col md:flex-row md:justify-between mt-10'>
          <div className='flex flex-col'>
            <h1 className='text-3xl md:text-4xl font-playfair'>Experience Luxury Like Never Before</h1>
            {/* Amenities  */}
            <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
              {room.amenities.map((item, index)=>(
                <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                  <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                  <p className='text-xs'>{item}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Room Price  */}
          <p className='text-2xl font-medium'>${room.pricePerNight}/night</p>
        </div>

        {/* CheckIn CheckOut Form  */}
        <form onSubmit={onSubmitHandler} className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>
              
              {/* Left Col input field  */}
              <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>

              {/* Check-In  */}
                <div className='flex flex-col'>
                  <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
                  <input onChange={(e)=>setCheckInDate(e.target.value)} min={new Date().toISOString().split('T')[0]} type="date" id='checkInDate' placeholder='Check-In' className='w-full rounded  border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                </div>

                <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>

              {/* Check-Out  */}
                <div className='flex flex-col'>
                  <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
                  <input onChange={(e)=>setCheckOutDate(e.target.value)} min={checkInDate} disabled={!checkInDate} type="date" id='checkOutDate' placeholder='Check-Out' className='w-full rounded  border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                </div>

                <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
              
              {/* Guests  */}
                <div className='flex flex-col'>
                  <label htmlFor="guests" className='font-medium'>Guests</label>
                  <input onChange={(e)=>setGuests(e.target.value)} value={guests} type="number" id='guests' placeholder='1' className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                </div>

              </div>

              {/* Right col Button  */}
              <button type='submit' className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'>
                  { isAvailable ? "Book Now" : "Check Availability" }
              </button>
        </form>

        {/* Common Specifications  */}
        <div className='mt-25 space-y-4'>
          {roomCommonData.map((spec, index)=>(
            <div key={index} className='flex items-start gap-2'>
              <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5'/>
              <div>
                <p className='text-base'>{spec.title}</p>
                <p className='text-gray-500'>{spec.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description  */}
        <div className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
          <p>Guests will be allocated on the ground floor according to availability. You get a comfortable Two bedroom apartment has a true city feeling. The price quoted is for two guests, at the guests slot please mark the number of guests to get the exact price for groups.</p>
        </div>

        {/* Hosted by  */}
        <div className='flex flex-col items-start gap-4'>
          <div className='flex gap-4'>
            <img src={room.hotel.owner.image} alt="Host" className='h-14 w-14 md:h-18 md:w-18 rounded-full'/>
            <div>
              <p className='text-lg md:text-xl'>Hosted By {room.hotel.name}</p>
              <div className='flex items-center mt-1'>
                <StarRating  />
                <p className='ml-2'>{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
              </div>
            </div>
          </div>
          <button onClick={onContactHandler} className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'>Contact Now</button>
        </div>
          
          <div className='mt-16 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.25em] text-primary'>Guest reviews</p>
              <h2 className='font-playfair text-3xl text-slate-900'>Reviews for this room</h2>
            </div>
            <p className='text-sm text-slate-500'>Only authenticated guests with a completed stay can leave a review.</p>
          </div>

          <div className='mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]'>
            <div className='space-y-4'>
              {reviews.length > 0 ? reviews.map((review) => (
                <div key={review._id || review.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='font-semibold text-slate-900'>{review.title}</p>
                      <p className='text-sm text-slate-500'>{review.name}</p>
                    </div>
                    <div className='rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600'>
                      {review.rating}/5
                    </div>
                  </div>
                  <div className='mt-3 flex items-center gap-1'>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className='mt-3 text-sm leading-7 text-slate-600'>{review.review}</p>
                </div>
              )) : (
                <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600'>
                  No reviews yet for this room. Your stay can be the first one to share.
                </div>
              )}
            </div>
              {reviewEligibility.canReview != true ? "" :
            <ReviewForm
              roomId={id}
              onSubmit={handleReviewSubmit}
              isAuthenticated={Boolean(user)}
              isEligible={reviewEligibility.canReview}
              isCheckingEligibility={reviewEligibility.loading}
            />}
          </div>
        </div> 
      
    </div>
  )
}

export default RoomDetails
