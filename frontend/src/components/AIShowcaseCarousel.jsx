import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SLIDES = [
  {
    id: 'assistant',
    headline: 'AI Travel Assistant',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=85',
    alt: 'Modern traveler exploring with camera and travel plans'
  },
  {
    id: 'itinerary',
    headline: 'Day-Wise Smart Itineraries',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1800&q=85',
    alt: 'Sunrise over the Taj Mahal with golden morning reflections'
  },
  {
    id: 'budget',
    headline: 'Smart Budget Allocation',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1800&q=85',
    alt: 'Scenic tropical beach with palm trees and ocean'
  },
  {
    id: 'route',
    headline: 'Interactive Route Roadmaps',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1800&q=85',
    alt: 'Road trip vehicle traveling along an open scenic highway'
  }
];

export default function AIShowcaseCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentSlide = SLIDES[currentIndex];

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SLIDES.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused, currentIndex]);

  return (
    <div
      className="relative flex h-[520px] w-full items-end justify-center overflow-hidden bg-gray-950 sm:h-[620px] lg:h-full lg:min-h-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Real-Life Background Photography with Smooth Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.alt}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient to ensure the single-line headline and dots are crisp & legible */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"
          />
        </motion.div>
      </AnimatePresence>

      {/* Foreground: Headline of the image on a SINGLE LINE + Running Dots */}
      <div className="relative z-10 flex w-full flex-col items-center justify-end px-4 sm:px-6 pb-10 sm:pb-12 text-center">
        {/* Clean, Modern Headline Guaranteed on a Single Line */}
        <AnimatePresence mode="wait">
          <motion.h3
            key={`headline-${currentSlide.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-lg sm:text-2xl lg:text-3xl font-black text-white font-display tracking-tight drop-shadow-lg mb-5 whitespace-nowrap text-center max-w-full overflow-hidden text-ellipsis"
          >
            {currentSlide.headline}
          </motion.h3>
        </AnimatePresence>

        {/* Minimal Progress / Running Dots */}
        <div className="flex items-center gap-2.5">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                type="button"
                aria-label={`Show ${slide.headline}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-8 bg-white shadow-md shadow-white/40'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
