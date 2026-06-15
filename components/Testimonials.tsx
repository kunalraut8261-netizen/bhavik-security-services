'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { CardStack } from './ui/animated-cards-stack';
const DEFAULTS = [
  { name: 'Rajesh Malhotra', role: 'Factory Manager, Boisar Industrial Estate', testimonial: 'The security team provided by Bhavik has been exceptional. Their attention to detail and professional conduct have significantly improved our facility\'s safety.', rating: 5 },
  { name: 'Sunita Sharma', role: 'Residential Association President', testimonial: 'We\'ve been using their services for over 3 years. Reliable, punctual, and always ready to go the extra mile. Highly recommended for housing societies.', rating: 5 },
  { name: 'Vikram Singh', role: 'Event Organizer', testimonial: 'Managed a crowd of 2000+ smoothly. The bouncers were professional and handled tough situations with calmness. Truly the best in Palghar.', rating: 5 },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(DEFAULTS);

  useEffect(() => {
    getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')))
      .then(snap => {
        if (!snap.empty) setTestimonials(snap.docs.map(d => ({ 
          name: d.data().name, 
          role: d.data().role, 
          testimonial: d.data().testimonial, 
          rating: d.data().rating || 5 
        })));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="testimonials" style={{ background: '#f9f9f9', borderTop: '1px solid #eee', overflow: 'hidden' }}>
      <div style={{ paddingTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>Social Proof</span>
          <h2 className="heading-md" style={{ marginTop: '15px' }}>What Our Clients Say</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '20px auto 0 auto', fontSize: '1.05rem' }}>
            We take pride in delivering excellence. Here is the feedback from our valued partners.
          </p>
        </div>
        
        <div style={{ marginTop: '50px', marginBottom: '80px' }}>
          <CardStack items={testimonials} />
        </div>
      </div>
    </section>
  );
}
