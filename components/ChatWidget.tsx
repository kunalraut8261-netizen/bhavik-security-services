'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  limit,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { isThrottled, recordAction } from '@/lib/rateLimit';

// Sender now includes 'ai' for AI assistant messages
interface MessageItem {
  id: string;
  text: string;
  sender: 'user' | 'admin' | 'ai';
  timestamp: { seconds: number; nanoseconds: number } | Date | null;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize client session ID (hydration-safe lazy initialization)
  const [chatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const localId = localStorage.getItem('bhavik_chat_id') || 'user_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('bhavik_chat_id', localId);
      return localId;
    }
    return null;
  });

  // Listen for messages in real-time
  useEffect(() => {
    if (!chatId || !isOpen) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MessageItem[];
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }, (error) => {
      console.warn('Chat Listener Info (using client fallback):', error.message);
    });

    return () => unsubscribe();
  }, [chatId, isOpen]);

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (isAiTyping) {
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }
  }, [isAiTyping]);

  const triggerAiReply = async (userText: string) => {
    if (!chatId) return;

    // Client-side rate limit for AI: max 3 AI calls per 30 seconds
    const rl = isThrottled('ai_reply', 3, 30_000);
    if (rl.throttled) return; // silently skip — server also rate-limits
    recordAction('ai_reply', 30_000);

    try {
      // Check global AI auto-reply setting from Firestore
      const aiConfigSnap = await getDoc(doc(db, 'settings', 'ai_config'));
      const aiAutoReply = aiConfigSnap.exists() ? aiConfigSnap.data().aiAutoReply : false;
      if (!aiAutoReply) return;

      // Check if admin has taken over this specific chat
      const chatSnap = await getDoc(doc(db, 'chats', chatId));
      const adminTookOver = chatSnap.exists() ? chatSnap.data().adminTookOver : false;
      if (adminTookOver) return;

      // Build recent message history for context (exclude temp local messages)
      const recentHistory = messages
        .filter(m => !m.id.startsWith('temp_'))
        .slice(-6)
        .map(m => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        }));

      setIsAiTyping(true);

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, userMessage: userText, chatHistory: recentHistory }),
      });

      const data = await response.json();
      const aiReply: string = data.reply || "Thank you for reaching out! Our team will respond shortly. For urgent help, call +91 7744086999.";

      // Write AI reply to Firestore
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: aiReply,
        sender: 'ai',
        timestamp: serverTimestamp(),
      });

      // Update last message on chat session
      await setDoc(doc(db, 'chats', chatId), {
        lastMessage: '🤖 ' + aiReply.substring(0, 50) + (aiReply.length > 50 ? '...' : ''),
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } catch (err) {
      console.warn('AI reply error:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !chatId) return;

    // Check rate limit (max 1 message per 2 seconds)
    const rl = isThrottled('chat_message', 1, 2000);
    if (rl.throttled) {
      const warningMsg: MessageItem = {
        id: 'warn_' + Date.now(),
        text: 'Too many messages. Please wait a moment.',
        sender: 'admin',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, warningMsg]);
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
      return;
    }

    recordAction('chat_message', 2000);

    const text = message;
    setMessage('');

    // Optimistic local message for instant UI feedback
    const userMsg: MessageItem = { id: 'temp_' + Date.now(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);

    try {
      // Create/update chat session document so it shows in the admin inbox
      await setDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Add the message to Firestore
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        sender: 'user',
        timestamp: serverTimestamp(),
      });

      // Notify admin
      await addDoc(collection(db, 'notifications'), {
        type: 'chat',
        userId: chatId,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        timestamp: serverTimestamp(),
        read: false,
      });

      // Trigger AI auto-reply (non-blocking)
      triggerAiReply(text);

    } catch (err) {
      console.warn('Firestore write failed, triggering automated response:', err);

      // Fallback: Show static automated reply
      setTimeout(() => {
        const adminMsg: MessageItem = {
          id: 'mock_' + Date.now(),
          text: 'Thank you for reaching out! A representative will connect with you shortly. For urgent inquiries, please call +91 7744086999.',
          sender: 'admin',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, adminMsg]);
        setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
      }, 1000);
    }
  };

  // Render a single message bubble
  const renderMessage = (m: MessageItem) => {
    const isUser = m.sender === 'user';
    const isAi = m.sender === 'ai';

    return (
      <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '4px' }}>
        {/* Sender label */}
        {!isUser && (
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: isAi ? '#7c3aed' : '#64748b',
            paddingLeft: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {isAi ? '🤖 AI Assistant' : '🛡️ Admin'}
          </span>
        )}
        <div style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          background: isUser ? '#1e293b' : isAi ? '#ede9fe' : '#fff',
          color: isUser ? '#fff' : isAi ? '#4c1d95' : '#0f172a',
          padding: '10px 16px',
          borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
          maxWidth: '80%',
          fontSize: '0.9rem',
          boxShadow: isUser ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
          border: isUser ? 'none' : isAi ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
          lineHeight: '1.5',
        }}>
          {m.text}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
      {isOpen && (
        <div
          style={{
            width: '350px',
            height: '500px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '20px',
            overflow: 'hidden',
            animation: 'chatFadeIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ background: '#0f172a', padding: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontWeight: 700 }}>Bhavik Support</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && !isAiTyping && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginTop: '40px' }}>
                👋 Hi! How can we help you today?<br />Our team will respond here.
              </div>
            )}
            {messages.map(renderMessage)}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', paddingLeft: '4px' }}>🤖 AI Assistant</span>
                <div style={{
                  background: '#ede9fe',
                  border: '1px solid #c4b5fd',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 16px 2px',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center',
                }}>
                  <span style={{ width: '7px', height: '7px', background: '#7c3aed', borderRadius: '50%', animation: 'aiDot 1.2s infinite', animationDelay: '0ms' }}></span>
                  <span style={{ width: '7px', height: '7px', background: '#7c3aed', borderRadius: '50%', animation: 'aiDot 1.2s infinite', animationDelay: '200ms' }}></span>
                  <span style={{ width: '7px', height: '7px', background: '#7c3aed', borderRadius: '50%', animation: 'aiDot 1.2s infinite', animationDelay: '400ms' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
            <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', borderRadius: '12px', padding: '6px 12px' }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '8px 0', fontSize: '0.9rem' }}
              />
              <button onClick={sendMessage} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle-btn"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#1e293b',
          color: '#fff',
          border: 'none',
          boxShadow: '0 10px 25px rgba(30, 41, 59, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      <style jsx>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aiDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .chat-toggle-btn:hover { transform: scale(1.05); }
        .chat-toggle-btn:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
}
