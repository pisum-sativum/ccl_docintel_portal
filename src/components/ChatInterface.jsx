"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ChatInterface() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am CCL DocIntel. Ask me anything about mine safety guidelines, DGMS forms, or compliance files.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { sender: 'user', text: input };
    const history = [...messages];
    setMessages(p => [...p, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ query_text: input, history: history.slice(-6) }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const detail = errData.detail || `Server error (HTTP ${res.status})`;
        throw new Error(detail);
      }
      const data = await res.json();
      setMessages(p => [...p, { sender: 'bot', text: data.text }]);
    } catch (err) {
      const msg = err.message?.includes('Proxy error') || err.message?.includes('warming up')
        ? `⚠️ ${err.message}`
        : "⚠️ Connection error. The backend server may be warming up — please wait 30 seconds and try again.";
      setMessages(p => [...p, { sender: 'bot', text: msg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderText = (text) => {
    return text.split(/(\[Source:[^\]]+\])/g).map((part, i) =>
      /^\[Source:/.test(part)
        ? <span key={i} className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md bg-accent text-accent-text text-xs font-black shadow-sm">{part}</span>
        : part
    );
  };

  return (
    <div className="flex flex-col h-full bg-bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-strong shrink-0 bg-bg-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-primary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-text-main text-base">AI Document Assistant</h3>
            <p className="text-xs text-text-muted font-bold mt-0.5">Powered by semantic search · Compliance-aware</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs bg-bg-surface border-2 border-border-strong text-text-main px-3 py-1.5 rounded-full font-black shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-3 animate-fadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black shadow-md ${
              msg.sender === 'bot'
                ? 'bg-primary text-primary-text'
                : 'bg-accent text-accent-text'
            }`}>
              {msg.sender === 'bot' ? 'AI' : 'ME'}
            </div>

            <div className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm font-semibold leading-relaxed whitespace-pre-wrap shadow-md ${
              msg.sender === 'user'
                ? 'bg-primary text-primary-text rounded-br-sm'
                : 'bg-bg-base border-2 border-border-subtle text-text-main rounded-bl-sm'
            }`}>
              {msg.sender === 'bot' ? renderText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-[10px] font-black text-primary-text shadow-md">AI</div>
            <div className="bg-bg-base border-2 border-border-subtle rounded-2xl rounded-bl-sm px-6 py-4 flex gap-2 items-center shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-5 border-t border-border-strong shrink-0 flex gap-3 items-center bg-bg-base">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about your documents…"
          disabled={isTyping}
          className="flex-1 bg-bg-surface border-2 border-border-strong focus:border-accent rounded-xl px-5 py-4 text-sm text-text-main font-bold placeholder:text-text-muted focus:outline-none transition-all disabled:opacity-60 shadow-sm"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="btn-accent px-5 py-4 disabled:opacity-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}