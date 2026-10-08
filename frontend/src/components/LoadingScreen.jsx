import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UiverseLoader from './UiverseLoader';

const LoadingScreen = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 backdrop-blur-xl pointer-events-auto"
        >
          <UiverseLoader />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
