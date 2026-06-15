'use client';
import React, { useState, useEffect } from 'react';

import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const DEFAULTS = [
  { question: 'What types of security personnel do you provide?', answer: 'We provide Industrial Security Guards, Residential Watchmen, Licensed Gunmen, Professional Bouncers, and Event Security personnel tailored to your specific needs.' },
  { question: 'How do you train your security guards?', answer: 'Our guards undergo rigorous training including physical fitness, emergency response, fire safety, crowd management, and professional conduct protocols.' },
  { question: 'Do you provide 24/7 security monitoring?', answer: 'Yes, we offer round-the-clock security services with on-site guarding and supervisory checks to ensure constant protection.' },
  { question: 'In which areas do you provide services?', answer: 'We primarily serve Palghar, Boisar, and surrounding industrial and residential regions, with a strong presence in the local community.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState(DEFAULTS);

  useEffect(() => {
    getDocs(query(collection(db, 'faqs'), orderBy('order', 'asc')))
      .then(snap => {
        if (!snap.empty) setFaqs(snap.docs.map(d => ({ question: d.data().question, answer: d.data().answer })));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="faq" className="section-padding" style={{ background: '#ffffff', borderTop: '1px solid #eee' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>Common Questions</span>
          <h2 className="heading-md" style={{ marginTop: '15px' }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: openIndex === idx ? '#fcfcfc' : '#ffffff', transition: 'all 0.3s ease' }}>
              <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{ width: '100%', padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <HelpCircle size={20} color={openIndex === idx ? 'var(--primary)' : '#666'} />
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a' }}>{faq.question}</span>
                </div>
                {openIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <div style={{ display: 'grid', gridTemplateRows: openIndex === idx ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 30px 30px 65px', color: '#666', fontSize: '1rem', lineHeight: '1.7' }}>{faq.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
