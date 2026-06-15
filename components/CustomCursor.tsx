'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Immediate move for small point
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: 'power3.out'
      });

      // Lagging move for larger ring
      gsap.to(follower, {
        x: mouseX,
        y: mouseY,
        duration: 0.4,
        ease: 'power3.out'
      });
    };

    const handleHoverStart = () => {
      gsap.to(follower, { scale: 1.8, backgroundColor: 'rgba(30, 41, 59, 0.1)', duration: 0.3 });
      gsap.to(cursor, { scale: 1.5, backgroundColor: '#1e293b', duration: 0.2 });
    };

    const handleHoverEnd = () => {
      gsap.to(follower, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
      gsap.to(cursor, { scale: 1, backgroundColor: 'white', duration: 0.2 });
    };

    window.addEventListener('mousemove', moveCursor);

    // Dynamic hover detection
    const interactables = document.querySelectorAll('button, a, .interactive');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        style={{
          position: 'fixed',
          top: -3,
          left: -3,
          width: '6px',
          height: '6px',
          backgroundColor: 'white',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}
      />
      <div 
        ref={followerRef} 
        style={{
          position: 'fixed',
          top: -15,
          left: -15,
          width: '30px',
          height: '30px',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          mixBlendMode: 'difference'
        }}
      />
    </>
  );
}
