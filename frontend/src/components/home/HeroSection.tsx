'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Flash Sale - Up to 70% Off',
    subtitle: 'Limited time offers on top electronics, fashion & more',
    cta: 'Shop Flash Sale',
    href: '/flash-sale',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=500&fit=crop',
    accent: '#FF9900',
  },
  {
    id: 2,
    title: 'New Tech Arrivals 2024',
    subtitle: 'Discover the latest gadgets from top brands',
    cta: 'Explore Now',
    href: '/categories/electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&h=500&fit=crop',
    accent: '#00A8CC',
  },
  {
    id: 3,
    title: 'Fashion Forward',
    subtitle: 'Style meets comfort. New collection just dropped.',
    cta: 'View Collection',
    href: '/categories/fashion',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&h=500&fit=crop',
    accent: '#067D62',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full h-64 md:h-[420px] overflow-hidden bg-amazon-navy">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            priority
            className="object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-amazon-navy/80 via-amazon-navy/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1500px] mx-auto px-8 md:px-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-5xl font-black text-white mb-3 max-w-xl leading-tight">
                  {slides[current].title}
                </h1>
                <p className="text-gray-200 text-sm md:text-lg mb-6 max-w-md">
                  {slides[current].subtitle}
                </p>
                <Link
                  href={slides[current].href}
                  className="inline-flex items-center gap-2 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-bold px-6 py-3 rounded-md transition-colors text-sm md:text-base"
                >
                  {slides[current].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-amazon-orange w-6' : 'bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
