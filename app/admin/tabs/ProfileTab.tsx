'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Save, Loader2, Camera } from 'lucide-react';

export default function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@bhaviksecurity.com',
    role: 'Super Administration',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    bio: 'Overseeing the security deployment and operations for Bhavik Security Services.',
    phone: '+91 99999 00000',
    location: 'Palghar, Maharashtra'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid || 'temp_admin';
      await setDoc(doc(db, 'users', uid), profile, { merge: true });
      alert('Profile updated successfully!');
    } catch (err) { alert('Failed to update profile.'); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', height: '140px' }}></div>
        
        <div style={{ padding: '0 40px 40px', position: 'relative' }}>
          {/* Avatar Area */}
          <div style={{ marginTop: '-60px', display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '32px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '24px', border: '6px solid #fff', background: '#f1f5f9', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <img src={profile.photoURL} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button style={{ position: 'absolute', bottom: '8px', right: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={16} />
              </button>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{profile.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                <Shield size={16} color="#3b82f6" /> {profile.role}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Phone Number</label>
              <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Location</label>
              <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Biography</label>
              <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }} />
            </div>
          </div>

          <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '12px 32px', borderRadius: '12px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              Update Profile
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
