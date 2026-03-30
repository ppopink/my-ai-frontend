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

  const handleSend = () => {
    if (!input.trim() || generating || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const newAnswers = [...answers, input];
    setAnswers(newAnswers);
    setInput('');

    const nextQ = currentQ + 1;

    if (nextQ < questions.length) {
      const transitions = [
        '好的，了解了！👍',
        '明白啦～',
        '不错不错，这对我很有帮助 😊',
        '嗯嗯，记下了！',
        '很好，谢谢你的分享！',
        '收到 ✅ 继续聊~',
        'OK，了解你的情况了！',
        '好嘞，这个信息很重要 📝',
      ];
      const transition = transitions[Math.floor(Math.random() * transitions.length)];
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `${transition}\n\n${questions[nextQ]}`,
          timestamp: new Date().toISOString(),
        }]);
        setCurrentQ(nextQ);
      }, 1200);
    } else {
      setIsTyping(true);
      setGenerating(true);
      setTimeout(() => {
        const items = generateCurriculum(courseId!, newAnswers);
        const chapters = generateChapters(courseId!, newAnswers);
        const curriculum: Curriculum = { courseId: courseId!, items, chapters };

        const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
        curricula[courseId!] = curriculum;
        saveData(STORAGE_KEYS.curricula, curricula);

        const profiles = loadData<Record<string, UserProfile>>(STORAGE_KEYS.profiles, {});
        profiles[courseId!] = { courseId: courseId!, answers: newAnswers, summary: '' };
        saveData(STORAGE_KEYS.profiles, profiles);

        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `太好了！我已经根据你的情况为你定制了一份包含 ${chapters.length} 章、${chapters.reduce((s, c) => s + c.sections.length, 0)} 节的学习计划 🎯\n\n学习计划已经准备好了，包括从基础到进阶的完整路径。每个章节都会有我陪你学习，随时解答问题。\n\n点击下方按钮开始你的学习之旅吧！`,
          timestamp: new Date().toISOString(),
        }]);
        setGenerating(false);
      }, 2500);
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
          onClick={() => navigate(`/curriculum/${courseId}`)}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          🚀 查看我的学习计划
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
