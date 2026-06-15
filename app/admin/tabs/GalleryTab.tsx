'use client';
import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, Trash2, Loader2, Image as ImageIcon, Edit2, Save, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  storagePath?: string;
  type: 'banner' | 'gallery' | 'logo';
  createdAt?: unknown;
}

export default function GalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [uploadType, setUploadType] = useState<'gallery' | 'banner' | 'logo'>('gallery');
  const [newCaption, setNewCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GalleryItem[]);
      setLoading(false);
    }, (err) => {
      console.error("Gallery Sync Error:", err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    setUploading(true);
    setUploadProgress(0);

    try {
      const path = `gallery/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, path);
      
      console.log("Target Storage Path:", path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
          console.log(`Upload progress: ${Math.round(progress)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
        }, 
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          setUploading(false);
          setUploadProgress(0);
          
          let alertMsg = `Upload failed: ${error.message}`;
          if (error.code === 'storage/retry-limit-exceeded') {
            alertMsg = "🚨 STORAGE ERROR: Max retry time exceeded.\n\nThis is usually caused by CORS issues on localhost. Please run the 'gsutil' command provided in our troubleshooting guide to allow localhost uploads.";
          }
          alert(alertMsg + `\n\nCode: ${error.code}`);
        }, 
        async () => {
          console.log("Upload successful! Getting download URL...");
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL obtained:", url);
            
            await addDoc(collection(db, 'gallery'), {
              imageUrl: url,
              caption: newCaption || file.name.split('.')[0],
              storagePath: path,
              type: uploadType,
              createdAt: serverTimestamp(),
            });
            
            console.log("Firestore entry created successfully.");
            setNewCaption('');
            if (fileRef.current) fileRef.current.value = '';
          } catch (err: any) {
            console.error("Post-upload Firestore Error:", err);
            alert('Image was uploaded, but the database record failed: ' + err.message);
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (err: any) {
      console.error("Critical Upload Initiation Error:", err);
      alert('Could not start upload: ' + (err.message || 'Unknown error.'));
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm('Delete this image?')) return;
    try {
      if (item.storagePath) {
        try { await deleteObject(ref(storage, item.storagePath)); } catch {}
      }
      await deleteDoc(doc(db, 'gallery', item.id));
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch { alert('Delete failed.'); }
  };

  const saveCaption = async (id: string) => {
    await updateDoc(doc(db, 'gallery', id), { caption: editCaption });
    setItems(prev => prev.map(i => i.id === id ? { ...i, caption: editCaption } : i));
    setEditingId(null);
  };

  const tagColors: Record<string, string> = { banner: '#dbeafe', gallery: '#fef9c3', logo: '#fce7f3' };
  const tagText: Record<string, string> = { banner: '#1d4ed8', gallery: '#a16207', logo: '#be185d' };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading gallery...</div>;

  return (
    <div>
      {/* Upload Section */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '1rem' }}>📤 Upload New Image</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image Caption / Alt Text</label>
            <input type="text" value={newCaption} onChange={e => setNewCaption(e.target.value)} placeholder="e.g. Team at work, Event security..." style={{ width: '100%', marginTop: '6px', padding: '11px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#fafafa' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image Type</label>
            <select value={uploadType} onChange={e => setUploadType(e.target.value as typeof uploadType)} style={{ width: '100%', marginTop: '6px', padding: '11px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: '#fafafa' }}>
              <option value="gallery">Gallery Image</option>
              <option value="banner">Hero Banner</option>
              <option value="logo">Logo</option>
            </select>
          </div>
          <div>
            <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
              {uploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Choose & Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '160px', background: '#f1f5f9' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: '8px', left: '8px', background: tagColors[item.type] || '#f1f5f9', color: tagText[item.type] || '#374151', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>{item.type}</span>
            </div>
            <div style={{ padding: '12px' }}>
              {editingId === item.id ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input value={editCaption} onChange={e => setEditCaption(e.target.value)} autoFocus style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }} />
                  <button onClick={() => saveCaption(item.id)} style={{ background: '#059669', border: 'none', borderRadius: '6px', padding: '7px 9px', cursor: 'pointer', color: '#fff' }}><Save size={13} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '7px 9px', cursor: 'pointer' }}><X size={13} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption}</p>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => { setEditingId(item.id); setEditCaption(item.caption); }} style={{ background: '#e0f2fe', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}><Edit2 size={13} color="#0284c7" /></button>
                    <button onClick={() => handleDelete(item)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}><Trash2 size={13} color="#dc2626" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
            <ImageIcon size={40} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
            <p>No images uploaded yet. Upload your first image above.</p>
          </div>
        )}
      </div>
      <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
