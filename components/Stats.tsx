'use client';
import React, { useState, useEffect } from 'react';
import { Target, Users, ShieldCheck, Briefcase } from 'lucide-react';
import GsapReveal from './GsapReveal';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Stats() {
  const iconColor = "var(--icon-green)";
  const [statsData, setStatsData] = useState({
    experience: 5,
    clients: 200,
    staff: 100,
    projects: 100,
  });

  useEffect(() => {
    getDoc(doc(db, 'site_content', 'main')).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setStatsData(prev => ({
          experience: parseInt(d.statExperience) || prev.experience,
          clients: parseInt(d.statClients) || prev.clients,
          staff: parseInt(d.statStaff) || prev.staff,
          projects: parseInt(d.statProjects) || prev.projects,
        }));
      }
    }).catch(() => {});
  }, []);

  const statsList = [
    { label: 'Work Experience', value: statsData.experience, icon: <Briefcase size={28} color={iconColor} />, suffix: '+' },
    { label: 'Happy Clients', value: statsData.clients, icon: <Users size={28} color={iconColor} />, suffix: '+' },
    { label: 'Professional Staff', value: statsData.staff, icon: <ShieldCheck size={28} color={iconColor} />, suffix: '+' },
    { label: 'Active Projects', value: statsData.projects, icon: <Target size={28} color={iconColor} />, suffix: '+' }
  ];

  return (
    <section className="section-padding" style={{ background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
      <div className="container">
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '30px', 
            padding: '20px 0' 
          }}
          className="stats-row"
        >
          {statsList.map((stat, idx) => (
            <GsapReveal 
               key={idx}
               delay={idx * 0.1}
               style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '20px', 
                 flex: '1 1 200px' 
               }}
            >
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  border: '1px solid #ddd', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '12px',
                  background: '#fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                }}
              >
                {stat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0', color: '#1a1a1a' }}>
                  {stat.value}{stat.suffix}
                </h3>
                <p style={{ color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', marginBottom: 0 }}>{stat.label}</p>
              </div>
            </GsapReveal>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .stats-row { justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}
