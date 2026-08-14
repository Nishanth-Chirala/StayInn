import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialValues = {
  name: '',
  rating: 5,
  title: '',
  review: '',
  photos: '',
  consent: false,
};

const ReviewForm = ({ onSubmit, roomId, isAuthenticated, isEligible, isCheckingEligibility }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return (
      isAuthenticated &&
      isEligible &&
      form.name.trim() &&
      form.title.trim() &&
      form.review.trim().length >= 20 &&
      form.consent
    );
  }, [form, isAuthenticated, isEligible]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setError('Please complete the required fields and confirm your consent.');
      return;
    }

    const payload = {
      ...form,
      roomId,
      id: `review-${Date.now()}`,
      photos: form.photos
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    onSubmit(payload);
    setForm(initialValues);
    navigate('/experience');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Share your experience</p>
        <h2 className="font-playfair text-3xl text-slate-900">Tell us about your stay</h2>
        <p className="text-sm text-slate-600">Your feedback helps future travelers discover stays that feel thoughtfully designed and genuinely welcoming.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 transition focus:border-primary"
            placeholder="Enter your name"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          <span className="font-medium">Rating</span>
          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Title</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
            placeholder="A short headline for your review"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Review</span>
          <textarea
            name="review"
            value={form.review}
            onChange={handleChange}
            className="min-h-36 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
            placeholder="Share the details that mattered most during your stay"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Photos</span>
          <input
            name="photos"
            value={form.photos}
            onChange={handleChange}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
            placeholder="Paste image URLs separated by commas"
          />
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
        <span>I consent to my review and optional photos being shared publicly on this site.</span>
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!isAuthenticated ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Please sign in to leave a review for this room.
        </p>
      ) : null}

      {isAuthenticated && !isCheckingEligibility && !isEligible ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Reviews become available after your checkout date has passed for this room.
        </p>
      ) : null}

      {isCheckingEligibility ? (
        <p className="text-sm text-slate-500">Checking your stay history for this room…</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!canSubmit} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
          Submit review
        </button>
        <button type="button" onClick={() => navigate('/experience')} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          View experiences
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
