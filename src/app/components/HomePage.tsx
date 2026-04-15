import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Play, ArrowRight, Search, Clock, Users, Zap, ChevronRight, Star, Sparkles } from 'lucide-react';
import { COURSES, STORAGE_KEYS, loadData, type Curriculum } from '../store';
import { API_BASE_URL } from '../lib/api';
import {
  registerCourseRecord,
  resolveCourseId,
} from '../lib/courseRegistry';

// Modern, vibrant course metadata
const COURSE_META: Record<string, {
  gradient: string;
  iconBg: string;
  tags: string[];
  highlights: string[];
  level: string;
  hours: string;
  students: string;
  badge?: string;
}> = {
  python: {
    gradient: 'from-[#3b82f6] via-[#6366f1] to-[#8b5cf6]',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    tags: ['数据分析', 'AI/ML', '自动化'],
    highlights: ['变量、函数等核心语法', '文件处理与异常管理', '13个实战小项目'],
    level: '零基础友好',
    hours: '40 小时',
    students: '12.8k',
    badge: '最受欢迎',
  },
  javascript: {
    gradient: 'from-[#f59e0b] via-[#f97316] to-[#ea580c]',
    iconBg: 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    tags: ['前端开发', 'Web交互', '全栈基础'],
    highlights: ['DOM 操作与事件', '异步编程 async/await', '构建交互式网页'],
    level: '有网页基础更佳',
    hours: '35 小时',
    students: '9.3k',
    badge: '热门推荐',
  },
  java: {
    gradient: 'from-[#ef4444] via-[#f43f5e] to-[#e11d48]',
    iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    tags: ['后端开发', 'Android', '大数据'],
    highlights: ['面向对象设计思想', '多线程与并发基础', '企业级项目实践'],
    level: '逻辑基础者',
    hours: '50 小时',
    students: '7.6k',
  },
  cpp: {
    gradient: 'from-[#0ea5e9] via-[#0284c7] to-[#2563eb]',
    iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
    tags: ['系统编程', '游戏开发', '算法竞赛'],
    highlights: ['指针与内存管理', 'STL 标准库使用', '高性能程序设计'],
    level: '有编程基础更佳',
    hours: '60 小时',
    students: '4.2k',
  },
  'html-css': {
    gradient: 'from-[#ec4899] via-[#f43f5e] to-[#f97316]',
    iconBg: 'bg-pink-50 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
    tags: ['网页设计', '响应式布局', 'UI开发'],
    highlights: ['HTML5 语义化标签', 'CSS Flexbox/Grid', '动画与视觉效果'],
    level: '完全零基础',
    hours: '25 小时',
    students: '11.2k',
    badge: '入门首选',
  },
  sql: {
    gradient: 'from-[#14b8a6] via-[#0d9488] to-[#0284c7]',
    iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
    tags: ['数据分析', '后端开发', '数据库管理'],
    highlights: ['SELECT 查询与过滤', '多表联查 JOIN', '索引优化与事务'],
    level: '零基础可学',
    hours: '20 小时',
    students: '6.7k',
  },
  react: {
    gradient: 'from-[#38bdf8] via-[#0ea5e9] to-[#14b8a6]',
    iconBg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
    tags: ['前端框架', '单页应用', '组件化开发'],
    highlights: ['组件化与 JSX', 'Hooks 状态管理', '真实项目实战'],
    level: '需掌握 JS 基础',
    hours: '45 小时',
    students: '8.4k',
    badge: '高薪必备',
  },
  go: {
    gradient: 'from-[#10b981] via-[#059669] to-[#0891b2]',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    tags: ['云原生', '微服务', '高并发'],
    highlights: ['Go 语法与类型', 'Goroutine 并发', '云原生生态工具'],
    level: '有编程经验更佳',
    hours: '40 小时',
    students: '3.8k',
  },
};

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customCourseName, setCustomCourseName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const [myCustomCourses, setMyCustomCourses] = useState<any[]>([]);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const userId = "user_123";
        const response = await fetch(`${API_BASE_URL}/api/user/custom-courses/${userId}`);
        const data = await response.json();
        if (data.status === 'success') {
          data.data.forEach((course: { course_id: string; title: string }) => {
            registerCourseRecord({
              actualCourseId: course.course_id,
              title: course.title,
              icon: '✨',
              color: '#8b5cf6',
              isCustom: true,
            });
          });
          setMyCustomCourses(data.data);
        }
      } catch (error) {
        console.error("获取专属课程失败", error);
      }
    };
    fetchMyCourses();
  }, []);


  const handleStartCustomCourse = () => {
    if (!customCourseName.trim() || !selectedFile) {
      alert('请填写课程名称并上传资料哦！');
      return;
    }
    navigate(`/interview/custom`, { 
      state: { 
        isCustom: true, 
        courseTitle: customCourseName, 
        uploadFile: selectedFile 
      } 
    });
    setIsModalOpen(false);
  };

  const getProgress = (courseId: string) => {
    const actualCourseId = resolveCourseId(courseId) || courseId;
    const c = curricula[actualCourseId];
    if (!c || c.items.length === 0) return null;
    const total = c.items.length;
    const progress = Math.round(c.items.reduce((s, i) => s + i.progress, 0) / total);
    const completed = c.items.filter(i => i.completed).length;
    return { progress, completed, total };
  };

  const handleCourseClick = (courseId: string) => {
    const actualCourseId = resolveCourseId(courseId) || courseId;
    if (actualCourseId !== courseId || curricula[actualCourseId]) {
      navigate(`/curriculum/${actualCourseId}`);
    } else {
      navigate(`/interview/${courseId}`);
    }
  };

  const filteredCourses = COURSES.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#09090b] transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        {/* Modern Grid */}
        <div className="w-full h-[80vh] bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,#000_30%,transparent_100%)]" />
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-600/20 dark:bg-violet-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/20 dark:bg-cyan-600/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-[#ffffff0d] border border-slate-200/50 dark:border-white/10 text-sm font-medium mb-8 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent font-bold">AI 驱动</span>
              <span className="text-slate-600 dark:text-slate-300 ml-1">的下一代学习体验</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 dark:text-white">
              选好课，
              <span className="relative whitespace-nowrap inline-block">
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 opacity-20 dark:opacity-30 blur-xl"></span>
                <span className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">学真本事</span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              告别枯燥的流水线课程。AI 先了解你的基础与目标，再为你量身定制专属学习计划，
              <strong className="text-slate-800 dark:text-slate-200 font-semibold ml-1">像有顶级私教一样学编程</strong>。
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 rounded-full blur-md opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#ffffff] dark:bg-[#12121a] rounded-full border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden p-1.5">
              <div className="pl-5 pr-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="flex-1 bg-transparent py-3 pr-4 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-lg"
                placeholder="你想学点什么？比如 Python, React, 或 算法..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-slate-900 dark:bg-[#ffffff] text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform active:scale-95 shadow-md">
                搜索
              </button>
            </div>
          </motion.div>
        </div>

        {/* ========================================== */}
        {/* 1. 顶部的专属书架：始终显示，统一入口 */}
        {/* ========================================== */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-white flex items-center gap-3">
            <span className="text-3xl">📚</span> 我的专属课程
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* 遍历渲染已有的自定义课程 */}
            {myCustomCourses.map((course, index) => (
              <motion.div
                key={`custom-${course.course_id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 100, damping: 20 }}
                onClick={() => navigate(`/curriculum/${course.course_id}`, { state: { courseId: course.course_id, isCustom: true, courseTitle: course.title, syllabusData: course.syllabus } })}
                className="group relative cursor-pointer p-[1px] rounded-[24px] overflow-hidden hover:-translate-y-2 transition-transform duration-500 flex flex-col min-h-[180px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500 opacity-20 dark:opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full flex flex-col justify-between bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-xl rounded-[23px] overflow-hidden border border-purple-200 dark:border-purple-500/20 p-6">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCourseToDelete(course.course_id);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/20 transition-all z-10"
                    title="删除课程"
                  >
                    <span className="text-sm">🗑️</span>
                  </button>

                  <div>
                    <span className="text-3xl mb-4 block">📖</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight pr-8">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {course.course_id.substring(0, 12)}...</p>
                  </div>
                  <div className="mt-6 flex items-center text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    继续学习 <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* 🚨 永久固定的“新建”按钮：无论删光没删光，它都钉在这里 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: myCustomCourses.length * 0.08, type: 'spring', stiffness: 100, damping: 20 }}
              onClick={() => setIsModalOpen(true)}
              className="group relative cursor-pointer p-[1px] rounded-[24px] overflow-hidden hover:-translate-y-2 transition-transform duration-500 flex flex-col min-h-[180px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500 opacity-20 dark:opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full flex flex-col items-center justify-center bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-xl rounded-[23px] overflow-hidden border-2 border-dashed border-purple-300 dark:border-purple-500/30 group-hover:bg-purple-50/50 dark:group-hover:bg-purple-900/20 transition-colors">
                 <div className="w-12 h-12 mb-3 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-2xl shadow-sm border border-purple-200 dark:border-purple-500/20 group-hover:scale-110 transition-transform">
                   ✨
                 </div>
                 <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                   新建自定义课程
                 </h3>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Standard Courses Section */}
        <h2 className="text-2xl font-bold mb-8 text-slate-800 dark:text-white flex items-center gap-3">
          <span className="text-3xl">🌟</span> 热门课程
        </h2>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <Search className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-6" />
            <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">没有找到相关课程</h3>
            <p>试试换个关键词，比如 "Python" 或 "前端"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredCourses.map((course, i) => {
              const prog = getProgress(course.id);
              const meta = COURSE_META[course.id];

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 100, damping: 20 }}
                  onClick={() => handleCourseClick(course.id)}
                  className="group relative cursor-pointer p-[1px] rounded-[24px] overflow-hidden hover:-translate-y-2 transition-transform duration-500 flex flex-col"
                >
                  {/* Glowing Border Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-20 dark:opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Card Content Container */}
                  <div className="relative h-full flex flex-col bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-xl rounded-[23px] overflow-hidden">
                    {/* Top Accent Gradient */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient} opacity-80`} />
                    
                    <div className="p-6 flex flex-col h-full z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-white/5 ${meta.iconBg}`}>
                          {course.icon}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {meta.badge && (
                            <div className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {meta.badge}
                            </div>
                          )}
                          {prog && (
                            <div className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              ✓ 已加入
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {meta.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#ffffff0d] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2.5 mb-8 flex-1">
                        {meta.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-500/20">
                              <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="leading-snug">{h}</span>
                          </div>
                        ))}
                      </div>

                      {/* Meta Stats Row */}
                      <div className="grid grid-cols-2 gap-2 mb-6 pt-5 border-t border-slate-100 dark:border-white/5">
                        <div className="col-span-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#ffffff05] py-2 rounded-lg border border-slate-100/50 dark:border-white/5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span className="font-medium truncate">{meta.level}</span>
                        </div>
                      </div>

                      {/* Bottom Action */}
                      {prog ? (
                        <div className="mt-auto">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                            <span>{prog.completed}/{prog.total} 章完成</span>
                            <span className="text-violet-600 dark:text-violet-400">{prog.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${prog.progress}%` }} />
                          </div>
                          <button className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 group/btn">
                            继续学习
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      ) : (
                        <button className="mt-auto w-full py-3 rounded-xl text-sm font-bold bg-slate-900 dark:bg-[#ffffff] text-white dark:text-slate-900 flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-900/10 dark:shadow-white/10 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                          <Play className="w-4 h-4 fill-current transition-transform group-hover/btn:scale-110" />
                          开始定制学习路径
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
          </div>
        )}

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 text-sm text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-violet-500" />
          </div>
          点击任意课程，AI 会先和你聊几句，为你量身打造大纲
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Modal UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">创建自定义课程</h2>
            
            {/* 1. 课程名称输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">给这门课起个名字</label>
              <input 
                type="text" 
                value={customCourseName}
                onChange={(e) => setCustomCourseName(e.target.value)}
                placeholder="例如：2026考研政治冲刺" 
                className="w-full p-3.5 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#12121a] text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* 2. 拖拽上传区 */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="mb-8 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 rounded-2xl bg-slate-50 dark:bg-[#12121a] hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all cursor-pointer text-center flex flex-col items-center group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }} 
                className="hidden" 
                accept=".pdf,.txt,.docx" 
              />
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📄</span>
              </div>
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1 line-clamp-1 break-all px-4">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-700 dark:text-slate-200 font-medium mb-1">点击或将文件拖拽到此处</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">支持 PDF、TXT、Word 格式</p>
                </>
              )}
            </div>

            {/* 3. 操作按钮 */}
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleStartCustomCourse}
                disabled={!customCourseName.trim() || !selectedFile}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all font-medium shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                创建课程 <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================== */}
      {/* 🌟 极其优雅的高级自定义删除弹窗 */}
      {/* ============================== */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] transition-all p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-white/10"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 dark:bg-red-500/10 mb-6 border border-red-100 dark:border-red-500/20">
                <span className="text-red-500 text-4xl animate-pulse">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">确认永久删除？</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                删除后，这门专属课程的所有大纲和学习进度将灰飞烟灭，且<span className="text-red-500 font-bold">无法恢复</span>。确定要这么做吗？
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCourseToDelete(null)}
                className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-4 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
              >
                我再想想
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_BASE_URL}/api/user/custom-courses/${courseToDelete}`, {
                      method: 'DELETE',
                    });
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                      setMyCustomCourses(prev => prev.filter(c => c.course_id !== courseToDelete));
                      setCourseToDelete(null); 
                    } else {
                      alert("删除失败: " + data.message);
                    }
                  } catch (error) {
                    console.error("删除失败", error);
                    alert("网络请求出错，请稍后再试。");
                  }
                }}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-red-200/50 dark:shadow-red-900/20"
              >
                果断删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
