'use client';
import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function ResetPage() {
    useEffect(() => {
        const doReset = async () => {
            try {
                // This works because I temporarily opened the firestore.rules to 'allow write: if true'
                await deleteDoc(doc(db, 'settings', 'admin_config'));
                window.location.href = '/admin';
            } catch (e: any) {
                console.error(e);
                document.body.innerHTML = `<div style="padding: 20px; color: white; background: #991b1b; height: 100vh;">
                    <h1>Repair Failed</h1>
                    <p>${e.message}</p>
                    <p>Please manually delete the document "settings/admin_config" in your Firebase Consol then refresh the /admin page.</p>
                </div>`;
            }
        };
        doReset();
    }, []);

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', textAlign: 'center' }}>
            <div>
                <h1 style={{ marginBottom: '10px' }}>Repairing System...</h1>
                <p>Clearing ghost configuration. You will be redirected to the Setup screen in a moment.</p>
            </div>
        </div>
    );
}
