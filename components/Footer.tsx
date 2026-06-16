'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Share2, Globe, Shield, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [contact, setContact] = useState({
    email: 'bhavikscrtsrvc@gmail.com',
    phone1: '+91 7744086999',
    phone2: '',
    address: 'Char Rasta , Boisar Road, Opposite Anand Ashram School, Palghar (W) 401404',
  });

  useEffect(() => {
    // Fetch Logo
    const logoQuery = query(collection(db, 'gallery'), where('type', '==', 'logo'), limit(1));
    getDocs(logoQuery).then(snap => {
      if (!snap.empty) setLogoUrl(snap.docs[0].data().imageUrl);
    }).catch(() => { });

    // Fetch Contact Info
    getDoc(doc(db, 'site_content', 'main')).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setContact({
          email: d.email || contact.email,
          phone1: d.phone1 || contact.phone1,
          phone2: d.phone2 || contact.phone2,
          address: d.address || contact.address,
        });
      }
    }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <footer style={{ background: '#111111', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '100px 0 40px', color: '#ffffff' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: '60px', marginBottom: '80px' }} className="footer-grid">

          {/* Logo & Info */}
          <div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ height: '85px', width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <img src={logoUrl || "/bhaviksecurityLogo.png"} alt="Bhavik Security" style={{ maxHeight: '100%', height: 'auto', width: 'auto', objectFit: 'contain' }} />
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.6rem', color: '#ffffff', letterSpacing: '1px' }}>BHAVIK</span>
              </div>
            </div>
            <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1rem', lineHeight: '1.8' }}>
              Your safety is our priority. Since 2026, Bhavik Security Services has been the leading choice for professional security solutions across the region.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[Share2, Globe, Shield].map((Icon, idx) => (
                <div
                  key={idx}
                  style={{
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.3s',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseOver={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <Icon size={18} color="white" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Links</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0 }}>
              {['Home', 'About Us', 'Services', 'Gallery', 'Testimonials', 'FAQ', 'Contact', 'Admin'].map((link) => (
                <li key={link}>
                  <a href={link === 'Admin' ? '/admin' : (link === 'Home' ? '#' : `#${link.toLowerCase().replace(' ', '')}`)} style={{ color: '#aaa', fontSize: '0.95rem', transition: '0.3s', textDecoration: 'none' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#aaa'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Services</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', listStyle: 'none', padding: 0 }}>
              {['Industrial Security', 'Security Guards', 'Gunman', 'Bouncers', 'Event Security'].map((service) => (
                <li key={service}>
                  <a href="#services" style={{ color: '#aaa', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <ChevronRight size={14} color="var(--primary)" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contacts */}
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>{contact.address}</p>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Phone size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>{contact.phone1} {contact.phone2 ? `/ ${contact.phone2}` : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Mail size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>{contact.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '40px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>
            &copy; {currentYear} Bhavik Security Services. All Rights Reserved. <br />
            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Industrial Security | Security Guards | Gunman | Bouncers | Event Security</span>
          </p>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <Link href="/privacy-policy" style={{ color: '#555', fontSize: '0.8rem', textDecoration: 'none', transition: '0.3s' }}
              onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'}
              onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}
            >
              Privacy Policy
            </Link>
            <span style={{ color: '#333' }}>|</span>
            <Link href="/#contact" style={{ color: '#555', fontSize: '0.8rem', textDecoration: 'none', transition: '0.3s' }}
              onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'}
              onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 992px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
