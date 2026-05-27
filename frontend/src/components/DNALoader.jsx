import React from 'react';
import { motion } from 'framer-motion';

const DNALoader = () => {
  const dots = [0, 1, 2, 3, 4, 5];
  
  return (
    <div className="inline-flex items-center justify-center gap-2 p-2">
      {dots.map((i) => (
        <motion.div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`}
          animate={{
            y: [0, -12, 0, 12, 0],
            scale: [1, 1.2, 1, 0.8, 1],
            opacity: [0.7, 1, 1, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
          style={{
            boxShadow: `0 0 15px ${i % 2 === 0 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'}`,
          }}
        />
      ))}
    </div>
  );
};

export default DNALoader;
