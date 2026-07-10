import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS ENGINE — World-Class Scroll-Driven Effects
   ═══════════════════════════════════════════════════════════════════ */

// ── 1. ScrollFadeIn — Fade + rise with spring physics ──────────────
export function ScrollFadeIn({
  children,
  delay = 0,
  duration = 0.8,
  y = 60,
  once = true,
  className = '',
  blur = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: blur ? 'blur(10px)' : 'blur(0px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── 2. ScrollSlideIn — Slide from any direction ────────────────────
export function ScrollSlideIn({
  children,
  direction = 'left', // 'left' | 'right' | 'bottom' | 'top'
  delay = 0,
  duration = 0.9,
  distance = 100,
  once = true,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-60px' });

  const offsets = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    bottom: { x: 0, y: distance },
    top: { x: 0, y: -distance },
  };

  const { x, y } = offsets[direction] || offsets.left;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── 3. ScrollScale — Zoom + blur reveal ────────────────────────────
export function ScrollScale({
  children,
  delay = 0,
  duration = 0.9,
  once = true,
  className = '',
  scale: initialScale = 0.8,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: initialScale, filter: 'blur(12px)' }}
      animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── 4. ScrollRotateIn — 3D perspective rotate reveal ───────────────
export function ScrollRotateIn({
  children,
  delay = 0,
  duration = 1,
  once = true,
  className = '',
  rotateX = 15,
  rotateY = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      style={{ perspective: 1200 }}
      className={className}
    >
      <motion.div
        initial={{
          opacity: 0,
          rotateX,
          rotateY,
          y: 40,
          filter: 'blur(6px)',
        }}
        animate={
          isInView
            ? { opacity: 1, rotateX: 0, rotateY: 0, y: 0, filter: 'blur(0px)' }
            : {}
        }
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── 5. TextRevealByWord — Word-by-word scroll reveal ───────────────
export function TextRevealByWord({
  text,
  className = '',
  wordClassName = '',
  containerRef: externalContainerRef,
}) {
  const internalRef = useRef(null);
  const containerRef = externalContainerRef || internalRef;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'start 0.25'],
  });

  const words = text.split(' ');

  return (
    <div ref={externalContainerRef ? undefined : internalRef} className={className}>
      <p className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-[0.15em]">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]} className={wordClassName}>
              {word}
            </Word>
          );
        })}
      </p>
    </div>
  );
}

function Word({ children, progress, range, className }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [8, 0]);
  const blur = useTransform(progress, range, [4, 0]);
  const blurFilter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.span
      style={{ opacity, y, filter: blurFilter }}
      className={`inline-block transition-colors ${className}`}
    >
      {children}
    </motion.span>
  );
}

// ── 6. ParallaxLayer — Individual parallax element ─────────────────
export function ParallaxLayer({
  children,
  speed = 0.5, // 0 = no movement, 1 = full scroll speed, negative = opposite
  className = '',
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// ── 7. StaggerContainer + StaggerItem — Cascade reveal ─────────────
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  once = true,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up', // 'up' | 'left' | 'right' | 'scale'
}) {
  const variants = {
    up: {
      hidden: { opacity: 0, y: 50, filter: 'blur(8px)' },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      },
    },
    left: {
      hidden: { opacity: 0, x: -60, filter: 'blur(6px)' },
      visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      },
    },
    right: {
      hidden: { opacity: 0, x: 60, filter: 'blur(6px)' },
      visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
      visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
      },
    },
  };

  return (
    <motion.div variants={variants[direction] || variants.up} className={className}>
      {children}
    </motion.div>
  );
}

// ── 8. MagneticElement — Follows cursor with spring ────────────────
export function MagneticElement({
  children,
  strength = 0.3,
  className = '',
  as = 'div',
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

// ── 9. ScrollProgress — Top progress bar ───────────────────────────
export function ScrollProgress({ color = '#ffffff', height = 3 }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9999] origin-left"
      style={{
        scaleX,
        height,
        background: `linear-gradient(90deg, ${color}22, ${color})`,
        boxShadow: `0 0 10px ${color}40, 0 0 20px ${color}20`,
      }}
    />
  );
}

// ── 10. PerspectiveCard — 3D tilt on hover ─────────────────────────
export function PerspectiveCard({
  children,
  className = '',
  intensity = 15,
  glare = true,
}) {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateX.set((py - 0.5) * -intensity);
      rotateY.set((px - 0.5) * intensity);
      glareX.set(px * 100);
      glareY.set(py * 100);
    },
    [intensity, rotateX, rotateY, glareX, glareY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.08), transparent 60%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full"
      >
        {children}
        {glare && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[inherit] z-10"
            style={{ background: glareBackground }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// ── 11. SVGPathDraw — Animate SVG stroke on scroll ─────────────────
export function SVGPathDraw({
  d,
  className = '',
  stroke = '#ffffff',
  strokeWidth = 2,
  duration = 1.5,
  delay = 0,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.path
      ref={ref}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    />
  );
}

// ── 12. FlipCard — 3D flip transition for cards ────────────────────
export function FlipCard({ front, back, isFlipped, className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ perspective: 1200 }}>
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {front}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {back}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 13. RippleButton — Click ripple effect wrapper ─────────────────
export function RippleButton({ children, className = '', onClick, ...props }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
    onClick?.(e);
  };

  return (
    <button className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-[rippleExpand_0.8s_ease-out_forwards] pointer-events-none"
          style={{
            left: ripple.x - 5,
            top: ripple.y - 5,
            width: 10,
            height: 10,
            background: 'rgba(255, 255, 255, 0.3)',
          }}
        />
      ))}
    </button>
  );
}

// ── 14. GlitchFlicker — Quick RGB split flicker ────────────────────
export function GlitchFlicker({ children, className = '', active = false }) {
  return (
    <span className={`relative inline-block ${active ? 'glitch-flicker-active' : ''} ${className}`}>
      {children}
    </span>
  );
}

// ── 15. AnimatedCounter — Spring-based counting ────────────────────
export function AnimatedCounter({ value, duration = 2, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
    </span>
  );
}

// ── 16. ScrollVelocityText — Speed-based text effect ───────────────
export function ScrollVelocityText({
  children,
  className = '',
  baseVelocity = 5,
}) {
  const { scrollY } = useScroll();
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    let prev = scrollY.get();
    const unsubscribe = scrollY.on('change', (latest) => {
      const diff = Math.abs(latest - prev);
      setVelocity(Math.min(diff / 10, 1));
      prev = latest;
    });
    return unsubscribe;
  }, [scrollY]);

  const skewX = useSpring(velocity * baseVelocity, { stiffness: 300, damping: 30 });

  return (
    <motion.div style={{ skewX }} className={className}>
      {children}
    </motion.div>
  );
}

// ── 17. BorderTraceCard — Animated border that traces on hover ─────
export function BorderTraceCard({ children, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border trace */}
      <div
        className={`absolute inset-0 rounded-[inherit] pointer-events-none z-10 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute inset-[-2px] rounded-[inherit]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.4) 10%, transparent 20%)`,
            animation: isHovered ? 'borderTrace 3s linear infinite' : 'none',
          }}
        />
        <div className="absolute inset-[1px] rounded-[inherit] bg-zinc-950/95" />
      </div>
      <div className="relative z-20">{children}</div>
    </div>
  );
}
