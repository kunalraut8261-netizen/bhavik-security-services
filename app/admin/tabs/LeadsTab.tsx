'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Trash2, CheckCircle, Clock, Search, BarChart3, Phone, Mail } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: Timestamp;
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all');

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Lead[]);
      setLoading(false);
    }, (error) => {
      console.error("Leads Listener Error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'leads', id), { status: status === 'new' ? 'contacted' : 'new' });
  };

  const deleteLead = async (id: string) => {
    if (confirm('Delete this inquiry?')) await deleteDoc(doc(db, 'leads', id));
  };

  const filtered = leads.filter(l => {
    const s = searchTerm.toLowerCase();
    const match = l.name.toLowerCase().includes(s) || l.email.toLowerCase().includes(s) || (l.subject || '').toLowerCase().includes(s);
    return match && (filter === 'all' || l.status === filter);
  });

  const stats = { total: leads.length, new: leads.filter(l => l.status === 'new').length, contacted: leads.filter(l => l.status === 'contacted').length };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading leads...</div>;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[{ label: 'Total', value: stats.total, icon: <BarChart3 size={20} color="#3b82f6" />, bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'New', value: stats.new, icon: <Clock size={20} color="#d97706" />, bg: '#fef3c7', color: '#d97706' },
          { label: 'Contacted', value: stats.contacted, icon: <CheckCircle size={20} color="#059669" />, bg: '#d1fae5', color: '#059669' }
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }} />
        </div>
        {(['all', 'new', 'contacted'] as const).map(opt => (
          <button key={opt} onClick={() => setFilter(opt)}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: filter === opt ? '#0f172a' : '#fff', color: filter === opt ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
            {opt}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              {['CLIENT', 'SERVICE / MESSAGE', 'DATE', 'STATUS', 'ACTIONS'].map((h, i) => (
                <th key={h} style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> {lead.email}</div>
                  {lead.phone && <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={11} /> {lead.phone}</div>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '3px', fontSize: '0.9rem' }}>{lead.subject || 'General Inquiry'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.message}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#64748b' }}>
                  {lead.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) || 'Recently'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: lead.status === 'new' ? '#fef3c7' : '#d1fae5', color: lead.status === 'new' ? '#d97706' : '#059669' }}>
                    {lead.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {lead.phone && (
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}`} target="_blank" rel="noopener noreferrer"
                        style={{ background: '#dcfce7', padding: '7px 9px', borderRadius: '6px', color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="WhatsApp">
                        <Phone size={15} />
                      </a>
                    )}
                    <a href={`mailto:${lead.email}?subject=Re: Your Security Inquiry`}
                      style={{ background: '#e0f2fe', padding: '7px 9px', borderRadius: '6px', color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center' }} title="Email">
                      <Mail size={15} />
                    </a>
                    <button onClick={() => toggleStatus(lead.id, lead.status)} title="Toggle Status"
                      style={{ background: '#f1f5f9', border: 'none', padding: '7px 9px', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
                      {lead.status === 'new' ? <CheckCircle size={15} /> : <Clock size={15} />}
                    </button>
                    <button onClick={() => deleteLead(lead.id)} title="Delete"
                      style={{ background: '#fee2e2', border: 'none', padding: '7px 9px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>No matching inquiries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
