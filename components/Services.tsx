'use client';
import React, { useState, useEffect } from 'react';
import GsapReveal from './GsapReveal';
import { Shield, Users, Zap, Calendar, Briefcase, Eye, Lock, Star, Building, AlertTriangle, Award, CheckCircle, Clock, Globe, Heart, Key } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const ICON_MAP: Record<string, React.ReactNode> = {
  Shield: <Shield size={30} />, Users: <Users size={30} />, Zap: <Zap size={30} />,
  Calendar: <Calendar size={30} />, Briefcase: <Briefcase size={30} />, Eye: <Eye size={30} />,
  Lock: <Lock size={30} />, Star: <Star size={30} />, Building: <Building size={30} />,
  AlertTriangle: <AlertTriangle size={30} />, Award: <Award size={30} />, CheckCircle: <CheckCircle size={30} />,
  Clock: <Clock size={30} />, Globe: <Globe size={30} />, Heart: <Heart size={30} />, Key: <Key size={30} />,
};

const DEFAULTS = [
  { title: 'Industrial Security', desc: 'Trained guards for factories, warehouses and industrial complexes.', icon: 'Shield' },
  { title: 'Security Guards', desc: 'Professional uniformed guards for residential and commercial premises.', icon: 'Users' },
  { title: 'Gunman', desc: 'Licensed armed security personnel for high-value protection.', icon: 'Zap' },
  { title: 'Bouncers', desc: 'Experienced crowd control personnel for clubs, pubs, and venues.', icon: 'Briefcase' },
  { title: 'Event Security Services', desc: 'Complete security planning and personnel for corporate gatherings and public events.', icon: 'Calendar' },
  { title: 'Corporate Security', desc: 'Professional security solutions for corporate offices and campuses.', icon: 'Building' },
];

export default function Services() {
  const iconColor = 'var(--icon-green)';
  const [services, setServices] = useState<{ title: string; desc: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'services'), orderBy('order', 'asc')))
      .then(snap => {
        if (snap.empty) { setServices(DEFAULTS); }
        else { setServices(snap.docs.map(d => ({ title: d.data().title, desc: d.data().description, icon: d.data().icon || 'Shield' }))); }
      })
      .catch(() => setServices(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const list = loading ? DEFAULTS : services;

  return (
    <section id="services" className="section-padding" style={{ background: '#0a0a0a', color: '#fff' }}>
      <div className="container">
        <GsapReveal y={30} duration={0.8} style={{ marginBottom: '70px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>What We Offer</span>
          <h2 className="heading-md" style={{ color: 'white', marginTop: '15px' }}>Our Security Services</h2>
          <p style={{ color: '#aaa', fontSize: '1.1rem', maxWidth: '550px', lineHeight: '1.7' }}>
            Professional security solutions tailored to your specific needs across Maharashtra.
          </p>
        </GsapReveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2px' }}>
          {list.map((svc, idx) => (
            <GsapReveal key={idx} y={20} duration={0.5} delay={idx * 0.08}
              style={{ padding: '50px 40px', borderTop: '1px solid #222', borderRight: idx % 3 !== 2 ? '1px solid #222' : 'none', cursor: 'default' }}
              onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = '#111'; }}
              onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ marginBottom: '25px', color: iconColor }}>{ICON_MAP[svc.icon] || <Shield size={30} />}</div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 700, marginBottom: '15px' }}>{svc.title}</h3>
              <p style={{ color: '#888', lineHeight: '1.7', fontSize: '0.95rem' }}>{svc.desc}</p>
            </GsapReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
