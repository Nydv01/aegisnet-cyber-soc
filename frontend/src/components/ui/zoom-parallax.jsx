import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

export function ZoomParallax({ images }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} className="relative h-[300vh] w-full bg-black">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {images.map(({ src, alt }, index) => {
          const scale = scales[index % scales.length];

          // Use Tailwind style position offsets converted into absolute percentages
          let offsetClasses = "absolute flex items-center justify-center ";
          if (index === 0) {
            offsetClasses += "w-[25vw] h-[25vh] z-[10]";
          } else if (index === 1) {
            offsetClasses += "-top-[30vh] left-[5vw] h-[30vh] w-[35vw]";
          } else if (index === 2) {
            offsetClasses += "-top-[10vh] -left-[25vw] h-[45vh] w-[20vw]";
          } else if (index === 3) {
            offsetClasses += "left-[27.5vw] h-[25vh] w-[25vw]";
          } else if (index === 4) {
            offsetClasses += "top-[27.5vh] left-[5vw] h-[25vh] w-[20vw]";
          } else if (index === 5) {
            offsetClasses += "top-[27.5vh] -left-[22.5vw] h-[25vh] w-[30vw]";
          } else if (index === 6) {
            offsetClasses += "top-[22.5vh] left-[25vw] h-[15vh] w-[15vw]";
          }

          return (
            <motion.div
              key={index}
              style={{ scale }}
              className={`${offsetClasses}`}
            >
              <div className="relative w-full h-full border border-cyan-500/20 rounded-md overflow-hidden bg-slate-950/80 backdrop-blur-sm shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                <img
                  src={src || '/placeholder.svg'}
                  alt={alt || `Parallax image ${index + 1}`}
                  className="h-full w-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
