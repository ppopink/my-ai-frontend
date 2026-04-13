import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { learningApi } from "../lib/api";
import { useLearningApp } from "../context/LearningAppContext";
import { COURSE_META, type CourseInfo } from "../courseCatalog";
import type { AppChatMessage } from "../types/learning";

interface InterviewModalProps {
  course: CourseInfo | null;
  open: boolean;
  onClose: () => void;
  onCompleted: (courseId: string) => void;
}

export function InterviewModal({ course, open, onClose, onCompleted }: InterviewModalProps) {
  const {
    userId,
    saveInterviewMessages,
    saveInterviewResult,
    saveInterviewSession,
    saveCoursePlan,
    setActiveCourseId,
  } = useLearningApp();
  const [messages, setMessages] = useState<AppChatMessage[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [replying, setReplying] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const courseTopics = useMemo(() => {
    if (!course) return [];
    return COURSE_META[course.id]?.keyTopics || [];
  }, [course]);

  useEffect(() => {
    if (!open || !course) return;

    let active = true;
    setStarting(true);
    setReplying(false);
    setGeneratingPlan(false);
    setError("");
    setInput("");
    setMessages([]);
    setSessionId("");

    void learningApi
      .startInterview({
        user_id: userId,
        course_id: course.id,
        course_type: course.courseType,
        course_title: course.name,
        course_summary: course.description,
        key_topics: courseTopics,
        rag_summary: null,
      })
      .then((result) => {
        if (!active) return;

        setSessionId(result.session_id);
        saveInterviewSession(course.id, result.session_id);

        const nextMessages: AppChatMessage[] = [
          {
            role: "assistant",
            content: result.agent_reply,
            timestamp: new Date().toISOString(),
          },
        ];
        setMessages(nextMessages);
        saveInterviewMessages(course.id, nextMessages);
      })
      .catch((startError) => {
        if (!active) return;
        setError(startError instanceof Error ? startError.message : "启动访谈失败");
      })
      .finally(() => {
        if (active) {
          setStarting(false);
        }
      });

    return () => {
      active = false;
    };
  }, [course, courseTopics, open, saveInterviewMessages, saveInterviewSession, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, starting, replying, generatingPlan]);

  const handleSend = async () => {
    if (!course || !sessionId || !input.trim() || replying || generatingPlan) return;

    const userMessage: AppChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    saveInterviewMessages(course.id, nextMessages);
    setInput("");
    setReplying(true);
    setError("");

    try {
      const result = await learningApi.replyInterview(sessionId, userMessage.content);
      const assistantMessage: AppChatMessage = {
        role: "assistant",
        content: result.agent_reply,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...nextMessages, assistantMessage];
      setMessages(updatedMessages);
      saveInterviewMessages(course.id, updatedMessages);

      if (!result.finished) {
        return;
      }

      if (result.interview_result) {
        saveInterviewResult(course.id, result.interview_result);
      }

      setGeneratingPlan(true);
      setActiveCourseId(course.id);

      const planResult = await learningApi.generateCoursePlan({
        user_id: userId,
        course_id: course.id,
        course_type: course.courseType,
        course_title: course.name,
        course_summary: course.description,
        key_topics: courseTopics,
        rag_summary: null,
        interview_session_id: result.session_id,
        interview_result: result.interview_result || null,
      });

      saveCoursePlan(course.id, planResult.data);
      onCompleted(course.id);
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : "访谈失败");
    } finally {
      setReplying(false);
      setGeneratingPlan(false);
    }
  };

  if (!course) {
    return null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Agent 1 访谈官</p>
                <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <span>{course.icon}</span>
                  <span>{course.name}</span>
                </h2>
                <p className="mt-1 text-sm text-slate-500">先聊几句，后端会据此生成真实课程蓝图。</p>
              </div>
              <button
                onClick={onClose}
                disabled={generatingPlan}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5">
              {starting ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-500">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-500" />
                  <p className="font-medium">正在启动访谈会话...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";
                    return (
                      <div key={`${message.timestamp || index}-${message.role}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ${
                            isUser
                              ? "bg-violet-600 text-white"
                              : "border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}

                  {(replying || generatingPlan) && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[80%] items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                        {generatingPlan ? "访谈完成，正在生成课程蓝图..." : "访谈官正在思考下一句..."}
                      </div>
                    </div>
                  )}

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      <p className="font-medium">接口调用失败</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                每次只回一句，前端会继续调用 `POST /api/interview/reply`
              </div>
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleSend();
                    }
                  }}
                  placeholder="输入你的回答..."
                  disabled={starting || replying || generatingPlan || Boolean(error && !sessionId)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || starting || replying || generatingPlan}
                  className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  继续
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
