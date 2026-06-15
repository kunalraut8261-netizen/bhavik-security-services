'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Shield, CheckCircle, Smartphone, MapPin, Clock, Calendar, AlertTriangle, ChevronLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Guard {
    id: string;
    name: string;
    registrationId: string;
    role: string;
    status: 'Verified' | 'Verification Pending' | 'Suspended';
}

const PublicIDPage = () => {
    const params = useParams();
    const router = useRouter();
    const regId = params?.regId as string;
    
    const [guard, setGuard] = useState<Guard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGuard = async () => {
            if (!regId) return;
            try {
                const q = query(collection(db, 'guards'), where('registrationId', '==', regId), limit(1));
                const snap = await getDocs(q);
                
                if (snap.empty) {
                    setError('Identity not found.');
                } else {
                    setGuard({ id: snap.docs[0].id, ...snap.docs[0].data() } as Guard);
                }
            } catch (err) {
                console.error(err);
                setError('Verification system unavailable.');
            }
            setLoading(false);
        };
        fetchGuard();
    }, [regId]);

    if (loading) {
        return (
            <div style={centerStyle}>
                <Shield size={60} className="animate-pulse" style={{ opacity: 0.1 }} />
            </div>
        );
    }

    if (error || !guard) {
        return (
            <div style={centerStyle}>
                <div style={cardStyle}>
                    <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>Invalid Identity</h1>
                    <p style={{ color: '#64748b', marginBottom: '32px' }}>This Registration ID could not be verified by the Bhavik Security control center.</p>
                    <button onClick={() => router.push('/')} style={btnStyle}>Back to Website</button>
                </div>
            </div>
        );
    }

    const isVerified = guard.status === 'Verified';

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Holographic ID card Container */}
            <div style={{ ...idCardOuter, animation: 'fadeIn 0.8s ease-out' }}>
                {/* Header with Logo */}
                <div style={idHeader}>
                    <div style={logoCircle}>
                        <Shield size={32} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '1px' }}>BHAVIK</h2>
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>Security Services</p>
                    </div>
                </div>

                {/* Profile Section */}
                <div style={profileSection}>
                    <div style={avatarHex}>
                        <Shield size={80} color="#1e293b" style={{ opacity: 0.1 }} />
                        <div style={verifiedSeal}>
                            <CheckCircle size={32} color={isVerified ? '#10b981' : '#94a3b8'} fill="#fff" />
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}>{guard.name}</h1>
                        <div style={roleBadge}>
                            {guard.role}
                        </div>
                    </div>
                </div>

                {/* Security Data Grid */}
                <div style={dataGrid}>
                    <div style={dataItem}>
                        <p style={dataLabel}>REGISTRATION ID</p>
                        <p style={dataValue}>{guard.registrationId}</p>
                    </div>
                    <div style={dataItem}>
                        <p style={dataLabel}>STATUS</p>
                        <p style={{ ...dataValue, color: isVerified ? '#10b981' : '#f97316' }}>
                            {isVerified ? 'VERIFIED' : 'PENDING'}
                        </p>
                    </div>
                </div>

                {/* Verification QR */}
                <div style={qrSection}>
                    <div style={qrContainer}>
                        <QRCodeSVG 
                            value={typeof window !== 'undefined' ? window.location.href : regId} 
                            size={120}
                            bgColor="transparent"
                            fgColor="#1e293b"
                        />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Scan to Verify Authenticity
                    </p>
                </div>

                {/* Footer Security Strip */}
                <div style={securityFooter}>
                    <Shield size={16} /> BSS SECURE IDENTITY SYSTEM v1.0
                </div>
                
                {/* Decorative Holographic Elements */}
                <div style={holoOverlay}></div>
            </div>

            {/* Back to Home Link */}
            <button onClick={() => router.push('/')} style={{ marginTop: '32px', background: 'none', border: 'none', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <ChevronLeft size={18} /> Exit Digital ID
            </button>

            <style jsx global>{`
                .reveal.active {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Global Animations for Pulse and Shimmers */
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                @keyframes shine {
                    from { transform: translateX(-100%) rotate(45deg); }
                    to { transform: translateX(200%) rotate(45deg); }
                }
            `}</style>
        </div>
    );
};

// Styles
const centerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '400px', padding: '48px', background: '#fff', borderRadius: '32px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.3)' };
const btnStyle: React.CSSProperties = { width: '100%', padding: '16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' };

const idCardOuter: React.CSSProperties = {
    width: '100%',
    maxWidth: '380px',
    background: '#fff',
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
};

const idHeader: React.CSSProperties = {
    padding: '32px',
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
};

const logoCircle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #ea580c, #1e293b)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const profileSection: React.CSSProperties = {
    padding: '40px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const avatarHex: React.CSSProperties = {
    width: '140px',
    height: '140px',
    background: '#f8fafc',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    border: '4px solid #f1f5f9'
};

const verifiedSeal: React.CSSProperties = {
    position: 'absolute',
    bottom: '-10px',
    right: '-10px',
    background: '#fff',
    borderRadius: '50%',
    padding: '4px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
};

const roleBadge: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 16px',
    background: '#f1f5f9',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const dataGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    padding: '0 32px 32px',
    gap: '12px'
};

const dataItem: React.CSSProperties = {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '16px',
    textAlign: 'center'
};

const dataLabel: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', marginBottom: '4px' };
const dataValue: React.CSSProperties = { fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' };

const qrSection: React.CSSProperties = {
    padding: '32px',
    background: '#f8fafc',
    borderTop: '1px dashed #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
};

const qrContainer: React.CSSProperties = {
    padding: '16px',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
};

const securityFooter: React.CSSProperties = {
    padding: '16px',
    background: '#1e293b',
    color: '#64748b',
    fontSize: '0.6rem',
    fontWeight: 800,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
};

const holoOverlay: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    background: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
    backgroundSize: '200% 100%',
    animation: 'shine 4s infinite linear'
};

export default function Page() {
    return <Suspense fallback={<div style={centerStyle}><Shield size={60} className="animate-pulse" style={{ opacity: 0.1 }} /></div>}><PublicIDPage /></Suspense>;
}
