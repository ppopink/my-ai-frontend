import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  COURSES, STORAGE_KEYS, loadData, generateGlobalAgentResponse,
  type Curriculum, type ChatMessage,
} from '../store';

// --- Draggable position logic ---
const STORAGE_KEY_POS = 'global_agent_pos';
const BUTTON_SIZE = 56; // w-14 h-14

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function getDefaultPos() {
  return {
    x: window.innerWidth - BUTTON_SIZE - 24,
    y: window.innerHeight - BUTTON_SIZE - 24,
  };
}

function loadPos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POS);
    if (raw) {
      const pos = JSON.parse(raw);
      // Clamp to current viewport in case screen size changed
      return {
        x: clamp(pos.x, 0, window.innerWidth - BUTTON_SIZE),
        y: clamp(pos.y, 0, window.innerHeight - BUTTON_SIZE),
      };
    }
  } catch {}
  return getDefaultPos();
}

export function GlobalAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Drag state ---
  const [pos, setPos] = useState<{ x: number; y: number }>(getDefaultPos);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false); // distinguish click vs drag
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load persisted position after mount (needs window dimensions)
  useEffect(() => {
    setPos(loadPos());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Pointer drag handlers ──────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    // Only drag on the button itself, not child elements' events that bubble
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    hasMoved.current = false;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    hasMoved.current = true;

    const newX = clamp(e.clientX - dragOffset.current.x, 0, window.innerWidth - BUTTON_SIZE);
    const newY = clamp(e.clientY - dragOffset.current.y, 0, window.innerHeight - BUTTON_SIZE);
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = false;
    // Persist position
    const newPos = {
      x: clamp(e.clientX - dragOffset.current.x, 0, window.innerWidth - BUTTON_SIZE),
      y: clamp(e.clientY - dragOffset.current.y, 0, window.innerHeight - BUTTON_SIZE),
    };
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(newPos));

    // If barely moved, treat as a click to open the chat
    if (!hasMoved.current) {
      setOpen(prev => {
        if (!prev && messages.length === 0) {
          setMessages([{
            role: 'assistant',
            content: `你好！我是你的全局学习助手 🤖\n\n我可以帮你：\n- 查看所有课程的学习进度\n- 分析你的学习情况\n- 给出跨课程的学习建议\n- 回答任何学习相关的问题\n\n你目前已报名 ${enrolledCount} 门课程。有什么想了解的吗？`,
            timestamp: new Date().toISOString(),
          }]);
        }
        return !prev;
      });
    }
  }, [messages.length]);

  // Compute chat panel position (keep it on screen)
  const panelWidth = Math.min(380, window.innerWidth - 16);
  const panelHeight = 520;
  const panelLeft = clamp(pos.x + BUTTON_SIZE / 2 - panelWidth / 2, 8, window.innerWidth - panelWidth - 8);
  const panelTop = pos.y + BUTTON_SIZE + 8;
  // If panel would go below viewport, pin it above the button
  const openAbove = panelTop + panelHeight > window.innerHeight - 8;
  const panelY = openAbove ? pos.y - panelHeight - 8 : panelTop;

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
          username: "user_123",
          current_question: null,
          persona: "全能研习助手"
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from AI agent');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder('utf-8');
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);
      setTyping(false);

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const textLines = chunkText.split('\n').filter(line => line.trim() !== '');
        for (const line of textLines) {
          if (line.startsWith('data: ')) {
            const text = line.substring(6);
            accumulatedContent += text;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant') {
                return [...prev.slice(0, -1), { ...last, content: accumulatedContent }];
              }
              return prev;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.content === '') {
          return [...prev.slice(0, -1), { role: 'assistant', content: '抱歉，我现在遇到了一些问题，请检查后端服务是否正常运行。', timestamp: new Date().toISOString() }];
        }
        return prev;
      });
      setTyping(false);
    }
  };

  const enrolledCount = Object.keys(loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {})).length;

  return (
    <>
      {/* ── Draggable Floating Button ── */}
      <button
        ref={buttonRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ left: pos.x, top: pos.y }}
        className="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow touch-none select-none cursor-grab active:cursor-grabbing"
        title="拖动可移动位置，点击打开助手"
      >
        {/* Tiny drag-hint icon in the corner */}
        <MessageCircle className="w-6 h-6" />
        <span className="absolute top-0.5 right-0.5 text-white/50">
          <GripVertical className="w-3 h-3" />
        </span>
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            style={{
              left: panelLeft,
              top: panelY,
              width: panelWidth,
            }}
            className="fixed z-50 max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span>全局学习助手</span>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-violet-100'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-violet-600" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-500">正在思考...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="问我任何学习相关的问题..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
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
      </AnimatePresence>
    </>
  );
}
