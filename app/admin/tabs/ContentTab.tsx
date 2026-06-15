'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutMission: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  businessName: string;
  statExperience: string;
  statClients: string;
  statStaff: string;
  statProjects: string;
}

const DEFAULTS: SiteContent = {
  heroTitle: 'Trust the Experts in Bhavik Security Services',
  heroSubtitle: 'Professional, reliable, and rigorously trained security personal for industrial, residential, and corporate clients across Maharashtra.',
  heroTagline: 'सुरक्षेचा शब्द.. विश्वासाचं बंधन.!',
  aboutTitle: 'Trusted Security Partner Since 2026',
  aboutDescription: 'Bhavik Security Services has been providing top-tier protection to businesses and residences across Maharashtra.',
  aboutMission: 'Our mission is to deliver professional, reliable, and cost-effective security solutions tailored to each client.',
  phone1: '+91 8855868855',
  phone2: '+91 7744086999',
  email: 'bhavikscrtsrvc@gmail.com',
  address: 'char rasta, boisar Road, Near Anand Ashram School, Palghar (W) 401404',
  businessName: 'Bhavik Security Services',
  statExperience: '5+',
  statClients: '200+',
  statStaff: '100+',
  statProjects: '100+',
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '0.95rem',
  background: '#fafafa',
  marginTop: '6px',
};
const labelStyle = { fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

export default function ContentTab() {
  const [content, setContent] = useState<SiteContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'site_content', 'main')).then(snap => {
      if (snap.exists()) setContent({ ...DEFAULTS, ...snap.data() as Partial<SiteContent> });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_content', 'main'), content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Save failed. Check Firestore rules.'); }
    setSaving(false);
  };

  const set = (key: keyof SiteContent, val: string) => setContent(prev => ({ ...prev, [key]: val }));

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading content...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div><h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '4px' }}>Site Content</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Changes here update your live website immediately.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: saved ? '#059669' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          {saving ? <Loader2 size={16} /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      {/* Hero Section */}
      <Section title="🦸 Hero Section">
        <Field label="Main Heading"><input style={inputStyle} value={content.heroTitle} onChange={e => set('heroTitle', e.target.value)} /></Field>
        <Field label="Subtitle"><textarea style={{ ...inputStyle, resize: 'none', minHeight: '80px' }} value={content.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} /></Field>
        <Field label="Marathi Tagline"><input style={inputStyle} value={content.heroTagline} onChange={e => set('heroTagline', e.target.value)} /></Field>
      </Section>

      {/* About Section */}
      <Section title="📋 About Section">
        <Field label="About Title"><input style={inputStyle} value={content.aboutTitle} onChange={e => set('aboutTitle', e.target.value)} /></Field>
        <Field label="About Description"><textarea style={{ ...inputStyle, resize: 'none', minHeight: '80px' }} value={content.aboutDescription} onChange={e => set('aboutDescription', e.target.value)} /></Field>
        <Field label="Mission Statement"><textarea style={{ ...inputStyle, resize: 'none', minHeight: '80px' }} value={content.aboutMission} onChange={e => set('aboutMission', e.target.value)} /></Field>
      </Section>

      {/* Stats Section */}
      <Section title="📊 Statistics">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Work Experience"><input style={inputStyle} value={content.statExperience} onChange={e => set('statExperience', e.target.value)} /></Field>
          <Field label="Happy Clients"><input style={inputStyle} value={content.statClients} onChange={e => set('statClients', e.target.value)} /></Field>
          <Field label="Professional Staff"><input style={inputStyle} value={content.statStaff} onChange={e => set('statStaff', e.target.value)} /></Field>
          <Field label="Active Projects"><input style={inputStyle} value={content.statProjects} onChange={e => set('statProjects', e.target.value)} /></Field>
        </div>
      </Section>

      {/* Contact Info */}
      <Section title="📞 Contact Information">
        <Field label="Business Name"><input style={inputStyle} value={content.businessName} onChange={e => set('businessName', e.target.value)} /></Field>
        <Field label="Phone 1"><input style={inputStyle} value={content.phone1} onChange={e => set('phone1', e.target.value)} /></Field>
        <Field label="Phone 2"><input style={inputStyle} value={content.phone2} onChange={e => set('phone2', e.target.value)} /></Field>
        <Field label="Email"><input style={inputStyle} type="email" value={content.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Address"><textarea style={{ ...inputStyle, resize: 'none', minHeight: '70px' }} value={content.address} onChange={e => set('address', e.target.value)} /></Field>
      </Section>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem', color: '#0f172a' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
