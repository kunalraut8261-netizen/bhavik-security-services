'use client';
import React, { useEffect } from 'react';
import Contact from '@/components/Contact';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import GooeySplash from '@/components/GooeySplash';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import About from '@/components/About';
import Services from '@/components/Services';
import Process from '@/components/Process';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import OrbitCarousel from '@/components/OrbitCarousel';

export default function Home() {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.reveal');
      const windowHeight = window.innerHeight;

      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
          element.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main style={{ background: '#ffffff', color: '#333', minHeight: '100vh' }}>
      <Navbar />
      <GooeySplash />
      <Hero />
      <Stats />
      <About />
      <Services />
      <OrbitCarousel />
      <Process />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
