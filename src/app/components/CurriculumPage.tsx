<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Circle,
  Play,
  StickyNote,
  Target,
} from "lucide-react";
import { getCourseById } from "../courseCatalog";
import { learningApi } from "../lib/api";
import { useLearningApp } from "../context/LearningAppContext";

export function CurriculumPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const {
    userId,
    coursePlans,
    progressSnapshots,
    saveCoursePlan,
    saveProgressSnapshot,
    setActiveCourseId,
    saveCurrentPosition,
  } = useLearningApp();
  const course = getCourseById(courseId);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          const curriculum = await learningApi.getCoursePlan(userId, courseId);
          if (active && curriculum.data) {
            saveCoursePlan(courseId, curriculum.data);
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
          setError(loadError instanceof Error ? loadError.message : "课程蓝图加载失败");
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
    };
  }, [courseId, plan, saveCoursePlan, saveProgressSnapshot, setActiveCourseId, userId]);

  useEffect(() => {
    if (!plan?.chapters.length) return;
    setExpandedChapters(new Set([plan.chapters[0].id]));
  }, [plan?.chapters]);

  const completedSections = useMemo(
    () => new Set(progress?.completed_section_ids || []),
    [progress?.completed_section_ids],
  );
  const currentSectionId = progress?.current_section_id || null;
  const currentChapterId = progress?.current_chapter_id || null;
  const totalSections = progress?.section_total ?? plan?.chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0) ?? 0;
  const completedCount = progress?.completed_section_count ?? completedSections.size;
  const progressPercent = Math.round(progress?.section_progress_percent ?? 0);

  const continueSection = currentSectionId || plan?.chapters[0]?.sections[0]?.id;

  const openSection = (chapterId: string, chapterTitle: string, sectionId: string, sectionTitle: string) => {
    if (!courseId) return;
    saveCurrentPosition(courseId, {
      chapterId,
      chapterTitle,
      sectionId,
      sectionTitle,
    });
    navigate(`/learn/${courseId}/${sectionId}`);
  };

  if (!courseId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">
        <p>课程不存在。</p>
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Play, Lock, ArrowLeft, StickyNote, ChevronDown, BookOpen } from 'lucide-react';
import { COURSES, STORAGE_KEYS, loadData, type Curriculum, type CurriculumChapter, type CurriculumSection } from '../store';

