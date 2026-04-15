import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, BookOpen, Clock, Trophy, TrendingUp, Flame,
  ChevronRight, Settings, Bell, Moon, HelpCircle,
  LogOut, Star, Target, Zap, Edit3, BarChart3,
  X, Sun, MessageSquare, Send, Check, Shield
} from 'lucide-react';
import {
  COURSES, STORAGE_KEYS, loadData,
  type Curriculum, type Note,
} from '../store';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCourseDisplay } from '../lib/courseRegistry';

// ── 徽章数据配置 ──
const ALL_BADGES = [
  { id: 'novice', name: '初学乍练', icon: '🚀', desc: '加入第一门课程', gradient: 'from-blue-400 to-blue-600', text: 'text-blue-500' },
  { id: 'streak3', name: '渐入佳境', icon: '🔥', desc: '连续学习3天', gradient: 'from-orange-400 to-red-500', text: 'text-orange-500' },
  { id: 'notes5', name: '笔耕不辍', icon: '📝', desc: '累计创建5条笔记', gradient: 'from-emerald-400 to-teal-500', text: 'text-emerald-500' },
  { id: 'xp500', name: '初级学霸', icon: '🎓', desc: '累积获得500经验', gradient: 'from-violet-400 to-purple-600', text: 'text-violet-500' },
  { id: 'chapters10', name: '百炼成钢', icon: '⚔️', desc: '完成10个章节', gradient: 'from-rose-400 to-pink-600', text: 'text-rose-500' },
];

