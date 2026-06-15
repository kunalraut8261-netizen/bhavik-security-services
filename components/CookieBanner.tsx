'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('cookie-consent')) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '600px',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '20px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      zIndex: 9999,
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
      color: '#fff',
    }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '1.5rem', background: 'rgba(220, 38, 38, 0.1)', padding: '10px', borderRadius: '12px' }}>🍪</div>
        <div>
          <h4 style={{ margin: '0 0 5px', fontWeight: 800 }}>Cookie Policy</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            We use cookies to enhance your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies as described in our <Link href="/privacy-policy" style={{ color: '#ef4444', textDecoration: 'none', borderBottom: '1px solid' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button 
          onClick={acceptCookies}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: '0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
