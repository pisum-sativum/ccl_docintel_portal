"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const RETRY_DELAY_S = 20; // seconds to wait before auto-retrying on cold-start 502

export default function ChatInterface() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am CCL DocIntel. Ask me anything about mine safety guidelines, DGMS forms, or compliance files.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // retryState: null | { query, history, countdown }
  const [retryState, setRetryState] = useState(null);
  const scrollRef = useRef(null);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, retryState]);

  // Countdown ticker
  useEffect(() => {
    if (!retryState) return;
    if (retryState.countdown <= 0) return; // sendMessage will fire when countdown reaches 0
    const t = setTimeout(() => {
      setRetryState((prev) =>
        prev ? { ...prev, countdown: prev.countdown - 1 } : null,
      );
    }, 1000);
    return () => clearTimeout(t);
  }, [retryState]);

  // Auto-fire when countdown hits 0
  useEffect(() => {
    if (retryState && retryState.countdown === 0) {
      const { query, history } = retryState;
      setRetryState(null);
      sendMessage(query, history);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryState]);

  const sendMessage = useCallback(
    async (queryText, history) => {
      setIsTyping(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query_text: queryText,
            history: history.slice(-6),
          }),
        });

        if (res.status === 502 || res.status === 503) {
          // Cold-start: schedule auto-retry instead of showing a hard error
          setRetryState({
            query: queryText,
            history,
            countdown: RETRY_DELAY_S,
          });
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.detail || `Server error (HTTP ${res.status})`,
          );
        }

        const data = await res.json();
        setMessages((p) => [...p, { sender: "bot", text: data.text }]);
      } catch (err) {
        // Network-level failure (no response at all) → also auto-retry
        if (err.name === "TypeError" || err.message?.includes("fetch")) {
          setRetryState({
            query: queryText,
            history,
            countdown: RETRY_DELAY_S,
          });
          return;
        }
        setMessages((p) => [
          ...p,
          { sender: "bot", text: `⚠️ ${err.message}` },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [token],
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || retryState) return;

    const userMsg = { sender: "user", text: input };
    const history = [...messages];
    setMessages((p) => [...p, userMsg]);
    setInput("");
    await sendMessage(input, history);
  };

  const cancelRetry = () => {
    clearTimeout(retryTimerRef.current);
    setRetryState(null);
    setIsTyping(false);
  };

  const renderText = (text) => {
    return text.split(/(\[Source:[^\]]+\])/g).map((part, i) =>
      /^\[Source:/.test(part) ? (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md bg-accent text-accent-text text-xs font-black shadow-sm"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const isServerBusy = isTyping || !!retryState;

  return (
    <div className="flex flex-col h-full bg-bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-strong shrink-0 bg-bg-base">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-primary-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-text-main text-base">
              AI Document Assistant
            </h3>
            <p className="text-xs text-text-muted font-bold mt-0.5">
              Powered by semantic search · Compliance-aware
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs border-2 border-border-strong px-3 py-1.5 rounded-full font-black shadow-sm transition-colors ${
            retryState
              ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
              : "bg-bg-surface text-text-main"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${retryState ? "bg-yellow-500 animate-pulse" : "bg-green-500 animate-pulse"}`}
          />
          {retryState ? "WARMING UP" : "LIVE"}
        </span>
      </div>

      {/* Warming-up retry banner */}
      {retryState && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <svg
              className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-300 truncate">
              Server warming up — auto-retrying in{" "}
              <strong>{retryState.countdown}s</strong>…
            </span>
          </div>
          <button
            onClick={cancelRetry}
            className="text-xs font-black text-yellow-700 dark:text-yellow-400 hover:underline shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 animate-fadeIn ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black shadow-md ${
                msg.sender === "bot"
                  ? "bg-primary text-primary-text"
                  : "bg-accent text-accent-text"
              }`}
            >
              {msg.sender === "bot" ? "AI" : "ME"}
            </div>

            <div
              className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm font-semibold leading-relaxed whitespace-pre-wrap shadow-md ${
                msg.sender === "user"
                  ? "bg-primary text-primary-text rounded-br-sm"
                  : "bg-bg-base border-2 border-border-subtle text-text-main rounded-bl-sm"
              }`}
            >
              {msg.sender === "bot" ? renderText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-[10px] font-black text-primary-text shadow-md">
              AI
            </div>
            <div className="bg-bg-base border-2 border-border-subtle rounded-2xl rounded-bl-sm px-6 py-4 flex gap-2 items-center shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-5 border-t border-border-strong shrink-0 flex gap-3 items-center bg-bg-base"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            retryState
              ? "Waiting for server to warm up…"
              : "Ask anything about your documents…"
          }
          disabled={isServerBusy}
          className="flex-1 bg-bg-surface border-2 border-border-strong focus:border-accent rounded-xl px-5 py-4 text-sm text-text-main font-bold placeholder:text-text-muted focus:outline-none transition-all disabled:opacity-60 shadow-sm"
        />
        <button
          type="submit"
          disabled={isServerBusy || !input.trim()}
          className="btn-accent px-5 py-4 disabled:opacity-40"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