// ── 弹窗容器 ──
function SettingsModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-slate-800 dark:text-slate-100 font-bold">{title}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
  const notes = loadData<Note[]>(STORAGE_KEYS.notes, []);

  const [userName, setUserName] = useState(() => localStorage.getItem('lp_username') || '学习探索者');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Modal states
  const [openModal, setOpenModal] = useState<'reminder' | 'darkmode' | 'preference' | 'help' | null>(null);

  // 学习提醒 states
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem('lp_reminder_enabled') === 'true');
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('lp_reminder_time') || '20:00');
  const [reminderDays, setReminderDays] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('lp_reminder_days');
    return saved ? new Set(JSON.parse(saved)) : new Set([1, 2, 3, 4, 5]);
  });
  const [reminderSaved, setReminderSaved] = useState(false);

  // 深色模式 state
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('lp_dark_mode') === 'true');

  // 学习偏好 states
  const [pace, setPace] = useState(() => localStorage.getItem('lp_pace') || 'normal');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('lp_difficulty') || 'adaptive');
  const [aiStyle, setAiStyle] = useState(() => localStorage.getItem('lp_ai_style') || 'encouraging');
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    if (openModal === 'preference') {
      setPace(localStorage.getItem('lp_pace') || 'normal');
      setDifficulty(localStorage.getItem('lp_difficulty') || 'adaptive');
      setAiStyle(localStorage.getItem('lp_ai_style') || 'encouraging');
    } else if (openModal === 'reminder') {
      setReminderEnabled(localStorage.getItem('lp_reminder_enabled') === 'true');
      setReminderTime(localStorage.getItem('lp_reminder_time') || '20:00');
      const savedDays = localStorage.getItem('lp_reminder_days');
      setReminderDays(savedDays ? new Set(JSON.parse(savedDays)) : new Set([1, 2, 3, 4, 5]));
    }
  }, [openModal]);

  // 帮助与反馈 states
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const saveName = () => {
    if (!tempName.trim()) return;
    localStorage.setItem('lp_username', tempName.trim());
    setUserName(tempName.trim());
    setEditing(false);
  };

  // ── Stats 计算 ──
  const enrolledCourses = Object.keys(curricula);
  const enrolledCount = enrolledCourses.length;
  const totalChapters = enrolledCourses.reduce((s, cid) => s + (curricula[cid]?.items.length || 0), 0);
  const completedChapters = enrolledCourses.reduce(
    (s, cid) => s + (curricula[cid]?.items.filter(i => i.completed).length || 0), 0
  );
  const overallProgress = totalChapters > 0
    ? Math.round(enrolledCourses.reduce((s, cid) => {
        const items = curricula[cid]?.items || [];
        return s + items.reduce((ss, i) => ss + i.progress, 0);
      }, 0) / totalChapters)
    : 0;

  const streak = Math.min(notes.length + completedChapters, 30) || 1; // Default to at least 1 if accessed
  const xp = completedChapters * 100 + notes.length * 20;
  const level = Math.floor(xp / 300) + 1;
  const xpInLevel = xp % 300;

  // ── 徽章计算 ──
  const unlockedBadges = new Set<string>();
  if (enrolledCount > 0) unlockedBadges.add('novice');
  if (streak >= 3) unlockedBadges.add('streak3');
  if (notes.length >= 5) unlockedBadges.add('notes5');
  if (xp >= 500) unlockedBadges.add('xp500');
  if (completedChapters >= 10) unlockedBadges.add('chapters10');

  // ── Handlers ──
  const saveReminder = () => {
    localStorage.setItem('lp_reminder_enabled', String(reminderEnabled));
    localStorage.setItem('lp_reminder_time', reminderTime);
    localStorage.setItem('lp_reminder_days', JSON.stringify([...reminderDays]));
    setReminderSaved(true);
    setTimeout(() => {
      setReminderSaved(false);
      setOpenModal(null);
    }, 1500);
  };

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem('lp_dark_mode', String(val));
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const savePreference = () => {
    localStorage.setItem('lp_pace', pace);
    localStorage.setItem('lp_difficulty', difficulty);
    localStorage.setItem('lp_ai_style', aiStyle);
    setPrefSaved(true);
    setTimeout(() => {
      setPrefSaved(false);
      setOpenModal(null);
    }, 1500);
  };

  const sendFeedback = () => {
    if (!feedbackText.trim()) return;
    const feedbacks = JSON.parse(localStorage.getItem('lp_feedbacks') || '[]');
    feedbacks.push({ text: feedbackText, time: new Date().toISOString() });
    localStorage.setItem('lp_feedbacks', JSON.stringify(feedbacks));
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 2000);
  };

  // Sync dark mode class whenever darkMode state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] transition-colors duration-500 pt-6 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* ── 全新个人卡片 ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 rounded-[28px] p-6 sm:p-8 mb-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors"
        >
          {/* Dark Mode Glow Effects */}
          <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/20 dark:bg-violet-600/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/20 dark:bg-cyan-600/20 blur-[80px] rounded-full" />
          </div>
          
          <div className="relative z-10">
            {/* Header: Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-[#18181b] p-1 shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-50 dark:border-white/5">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1543525090-07dc28d19bb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBzdHVkZW50JTIwYXZhdGFyJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzczOTIwMDM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Level Badge Overlay */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white text-xs font-bold shadow-lg shadow-violet-500/30 whitespace-nowrap border-2 border-white dark:border-[#12121a]">
                  Lv.{level}
                </div>
              </div>

              {/* Name & Quick Stats */}
              <div className="flex-1 flex flex-col items-center sm:items-start mt-2 sm:mt-0 text-center sm:text-left w-full">
                {editing ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 w-full">
                    <input
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-lg font-bold w-48 text-center sm:text-left transition-all"
                      autoFocus
                    />
                    <button onClick={saveName} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:scale-105 transition-transform">
                      保存
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 group w-full">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{userName}</h1>
                    <button onClick={() => { setTempName(userName); setEditing(true); }} className="p-1.5 text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Flame className="w-4 h-4" /> {streak}天连续学习
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg">
                    <Zap className="w-4 h-4" /> 总计 {xp} XP
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="w-full mt-6">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                    <span>当前阶段进度</span>
                    <span>{xpInLevel} / 300</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 relative" 
                      style={{ width: `${(xpInLevel / 300) * 100}%` }} 
                    >
                      <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent my-6" />

            {/* Badges / Achievements Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-violet-500" />
                  成就徽章
                </h3>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">已点亮 {unlockedBadges.size}/{ALL_BADGES.length}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {ALL_BADGES.map((badge, idx) => {
                  const unlocked = unlockedBadges.has(badge.id);
                  return (
                    <div 
                      key={badge.id}
                      className="relative group flex flex-col items-center"
                    >
                      <div 
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 ${
                          unlocked 
                            ? `bg-gradient-to-br ${badge.gradient} text-white shadow-lg ${badge.shadow} transform hover:-translate-y-1 hover:scale-105` 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 grayscale opacity-60 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {badge.icon}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute -bottom-12 whitespace-nowrap bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl font-medium">
                        <div className="font-bold text-center mb-0.5">{badge.name}</div>
                        <div className="text-[10px] text-slate-300 dark:text-slate-600">{badge.desc}</div>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800 dark:border-b-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 核心数据网格 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: '在学课程', value: enrolledCount, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { icon: Target, label: '完成章节', value: completedChapters, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
            { icon: TrendingUp, label: '总计进度', value: `${overallProgress}%`, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
            { icon: Edit3, label: '学习笔记', value: notes.length, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#12121a] rounded-2xl border border-slate-200 dark:border-white/10 p-4 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── 我的课程列表 ── */}
        {enrolledCount > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" /> 继续学习
            </h2>
            <div className="space-y-3">
              {enrolledCourses.map((cid, i) => {
                const course = getCourseDisplay(cid);
                const items = curricula[cid]?.items || [];
                const completed = items.filter(i => i.completed).length;
                const progress = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length) : 0;

                return (
                  <motion.div
                    key={cid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/curriculum/${cid}`)}
                    className="group bg-white dark:bg-[#12121a] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-500/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-2xl shadow-sm">
                      {course.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{course.title}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-medium text-slate-400 dark:text-slate-500">{completed}/{items.length} 章完成</div>
                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: course.color }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-400 dark:text-slate-500">{progress}%</div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-violet-50 dark:group-hover:bg-violet-500/20 group-hover:text-violet-500 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 系统设置菜单 ── */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          {[
            { icon: Bell, label: '学习提醒', desc: '设置每日学习提醒时间', modalKey: 'reminder' as const, color: 'text-blue-500' },
            { icon: Moon, label: '深色模式', desc: '切换应用界面主题', modalKey: 'darkmode' as const, color: 'text-indigo-500' },
            { icon: Settings, label: '学习偏好', desc: '调整节奏与 AI 难度', modalKey: 'preference' as const, color: 'text-violet-500' },
            { icon: HelpCircle, label: '帮助与反馈', desc: '查阅指南与问题反馈', modalKey: 'help' as const, color: 'text-teal-500' },
            { icon: LogOut, label: '清除数据', desc: '重置所有本地学习记录', modalKey: null, danger: true, color: 'text-rose-500' },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.danger) {
                  if (confirm('确定要清除所有学习数据吗？此操作不可恢复。')) {
                    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
                    Object.keys(localStorage).filter(k => k.startsWith('lp_')).forEach(k => localStorage.removeItem(k));
                    window.location.href = '/';
                  }
                } else if (item.modalKey) {
                  setOpenModal(item.modalKey);
                }
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i > 0 ? 'border-t border-slate-100 dark:border-white/5' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.danger ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-slate-50 dark:bg-white/5'}`}>
                <item.icon className={`w-5 h-5 ${item.danger ? 'text-rose-500 dark:text-rose-400' : item.color}`} />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${item.danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.label}</div>
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              {!item.danger && <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
            </button>
          ))}
        </div>

        {/* ═══ 学习提醒 Modal ═══ */}
        <SettingsModal open={openModal === 'reminder'} onClose={() => setOpenModal(null)} title="学习提醒">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">开启学习提醒</div>
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">每天定时提醒你来学习</div>
              </div>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-7 rounded-full transition-colors relative ${reminderEnabled ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${reminderEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {reminderEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">提醒时间</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-center text-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">提醒日期</label>
                  <div className="flex gap-2">
                    {dayLabels.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const next = new Set(reminderDays);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          setReminderDays(next);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          reminderDays.has(i) 
                            ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <button
              onClick={saveReminder}
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            >
              {reminderSaved ? <><Check className="w-5 h-5" /> 已保存</> : '保存设置'}
            </button>
          </div>
        </SettingsModal>

        {/* ═══ 深色模式 Modal ═══ */}
        <SettingsModal open={openModal === 'darkmode'} onClose={() => setOpenModal(null)} title="主题设置">
          <div className="space-y-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">选择你喜欢的外观主题。深色模式在夜间能有效减轻视觉疲劳。</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => toggleDarkMode(false)}
                className={`p-5 rounded-2xl border-2 transition-all text-center relative overflow-hidden ${
                  !darkMode ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {!darkMode && <div className="absolute top-2 right-2 text-violet-500"><Check className="w-5 h-5" /></div>}
                <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${!darkMode ? 'bg-violet-100 dark:bg-violet-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                  <Sun className={`w-7 h-7 ${!darkMode ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                </div>
                <div className={`text-sm font-bold ${!darkMode ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>浅色模式</div>
                <div className="text-xs font-medium text-slate-400 mt-1">清新明亮</div>
              </button>

              <button
                onClick={() => toggleDarkMode(true)}
                className={`p-5 rounded-2xl border-2 transition-all text-center relative overflow-hidden ${
                  darkMode ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {darkMode && <div className="absolute top-2 right-2 text-violet-500"><Check className="w-5 h-5" /></div>}
                <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center ${darkMode ? 'bg-violet-100 dark:bg-violet-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                  <Moon className={`w-7 h-7 ${darkMode ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`} />
                </div>
                <div className={`text-sm font-bold ${darkMode ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>深色模式</div>
                <div className="text-xs font-medium text-slate-400 mt-1">护眼舒适</div>
              </button>
            </div>
          </div>
        </SettingsModal>

        {/* ═══ 学习偏好 Modal ═══ */}
        <SettingsModal open={openModal === 'preference'} onClose={() => setOpenModal(null)} title="学习偏好">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">目标节奏</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'slow', label: '🐢 轻松', desc: '每天1节' },
                  { key: 'normal', label: '🚶 适中', desc: '每天2-3节' },
                  { key: 'fast', label: '🚀 高效', desc: '每天4节+' },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPace(p.key)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      pace === p.key ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className={`text-sm font-bold ${pace === p.key ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>{p.label}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">内容难度</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'easy', label: '简单', desc: '基础巩固' },
                  { key: 'adaptive', label: '自适应', desc: 'AI 调整' },
                  { key: 'hard', label: '挑战', desc: '进阶提升' },
                ].map(d => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      difficulty === d.key ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className={`text-sm font-bold ${difficulty === d.key ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>{d.label}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">AI 导师风格</label>
              <div className="space-y-3">
                {[
                  { key: 'encouraging', label: '鼓励引导型', desc: '多给正向反馈，耐心循序渐进', emoji: '🤗' },
                  { key: 'concise', label: '精炼直接型', desc: '简明扼要，直击重点干货', emoji: '🎯' },
                  { key: 'humorous', label: '幽默风趣型', desc: '语言轻松有趣，寓教于乐', emoji: '😄' },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setAiStyle(s.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      aiStyle === s.key ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${aiStyle === s.key ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-slate-200'}`}>{s.label}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                    {aiStyle === s.key && <Check className="w-5 h-5 text-violet-500" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={savePreference}
              className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {prefSaved ? <><Check className="w-5 h-5" /> 已保存</> : '应用偏好设置'}
            </button>
          </div>
        </SettingsModal>

        {/* ═══ 帮助与反馈 Modal ═══ */}
        <SettingsModal open={openModal === 'help'} onClose={() => setOpenModal(null)} title="帮助与反馈">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">常见问题 FAQ</label>
              <div className="space-y-3">
                {[
                  { q: '如何开始学习一门课程？', a: '在首页选择你感兴趣的课程，完成 AI 采访后会自动生成个性化学习目录，点击章节即可开始学习。' },
                  { q: 'AI 导师会直接告诉我答案吗？', a: '不会。AI 导师只会提供提示和思路引导，帮助你自主思考，答案需要你自己来找到。' },
                  { q: '学习进度会丢失吗？', a: '学习进度保存在浏览器本地，清除浏览器数据或点击「清除数据」会导致进度丢失。建议定期使用 AI 生成复盘笔记做备份。' },
                ].map((faq, i) => (
                  <details key={i} className="bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden group border border-slate-100 dark:border-white/5">
                    <summary className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-between list-none">
                      <span>{faq.q}</span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">提交反馈</label>
              {feedbackSent ? (
                <div className="text-center py-8 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
                  <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">感谢你的反馈！</p>
                  <p className="text-xs font-medium text-green-600 dark:text-green-500 mt-1">产品团队会尽快处理</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    rows={4}
                    placeholder="遇到什么问题或有好的建议？告诉我们吧..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none transition-all"
                  />
                  <button
                    onClick={sendFeedback}
                    disabled={!feedbackText.trim()}
                    className="w-full mt-3 py-3.5 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-md disabled:shadow-none"
                  >
                    <Send className="w-4 h-4" /> 提交反馈
                  </button>
                </>
              )}
            </div>
          </div>
        </SettingsModal>
      </div>
    </div>
  );
}
