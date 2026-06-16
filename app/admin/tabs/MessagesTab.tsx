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
  updateDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { User, Send, Search, MessageSquare, Bot, Shield } from 'lucide-react';

// Sender now includes 'ai'
interface ChatMessage {
  id: string;
  text: string;
  sender: 'admin' | 'user' | 'ai';
  timestamp?: { seconds?: number } | Date | string | null;
}

interface ChatSession {
  id: string;
  lastMessage?: string;
  updatedAt?: { seconds?: number } | Date | string | null;
  adminTookOver?: boolean;
}

export default function MessagesTab() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatData, setSelectedChatData] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAutoReply, setAiAutoReply] = useState(false);
  const [aiToggleLoading, setAiToggleLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatTime = (ts: unknown) => {
    if (!ts) return 'Just now';
    const t = ts as { seconds?: number } | Date | string;
    if (typeof t === 'object' && 'seconds' in t && typeof t.seconds === 'number') {
      return new Date(t.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (t instanceof Date) {
      return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    try {
      return new Date(t as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Load global AI auto-reply setting
  useEffect(() => {
    const unsubAi = onSnapshot(doc(db, 'settings', 'ai_config'), (snap) => {
      if (snap.exists()) {
        setAiAutoReply(snap.data().aiAutoReply === true);
      }
    }, (err) => console.warn('AI config listener:', err));
    return () => unsubAi();
  }, []);

  // Toggle global AI auto-reply
  const toggleAiAutoReply = async () => {
    setAiToggleLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'ai_config'), { aiAutoReply: !aiAutoReply }, { merge: true });
    } catch (err) {
      console.error('Failed to toggle AI auto-reply:', err);
    } finally {
      setAiToggleLoading(false);
    }
  };

  // Load all active chat threads
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      const chatList = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ChatSession[];
      setChats(chatList);
      setLoading(false);
      // Update selected chat data if it's currently open
      if (selectedChat) {
        const current = chatList.find(c => c.id === selectedChat);
        if (current) setSelectedChatData(current);
      }
    }, (error) => {
      console.warn('Messages List Listener Error (Permission?):', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedChat]);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const q = query(
      collection(db, 'chats', selectedChat, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as ChatMessage[]);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }, (error) => {
      console.error('Messages Listener Error:', error);
    });
    return () => unsubscribe();
  }, [selectedChat]);

  // When a chat is selected, fetch its metadata
  const handleSelectChat = async (chatId: string) => {
    setSelectedChat(chatId);
    try {
      const snap = await getDoc(doc(db, 'chats', chatId));
      if (snap.exists()) {
        setSelectedChatData({ id: chatId, ...snap.data() } as ChatSession);
      }
    } catch (err) {
      console.warn('Could not fetch chat data:', err);
    }
  };

  const sendResponse = async () => {
    if (!message.trim() || !selectedChat) return;
    const text = message;
    setMessage('');
    try {
      // Write admin message to Firestore
      await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
        text,
        sender: 'admin',
        timestamp: serverTimestamp(),
      });
      // Update last message + mark admin as having taken over (pauses AI)
      await updateDoc(doc(db, 'chats', selectedChat), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        adminTookOver: true,
      });
      setSelectedChatData(prev => prev ? { ...prev, adminTookOver: true } : prev);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  // Resume AI for this chat (clear adminTookOver)
  const resumeAi = async () => {
    if (!selectedChat) return;
    try {
      await updateDoc(doc(db, 'chats', selectedChat), { adminTookOver: false });
      setSelectedChatData(prev => prev ? { ...prev, adminTookOver: false } : prev);
    } catch (err) {
      console.error('Resume AI error:', err);
    }
  };

  // Sender badge styles
  const getSenderLabel = (sender: ChatMessage['sender']) => {
    if (sender === 'user') return { label: '👤 User', color: '#374151', bg: '#f1f5f9' };
    if (sender === 'admin') return { label: '🛡️ Admin', color: '#fff', bg: '#0f172a' };
    return { label: '🤖 AI Assistant', color: '#4c1d95', bg: '#ede9fe' };
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading messages...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── AI Auto Reply Toggle ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
        padding: '16px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: aiAutoReply ? '#ede9fe' : '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color={aiAutoReply ? '#7c3aed' : '#94a3b8'} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🤖 AI Auto Reply</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              {aiAutoReply
                ? 'AI is active — automatically replies to new visitor messages'
                : 'AI is off — only manual admin replies will be sent'}
            </div>
          </div>
        </div>
        {/* Toggle switch */}
        <button
          onClick={toggleAiAutoReply}
          disabled={aiToggleLoading}
          style={{
            width: '52px', height: '28px', borderRadius: '14px',
            background: aiAutoReply ? '#7c3aed' : '#d1d5db',
            border: 'none', cursor: aiToggleLoading ? 'not-allowed' : 'pointer',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}
          aria-label="Toggle AI Auto Reply"
        >
          <span style={{
            position: 'absolute', top: '3px',
            left: aiAutoReply ? '27px' : '3px',
            width: '22px', height: '22px',
            background: '#fff', borderRadius: '50%',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>

      {/* ── Chat Panel ── */}
      <div style={{ display: 'flex', height: 'calc(100vh - 320px)', minHeight: '500px', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {/* Chats Sidebar */}
        <div style={{ width: '320px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>Inbox</h3>
            <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats
              .filter(c => c.id.toLowerCase().includes(searchQuery.toLowerCase()) || (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase()))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectChat(c.id)}
                  style={{
                    width: '100%', padding: '20px', display: 'flex', gap: '15px',
                    border: 'none', background: selectedChat === c.id ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer', transition: '0.2s', borderBottom: '1px solid #f8fafc', textAlign: 'left',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={24} color="#64748b" />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>User #{c.id.slice(0, 5)}</span>
                      {c.adminTookOver
                        ? <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '10px' }}>Admin</span>
                        : <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '2px 7px', borderRadius: '10px' }}>AI</span>
                      }
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.lastMessage || (c.id === selectedChat ? 'Active Conversation' : 'Started a conversation')}
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
              <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>User Session: {selectedChat.slice(0, 8)}…</div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div> Online
                    </div>
                  </div>
                </div>

                {/* AI/Admin mode badge + Resume AI button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedChatData?.adminTookOver ? (
                    <>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', background: '#f1f5f9', padding: '5px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        🛡️ Admin Mode
                      </span>
                      {aiAutoReply && (
                        <button
                          onClick={resumeAi}
                          style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', border: '1px solid #c4b5fd', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', transition: 'opacity 0.2s' }}
                          onMouseOver={e => (e.currentTarget.style.opacity = '0.8')}
                          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                        >
                          ↩ Resume AI
                        </button>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '5px 12px', borderRadius: '20px', border: '1px solid #c4b5fd' }}>
                      🤖 AI Active
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  const isAi = m.sender === 'ai';
                  const senderInfo = getSenderLabel(m.sender);

                  return (
                    <div key={m.id} style={{
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-end' : 'flex-start',
                      gap: '5px',
                    }}>
                      {/* Sender label badge */}
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800,
                        color: senderInfo.color,
                        background: senderInfo.bg,
                        padding: '2px 8px', borderRadius: '10px',
                        border: isAi ? '1px solid #c4b5fd' : isAdmin ? '1px solid #334155' : '1px solid #e2e8f0',
                      }}>
                        {senderInfo.label}
                      </span>

                      {/* Message bubble */}
                      <div style={{
                        background: isAdmin ? '#0f172a' : isAi ? '#ede9fe' : '#fff',
                        color: isAdmin ? '#fff' : isAi ? '#4c1d95' : '#0f172a',
                        padding: '12px 20px',
                        borderRadius: isAdmin ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        border: isAdmin ? 'none' : isAi ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
                        lineHeight: '1.5',
                      }}>
                        {m.text}
                      </div>

                      {/* Timestamp */}
                      {m.timestamp && (
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {formatTime(m.timestamp)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div style={{ padding: '24px 32px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ background: '#f8fafc', padding: '12px 20px', borderRadius: '16px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendResponse()}
                    placeholder="Type your response… (sends as Admin, pauses AI)"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem' }}
                  />
                  <button
                    onClick={sendResponse}
                    style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    Send <Send size={16} />
                  </button>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
                  Sending a message will set this chat to <strong>Admin Mode</strong> and pause AI replies.
                </p>
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
    </div>
  );
}
