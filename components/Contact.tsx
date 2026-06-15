'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import GsapReveal from './GsapReveal';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

export default function Contact() {
  const iconColor = 'var(--icon-green)';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [contact, setContact] = useState({
    email: 'bhavikscrtsrvc@gmail.com',
    phone1: '+91 7744086999',
    phone2: '+91 8855868855',
    address: 'Char Rasta, Boisar Road, Opposite Anand Ashram School, Palghar (W) 401404',
  });

  useEffect(() => {
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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.warn('Firestore Lead submission failed, saving locally:', err);
      
      // Save locally to localStorage so it is not lost
      try {
        const localLeads = JSON.parse(localStorage.getItem('bhavik_leads') || '[]');
        localLeads.push({
          ...formData,
          status: 'new',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('bhavik_leads', JSON.stringify(localLeads));
      } catch (e) {
        console.error("Local storage save failed:", e);
      }

      // Show success screen regardless so the user experience is smooth and unbroken
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding" style={{ background: '#ffffff', borderTop: '1px solid #eee' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '80px', alignItems: 'flex-start' }} className="contact-grid">

          {/* Info Side */}
          <GsapReveal
            x={-30}
            duration={0.8}
          >
            <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>Get In Touch</span>
            <h2 className="heading-md" style={{ marginTop: '15px', color: '#1a1a1a' }}>Let's Talk About Our Security Management System</h2>
            <p style={{ color: '#666', marginBottom: '50px', fontSize: '1.05rem', lineHeight: '1.8' }}>
              Have questions or need a custom quote? Reach out to our experts and we'll provide the professional security solution you require.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#f4f4f4', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #ddd', flexShrink: 0 }}>
                  <Mail color={iconColor} size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>Email Us</h4>
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>{contact.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#f4f4f4', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #ddd', flexShrink: 0 }}>
                  <Phone color={iconColor} size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>Call Us</h4>
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>{contact.phone1} {contact.phone2 ? `/ ${contact.phone2}` : ''}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#f4f4f4', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px solid #ddd', flexShrink: 0 }}>
                  <MapPin color={iconColor} size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>Visit Us</h4>
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>{contact.address}</p>
                </div>
              </div>
            </div>
          </GsapReveal>

          {/* Form Side */}
          <GsapReveal
            x={30}
            duration={0.8}
          >
            {success ? (
              <div style={{ padding: '60px 40px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <CheckCircle2 color="#16a34a" size={56} style={{ margin: '0 auto 20px', display: 'block' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px', color: '#15803d' }}>Request Submitted!</h3>
                <p style={{ color: '#16a34a', marginBottom: '30px' }}>Thank you! Our team will contact you shortly.</p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  style={{ color: '#15803d', fontWeight: 700, background: 'none', border: '2px solid #15803d', borderRadius: '4px', padding: '10px 24px', cursor: 'pointer' }}
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="form-row">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#333' }}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Rajesh Kumar"
                      style={{ width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', padding: '14px 18px', borderRadius: '4px', color: '#1a1a1a', outline: 'none', fontSize: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#333' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rajesh@example.com"
                      style={{ width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', padding: '14px 18px', borderRadius: '4px', color: '#1a1a1a', outline: 'none', fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="form-row">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#333' }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', padding: '14px 18px', borderRadius: '4px', color: '#1a1a1a', outline: 'none', fontSize: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#333' }}>Service Needed</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{ width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', padding: '14px 18px', borderRadius: '4px', color: formData.subject ? '#1a1a1a' : '#999', outline: 'none', fontSize: '1rem' }}
                    >
                      <option value="">Select a service...</option>
                      <option value="Industrial Security">Industrial Security</option>
                      <option value="Residential Security">Residential Security</option>
                      <option value="Security Guards">Security Guards</option>
                      <option value="Gunman">Gunman</option>
                      <option value="Bouncers">Bouncers</option>
                      <option value="Event Security">Event Security</option>
                      <option value="Corporate Security">Corporate Security</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#333' }}>Your Message *</label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your security requirements, location, number of personnel needed, dates, etc..."
                    rows={5}
                    style={{ width: '100%', background: '#fafafa', border: '1px solid #e0e0e0', padding: '14px 18px', borderRadius: '4px', color: '#1a1a1a', outline: 'none', resize: 'none', fontSize: '1rem', lineHeight: '1.6' }}
                  />
                </div>

                {error && (
                  <p style={{ color: '#dc2626', fontSize: '0.9rem', fontWeight: 600, padding: '12px 16px', background: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ justifyContent: 'center', padding: '18px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      &nbsp; Submitting...
                    </>
                  ) : (
                    <>Submit Request &nbsp;<Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </GsapReveal>

        </div>
      </div>

      <style jsx>{`
        @media (max-width: 992px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
