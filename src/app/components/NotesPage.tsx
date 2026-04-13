<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Clock, FileText, Sparkles } from "lucide-react";
import { getCourseById } from "../courseCatalog";
import { useLearningApp } from "../context/LearningAppContext";
import { learningApi } from "../lib/api";
import { LEGACY_STORAGE_KEYS, writeStorage } from "../lib/storage";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { NoteListItem } from "../types/learning";
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Sparkles, Trash2, ArrowLeft, Save, ChevronLeft, Clock, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import {
  COURSES, STORAGE_KEYS, loadData, saveData, generateReviewNote,
  type Note, type Curriculum,
} from '../store';

// 🚨 1. 初始化 Mermaid 的主题样式（我们给它配上了你项目专属的紫色主题！）
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#f3e8ff',     // violet-100
    primaryTextColor: '#5b21b6', // violet-800
    primaryBorderColor: '#c4b5fd',// violet-300
    lineColor: '#8b5cf6',        // violet-500
  }
});

// 🚨 2. 新增一个专门用来渲染图表的子组件 (放在 NotesPage 函数的外面)
function MermaidChart({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && code) {
      // 🚨 1. 深度清洗逻辑：把 AI 可能乱写的符号全部修好
      let lines = code.split('\n');
      let sanitizedLines = lines.map(line => {
        let trimmed = line.trim();
        if (!trimmed || trimmed === 'mindmap') return line;

        // 获取缩进空格
        const indent = line.match(/^\s*/)?.[0] || '';
        // 去掉 AI 喜欢加的 Markdown 加粗 ** 和 括号中的内容干扰
        let content = trimmed
          .replace(/\*\*/g, '')      // 去掉 **
          .replace(/^[-*+]\s+/, '')  // 去掉开头的列表符号
          .replace(/[()\[\]{}]/g, ' ') // 把括号换成空格，防止 Mermaid 误判形状
          .trim();

        // 🚨 核心逻辑：给内容穿上“防护服”（双引号）
        // 如果内容还没加引号，强行加上
        if (content && !content.startsWith('"')) {
          return `${indent}"${content}"`;
        }
        return line;
      });

      // 确保第一行是 mindmap
      if (sanitizedLines[0].trim() !== 'mindmap') {
        sanitizedLines.unshift('mindmap');
      }

      const cleanCode = sanitizedLines.join('\n');
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      // 🚨 2. 渲染尝试
      mermaid.render(id, cleanCode)
        .then((result) => {
          if (ref.current) {
            ref.current.innerHTML = result.svg;
            // 顺便加个淡入动画，更丝滑
            ref.current.style.opacity = '1';
          }
        })
        .catch(err => {
          console.error('Mermaid 最终渲染失败:', err);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="text-[10px] text-gray-300 border border-dashed border-gray-200 rounded-lg p-4">
                🎨 思维导图正在排版中... (请尝试重新生成)
              </div>`;
          }
        });
    }
  }, [code]);

  return (
    <div 
      ref={ref} 
      className="flex justify-center my-8 p-6 bg-violet-50/30 rounded-2xl overflow-x-auto border border-violet-100 transition-opacity duration-500" 
      style={{ opacity: 0.5 }}
    />
  );
}
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d

export function NotesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
<<<<<<< HEAD
<<<<<<< HEAD
  const {
    userId,
    activeCourseId,
    coursePlans,
    currentPositions,
    getTutorMessages,
    setActiveCourseId,
  } = useLearningApp();
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(courseId || activeCourseId || "");
  const [selectedNote, setSelectedNote] = useState<NoteListItem | null>(null);
  const [focusQuestion, setFocusQuestion] = useState("");
  const [takeaways, setTakeaways] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
      setActiveCourseId(courseId);
    }
  }, [courseId, setActiveCourseId]);

  useEffect(() => {
    let active = true;

    async function loadNotes() {
      setLoading(true);
      setError("");

      try {
        const result = await learningApi.getNotesList(userId);
        if (!active) return;

        const nextNotes = result.data || [];
        setNotes(nextNotes);
        writeStorage(LEGACY_STORAGE_KEYS.notes, nextNotes);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "笔记列表加载失败");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      active = false;
    };
  }, [userId]);

  const currentCourseId = courseId || selectedCourse || activeCourseId || Object.keys(coursePlans)[0] || "";
  const currentCourse = getCourseById(currentCourseId);
  const currentPlan = currentCourseId ? coursePlans[currentCourseId] : undefined;
  const currentPosition = currentCourseId ? currentPositions[currentCourseId] : undefined;

  const currentContext = useMemo(() => {
    if (!currentPlan) return null;

    const currentChapter =
      currentPlan.chapters.find((chapter) => chapter.id === currentPosition?.chapterId) || currentPlan.chapters[0];
    const currentSection =
      currentChapter?.sections.find((section) => section.id === currentPosition?.sectionId) || currentChapter?.sections[0];

    return {
      chapter: currentChapter,
      section: currentSection,
    };
  }, [currentPlan, currentPosition?.chapterId, currentPosition?.sectionId]);

  const filteredNotes = notes.filter((note) => {
    if (courseId) return note.course_id === courseId;
    if (!selectedCourse) return true;
    return note.course_id === selectedCourse;
  });

  const recentMessages = currentCourseId && currentContext?.section
    ? getTutorMessages(currentCourseId, currentContext.section.id).slice(-8)
    : [];

  const generateCurrentSectionNote = async () => {
    if (!currentCourseId || !currentContext?.chapter || !currentContext?.section) {
      setError("当前没有足够的小节上下文，请先进入课程学习页再生成笔记。");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const result = await learningApi.generateNote({
        user_id: userId,
        course_id: currentCourseId,
        chapter_id: currentContext.chapter.id,
        chapter_title: currentContext.chapter.title,
        section_id: currentContext.section.id,
        section_title: currentContext.section.title,
        note_title: null,
        focus_questions: focusQuestion.trim() ? [focusQuestion.trim()] : [],
        messages: recentMessages.map(({ role, content }) => ({ role, content })),
        user_takeaways: takeaways.trim(),
        additional_context: additionalContext.trim(),
        auto_save: true,
        include_mindmap: true,
      });

      const note: NoteListItem = {
        id: result.data?.saved_note_id || `temp-${Date.now()}`,
        course_id: currentCourseId,
        title: result.data?.title || `${currentCourse?.name || currentCourseId} 学习笔记`,
        content: result.data?.content || "",
        created_at: new Date().toLocaleString("zh-CN"),
      };

      const nextNotes = [note, ...notes];
      setNotes(nextNotes);
      setSelectedNote(note);
      writeStorage(LEGACY_STORAGE_KEYS.notes, nextNotes);
      setTakeaways("");
      setAdditionalContext("");
      setFocusQuestion("");
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "笔记生成失败");
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d

  // If courseId is present, this is a course-scoped notes view (locked to that course)
  const isCourseLocked = !!courseId;
  const lockedCourse = COURSES.find(c => c.id === courseId);

  const [notes, setNotes] = useState<Note[]>(() => loadData<Note[]>(STORAGE_KEYS.notes, []));
  const [generating, setGenerating] = useState(false);
  // Only used when NOT course-locked (global notes view)
  const [selectedCourse, setSelectedCourse] = useState('');

  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isPreview, setIsPreview] = useState(false); // 🚨 新增：是否处于预览模式
  const [isMindmapping, setIsMindmapping] = useState(false); // 🚨 新增：是否正在生成思维导图

  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
  const enrolledCourses = COURSES.filter(c => curricula[c.id]);

  // Filter logic: course-locked always filters by courseId; global view uses selectedCourse
  const filteredNotes = isCourseLocked
    ? notes.filter(n => n.courseId === courseId)
    : selectedCourse
    ? notes.filter(n => n.courseId === selectedCourse)
    : notes;

  const openNote = notes.find(n => n.id === openNoteId);

  const persist = (updated: Note[]) => {
    setNotes(updated);
    saveData(STORAGE_KEYS.notes, updated);
  };

  const createNote = () => {
    const cid = isCourseLocked ? courseId! : selectedCourse || enrolledCourses[0]?.id || 'python';
    const note: Note = {
      id: Date.now().toString(),
      courseId: cid,
      title: '新笔记',
      content: '',
      createdAt: new Date().toISOString(),
      isAIGenerated: false,
    };
    persist([note, ...notes]);
    enterEditor(note);
  };

  // ==========================================
  // 🚨 核心爆发：真实的 AI 总结引擎
  // ==========================================
  const generateNote = async () => {
    const cid = isCourseLocked ? courseId! : selectedCourse || enrolledCourses[0]?.id;
    if (!cid || !curricula[cid]) return;
    
    setGenerating(true);
    const course = COURSES.find(c => c.id === cid);

    try {
      // 1. 提取该用户的真实学习数据
      const learnedItems = curricula[cid].items.filter(i => i.progress > 0);
      const learnedTopics = learnedItems.map(i => i.title).join("、") || "刚开始学习基础";
      
      // 提取掌握度较低（比如被标记为 beginner）的知识点作为薄弱点
      const weakItems = learnedItems.filter(i => i.understanding === 'beginner');
      const weakPoints = weakItems.map(i => i.title).join("、") || "暂无明显薄弱点";

      // 2. 呼叫后端真正的“教研组长” API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: openNoteId,
          user_id: "user_123",
          chapter_title: openNote?.title || "未知章节"
        })
      });

      if (!response.ok) throw new Error("AI 笔记生成失败");

      const result = await response.json();
      
      // 3. 将后端大模型生成的精美 Markdown 存入前端状态
      const note: Note = {
        id: Date.now().toString(),
        courseId: cid,
        title: result.data.title, // 使用 AI 起的标题
        content: result.data.content, // 这是大模型生成的 Markdown 正文！
        createdAt: new Date().toISOString(),
        isAIGenerated: true,
      };
      
      persist([note, ...notes]);
      enterEditor(note);

    } catch (error) {
      console.error("生成笔记出错:", error);
      alert("生成失败，请检查后端服务是否正常连接！");
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    } finally {
      setGenerating(false);
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
  if (selectedNote) {
    const noteCourse = getCourseById(selectedNote.course_id);

    return (
      <div className="flex h-[calc(100vh-64px)] flex-col bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedNote(null)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              返回列表
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{selectedNote.title}</h1>
              <p className="mt-1 text-xs text-slate-400">
                {noteCourse?.icon} {noteCourse?.name} · {selectedNote.created_at}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <MarkdownRenderer content={selectedNote.content} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {courseId ? (
            <button onClick={() => navigate(`/curriculum/${courseId}`)} className="rounded-xl p-2 transition hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </button>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{courseId ? `${currentCourse?.name} 笔记区` : "学习笔记"}</h1>
            <p className="mt-1 text-sm text-slate-500">Agent 5 会结合当前小节、最近问答和你的 takeaway 生成可回顾笔记。</p>
          </div>
        </div>
      </div>

      {!courseId ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCourse("")}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              !selectedCourse ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            全部课程
          </button>
          {Object.keys(coursePlans).map((id) => {
            const course = getCourseById(id);
            return (
              <button
                key={id}
                onClick={() => setSelectedCourse(id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  selectedCourse === id ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {course?.icon} {course?.name || id}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">Agent 5 笔记整理员</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">生成本节笔记</h2>
          </div>

          <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">当前上下文</p>
            <p className="mt-2">课程：{currentCourse?.name || "未选择课程"}</p>
            <p className="mt-1">章节：{currentContext?.chapter?.title || "未定位到章节"}</p>
            <p className="mt-1">小节：{currentContext?.section?.title || "未定位到小节"}</p>
            <p className="mt-2 text-xs text-slate-400">最近会附带 {recentMessages.length} 条导师问答上下文。</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">当前最关心的问题</label>
              <input
                value={focusQuestion}
                onChange={(event) => setFocusQuestion(event.target.value)}
                placeholder="例如：我总是分不清这个概念和上节课的区别"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">我的 takeaway</label>
              <textarea
                value={takeaways}
                onChange={(event) => setTakeaways(event.target.value)}
                rows={4}
                placeholder="写下你这节真正学会了什么，Agent 5 会把它吸收进笔记里。"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">补充上下文</label>
              <textarea
                value={additionalContext}
                onChange={(event) => setAdditionalContext(event.target.value)}
                rows={3}
                placeholder="例如：我想把它整理成适合面试前回顾的版本。"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>
            <button
              onClick={() => void generateCurrentSectionNote()}
              disabled={generating || !currentCourseId || !currentContext?.section}
              className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              {generating ? "正在生成..." : "生成本节笔记"}
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">最近生成的笔记</h2>
          {loading ? (
            <div className="flex h-full min-h-[240px] items-center justify-center text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p>还没有笔记记录。</p>
              <p className="mt-2">生成一篇后，它会自动保存到后端并出现在这里。</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note, index) => {
                const noteCourse = getCourseById(note.course_id);
                return (
                  <motion.button
                    key={`${note.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedNote(note)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-violet-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{note.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {noteCourse?.icon} {noteCourse?.name || note.course_id}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {note.created_at}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                      {note.content}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <p className="font-semibold">笔记请求失败</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}
=======
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
  const handleGenerateMindmap = async () => {
    if (!editContent.trim() || isMindmapping) return;
    
    setIsMindmapping(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/extract-mindmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) throw new Error("提炼失败");
      const result = await response.json();
      const newMermaidBlock = result.data.trim(); // 获取 AI 返回的 ```mermaid ... ```
      
      // 🚨 核心优化逻辑：正则表达式匹配
      // 解释：匹配 ```mermaid，后面跟着 mindmap，直到遇到结尾的 ```
      const mindmapRegex = /```mermaid\s*mindmap[\s\S]*?```/g;
      
      let updatedContent = editContent.trim();

      if (mindmapRegex.test(updatedContent)) {
        // 1. 如果笔记里已经有脑图了，直接用新的替换旧的
        updatedContent = updatedContent.replace(mindmapRegex, newMermaidBlock);
        console.log("♻️ 已覆盖旧的思维导图");
      } else {
        // 2. 如果没有，就追加到末尾
        updatedContent = updatedContent + "\n\n" + newMermaidBlock;
        console.log("➕ 已添加新的思维导图");
      }

      setEditContent(updatedContent);
      setIsDirty(true);
      
      // 自动切换到预览模式查看效果
      setIsPreview(true);
    } catch (error) {
      console.error(error);
      alert("生成失败，请检查后端服务是否正常连接！");
    } finally {
      setIsMindmapping(false);
    }
  };

  const enterEditor = (note: Note) => {
    setOpenNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsDirty(false);
    setIsPreview(true); // 🚨 核心优化：进门默认看漂亮的排版！
  };

  const saveNote = () => {
    if (!openNoteId) return;
    persist(notes.map(n => n.id === openNoteId ? { ...n, title: editTitle, content: editContent } : n));
    setIsDirty(false);
  };

  const closeEditor = () => {
    if (isDirty) saveNote();
    setOpenNoteId(null);
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    persist(notes.filter(n => n.id !== id));
    if (openNoteId === id) setOpenNoteId(null);
  };

  // ── Full-screen note editor ──
  if (openNoteId && openNote) {
    const noteCourse = COURSES.find(c => c.id === openNote.courseId);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-[calc(100vh-64px)] bg-white"
      >
        {/* Editor top bar */}
        <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={closeEditor}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
              返回笔记列表
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {noteCourse?.icon} {noteCourse?.name}
              </span>
              {openNote.isAIGenerated && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI 生成
                </span>
              )}
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(openNote.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && <span className="text-xs text-amber-500 mr-2">未保存</span>}
            
            {/* 🚨 1. 一键生成/重新生成思维导图 (双模式通用) */}
            <button
              onClick={handleGenerateMindmap}
              disabled={isMindmapping || !editContent.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-violet-50 text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-40 transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isMindmapping ? 'animate-spin' : ''}`} />
              {/* 如果内容里已有 mermaid，文案自动变成“重新生成” */}
              {isMindmapping ? '正在提炼...' : (editContent.includes('mindmap') ? '重新生成导图' : '生成思维导图')}
            </button>

            {/* 🚨 2. 预览/编辑 状态切换开关 */}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                !isPreview 
                ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {!isPreview ? <FileText className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 rotate-45" />} 
              {isPreview ? '进入编辑' : '完成编辑'}
            </button>

            <button
              onClick={saveNote}
              disabled={!isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-40 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> 保存
            </button>
            
            <button
              onClick={() => deleteNote(openNoteId)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <input
              value={editTitle}
              onChange={e => { setEditTitle(e.target.value); setIsDirty(true); }}
              placeholder="笔记标题"
              className="w-full text-2xl text-gray-800 placeholder-gray-300 focus:outline-none mb-6 bg-transparent"
              style={{ fontWeight: 600 }}
            />
            <div className="w-12 h-0.5 bg-gray-200 mb-6 rounded-full" />
            {/* 🚨 核心：如果处于预览模式，使用 ReactMarkdown 渲染精美排版；否则显示输入框 */}
            {isPreview ? (
              <div className="w-full min-h-[60vh] pb-10">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-800" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800 border-b pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-5 mb-2 text-violet-600 flex items-center gap-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-gray-600 leading-relaxed text-base" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-gray-600" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-gray-600" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 bg-violet-50 px-1 rounded" {...props} />,
                    // 🚨 核心拦截逻辑：判断是普通代码还是思维导图代码！
                    code(props) {
                      const {children, className, node, ...rest} = props;
                      const match = /language-(\w+)/.exec(className || '');
                      const isBlock = !!match; // 如果有语言标识，通常就是 ``` 包裹的代码块

                      // 1. 拦截 Mermaid 图表
                      if (match && match[1] === 'mermaid') {
                        return <MermaidChart code={String(children).replace(/\n$/, '')} />;
                      }

                      // 2. 渲染多行代码块 (bash, env, python 等)
                      if (isBlock) {
                        return (
                          <div className="relative group my-4">
                            {/* 右上角显示语言名称 */}
                            <div className="absolute right-3 top-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              {match[1]}
                            </div>
                            <pre className="bg-[#1e1e1e] text-gray-300 p-4 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed shadow-lg">
                              <code className={className}>{children}</code>
                            </pre>
                          </div>
                        );
                      }

                      // 3. 渲染普通行内代码 (如 `const a = 1`)
                      return (
                        <code 
                          {...rest} 
                          className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-[13px] font-mono border border-gray-200"
                        >
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {editContent}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={editContent}
                onChange={e => { setEditContent(e.target.value); setIsDirty(true); }}
                placeholder="在这里记录你的学习心得、代码笔记、知识点整理..."
                className="w-full min-h-[60vh] text-gray-700 placeholder-gray-300 focus:outline-none resize-none bg-transparent"
                style={{ lineHeight: '1.9' }}
              />
            )}
          </div>
        </div>

        {/* Editor bottom bar */}
        <div className="border-t px-6 py-2 flex items-center justify-between text-xs text-gray-300 shrink-0">
          <span>{editContent.length} 字</span>
          <span>{isDirty ? '编辑中' : '已保存'}</span>
        </div>
      </motion.div>
    );
  }

  // ── Notes list view ──
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isCourseLocked ? (
            <button onClick={() => navigate(`/curriculum/${courseId}`)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          ) : null}
          <div>
            <h1>{isCourseLocked ? `${lockedCourse?.icon} ${lockedCourse?.name} 笔记` : '学习笔记'}</h1>
            {isCourseLocked && (
              <p className="text-xs text-gray-400 mt-0.5">仅显示该课程的笔记</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateNote}
            disabled={generating || (isCourseLocked ? !curricula[courseId!] : enrolledCourses.length === 0)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? '生成中...' : 'AI 复盘笔记'}
          </button>
          <button
            onClick={createNote}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Plus className="w-4 h-4" /> 新笔记
          </button>
        </div>
      </div>

      {/* Course filter - only show when NOT course-locked */}
      {!isCourseLocked && enrolledCourses.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedCourse('')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${!selectedCourse ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            全部
          </button>
          {enrolledCourses.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCourse(c.id)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCourse === c.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>还没有笔记</p>
          <p className="text-sm mt-1">
            {isCourseLocked
              ? `为「${lockedCourse?.name}」创建笔记或让 AI 自动生成复盘笔记`
              : '创建新笔记或让 AI 自动生成复盘笔记'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note, i) => {
            const course = COURSES.find(c => c.id === note.courseId);

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => enterEditor(note)}
                className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-violet-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {/* Only show course badge in global view, since course-locked view already shows it in the title */}
                      {!isCourseLocked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {course?.icon} {course?.name}
                        </span>
                      )}
                      {note.isAIGenerated && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      )}
                    </div>
                    <h3 className="text-gray-800">{note.title}</h3>
                  </div>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 line-clamp-3 whitespace-pre-wrap">
                  {note.content || '(空笔记)'}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-300">
                    {new Date(note.createdAt).toLocaleString('zh-CN')}
                  </p>
                  <span className="text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    点击编辑 →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
<<<<<<< HEAD
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
=======
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    </div>
  );
}
