'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, LayoutDashboard, Users, Settings, FileText, Image as ImageIcon, 
  MessageSquare, HelpCircle, LogOut, User as UserIcon, Mail, Phone, 
  Bell, Search, ChevronRight, CheckCircle, AlertCircle, Clock, MapPin, QrCode
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged, 
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, getDoc, setDoc, collection, onSnapshot, query, 
  serverTimestamp, where, orderBy, limit 
} from 'firebase/firestore';
import LeadsTab from './tabs/LeadsTab';
import ContentTab from './tabs/ContentTab';
import GalleryTab from './tabs/GalleryTab';
import ServicesTab from './tabs/ServicesTab';
import { FaqsTab, TestimonialsTab } from './tabs/FaqsAndTestimonialsTab';
import ProfileTab from './tabs/ProfileTab';
import MessagesTab from './tabs/MessagesTab';
import AttendanceTab from './tabs/AttendanceTab';
import GuardsTab from './tabs/GuardsTab';

type Tab = 'overview' | 'leads' | 'content' | 'gallery' | 'services' | 'faqs' | 'profile' | 'messages' | 'attendance' | 'guards';
type TimeFilter = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

interface LeadItem {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  [key: string]: unknown;
}

interface NotificationItem {
  id: string;
  type?: string;
  userId?: string;
  text?: string;
  timestamp?: { seconds: number; nanoseconds: number } | null;
  read?: boolean;
}

import { isThrottled, recordAction } from '@/lib/rateLimit';

