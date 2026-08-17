import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ExperienceList from '../components/experience/ExperienceList';
import { seedReviews } from '../content/reviewsData';
import { useAppContext } from '../context/AppContext';

const Experience = () => {
  const { axios } = useAppContext();
  const [reviews, setReviews] = useState(() => seedReviews);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data } = await axios.get('/api/reviews');
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch {
        setReviews(seedReviews);
      }
    };
 
    loadReviews();
  }, [axios]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="px-4 py-24 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link to="/" className="transition hover:text-slate-900">Home</Link>
            <span>/</span>
            <span>Experiences</span>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Traveler experiences</p>
              <h1 className="font-playfair text-4xl sm:text-5xl">Explore what guests loved most</h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Browse thoughtful stories from guests who discovered calm, comfort, and memorable stays with us.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Average rating</p>
              <p className="mt-2 font-playfair text-4xl">{averageRating}</p>
              <p className="mt-2 text-sm text-slate-300">Across {reviews.length} submitted experiences</p>
            </div>
          </div>
        </div>

        <ExperienceList reviews={reviews} />
      </div>
    </div>
  );
};

export default Experience;
