"use client";

import { useEffect, useRef, useState } from "react";
import Robot from "./Robot";
import { chatQA } from "@/data/site";

type Msg = { from: "bot" | "user"; text: string };

const WELCOME = `Hi! I'm T-Bot, ${""}your AI assistant for Khaled's portfolio. Ask me anything about his experience, skills, or how to reach him.`;

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState<Set<number>>(new Set());
  const [userText, setUserText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  const botSay = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text }]);
      setTyping(false);
    }, 700);
  };

  const ask = (index: number) => {
    const qa = chatQA[index];
    if (!qa || asked.has(index)) return;
    setAsked((prev) => new Set(prev).add(index));
    setMessages((prev) => [...prev, { from: "user", text: qa.q }]);
    botSay(qa.a);
  };

  const submitFreeText = () => {
    const text = userText.trim();
    if (!text) return;
    setUserText("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    const match = chatQA.find((qa) => text.toLowerCase().includes(qa.q.toLowerCase().split(" ")[0]));
    botSay(
      match
        ? match.a
        : `Good question! I'm a simple demo assistant. Try one of the quick questions below, or email ${"khaledseifullaha@gmail.com"} directly.`
    );
  };

  // Auto-hide the initial greeting after a few seconds.
  useEffect(() => {
    const t = setTimeout(() => setGreeting(false), 7000);
    return () => clearTimeout(t);
  }, []);

  // Re-show the greeting a few seconds after the chat is closed.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      if (!dismissedRef.current) setGreeting(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  return (
    <div className="ai-widget">
      <div className={`ai-greeting ${greeting && !open ? "show" : ""}`} onClick={() => setOpen(true)}>
        <div className="ai-greeting-header">
          <span className="ai-greeting-badge">T-Bot · AI Assistant</span>
          <button
            className="ai-greeting-close"
            onClick={(e) => {
              e.stopPropagation();
              dismissedRef.current = true;
              setGreeting(false);
            }}
            aria-label="Dismiss greeting"
          >
            ✕
          </button>
        </div>
        <p className="ai-greeting-text">Hi! 👋 Ask me anything about Khaled&apos;s work, skills, or how to get in touch.</p>
      </div>

      <div className={`ai-chat ${open ? "open" : ""}`} role="dialog" aria-label="AI assistant chat">
        <div className="ai-header">
          <div className="ai-header-info">
            <div className="ai-avatar">
              <Robot />
            </div>
            <div>
              <p className="ai-name">T-Bot</p>
              <p className="ai-status">Online · Portfolio Assistant</p>
            </div>
          </div>
          <button className="ai-close" onClick={() => setOpen(false)} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div className="ai-messages" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="ai-msg bot">{WELCOME}</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.from}`}>
                {m.text}
              </div>
            ))
          )}
          {typing ? (
            <div className="ai-msg bot">
              <span className="ai-typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          ) : null}
        </div>

        <div className="ai-questions">
          {chatQA.map((qa, i) => (
            <button key={qa.q} className="ai-q-btn" disabled={asked.has(i)} onClick={() => ask(i)}>
              {qa.q}
            </button>
          ))}
        </div>

        <div className="border-t border-border-glass p-3">
          <div className="flex gap-2">
            <input
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitFreeText()}
              placeholder="Ask me anything…"
              className="w-full rounded-xl border border-border-glass bg-surface-2 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-accent"
              aria-label="Type a question"
            />
            <button
              onClick={submitFreeText}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      <button
        className="ai-toggle"
        onClick={() => {
          setGreeting(false);
          setOpen((v) => !v);
        }}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        <span className="ai-toggle-pulse" aria-hidden="true" />
        <Robot />
      </button>
    </div>
  );
}
