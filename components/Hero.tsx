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
      className="hero-section"
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '800px',
        display: 'flex',
        alignItems: 'stretch',
        paddingBottom: '114px',
        overflow: 'hidden',
        background: '#0a0a0a',
        color: 'white',
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
      {/* Subtle accent glow — centre right */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '55%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(30,41,59,0.18) 0%, transparent 65%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      {/* Right-edge vignette — blends guard PNG into the dark background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '55%',
          height: '100%',
          background: 'linear-gradient(to left, rgba(10,10,10,0.0) 0%, transparent 100%)',
          zIndex: 3,
          pointerEvents: 'none'
        }}
      />

      {/* Main Content Container (No buttons) */}
      <div className="container hero-container" style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center' }}>
        <div className="hero-content-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={textRef} className="hero-text-col">
            
            <div className="hero-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
               <ShieldCheck color="#94a3b8" size={22} strokeWidth={1.5} />
               <span style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontWeight: 700, 
                  color: '#94a3b8', 
                  letterSpacing: '3px', 
                  fontSize: '0.8rem', 
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
              fontSize: '1.15rem', 
              color: '#c8d0dc', 
              marginBottom: '45px', 
              maxWidth: '560px', 
              fontWeight: 400, 
              lineHeight: '1.75',
              fontFamily: 'var(--font-body)' 
            }}>
               {content.heroSubtitle} <br />
               <span style={{ 
                  fontFamily: 'var(--font-body)', 
                  color: 'white', 
                  fontWeight: 600, 
                  fontSize: '1.7rem', 
                  borderLeft: '4px solid #94a3b8', 
                  paddingLeft: '20px', 
                  display: 'block', 
                  marginTop: '28px', 
                  letterSpacing: '0.5px',
                  lineHeight: 1.4
               }}>
                  {content.heroTagline}
               </span>
            </div>

          </div>

          <div className="hero-image-col">
            <img 
              src="/hero-guard.png" 
              alt="Bhavik Security Guard" 
              className="hero-image"
            />
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

    </section>
  );
}
