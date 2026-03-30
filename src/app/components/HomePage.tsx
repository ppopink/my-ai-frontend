import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Play, ArrowRight, Search, Clock, Users, Zap, ChevronRight, Star, Sparkles } from 'lucide-react';
import { COURSES, STORAGE_KEYS, loadData, type Curriculum } from '../store';

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

  const getProgress = (courseId: string) => {
    const c = curricula[courseId];
    if (!c || c.items.length === 0) return null;
    const total = c.items.length;
    const progress = Math.round(c.items.reduce((s, i) => s + i.progress, 0) / total);
    const completed = c.items.filter(i => i.completed).length;
    return { progress, completed, total };
  };

  const handleCourseClick = (courseId: string) => {
    if (curricula[courseId]) {
      navigate(`/curriculum/${courseId}`);
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
    </div>
  );
}
