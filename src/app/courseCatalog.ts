export interface CourseInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  courseType: "standard" | "custom";
}

export interface CourseMeta {
  gradient: string;
  iconBg: string;
  tags: string[];
  highlights: string[];
  level: string;
  hours: string;
  students: string;
  badge?: string;
  keyTopics: string[];
}

export const COURSES: CourseInfo[] = [
  {
    id: "python",
    name: "Python 基础",
    icon: "🐍",
    description: "最适合新手的第一门语言，语法简洁，广泛用于自动化、数据分析和 AI 开发。",
    color: "#3776AB",
    courseType: "standard",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    description: "网页交互的核心语言，是前端开发和全栈能力的基础。",
    color: "#d97706",
    courseType: "standard",
  },
  {
    id: "java",
    name: "Java 编程",
    icon: "☕",
    description: "企业级后端的经典主力语言，适合建立扎实的软件工程基础。",
    color: "#ED8B00",
    courseType: "standard",
  },
  {
    id: "cpp",
    name: "C++ 编程",
    icon: "⚙️",
    description: "强调性能与底层控制，适合系统编程、游戏开发和算法竞赛。",
    color: "#00599C",
    courseType: "standard",
  },
  {
    id: "html-css",
    name: "HTML & CSS",
    icon: "🎨",
    description: "从页面结构到视觉样式，零基础快速上手网页开发。",
    color: "#E34F26",
    courseType: "standard",
  },
  {
    id: "sql",
    name: "SQL 数据库",
    icon: "🗄️",
    description: "用结构化查询语句从海量数据中筛选、分析和组织信息。",
    color: "#4479A1",
    courseType: "standard",
  },
  {
    id: "react",
    name: "React 框架",
    icon: "⚛️",
    description: "组件化构建现代前端应用的主流框架，适合做复杂交互界面。",
    color: "#0ea5e9",
    courseType: "standard",
  },
  {
    id: "go",
    name: "Go 语言",
    icon: "🦫",
    description: "简洁、高并发、面向云原生，是现代后端和微服务的热门选择。",
    color: "#00ADD8",
    courseType: "standard",
  },
];

export const COURSE_META: Record<string, CourseMeta> = {
  python: {
    gradient: "from-[#3b82f6] via-[#6366f1] to-[#8b5cf6]",
    iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    tags: ["数据分析", "AI/ML", "自动化"],
    highlights: ["变量、函数等核心语法", "文件处理与异常管理", "项目式练习强化"],
    level: "零基础友好",
    hours: "40 小时",
    students: "12.8k",
    badge: "最受欢迎",
    keyTopics: ["变量", "函数", "文件处理", "异常处理", "列表与字典"],
  },
  javascript: {
    gradient: "from-[#f59e0b] via-[#f97316] to-[#ea580c]",
    iconBg: "bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    tags: ["前端开发", "Web交互", "全栈基础"],
    highlights: ["DOM 操作与事件", "异步编程 async/await", "构建交互式网页"],
    level: "有网页基础更佳",
    hours: "35 小时",
    students: "9.3k",
    badge: "热门推荐",
    keyTopics: ["DOM", "事件监听", "异步编程", "数组与对象"],
  },
  java: {
    gradient: "from-[#ef4444] via-[#f43f5e] to-[#e11d48]",
    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    tags: ["后端开发", "Android", "大数据"],
    highlights: ["面向对象设计思想", "并发基础", "企业级项目实践"],
    level: "逻辑基础者",
    hours: "50 小时",
    students: "7.6k",
    keyTopics: ["类与对象", "集合框架", "异常处理", "多线程"],
  },
  cpp: {
    gradient: "from-[#0ea5e9] via-[#0284c7] to-[#2563eb]",
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
    tags: ["系统编程", "游戏开发", "算法竞赛"],
    highlights: ["指针与内存管理", "STL 标准库", "高性能程序设计"],
    level: "有编程基础更佳",
    hours: "60 小时",
    students: "4.2k",
    keyTopics: ["指针", "STL", "类与模板", "内存管理"],
  },
  "html-css": {
    gradient: "from-[#ec4899] via-[#f43f5e] to-[#f97316]",
    iconBg: "bg-pink-50 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    tags: ["网页设计", "响应式布局", "UI开发"],
    highlights: ["HTML5 语义化标签", "CSS Flexbox/Grid", "动画与视觉效果"],
    level: "完全零基础",
    hours: "25 小时",
    students: "11.2k",
    badge: "入门首选",
    keyTopics: ["HTML 结构", "CSS 选择器", "Flexbox", "响应式布局"],
  },
  sql: {
    gradient: "from-[#14b8a6] via-[#0d9488] to-[#0284c7]",
    iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    tags: ["数据分析", "后端开发", "数据库管理"],
    highlights: ["SELECT 查询与过滤", "多表联查 JOIN", "索引优化与事务"],
    level: "零基础可学",
    hours: "20 小时",
    students: "6.7k",
    keyTopics: ["SELECT", "WHERE", "JOIN", "GROUP BY"],
  },
  react: {
    gradient: "from-[#38bdf8] via-[#0ea5e9] to-[#14b8a6]",
    iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    tags: ["前端框架", "单页应用", "组件化开发"],
    highlights: ["组件化与 JSX", "Hooks 状态管理", "真实项目实战"],
    level: "需掌握 JS 基础",
    hours: "45 小时",
    students: "8.4k",
    badge: "高薪必备",
    keyTopics: ["JSX", "组件", "Hooks", "状态管理"],
  },
  go: {
    gradient: "from-[#10b981] via-[#059669] to-[#0891b2]",
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    tags: ["云原生", "微服务", "高并发"],
    highlights: ["Go 语法与类型", "Goroutine 并发", "云原生生态工具"],
    level: "有编程经验更佳",
    hours: "40 小时",
    students: "3.8k",
    keyTopics: ["goroutine", "channel", "接口", "HTTP 服务"],
  },
};

export function getCourseById(courseId?: string | null) {
  return COURSES.find((course) => course.id === courseId);
}
