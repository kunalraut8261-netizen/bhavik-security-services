'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, limit, getDocs, onSnapshot, orderBy } from 'firebase/firestore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch & Sync Logo from Gallery (Real-time)
    const logoQuery = query(
      collection(db, 'gallery'),
      where('type', '==', 'logo'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubLogo = onSnapshot(logoQuery, (snap) => {
      if (!snap.empty) {
        setLogoUrl(snap.docs[0].data().imageUrl);
      }
    }, (err) => {
      console.error("Logo Sync Error:", err);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubLogo();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Process', href: '#process' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          background: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.05)' : 'none',
          height: '90px',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          borderBottom: '1px solid #eee',
          padding: '0 4vw' /* dynamic wide padding */
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
            <div style={{ height: '70px', width: 'auto', display: 'flex', alignItems: 'center' }}>
              <img src="/bhaviksecurityLogo.png" alt="Bhavik Security" style={{ maxHeight: '100%', height: 'auto', width: 'auto', objectFit: 'contain' }} />
            </div>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'flex', gap: '50px', alignItems: 'center' }} className="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.3s', textDecoration: 'none' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = '#1a1a1a'}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Toggle */}
          <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', cursor: 'pointer', color: '#1a1a1a' }}>
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '90px',
            left: 0,
            width: '100%',
            background: '#ffffff',
            zIndex: 999,
            padding: '40px 20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderBottom: '1px solid #eee',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 1400px) {
          .desktop-nav { gap: 30px !important; }
        }
        @media (max-width: 1100px) {
          .desktop-nav { gap: 20px !important; }
        }
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
