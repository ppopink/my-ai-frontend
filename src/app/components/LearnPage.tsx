<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  MessageCircle,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  StickyNote,
} from "lucide-react";
import { getCourseById } from "../courseCatalog";
import { learningApi } from "../lib/api";
import { useLearningApp } from "../context/LearningAppContext";
import { MessageBubble } from "./MessageBubble";
import type { AppChatMessage, CourseChapter, CourseSection, PracticeQuestion } from "../types/learning";

function resolveTutorStyle() {
  const raw = localStorage.getItem("lp_ai_style");
  if (raw === "精炼直接型" || raw === "幽默风趣型" || raw === "鼓励引导型") {
    return raw;
  }
  if (raw === "concise" || raw === "direct") return "精炼直接型";
  if (raw === "humorous" || raw === "humor") return "幽默风趣型";
  return "鼓励引导型";
}

function resolveDifficultyPreference() {
  const raw = localStorage.getItem("lp_difficulty");
  if (!raw || raw === "adaptive") return "匹配当前水平";
  if (raw === "easy") return "从简单到稍难";
  if (raw === "hard") return "更有挑战";
  return raw;
}

function buildQuestionContext(section: CourseSection, question?: PracticeQuestion) {
  const lines = [
    `当前小节：${section.title}`,
    `学习目标：${section.objective || "未提供"}`,
    `关键点：${section.key_points.join("、") || "未提供"}`,
  ];

  if (question) {
    lines.push(`当前题目：${question.question}`);
    if (question.options?.length) {
      lines.push(
        `题目选项：${question.options.map((option) => `${option.label}. ${option.text}`).join(" | ")}`,
      );
    }
  }

  return lines.join("\n");
}

function getCompletedChapterIds(chapters: CourseChapter[], completedSectionIds: string[]) {
  const completedSet = new Set(completedSectionIds);
  return chapters
    .filter((chapter) => chapter.sections.length > 0 && chapter.sections.every((section) => completedSet.has(section.id)))
    .map((chapter) => chapter.id);
}
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
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
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d

