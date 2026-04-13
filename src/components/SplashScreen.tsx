import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Allow exit animation to complete
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-animated-gradient overflow-hidden"
        >
          {/* Breathing background circles */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"
          />
          
          <div className="relative flex w-full max-w-2xl flex-col items-center px-6 text-center sm:px-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: 1 
              }}
              transition={{
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: { duration: 0.8 }
              }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 sm:mb-8"
            >
              <img src="images/yogshala-logo.png" alt="YOGSHALA Logo" />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-white text-3xl sm:text-4xl font-bold tracking-tight mb-2"
            >
              YOGSHALA
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/80 text-base sm:text-lg font-medium"
            >
              The Synergy of Svasa, Mantra, and Asana Precision
            </motion.p>
          </div>
          
          {/* Loading indicator */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute bottom-16 sm:bottom-20 h-1 w-[min(200px,60vw)] bg-white/30 rounded-full overflow-hidden"
          >
            <motion.div className="h-full bg-white w-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
