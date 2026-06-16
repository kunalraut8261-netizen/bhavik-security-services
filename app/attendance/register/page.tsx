'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, UploadCloud, UserCircle, Phone, Briefcase, MapPin, CheckCircle } from 'lucide-react';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { isThrottled, recordAction } from '@/lib/rateLimit';


const RegisterPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const siteFromUrl = searchParams?.get('site') || '';

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Success
    
    // Form Data
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Security Guard');
    const [site, setSite] = useState(siteFromUrl);
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    
    // Auth Data
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [finalRegId, setFinalRegId] = useState('');

    const setupRecaptcha = () => {
        const win = window as Window & typeof globalThis & { recaptchaVerifier?: RecaptchaVerifier };
        if (!win.recaptchaVerifier) {
            win.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    const handleSendOTP = async () => {
        if (!name || !phone || !role || !site || !aadhaarFile) {
            return alert('Please fill all fields and upload Aadhaar document.');
        }
        if (phone.length !== 10) {
            return alert('Enter a valid 10-digit mobile number.');
        }

        // Rate limit guard OTP: max 3 requests per 5 minutes
        const rl = isThrottled('guard_otp', 3, 5 * 60 * 1000);
        if (rl.throttled) {
            const remainingMin = Math.ceil(rl.remainingMs / 60000);
            return alert(`Too many OTP requests. Please try again in ${remainingMin} minutes.`);
        }
        
        setLoading(true);
        try {
            setupRecaptcha();
            const win = window as Window & typeof globalThis & { recaptchaVerifier?: RecaptchaVerifier };
            const appVerifier = win.recaptchaVerifier;
            if (!appVerifier) throw new Error("reCAPTCHA verifier not initialized");
            const res = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
            setConfirmationResult(res);
            recordAction('guard_otp', 5 * 60 * 1000);
            setStep(2);
        } catch (err) {
            const error = err as Error;
            alert('Error sending OTP: ' + error.message);
        }
        setLoading(false);
    };

    const generateRegId = async () => {
        const q = query(collection(db, 'guards'), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return 'BSS-1001';
        
        const lastRegId = snap.docs[0].data().registrationId;
        if (lastRegId && lastRegId.startsWith('BSS-')) {
            const num = parseInt(lastRegId.split('-')[1]);
            return `BSS-${num + 1}`;
        }
        return 'BSS-1001';
    };

    const handleVerifyAndRegister = async () => {
        if (!otp) return alert('Enter OTP');

        // Rate limit guard registration: max 3 attempts per 5 minutes
        const rl = isThrottled('guard_register', 3, 5 * 60 * 1000);
        if (rl.throttled) {
            const remainingMin = Math.ceil(rl.remainingMs / 60000);
            return alert(`Too many registration attempts. Please try again in ${remainingMin} minutes.`);
        }

        setLoading(true);
        try {
            // Verify Mobile first
            if (!confirmationResult) throw new Error("No confirmation result found");
            await confirmationResult.confirm(otp);
            
            // Upload Aadhaar
            const fileRef = ref(storage, `aadhaar/${Date.now()}_${aadhaarFile?.name}`);
            const uploadRes = await uploadBytes(fileRef, aadhaarFile as Blob);
            const documentUrl = await getDownloadURL(uploadRes.ref);
            
            // Generate Registration ID
            const newRegId = await generateRegId();
            
            // Save to Firestore
            const guardData = {
                registrationId: newRegId,
                name,
                phone,
                role,
                assignedSite: site,
                aadhaarUrl: documentUrl,
                status: 'Verification Pending',
                createdAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'guards'), guardData);
            
            // Store session
            localStorage.setItem('bhavik_guard_session', JSON.stringify({ id: docRef.id, ...guardData }));
            recordAction('guard_register', 5 * 60 * 1000);
            
            setFinalRegId(newRegId);
            setStep(3);
        } catch (err) {
            const error = err as Error;
            console.error(error);
            alert('Registration Failed: ' + error.message);
        }
        setLoading(false);
    };

    if (loading) return <div style={centerStyle}><div className="spinner"></div></div>;

    if (step === 3) {
        return (
            <div style={centerStyle}>
                <div style={{ width: '100%', maxWidth: '440px', background: '#fff', padding: '48px', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={40} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', color: '#0f172a' }}>Registration Successful!</h1>
                    <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1rem', lineHeight: 1.5 }}>Your digital identity has been created. Save your unique Registration ID for future logins.</p>
                    
                    <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '2px dashed #cbd5e1' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Registration ID</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '2px', marginTop: '4px' }}>{finalRegId}</h2>
                    </div>

                    <button onClick={() => router.push(`/attendance${siteFromUrl ? `?site=${siteFromUrl}` : ''}`)} style={btnStyle}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
            <div id="recaptcha-container"></div>
            <div style={{ width: '100%', maxWidth: '480px', background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Shield size={48} color="#1e293b" style={{ margin: '0 auto 16px' }} />
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>Guard Registration</h1>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>Create your Digital ID for attendance</p>
                </div>

                {step === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={inputWrapper}>
                                <UserCircle size={20} color="#94a3b8" />
                                <input placeholder="e.g. Rahul Sharma" value={name} onChange={e => setName(e.target.value)} style={inputBase} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Mobile Number</label>
                            <div style={inputWrapper}>
                                <Phone size={20} color="#94a3b8" />
                                <input placeholder="10-digit number" type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} style={inputBase} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Select Role</label>
                            <div style={inputWrapper}>
                                <Briefcase size={20} color="#94a3b8" />
                                <select value={role} onChange={e => setRole(e.target.value)} style={inputBase}>
                                    <option>Security Guard</option>
                                    <option>Bouncer</option>
                                    <option>Supervisor</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Assigned Site</label>
                            <div style={inputWrapper}>
                                <MapPin size={20} color="#94a3b8" />
                                <input placeholder="e.g. Nexus Mall" value={site} onChange={e => setSite(e.target.value)} style={inputBase} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Aadhaar Card (Front & Back PDF/Image)</label>
                            <div style={{ ...inputWrapper, padding: 0, position: 'relative', overflow: 'hidden' }}>
                                <input 
                                    type="file" 
                                    onChange={e => setAadhaarFile(e.target.files ? e.target.files[0] : null)} 
                                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }}
                                    accept=".pdf,image/*"
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', color: aadhaarFile ? '#0f172a' : '#94a3b8', width: '100%' }}>
                                    <UploadCloud size={20} color={aadhaarFile ? '#10b981' : '#94a3b8'} />
                                    <span style={{ fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {aadhaarFile ? aadhaarFile.name : 'Upload Document...'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSendOTP} style={{ ...btnStyle, marginTop: '16px' }}>Continue & Verify Phone</button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '16px', marginBottom: '24px', color: '#b91c1c' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>OTP sent to +91 {phone}</p>
                        </div>
                        <input 
                            placeholder="Enter 6-digit OTP" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                            style={{ ...inputWrapper, width: '100%', outline: 'none', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }} 
                            maxLength={6}
                        />
                        <button onClick={handleVerifyAndRegister} style={{ ...btnStyle, marginTop: '24px' }}>Verify & Register</button>
                        <button onClick={() => setStep(1)} style={{ ...btnStyle, background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', marginTop: '12px', boxShadow: 'none' }}>Change Details</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const centerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: '#334155' };
const inputWrapper = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#fff', transition: 'border 0.2s' };
const inputBase = { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '1rem', fontWeight: 600, color: '#0f172a' };
const btnStyle = { width: '100%', padding: '16px', borderRadius: '16px', background: '#1e293b', color: '#fff', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(30, 41, 59, 0.2)', transition: 'transform 0.2s' };

export default function Page() {
    return <Suspense fallback={<div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>}><RegisterPage /></Suspense>
}
