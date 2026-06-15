'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import GsapReveal from './GsapReveal';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

export default function About() {
  const iconColor = "var(--icon-green)";
  const [content, setContent] = useState({
    aboutTitle: 'Trusted Security Partner Since 2010',
    aboutDescription: 'Bhavik Security Services has been providing top-tier protection to businesses and residences across Palghar and Boisar for over a decade.',
    aboutMission: 'Our mission is to deliver professional, reliable, and cost-effective security solutions tailored to each client.',
  });

  useEffect(() => {
    // Get Text Content
    getDoc(doc(db, 'site_content', 'main')).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setContent(prev => ({
          aboutTitle: d.aboutTitle || prev.aboutTitle,
          aboutDescription: d.aboutDescription || prev.aboutDescription,
          aboutMission: d.aboutMission || prev.aboutMission,
        }));
      }
    }).catch(() => {});
  }, []);

  return (
    <section id="about" className="section-padding" style={{ background: '#ffffff', borderTop: '1px solid #eee' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Text Section */}
          <GsapReveal
            x={0}
            duration={0.8}
          >
            <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>About Our Agency</span>
            <h2 className="heading-md" style={{ marginTop: '15px', color: '#1a1a1a', marginBottom: '30px' }}>
              {content.aboutTitle}
            </h2>
            <p style={{ color: '#666', marginBottom: '25px', fontSize: '1.1rem', lineHeight: '1.8' }}>
              {content.aboutDescription}
            </p>
            <p style={{ color: '#666', marginBottom: '45px', fontSize: '1.1rem', lineHeight: '1.8', fontStyle: 'italic', borderLeft: '4px solid var(--primary)', paddingLeft: '20px', display: 'inline-block', textAlign: 'left' }}>
              {content.aboutMission}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '45px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <CheckCircle2 color={iconColor} size={20} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Reliable Support</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <CheckCircle2 color={iconColor} size={20} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Advanced Training</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <CheckCircle2 color={iconColor} size={20} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Quick Response</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <CheckCircle2 color={iconColor} size={20} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Professional Guarding</span>
              </div>
            </div>

            <button className="btn-primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact Us Today</button>
          </GsapReveal>
        </div>
      </div>
    </section>
  );
}
