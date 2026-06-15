'use client';

import React, { useRef } from 'react';
import { GooeyText } from '@/components/ui/gooey-text-morphing';

export default function GooeySplash() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={ref}
      style={{
        height: '100vh',
        minHeight: '600px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      {/* Minimal subtle grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        zIndex: 0,
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #dc2626, transparent)',
        zIndex: 1,
      }} />

      {/* Foreground Content */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1200px',
          textAlign: 'center',
          padding: '0 20px'
        }}
      >
        {/* Logo */}
        <div 
          style={{ 
            marginBottom: '60px',
            animation: 'fadeInOut 2s ease-in-out forwards',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        >
        <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <img
            src="/bhaviksecurityLogo.png"
            alt="Bhavik Security Service"
            style={{ maxHeight: '100%', maxWidth: '80vw', height: 'auto', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>
        </div>

        {/* Gooey morphing text - The core animation */}
        <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GooeyText
            texts={["Secure", "With", "Bhavik", "Security", "Service"]}
            morphTime={1.2}
            cooldownTime={1.0}
            className="w-full h-full"
            textClassName="text-heading"
          />
        </div>

        {/* Bottom Tagline */}
        <div 
          style={{ 
            marginTop: '50px',
            opacity: 0.8,
            animation: 'slideUpFade 1.5s ease-out 0.5s both'
          }}
        >
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.2rem',
            color: '#666',
            letterSpacing: '4px',
            fontWeight: 500
          }}>
            सुरक्षेचा शब्द.. विश्वासाचं बंधन.!
          </p>
        </div>
      </div>

      <style jsx>{`
        div :global(span) {
          font-family: var(--font-heading);
          font-size: clamp(3.5rem, 8vw, 7.5rem);
          font-weight: 900;
          letter-spacing: -3px;
          color: #1a1a1a;
          line-height: 1;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
