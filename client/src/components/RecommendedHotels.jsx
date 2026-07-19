import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'

const RecommendedHotels = () => {

    // Getting rooms data through AppContext.jsx file
    const {rooms, searchedCities} = useAppContext();
    
    // State variables
    const [recommended, setRecommended] = useState([]);

    // Filtering hotels for particular city
    const filterHotels = () => {
        const filteredHotels = rooms.slice().filter( room => searchedCities.includes(room.hotel.city));
        setRecommended(filteredHotels);
    }

    // Executing the function whenever the component get loaded
    useEffect(() => {
        filterHotels()
    },[rooms, searchedCities])

  return recommended.length > 0 && (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>

        <Title title='Recommended Hotels' subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.'/>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20'>
            {recommended.slice(0,4).map((room, index)=>(
                <HotelCard key={room._id} room={room} index={index}/>
            ))}
        </div>

    </div>
  )
}

export default RecommendedHotels;
