import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DNALoader from './DNALoader';

const LoadingScreen = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/20 backdrop-blur-xl pointer-events-auto"
        >
          <DNALoader />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;

