import React, { useMemo, useState } from 'react';
import StarRating from '../StarRating';

const filters = ['All', '5 stars', '4 stars', '3 stars'];

const ExperienceList = ({ reviews }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const visibleReviews = useMemo(() => {
    if (activeFilter === 'All') return reviews;
    const minRating = Number(activeFilter.split(' ')[0]);
    return reviews.filter((review) => review.rating >= minRating);
  }, [activeFilter, reviews]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Guest stories</p>
          <h2 className="font-playfair text-3xl text-slate-900">Experiences shared by travelers</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === filter ? 'bg-primary text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {visibleReviews.map((review) => (
          <article key={review.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-4 p-6">
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

              {review.photos?.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {review.photos.map((photo, index) => (
                    <img key={`${review.id}-${index}`} src={photo} alt={`${review.title} photo ${index + 1}`} className="h-40 w-full rounded-2xl object-cover" />
                  ))}
                </div>
              ) : null}
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
