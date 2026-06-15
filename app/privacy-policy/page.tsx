'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


export default function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        'Personal identification information (name, phone number, email address) provided when you contact us, submit an inquiry, or sign a service agreement.',
        'Employment-related information (name, address, ID proof, photo) collected from guards and personnel as part of the onboarding and attendance process.',
        'Device and usage data such as IP addresses, browser type, and pages visited when you interact with our website.',
        'CCTV and surveillance footage collected at client premises as part of our contracted security services.',
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'To provide and manage security services as agreed in the service contract.',
        'To process attendance records, shift schedules, and payroll for security personnel.',
        'To respond to inquiries, service requests, and customer support communications.',
        'To improve our website, services, and internal operations.',
        'To comply with applicable laws, regulations, and legal obligations in India.',
        'To send service updates, alerts, or important communications related to your engagement with us.',
      ],
    },
    {
      title: '3. Information Sharing & Disclosure',
      content: [
        'We do not sell, trade, or rent your personal information to third parties.',
        'We may share information with trusted service providers (e.g., cloud storage, communication tools) strictly for operational purposes under confidentiality agreements.',
        'We may disclose information to law enforcement or government authorities when required by law or court order.',
        'Client CCTV footage and surveillance data are shared only with the respective client or authorised personnel.',
      ],
    },
    {
      title: '4. Data Storage & Security',
      content: [
        'All personal data is stored on secure servers using industry-standard encryption and access controls.',
        'We use Firebase (Google Cloud) for data storage and authentication, which complies with international security standards.',
        'Access to personal data is restricted to authorised staff and management only.',
        'In the event of a data breach, affected parties will be notified in accordance with applicable Indian data protection laws.',
      ],
    },
    {
      title: '5. Retention of Data',
      content: [
        'Client and personnel records are retained for the duration of the service agreement and for a minimum of 3 years thereafter, as required by applicable laws.',
        'Attendance and payroll records are retained for at least 5 years as per labour law requirements.',
        'Surveillance footage is retained for a period agreed upon in the client contract, typically 30 to 90 days unless legally required to hold longer.',
        'Website usage data is retained for analytical purposes for up to 12 months.',
      ],
    },
    {
      title: '6. Your Rights',
      content: [
        'You have the right to access the personal data we hold about you.',
        'You may request correction of inaccurate or incomplete information.',
        'You may request deletion of your personal data where we are not legally required to retain it.',
        'You may withdraw consent for marketing or non-essential communications at any time.',
        'To exercise any of these rights, please contact us at bhavikscrtsrvc@gmail.com.',
      ],
    },
    {
      title: '7. Cookies & Website Tracking',
      content: [
        'Our website may use cookies or similar tracking technologies to improve user experience.',
        'You can control cookie settings through your browser preferences.',
        'We do not use cookies to collect personally identifiable information without your explicit consent.',
      ],
    },
    {
      title: '8. Third-Party Links',
      content: [
        'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites.',
        'We recommend reviewing the privacy policies of any third-party websites you visit.',
      ],
    },
    {
      title: '9. Children\'s Privacy',
      content: [
        'Our services are not directed at individuals under the age of 18.',
        'We do not knowingly collect personal data from minors. If we become aware of such data being collected without parental consent, it will be deleted promptly.',
      ],
    },
    {
      title: '10. Changes to This Policy',
      content: [
        'We reserve the right to update this Privacy Policy at any time.',
        'Any changes will be posted on this page with a revised effective date.',
        'Continued use of our services after changes are posted constitutes acceptance of the updated policy.',
      ],
    },
    {
      title: '11. Contact Us',
      content: [
        'For any questions, concerns, or requests related to this Privacy Policy, please contact us:',
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
            <span style={{ fontSize: '0.85rem' }}>🔒</span>
            <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Legal</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#888', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            This policy explains how Bhavik Security Services collects, uses, stores, and protects your personal information.
          </p>
          <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '24px' }}>
            Effective Date: <strong style={{ color: '#888' }}>1 April 2025</strong> &nbsp;|&nbsp; Last Updated: <strong style={{ color: '#888' }}>12 April 2025</strong>
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
            Bhavik Security Services (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy and security of your personal information.
            This Privacy Policy describes how we handle personal data collected through our website, services, and operational activities.
            By engaging with our services or using our website, you agree to the terms described herein.
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
            Your trust is the foundation of everything we do at Bhavik Security Services.<br />
            For any privacy-related concerns, please reach out to us at{' '}
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
