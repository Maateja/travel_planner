import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Wallet, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const JourneyMap = ({ itinerary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!itinerary || itinerary.length === 0) return null;

  const handleNext = () => {
    if (currentIndex < itinerary.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToDay = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full py-16 overflow-hidden select-none px-4">
      {/* 🏁 Roadmap Header */}
      <div className="container mx-auto mb-12">
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
          <div className="w-2.5 h-8 bg-primary-500 rounded-full shadow-lg"></div>
          Your Journey Roadmap
        </h3>
        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2 ml-5">
          Interactive Day-by-Day Explorer
        </p>
      </div>

      {/* 1️⃣ Carousel Section */}
      <div className="relative flex justify-center items-center h-[600px] mb-12">
        {/* Desktop Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-4 z-50 pointer-events-none">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`pointer-events-auto p-4 rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 transition-all ${
              currentIndex === 0 ? 'opacity-0 cursor-default' : 'hover:scale-110 active:scale-95 text-primary-600'
            }`}
          >
            <ChevronLeft size={32} strokeWidth={3} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === itinerary.length - 1}
            className={`pointer-events-auto p-4 rounded-full bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 transition-all ${
              currentIndex === itinerary.length - 1 ? 'opacity-0 cursor-default' : 'hover:scale-110 active:scale-95 text-primary-600'
            }`}
          >
            <ChevronRight size={32} strokeWidth={3} />
          </button>
        </div>

        {/* Cards Container */}
        <div className="relative w-full max-w-7xl flex justify-center items-center h-full">
          <AnimatePresence initial={false}>
            {itinerary.map((dayPlan, idx) => {
              const distance = idx - currentIndex;
              const isCenter = distance === 0;
              const isAdjacent = Math.abs(distance) === 1;

              // Logic for desktop vs mobile visibility (simplification for React side)
              // We use Framer Motion for the layout transitions
              return (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{
                    x: `${distance * 105}%`, // Spacing between cards
                    scale: isCenter ? 1 : 0.85,
                    opacity: isCenter ? 1 : (isAdjacent && window.innerWidth > 768) ? 0.6 : 0,
                    filter: isCenter ? 'blur(0px)' : (isAdjacent && window.innerWidth > 768) ? 'blur(4px)' : 'blur(10px)',
                    zIndex: isCenter ? 30 : 20,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 26
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -50 && currentIndex < itinerary.length - 1) handleNext();
                    else if (swipe > 50 && currentIndex > 0) handlePrev();
                  }}
                  className={`absolute w-[90%] sm:w-[450px] h-[520px] cursor-grab active:cursor-grabbing`}
                >
                  <div className={`
                    h-full w-full bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 flex flex-col relative overflow-hidden
                    ${isCenter ? 'ring-4 ring-primary-500/20' : 'pointer-events-none'}
                  `}>
                    {/* Day Badge */}
                    <div className="flex items-center justify-between mb-8">
                      <div className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${
                        isCenter ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'bg-gray-100 text-gray-400'
                      }`}>
                        Day {dayPlan.day}
                      </div>
                      {dayPlan.estimated_cost && (
                        <div className="flex items-center gap-2 text-emerald-600 font-black">
                          <Wallet size={16} />
                          <span>₹{dayPlan.estimated_cost}</span>
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-tight">
                      {dayPlan.title}
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-6">
                      <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                        {dayPlan.plan_description}
                      </p>

                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-6 h-1 bg-primary-500 rounded-full" />
                           Activities
                        </h4>
                        <ul className="space-y-3">
                          {dayPlan.activities.map((activity, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-3">
                              <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-bold text-gray-700 leading-snug">
                                {typeof activity === 'string' ? activity : activity.activity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                          <Clock size={14} className="text-blue-400" />
                          <span>Exploring {itinerary.length} Days</span>
                       </div>
                       <Sparkles size={18} className="text-primary-400 opacity-30" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* 3️⃣ Pipeline Navigation Section */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-center relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          
          <div className="flex items-center justify-between w-full relative z-10">
            {itinerary.map((dayPlan, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => goToDay(idx)}
                    className={`
                      w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center font-black text-sm z-20 group
                      ${isActive 
                        ? 'bg-primary-500 border-primary-500 text-white scale-125 shadow-[0_0_20px_rgba(20,184,166,0.5)] pipeline-active' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-500'
                      }
                    `}
                  >
                    {dayPlan.day}
                  </button>
                  {idx < itinerary.length - 1 && (
                    <div className={`flex-1 h-0.5 transition-colors duration-500 ${
                      idx < currentIndex ? 'bg-primary-500' : 'bg-gray-100'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
          Stage {currentIndex + 1} of {itinerary.length}
        </p>
      </div>
    </div>
  );
};

export default JourneyMap;
