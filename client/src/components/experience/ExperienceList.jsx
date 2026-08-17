import React, { useMemo, useState } from 'react';
import StarRating from '../StarRating';
import { Link } from 'react-router-dom'

const filters = ['All', '5 stars', '4 stars', '3 stars'];

const ExperienceList = ({ reviews}) => { // Added default array parameter to prevent mapping crashes
  console.log('ExperienceList reviews:', reviews); 
  const [activeFilter, setActiveFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  const cities = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return [];
    const uniqueCities = [...new Set(reviews.map(review => review.room?.hotel?.city).filter(Boolean))];
    return ['All', ...uniqueCities.sort()];
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    // Fix 1: Handle fallback case safely if reviews are undefined or null initially
    if (!reviews || !Array.isArray(reviews)) return [];
    
    let filtered = reviews;
    
    if (activeFilter !== 'All') {
      const minRating = Number(activeFilter.split(' ')[0]);
      // Fix 2: Changed from '>=' to '===' to match the exact selected star filter
      filtered = filtered.filter((review) => Math.floor(review.rating) === minRating);
    }
    
    if (cityFilter !== 'All') {
      filtered = filtered.filter((review) => review.room?.hotel?.city === cityFilter);
    }
    
    return filtered;
  }, [activeFilter, cityFilter, reviews]);
  const handleonlcick = (roomId) => {
    navigation.navigate(`/rooms/${roomId}`);
  }
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Guest stories</p>
          <h2 className="font-playfair text-3xl text-slate-900">Experiences shared by travelers</h2>
        </div>
        <div className="flex flex-col gap-4">
  {/* Status Filters */}
  <div className="flex flex-wrap gap-2">
    {filters.map((filter) => (
      <button
        key={filter}
        onClick={() => setActiveFilter(filter)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer ${
          activeFilter === filter
            ? 'bg-primary text-white shadow-sm'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
        }`}
      >
        {filter}
      </button>
    ))}
  </div>

  {/* City Filter */}
  <div className="flex items-center gap-3">
    <label
      htmlFor="city"
      className="text-sm font-medium text-slate-600 whitespace-nowrap"
    >
      Filter by City
    </label>

    <select
      id="city"
      onChange={(e) => setCityFilter(e.target.value)}
      value={cityFilter}
      className="w-full max-w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      {cities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  </div>
</div>
      </div>

      {/* Fix 3: Wrapped list inside a relative aspect box to guarantee identical card heights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {visibleReviews.map((review) => (
          <article key={review._id} className="group relative flex flex-col h-[380px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
            
            {/* FIX: Absolute invisible overlay overlaying the card layout bounds */}
            <Link
              to={'/rooms/' + review?.room?._id} 
              onClick={() => window.scrollTo(0, 0)} 
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label={`View room details for stay in ${review.room?.hotel?.city || 'this room'}`}
            />
            <div className="space-y-4 p-6" onClick={() => handleonlcick(review.room._id)}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{review.title}</h3>
                  <p className="text-sm text-slate-500">{review.name}</p>
                </div>
                <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                  {review.rating}/5
                </div>
              </div>

              <div className="flex items-center gap-1">
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm leading-7 text-slate-600">{review.review}</p>
              {/* Fix 8: Image container stays locked smoothly at the base of the uniform sized card layout */}
              <div className="mt-auto pt-2 flex-1 min-h-0">
                {review.photos?.length ? (
                  <div className="grid gap-3 grid-cols-2 h-full max-h-28">
                    {review.photos.slice(0, 2).map((photo, index) => (
                      <img 
                        key={`${review._id}-${index}`} 
                        src={photo} 
                        alt={`Review asset ${index + 1}`} 
                        className="h-full w-full rounded-2xl object-cover" 
                      />
                    ))}
                  </div>
                ) : (
                  // Fallback spacer to maintain exact card heights when reviews have no photos attached
                  <div className="h-full max-h-28 bg-slate-50 rounded-2xl border border-dashed border-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Verified Stay
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {visibleReviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          No reviews match this filter yet. Try a different selection.
        </div>
      ) : null}
    </section>
  );
};

export default ExperienceList;