export function CurriculumPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const { syllabusData, isCustom: isCustomFromState, courseTitle: courseTitleFromState } = (location.state as any) || {};
  const navigate = useNavigate();

  const course = isCustomFromState 
    ? { id: 'custom', name: courseTitleFromState || '自定义课程', icon: '✨', color: '#8b5cf6' }
    : COURSES.find(c => c.id === courseId);

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [customSyllabus, setCustomSyllabus] = useState<any>(syllabusData || null);
  const [isLoading, setIsLoading] = useState(!syllabusData);

  // 1. 数据拉取 Hook
  useEffect(() => {
    if (customSyllabus) {
      setIsLoading(false);
      return;
    }

    const fetchSyllabus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/curriculum/${courseId}?user_id=user_123`);
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            setCustomSyllabus(result.data);
          }
        }
      } catch (error) {
        console.error("获取专属大纲失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSyllabus();
  }, [courseId, customSyllabus]);

  // 2. 基础数据与合并逻辑 (非 Hook)
  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
  let curriculum = curricula[courseId!];

  if (customSyllabus) {
    const rawChapters = Array.isArray(customSyllabus) 
      ? customSyllabus 
      : (customSyllabus?.chapters || []);

    const mappedChapters: CurriculumChapter[] = rawChapters.map((ch: any, chIdx: number) => ({
      id: `custom-ch-${chIdx}`,
      title: ch.chapter_title || ch.title || "未知章节",
      description: ch.description || "AI 为你量身定制的章节",
      sections: (ch.sections || []).map((sec: any, secIdx: number) => {
        const secTitle = typeof sec === 'string' ? sec : (sec.title || "未知节");
        return {
          id: `custom-sec-${chIdx}-${secIdx}`,
          title: secTitle,
          description: typeof sec === 'object' ? (sec.description || "") : "",
          progress: 0,
          completed: false,
          understanding: 'none',
          content: ''
        };
      })
    }));

    if (!curriculum) {
      curriculum = { courseId: courseId!, chapters: mappedChapters } as Curriculum;
    } else {
      curriculum = { ...curriculum, chapters: mappedChapters };
    }
  }

  const chapters = curriculum?.chapters || [];
  const allSections = chapters.flatMap(ch => ch.sections);
  const totalSections = allSections.length;
  const completedSections = allSections.filter(s => s.completed).length;
  const totalProgress = totalSections > 0
    ? Math.round(allSections.reduce((s, sec) => s + sec.progress, 0) / totalSections)
    : 0;

  // 3. 访问控制 Hook (依然要在 return 之前调用)
  const sectionAccessMap = useMemo(() => {
    const map = new Map<string, boolean>();
    let prevAccessible = true;
    for (const ch of chapters) {
      for (const sec of ch.sections) {
        const accessible = prevAccessible || sec.progress > 0;
        map.set(sec.id, accessible);
        prevAccessible = sec.progress > 0 || sec.completed;
      }
    }
    return map;
  }, [chapters]);

  // 工具函数搬移到这里 (或者保持原位，只要不在 Hook 之后 return 即可)
  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const expandAll = () => {
    if (expandedChapters.size === chapters.length) {
      setExpandedChapters(new Set());
    } else {
      setExpandedChapters(new Set(chapters.map(ch => ch.id)));
    }
  };

  const understandingLabel = (u: string) => {
    switch (u) {
      case 'advanced': return { text: '熟练', color: 'text-green-600 bg-green-50', dot: 'bg-green-500' };
      case 'intermediate': return { text: '中等', color: 'text-yellow-600 bg-yellow-50', dot: 'bg-yellow-500' };
      case 'beginner': return { text: '入门', color: 'text-orange-600 bg-orange-50', dot: 'bg-orange-500' };
      default: return { text: '未学', color: 'text-gray-400 bg-gray-50', dot: 'bg-gray-300' };
    }
  };

  const getChapterProgress = (ch: CurriculumChapter) => {
    if (ch.sections.length === 0) return 0;
    return Math.round(ch.sections.reduce((s, sec) => s + sec.progress, 0) / ch.sections.length);
  };

  const getChapterStatus = (ch: CurriculumChapter) => {
    const allCompleted = ch.sections.every(s => s.completed);
    const anyStarted = ch.sections.some(s => s.progress > 0);
    if (allCompleted) return 'completed';
    if (anyStarted) return 'in-progress';
    return 'not-started';
  };

  // ==========================================
  // 4. 终于安全了！这里可以放心地进行流程控制
  // ==========================================
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 animate-pulse">正在从云端获取你的专属学习计划...</p>
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
      </div>
    );
  }

<<<<<<< HEAD
<<<<<<< HEAD
  if (loading && !plan) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center text-slate-500">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="font-medium">正在从后端加载课程蓝图...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="mb-3 text-lg font-semibold text-slate-800">还没有生成这门课程的蓝图</p>
        <p className="mb-6 text-sm text-slate-500">{error || "请先回到首页完成访谈，再生成课程蓝图。"}</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          返回首页开始
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  if (!curriculum || chapters.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">你还没有开始这门课程</p>
        <button onClick={() => navigate(`/interview/${courseId}`)} className="px-6 py-2 bg-violet-500 text-white rounded-lg">
          开始采访
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
        </button>
      </div>
    );
  }

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="rounded-xl p-2 transition hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <span>{course?.icon}</span>
            <span>{plan.title || course?.name}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">{plan.description || course?.description}</p>
        </div>
        <button
          onClick={() => navigate(`/notes/${courseId}`)}
          className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
        >
          <StickyNote className="h-4 w-4" />
          笔记区
        </button>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Agent 2 课程架构师</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">课程概览</h2>
            </div>
            {continueSection ? (
              <button
                onClick={() =>
                  openSection(
                    progress?.current_chapter_id || plan.chapters[0]?.id,
                    progress?.current_chapter_title || plan.chapters[0]?.title || "",
                    continueSection,
                    progress?.current_section_title ||
                      plan.chapters.flatMap((chapter) => chapter.sections).find((section) => section.id === continueSection)?.title ||
                      "",
                  )
                }
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                {currentSectionId ? "继续学习" : "开始学习"}
              </button>
            ) : null}
          </div>

          <div className="mb-5 rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
              <span>
                已完成 {completedCount}/{totalSections} 个小节
              </span>
              <span className="font-semibold text-violet-600">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {plan.course_objectives.length > 0 ? (
            <div className="mb-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Target className="h-4 w-4 text-violet-500" />
                学习目标
              </h3>
              <div className="flex flex-wrap gap-2">
                {plan.course_objectives.map((objective) => (
                  <span
                    key={objective}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
                  >
                    {objective}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {plan.recommended_start_point ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <span className="font-semibold">推荐起点：</span>
              {plan.recommended_start_point}
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <BookOpen className="h-5 w-5 text-violet-500" />
            学习定位
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前章节</p>
              <p className="mt-2 font-medium text-slate-800">{progress?.current_chapter_title || "尚未开始"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前小节</p>
              <p className="mt-2 font-medium text-slate-800">{progress?.current_section_title || "从第一节开始最稳妥"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">最近活动</p>
              <p className="mt-2 font-medium text-slate-800">{progress?.last_activity_at || "暂无上报记录"}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        {plan.chapters.map((chapter, chapterIndex) => {
          const expanded = expandedChapters.has(chapter.id);
          const sectionTotal = chapter.sections.length;
          const chapterCompleted = chapter.sections.filter((section) => completedSections.has(section.id)).length;
          const isCurrentChapter = currentChapterId === chapter.id;
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="flex items-center gap-2">
            <span>{course?.icon}</span>
            <span>{course?.name}</span>
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-500">{chapters.length} 章 · {totalSections} 节</span>
            <span className="text-sm text-gray-500">{completedSections}/{totalSections} 节完成</span>
            <span className="text-sm text-gray-500">总进度 {totalProgress}%</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/notes/${courseId}`)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
        >
          <StickyNote className="w-4 h-4" /> 笔记
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${totalProgress}%`, backgroundColor: course?.color }}
        />
      </div>

      {/* Expand/Collapse toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={expandAll}
          className="text-sm text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1"
        >
          <BookOpen className="w-4 h-4" />
          {expandedChapters.size === chapters.length ? '全部收起' : '全部展开'}
        </button>
      </div>

      {/* Chapters Accordion */}
      <div className="space-y-3">
        {chapters.map((chapter, chIdx) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const chProgress = getChapterProgress(chapter);
          const chStatus = getChapterStatus(chapter);
          const completedInCh = chapter.sections.filter(s => s.completed).length;
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
<<<<<<< HEAD
              transition={{ delay: chapterIndex * 0.05 }}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() =>
                  setExpandedChapters((prev) => {
                    const next = new Set(prev);
                    if (next.has(chapter.id)) {
                      next.delete(chapter.id);
                    } else {
                      next.add(chapter.id);
                    }
                    return next;
                  })
                }
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isCurrentChapter ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {chapterCompleted === sectionTotal && sectionTotal > 0 ? (
                    <BookOpen className="h-5 w-5" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">{chapter.title}</h3>
                    {isCurrentChapter ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                        当前章节
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{chapter.description || "课程架构师为你安排的小节路径"}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {chapterCompleted}/{sectionTotal} 小节完成
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>

              {expanded ? (
                <div className="border-t border-slate-100 bg-slate-50/80 p-4">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {chapter.learning_goals.map((goal) => (
                      <span key={goal} className="rounded-full bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {chapter.sections.map((section) => {
                      const completed = completedSections.has(section.id);
                      const active = currentSectionId === section.id;

                      return (
                        <button
                          key={section.id}
                          onClick={() => openSection(chapter.id, chapter.title, section.id, section.title)}
                          className={`group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? "border-violet-200 bg-violet-50"
                              : "border-transparent bg-white hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div
                            className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full ${
                              completed
                                ? "bg-emerald-100 text-emerald-600"
                                : active
                                ? "bg-violet-100 text-violet-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {completed ? <BookOpen className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-800">{section.title}</p>
                              {active ? (
                                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                                  当前
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{section.objective || "进入学习页查看本节目标与题目。"}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {section.key_points.slice(0, 4).map((point) => (
                                <span key={point} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-violet-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
              transition={{ delay: chIdx * 0.04 }}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
            >
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                {/* Status indicator */}
                <div className="shrink-0">
                  {chStatus === 'completed' ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  ) : chStatus === 'in-progress' ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${course?.color}15` }}>
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: course?.color }}>
                        <div className="w-2 h-2 rounded-full m-[2px]" style={{ backgroundColor: course?.color }} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Circle className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Chapter info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-800 truncate">{chapter.title}</h3>
                    {chProgress > 0 && chStatus !== 'completed' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 shrink-0">{chProgress}%</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{chapter.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{chapter.sections.length} 节</span>
                    {completedInCh > 0 && (
                      <span className="text-xs text-green-500">{completedInCh} 节完成</span>
                    )}
                  </div>
                </div>

                {/* Chapter progress bar (mini) */}
                {chProgress > 0 && (
                  <div className="w-16 shrink-0">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${chProgress}%`, backgroundColor: course?.color }}
                      />
                    </div>
                  </div>
                )}

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {/* Sections (expandable) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 bg-gray-50/50">
                      {chapter.sections.map((section, sIdx) => {
                        const accessible = sectionAccessMap.get(section.id) ?? false;
                        const u = understandingLabel(section.understanding);

                        return (
                          <div
                            key={section.id}
                            onClick={() => accessible && navigate(`/learn/${courseId}/${section.id}`)}
                            className={`flex items-center gap-3 px-4 py-3 ml-6 mr-2 border-l-2 transition-all ${
                              sIdx < chapter.sections.length - 1 ? '' : ''
                            } ${
                              accessible
                                ? 'border-l-violet-200 cursor-pointer hover:bg-white hover:shadow-sm rounded-r-lg'
                                : 'border-l-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {/* Section status */}
                            <div className="shrink-0">
                              {section.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : !accessible ? (
                                <Lock className="w-4 h-4 text-gray-300" />
                              ) : section.progress > 0 ? (
                                <div className="w-5 h-5 rounded-full border-2 border-violet-400 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                                </div>
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                            </div>

                            {/* Section content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">第 {sIdx + 1} 节</span>
                                {section.progress > 0 && !section.completed && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600">{section.progress}%</span>
                                )}
                                {section.progress > 0 && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${u.color}`}>{u.text}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 truncate">{section.title}</p>
                              <p className="text-xs text-gray-400 truncate">{section.description}</p>
                            </div>

                            {/* Play icon */}
                            {accessible && !section.completed && (
                              <Play className="w-4 h-4 text-violet-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
            </motion.div>
          );
        })}
      </div>
<<<<<<< HEAD
<<<<<<< HEAD

      {error ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <p className="font-semibold">提示</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    </div>
  );
}
