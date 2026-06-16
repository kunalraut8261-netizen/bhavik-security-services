'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem { id: string; question: string; answer: string; order: number; }
interface Testimonial { id: string; name: string; role: string; testimonial: string; rating: number; }

const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', background: '#fafafa' };
const labelStyle = { fontSize: '0.72rem', fontWeight: 700 as const, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block' as const, marginBottom: '5px' };

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(s => <button key={s} type="button" onClick={() => onChange(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: s <= value ? '#f59e0b' : '#d1d5db', padding: '0' }}>★</button>)}
  </div>
);

// ====== FAQ TAB ======
export function FaqsTab() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [editForm, setEditForm] = useState({ question: '', answer: '' });
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'faqs'), orderBy('order', 'asc'), limit(50)));
      setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() })) as FaqItem[]);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleAdd = async () => {
    if (!form.question || !form.answer) return;
    await addDoc(collection(db, 'faqs'), { ...form, order: faqs.length + 1, createdAt: serverTimestamp() });
    setForm({ question: '', answer: '' }); setAdding(false); load();
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    await updateDoc(doc(db, 'faqs', editId), editForm);
    setEditId(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await deleteDoc(doc(db, 'faqs', id));
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading FAQs...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div><h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>FAQ Manager</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{faqs.length} question(s)</p>
        </div>
        <button onClick={() => setAdding(!adding)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: adding ? '#e2e8f0' : '#1e293b', color: adding ? '#374151' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          {adding ? <X size={15} /> : <Plus size={15} />} {adding ? 'Cancel' : 'Add FAQ'}
        </button>
      </div>

      {adding && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '2px dashed #1e293b', padding: '20px', marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Question *</label><input style={inputStyle} value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Enter the question..." /></div>
          <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Answer *</label><textarea style={{ ...inputStyle, resize: 'none', height: '80px' }} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} placeholder="Enter the answer..." /></div>
          <button onClick={handleAdd} disabled={!form.question || !form.answer} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><Save size={14} /> Add FAQ</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map(faq => (
          <div key={faq.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {editId === faq.id ? (
              <div style={{ padding: '16px 20px' }}>
                <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Question</label><input style={inputStyle} value={editForm.question} onChange={e => setEditForm(p => ({ ...p, question: e.target.value }))} /></div>
                <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Answer</label><textarea style={{ ...inputStyle, resize: 'none', height: '75px' }} value={editForm.answer} onChange={e => setEditForm(p => ({ ...p, answer: e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', background: '#059669', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><Save size={13} /> Save</button>
                  <button onClick={() => setEditId(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 13px', background: '#f1f5f9', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', flex: 1, marginRight: '16px' }}>{faq.question}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); setEditId(faq.id); setEditForm({ question: faq.question, answer: faq.answer }); }} style={{ background: '#e0f2fe', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}><Edit2 size={13} color="#0284c7" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(faq.id); }} style={{ background: '#fee2e2', border: 'none', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={13} color="#dc2626" /></button>
                    {expanded === faq.id ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </div>
                </div>
                {expanded === faq.id && <div style={{ padding: '0 20px 16px', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', borderTop: '1px solid #f1f5f9' }}>{faq.answer}</div>}
              </div>
            )}
          </div>
        ))}
        {faqs.length === 0 && !adding && <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>No FAQs yet. Click &quot;Add FAQ&quot; to get started.</div>}
      </div>
    </div>
  );
}

// ====== TESTIMONIALS TAB ======
export function TestimonialsTab() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const EMPTY = { name: '', role: '', testimonial: '', rating: 5 };
  const [form, setForm] = useState(EMPTY);
  const [editForm, setEditForm] = useState(EMPTY);

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(50)));
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Testimonial[]);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.testimonial) return;
    await addDoc(collection(db, 'testimonials'), { ...form, createdAt: serverTimestamp() });
    setForm(EMPTY); setAdding(false); load();
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    await updateDoc(doc(db, 'testimonials', editId), editForm);
    setEditId(null); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await deleteDoc(doc(db, 'testimonials', id));
    setList(prev => prev.filter(t => t.id !== id));
  };


  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading testimonials...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div><h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Testimonials Manager</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{list.length} testimonial(s)</p>
        </div>
        <button onClick={() => setAdding(!adding)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: adding ? '#e2e8f0' : '#1e293b', color: adding ? '#374151' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          {adding ? <X size={15} /> : <Plus size={15} />} {adding ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      {adding && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '2px dashed #1e293b', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div><label style={labelStyle}>Client Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rajesh Malhotra" /></div>
            <div><label style={labelStyle}>Role / Company</label><input style={inputStyle} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Factory Owner, Palghar" /></div>
          </div>
          <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Testimonial *</label><textarea style={{ ...inputStyle, resize: 'none', height: '75px' }} value={form.testimonial} onChange={e => setForm(p => ({ ...p, testimonial: e.target.value }))} placeholder="What the client said..." /></div>
          <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Rating</label><StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} /></div>
          <button onClick={handleAdd} disabled={!form.name || !form.testimonial} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><Save size={14} /> Add Testimonial</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {list.map(t => (
          <div key={t.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
            {editId === t.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><label style={labelStyle}>Name</label><input style={inputStyle} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Role</label><input style={inputStyle} value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} /></div>
                </div>
                <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Testimonial</label><textarea style={{ ...inputStyle, resize: 'none', height: '70px' }} value={editForm.testimonial} onChange={e => setEditForm(p => ({ ...p, testimonial: e.target.value }))} /></div>
                <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Rating</label><StarRating value={editForm.rating} onChange={v => setEditForm(p => ({ ...p, rating: v }))} /></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', background: '#059669', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><Save size={13} /> Save</button>
                  <button onClick={() => setEditId(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 13px', background: '#f1f5f9', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.role}</div>
                    <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>{'★'.repeat(t.rating || 5)}</div>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', fontStyle: 'italic' }}>&quot;{t.testimonial}&quot;</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => { setEditId(t.id); setEditForm({ name: t.name, role: t.role, testimonial: t.testimonial, rating: t.rating }); }} style={{ background: '#e0f2fe', border: 'none', padding: '7px 9px', borderRadius: '7px', cursor: 'pointer' }}><Edit2 size={14} color="#0284c7" /></button>
                  <button onClick={() => handleDelete(t.id)} style={{ background: '#fee2e2', border: 'none', padding: '7px 9px', borderRadius: '7px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && !adding && <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>No testimonials yet. Click &quot;Add Testimonial&quot; to get started.</div>}
      </div>
    </div>
  );
}
