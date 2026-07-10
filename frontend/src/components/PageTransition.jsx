import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageTransition — Cinematic page transition with clip-path wipe,
 * blur/scale morphing, and staggered content reveal.
 * 
 * Uses framer-motion AnimatePresence for smooth enter/exit orchestration.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="page-transition-container"
        style={{ minHeight: '60vh', willChange: 'opacity, transform, filter, clip-path' }}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {/* Cinematic wipe overlay */}
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), #050505)',
          }}
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(0% at 50% 50%)' }}
          exit={{
            clipPath: [
              'circle(0% at 50% 50%)',
              'circle(75% at 50% 50%)',
              'circle(150% at 50% 50%)',
            ],
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        {/* Scan line sweep during transition */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            boxShadow: '0 0 20px rgba(255,255,255,0.2)',
          }}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '100vh', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.8,
            delay: 0.1,
            ease: 'linear',
          }}
        />

        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    filter: 'blur(6px)',
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
