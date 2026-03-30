import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  COURSES, STORAGE_KEYS, loadData, generateGlobalAgentResponse,
  type Curriculum, type ChatMessage,
} from '../store';

export function GlobalAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
      const response = generateGlobalAgentResponse(curricula, input);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }]);
      setTyping(false);
    }, 1200);
  };

  const enrolledCount = Object.keys(loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {})).length;

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setOpen(true);
          if (messages.length === 0) {
            setMessages([{
              role: 'assistant',
              content: `你好！我是你的全局学习助手 🤖\n\n我可以帮你：\n- 查看所有课程的学习进度\n- 分析你的学习情况\n- 给出跨课程的学习建议\n- 回答任何学习相关的问题\n\n你目前已报名 ${enrolledCount} 门课程。有什么想了解的吗？`,
              timestamp: new Date().toISOString(),
            }]);
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
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
                  <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-500">
                    正在思考...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
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
