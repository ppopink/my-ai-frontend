import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import {
  COURSES, INTERVIEW_QUESTIONS, STORAGE_KEYS,
  loadData, saveData, generateCurriculum, generateChapters,
  type ChatMessage, type Curriculum, type UserProfile,
} from '../store';

export function InterviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = COURSES.find(c => c.id === courseId);

  const questions = INTERVIEW_QUESTIONS[courseId!] || INTERVIEW_QUESTIONS.python;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `你好！欢迎来到「${course?.name}」课程 ${course?.icon}\n\n在开始学习之前，我想先了解一下你的情况，这样才能为你量身定制最适合的学习路径。\n\n${questions[0]}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (isPlanLoading) return;
    setIsPlanLoading(true);
    
    try {
      // Consolidate answers for the AI
      const userBackground = answers.map((ans, i) => `Q: ${questions[i]}\nA: ${ans}`).join('\n\n');
      
      const response = await fetch('https://personalizedlearningassistant-backend.onrender.com/api/onboarding/generate-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          course_name: course?.name || courseId,
          user_id: "user_123",
          user_background: userBackground
        })
      });

      if (!response.ok) throw new Error("大纲生成请求失败");

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Save the AI-generated syllabus to localStorage for CurriculumPage to consume
        localStorage.setItem('customSyllabus', JSON.stringify(result.data));
        // Also save the summary to the user profile in store
        const profiles = loadData<Record<string, UserProfile>>(STORAGE_KEYS.profiles, {});
        profiles[courseId!] = { 
          courseId: courseId!, 
          answers, 
          summary: "AI 已为您量身定制了专属学习路径。" 
        };
        saveData(STORAGE_KEYS.profiles, profiles);
        
        navigate(`/curriculum/${courseId}`);
      } else {
        throw new Error("返回数据格式不正确");
      }
    } catch (error) {
      console.error("大纲生成出错:", error);
      alert("生成个性化计划失败，请检查后端服务是否正常运行。");
    } finally {
      setIsPlanLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || generating || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = { role: 'user', content: userText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const newAnswers = [...answers, userText];
    setAnswers(newAnswers);
    setInput('');

    const nextQ = currentQ + 1;

    try {
      if (nextQ < questions.length) {
        setIsTyping(true);
        
        // Use Fetch Reader for transition feedback
        const response = await fetch('https://personalizedlearningassistant-backend.onrender.com/api/agent/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            context: {
              type: 'interview_transition',
              courseId,
              nextQuestion: questions[nextQ],
              answerHistory: newAnswers
            }
          })
        });

        if (!response.ok) throw new Error('Fetch failed');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');
        const decoder = new TextDecoder('utf-8');
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);

        let accumulatedContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n').filter(l => l.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              accumulatedContent += line.substring(6);
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
        setCurrentQ(nextQ);
      } else {
        setIsTyping(true);
        setGenerating(true);

        const items = generateCurriculum(courseId!, newAnswers);
        const chapters = generateChapters(courseId!, newAnswers);
        const curriculum: Curriculum = { courseId: courseId!, items, chapters };

        const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
        curricula[courseId!] = curriculum;
        saveData(STORAGE_KEYS.curricula, curricula);

        const profiles = loadData<Record<string, UserProfile>>(STORAGE_KEYS.profiles, {});
        profiles[courseId!] = { courseId: courseId!, answers: newAnswers, summary: '' };
        saveData(STORAGE_KEYS.profiles, profiles);

        // Fetch reader for the final summary
        const response2 = await fetch('https://personalizedlearningassistant-backend.onrender.com/api/agent/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "总结一下我的采访，告诉我已经生成了学习计划。",
            context: {
              type: 'interview_summary',
              courseId,
              curriculumOverview: {
                chapterCount: chapters.length,
                totalSections: chapters.reduce((s, c) => s + c.sections.length, 0)
              }
            }
          })
        });

        if (!response2.ok) throw new Error('Fetch failed');

        const reader2 = response2.body?.getReader();
        if (!reader2) throw new Error('No reader available');
        const decoder2 = new TextDecoder('utf-8');
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);

        let accumulatedContent2 = '';
        while (true) {
          const { done, value } = await reader2.read();
          if (done) break;
          const chunkText = decoder2.decode(value, { stream: true });
          const lines = chunkText.split('\n').filter(l => l.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              accumulatedContent2 += line.substring(6);
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: accumulatedContent2 }];
                }
                return prev;
              });
            }
          }
        }
        setGenerating(false);
      }
    } catch (error) {
      console.error('Error during interview stream:', error);
      // Fallback behavior
      setIsTyping(false);
      setGenerating(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: nextQ < questions.length ? questions[nextQ] : "好的，我已经为您生成了学习计划，请点击下方按钮开始学习。",
        timestamp: new Date().toISOString()
      }]);
      if (nextQ < questions.length) setCurrentQ(nextQ);
    }
  };

  const isFinished = currentQ >= questions.length - 1 && answers.length >= questions.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{course?.icon} {course?.name} - 个人情况采访</span>
          <span>{Math.min(answers.length, questions.length)}/{questions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(Math.min(answers.length, questions.length) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scroll-smooth">
        {messages.map((msg, i) => (
          <MessageBubble
            key={`${i}-${msg.timestamp}`}
            content={msg.content}
            role={msg.role}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Bottom Input / Navigate */}
      {isFinished && !generating && !isTyping ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleGeneratePlan}
          disabled={isPlanLoading}
          className={`w-full py-3 rounded-xl text-white font-medium transition-all ${
            isPlanLoading 
              ? 'bg-gray-400 cursor-not-allowed opacity-70' 
              : 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 shadow-lg'
          }`}
        >
          {isPlanLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              正在为你疯狂定制中...
            </span>
          ) : '🚀 查看我的学习计划'}
        </motion.button>
      ) : (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="输入你的回答..."
            disabled={generating || isTyping}
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/50 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || generating || isTyping}
            className="px-4 py-3 bg-violet-500 text-white rounded-xl disabled:opacity-40 hover:bg-violet-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
