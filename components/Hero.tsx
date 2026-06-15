'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Zap, Target } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, limit, orderBy } from 'firebase/firestore';



if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const iconColor = "var(--primary)";
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const [content, setContent] = useState({
    heroTitle: 'Global Standard Security Services.',
    heroSubtitle: 'Professional, reliable, and rigorously trained security personal for industrial, residential, and corporate clients across Maharashtra.',
    heroTagline: 'सुरक्षेचा शब्द.. विश्वासाचं बंधन.!',
  });
  
  // Sync Content from Firebase
  useEffect(() => {
    const unsubContent = onSnapshot(doc(db, 'site_content', 'main'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setContent(prev => ({
          heroTitle: d.heroTitle || prev.heroTitle,
          heroSubtitle: d.heroSubtitle || prev.heroSubtitle,
          heroTagline: d.heroTagline || prev.heroTagline,
        }));
      }
    }, (err) => {
      console.warn("Hero Content Sync Error:", err);
    });

    return () => unsubContent();
  }, []);


  return (
    <section 
      ref={heroRef}
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '800px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0a0a0a',
        color: 'white'
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f172a 50%, #1a1a2e 100%)',
          zIndex: 0
        }}
      />
      {/* Subtle accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '60%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(var(--primary-rgb, 220,38,38), 0.08) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Main Content Container (No buttons) */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div ref={textRef} style={{ maxWidth: '900px' }}>
          
          <div className="hero-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
             <ShieldCheck color={iconColor} size={26} />
             <span style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 700, 
                color: 'var(--primary)', 
                letterSpacing: '3px', 
                fontSize: '0.85rem', 
                textTransform: 'uppercase' 
             }}>
               Trusted Vanguard
             </span>
          </div>
          
          <h1 className="hero-title" style={{ 
             fontFamily: 'var(--font-heading)', 
             color: 'white',
             fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
             fontWeight: 800,
             lineHeight: 1.05,
             marginBottom: '30px',
             letterSpacing: '-1.5px'
          }}>
            {content.heroTitle}
          </h1>

          <div className="hero-subtitle" style={{
            fontSize: '1.25rem', 
            color: '#e2e2e2', 
            marginBottom: '45px', 
            maxWidth: '700px', 
            fontWeight: 400, 
            lineHeight: '1.7',
            fontFamily: 'var(--font-body)' 
          }}>
             {content.heroSubtitle} <br />
             <span style={{ 
                fontFamily: 'var(--font-body)', 
                color: 'white', 
                fontWeight: 600, 
                fontSize: '2rem', 
                borderLeft: '4px solid var(--primary)', 
                paddingLeft: '24px', 
                display: 'block', 
                marginTop: '30px', 
                letterSpacing: '1px' 
             }}>
                {content.heroTagline}
             </span>
          </div>

        </div>
      </div>

      {/* Structured Features Bar */}
      <div 
        className="features-bar"
        style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          width: '100%', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'white',
          zIndex: 20
        }}
      >
        <div style={{ padding: '35px 40px', borderRight: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '24px' }}>
           <Zap size={32} strokeWidth={1.5} />
           <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Rapid Protection</h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.4 }}>Quick response for any incident instantly.</p>
           </div>
        </div>
        <div style={{ padding: '35px 40px', borderRight: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '24px' }}>
           <Target size={32} strokeWidth={1.5} />
           <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Expert Trained</h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.4 }}>Professionals for all extreme conditions.</p>
           </div>
        </div>
        <div style={{ padding: '35px 40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
           <ShieldCheck size={32} strokeWidth={1.5} />
           <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>24/7 Support</h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.4 }}>Unwavering vigilance, secure systems.</p>
           </div>
        </div>
      </div>

      <style jsx>{`
        .hero-title :global(span) {
          font-family: var(--font-heading);
          font-size: clamp(3.5rem, 6vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -1.5px;
        }
        @media (max-width: 900px) {
          .features-bar { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
