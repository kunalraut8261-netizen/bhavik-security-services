'use client';
import React from 'react';
import GsapReveal from './GsapReveal';
import { ArrowRight } from 'lucide-react';

export default function Process() {
  const steps = [
    { 
      id: '01', 
      title: 'Initial Consultation', 
      desc: 'We analyze your current security requirements and identify vulnerabilities.' 
    },
    { 
      id: '02', 
      title: 'Custom Planning', 
      desc: 'We design a specialized protection plan tailored to your property or event.' 
    },
    { 
      id: '03', 
      title: 'Rapid Deployment', 
      desc: 'Our professionals arrive on site with immediate monitoring and protection.' 
    }
  ];

  return (
    <section id="process" className="section-padding" style={{ background: '#f9fafb' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
           <h2 className="heading-md">Our Protection Process</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '20px auto 0 auto' }}>
              Simple, effective, and professional security deployment.
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {steps.map((step, index) => (
            <GsapReveal
              key={index}
              y={20}
              duration={0.6}
              delay={index * 0.1}
              style={{
                background: '#ffffff',
                padding: '60px 50px',
                borderRadius: '32px',
                position: 'relative',
                border: '1px solid #eef0f2',
                overflow: 'hidden'
              }}
            >
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '30px', 
                  fontSize: '8rem', 
                  fontWeight: 900, 
                  color: 'rgba(0,0,0,0.03)',
                  zIndex: 0
                }}
              >
                {step.id}
              </span>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: '#111827' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '280px', lineHeight: '1.7', fontSize: '1rem' }}>{step.desc}</p>
                <a href="#" style={{ color: '#111827', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  Read More <ArrowRight size={18} />
                </a>
              </div>
            </GsapReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