export function LearnPage() {
  const { courseId, itemId } = useParams<{ courseId: string; itemId: string }>();
  const navigate = useNavigate();
<<<<<<< HEAD
<<<<<<< HEAD
  const {
    userId,
    coursePlans,
    progressSnapshots,
    currentPositions,
    getTutorMessages,
    saveTutorMessages,
    saveProgressSnapshot,
    saveCoursePlan,
    saveCurrentPosition,
    setActiveCourseId,
  } = useLearningApp();
  const course = getCourseById(courseId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState("");
  const [tutorOpen, setTutorOpen] = useState(true);
  const [lastTutorPrompt, setLastTutorPrompt] = useState("");
  const tutorAbortRef = useRef<AbortController | null>(null);
  const enterSectionRef = useRef<string>("");
  const completionRef = useRef<Set<string>>(new Set());

  const plan = courseId ? coursePlans[courseId] : undefined;
  const progress = courseId ? progressSnapshots[courseId]?.progress : undefined;

  useEffect(() => {
    if (!courseId) return;

    setActiveCourseId(courseId);
    let active = true;

    async function hydrate() {
      setLoading(true);
      setError("");

      try {
        if (!plan) {
          const coursePlanResult = await learningApi.getCoursePlan(userId, courseId);
          if (active && coursePlanResult.data) {
            saveCoursePlan(courseId, coursePlanResult.data);
          }
        }

        try {
          const progressResult = await learningApi.getProgress(userId, courseId);
          if (active && progressResult.data) {
            saveProgressSnapshot(courseId, progressResult.data);
          }
        } catch (progressError) {
          if (progressError instanceof Error && !progressError.message.includes("未找到该课程的学习进度")) {
            console.error(progressError);
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "学习页加载失败");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
      tutorAbortRef.current?.abort();
    };
  }, [courseId, plan, saveCoursePlan, saveProgressSnapshot, setActiveCourseId, userId]);

  const flatSections = useMemo(
    () =>
      plan?.chapters.flatMap((chapter) =>
        chapter.sections.map((section) => ({
          chapter,
          section,
        })),
      ) || [],
    [plan],
  );

  const sectionEntry = useMemo(
    () => flatSections.find((entry) => entry.section.id === itemId) || null,
    [flatSections, itemId],
  );

  const questions = sectionEntry?.section.practice_questions || [];
  const currentQ = questions[currentQIdx];
  const tutorMessages = courseId ? getTutorMessages(courseId, itemId) : [];
  const completedSectionIds = progress?.completed_section_ids || [];
  const completedSectionsSet = useMemo(() => new Set(completedSectionIds), [completedSectionIds]);
  const nextSection = sectionEntry
    ? flatSections.findIndex((entry) => entry.section.id === sectionEntry.section.id) < flatSections.length - 1
      ? flatSections[flatSections.findIndex((entry) => entry.section.id === sectionEntry.section.id) + 1]
      : null
    : null;

  useEffect(() => {
    setCurrentQIdx(0);
    setSelectedOption(null);
    setFillAnswer("");
    setAnswerStatus("idle");
    setCorrectCount(0);
    setShowResult(false);
  }, [itemId]);

  useEffect(() => {
    if (!courseId || !sectionEntry) return;

    const positionKey = `${courseId}:${sectionEntry.section.id}`;
    if (enterSectionRef.current === positionKey) return;
    enterSectionRef.current = positionKey;

    saveCurrentPosition(courseId, {
      chapterId: sectionEntry.chapter.id,
      chapterTitle: sectionEntry.chapter.title,
      sectionId: sectionEntry.section.id,
      sectionTitle: sectionEntry.section.title,
    });

    void learningApi
      .updateProgress({
        user_id: userId,
        course_id: courseId,
        current_chapter_id: sectionEntry.chapter.id,
        current_chapter_title: sectionEntry.chapter.title,
        current_section_id: sectionEntry.section.id,
        current_section_title: sectionEntry.section.title,
        completed_chapter_ids: progress?.completed_chapter_ids || [],
        completed_section_ids: completedSectionIds,
        event_type: "enter_section",
        progress_meta: {
          source: "frontend",
          route: "learn_page",
        },
      })
      .then((result) => {
        if (result.data) {
          saveProgressSnapshot(courseId, result.data);
        }
      })
      .catch((progressError) => {
        console.error("Failed to report enter_section", progressError);
      });
  }, [
    completedSectionIds,
    courseId,
    progress?.completed_chapter_ids,
    saveCurrentPosition,
    saveProgressSnapshot,
    sectionEntry,
    userId,
  ]);

  const commitSectionCompletion = async () => {
    if (!courseId || !plan || !sectionEntry) return;

    const completionKey = `${courseId}:${sectionEntry.section.id}`;
    if (completionRef.current.has(completionKey)) return;
    completionRef.current.add(completionKey);

    const nextCompletedSections = Array.from(new Set([...completedSectionIds, sectionEntry.section.id]));
    const nextCompletedChapters = getCompletedChapterIds(plan.chapters, nextCompletedSections);

    try {
      const result = await learningApi.updateProgress({
        user_id: userId,
        course_id: courseId,
        current_chapter_id: sectionEntry.chapter.id,
        current_chapter_title: sectionEntry.chapter.title,
        current_section_id: sectionEntry.section.id,
        current_section_title: sectionEntry.section.title,
        completed_chapter_ids: nextCompletedChapters,
        completed_section_ids: nextCompletedSections,
        event_type: "complete_section",
        progress_meta: {
          source: "frontend",
          score: questions.length ? Math.round((correctCount / questions.length) * 100) : 0,
        },
      });
      if (result.data) {
        saveProgressSnapshot(courseId, result.data);
      }
    } catch (completionError) {
      console.error("Failed to report complete_section", completionError);
      completionRef.current.delete(completionKey);
    }
  };

  const sendTutorMessage = async (messageContent: string, userAction: string) => {
    if (!courseId || !sectionEntry || !messageContent.trim()) return;

    const history = [...tutorMessages];
    const userMessage: AppChatMessage = {
      role: "user",
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
    };
    const pendingAssistant: AppChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...history, userMessage, pendingAssistant];

    saveTutorMessages(courseId, itemId, nextMessages);
    setTutorLoading(true);
    setTutorError("");
    setTutorInput("");
    setTutorOpen(true);
    setLastTutorPrompt(messageContent.trim());

    tutorAbortRef.current?.abort();
    const controller = new AbortController();
    tutorAbortRef.current = controller;

    const payload = {
      user_id: userId,
      course_id: courseId,
      chapter_id: sectionEntry.chapter.id,
      chapter_title: sectionEntry.chapter.title,
      section_id: sectionEntry.section.id,
      section_title: sectionEntry.section.title,
      difficulty_preference: resolveDifficultyPreference(),
      tutor_style: resolveTutorStyle(),
      question_context: buildQuestionContext(sectionEntry.section, currentQ),
      user_action: userAction,
      messages: [...history, userMessage].map(({ role, content }) => ({ role, content })),
    };

    let assistantReply = "";

    try {
      assistantReply = await learningApi.streamTutorChat(payload, {
        signal: controller.signal,
        onChunk(nextText) {
          saveTutorMessages(courseId, itemId, [...history, userMessage, { ...pendingAssistant, content: nextText }]);
        },
      });
    } catch (streamError) {
      if (controller.signal.aborted) {
        tutorAbortRef.current = null;
        setTutorLoading(false);
        saveTutorMessages(courseId, itemId, [...history, userMessage]);
        return;
      }

      try {
        const fallback = await learningApi.tutorRespond(payload);
        assistantReply = fallback.reply;
        saveTutorMessages(courseId, itemId, [...history, userMessage, { ...pendingAssistant, content: assistantReply }]);
      } catch (fallbackError) {
        setTutorError(fallbackError instanceof Error ? fallbackError.message : "导师响应失败");
        saveTutorMessages(courseId, itemId, history);
        setTutorLoading(false);
        return;
      }
    }

    setTutorLoading(false);
    tutorAbortRef.current = null;

    void learningApi
      .analyzeInteraction({
        user_id: userId,
        course_id: courseId,
        chapter_id: sectionEntry.chapter.id,
        chapter_title: sectionEntry.chapter.title,
        section_id: sectionEntry.section.id,
        section_title: sectionEntry.section.title,
        interaction_type: "tutor_dialogue",
        tutor_style: payload.tutor_style,
        question_context: payload.question_context,
        user_action: userAction,
        user_message: userMessage.content,
        tutor_reply: assistantReply,
        user_feedback: "",
        messages: [...history, userMessage, { role: "assistant", content: assistantReply }],
      })
      .catch((profileError) => {
        console.error("Failed to analyze interaction", profileError);
      });
  };

  const handleSubmitAnswer = async () => {
    if (!currentQ) return;

    const userAnswer = currentQ.type === "choice" ? selectedOption : fillAnswer.trim();
    if (!userAnswer) return;

    const isCorrect =
      currentQ.type === "choice"
        ? userAnswer === currentQ.answer
        : userAnswer.toLowerCase() === String(currentQ.answer || "").toLowerCase();

    if (isCorrect) {
      setAnswerStatus("correct");
      setCorrectCount((prev) => prev + 1);
      return;
    }

    setAnswerStatus("wrong");
  };

  const handleNextQuestion = async () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx((prev) => prev + 1);
      setSelectedOption(null);
      setFillAnswer("");
      setAnswerStatus("idle");
      return;
    }

    setShowResult(true);
    await commitSectionCompletion();
  };

  const handleRetryQuestion = () => {
    setAnswerStatus("idle");
    setSelectedOption(null);
    setFillAnswer("");
  };

  if (!courseId || loading && !plan) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center text-slate-500">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="font-medium">正在准备课程内容与学习上下文...</p>
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  const course = COURSES.find(c => c.id === courseId);

  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
  const curriculum = curricula[courseId!];

  const allSections: CurriculumSection[] = curriculum?.chapters?.flatMap(ch => ch.sections) || [];
  const sectionFromChapters = allSections.find(s => s.id === itemId);
  const sectionIndex = allSections.findIndex(s => s.id === itemId);
  const item = sectionFromChapters || curriculum?.items.find(i => i.id === itemId);

  const questions = useMemo(() => {
    if (!item) return [];
    return generateQuizQuestions(courseId!, itemId!, item.title);
  }, [courseId, itemId, item?.title]);

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
    curricula[courseId!] = curriculum;
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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/study/tutor-chat/stream`, {
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
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      </div>
    );
  }

<<<<<<< HEAD
<<<<<<< HEAD
  if (!plan || !sectionEntry) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-3 text-lg font-semibold text-slate-800">未找到当前小节</p>
        <p className="mb-6 text-sm text-slate-500">{error || "请先回到课程目录重新选择章节。"}</p>
        <button
          onClick={() => navigate(courseId ? `/curriculum/${courseId}` : "/")}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          返回课程目录
        </button>
      </div>
    );
  }

  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const learnerPosition = currentPositions[courseId] || {};

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3">
          <button onClick={() => navigate(`/curriculum/${courseId}`)} className="rounded-xl p-2 transition hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">{course?.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="truncate text-base font-semibold text-slate-900">{sectionEntry.section.title}</h1>
              {progress?.current_section_id === sectionEntry.section.id ? (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">当前小节</span>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setTutorOpen((prev) => !prev)}
            className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 lg:flex xl:hidden"
          >
            <MessageCircle className="h-4 w-4" />
            {tutorOpen ? "收起导师" : "打开导师"}
          </button>
          <button
            onClick={() => navigate(`/notes/${courseId}`)}
            className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
          >
            <StickyNote className="h-4 w-4" />
            笔记区
          </button>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 px-4 py-4">
        <aside className="hidden w-[320px] shrink-0 overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-4 xl:block">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">课程树</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{plan.title || course?.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
          </div>
          <div className="space-y-4">
            {plan.chapters.map((chapter) => (
              <div key={chapter.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{chapter.title}</p>
                <p className="mt-1 text-xs text-slate-400">{chapter.description}</p>
                <div className="mt-3 space-y-2">
                  {chapter.sections.map((section) => {
                    const active = section.id === sectionEntry.section.id;
                    const completed = completedSectionsSet.has(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => navigate(`/learn/${courseId}/${section.id}`)}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                          active ? "bg-violet-100 text-violet-700" : "bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Play className={`h-4 w-4 ${active ? "text-violet-600" : "text-slate-300"}`} />
                        )}
                        <span className="line-clamp-1 text-sm">{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {sectionEntry.chapter.title}
              </span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                学习页已接 Agent 2 / 3 / 4 / 6
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{sectionEntry.section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{sectionEntry.section.objective || "本节将围绕课程蓝图里的关键知识点展开。"}</p>

            {sectionEntry.section.key_points.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {sectionEntry.section.key_points.map((point) => (
                  <span key={point} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                    {point}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              <p className="font-medium text-slate-700">当前学习定位</p>
              <p className="mt-1">
                章节：{learnerPosition.chapterTitle || sectionEntry.chapter.title}，小节：
                {learnerPosition.sectionTitle || sectionEntry.section.title}
              </p>
            </div>
          </section>

          {showResult ? (
            <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto max-w-xl">
                <div className="mb-4 text-6xl">{accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}</div>
                <h3 className="text-2xl font-bold text-slate-900">本节练习完成</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  已经把这次小节完成状态上报给后端了，Agent 6 后续就能准确回答“你学到哪了”。
                </p>
                <div className="mt-6 grid gap-3 rounded-3xl bg-slate-50 p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{correctCount}</p>
                    <p className="text-xs text-slate-400">答对</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-500">{questions.length - correctCount}</p>
                    <p className="text-xs text-slate-400">答错</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{accuracy}%</p>
                    <p className="text-xs text-slate-400">正确率</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  {nextSection ? (
                    <button
                      onClick={() => navigate(`/learn/${courseId}/${nextSection.section.id}`)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                      下一节
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    onClick={() => navigate(`/curriculum/${courseId}`)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    返回目录
                  </button>
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setCurrentQIdx(0);
                      setSelectedOption(null);
                      setFillAnswer("");
                      setAnswerStatus("idle");
                      setCorrectCount(0);
                    }}
                    className="rounded-2xl px-5 py-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
                  >
                    重新练习
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">练习区</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {questions.length > 0 ? `第 ${currentQIdx + 1} / ${questions.length} 题` : "当前小节暂无练习题"}
                  </h3>
                </div>
                {questions.length > 0 ? (
                  <div className="flex items-center gap-2">
                    {questions.map((question, index) => (
                      <div
                        key={question.id || index}
                        className={`h-2.5 w-2.5 rounded-full ${
                          index === currentQIdx ? "bg-violet-500" : index < currentQIdx ? "bg-emerald-400" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {questions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  <p>课程蓝图里当前小节还没有练习题。</p>
                  <p className="mt-2">你可以直接用右侧导师面板围绕当前小节继续追问。</p>
                </div>
              ) : currentQ ? (
                <>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="whitespace-pre-wrap text-base leading-8 text-slate-800">{currentQ.question}</p>
                  </div>

                  {currentQ.type === "choice" ? (
                    <div className="mt-5 space-y-3">
                      {currentQ.options?.map((option) => {
                        const selected = selectedOption === option.label;
                        const correct = answerStatus === "correct" && option.label === currentQ.answer;
                        const wrong = answerStatus === "wrong" && selected;
                        return (
                          <button
                            key={option.label}
                            onClick={() => answerStatus === "idle" && setSelectedOption(option.label)}
                            disabled={answerStatus !== "idle"}
                            className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-4 text-left transition ${
                              correct
                                ? "border-emerald-300 bg-emerald-50"
                                : wrong
                                ? "border-rose-300 bg-rose-50"
                                : selected
                                ? "border-violet-300 bg-violet-50"
                                : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                correct
                                  ? "bg-emerald-500 text-white"
                                  : wrong
                                  ? "bg-rose-500 text-white"
                                  : selected
                                  ? "bg-violet-500 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {option.label}
                            </span>
                            <span className="pt-1 text-sm leading-7 text-slate-700">{option.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <input
                        value={fillAnswer}
                        onChange={(event) => answerStatus === "idle" && setFillAnswer(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            void handleSubmitAnswer();
                          }
                        }}
                        placeholder="输入你的答案..."
                        disabled={answerStatus !== "idle"}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400"
                      />
                    </div>
                  )}

                  {answerStatus === "correct" ? (
                    <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-semibold">答对了，继续保持</span>
                      </div>
                      {currentQ.explanation ? (
                        <p className="mt-3 text-sm leading-7 text-emerald-800">{currentQ.explanation}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {answerStatus === "wrong" ? (
                    <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                      <p className="text-sm font-semibold text-amber-800">这题还差一点点。</p>
                      <p className="mt-2 text-sm leading-7 text-amber-700">
                        你可以先自己再试一次，或者让右侧导师给一个一步提示。后端会根据当前题目上下文来生成引导式回复。
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={handleRetryQuestion}
                          className="rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          再试一次
                        </button>
                        <button
                          onClick={() =>
                            void sendTutorMessage(
                              `我刚刚在这道题上答错了，请不要直接告诉我答案，先给我一个一步提示。`,
                              "用户在练习题上答错后请求一步提示",
                            )
                          }
                          className="rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
                        >
                          请导师提示
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {answerStatus === "idle" ? (
                      <button
                        onClick={() => void handleSubmitAnswer()}
                        disabled={currentQ.type === "choice" ? !selectedOption : !fillAnswer.trim()}
                        className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        提交答案
                      </button>
                    ) : answerStatus === "correct" ? (
                      <button
                        onClick={() => void handleNextQuestion()}
                        className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                      >
                        {currentQIdx < questions.length - 1 ? "下一题" : "完成本节"}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </>
              ) : null}
            </section>
          )}
        </main>

        <aside
          className={`${
            tutorOpen ? "flex" : "hidden"
          } min-w-0 w-full max-w-[380px] shrink-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:flex`}
        >
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Agent 3 陪伴导师</p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">实时导师面板</h2>
                <p className="mt-1 text-sm text-slate-500">流式接口优先，失败时会自动退回一次性回复。</p>
              </div>
              <button
                onClick={() => setTutorOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 xl:hidden"
              >
                <Square className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
            {tutorMessages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-sm leading-7 text-slate-500">
                <p className="font-semibold text-slate-700">还没有开始和导师对话</p>
                <p className="mt-2">
                  你可以问概念、问当前题目、问“我下一步应该怎么想”，前端会自动把课程、章节、小节和题目上下文一起传给后端。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tutorMessages.map((message, index) => (
                  <MessageBubble
                    key={`${message.timestamp || index}-${message.role}`}
                    content={message.content}
                    role={message.role === "user" ? "user" : "assistant"}
                    isStreaming={tutorLoading && index === tutorMessages.length - 1 && message.role === "assistant"}
                  />
                ))}
              </div>
            )}

            {tutorError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                <p className="font-semibold">导师请求失败</p>
                <p className="mt-1">{tutorError}</p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  void sendTutorMessage(
                    "请根据我当前这节内容，先给我一个最关键的学习抓手。",
                    "用户请求当前小节的学习抓手",
                  )
                }
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
              >
                本节怎么抓重点？
              </button>
              {currentQ ? (
                <button
                  onClick={() =>
                    void sendTutorMessage(
                      "请围绕当前题目给我一个一步提示，不要直接告诉我答案。",
                      "用户请求当前题目的一步提示",
                    )
                  }
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  当前题目提示
                </button>
              ) : null}
            </div>

            <div className="flex gap-3">
              <textarea
                value={tutorInput}
                onChange={(event) => setTutorInput(event.target.value)}
                placeholder="问导师：我这题该从哪里下手？"
                rows={3}
                disabled={tutorLoading}
                className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
              />
              <button
                onClick={() =>
                  void sendTutorMessage(
                    tutorInput,
                    currentQ ? "用户围绕当前题目主动向导师提问" : "用户围绕当前小节主动向导师提问",
                  )
                }
                disabled={!tutorInput.trim() || tutorLoading}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {tutorLoading ? (
                <button
                  onClick={() => tutorAbortRef.current?.abort()}
                  className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  <Square className="h-3.5 w-3.5" />
                  中断回复
                </button>
              ) : (
                <button
                  onClick={() =>
                    void sendTutorMessage(
                      lastTutorPrompt,
                      currentQ ? "用户重试当前题目的导师提问" : "用户重试当前小节的导师提问",
                    )
                  }
                  disabled={!lastTutorPrompt}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  重试
                </button>
              )}

              <button
                onClick={() => {
                  saveTutorMessages(courseId, itemId, []);
                  setTutorError("");
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                清空会话
              </button>

              {!tutorOpen ? (
                <button
                  onClick={() => setTutorOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-100"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  展开导师
                </button>
              ) : null}
            </div>

            {error ? (
              <p className="mt-3 text-xs text-amber-600">{error}</p>
            ) : null}
          </div>
        </aside>
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
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
                onClick={() => navigate(`/learn/${courseId}/${nextSection.id}`)}
                className="w-full py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
              >
                下一节 <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate(`/curriculum/${courseId}`)}
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
          <button onClick={() => navigate(`/curriculum/${courseId}`)} className="p-1.5 hover:bg-gray-100 rounded-lg">
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
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      </div>
    </div>
  );
}
