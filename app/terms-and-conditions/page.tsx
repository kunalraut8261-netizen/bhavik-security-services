'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: [
        'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.',
        'If you do not agree to abide by the above, please do not use this service.',
        'Any participation in this service will constitute acceptance of this agreement.',
      ],
    },
    {
      title: '2. Provision of Services',
      content: [
        'Bhavik Security Services provides security personnel, surveillance, and consulting services as described on this website.',
        'The scope of work for specific services will be governed by individual service agreements signed between Bhavik Security Services and the client.',
        'We reserve the right to modify or discontinue any part of our service without prior notice.',
      ],
    },
    {
      title: '3. User Obligations',
      content: [
        'Users agree to provide accurate, current, and complete information when using our contact or inquiry forms.',
        'Users shall not use this website for any fraudulent or illegal activities.',
        'Any attempt to interfere with the operation of this website or the security system will result in legal action.',
      ],
    },
    {
      title: '4. Intellectual Property',
      content: [
        'All content, including logos, images, text, and 3D animations on this website, is the property of Bhavik Security Services.',
        'No part of this website may be reproduced, copied, or used for commercial purposes without our written consent.',
      ],
    },
    {
      title: '5. Limitation of Liability',
      content: [
        'Bhavik Security Services shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of this website.',
        'While we strive for 100% security, the effectiveness of security services depends on various factors including environment and client cooperation.',
      ],
    },
    {
      title: '6. Payment & Billing',
      content: [
        'Payment terms for security services are outlined in the specific service contract.',
        'Late payments may result in suspension of services at the discretion of management.',
        'All taxes and duties as applicable by Indian Law shall be paid by the client.',
      ],
    },
    {
      title: '7. Governing Law',
      content: [
        'These terms shall be governed by and construed in accordance with the laws of India.',
        'Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Palghar/Mumbai.',
      ],
    },
    {
      title: '8. Contact Information',
      content: [
        'For any questions regarding these terms, please contact us:',
        'Bhavik Security Services',
        'Char Rasta, Boisar Road, Near Anand Ashram School, Palghar (W) 401404',
        'Email: bhavikscrtsrvc@gmail.com',
        'Phone: +91 8855868855',
      ],
    },
  ];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(10,10,10,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ height: '70px', width: 'auto', display: 'flex', alignItems: 'center' }}>
            <img src="/bhaviksecurityLogo.png" alt="Bhavik Security" style={{ maxHeight: '100%', height: 'auto', width: 'auto', objectFit: 'contain' }} />
          </div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', textDecoration: 'none', fontSize: '0.9rem', transition: '0.3s' }}
            onMouseOver={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'white'}
            onMouseOut={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#aaa'}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '100px', padding: '6px 18px', marginBottom: '24px'
          }}>
            <span style={{ fontSize: '0.85rem' }}>📄</span>
            <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Legal</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1px' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: '#888', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            Please read these terms carefully before using our services or website.
          </p>
          <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '24px' }}>
            Effective Date: <strong style={{ color: '#888' }}>1 April 2025</strong> &nbsp;|&nbsp; Last Updated: <strong style={{ color: '#888' }}>20 April 2026</strong>
          </p>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Intro */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', padding: '32px', marginBottom: '48px'
        }}>
          <p style={{ color: '#ccc', lineHeight: 1.8, margin: 0, fontSize: '1rem' }}>
            These Terms and Conditions govern your use of the Bhavik Security Services website and the services we offer. 
            By accessing this website, we assume you accept these terms and conditions in full. 
            Do not continue to use Bhavik Security Services&apos; website if you do not accept all of the terms and conditions stated on this page.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {sections.map((section, idx) => (
            <div key={idx} style={{
              borderLeft: '3px solid var(--primary, #dc2626)',
              paddingLeft: '28px',
            }}>
              <h2 style={{
                fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#fff',
                letterSpacing: '0.3px',
              }}>
                {section.title}
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0, listStyle: 'none' }}>
                {section.content.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--primary, #dc2626)', marginTop: '6px', flexShrink: 0, fontSize: '0.5rem' }}>●</span>
                    <span style={{ color: '#aaa', lineHeight: 1.7, fontSize: '0.97rem' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: '64px', padding: '32px', background: 'rgba(220,38,38,0.05)',
          border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{ height: '80px', width: 'auto', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <img src="/bhaviksecurityLogo.png" alt="Bhavik Security" style={{ maxHeight: '100%', height: 'auto', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p style={{ color: '#aaa', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>
            Security is a shared responsibility.<br />
            For any queries regarding these terms, please reach out to us at{' '}
            <a href="mailto:bhavikscrtsrvc@gmail.com" style={{ color: '#dc2626', textDecoration: 'none' }}>
              bhavikscrtsrvc@gmail.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '0.8rem', margin: 0 }}>
          © {new Date().getFullYear()} Bhavik Security Services. All Rights Reserved. &nbsp;|&nbsp;
          <Link href="/" style={{ color: '#555', textDecoration: 'none' }}>Home</Link>
        </p>
      </div>
    </div>
  );
}