const AdminPage = () => {
    // Auth & Setup State
    const [initialAuthCheck, setInitialAuthCheck] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationStep, setVerificationStep] = useState(false);
    const [authError, setAuthError] = useState('');

    // Live Metrics State
    const [leads, setLeads] = useState<LeadItem[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('MONTHLY');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [adminData, setAdminData] = useState({ 
        name: 'Admin', 
        role: 'Master Control',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' 
    });

    // 1. Check if Admin Exists (Single-Person Policy)
    const [showReset, setShowReset] = useState(false);

    useEffect(() => {
        // Emergency Reset check
        if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
            setShowReset(true);
        }

        const initializeAdmin = async () => {
            // 1. Check for force setup bypass
            if (typeof window !== 'undefined' && window.location.search.includes('force_setup=true')) {
                setIsFirstTime(true);
            } else {
                const docRef = doc(db, 'settings', 'admin_config');
                const snap = await getDoc(docRef);
                setIsFirstTime(!snap.exists());
            }

            // 2. Start Auth Listener
            const unsub = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        const docRef = doc(db, 'settings', 'admin_config');
                        const snap = await getDoc(docRef);
                        
                        if (snap.exists()) {
                            const config = snap.data();
                            const isMaster = config.masterUid === user.uid || 
                                            (config.masterEmail && config.masterEmail.toLowerCase() === user.email?.toLowerCase());

                            if (isMaster) {
                                if (user.emailVerified) {
                                    setIsAuthenticated(true);
                                    setVerificationStep(false);
                                } else {
                                    setIsAuthenticated(false);
                                    setVerificationStep(true);
                                }
                            } else {
                                // Not the master admin
                                console.warn("Unauthorized access attempt by:", user.email);
                                setIsAuthenticated(false);
                            }
                        }
                    } catch (e) {
                        console.error("Auth process error:", e);
                    }
                } else {
                    setIsAuthenticated(false);
                    setVerificationStep(false);
                }
                setLoading(false);
                setInitialAuthCheck(false);
            });
            return unsub;
        };

        const unsubAuth = initializeAdmin();
        return () => {
            unsubAuth.then(u => typeof u === 'function' && u());
        };
    }, []);

    // 2. Real-time Lead & Notification Listener
    useEffect(() => {
        if (!isAuthenticated) return;
        
        // Leads
        const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(200));
        const unsubLeads = onSnapshot(qLeads, (snap) => {
            setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Notifications (Chat Alerts)
        const qNotifs = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(10));
        const unsubNotifs = onSnapshot(qNotifs, (snap) => {
            setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => {
            console.warn("Notification listener error:", err);
        });

        return () => {
            unsubLeads();
            unsubNotifs();
        };
    }, [isAuthenticated]);

    // Dedicated Profile Listener with Safety
    useEffect(() => {
        if (!isAuthenticated || !auth.currentUser) return;

        const userRef = doc(db, 'users', auth.currentUser.uid);
        const unsubUser = onSnapshot(userRef, (userSnap) => {
            if (userSnap.exists()) {
                const data = userSnap.data();
                setAdminData({ 
                    name: data.name || 'Admin', 
                    role: data.role || 'Master Control',
                    photoURL: data.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + auth.currentUser?.uid
                });
            }
        }, (err) => {
            console.warn("Profile sync delay (permission check):", err);
        });

        return () => unsubUser();
    }, [isAuthenticated]);

    // 3. Analytics Engine (Daily, Weekly, Monthly, Yearly)
    const stats = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0,0,0,0)).getTime();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        const filtered = leads.filter(l => {
            const t = l.createdAt?.seconds ? l.createdAt.seconds * 1000 : 0;
            if (timeFilter === 'DAILY') return t >= startOfDay;
            if (timeFilter === 'WEEKLY') return t >= startOfWeek;
            if (timeFilter === 'MONTHLY') return t >= startOfMonth;
            return t >= startOfYear;
        });

        // Generate rough SVG path for the chart based on data spread
        const trend = filtered.length;
        const path = `M0,100 Q50,${100 - trend * 5} 100,80 T200,${90 - trend * 2} T300,50 T400,${10 + trend}`;

        return { count: filtered.length, total: leads.length, path };
    }, [leads, timeFilter]);

    // 4. Registration & Login Logic
    const handleAuth = async () => {
            const cleanEmail = email.trim().toLowerCase();
            const cleanPassword = password.trim();
            const cleanName = name.trim();

            setAuthError('');

            if (!cleanEmail || !cleanPassword || (isFirstTime && !cleanName)) {
                setAuthError('Please fill in all details.');
                return;
            }

            // Email Format Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                setAuthError('Please enter a VALID email address (e.g., name@example.com).');
                return;
            }

            // Rate Limit: max 5 login attempts per 10 minutes
            const rl = isThrottled('admin_login', 5, 10 * 60 * 1000);
            if (rl.throttled) {
                const remainingMin = Math.ceil(rl.remainingMs / 60000);
                setAuthError(`Too many login attempts. Please try again in ${remainingMin} minutes.`);
                return;
            }

            recordAction('admin_login', 10 * 60 * 1000);

            setLoading(true);
            try {
                if (isFirstTime) {
                    // First-time Setup
                    const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
                    await updateProfile(res.user, { displayName: cleanName });
                    
                    // Save to Global Config
                    await setDoc(doc(db, 'settings', 'admin_config'), {
                        masterUid: res.user.uid,
                        masterEmail: cleanEmail,
                        masterName: cleanName,
                        createdAt: serverTimestamp()
                    });
                    
                    // Save to Admins Collection
                    await setDoc(doc(db, 'admins', res.user.uid), {
                        name: cleanName,
                        email: cleanEmail,
                        role: 'Master Admin',
                        createdAt: serverTimestamp()
                    });

                    await sendEmailVerification(res.user);
                    setVerificationStep(true);
                    alert('Verification email sent to ' + cleanEmail);
                } else {
                    // Regular Login
                    const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
                    if (!res.user.emailVerified) {
                        setVerificationStep(true);
                        try {
                            await sendEmailVerification(res.user); 
                        } catch (sendErr) {
                            const error = sendErr as { code?: string };
                            // If they already triggered a rate limit, just proceed to the verification screen
                            // which already has a manual "Resend" button.
                            if (error.code !== 'auth/too-many-requests') {
                                console.error("Email Verification Error:", sendErr);
                            }
                        }
                    } else {
                        setIsAuthenticated(true);
                    }
                }
        } catch (err) {
            console.error("Auth Error:", err);
            const error = err as { code?: string; message?: string };
            let msg = "Authentication failed. Please check your credentials.";
            if (error.code === 'auth/invalid-email') msg = "The email address is badly formatted.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') msg = "Invalid email or password.";
            if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
            if (error.code === 'auth/email-already-in-use') msg = "This email is already registered as an admin.";
            if (error.code === 'auth/too-many-requests') msg = "Too many login attempts. Try again later.";
            if (error.code === 'auth/network-request-failed') msg = "Network error. Please check your internet connection.";
            
            setAuthError(msg);
            alert(msg + "\n\nError details: " + (error.message || ''));
            if (error.message?.includes("permissions")) {
                alert("CRITICAL: You must manually delete the document 'settings/admin_config' in your Firebase Console because the system is locked by an old admin account.\n\nGo to: Firebase Console -> Firestore -> settings -> admin_config -> Delete.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!email.trim()) {
            alert("Please enter your admin email first.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            alert("Reset link sent for: " + email);
        } catch (err) {
            const error = err as Error;
            alert("Reset error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkVerification = async () => {
        setLoading(true);
        try {
            await auth.currentUser?.reload();
            if (auth.currentUser?.emailVerified) {
                setIsAuthenticated(true);
                setVerificationStep(false);
                // Refresh to get layout update
                window.location.reload();
            } else {
                alert('Email not yet verified. Please check your inbox.');
            }
        } catch (err) {
            const error = err as Error;
            alert('Error: ' + error.message);
        }
        setLoading(false);
    };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;

    if (initialAuthCheck || isFirstTime === null) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
                <div style={{ padding: '32px', textAlign: 'center' }}>
                    <Shield size={60} style={{ margin: '0 auto 24px', opacity: 0.1, display: 'block' }} className="animate-pulse" />
                    <p style={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Verifying Identity</p>
                </div>
            </div>
        );
    }

    if (verificationStep) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2' }}>
                <div style={{ width: '100%', maxWidth: '440px', padding: '48px', background: '#fff', borderRadius: '32px', boxShadow: '0 20px 60px rgba(30, 41, 59, 0.1)', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #1e293b, #ea580c)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Mail size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px' }}>Verify Your Email</h1>
                    <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.9rem' }}>We&apos;ve sent a verification link to <b>{email}</b>. Please click the link to activate your admin account.</p>
                    
                    <button onClick={checkVerification} style={btnStyle}>I&apos;ve Verified My Email</button>
                    
                    <button onClick={async () => {
                        if (auth.currentUser) {
                            await sendEmailVerification(auth.currentUser);
                            alert('Verification email resent!');
                        }
                    }} style={{ background: 'none', border: 'none', color: '#1e293b', fontSize: '0.85rem', fontWeight: 700, marginTop: '20px', cursor: 'pointer' }}>
                        Resend Verification Link
                    </button>
                    
                    <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                        <button onClick={() => { setVerificationStep(false); signOut(auth); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>Change Account / Login</button>
                    </div>
                </div>
            </div>
        );
    }

    if (isFirstTime) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2' }}>
                <div style={{ width: '100%', maxWidth: '440px', padding: '48px', background: '#fff', borderRadius: '32px', boxShadow: '0 20px 60px rgba(30, 41, 59, 0.1)' }}>
                    <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #1e293b, #ea580c)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Shield size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, textAlign: 'center', marginBottom: '8px' }}>Setup Master Admin</h1>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px', fontSize: '0.9rem' }}>Only one account is allowed. Once created, registration will close forever.</p>

                    <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                    <input placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                    <input placeholder="Setup Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                    {authError && (
                        <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>
                            {authError}
                        </div>
                    )}
                    <button onClick={handleAuth} style={btnStyle}>Register Master Admin</button>
                    
                    <button 
                        onClick={() => {
                            setIsFirstTime(false);
                            // Clear the force_setup from URL if it exists
                            window.history.replaceState({}, '', '/admin');
                        }} 
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', width: '100%', marginTop: '16px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Already have an account? Login here
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', position: 'relative' }}>
            {showReset && (
                <div style={{ position: 'absolute', top: '24px', padding: '16px 24px', background: '#ef4444', borderRadius: '16px', color: '#fff', textAlign: 'center', boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)', zIndex: 100 }}>
                    <p style={{ fontWeight: 800, marginBottom: '8px' }}>Emergency System Reset</p>
                    <button 
                        onClick={async () => {
                            if (!confirm("Wipe admin config? This will allow you to set up a new account.")) return;
                            const { deleteDoc, doc } = await import('firebase/firestore');
                            await deleteDoc(doc(db, 'settings', 'admin_config'));
                            alert("Config Wiped. Refreshing...");
                            window.location.href = '/admin';
                        }}
                        style={{ background: '#fff', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}
                    >
                        Wipe Firestore Config
                    </button>
                </div>
            )}
            <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <Shield size={60} color="#1e293b" style={{ marginBottom: '24px' }} />
                <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, marginBottom: 10 }}>Portal Locked.</h1>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Enter your email and password to log in.</p>
                <input placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, background: '#1e293b', border: 'none', color: '#fff' }} />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, background: '#1e293b', border: 'none', color: '#fff' }} />
                {authError && (
                    <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                        {authError}
                    </div>
                )}
                <button onClick={handleAuth} style={btnStyle}>Login to Dashboard</button>
                <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, marginTop: '16px', cursor: 'pointer' }}>Forgot Password? Reset Here</button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar (Same as Reference UI) */}
            <div style={{ width: '280px', background: '#fff', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f1f5f9' }}>
                <div style={{ padding: '24px', background: '#fff', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: '50px', height: '50px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="/bhaviksecurityLogo.png" alt="Bhavik Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{ color: '#1a1a1a', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>Bhavik</div>
                        <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Security Services</div>
                    </div>
                </div>
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'leads', label: 'Lead Station', icon: Users },
                        { id: 'messages', label: 'Messages', icon: MessageSquare },
                        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                        { id: 'content', label: 'Site Content', icon: FileText },
                        { id: 'services', label: 'Services', icon: Shield },
                        { id: 'attendance', label: 'Attendance', icon: Clock },
                        { id: 'guards', label: 'Personnel', icon: Shield },
                        { id: 'profile', label: 'My Profile', icon: UserIcon },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === item.id ? '#fef2f2' : 'transparent', color: activeTab === item.id ? '#1e293b' : '#64748b', fontWeight: 700 }}>
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: '24px' }}><button onClick={() => signOut(auth)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: 700 }}>Sign Out</button></div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                 {/* Top Header */}
                 <header style={{ height: '80px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '10px 20px', borderRadius: '14px', width: '350px' }}>
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search data, personnel..." style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '0.9rem', fontWeight: 600 }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', position: 'relative' }}
                            >
                                <Bell size={22} />
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '2px 5px', borderRadius: '10px', border: '2px solid #fff' }}>
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{ position: 'absolute', top: '40px', right: '0', width: '320px', background: '#fff', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', overflow: 'hidden', padding: '10px 0' }}>
                                    <div style={{ padding: '10px 20px', fontWeight: 800, fontSize: '0.9rem', borderBottom: '1px solid #f8fafc' }}>Notifications</div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notifications.length > 0 ? notifications.map(n => (
                                            <div key={n.id} onClick={() => { setActiveTab('messages'); setShowNotifications(false); }} style={{ padding: '15px 20px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: '0.2s' }} className="hover-bg">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '36px', height: '36px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <MessageSquare size={16} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>New Message</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.text}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No new notifications</div>
                                        )}
                                    </div>
                                    <button onClick={() => { setActiveTab('messages'); setShowNotifications(false); }} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>View All Messages</button>
                                </div>
                            )}
                        </div>

                        {/* Profile Summary */}
                        <div onClick={() => setActiveTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #f1f5f9', paddingLeft: '24px', cursor: 'pointer' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{adminData.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{adminData.role}</div>
                            </div>
                            <div style={{ width: '45px', height: '45px', borderRadius: '14px', border: '2px solid #f1f5f9', overflow: 'hidden', background: '#f8fafc' }}>
                                <img src={adminData.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                 </header>

                 <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>
                                {activeTab === 'overview' ? 'Overview Dashboard' : 
                                 activeTab === 'profile' ? 'My Profile' :
                                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h1>
                            <p style={{ color: '#64748b' }}>
                                {activeTab === 'overview' ? `Welcome back, ${adminData.name}! Here's your real-time data.` : 
                                 activeTab === 'profile' ? 'View and update your personal information.' : 
                                 `Manage your ${activeTab} and operational data.`}
                            </p>
                        </div>
                    </div>

                 {activeTab === 'overview' ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div><h3 style={{ fontWeight: 800 }}>Lead Analytics</h3><p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Live updates for {timeFilter}</p></div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(t => (
                                        <button key={t} onClick={() => setTimeFilter(t as TimeFilter)} style={{ padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, borderRadius: '6px', border: 'none', background: timeFilter === t ? '#1e293b' : 'transparent', color: timeFilter === t ? '#fff' : '#94a3b8', cursor: 'pointer' }}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '40px', minHeight: '180px' }}>
                                <div><h2 style={{ fontSize: '3rem', fontWeight: 900 }}>{stats.count}</h2><p style={{ color: '#64748b', fontWeight: 600 }}>New Inquiries</p></div>
                                <div style={{ flex: 1, position: 'relative', height: '140px' }}>
                                    <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                        <path d={stats.path} fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                                        <path d={`${stats.path} V100 H0 Z`} fill="url(#chartGrad)" opacity="0.1" />
                                        <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                            <div style={{ ...gridCard, background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}><p>Total Leads</p><h3>{stats.total}</h3></div>
                            <div style={{ ...gridCard, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}><p>Current {timeFilter}</p><h3>{stats.count}</h3></div>
                            <div style={{ ...gridCard, background: 'linear-gradient(135deg, #22d3ee, #0891b2)' }}><p>Lead Status</p><h3>Active</h3></div>
                            <div style={{ ...gridCard, background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}><p>Security Room</p><h3>Verified</h3></div>
                        </div>
                     </div>
                 ) : (
                      activeTab === 'leads' ? <LeadsTab /> : 
                      activeTab === 'messages' ? <MessagesTab /> : 
                      activeTab === 'gallery' ? <GalleryTab /> : 
                      activeTab === 'content' ? <ContentTab /> : 
                      activeTab === 'services' ? <ServicesTab /> : 
                      activeTab === 'attendance' ? <AttendanceTab /> : 
                      activeTab === 'guards' ? <GuardsTab /> : 
                      activeTab === 'profile' ? <ProfileTab /> : 
                      null
                 )}
            </div>
            <style jsx>{`
                .hover-bg:hover { background: #f8fafc; }
            `}</style>
        </div>
    </div>
    );
};

const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', marginBottom: '16px', outline: 'none', fontWeight: 600 };
const btnStyle = { width: '100%', padding: '16px', borderRadius: '14px', background: '#1e293b', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(30, 41, 59, 0.2)' };
const gridCard = { padding: '28px', borderRadius: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' };

export default AdminPage;
