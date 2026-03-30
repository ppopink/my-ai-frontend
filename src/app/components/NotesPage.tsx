import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Sparkles, Trash2, ArrowLeft, Save, ChevronLeft, Clock, FileText } from 'lucide-react';
import {
  COURSES, STORAGE_KEYS, loadData, saveData, generateReviewNote,
  type Note, type Curriculum,
} from '../store';

export function NotesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

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

  const generateNote = () => {
    const cid = isCourseLocked ? courseId! : selectedCourse || enrolledCourses[0]?.id;
    if (!cid || !curricula[cid]) return;
    setGenerating(true);
    setTimeout(() => {
      const content = generateReviewNote(cid, curricula[cid].items);
      const course = COURSES.find(c => c.id === cid);
      const note: Note = {
        id: Date.now().toString(),
        courseId: cid,
        title: `${course?.name} 复盘笔记`,
        content,
        createdAt: new Date().toISOString(),
        isAIGenerated: true,
      };
      persist([note, ...notes]);
      setGenerating(false);
      enterEditor(note);
    }, 1500);
  };

  const enterEditor = (note: Note) => {
    setOpenNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsDirty(false);
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
            {isDirty && <span className="text-xs text-amber-500">未保存</span>}
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
            <textarea
              value={editContent}
              onChange={e => { setEditContent(e.target.value); setIsDirty(true); }}
              placeholder="在这里记录你的学习心得、代码笔记、知识点整理..."
              className="w-full min-h-[60vh] text-gray-700 placeholder-gray-300 focus:outline-none resize-none bg-transparent"
              style={{ lineHeight: '1.9' }}
            />
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
    </div>
  );
}
