import { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { useParams, useNavigate } from 'react-router';
=======
import { useParams, useNavigate, useLocation } from 'react-router';
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
import { useParams, useNavigate, useLocation } from 'react-router';
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
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
<<<<<<< HEAD
<<<<<<< HEAD
  const course = COURSES.find(c => c.id === courseId);

  const questions = INTERVIEW_QUESTIONS[courseId!] || INTERVIEW_QUESTIONS.python;
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  const location = useLocation();
  const { isCustom, courseTitle, uploadFile } = (location.state as any) || {};

  const course = isCustom 
    ? { id: 'custom', name: courseTitle, icon: '✨' }
    : COURSES.find(c => c.id === courseId);

  const questions = isCustom 
    ? INTERVIEW_QUESTIONS.custom
    : (INTERVIEW_QUESTIONS[courseId!] || INTERVIEW_QUESTIONS.python);
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `你好！欢迎来到「${course?.name}」课程 ${course?.icon}\n\n在开始学习之前，我想先了解一下你的情况，这样才能为你量身定制最适合的学习路径。\n\n${questions[0]}`,
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const greeting = isCustom
      ? `你好！欢迎进入「${courseTitle || '自定义'}」的定制化采访环节 ✨`
      : `你好！欢迎来到「${course?.name || '新课程'}」课程 ${course?.icon || '📚'}`;

    setMessages([
      {
        role: 'assistant',
        content: `${greeting}\n\n为了给你生成最完美的专属大纲，我们需要简单聊几句。\n\n${questions[0]}`,
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

<<<<<<< HEAD
<<<<<<< HEAD
  const handleSend = () => {
    if (!input.trim() || generating || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const newAnswers = [...answers, input];
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (isPlanLoading) return;
    setIsPlanLoading(true);
    
    try {
      // Consolidate answers for the AI
      const userBackground = answers.map((ans, i) => `Q: ${questions[i]}\nA: ${ans}`).join('\n\n');
      
      let response;
      if (isCustom && uploadFile) {
        // 🚨 Custom Course: Send FormData with file
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('course_title', courseTitle);
        formData.append('user_profile', JSON.stringify({
          background: userBackground,
          chat_history: messages.map(m => ({ role: m.role, content: m.content }))
        }));
        formData.append('user_id', "user_123");

        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/generate-custom-syllabus`, {
          method: 'POST',
          body: formData, // No headers: browser sets boundary
        });
      } else {
        // 🟢 Standard Course: Send JSON
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/generate-syllabus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            course_name: course?.name || courseId,
            user_id: "user_123",
            user_background: userBackground
          })
        });
      }

      if (!response.ok) throw new Error("大纲生成请求失败");

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Save the AI-generated syllabus to localStorage for CurriculumPage to consume (fallback)
        localStorage.setItem('customSyllabus', JSON.stringify(result.data));
        
        // Also save the summary to the user profile in store
        const targetCourseId = isCustom ? 'custom' : courseId!;
        const profiles = loadData<Record<string, UserProfile>>(STORAGE_KEYS.profiles, {});
        profiles[targetCourseId] = { 
          courseId: targetCourseId, 
          answers, 
          summary: "AI 已根据您的资料与访谈为您量身定制了专属学习路径。" 
        };
        saveData(STORAGE_KEYS.profiles, profiles);
        
        navigate(`/curriculum/${targetCourseId}`, { 
          state: { 
            isCustom: isCustom,
            syllabusData: result.data, 
            courseTitle: course?.name,
            courseId: result.course_id
          } 
        });
      } else {
        throw new Error(result.message || "返回数据格式不正确");
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
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    setAnswers(newAnswers);
    setInput('');

    const nextQ = currentQ + 1;

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    try {
      if (nextQ < questions.length) {
        setIsTyping(true);
        
        // Use Fetch Reader for transition feedback
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agent/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
            username: "user_123",
            current_question: {}, // Fixed: Must be a dict
            persona: "采访官", // Neutral persona for interview
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split('\n').filter(l => l.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                if (lastIdx >= 0 && newMessages[lastIdx].role === 'assistant') {
                  let updatedContent = newMessages[lastIdx].content + data;
                  
                  // 🚨 终极拦截逻辑：在完整拼接的句子里抓新暗号 ###DONE###
                  if (updatedContent.includes('###DONE###')) {
                    setIsInterviewFinished(true);
                    updatedContent = updatedContent.replace(/###DONE###/g, '').trim();
                  }
                  
                  newMessages[lastIdx] = { ...newMessages[lastIdx], content: updatedContent };
                }
                return newMessages;
              });
            }
          }
        }
        setCurrentQ(nextQ);
      } else {
        setIsTyping(true);
        setGenerating(true);

<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
        const items = generateCurriculum(courseId!, newAnswers);
        const chapters = generateChapters(courseId!, newAnswers);
        const curriculum: Curriculum = { courseId: courseId!, items, chapters };

        const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
        curricula[courseId!] = curriculum;
        saveData(STORAGE_KEYS.curricula, curricula);

        const profiles = loadData<Record<string, UserProfile>>(STORAGE_KEYS.profiles, {});
        profiles[courseId!] = { courseId: courseId!, answers: newAnswers, summary: '' };
        saveData(STORAGE_KEYS.profiles, profiles);

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
        // Fetch reader for the final summary
        const response2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agent/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m: ChatMessage) => ({ role: m.role, content: m.content })),
            username: "user_123",
            current_question: {}, // Fixed: Must be a dict
            persona: "采访总结官",
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

        while (true) {
          const { done, value } = await reader2.read();
          if (done) break;
          const chunkText = decoder2.decode(value, { stream: true });
          const lines = chunkText.split('\n').filter(l => l.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIdx = newMessages.length - 1;
                if (lastIdx >= 0 && newMessages[lastIdx].role === 'assistant') {
                  let updatedContent = newMessages[lastIdx].content + data;
                  
                  // 🚨 终极拦截逻辑：抓新暗号 ###DONE###
                  if (updatedContent.includes('###DONE###')) {
                    setIsInterviewFinished(true);
                    updatedContent = updatedContent.replace(/###DONE###/g, '').trim();
                  }
                  
                  newMessages[lastIdx] = { ...newMessages[lastIdx], content: updatedContent };
                }
                return newMessages;
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

  const isFinished = isInterviewFinished || (currentQ >= questions.length - 1 && answers.length >= questions.length);
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const currentProgress = isFinished ? 100 : Math.min(90, 10 + userMessageCount * 25);
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Progress Bar */}
<<<<<<< HEAD
<<<<<<< HEAD
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{course?.icon} {course?.name} - 个人情况采访</span>
          <span>{Math.min(answers.length, questions.length)}/{questions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(Math.min(answers.length, questions.length) / questions.length) * 100}%` }}
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-medium">{course?.icon} {course?.name} - 个人情况采访</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold">{currentProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700 ease-out"
            style={{ width: `${currentProgress}%` }}
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
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
<<<<<<< HEAD
<<<<<<< HEAD
          onClick={() => navigate(`/curriculum/${courseId}`)}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          🚀 查看我的学习计划
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
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
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
        </motion.button>
      ) : (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
<<<<<<< HEAD
<<<<<<< HEAD
            placeholder="输入你的回答..."
            disabled={generating || isTyping}
=======
            placeholder={isFinished ? "采访已结束" : "输入你的回答..."}
            disabled={generating || isTyping || isFinished}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
            placeholder={isFinished ? "采访已结束" : "输入你的回答..."}
            disabled={generating || isTyping || isFinished}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/50 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
<<<<<<< HEAD
<<<<<<< HEAD
            disabled={!input.trim() || generating || isTyping}
=======
            disabled={!input.trim() || generating || isTyping || isFinished}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
            disabled={!input.trim() || generating || isTyping || isFinished}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
            className="px-4 py-3 bg-violet-500 text-white rounded-xl disabled:opacity-40 hover:bg-violet-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
