'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { Search, Shield, MapPin, CheckCircle, Clock, XCircle, FileText, Phone, Filter, Briefcase, Smartphone, Copy } from 'lucide-react';

interface Guard {
    id: string;
    name: string;
    registrationId: string;
    status: 'Verified' | 'Verification Pending' | 'Suspended';
    role: string;
    assignedSite?: string;
    phone: string;
    aadhaarUrl?: string;
    createdAt?: unknown;
}

const GuardsTab = () => {
    const [guards, setGuards] = useState<Guard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [limitCount, setLimitCount] = useState(50);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'guards'), orderBy('createdAt', 'desc'), limit(limitCount));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Guard[];
            setGuards(data);
            setLoading(false);
            if (snap.docs.length < limitCount) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        }, (error) => {
            console.error("Guards Listener Error:", error);
            setLoading(false);
        });
        return unsub;
    }, [limitCount]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'guards', id), {
                status: newStatus
            });
            alert('Status updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update status.');
        }
    };

    const filteredGuards = guards.filter(guard => {
        const matchesSearch = 
            guard.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            guard.registrationId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guard.assignedSite?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || guard.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading personnel data...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Security Personnel</h2>
                    <p style={{ color: '#64748b' }}>Manage guards, bouncers, and digital identities.</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', background: '#fff', padding: '16px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                        placeholder="Search by Name, Reg ID, or Site..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600 }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                    <Filter size={18} color="#94a3b8" />
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Verified">Verified</option>
                        <option value="Verification Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Guard List */}
            <div style={{ display: 'grid', gap: '20px' }}>
                {filteredGuards.map(guard => (
                    <div key={guard.id} style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={28} color="#1e293b" />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{guard.name}</h3>
                                <span style={{ background: '#fef2f2', color: '#1e293b', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                                    {guard.registrationId}
                                </span>
                                <span style={{ background: guard.status === 'Verified' ? '#ecfdf5' : guard.status === 'Verification Pending' ? '#fff7ed' : '#fef2f2', color: guard.status === 'Verified' ? '#10b981' : guard.status === 'Verification Pending' ? '#f97316' : '#ef4444', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {guard.status === 'Verified' ? <CheckCircle size={12} /> : guard.status === 'Verification Pending' ? <Clock size={12} /> : <XCircle size={12} />}
                                    {guard.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> {guard.role}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {guard.assignedSite || 'Unassigned'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> +91 {guard.phone}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {guard.aadhaarUrl && (
                                    <button 
                                        onClick={() => window.open(guard.aadhaarUrl, '_blank')}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                        title="View Aadhaar"
                                    >
                                        <FileText size={16} color="#3b82f6" />
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => window.open(`/id/${guard.registrationId}`, '_blank')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                    title="View Digital ID"
                                >
                                    <Smartphone size={16} color="#ea580c" />
                                </button>

                                <button 
                                    onClick={() => {
                                        const url = `${window.location.origin}/id/${guard.registrationId}`;
                                        navigator.clipboard.writeText(url);
                                        alert('Digital ID link copied to clipboard!');
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                    title="Copy ID Link"
                                >
                                    <Copy size={16} color="#64748b" />
                                </button>
                            </div>

                            {guard.status !== 'Verified' && (
                                <button 
                                    onClick={() => handleUpdateStatus(guard.id, 'Verified')}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#10b981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.2)' }}
                                >
                                    <CheckCircle size={16} /> Verify Now
                                </button>
                            )}
                            
                            {guard.status === 'Verified' && (
                                <button 
                                    onClick={() => handleUpdateStatus(guard.id, 'Suspended')}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#fee2e2', border: 'none', borderRadius: '10px', color: '#ef4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    <XCircle size={16} /> Suspend ID
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredGuards.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, background: '#fff', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                        No personnel found matching your criteria.
                    </div>
                )}
            </div>

            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                        onClick={() => setLimitCount(prev => prev + 50)}
                        style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: '#0f172a',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                    >
                        Load More Personnel
                    </button>
                </div>
            )}
        </div>
    );
};

export default GuardsTab;
