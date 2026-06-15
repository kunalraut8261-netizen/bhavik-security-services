'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, MapPin, Clock, Copy, LogOut, CheckCircle, Smartphone } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from 'firebase/auth';

const AttendancePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const siteFromUrl = searchParams?.get('site') || '';

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [regId, setRegId] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Enter Reg ID, 2: OTP
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [guardData, setGuardData] = useState<any>(null);
    
    // Check session
    useEffect(() => {
        const storedGuard = localStorage.getItem('bhavik_guard_session');
        if (storedGuard) {
            setGuardData(JSON.parse(storedGuard));
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    const handleSendOTP = async () => {
        if (!regId) return alert('Enter Registration ID');
        setLoading(true);
        try {
            // Check if Reg ID exists
            const q = query(collection(db, 'guards'), where('registrationId', '==', regId));
            const snap = await getDocs(q);
            
            if (snap.empty) {
                alert('Registration ID not found.');
                setLoading(false);
                return;
            }
            const gData = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
            const phoneNumber = gData.mobile;
            
            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;
            const res = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, appVerifier);
            setConfirmationResult(res);
            setGuardData(gData);
            setStep(2);
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
        setLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (!otp) return alert('Enter OTP');
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            localStorage.setItem('bhavik_guard_session', JSON.stringify(guardData));
            // Reload to show dashboard
            window.location.reload();
        } catch (err: any) {
            alert('Invalid OTP: ' + err.message);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('bhavik_guard_session');
        signOut(auth);
        setGuardData(null);
        setStep(1);
        setRegId('');
        setOtp('');
    };

    const handleMarkAttendance = async (type: 'IN' | 'OUT') => {
        if (!guardData) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'attendance'), {
                guardId: guardData.id,
                registrationId: guardData.registrationId,
                name: guardData.name,
                site: siteFromUrl || guardData.assignedSite || 'Unknown Site',
                type,
                timestamp: serverTimestamp(),
                dateLabel: new Date().toISOString().split('T')[0] // YYYY-MM-DD
            });
            alert(`Attendance Marked ${type} Successfully!`);
        } catch (err: any) {
            alert('Error marking attendance: ' + err.message);
        }
        setLoading(false);
    };

    if (loading) return <div style={centerStyle}><div className="spinner"></div></div>;

    if (!guardData || step !== 1 && !localStorage.getItem('bhavik_guard_session')) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
                <div id="recaptcha-container"></div>
                <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <Shield size={48} color="#1e293b" style={{ margin: '0 auto 20px' }} />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px' }}>Digital ID Login</h1>
                    <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.9rem' }}>Enter Registration ID to access portal</p>

                    {step === 1 ? (
                        <>
                            <input 
                                placeholder="e.g. BSS-0001" 
                                value={regId} 
                                onChange={e => setRegId(e.target.value)} 
                                style={inputStyle} 
                            />
                            <button onClick={handleSendOTP} style={btnStyle}>Login</button>
                            
                            <div style={{ marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
                                First time user? <br/>
                                <button onClick={() => router.push(`/attendance/register${siteFromUrl ? `?site=${siteFromUrl}` : ''}`)} style={{ background: 'none', border: 'none', color: '#1e293b', fontWeight: 800, marginTop: '8px', cursor: 'pointer' }}>
                                    Complete One-Time Registration
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', color: '#475569' }}>
                                OTP sent to your registered mobile ending in <b>{guardData?.mobile?.slice(-4)}</b>
                            </div>
                            <input 
                                placeholder="Enter 6-digit OTP" 
                                value={otp} 
                                onChange={e => setOtp(e.target.value)} 
                                style={inputStyle} 
                                maxLength={6}
                            />
                            <button onClick={handleVerifyOTP} style={btnStyle}>Verify OTP</button>
                            <button onClick={() => setStep(1)} style={{ ...btnStyle, background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', marginTop: '12px', boxShadow: 'none' }}>Back</button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const [showQR, setShowQR] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '20px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
                
                {/* Header Section */}
                <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '40px 32px', color: '#fff', textAlign: 'center', position: 'relative' }}>
                    <button onClick={handleLogout} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <LogOut size={18} />
                    </button>
                    
                    <div style={{ width: '100px', height: '100px', background: '#fff', borderRadius: '35px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <Shield size={50} color="#1e293b" />
                    </div>
                    
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>{guardData.name}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={14} /> {guardData.role}
                        </div>
                        <div style={{ background: guardData.status === 'Verified' ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)', color: guardData.status === 'Verified' ? '#10b981' : '#f97316', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {guardData.status === 'Verified' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            {guardData.status?.toUpperCase() || 'PENDING'}
                        </div>
                    </div>
                </div>

                {/* Dashboard Body */}
                <div style={{ padding: '32px' }}>
                    {/* ID Card Quick Access */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        <button 
                            onClick={() => setShowQR(!showQR)}
                            style={{ flex: 1, padding: '24px 16px', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <QrCode size={32} style={{ margin: '0 auto 12px', color: '#1e293b' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{showQR ? 'Hide QR Code' : 'Show Digital ID'}</p>
                        </button>
                        <button 
                            onClick={() => router.push(`/id/${guardData.registrationId}`)}
                            style={{ flex: 1, padding: '24px 16px', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }}
                        >
                            <Shield size={32} style={{ margin: '0 auto 12px', color: '#ea580c' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>View Public ID</p>
                        </button>
                    </div>

                    {showQR && (
                        <div style={{ padding: '32px', background: '#f8fafc', borderRadius: '24px', marginBottom: '32px', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
                            <div style={{ padding: '20px', background: '#fff', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/id/${guardData.registrationId}`} size={180} />
                            </div>
                            <p style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SHOW TO SUPERVISOR FOR VERIFICATION</p>
                        </div>
                    )}

                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '24px', color: '#fff', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <MapPin size={20} color="#ea580c" />
                            <div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Current Assignment</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{siteFromUrl || guardData.assignedSite || 'Awaiting Assignment'}</p>
                            </div>
                        </div>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={20} color="#10b981" />
                            <div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Shift Status</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>Reporting Live</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Actions */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button 
                            onClick={() => handleMarkAttendance('IN')} 
                            disabled={guardData.status !== 'Verified'}
                            style={{ ...btnStyle, flex: 1, background: '#10b981', opacity: guardData.status !== 'Verified' ? 0.5 : 1, cursor: guardData.status !== 'Verified' ? 'not-allowed' : 'pointer' }}
                        >
                            Mark IN
                        </button>
                        <button 
                            onClick={() => handleMarkAttendance('OUT')} 
                            disabled={guardData.status !== 'Verified'}
                            style={{ ...btnStyle, flex: 1, background: '#ef4444', opacity: guardData.status !== 'Verified' ? 0.5 : 1, cursor: guardData.status !== 'Verified' ? 'not-allowed' : 'pointer' }}
                        >
                            Mark OUT
                        </button>
                    </div>

                    {guardData.status !== 'Verified' && (
                        <p style={{ marginTop: '20px', textAlign: 'center', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                            * Verification Pending. Attendance marking is currently disabled.
                        </p>
                    )}
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#f8fafc', marginBottom: '16px', outline: 'none', fontWeight: 600, fontSize: '1rem', color: '#0f172a' };
const btnStyle = { width: '100%', padding: '20px', borderRadius: '24px', background: '#1e293b', color: '#fff', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: 'all 0.2s' };
const centerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const infoRow = { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px' };
const infoLabel = { fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const };
const infoValue = { fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' };

import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Page() {
    return <Suspense fallback={<div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: '#0f172a'}}><Shield size={60} color="#fff" style={{opacity: 0.1, animation:'pulse 2s infinite'}}/></div>}><AttendancePage /></Suspense>
}
