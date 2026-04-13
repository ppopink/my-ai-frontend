<<<<<<< HEAD
import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MessageCircle, Send, X, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { learningApi } from "../lib/api";
import { useLearningApp } from "../context/LearningAppContext";
import { MessageBubble } from "./MessageBubble";

type AgentMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

function getCurrentPage(pathname: string) {
  if (pathname.startsWith("/learn/")) return "learn";
  if (pathname.startsWith("/curriculum/")) return "curriculum";
  if (pathname.startsWith("/notes")) return "notes";
  if (pathname.startsWith("/profile")) return "profile";
  return "home";
}

function getCurrentCourseId(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "curriculum" && parts[1]) return parts[1];
  if (parts[0] === "learn" && parts[1]) return parts[1];
  if (parts[0] === "notes" && parts[1]) return parts[1];
  return null;
}

export function GlobalAgent() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userId,
    setTheme,
    setActiveCourseId,
    activeCourseId,
    progressSnapshots,
    coursePlans,
  } = useLearningApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentPage = useMemo(() => getCurrentPage(location.pathname), [location.pathname]);
  const courseIdFromPath = useMemo(() => getCurrentCourseId(location.pathname), [location.pathname]);

  const executeFrontendAction = (action?: { type?: string; payload?: Record<string, unknown> }) => {
    if (!action || action.type === "none") return;

    if (action.type === "set_theme") {
      const theme = action.payload?.theme;
      if (theme === "dark" || theme === "light") {
        setTheme(theme);
      }
      return;
    }

    if (action.type === "navigate") {
      const payload = action.payload || {};
      const target = payload.target;
      const targetCourseId =
        typeof payload.course_id === "string" ? payload.course_id : courseIdFromPath || activeCourseId || null;
      const targetSectionId = typeof payload.section_id === "string" ? payload.section_id : null;

      if (target === "notes") {
        navigate(targetCourseId ? `/notes/${targetCourseId}` : "/notes");
        return;
      }

      if (target === "course") {
        if (targetCourseId) {
          setActiveCourseId(targetCourseId);
          if (targetSectionId) {
            navigate(`/learn/${targetCourseId}/${targetSectionId}`);
          } else {
            navigate(`/curriculum/${targetCourseId}`);
          }
        } else {
          navigate("/");
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: AgentMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const result = await learningApi.conciergeRespond({
        user_id: userId,
        message: userMessage.content,
        current_page: currentPage,
        course_id: courseIdFromPath || activeCourseId || null,
        allow_frontend_actions: true,
        available_frontend_actions: ["navigate", "set_theme"],
        context: {
          known_courses: Object.keys(coursePlans),
          progress_overview: Object.keys(progressSnapshots),
        },
      });

      const reply = result.data?.reply || "我收到了，不过这次没有拿到有效回复。";
      const assistantMessage: AgentMessage = {
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      executeFrontendAction(result.data?.frontend_action);
      queueMicrotask(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "全局助手调用失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">全局学习助手</p>
                  <p className="text-[11px] text-violet-100">Agent 6 · 会执行导航和主题切换</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMessages([]);
                    setError("");
                  }}
                  className="rounded-full p-1.5 transition hover:bg-white/15"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} className="rounded-full p-1.5 transition hover:bg-white/15">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
              {messages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-sm leading-7 text-slate-500">
                  <p className="font-semibold text-slate-700">可以直接问我这些：</p>
                  <p className="mt-2">“我学到哪了？” “带我回课程” “打开笔记” “切成深色模式”。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={`${message.timestamp}-${message.role}`}>
                      <MessageBubble content={message.content} role={message.role} />
                    </div>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                  正在调用 Agent 6...
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                  <p className="font-semibold">请求失败</p>
                  <p className="mt-1">{error}</p>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              <div className="flex gap-3">
                <div className="flex flex-1 items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <User className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={2}
                    placeholder="问我：我最近学到哪了？"
                    className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none"
                  />
                </div>
                <button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || loading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
=======
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  STORAGE_KEYS, loadData,
  type Curriculum, type ChatMessage,
} from '../store';

// ─── Constants ───────────────────────────────────────────────────────────────
const BUTTON_SIZE = 56;
const PANEL_W = 380;
const PANEL_H = 520;
const BUTTON_POS_KEY = 'ga_button_pos';
const PANEL_POS_KEY  = 'ga_panel_pos';

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function defaultButtonPos() {
  return { x: window.innerWidth - BUTTON_SIZE - 24, y: window.innerHeight - BUTTON_SIZE - 24 };
}
function defaultPanelPos() {
  const w = Math.min(PANEL_W, window.innerWidth - 16);
  return {
    x: clamp(window.innerWidth  / 2 - w / 2, 8, window.innerWidth  - w - 8),
    y: clamp(window.innerHeight / 2 - PANEL_H / 2, 8, window.innerHeight - PANEL_H - 8),
  };
}
function loadPos(key: string, fallback: () => { x: number; y: number }) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const p = JSON.parse(raw);
      return { x: Number(p.x), y: Number(p.y) };
    }
  } catch {}
  return fallback();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GlobalAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Positions – initialised lazily after mount so window is available
  const [btnPos, setBtnPos] = useState<{ x: number; y: number }>(defaultButtonPos);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>(defaultPanelPos);

  useEffect(() => {
    setBtnPos(loadPos(BUTTON_POS_KEY, defaultButtonPos));
    setPanelPos(loadPos(PANEL_POS_KEY, defaultPanelPos));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Generic drag factory ──────────────────────────────────────────────────
  function useDrag(
    setPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
    storageKey: string,
    maxFn: () => { maxX: number; maxY: number },
    onTap?: () => void,  // called when pointer-up without significant movement
  ) {
    const dragging = useRef(false);
    const moved    = useRef(false);
    const offset   = useRef({ x: 0, y: 0 });
    const lastPos  = useRef({ x: 0, y: 0 });

    const onDown = useCallback((e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      moved.current = false;
      offset.current = { x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y };
    }, []);

    const onMove = useCallback((e: React.PointerEvent) => {
      if (!dragging.current) return;
      moved.current = true;
      const { maxX, maxY } = maxFn();
      const nx = clamp(e.clientX - offset.current.x, 0, maxX);
      const ny = clamp(e.clientY - offset.current.y, 0, maxY);
      lastPos.current = { x: nx, y: ny };
      setPos({ x: nx, y: ny });
    }, []);

    const onUp = useCallback((e: React.PointerEvent) => {
      dragging.current = false;
      if (!moved.current && onTap) {
        onTap();
        return;
      }
      // Persist final position
      const { maxX, maxY } = maxFn();
      const fx = clamp(e.clientX - offset.current.x, 0, maxX);
      const fy = clamp(e.clientY - offset.current.y, 0, maxY);
      localStorage.setItem(storageKey, JSON.stringify({ x: fx, y: fy }));
    }, [onTap]);

    // Sync lastPos when pos changes externally (initial load)
    const sync = useCallback((pos: { x: number; y: number }) => {
      lastPos.current = pos;
    }, []);

    return { onDown, onMove, onUp, sync };
  }

  // ── State-sync refs for drag ──────────────────────────────────────────────
  useEffect(() => { btnDrag.sync(btnPos); }, [btnPos]);
  useEffect(() => { panelDrag.sync(panelPos); }, [panelPos]);

  const enrolledCount = Object.keys(
    loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {})
  ).length;

  function openChat() {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `你好！我是你的全局学习助手 🤖\n\n我可以帮你：\n- 查看所有课程的学习进度\n- 分析你的学习情况\n- 给出跨课程的学习建议\n- 回答任何学习相关的问题\n\n你目前已报名 ${enrolledCount} 门课程。有什么想了解的吗？`,
        timestamp: new Date().toISOString(),
      }]);
    }
  }

  // Button drag – tap = open
  const btnDrag = useDrag(
    setBtnPos,
    BUTTON_POS_KEY,
    () => ({ maxX: window.innerWidth - BUTTON_SIZE, maxY: window.innerHeight - BUTTON_SIZE }),
    openChat,
  );

  // Panel drag – drag from header only
  const panelW = Math.min(PANEL_W, window.innerWidth - 16);
  const panelDrag = useDrag(
    setPanelPos,
    PANEL_POS_KEY,
    () => ({ maxX: window.innerWidth - panelW, maxY: window.innerHeight - 64 /* header only */ }),
  );

  // ── AI streaming ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg: ChatMessage = { role: 'user', content: userText, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agent/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          username: 'user_123',
          current_question: null,
          persona: '全能研习助手',
        }),
      });
      if (!response.ok) throw new Error('stream error');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('no stream');

      const decoder = new TextDecoder('utf-8');
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);
      setTyping(false);
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n').filter(l => l.trim()).forEach(line => {
          if (line.startsWith('data: ')) {
            acc += line.substring(6);
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') return [...prev.slice(0, -1), { ...last, content: acc }];
              return prev;
            });
          }
        });
      }
    } catch {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          return [...prev.slice(0, -1), { role: 'assistant', content: '抱歉，后端连接失败，请稍后再试。', timestamp: new Date().toISOString() }];
        }
        return prev;
      });
      setTyping(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating summon button (hidden while chat is open) ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{ left: btnPos.x, top: btnPos.y }}
            onPointerDown={btnDrag.onDown}
            onPointerMove={btnDrag.onMove}
            onPointerUp={btnDrag.onUp}
            className="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow touch-none select-none cursor-grab active:cursor-grabbing"
            title="拖动可移动位置，点击打开助手"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Draggable Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{
              left: clamp(panelPos.x, 8, window.innerWidth - panelW - 8),
              top: clamp(panelPos.y, 8, window.innerHeight - 64),
              width: panelW,
              maxHeight: Math.min(PANEL_H, window.innerHeight - 24),
            }}
            className="fixed z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            {/* ── Draggable Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
              onPointerDown={panelDrag.onDown}
              onPointerMove={panelDrag.onMove}
              onPointerUp={panelDrag.onUp}
            >
              <div className="flex items-center gap-2 pointer-events-none">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">全局学习助手</span>
                <span className="text-xs text-white/60 ml-1">（按住标题栏可拖动）</span>
              </div>
              <button
                className="hover:bg-white/20 rounded-full p-1 transition-colors pointer-events-auto"
                onPointerDown={e => e.stopPropagation()} // don't start drag
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-violet-100'}`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-indigo-600" />
                      : <Bot  className="w-4 h-4 text-violet-600" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400">
                    正在思考…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="border-t border-gray-100 dark:border-white/5 p-3 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="问我任何学习相关的问题…"
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-transparent dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-violet-500 text-white disabled:opacity-40 hover:bg-violet-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      </AnimatePresence>
    </>
  );
}
