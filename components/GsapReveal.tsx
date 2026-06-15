'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GsapRevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
  onMouseOut?: React.MouseEventHandler<HTMLDivElement>;
}

export default function GsapReveal({
  children,
  delay = 0,
  y = 30,
  x = 0,
  duration = 0.8,
  className = '',
  style,
  onMouseOver,
  onMouseOut
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y, x },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, ref); // scope to this component

    return () => ctx.revert(); // Proper cleanup!
  }, [y, x, duration, delay]);

  return (
    <div ref={ref} className={className} style={{...style, visibility: 'hidden'}} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {children}
    </div>
  );
}
