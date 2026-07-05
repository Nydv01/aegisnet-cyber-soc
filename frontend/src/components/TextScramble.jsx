import React, { useEffect, useState, useRef } from 'react';

/**
 * TextScramble scrambles text with specialized glyphs and slowly
 * resolves to the target string. Emulates professional hacker decryption terminals.
 */
export default function TextScramble({
  children,
  speed = 40,
  delay = 0,
  scrambleChars = '!@#$%^&*()_+~}{[]:;?><,./-',
  className = '',
  triggerOnHover = false,
}) {
  const text = typeof children === 'string' ? children : String(children || '');
  const [displayText, setDisplayText] = useState(text);
  const animationRef = useRef(null);
  const frameRef = useRef(0);
  const resolveQueueRef = useRef([]);

  const startAnimation = () => {
    // Cancel existing
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    resolveQueueRef.current = text.split('').map((char, index) => ({
      from: displayText[index] || '',
      to: char,
      start: Math.floor(Math.random() * 10) + index * 2,
      end: Math.floor(Math.random() * 20) + index * 2 + 10,
    }));

    frameRef.current = 0;
    
    const tick = () => {
      let complete = true;
      let output = '';

      for (let i = 0; i < resolveQueueRef.current.length; i++) {
        const { from, to, start, end } = resolveQueueRef.current[i];
        
        if (frameRef.current >= end) {
          output += to;
        } else if (frameRef.current >= start) {
          complete = false;
          // Return a random symbol
          if (Math.random() < 0.28) {
            output += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          } else {
            output += from || scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }
        } else {
          complete = false;
          output += from || ' ';
        }
      }

      setDisplayText(output);

      if (!complete) {
        frameRef.current += 1;
        // Control speed via throttling frame ticks
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(tick);
        }, speed);
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay);
      return () => clearTimeout(timer);
    } else {
      startAnimation();
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [text]);

  const handleMouseEnter = () => {
    if (triggerOnHover) startAnimation();
  };

  return (
    <span className={className} onMouseEnter={handleMouseEnter}>
      {displayText}
    </span>
  );
}
