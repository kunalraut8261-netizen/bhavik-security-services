'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import './OrbitCarousel.css';

const expertiseData = [
  {
    id: 1,
    name: "Professional Guards",
    detail: "Elite security personnel for commercial and residential safety.",
    icon: <Briefcase className="oc-detail-icon" size={16} />,
    img: "/images/gallery/security_team_orig.jpg"
  },
  {
    id: 2,
    name: "Industrial Security",
    detail: "Comprehensive safety solutions for factories and industrial units.",
    icon: <Briefcase className="oc-detail-icon" size={16} />,
    img: "/images/gallery/office_bw_orig.jpg"
  },
  {
    id: 3,
    name: "Event Protection",
    detail: "Seamless security management for large-scale public and private events.",
    icon: <Briefcase className="oc-detail-icon" size={16} />,
    img: "/images/gallery/office_decor_orig.jpg"
  },
  {
    id: 4,
    name: "Corporate Security",
    detail: "Professional protection services tailored for modern business offices.",
    icon: <Briefcase className="oc-detail-icon" size={16} />,
    img: "/images/gallery/security_team_orig.jpg"
  }
];

export default function OrbitCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % expertiseData.length);
  const prev = () => setCurrent((prev) => (prev - 1 + expertiseData.length) % expertiseData.length);

  return (
    <section id="expertise" className="oc-container py-20 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Security Expertise</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tailored security solutions delivered by industry professionals with decades of experience.
        </p>
      </div>

      <div className="oc-orbit-wrap">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="oc-card"
          >
            <div style={{ padding: '40px' }}>
              <div className="oc-detail mb-6 text-xl text-gray-800 font-bold">
                {expertiseData[current].name}
              </div>
              <div className="oc-detail mb-8 text-lg text-gray-600">
                {expertiseData[current].icon}
                <span className="ml-3">{expertiseData[current].detail}</span>
              </div>
              
              <div className="oc-connect-bar">
                <button className="oc-btn-nav" onClick={prev}>
                  <ChevronLeft size={24} />
                </button>
                <button className="oc-btn-connect" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Inquire Now</button>
                <button className="oc-btn-nav" onClick={next}>
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="oc-dots">
        {expertiseData.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className={`oc-dot ${i === current ? 'active' : 'inactive'}`}
          />
        ))}
      </div>
    </section>
  );
}
