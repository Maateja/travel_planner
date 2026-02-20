import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, 
  Camera, 
  Map as MapIcon, 
  Compass, 
  Sun, 
  Ticket, 
  Smartphone, 
  GlassWater,
  Footprints,
  Navigation,
  Backpack
} from 'lucide-react';

const TravelItem = ({ icon: Icon, delay }) => {
  const [startPos, setStartPos] = useState({ x: 0, y: 0, rot: 0 });

  useEffect(() => {
    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    const offset = 400;

    if (edge === 0) { y = -600; x = Math.random() * 400 - 200; }
    else if (edge === 1) { x = 600; y = Math.random() * 400 - 200; }
    else if (edge === 2) { y = 600; x = Math.random() * 400 - 200; }
    else { x = -600; y = Math.random() * 400 - 200; }

    setStartPos({ x, y, rot: Math.random() * 360 });
  }, []);

  return (
    <motion.div
      initial={{ x: startPos.x, y: startPos.y, opacity: 0, scale: 0.8, rotate: startPos.rot }}
      animate={{ 
        x: [startPos.x, startPos.x * 0.2, 0],
        y: [startPos.y, -250, 40], // Higher arch for realistic drop
        opacity: [0, 1, 1, 0], 
        scale: [0.8, 1, 1, 0.1],
        rotate: [startPos.rot, startPos.rot + 180, 0]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        delay: delay,
        ease: [0.4, 0, 0.2, 1] 
      }}
      className="absolute text-primary-500 drop-shadow-2xl z-20"
    >
      <Icon size={44} strokeWidth={1.5} />
    </motion.div>
  );
};

const LoadingScreen = ({ isVisible }) => {
  const items = [
    { icon: Shirt, delay: 0 },
    { icon: GlassWater, delay: 0.4 },
    { icon: Camera, delay: 0.8 },
    { icon: Ticket, delay: 1.2 },
    { icon: Compass, delay: 1.6 },
    { icon: MapIcon, delay: 2.0 },
    { icon: Footprints, delay: 2.3 },
    { icon: Navigation, delay: 2.6 },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <div className="relative w-full h-[500px] flex items-center justify-center overflow-visible">
            
            {/* Flying Items */}
            {items.map((item, idx) => (
              <TravelItem 
                key={idx} 
                icon={item.icon} 
                delay={item.delay} 
              />
            ))}

            {/* Trekking Bag Container */}
            <motion.div
               animate={{ 
                 scale: [1, 1.05, 1],
                 y: [0, -5, 0]
               }}
               transition={{ 
                 duration: 0.3, 
                 repeat: Infinity,
                 repeatDelay: 0.2
               }}
               className="relative flex flex-col items-center"
            >
                {/*Realistic Hiking Bag Lid */}
                <motion.div 
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: -120 }} // Opens wide
                    exit={{ rotateX: 0 }}      // Closes on exit
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute top-0 w-32 h-16 bg-gray-800 rounded-t-3xl border-t-4 border-gray-700 z-30 origin-bottom shadow-lg"
                    style={{ transformPerspective: 1000 }}
                >
                    {/* Lid Detail */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-700/50 rounded-full" />
                </motion.div>

                {/* Cylindrical Bag Body */}
                <div className="mt-8 w-32 h-48 bg-gray-800 rounded-b-3xl border-x-4 border-b-8 border-gray-900 relative z-20 shadow-2xl overflow-hidden">
                    {/* Front Mesh/Pocket */}
                    <div className="mt-10 mx-auto w-24 h-28 border-2 border-gray-900/50 rounded-2xl bg-gray-900/30 flex flex-col gap-2 p-3">
                        <div className="h-1.5 w-full bg-gray-900/40 rounded-full" />
                        <div className="h-1.5 w-3/4 bg-gray-900/40 rounded-full" />
                        <div className="h-1.5 w-1/2 bg-gray-900/40 rounded-full" />
                    </div>

                    {/* Logo Detail */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center opacity-20 grayscale">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-primary-500 rounded-sm rotate-45" />
                            <span className="text-[7px] font-black text-white uppercase italic">BagsUp</span>
                        </div>
                    </div>
                </div>

                {/* Side compression straps */}
                <div className="absolute -left-2 top-20 w-3 h-20 bg-gray-900 rounded-full z-25 opacity-40 shadow-sm" />
                <div className="absolute -right-2 top-20 w-3 h-20 bg-gray-900 rounded-full z-25 opacity-40 shadow-sm" />

                {/* Shadow */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-32 h-6 bg-black/60 rounded-full blur-2xl absolute -bottom-6 z-10" 
                />
            </motion.div>
          </div>

          {/* Premium Typography */}
          <div className="text-center mt-6">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
             >
                <motion.h3 
                    animate={{ letterSpacing: ["0.2em", "0.5em", "0.2em"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-3xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-tight"
                >
                    Packing your adventure
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >...</motion.span>
                </motion.h3>
                <motion.p 
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white/70 font-bold text-xs uppercase tracking-[0.6em]"
                >
                    Getting things ready
                </motion.p>
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
