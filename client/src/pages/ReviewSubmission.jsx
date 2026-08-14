import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReviewForm from '../components/experience/ReviewForm';
import { seedReviews } from '../content/reviewsData';
import { useAppContext } from '../context/AppContext';

const ReviewSubmission = () => {
  const { axios, user } = useAppContext();
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

  const handleSubmit = async (review) => {
    try {
      const { data } = await axios.post('/api/reviews', review);
      if (data.success) {
        setReviews((prev) => [data.review, ...prev]);
      }
    } catch {
      setReviews((prev) => [review, ...prev]);
    }
  };

  return (
    <div className="px-4 py-24 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-6 py-10 text-white shadow-xl sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <span>/</span>
            <span>Review Submission</span>
          </div>
          <div className="mt-8 max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">Your voice matters</p>
            <h1 className="font-playfair text-4xl sm:text-5xl">Share the stay that shaped your trip</h1>
            <p className="text-lg text-slate-300">
              Whether it was a peaceful getaway or a memorable city escape, your experience helps future travelers discover stays that feel personal, polished, and worth returning to.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ReviewForm onSubmit={handleSubmit} isAuthenticated={Boolean(user)} isEligible={true} />

          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Why it helps</p>
              <h2 className="font-playfair text-2xl text-slate-900">Every review adds context</h2>
            </div>
            <ul className="space-y-3 text-sm leading-7 text-slate-600">
              <li>• Highlight the thoughtful touches that stood out during your stay.</li>
              <li>• Share tips for travelers planning their next trip.</li>
              <li>• Help others discover properties that match their travel style.</li>
            </ul>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Review count</p>
              <p className="mt-1">{reviews.length} experiences shared so far</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmission;
