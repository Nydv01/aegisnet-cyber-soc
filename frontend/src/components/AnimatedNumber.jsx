import React, { useEffect, useState } from 'react';

/**
 * AnimatedNumber component smoothly transition counts from the previous value
 * to the new target value to mimic elite dashboard ticker feeds.
 */
export default function AnimatedNumber({ value, duration = 500, formatter = (v) => Math.round(v) }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();

    const updateNumber = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easedProgress = progress * (2 - progress);
      const current = start + (end - start) * easedProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration]);

  return <>{formatter(displayValue)}</>;
}
