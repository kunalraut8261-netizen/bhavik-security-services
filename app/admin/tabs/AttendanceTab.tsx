'use client';
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Search, MapPin, Calendar, Clock, LogIn, LogOut, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AttendanceLog {
    id: string;
    name: string;
    registrationId: string;
    site: string;
    type: 'IN' | 'OUT';
    timestamp: any; // Keep any for safety with Firestore timestamps or handle specifically
    dateLabel: string;
}

const AttendanceTab = () => {
    const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [siteFilter, setSiteFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // QR Code generation state
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrSite, setQrSite] = useState('');
    const [serverIp, setServerIp] = useState('192.168.1.101'); // Default detected dev IP

    useEffect(() => {
        const q = query(
            collection(db, 'attendance'),
            where('dateLabel', '==', dateFilter)
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AttendanceLog[];
            // Manual sort because composed query without composite index requires it be manual or single
            data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setAttendanceLogs(data);
            setLoading(false);
        }, (error) => {
            console.error("Attendance Listener Error:", error);
            setLoading(false);
        });
        return unsub;
    }, [dateFilter]);

    // Derived unique sites from historical attendance or predefined (using extracted logs)
    const uniqueSites = Array.from(new Set(attendanceLogs.map(log => log.site).filter(s => typeof s === 'string' && s.trim() !== '')));

    const filteredLogs = attendanceLogs.filter(log => {
        const safeName = String(log.name || '').toLowerCase();
        const safeId = String(log.registrationId || '').toLowerCase();
        const searchLower = String(searchQuery || '').toLowerCase();
        
        const matchesSearch = safeName.includes(searchLower) || safeId.includes(searchLower);
        const matchesSite = siteFilter ? log.site === siteFilter : true;
        return matchesSearch && matchesSite;
    });

    const markInCount = filteredLogs.filter(log => log.type === 'IN').length;
    const markOutCount = filteredLogs.filter(log => log.type === 'OUT').length;

    const downloadQr = () => {
        const svg = document.getElementById('site-qr-code');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QR_${qrSite || 'Site'}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header & QR Builder Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Attendance Logs</h2>
                    <p style={{ color: '#64748b' }}>Monitor site-wise daily attendance.</p>
                </div>
                <button 
                    onClick={() => setShowQrModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(30, 41, 59,0.2)' }}
                >
                    <QrCode size={18} /> Generate Site QR
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogIn size={24} /></div>
                        <div><p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Mark IN Today</p><h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{markInCount}</h3></div>
                    </div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={24} /></div>
                        <div><p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Mark OUT Today</p><h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{markOutCount}</h3></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#fff', padding: '16px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                    <Calendar size={18} color="#94a3b8" />
                    <input 
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0f172a' }}
                    />
                </div>
                
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                    <MapPin size={18} color="#94a3b8" />
                    <select 
                        value={siteFilter}
                        onChange={e => setSiteFilter(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                    >
                        <option value="">All Sites</option>
                        {uniqueSites.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                        placeholder="Search by Guard Name or ID..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600 }}
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <th style={{ padding: '20px 24px', fontWeight: 800 }}>Time</th>
                            <th style={{ padding: '20px 24px', fontWeight: 800 }}>Guard Details</th>
                            <th style={{ padding: '20px 24px', fontWeight: 800 }}>Site Location</th>
                            <th style={{ padding: '20px 24px', fontWeight: 800 }}>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Data...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No attendance records found for this date.</td></tr>
                        ) : (
                            filteredLogs.map(log => {
                                let time = '--:--';
                                try {
                                    if (log.timestamp && typeof log.timestamp.seconds === 'number') {
                                        time = new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    } else if (log.timestamp && typeof log.timestamp === 'string') {
                                        time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    } else if (log.timestamp && typeof log.timestamp.toMillis === 'function') {
                                        time = new Date(log.timestamp.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    }
                                } catch(e) {
                                    console.error("Invalid time format for log", log.id);
                                }
                                return (
                                    <tr key={log.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px 24px', fontWeight: 700, color: '#0f172a' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} color="#94a3b8" /> {time}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{log.name}</div>
                                            <div style={{ color: '#1e293b', fontSize: '0.75rem', fontWeight: 800 }}>{log.registrationId}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px', color: '#475569', fontWeight: 600 }}>{log.site}</td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ background: log.type === 'IN' ? '#ecfdf5' : '#fef2f2', color: log.type === 'IN' ? '#10b981' : '#ef4444', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                {log.type === 'IN' ? <LogIn size={14} /> : <LogOut size={14} />} {log.type}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* QR Gen Modal */}
            {showQrModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '32px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Site QR Builder</h3>
                            <button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Site Name</p>
                                <input 
                                    placeholder="e.g. Nexus Mall" 
                                    value={qrSite}
                                    onChange={e => setQrSite(e.target.value)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                                />
                            </div>
                            <div style={{ width: '140px' }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Server IP</p>
                                <input 
                                    placeholder="192.168..." 
                                    value={serverIp}
                                    onChange={e => setServerIp(e.target.value)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {qrSite ? (
                            <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '24px', marginBottom: '24px' }}>
                                <div style={{ background: '#fff', display: 'inline-block', padding: '16px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <QRCodeSVG 
                                        id="site-qr-code" 
                                        value={`http://${serverIp}:3000/attendance?site=${encodeURIComponent(qrSite)}`} 
                                        size={200} 
                                        level={"H"} 
                                        includeMargin={false} 
                                    />
                                </div>
                                <p style={{ marginTop: '16px', fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>Scan to Mark Attendance at <br/><span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 900 }}>{qrSite}</span></p>
                            </div>
                        ) : (
                            <div style={{ height: '200px', background: '#f8fafc', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '2px dashed #cbd5e1', color: '#94a3b8', fontWeight: 600 }}>
                                Enter Site Name to Preview QR
                            </div>
                        )}

                        <button 
                            disabled={!qrSite}
                            onClick={downloadQr}
                            style={{ width: '100%', padding: '16px', background: qrSite ? '#1e293b' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', cursor: qrSite ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Download size={20} /> Download QR Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceTab;
