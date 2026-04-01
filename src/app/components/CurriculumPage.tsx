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
      </div>
    );
  }

  if (!curriculum || chapters.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">你还没有开始这门课程</p>
        <button onClick={() => navigate(`/interview/${courseId}`)} className="px-6 py-2 bg-violet-500 text-white rounded-lg">
          开始采访
        </button>
      </div>
    );
  }

  return (
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

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
