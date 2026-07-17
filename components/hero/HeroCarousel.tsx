'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  cta: string;
}

export function HeroCarousel() {
  const { slides, fetchSlides } = useProductStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (!autoPlay || !slides || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, slides]);

  const nextSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-96 md:h-[500px] rounded-2xl bg-slate-950/60 border border-cyan-500/20 flex items-center justify-center">
        <span className="text-slate-400 font-medium">No slider content found. Add slides from admin dashboard.</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-2xl">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 animate-slide-in-up">
            <div className="inline-block w-fit mb-4">
              <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-sm font-semibold text-cyan-400 backdrop-blur-sm">
                {slide.badge}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-2xl">
              {slide.title}
            </h1>

            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-xl">
              {slide.subtitle}
            </p>

            <div className="flex gap-4">
              <button className="btn-futuristic">
                {slide.cta}
              </button>
              <button className="px-6 py-3 rounded-xl font-semibold border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full backdrop-blur-sm ${
              index === currentSlide
                ? 'w-8 h-3 bg-cyan-400 border border-cyan-300'
                : 'w-3 h-3 bg-white/40 border border-white/50 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
