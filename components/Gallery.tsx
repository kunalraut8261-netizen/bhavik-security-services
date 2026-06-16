'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Gallery.css';

const GALLERY_ITEMS = [
  { id: 'g1', img: "/images/gallery/team_temple_clean.jpg" },
  { id: 'g2', img: "/images/gallery/team_temple_banner.jpg" },
  { id: 'g3', img: "/images/gallery/office_bw_orig.jpg" },
  { id: 'g4', img: "/images/gallery/office_decor_orig.jpg" },
  { id: 'g5', img: "/images/gallery/security_team_orig.jpg" },
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);
  const items = GALLERY_ITEMS;

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="section-header">
          <h2>Our Presence</h2>
          <div className="tab-controls">
            <button className="active">
              Gallery
            </button>
          </div>
        </div>

        <div className="slideshow-wrapper">
          <div className="main-display">
            {items.map((item, i) => (
              <div 
                key={item.id} 
                className={`slide ${i === current ? 'active' : ''}`}
              >
                <img src={item.img} alt="Security Service Gallery" />
              </div>
            ))}
            
            <button className="nav-btn left" onClick={prevSlide} aria-label="Previous slide">
              <ChevronLeft size={32} />
            </button>
            <button className="nav-btn right" onClick={nextSlide} aria-label="Next slide">
              <ChevronRight size={32} />
            </button>
          </div>
          
          <div className="slide-footer">
            <span className="counter">{current + 1} / {items.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
