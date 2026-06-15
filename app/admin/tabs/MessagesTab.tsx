'use client';
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  limit, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { User, Send, Search, MessageSquare, Loader2, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'admin' | 'user';
  timestamp: any;
}

interface ChatSession {
  id: string;
  lastMessage?: string;
  updatedAt?: any;
}

export default function MessagesTab() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load all active chat threads
  useEffect(() => {
    const q = query(collection(db, 'chats'), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      const chatList = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ChatSession[];
      setChats(chatList);
      setLoading(false);
    }, (error) => {
      console.warn("Messages List Listener Error (Permission?):", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
      collection(db, 'chats', selectedChat, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ChatMessage[]);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }, (error) => {
      console.error("Messages Listener Error:", error);
    });
    return () => unsubscribe();
  }, [selectedChat]);

  const sendResponse = async () => {
    if (!message.trim() || !selectedChat) return;
    const text = message;
    setMessage('');
    try {
      await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
        text,
        sender: 'admin',
        timestamp: serverTimestamp(),
      });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading messages...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 250px)', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      {/* Chats Sidebar */}
      <div style={{ width: '320px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>Inbox</h3>
          <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search chats..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChat(c.id)}
              style={{
                width: '100%', padding: '20px', display: 'flex', gap: '15px', border: 'none', background: selectedChat === c.id ? '#f1f5f9' : 'transparent',
                cursor: 'pointer', transition: '0.2s', borderBottom: '1px solid #f8fafc', textAlign: 'left'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#64748b" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>User #{c.id.slice(0, 5)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.id === selectedChat ? 'Active Conversation' : 'Started a conversation'}
                </div>
              </div>
            </button>
          ))}
          {chats.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No conversations yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fcfcfc' }}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div style={{ padding: '20px 32px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>User Session: {selectedChat}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div> Online
                    </div>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((m) => (
                <div key={m.id} style={{
                  alignSelf: m.sender === 'admin' ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'admin' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    background: m.sender === 'admin' ? '#0f172a' : '#fff',
                    color: m.sender === 'admin' ? '#fff' : '#0f172a',
                    padding: '12px 20px',
                    borderRadius: m.sender === 'admin' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    fontSize: '0.95rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    border: m.sender === 'admin' ? 'none' : '1px solid #e2e8f0',
                    lineHeight: '1.5'
                  }}>
                    {m.text}
                  </div>
                  {m.timestamp && (
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                      {new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '32px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
               <div style={{ background: '#f8fafc', padding: '12px 20px', borderRadius: '16px', display: 'flex', gap: '15px' }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendResponse()}
                    placeholder="Type your response..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '1rem' }}
                  />
                  <button onClick={sendResponse} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Send <Send size={16} />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <MessageSquare size={40} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>Select a conversation to start chatting</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Messages from website visitors will appear here in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
