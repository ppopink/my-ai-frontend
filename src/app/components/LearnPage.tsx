import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Bot, User, ArrowLeft, CheckCircle, ChevronRight,
  MessageCircle, X, Lightbulb, Trophy, XCircle, Sparkles, BookOpen,
} from 'lucide-react';
import {
  COURSES, STORAGE_KEYS, loadData, saveData, generateQuizQuestions, generateTutorResponse,
  type Curriculum, type ChatMessage, type CurriculumSection, type QuizQuestion,
} from '../store';
import { API_BASE_URL } from '../lib/api';
import { getCourseDisplay, resolveCourseId } from '../lib/courseRegistry';

export function LearnPage() {
  const { courseId: routeCourseId, itemId } = useParams<{ courseId: string; itemId: string }>();
  const navigate = useNavigate();
  const actualCourseId = resolveCourseId(routeCourseId) || routeCourseId || '';
  const courseDisplay = getCourseDisplay(actualCourseId);
  const course = COURSES.find(c => c.id === courseDisplay.catalogCourseId) || {
    id: actualCourseId,
    name: courseDisplay.title,
    icon: courseDisplay.icon,
    color: courseDisplay.color,
  };

  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
  const curriculum = curricula[actualCourseId];

  const allSections: CurriculumSection[] = curriculum?.chapters?.flatMap(ch => ch.sections) || [];
  const sectionFromChapters = allSections.find(s => s.id === itemId);
  const sectionIndex = allSections.findIndex(s => s.id === itemId);
  const item = sectionFromChapters || curriculum?.items.find(i => i.id === itemId);

  const questions = useMemo(() => {
    if (!item) return [];
    return generateQuizQuestions(actualCourseId, itemId!, item.title);
  }, [actualCourseId, itemId, item?.title]);

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  // 'idle' = waiting for answer, 'wrong' = just answered wrong (can retry), 'correct' = answered correctly (show summary)
  const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  // Track which options have been tried wrong for this question
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());

  // Tutor chat
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorTyping, setTutorTyping] = useState(false);
  const tutorBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tutorBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages, tutorTyping]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setFillAnswer('');
    setAnswerStatus('idle');
    setWrongAttempts(0);
    setEliminatedOptions(new Set());
  }, [currentQIdx]);

  const currentQ = questions[currentQIdx];

  const updateProgress = (newProgress: number, understanding?: string) => {
    if (!curriculum) return;
    const idx = curriculum.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      curriculum.items[idx].progress = Math.max(curriculum.items[idx].progress, newProgress);
      if (understanding) curriculum.items[idx].understanding = understanding as any;
      if (newProgress >= 100) curriculum.items[idx].completed = true;
    }
    if (curriculum.chapters) {
      for (const ch of curriculum.chapters) {
        const sec = ch.sections.find(s => s.id === itemId);
        if (sec) {
          sec.progress = Math.max(sec.progress, newProgress);
          if (understanding) sec.understanding = understanding as any;
          if (newProgress >= 100) sec.completed = true;
          break;
        }
      }
    }
    curricula[actualCourseId] = curriculum;
    saveData(STORAGE_KEYS.curricula, curricula);
  };

  const handleSubmitAnswer = () => {
    if (!currentQ) return;

    let userAnswer = '';
    if (currentQ.type === 'choice') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else {
      if (!fillAnswer.trim()) return;
      userAnswer = fillAnswer.trim();
    }

    const isCorrect = currentQ.type === 'choice'
      ? userAnswer === currentQ.answer
      : userAnswer.toLowerCase() === currentQ.answer.toLowerCase();

    if (isCorrect) {
      setAnswerStatus('correct');
      setCorrectCount(prev => prev + 1);
      setAnsweredQuestions(prev => new Set([...prev, currentQIdx]));

      const progress = Math.round(((answeredQuestions.size + 1) / questions.length) * 100);
      const understanding = progress >= 80 ? 'advanced' : progress >= 50 ? 'intermediate' : 'beginner';
      updateProgress(progress, understanding);

      // Tutor sends congratulations + knowledge summary
      const summaryMsg: ChatMessage = {
        role: 'assistant',
        content: `🎉 **答对了！太棒了！**${wrongAttempts > 0 ? `\n\n经过 ${wrongAttempts} 次尝试，你最终找到了正确答案，这个过程本身就是最好的学习！` : '\n\n一次就答对了，说明你对这个知识点理解得很好！'}\n\n📚 **知识点总结：**\n${currentQ.explanation}\n\n${wrongAttempts > 0 ? '💡 记住这道题的思路，下次遇到类似的题目就不会再犯同样的错误了。' : '💡 继续保持，准备好了就点击「下一题」吧！'}`,
        timestamp: new Date().toISOString(),
      };
      setTutorMessages(prev => [...prev, summaryMsg]);
      if (!tutorOpen) setTutorOpen(true);
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setAnswerStatus('wrong');

      // Track eliminated option
      if (currentQ.type === 'choice' && selectedOption) {
        setEliminatedOptions(prev => new Set([...prev, selectedOption]));
      }

      // ==========================================
      // 🚨 核心爆发点：答错时，触发真实的 AI 导师进行针对性辅导！
      // ==========================================
      const actionContext = `用户第 ${newAttempts} 次答错了。他刚刚选择了答案：【${userAnswer}】。请帮他分析为什么这个选项是错的，并用启发式的方式给出思考方向。`;
      
      // 第三个参数传 false，代表不需要在界面上显示“我选错了...”这句话，让 AI 直接开口
      streamAITutorResponse(actionContext, "我选错了，能给我点提示吗？", false);
    }
  };

  const handleRetry = () => {
    setAnswerStatus('idle');
    setSelectedOption(null);
    if (currentQ?.type === 'fill') setFillAnswer('');
  };

  const handleNextQuestion = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      const accuracy = correctCount / questions.length;
      const understanding = accuracy >= 0.8 ? 'advanced' : accuracy >= 0.5 ? 'intermediate' : 'beginner';
      updateProgress(100, understanding);
      setShowResult(true);
    }
  };

  // ==========================================
  // 🚨 新增：真实 AI 导师流式请求引擎
  // ==========================================
  const streamAITutorResponse = async (userAction: string, userMessage: string, showUserBubble: boolean = true) => {
    const newMessages = showUserBubble && userMessage
      ? [...tutorMessages, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]
      : tutorMessages;

    if (showUserBubble && userMessage) {
      setTutorMessages(newMessages as ChatMessage[]);
    }
    
    setTutorTyping(true);
    if (!tutorOpen) setTutorOpen(true); 

    try {
      const qContext = currentQ ? `题目：${currentQ.question}\n选项：${currentQ.options?.map((o: any) => `${o.label}: ${o.text}`).join(' | ')}` : "暂无题目";
      
      const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      const currentStyle = prefs.aiStyle || "鼓励引导型"; 

      const response = await fetch(`${API_BASE_URL}/api/study/tutor-chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          username: "user_123",
          current_question: { text: currentQ?.question || "知识点学习" }, // Fixed: Must be a dict
          persona: currentStyle 
        })
      });

      if (!response.ok) throw new Error('AI 导师连接失败');

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      const decoder = new TextDecoder('utf-8');
      
      setTutorMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);
      setTutorTyping(false);

      let accumulatedContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textLines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim() !== '');
        for (const line of textLines) {
          if (line.startsWith('data: ')) {
            accumulatedContent += line.substring(6);
            setTutorMessages(prev => {
              const newMsgs = [...prev];
              const last = newMsgs[newMsgs.length - 1];
              if (last && last.role === 'assistant') {
                last.content = accumulatedContent;
              }
              return newMsgs;
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      setTutorTyping(false);
    }
  };

  // 替换原有的 handleTutorSend
  const handleTutorSend = () => {
    if (!tutorInput.trim() || tutorTyping) return;
    const text = tutorInput.trim();
    setTutorInput(''); // 清空输入框
    // 呼叫我们刚才写的引擎！
    streamAITutorResponse("用户在右侧聊天框主动提问", text, true);
  };



  const nextSection = sectionFromChapters
    ? (sectionIndex < allSections.length - 1 ? allSections[sectionIndex + 1] : undefined)
    : undefined;

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">章节未找到</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-violet-600">返回</button>
      </div>
    );
  }

  // Result screen
  if (showResult) {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const emoji = accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪';
    const message = accuracy >= 80 ? '太棒了！你已经掌握了这一节的内容！' : accuracy >= 50 ? '不错，大部分知识点都掌握了！' : '继续加油，多练习几次就能掌握了！';

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-gray-800 mb-2">答题完成！</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-around">
              <div>
                <div className="text-2xl text-violet-600" style={{ fontWeight: 700 }}>{correctCount}</div>
                <div className="text-xs text-gray-400">答对</div>
              </div>
              <div>
                <div className="text-2xl text-gray-400" style={{ fontWeight: 700 }}>{questions.length - correctCount}</div>
                <div className="text-xs text-gray-400">答错</div>
              </div>
              <div>
                <div className="text-2xl" style={{ fontWeight: 700, color: accuracy >= 80 ? '#22c55e' : accuracy >= 50 ? '#eab308' : '#f97316' }}>{accuracy}%</div>
                <div className="text-xs text-gray-400">正确率</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {nextSection && (
              <button
                onClick={() => navigate(`/learn/${actualCourseId}/${nextSection.id}`)}
                className="w-full py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
              >
                下一节 <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate(`/curriculum/${actualCourseId}`)}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              返回目录
            </button>
            <button
              onClick={() => {
                setShowResult(false);
                setCurrentQIdx(0);
                setCorrectCount(0);
                setAnsweredQuestions(new Set());
                setTutorMessages([]);
              }}
              className="w-full py-3 text-violet-600 rounded-xl hover:bg-violet-50 transition-colors"
            >
              重新练习
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/curriculum/${actualCourseId}`)} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <div className="text-xs text-gray-400">{course?.icon} {course?.name}</div>
            <div className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentQIdx
                    ? 'bg-violet-500 scale-125'
                    : answeredQuestions.has(i)
                    ? 'bg-green-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {currentQIdx + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Quiz area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto"
              >
                {/* Question type badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    currentQ?.type === 'choice' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {currentQ?.type === 'choice' ? '📋 选择题' : '✏️ 填空题'}
                  </span>
                  <span className="text-xs text-gray-400">第 {currentQIdx + 1} 题</span>
                  {wrongAttempts > 0 && answerStatus !== 'correct' && (
                    <span className="text-xs text-amber-500">已尝试 {wrongAttempts} 次</span>
                  )}
                </div>

                {/* Question */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                  <h3 className="text-gray-800 whitespace-pre-wrap" style={{ lineHeight: '1.8' }}>
                    {currentQ?.question}
                  </h3>
                </div>

                {/* Answer area - Choice */}
                {currentQ?.type === 'choice' ? (
                  <div className="space-y-3">
                    {currentQ.options?.map(opt => {
                      const isSelected = selectedOption === opt.label;
                      const isEliminated = eliminatedOptions.has(opt.label);
                      const isCorrectAnswer = answerStatus === 'correct' && opt.label === currentQ.answer;
                      const isWrongSelected = answerStatus === 'wrong' && isSelected;

                      // When correct: show correct option highlighted
                      // When wrong: show the wrong selected one in red, eliminated ones greyed out
                      // When idle after retry: eliminated options are greyed, others selectable
                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            if (answerStatus === 'idle' && !isEliminated) {
                              setSelectedOption(opt.label);
                            }
                          }}
                          disabled={answerStatus !== 'idle' || isEliminated}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                            isCorrectAnswer
                              ? 'border-green-400 bg-green-50'
                              : isWrongSelected
                              ? 'border-red-400 bg-red-50'
                              : isEliminated && answerStatus === 'idle'
                              ? 'border-gray-100 bg-gray-50 opacity-40'
                              : isSelected
                              ? 'border-violet-400 bg-violet-50'
                              : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/30'
                          } ${(answerStatus !== 'idle' || isEliminated) ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                            isCorrectAnswer
                              ? 'bg-green-500 text-white'
                              : isWrongSelected
                              ? 'bg-red-500 text-white'
                              : isEliminated && answerStatus === 'idle'
                              ? 'bg-gray-200 text-gray-400 line-through'
                              : isSelected
                              ? 'bg-violet-500 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`} style={{ fontWeight: 600 }}>
                            {isCorrectAnswer ? <CheckCircle className="w-4 h-4" /> : isWrongSelected ? <XCircle className="w-4 h-4" /> : opt.label}
                          </span>
                          <span className={`pt-1 text-sm ${
                            isCorrectAnswer ? 'text-green-700' : isWrongSelected ? 'text-red-700' : isEliminated && answerStatus === 'idle' ? 'text-gray-400 line-through' : 'text-gray-700'
                          }`}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Answer area - Fill */
                  <div className={`bg-white rounded-2xl border-2 p-4 ${
                    answerStatus === 'correct' ? 'border-green-300' : answerStatus === 'wrong' ? 'border-red-300' : 'border-gray-200'
                  }`}>
                    <input
                      value={fillAnswer}
                      onChange={e => answerStatus === 'idle' && setFillAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && answerStatus === 'idle' && handleSubmitAnswer()}
                      placeholder="在此输入你的答案..."
                      disabled={answerStatus !== 'idle'}
                      className={`w-full text-center text-lg py-3 border-b-2 bg-transparent focus:outline-none transition-colors ${
                        answerStatus === 'correct'
                          ? 'border-green-400 text-green-700'
                          : answerStatus === 'wrong'
                          ? 'border-red-400 text-red-700'
                          : 'border-gray-200 focus:border-violet-400 text-gray-800'
                      }`}
                    />
                    {answerStatus === 'wrong' && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 mt-3 text-center"
                      >
                        答案不太对，看看导师的提示再试试吧 →
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Correct answer: knowledge summary card */}
                <AnimatePresence>
                  {answerStatus === 'correct' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mt-5"
                    >
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Trophy className="w-5 h-5 text-green-500" />
                          <span className="text-green-700" style={{ fontWeight: 600 }}>
                            {wrongAttempts === 0 ? '一次答对！' : `经过 ${wrongAttempts} 次尝试，答对了！`}
                          </span>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700" style={{ fontWeight: 600 }}>知识点总结</span>
                          </div>
                          <p className="text-sm text-gray-700" style={{ lineHeight: '1.7' }}>
                            {currentQ?.explanation}
                          </p>
                        </div>
                        {wrongAttempts > 0 && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            记住这个思路，下次就不会再犯同样的错了
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wrong answer: nudge to look at tutor */}
                <AnimatePresence>
                  {answerStatus === 'wrong' && currentQ?.type === 'choice' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-amber-800" style={{ fontWeight: 500 }}>导师已经为你分析了错误原因</p>
                        <p className="text-xs text-amber-600 mt-0.5">看看右侧导师的提示，然后再试一次吧！</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom action bar */}
          <div className="bg-white border-t px-6 py-4 flex items-center justify-between shrink-0">
            <button
              onClick={() => setTutorOpen(!tutorOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                tutorOpen ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{tutorOpen ? '收起导师' : '问导师'}</span>
            </button>

            <div className="flex items-center gap-3">
              {answerStatus === 'idle' ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={currentQ?.type === 'choice' ? !selectedOption : !fillAnswer.trim()}
                  className="px-6 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  提交答案
                </button>
              ) : answerStatus === 'correct' ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  {currentQIdx < questions.length - 1 ? '下一题' : '查看结果'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  再试一次
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tutor sidebar */}
        <AnimatePresence>
          {tutorOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden shrink-0"
            >
              {/* Tutor header */}
              <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-700" style={{ fontWeight: 500 }}>学习导师</div>
                    <div className="text-xs text-gray-400">陪你解题，但不给答案</div>
                  </div>
                </div>
                <button onClick={() => setTutorOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Tutor messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {tutorMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-violet-400" />
                    </div>
                    <p className="text-sm text-gray-400">遇到不懂的题目可以问我</p>
                    <p className="text-xs text-gray-300 mt-1">我会给提示但不会给答案哦</p>
                  </div>
                )}
                {tutorMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-indigo-100' : 'bg-violet-100'
                    }`}>
                      {msg.role === 'user'
                        ? <User className="w-3.5 h-3.5 text-indigo-600" />
                        : <Bot className="w-3.5 h-3.5 text-violet-600" />
                      }
                    </div>
                    <div className={`max-w-[85%] px-3 py-2.5 rounded-xl whitespace-pre-wrap text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-700'
                    }`} style={{ lineHeight: '1.6' }}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {tutorTyping && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-xl flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={tutorBottomRef} />
              </div>

              {/* Quick actions */}
              <div className="px-3 pt-2 flex gap-1.5 flex-wrap shrink-0">
                {['看不懂这题', '给个提示', '解释一下知识点'].map(label => (
                  <button
                    key={label}
                    onClick={() => setTutorInput(label)}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-full text-gray-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tutor input */}
              <div className="p-3 flex gap-2 shrink-0">
                <input
                  value={tutorInput}
                  onChange={e => setTutorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTutorSend()}
                  placeholder="问导师..."
                  disabled={tutorTyping}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50"
                />
                <button
                  onClick={handleTutorSend}
                  disabled={!tutorInput.trim() || tutorTyping}
                  className="p-2 bg-violet-500 text-white rounded-xl disabled:opacity-40 hover:bg-violet-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
