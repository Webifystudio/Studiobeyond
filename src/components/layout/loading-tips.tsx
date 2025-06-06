
"use client";

import { useState, useEffect, type ReactNode } from 'react';

interface LoadingTipsProps {
  tips: string[];
  interval?: number;
  className?: string;
}

export function LoadingTips({ tips, interval = 4500, className }: LoadingTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayedTip, setDisplayedTip] = useState<ReactNode | string>(tips[0] || '');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!tips || tips.length === 0) return;

    // Initialize with a random tip
    const randomIndex = Math.floor(Math.random() * tips.length);
    setCurrentTipIndex(randomIndex);
    setDisplayedTip(tips[randomIndex]);

    const timer = setInterval(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => {
          let nextIndex = (prevIndex + 1) % tips.length;
          // Ensure next tip is different if possible (simple approach)
          if (tips.length > 1 && nextIndex === prevIndex) {
            nextIndex = (nextIndex + 1) % tips.length;
          }
          setDisplayedTip(tips[nextIndex]);
          setIsFadingOut(false);
          return nextIndex;
        });
      }, 500); // Fade-out duration
    }, interval);

    return () => clearInterval(timer);
  }, [tips, interval]);

  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <p 
      className={`text-sm text-neutral-extralight/80 text-center transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`}
    >
      {displayedTip}
    </p>
  );
}
