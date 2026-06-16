'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const ICON_OPTIONS = [
  'Shield', 'Users', 'Zap', 'Calendar', 'Briefcase', 'Eye', 'Lock', 'Star',
  'Building', 'AlertTriangle', 'Award', 'CheckCircle', 'Clock', 'Globe', 'Heart', 'Key',
];

const DEFAULTS: Omit<Service, 'id'>[] = [
  { title: 'Industrial Security', description: 'Trained guards for factories and industrial zones.', icon: 'Shield', order: 1 },
  { title: 'Security Guards', description: 'Professional uniformed security guards for all premises.', icon: 'Users', order: 2 },
  { title: 'Gunman', description: 'Licensed armed security for high-level protection needs.', icon: 'Zap', order: 3 },
  { title: 'Bouncers', description: 'Experienced bouncers for clubs, events and venues.', icon: 'Briefcase', order: 4 },
  { title: 'Event Security', description: 'Complete security planning for all types of events.', icon: 'Calendar', order: 5 },
  { title: 'Corporate Security', description: 'Professional security for corporate offices and campuses.', icon: 'Building', order: 6 },
];

const EMPTY: Omit<Service, 'id'> = { title: '', description: '', icon: 'Shield', order: 99 };

const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', background: '#fafafa' };

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY);
  const [editForm, setEditForm] = useState<Omit<Service, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'services'), orderBy('order', 'asc'), limit(50)));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Service[];
      setServices(data.length ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleAdd = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'services'), { ...form, order: services.length + 1, createdAt: serverTimestamp() });
      setForm(EMPTY);
      setAdding(false);
      load();
    } catch { alert('Failed to add service.'); }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.title) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'services', editingId), { ...editForm });
      setEditingId(null);
      load();
    } catch { alert('Failed to update.'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await deleteDoc(doc(db, 'services', id));
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const seedDefaults = async () => {
    if (!confirm('This will add the default 6 services. Continue?')) return;
    setSaving(true);
    for (const s of DEFAULTS) await addDoc(collection(db, 'services'), { ...s, createdAt: serverTimestamp() });
    load();
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading services...</div>;

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div><h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Services Manager</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{services.length} service(s) on website</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {services.length === 0 && <button onClick={seedDefaults} disabled={saving} style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Load Defaults</button>}
          <button onClick={() => setAdding(!adding)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: adding ? '#e2e8f0' : '#1e293b', color: adding ? '#374151' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
            {adding ? <X size={15} /> : <Plus size={15} />} {adding ? 'Cancel' : 'Add Service'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {adding && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '2px dashed #1e293b', padding: '20px', marginBottom: '16px' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '14px', color: '#1e293b' }}>New Service</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Title *</label>
              <input style={{ ...inputStyle, marginTop: '5px' }} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Service name" />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Icon</label>
              <select style={{ ...inputStyle, marginTop: '5px' }} value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}>
                {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} disabled={saving || !form.title} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />} Save
            </button>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'none', height: '65px', marginTop: '5px' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this service" />
          </div>
        </div>
      )}

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {services.map((svc, idx) => (
          <div key={svc.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
            {editingId === svc.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Title</label>
                    <input style={{ ...inputStyle, marginTop: '4px' }} value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Icon</label>
                    <select style={{ ...inputStyle, marginTop: '4px' }} value={editForm.icon} onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))}>
                      {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select></div>
                </div>
                <div style={{ marginBottom: '10px' }}><label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Description</label>
                  <textarea style={{ ...inputStyle, resize: 'none', height: '60px', marginTop: '4px' }} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveEdit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><Save size={13} /> Save</button>
                  <button onClick={() => setEditingId(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#fff3eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e293b', fontSize: '0.8rem' }}>{idx + 1}</div>
                  <div><div style={{ fontWeight: 700, color: '#0f172a' }}>{svc.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>{svc.description || 'No description'}</div></div>
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <span style={{ padding: '4px 9px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>{svc.icon}</span>
                  <button onClick={() => { setEditingId(svc.id); setEditForm({ title: svc.title, description: svc.description, icon: svc.icon, order: svc.order }); }} style={{ background: '#e0f2fe', border: 'none', padding: '7px 9px', borderRadius: '7px', cursor: 'pointer' }}><Edit2 size={14} color="#0284c7" /></button>
                  <button onClick={() => handleDelete(svc.id)} style={{ background: '#fee2e2', border: 'none', padding: '7px 9px', borderRadius: '7px', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && !adding && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
            No services yet. Click &quot;Add Service&quot; or &quot;Load Defaults&quot; to get started.
          </div>
        )}
      </div>
      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
