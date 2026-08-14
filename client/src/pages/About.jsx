import React from 'react';
import { Link } from 'react-router-dom';

const values = [
  {
    title: 'Thoughtful design',
    text: 'We curate stays that feel intentional, warm, and beautifully considered from first impression to final night.',
  },
  {
    title: 'Seamless stays',
    text: 'From booking to check-in, our experience is designed to feel easy, clear, and dependable.',
  },
  {
    title: 'Real hospitality',
    text: 'We believe memorable travel comes from genuine care, local insight, and human connection.',
  },
];

const About = () => {
  return (
    <div className="px-4 py-24 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-blue-700 to-slate-900 text-white shadow-xl">
          <div className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-14 lg:py-16">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">About StayInn</p>
              <h1 className="font-playfair text-4xl sm:text-5xl">Creating stays that feel personal, polished, and effortless.</h1>
              <p className="max-w-2xl text-lg text-blue-50">
                We believe great travel should feel calm, considered, and deeply comfortable. That is why we handpick places that combine comfort, character, and thoughtful service.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/experience" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Explore experiences</Link>
                <Link to="/review-submission" className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Share your review</Link>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Our promise</p>
              <p className="mt-3 font-playfair text-3xl">A stay that feels like the best version of your trip.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Our mission</p>
            <h2 className="mt-3 font-playfair text-3xl text-slate-900">Making exceptional stays accessible to every traveler</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              StayInn exists to simplify travel discovery. We help guests find beautifully designed spaces, dependable hosts, and experiences that feel effortless from the first search to the final checkout.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Our story</p>
            <h2 className="mt-3 font-playfair text-3xl text-slate-900">Built around the feeling of coming home somewhere new</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              What started as a simple idea—to make stays feel more personal and more memorable—has grown into a platform shaped by thoughtful design, local character, and guest stories.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Our values</p>
              <h2 className="font-playfair text-3xl text-slate-900">The principles behind every stay</h2>
            </div>
            <p className="max-w-2xl text-slate-600">We are guided by quality, transparency, and a genuine commitment to making each experience feel considered and inviting.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl bg-slate-50 p-6">
                <h3 className="text-xl font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-900 px-8 py-10 text-center text-white shadow-sm">
          <h2 className="font-playfair text-3xl">Ready to experience something memorable?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">Browse our curated stays, read guest stories, or share your own review to help shape the community.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/rooms" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">View stays</Link>
            <Link to="/review-submission" className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Write a review</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
