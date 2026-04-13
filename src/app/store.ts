// Lightweight localStorage-based store for learning platform

export interface CourseInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface UserProfile {
  courseId: string;
  answers: string[];
  summary: string;
}

export interface CurriculumSection {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number; // 0-100
  understanding: 'none' | 'beginner' | 'intermediate' | 'advanced';
}

export interface CurriculumChapter {
  id: string;
  title: string;
  description: string;
  sections: CurriculumSection[];
}

export interface CurriculumItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number; // 0-100
  understanding: 'none' | 'beginner' | 'intermediate' | 'advanced';
}

export interface Curriculum {
  courseId: string;
  items: CurriculumItem[];
  chapters: CurriculumChapter[];
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdAt: string;
  isAIGenerated: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Quiz question types
export interface QuizOption {
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'choice' | 'fill';
  question: string;
  options?: QuizOption[]; // for choice
  answer: string; // correct answer: option label for choice, text for fill
  explanation: string;
  hint: string;
}

export interface LearningSession {
  courseId: string;
  itemId: string;
  messages: ChatMessage[];
}

// Available courses
export const COURSES: CourseInfo[] = [
  { id: 'python', name: 'Python 基础', icon: '🐍', description: '最适合新手的第一门语言，语法简洁如读英文，广泛用于数据分析、AI 开发和自动化脚本。', color: '#3776AB' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡', description: '网页的灵魂语言，让静态页面变得可交互，是所有前端工程师的必修课。', color: '#d97706' },
  { id: 'java', name: 'Java 编程', icon: '☕', description: '稳居企业后端开发主流，强类型与 OOP 设计让你建立扎实的编程思维。', color: '#ED8B00' },
  { id: 'cpp', name: 'C++ 编程', icon: '⚙️', description: '掌控底层硬件与极致性能，游戏引擎、操作系统和算法竞赛的核心语言。', color: '#00599C' },
  { id: 'html-css', name: 'HTML & CSS', icon: '🎨', description: '从一张白纸到精美网页，掌握网页结构与样式，零基础快速上手视觉开发。', color: '#E34F26' },
  { id: 'sql', name: 'SQL 数据库', icon: '🗄️', description: '数据时代的核心技能，用简洁语句从数百万条记录中精准查询和分析数据。', color: '#4479A1' },
  { id: 'react', name: 'React 框架', icon: '⚛️', description: 'Facebook 开源的前端利器，组件化思想让复杂 UI 变得清晰可维护，市场需求极高。', color: '#0ea5e9' },
  { id: 'go', name: 'Go 语言', icon: '🦫', description: '谷歌设计的云原生语言，天生支持高并发，简洁又高效，是微服务开发的新宠。', color: '#00ADD8' },
];

// Interview questions per course
export const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  python: [
<<<<<<< HEAD
    '先聊聊你自己吧 😊 你是学生、上班族还是纯粹因为兴趣想学编程？',
=======
    '先聊聊你自己吧 😊 你是学生、上班族还是纯粹因为兴趣想学这个领域？',
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
    '有没有接触过编程？哪怕是改过Excel公式、写过简单脚本都算！',
    '学 Python 你最想用它来做什么？比如自动化处理重复工作、做数据分析、搞AI、还是写个小工具？',
    '你觉得自己学新东西时，是喜欢先看理论再动手，还是喜欢直接上手做、遇到不懂再查？',
    '每天大概能花多少时间学习？有没有一个期望的"出师"时间？',
  ],
  javascript: [
    '你有没有用过 HTML 或 CSS 搭过网页？哪怕是很简单的那种也算 🙋',
    '你学 JavaScript 最想实现什么效果？比如做一个炫酷的交互页面、还是想搞全栈开发、做小程序？',
    '你平时浏览网页时，有没有哪个网站的交互效果让你觉得"好酷，我也想做"？可以描述一下~',
    '你更喜欢跟着一步步的教程走，还是给你一个目标自己摸索着完成？',
    '每周大概能拿出多少时间来学习？周末会比工作日多一些吗？',
  ],
  java: [
    '说说你的背景吧！是计算机相关专业的学生，还是想转行做开发？🤔',
    '有没有学过其他编程语言？如果有，觉得自己掌握到什么程度了？',
    '你学 Java 主要是为了什么方向？比如做 Android App、写后端服务、还是为了找工作面试刷题？',
    '你对"面向对象"这个概念有没有一点了解？比如知不知道"类"和"对象"大概是什么意思？',
    '你的学习节奏一般是怎样的？喜欢每天学一点，还是集中时间突击？',
  ],
  cpp: [
    '先问一个关键问题：你学 C++ 是为了算法竞赛（ACM/OI）、游戏开发、还是系统底层编程？🎯 不同方向的学习路径差别很大',
    '你之前有没有学过 C 语言？如果学过，指针和内存管理这块你觉得自己掌握得怎么样？',
    '你了不了解计算机是怎么执行程序的？比如编译、链接这些概念有没有听说过？',
    'C++ 的学习曲线比较陡，你有没有心理准备？遇到卡壳的时候一般会怎么处理？',
    '你预计每周能投入多少小时来学习？有没有明确的目标时间点，比如几个月内要搞定？',
  ],
  'html-css': [
    '你有没有试过自己做网页？哪怕是用模板改过也行！跟我说说你的经历 😄',
    '你学网页开发是为了什么呢？做个人博客、公司官网、还是想往前端开发的职业方向走？',
    '你平时有没有关注过网页设计？比如配色、排版这些，你觉得自己有没有一点审美直觉？',
    '你知道"响应式设计"是什么意思吗？就是一个网页在手机和电脑上都能好看地显示',
    '你打算怎么安排学习时间？是想快速上手做出东西，还是慢慢把基础打扎实？',
  ],
  sql: [
    '你之前有没有用过 Excel 或者 Google Sheets 处理过数据？SQL 的思路和它有一些相似之处 📊',
    '你学 SQL 的场景是什么？工作中需要查数据库、想做数据分析、还是学后端开发用得上？',
    '你知道什么是"数据库"吗？能简单说说你的理解就行，完全不知道也没关系~',
    '你平时工作或学习中，有没有遇到过"要从一大堆数据里找到有用信息"的场景？',
    '你希望学到什么程度？能写基本查询就够了，还是想掌握复杂的多表关联、子查询这些？',
  ],
  react: [
    '你现在 JavaScript 的水平大概到哪了？能不能自己写一个完整的小功能？比如 Todo List 🧩',
    '你之前有没有用过 Vue、Angular 或者其他前端框架？用过的话感觉怎么样？',
    '你学 React 是打算用来做什么项目？工作需要、个人项目、还是找工作准备？',
    '你听说过"组件化开发"和"虚拟DOM"这些概念吗？不了解也完全没问题',
    '你喜欢从零开始一步步搭项目，还是喜欢先看一个完整的项目再去理解每个部分？',
    '你的学习时间安排大概是怎样的？有没有明确想在多久内可以独立开发一个 React 应用？',
  ],
  go: [
    '你之前用过什么编程语言？对静态类型语言（比如 Java、C++）和动态类型语言（比如 Python）有什么体会？🐹',
    '你学 Go 是为了什么？写高并发后端服务、做微服务架构、云原生开发、还是纯粹觉得 Go 很酷？',
    '你对后端开发和服务器这块了解多少？比如 HTTP、API、数据库这些概念熟不熟？',
    '你有没有接触过并发编程？比如多线程、异步这些概念？Go 的 goroutine 是它的一大亮点',
    '你是喜欢先系统学完语法再写项目，还是边学边做、实战驱动？',
  ],
<<<<<<< HEAD
=======
  custom: [
    '关于这门课，你觉得自己目前是零基础小白，还是已经有一些了解了？',
    '你希望通过这门课达到什么样的目标？比如解决某个具体问题、通过考试、或者纯粹是兴趣？',
    '你更喜欢什么样的学习方式？是喜欢看理论推导，还是喜欢直接看实操演示？',
    '你每天大概能抽出多少时间来学习？',
    '有没有什么特别关注的重点或难点？',
  ],
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d
};

// Mock AI curriculum generation
export function generateCurriculum(courseId: string, _answers: string[]): CurriculumItem[] {
  const curricula: Record<string, CurriculumItem[]> = {
    python: [
      { id: '1', title: '环境搭建与第一个程序', description: '安装 Python，了解 IDE，编写 Hello World', completed: false, progress: 0, understanding: 'none' },
      { id: '2', title: '变量与数据类型', description: '数字、字符串、布尔值、类型转换', completed: false, progress: 0, understanding: 'none' },
      { id: '3', title: '运算符与表达式', description: '算术、比较、逻辑运算符', completed: false, progress: 0, understanding: 'none' },
      { id: '4', title: '条件语句', description: 'if-elif-else 语句，条件嵌套', completed: false, progress: 0, understanding: 'none' },
      { id: '5', title: '循环结构', description: 'for 循环、while 循环、break/continue', completed: false, progress: 0, understanding: 'none' },
      { id: '6', title: '列表与元组', description: '序列类型操作、切片、列表推导式', completed: false, progress: 0, understanding: 'none' },
      { id: '7', title: '字典与集合', description: '键值对、集合运算、数据组织', completed: false, progress: 0, understanding: 'none' },
      { id: '8', title: '函数基础', description: '定义函数、参数、返回值、作用域', completed: false, progress: 0, understanding: 'none' },
      { id: '9', title: '文件操作', description: '读写文件、文件模式、上下文管理器', completed: false, progress: 0, understanding: 'none' },
      { id: '10', title: '异常处理', description: 'try-except、自定义异常', completed: false, progress: 0, understanding: 'none' },
      { id: '11', title: '面向对象编程', description: '类与对象、继承、封装、多态', completed: false, progress: 0, understanding: 'none' },
      { id: '12', title: '模块与包', description: '导入模块、创建包、pip 使用', completed: false, progress: 0, understanding: 'none' },
      { id: '13', title: '综合项目实战', description: '运用所学知识完成一个小项目', completed: false, progress: 0, understanding: 'none' },
    ],
    javascript: [
      { id: '1', title: '认识 JavaScript', description: '浏览器控制台、基本语法', completed: false, progress: 0, understanding: 'none' },
      { id: '2', title: '变量与数据类型', description: 'let/const/var、原始类型与引用类型', completed: false, progress: 0, understanding: 'none' },
      { id: '3', title: '运算符与流程控制', description: '条件判断、循环、switch', completed: false, progress: 0, understanding: 'none' },
      { id: '4', title: '函数', description: '函数声明、箭头函数、闭包', completed: false, progress: 0, understanding: 'none' },
      { id: '5', title: '数组方法', description: 'map/filter/reduce/forEach', completed: false, progress: 0, understanding: 'none' },
      { id: '6', title: '对象与解构', description: '对象操作、展开运算符、解构赋值', completed: false, progress: 0, understanding: 'none' },
      { id: '7', title: 'DOM 操作', description: '选择元素、事件监听、动态修改页面', completed: false, progress: 0, understanding: 'none' },
      { id: '8', title: '异步编程', description: 'Promise、async/await、fetch', completed: false, progress: 0, understanding: 'none' },
      { id: '9', title: 'ES6+ 新特性', description: '模块化、类、模板字符串', completed: false, progress: 0, understanding: 'none' },
      { id: '10', title: '综合项目', description: '构建一个交互式 Web 应用', completed: false, progress: 0, understanding: 'none' },
    ],
  };

  // Default curriculum for courses without specific data
  const defaultCurriculum: CurriculumItem[] = [
    { id: '1', title: '基础概念与环境搭建', description: '了解核心概念，配置开发环境', completed: false, progress: 0, understanding: 'none' },
    { id: '2', title: '基本语法入门', description: '变量、数据类型、基本操作', completed: false, progress: 0, understanding: 'none' },
    { id: '3', title: '流程控制', description: '条件判断与循环结构', completed: false, progress: 0, understanding: 'none' },
    { id: '4', title: '数据结构', description: '常用数据结构与操作', completed: false, progress: 0, understanding: 'none' },
    { id: '5', title: '函数与模块化', description: '函数定义、模块化编程', completed: false, progress: 0, understanding: 'none' },
    { id: '6', title: '面向对象编程', description: '类、对象、继承', completed: false, progress: 0, understanding: 'none' },
    { id: '7', title: '错误处理与调试', description: '异常处理、调试技巧', completed: false, progress:0, understanding: 'none' },
    { id: '8', title: '实用工具与库', description: '常用库与工具介绍', completed: false, progress: 0, understanding: 'none' },
    { id: '9', title: '项目实战', description: '综合运用所学完成项目', completed: false, progress: 0, understanding: 'none' },
  ];

  return curricula[courseId] || defaultCurriculum;
}

// Generate hierarchical chapter-section curriculum
export function generateChapters(courseId: string, _answers: string[]): CurriculumChapter[] {
  const chaptersMap: Record<string, CurriculumChapter[]> = {
    python: [
      {
        id: 'ch1', title: '第一章：入门准备', description: '搭建开发环境，迈出编程第一步',
        sections: [
          { id: '1-1', title: '安装 Python 环境', description: '下载安装 Python 解释器与配置环境变量', completed: false, progress: 0, understanding: 'none' },
          { id: '1-2', title: '认识 IDE 与编辑器', description: 'VS Code / PyCharm 的安装与基本使用', completed: false, progress: 0, understanding: 'none' },
          { id: '1-3', title: '编写第一个程序', description: 'Hello World 与程序运行流程', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch2', title: '第二章：数据基础', description: '理解变量、数据类型与基本运算',
        sections: [
          { id: '2-1', title: '变量与命名规则', description: '变量的概念、命名规范与赋值', completed: false, progress: 0, understanding: 'none' },
          { id: '2-2', title: '数字类型', description: '整数、浮点数与数学运算', completed: false, progress: 0, understanding: 'none' },
          { id: '2-3', title: '字符串操作', description: '字符串创建、拼接、格式化与常用方法', completed: false, progress: 0, understanding: 'none' },
          { id: '2-4', title: '布尔值与类型转换', description: '布尔逻辑与不同类型之间的转换', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch3', title: '第三章：流程控制', description: '让程序学会做判断和重复执行',
        sections: [
          { id: '3-1', title: '条件语句 if-elif-else', description: '单分支、多分支与条件嵌套', completed: false, progress: 0, understanding: 'none' },
          { id: '3-2', title: 'for 循环', description: 'range()、遍历序列与循环控制', completed: false, progress: 0, understanding: 'none' },
          { id: '3-3', title: 'while 循环', description: '条件循环、break 与 continue', completed: false, progress: 0, understanding: 'none' },
          { id: '3-4', title: '循环实战练习', description: '九九乘法表、猜数字游戏等', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch4', title: '第四章：数据容器', description: '用合适的结构组织和管理数据',
        sections: [
          { id: '4-1', title: '列表基础', description: '列表创建、索引、切片与增删改查', completed: false, progress: 0, understanding: 'none' },
          { id: '4-2', title: '列表进阶', description: '列表推导式、排序与嵌套列表', completed: false, progress: 0, understanding: 'none' },
          { id: '4-3', title: '元组与不可变性', description: '元组的特性与使用场景', completed: false, progress: 0, understanding: 'none' },
          { id: '4-4', title: '字典', description: '键值对、字典操作与遍历', completed: false, progress: 0, understanding: 'none' },
          { id: '4-5', title: '集合', description: '集合运算、去重与成员判断', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch5', title: '第五章：函数', description: '代码复用的核心工具',
        sections: [
          { id: '5-1', title: '函数定义与调用', description: 'def 关键字、参数与返回值', completed: false, progress: 0, understanding: 'none' },
          { id: '5-2', title: '参数类型', description: '位置参数、关键字参数、默认值与可变参数', completed: false, progress: 0, understanding: 'none' },
          { id: '5-3', title: '作用域与闭包', description: '局部变量、全局变量与 LEGB 规则', completed: false, progress: 0, understanding: 'none' },
          { id: '5-4', title: 'Lambda 与高阶函数', description: '匿名函数、map/filter/sorted', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch6', title: '第六章：文件与异常', description: '程序与外部世界的交互',
        sections: [
          { id: '6-1', title: '文件读写', description: '打开、读取、写入文件与文件模式', completed: false, progress: 0, understanding: 'none' },
          { id: '6-2', title: '上下文管理器', description: 'with 语句与资源自动管理', completed: false, progress: 0, understanding: 'none' },
          { id: '6-3', title: '异常处理', description: 'try-except-finally 与异常类型', completed: false, progress: 0, understanding: 'none' },
          { id: '6-4', title: '自定义异常', description: '创建自己的异常类', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch7', title: '第七章：面向对象编程', description: '用对象思维来组织代码',
        sections: [
          { id: '7-1', title: '类与对象', description: '类的定义、实例化与属性', completed: false, progress: 0, understanding: 'none' },
          { id: '7-2', title: '方法与 self', description: '实例方法、类方法与静态方法', completed: false, progress: 0, understanding: 'none' },
          { id: '7-3', title: '继承与多态', description: '子类、方法重写与多态', completed: false, progress: 0, understanding: 'none' },
          { id: '7-4', title: '封装与魔术方法', description: '私有属性与 __init__、__str__ 等', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch8', title: '第八章：模块与项目实战', description: '从学习者到开发者的进阶',
        sections: [
          { id: '8-1', title: '模块与包', description: 'import 语句、创建模块与包', completed: false, progress: 0, understanding: 'none' },
          { id: '8-2', title: 'pip 与第三方库', description: '包管理器使用与常用库介绍', completed: false, progress: 0, understanding: 'none' },
          { id: '8-3', title: '综合项目实战', description: '运用所学知识完成一个完整小项目', completed: false, progress: 0, understanding: 'none' },
        ],
      },
    ],
    javascript: [
      {
        id: 'ch1', title: '第一章：认识 JavaScript', description: '了解 JS 的世界与开发环境',
        sections: [
          { id: '1-1', title: '浏览器控制台', description: '使用浏览器开发者工具运行 JS 代码', completed: false, progress: 0, understanding: 'none' },
          { id: '1-2', title: '基本语法概览', description: '语句、注释与代码结构', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch2', title: '第二章：数据与变量', description: '掌握 JS 的数据基础',
        sections: [
          { id: '2-1', title: 'let / const / var', description: '变量声明方式与区别', completed: false, progress: 0, understanding: 'none' },
          { id: '2-2', title: '原始数据类型', description: '数字、字符串、布尔、null、undefined', completed: false, progress: 0, understanding: 'none' },
          { id: '2-3', title: '引用类型初探', description: '数组与对象的基本概念', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch3', title: '第三章：运算与流程控制', description: '让程序做出判断与循环',
        sections: [
          { id: '3-1', title: '运算符', description: '算术、比较、逻辑与三元运算符', completed: false, progress: 0, understanding: 'none' },
          { id: '3-2', title: '条件语句', description: 'if-else、switch-case', completed: false, progress: 0, understanding: 'none' },
          { id: '3-3', title: '循环', description: 'for、while、do-while 循环', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch4', title: '第四章：函数', description: '代码复用的基石',
        sections: [
          { id: '4-1', title: '函数声明与表达式', description: 'function 关键字与函数表达式', completed: false, progress: 0, understanding: 'none' },
          { id: '4-2', title: '箭头函数', description: 'ES6 箭头函数语法', completed: false, progress: 0, understanding: 'none' },
          { id: '4-3', title: '作用域与闭包', description: '词法作用域与闭包应用', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch5', title: '第五章：数组与对象', description: '核心数据结构深入',
        sections: [
          { id: '5-1', title: '数组方法', description: 'map / filter / reduce / forEach', completed: false, progress: 0, understanding: 'none' },
          { id: '5-2', title: '对象操作', description: '属性访问、遍历与原型链', completed: false, progress: 0, understanding: 'none' },
          { id: '5-3', title: '解构与展开', description: '解构赋值与展开运算符', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch6', title: '第六章：DOM 与事件', description: '让网页动起来',
        sections: [
          { id: '6-1', title: 'DOM 选择与操作', description: '查找元素、修改内容与样式', completed: false, progress: 0, understanding: 'none' },
          { id: '6-2', title: '事件监听', description: '点击、输入等事件处理', completed: false, progress: 0, understanding: 'none' },
          { id: '6-3', title: '动态页面', description: '创建、删除元素与动态渲染', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch7', title: '第七章：异步与 ES6+', description: '现代 JS 核心特性',
        sections: [
          { id: '7-1', title: 'Promise', description: '异步操作与 Promise 链', completed: false, progress: 0, understanding: 'none' },
          { id: '7-2', title: 'async / await', description: '更优雅的异步写法', completed: false, progress: 0, understanding: 'none' },
          { id: '7-3', title: 'Fetch API', description: '网络请求与数据获取', completed: false, progress: 0, understanding: 'none' },
          { id: '7-4', title: 'ES6+ 新特性', description: '模块化、类、模板字符串等', completed: false, progress: 0, understanding: 'none' },
        ],
      },
      {
        id: 'ch8', title: '第八章：综合项目', description: '构建一个交互式 Web 应用',
        sections: [
          { id: '8-1', title: '项目规划', description: '需求分析与功能设计', completed: false, progress: 0, understanding: 'none' },
          { id: '8-2', title: '项目实现', description: '编码实现与调试', completed: false, progress: 0, understanding: 'none' },
          { id: '8-3', title: '项目优化与总结', description: '代码优化与学习回顾', completed: false, progress: 0, understanding: 'none' },
        ],
      },
    ],
  };

  const defaultChapters: CurriculumChapter[] = [
    {
      id: 'ch1', title: '第一章：基础入门', description: '了解核心概念与开发环境搭建',
      sections: [
        { id: '1-1', title: '核心概念介绍', description: '了解语言特性与应用场景', completed: false, progress: 0, understanding: 'none' },
        { id: '1-2', title: '环境搭建', description: '安装开发工具与配置环境', completed: false, progress: 0, understanding: 'none' },
        { id: '1-3', title: '第一个程序', description: '编写并运行 Hello World', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch2', title: '第二章：基本语法', description: '变量、数据类型与基本操作',
      sections: [
        { id: '2-1', title: '变量与数据类型', description: '声明变量与了解数据类型', completed: false, progress: 0, understanding: 'none' },
        { id: '2-2', title: '运算符与表达式', description: '算术、比较与逻辑运算', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch3', title: '第三章：流程控制', description: '条件判断与循环结构',
      sections: [
        { id: '3-1', title: '条件语句', description: '分支判断与选择执行', completed: false, progress: 0, understanding: 'none' },
        { id: '3-2', title: '循环结构', description: '重复执行与循环控制', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch4', title: '第四章：数据结构', description: '常用数据结构与操作',
      sections: [
        { id: '4-1', title: '线性数据结构', description: '数组、列表等', completed: false, progress: 0, understanding: 'none' },
        { id: '4-2', title: '键值数据结构', description: '字典、映射等', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch5', title: '第五章：函数与模块化', description: '函数定义与代码组织',
      sections: [
        { id: '5-1', title: '函数定义与调用', description: '参数、返回值与作用域', completed: false, progress: 0, understanding: 'none' },
        { id: '5-2', title: '模块化编程', description: '代码拆分与模块管理', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch6', title: '第六章：面向对象', description: '类、对象与继承',
      sections: [
        { id: '6-1', title: '类与对象', description: '定义类与创建实例', completed: false, progress: 0, understanding: 'none' },
        { id: '6-2', title: '继承与多态', description: '代码复用与扩展', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch7', title: '第七章：进阶主题', description: '错误处理与实用工具',
      sections: [
        { id: '7-1', title: '错误处理与调试', description: '异常处理与调试技巧', completed: false, progress: 0, understanding: 'none' },
        { id: '7-2', title: '常用库与工具', description: '第三方库与开发工具', completed: false, progress: 0, understanding: 'none' },
      ],
    },
    {
      id: 'ch8', title: '第八章：项目实战', description: '综合运用所学完成项目',
      sections: [
        { id: '8-1', title: '项目实战', description: '独立完成一个完整项目', completed: false, progress: 0, understanding: 'none' },
      ],
    },
  ];

  return chaptersMap[courseId] || defaultChapters;
}

// Mock AI learning companion responses
export function generateLearningResponse(courseId: string, topicTitle: string, userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('不懂') || lowerMsg.includes('不理解') || lowerMsg.includes('什么意思')) {
    return `没关系，「${topicTitle}」这个知识点确实需要时间消化。让我换个方式给你解释：\n\n想象一下日常生活中的例子 —— 比如你去超市买东西，你需要一个购物清单（这就像变量），每个商品有名字和价格（这就像数据类型）。\n\n编程其实就是把现实世界的逻辑用代码表达出来。你具体哪个部分感觉最困惑？我可以给你更针对性的解释。`;
  }
  
  if (lowerMsg.includes('例子') || lowerMsg.includes('举例') || lowerMsg.includes('代码')) {
    return `好的，给你一个关于「${topicTitle}」的实际例子：\n\n\`\`\`\n# 这是一个简单的示例\n# 你可以试着理解每一行的作用\nresult = "Hello, 学习者!"\nprint(result)\n\`\`\`\n\n这段代码的核心思路是：先创建数据，然后处理数据，最后输出结果。你可以试着自己修改一下，看看会发生什么变化。\n\n有什么地方需要我进一步解释的吗？`;
  }

  if (lowerMsg.includes('练习') || lowerMsg.includes('题目') || lowerMsg.includes('测试')) {
    return `很好，你想要动手练习！这是掌握「${topicTitle}」最好的方式。\n\n💡 **小练习：**\n1. 试着用今天学到的知识，写一个小程序来解决一个实际问题\n2. 比如：计算你一周的花销总额\n3. 尝试用不同的方式实现同一个功能\n\n完成后可以把你的代码发给我，我来帮你看看有没有可以改进的地方！`;
  }

  if (lowerMsg.includes('下一') || lowerMsg.includes('继续') || lowerMsg.includes('学完了')) {
    return `太棒了！看起来你对「${topicTitle}」已经有了不错的理解。\n\n📊 **学习小结：**\n- 你已经掌握了本节的核心概念\n- 建议你做几个练习来巩固\n- 准备好后就可以进入下一个章节了\n\n记得经常回顾之前学过的内容，编程学习是一个螺旋上升的过程。继续加油！💪`;
  }

  return `关于「${topicTitle}」的这个问题，我来为你解答：\n\n这是一个很好的问题！在学习${COURSES.find(c => c.id === courseId)?.name || '编程'}的过程中，理解这些概念非常重要。\n\n**核心要点：**\n1. 首先理解基本概念和原理\n2. 然后通过实际代码加深理解\n3. 最后通过练习来巩固\n\n你可以试着：\n- 用自己的话复述一下你的理解\n- 写一段简单的代码来验证\n- 如果遇到困难，随时问我\n\n学习编程就像学骑自行车，多练习就会越来越熟练。你还有什么想问的吗？`;
}

// Generate quiz questions for a section
<<<<<<< HEAD
export async function generateQuizQuestions(courseId: string, sectionId: string, sectionTitle: string): Promise<QuizQuestion[]> {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/study/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_id: courseId,
        section_id: sectionId,
        section_title: sectionTitle
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const result = await response.json();
    return result.data as QuizQuestion[];
  } catch (error) {
    console.error('Error generating questions:', error);
    // Fallback static questions (simplified for brevity)
    return [
      { id: 'fb1', type: 'choice', question: `${sectionTitle} 的主要概念是什么？`, options: [{ label: 'A', text: '选项 A' }, { label: 'B', text: '选项 B' }], answer: 'A', explanation: '这是系统出错时的默认生成题目', hint: '选择 A' }
    ];
  }
}

=======
export function generateQuizQuestions(courseId: string, sectionId: string, sectionTitle: string): QuizQuestion[] {
  // Comprehensive question bank mapped by sectionId
  const questionBank: Record<string, QuizQuestion[]> = {
    // Python Chapter 1
    '1-1': [
      { id: 'q1', type: 'choice', question: 'Python 是以下哪种类型的编程语言？', options: [{ label: 'A', text: '编译型语言' }, { label: 'B', text: '解释型语言' }, { label: 'C', text: '汇编语言' }, { label: 'D', text: '标记语言' }], answer: 'B', explanation: 'Python 是一种解释型语言，代码在运行时由解释器逐行翻译执行，而不需要提前编译。', hint: '想想 Python 运行代码时需不需要先"翻译"成机器码文件？' },
      { id: 'q2', type: 'fill', question: '在命令行中输入 ______ 命令可以查看当前安装的 Python 版本。', answer: 'python --version', explanation: '使用 python --version 或 python -V 可以查看已安装的 Python 版本号。', hint: '这个命令以 python 开头，后面跟的参数和"版本"有关。' },
      { id: 'q3', type: 'choice', question: '以下哪个不是 Python 的常用 IDE 或编辑器？', options: [{ label: 'A', text: 'VS Code' }, { label: 'B', text: 'PyCharm' }, { label: 'C', text: 'Xcode' }, { label: 'D', text: 'Jupyter Notebook' }], answer: 'C', explanation: 'Xcode 是 Apple 的 iOS/macOS 开发工具，不是 Python 的常用开发环境。VS Code、PyCharm 和 Jupyter Notebook 都是常用的 Python 开发工具。', hint: '其中一个选项是苹果公司专门为 iOS 开发设计的工具。' },
      { id: 'q4', type: 'choice', question: 'Python 环境变量配置的主要目的是什么？', options: [{ label: 'A', text: '让 Python 运行更快' }, { label: 'B', text: '在任意目录下都能运行 Python 命令' }, { label: 'C', text: '自动更新 Python 版本' }, { label: 'D', text: '安装第三方库' }], answer: 'B', explanation: '配置环境变量后，操作系统可以在任意路径找到 Python 解释器，从而在任意目录的命令行中运行 python 命令。', hint: '没有配置环境变量时，你只能在 Python 安装目录下运行它...' },
    ],
    '1-2': [
      { id: 'q1', type: 'choice', question: 'VS Code 中安装 Python 插件的主要作用是？', options: [{ label: 'A', text: '安装 Python 解释器' }, { label: 'B', text: '提供代码高亮、自动补全、调试等功能' }, { label: 'C', text: '自动编写代码' }, { label: 'D', text: '连接数据库' }], answer: 'B', explanation: 'VS Code 的 Python 插件提供语法高亮、智能提示、代码补全、调试支持等功能，提升编程效率。', hint: '插件主要是增强编辑器对 Python 的"理解"能力。' },
      { id: 'q2', type: 'fill', question: 'PyCharm 是由 ______ 公司开发的 Python 专用 IDE。', answer: 'JetBrains', explanation: 'PyCharm 由 JetBrains 公司开发，是最流行的 Python 专业 IDE 之一。', hint: '这家公司还开发了 IntelliJ IDEA、WebStorm 等知名 IDE。' },
      { id: 'q3', type: 'choice', question: 'IDE 和普通文本编辑器的主要区别是什么？', options: [{ label: 'A', text: 'IDE 只能写 Python' }, { label: 'B', text: 'IDE 集成了编辑、调试、运行等多种功能' }, { label: 'C', text: 'IDE 是免费的，编辑器是收费的' }, { label: 'D', text: '没有区别' }], answer: 'B', explanation: 'IDE（集成开发环境）将代码编辑、编译/运行、调试、版本控制等功能集成在一个软件中，比普通编辑器功能更全面。', hint: 'IDE 的全称是 Integrated Development Environment，关键词是"集成"。' },
    ],
    '1-3': [
      { id: 'q1', type: 'fill', question: '在 Python 中，输出"Hello World"的代码是：______', answer: 'print("Hello World")', explanation: 'print() 是 Python 的内置函数，用于将内容输出到控制台。字符串需要用引号包裹。', hint: '使用 Python 的输出函数，函数名就是"打印"的英文。' },
      { id: 'q2', type: 'choice', question: '运行 Python 程序文件的命令是？', options: [{ label: 'A', text: 'run program.py' }, { label: 'B', text: 'python program.py' }, { label: 'C', text: 'start program.py' }, { label: 'D', text: 'execute program.py' }], answer: 'B', explanation: '使用 python 命令后面跟上文件名，即可运行 Python 程序文件。', hint: '命令以 python 关键字开头。' },
      { id: 'q3', type: 'choice', question: 'Python 源文件的标准扩展名是什么？', options: [{ label: 'A', text: '.pt' }, { label: 'B', text: '.python' }, { label: 'C', text: '.py' }, { label: 'D', text: '.pn' }], answer: 'C', explanation: 'Python 源代码文件使用 .py 作为扩展名，这是 Python 的标准文件格式。', hint: '取 Python 的前两个字母。' },
      { id: 'q4', type: 'fill', question: 'Python 中用 # 符号来添加______。', answer: '注释', explanation: '# 后面的内容会被 Python 解释器忽略，用于给代码添加说明性文字，即注释。', hint: '代码中不会被执行的说明文字叫什么？' },
    ],
    // Python Chapter 2
    '2-1': [
      { id: 'q1', type: 'choice', question: '以下哪个是合法的 Python 变量名？', options: [{ label: 'A', text: '2name' }, { label: 'B', text: 'my-var' }, { label: 'C', text: '_count' }, { label: 'D', text: 'class' }], answer: 'C', explanation: 'Python 变量名只能以字母或下划线开头，不能以数字开头，不能包含连字符，也不能使用关键字。_count 以下划线开头，是合法的。', hint: '变量名可以以下划线开头，但不能以数字开头，也不能是 Python 关键字。' },
      { id: 'q2', type: 'fill', question: '在 Python 中，使用 ______ 运算符给变量赋值。', answer: '=', explanation: '单等号 = 是 Python 的赋值运算符，用于将右边的值赋给左边的变量。', hint: '这是一个数学中也很常见的符号，但在编程中含义不同。' },
      { id: 'q3', type: 'choice', question: '下面代码执行后 x 的值是什么？\nx = 5\nx = x + 3', options: [{ label: 'A', text: '5' }, { label: 'B', text: '3' }, { label: 'C', text: '8' }, { label: 'D', text: '报错' }], answer: 'C', explanation: 'x 先被赋值为 5，然后 x + 3 = 8 的结果再次赋值给 x，所以最终 x 的值是 8。', hint: '第二行相当于用 x 当前的值加 3，然后把结果存回 x。' },
    ],
    '2-2': [
      { id: 'q1', type: 'choice', question: '以下哪个是浮点数？', options: [{ label: 'A', text: '42' }, { label: 'B', text: '"3.14"' }, { label: 'C', text: '3.14' }, { label: 'D', text: 'True' }], answer: 'C', explanation: '3.14 是浮点数（带小数点的数字）。42 是整数，"3.14" 是字符串（有引号），True 是布尔值。', hint: '浮点数就是带小数点的数字，注意区分加了引号的和没加引号的。' },
      { id: 'q2', type: 'fill', question: '在 Python 中，10 / 3 的结果是 ______（保留小数）。', answer: '3.3333333333333335', explanation: 'Python 中 / 是真除法，会返回浮点数结果。10 / 3 = 3.3333...', hint: 'Python 的除法 / 会保留小数部分，不像有些语言会截断。' },
      { id: 'q3', type: 'choice', question: 'Python 中 10 // 3 的结果是？', options: [{ label: 'A', text: '3.33' }, { label: 'B', text: '3' }, { label: 'C', text: '1' }, { label: 'D', text: '10' }], answer: 'B', explanation: '// 是整除运算符（地板除），会舍弃小数部分，只保留整数结果。10 // 3 = 3。', hint: '双斜杠 // 叫做"整除"或"地板除"，结果会向下取整。' },
    ],
    '2-3': [
      { id: 'q1', type: 'fill', question: '在 Python 中，使用 ______ 函数可以获取字符串的长度。', answer: 'len', explanation: 'len() 是 Python 的内置函数，用于返回字符串（或其他序列）的长度。', hint: '这个函数名是 "length"（长度）的缩写。' },
      { id: 'q2', type: 'choice', question: '以下哪种方式可以正确地拼接两个字符串？', options: [{ label: 'A', text: '"Hello" + "World"' }, { label: 'B', text: '"Hello" - "World"' }, { label: 'C', text: '"Hello" * "World"' }, { label: 'D', text: '"Hello" / "World"' }], answer: 'A', explanation: '在 Python 中，+ 运算符用于字符串拼接。"Hello" + "World" 的结果是 "HelloWorld"。', hint: '字符串拼接用的运算符和数字加法用的是同一个符号。' },
      { id: 'q3', type: 'choice', question: 'f"我叫{name}" 这种写法叫做什么？', options: [{ label: 'A', text: '字符串切片' }, { label: 'B', text: 'f-string 格式化' }, { label: 'C', text: '字符串编码' }, { label: 'D', text: '正则表达式' }], answer: 'B', explanation: 'f-string（格式化字符串）是 Python 3.6+ 引入的字符串格式化方式，用 f 前缀和花括号 {} 嵌入变量或表达式。', hint: '注意字符串前面有一个特殊的字母前缀。' },
    ],
    '2-4': [
      { id: 'q1', type: 'choice', question: 'bool("") 的结果是什么？', options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }, { label: 'C', text: '""' }, { label: 'D', text: '报错' }], answer: 'B', explanation: '空字符串 "" 转换为布尔值是 False。在 Python 中，空字符串、0、None、空列表等都是 False。', hint: '想想空的东西在逻辑上应该算"真"还是"假"？' },
      { id: 'q2', type: 'fill', question: '将字符串 "123" 转换为整数的函数是 ______("123")。', answer: 'int', explanation: 'int() 函数用于将其他类型转换为整数。int("123") 的结果是整数 123。', hint: '这个函数名是 "integer"（整数）的缩写。' },
      { id: 'q3', type: 'choice', question: '下面哪个表达式的结果是 True？', options: [{ label: 'A', text: '1 == "1"' }, { label: 'B', text: '1 == 1.0' }, { label: 'C', text: '"True" == True' }, { label: 'D', text: '0 == ""' }], answer: 'B', explanation: 'Python 中整数 1 和浮点数 1.0 在值上是相等的。而不同类型之间（如数字和字符串）通常不相等。', hint: '整数和浮点数虽然类型不同，但如果数值相等...' },
    ],
    // Python Chapter 3
    '3-1': [
      { id: 'q1', type: 'choice', question: '以下哪个是正确的 Python 条件语句写法？', options: [{ label: 'A', text: 'if x > 5 { print("大") }' }, { label: 'B', text: 'if x > 5: print("大")' }, { label: 'C', text: 'if (x > 5) then print("大")' }, { label: 'D', text: 'if x > 5 print("大")' }], answer: 'B', explanation: 'Python 使用冒号 : 来标记代码块的开始，不使用花括号或 then 关键字。', hint: 'Python 的语法特点是用冒号和缩进来代替花括号。' },
      { id: 'q2', type: 'fill', question: '在 if-elif-else 结构中，当所有条件都不满足时，执行 ______ 分支的代码。', answer: 'else', explanation: 'else 是"否则"分支，当前面的 if 和所有 elif 条件都不成立时，会执行 else 中的代码。', hint: '这个关键字表示"其他情况"。' },
      { id: 'q3', type: 'choice', question: 'if 语句中的条件表达式结果应该是什么类型？', options: [{ label: 'A', text: '只能是布尔值' }, { label: 'B', text: '任何可以转换为布尔值的类型' }, { label: 'C', text: '只能是数字' }, { label: 'D', text: '只能是字符串' }], answer: 'B', explanation: 'Python 的 if 条件可以是任何表达式，Python 会自动将其转换为布尔值。例如非零数字、非空字符串都为 True。', hint: '回想一下上一节学的布尔转换规则。' },
    ],
    '3-2': [
      { id: 'q1', type: 'fill', question: 'for i in range(5) 会让 i 从 0 遍历到 ______。', answer: '4', explanation: 'range(5) 生成 0, 1, 2, 3, 4 五个数，不包含 5。这是左闭右开区间。', hint: 'range(n) 生成的数列不包含 n 本身。' },
      { id: 'q2', type: 'choice', question: 'range(2, 8, 2) 会生成哪些数？', options: [{ label: 'A', text: '2, 4, 6, 8' }, { label: 'B', text: '2, 4, 6' }, { label: 'C', text: '2, 3, 4, 5, 6, 7' }, { label: 'D', text: '0, 2, 4, 6' }], answer: 'B', explanation: 'range(2, 8, 2) 从 2 开始，步长为 2，到 8（不包含）为止。生成：2, 4, 6。', hint: '三个参数分别是：起始值、结束值（不包含）、步长。' },
      { id: 'q3', type: 'choice', question: '遍历列表 fruits = ["苹果", "香蕉", "橘子"]，正确的写法是？', options: [{ label: 'A', text: 'for fruit in fruits:' }, { label: 'B', text: 'for fruits in fruit:' }, { label: 'C', text: 'foreach fruit in fruits:' }, { label: 'D', text: 'for fruit of fruits:' }], answer: 'A', explanation: 'Python 使用 for...in... 语法遍历序列，变量名通常用列表名的单数形式。', hint: 'Python 的遍历语法是 for 变量 in 可迭代对象:' },
    ],
    '3-3': [
      { id: 'q1', type: 'choice', question: 'while 循环和 for 循环最大的区别是？', options: [{ label: 'A', text: 'while 更快' }, { label: 'B', text: 'while 适合不确定循环次数的场景' }, { label: 'C', text: 'while 只能循环一次' }, { label: 'D', text: '没有区别' }], answer: 'B', explanation: 'while 循环在条件为 True 时持续执行，适合不知道确切循环次数的场景（如等待用户输入正确密码）。for 循环适合已知遍历范围的场景。', hint: 'while 的含义是"当...的时候"，它关注的是条件而不是次数。' },
      { id: 'q2', type: 'fill', question: '在循环中，______ 关键字用于立即跳出整个循环。', answer: 'break', explanation: 'break 语句会立即终止最近的循环，程序继续执行循环后面的代码。', hint: '这个关键字的意思是"打断"。' },
      { id: 'q3', type: 'choice', question: 'continue 语句的作用是？', options: [{ label: 'A', text: '跳出整个循环' }, { label: 'B', text: '跳过本次循环剩余代码，进入下一次循环' }, { label: 'C', text: '继续执行循环后面的代码' }, { label: 'D', text: '让循环无限执行' }], answer: 'B', explanation: 'continue 会跳过当前这次循环中 continue 之后的代码，直接进入下一次循环判断。', hint: '它跳过的是"这一轮"，而不是"整个循环"。' },
    ],
    '3-4': [
      { id: 'q1', type: 'choice', question: '打印九九乘法表需要使用几层循环？', options: [{ label: 'A', text: '1 层' }, { label: 'B', text: '2 层' }, { label: 'C', text: '3 层' }, { label: 'D', text: '不需要循环' }], answer: 'B', explanation: '九九乘法表需要两层循环：外层控制行（1-9），内层控制列（1-当前行数）。', hint: '乘法表有行和列两个维度。' },
      { id: 'q2', type: 'fill', question: '猜数字游戏中，通常用 ______ 循环来让用户反复猜测直到猜对。', answer: 'while', explanation: '因为不确定用户需要猜多少次才能猜对，所以用 while 循环，条件是"猜测值 != 正确答案"。', hint: '不确定循环次数时应该用哪种循环？' },
    ],
  };

  // Return questions for the section, or generate generic ones
  if (questionBank[sectionId]) {
    return questionBank[sectionId];
  }

  // Generic fallback questions
  return [
    { id: 'q1', type: 'choice', question: `关于「${sectionTitle}」，以下哪个说法是正确的？`, options: [{ label: 'A', text: '这是一个基础概念，不需要深入学习' }, { label: 'B', text: '理解并掌握它是后续学习的重要基础' }, { label: 'C', text: '只有高级开发者才需要学习' }, { label: 'D', text: '这个概念已经过时了' }], answer: 'B', explanation: `「${sectionTitle}」是编程学习中的重要知识点，扎实掌握它能为后续学习打下良好基础。`, hint: '每个知识点都有其存在的价值，尤其是基础部分。' },
    { id: 'q2', type: 'fill', question: `学习「${sectionTitle}」时，最重要的学习方法是多______。`, answer: '练习', explanation: '编程是一门实践性很强的技能，只有通过大量练习才能真正掌握。', hint: '编程学习中"动手"比"看书"更重要。' },
    { id: 'q3', type: 'choice', question: `遇到「${sectionTitle}」相关的问题时，以下哪种做法最好？`, options: [{ label: 'A', text: '直接跳过' }, { label: 'B', text: '先尝试自己思考解决，再查阅资料' }, { label: 'C', text: '直接复制别人的答案' }, { label: 'D', text: '换一个更简单的课程' }], answer: 'B', explanation: '遇到问题时先自己思考，再查阅资料是最好的学习方式，能锻炼独立解决问题的能力。', hint: '好的学习习惯是什么？' },
  ];
}
>>>>>>> 979741d0fc745d1b505487f1df77b1730059d01d

// Generate tutor response for quiz companion (never gives the answer directly)
export function generateTutorResponse(question: QuizQuestion, userMessage: string, isWrong: boolean, wrongAnswer?: string, attemptCount?: number): string {
  const lowerMsg = userMessage.toLowerCase();

  if (isWrong) {
    const encouragements = [
      '没关系，错误是学习的一部分！',
      '别灰心，再想想看！',
      '差一点点了，加油！',
      '犯错说明你在挑战自己，这很好！',
    ];
    const enc = encouragements[Math.floor(Math.random() * encouragements.length)];
    const attempts = attemptCount || 1;

    if (question.type === 'choice' && wrongAnswer) {
      const wrongOpt = question.options?.find(o => o.label === wrongAnswer);
      const wrongText = wrongOpt ? `「${wrongOpt.text}」` : wrongAnswer;

      // Explain why this specific option is wrong
      let whyWrong = '';
      if (attempts === 1) {
        whyWrong = `你选了 ${wrongAnswer}. ${wrongText}，这个选项不太对。让我帮你分析一下为什么：\n\n这道题考察的核心知识点是 —— ${question.explanation.split('。')[0]}。而你选的选项描述的内容和这个知识点不太匹配。`;
      } else if (attempts === 2) {
        whyWrong = `还是不对哦，${wrongText} 也不是正确答案。\n\n让我给你更明确的提示：${question.hint}\n\n试着用排除法，想想哪些选项明显不符合实际情况。`;
      } else {
        whyWrong = `这个也不对。别着急，我再多给你一些线索：\n\n这道题的关键在于 —— ${question.explanation.split('。')[0]}。\n\n💡 ${question.hint}\n\n仔细看看剩下的选项，答案就在里面！你一定可以的！`;
      }

      return `${enc}\n\n${whyWrong}`;
    }

    // Fill-in-the-blank wrong
    if (attempts === 1) {
      return `${enc}\n\n你填的「${wrongAnswer}」不太准确。\n\n这道题考察的是：${question.explanation.split('。')[0]}。\n\n💡 **提示：** ${question.hint}\n\n再想想看，换个角度试试？`;
    } else {
      return `${enc}\n\n还是不太对。让我再给你一些线索：\n\n${question.hint}\n\n关键词方面，想想和「${question.explanation.split('，')[0].split('是')[0]}」相关的术语。你快要找到了！`;
    }
  }

  // Normal chat - give hints but never the answer
  if (lowerMsg.includes('答案') || lowerMsg.includes('告诉我') || lowerMsg.includes('直接说')) {
    return `我不能直接告诉你答案哦～但我可以给你一些思路：\n\n💡 ${question.hint}\n\n自己思考出来的答案才是真正的学会了！加油，你可以的！`;
  }

  if (lowerMsg.includes('不懂') || lowerMsg.includes('看不懂') || lowerMsg.includes('不理解')) {
    return `这道题考察的知识点是：${question.explanation.split('。')[0]}。\n\n💡 **提示：** ${question.hint}\n\n不要着急，一步一步来分析题目，注意关键信息。`;
  }

  if (lowerMsg.includes('提示') || lowerMsg.includes('线索') || lowerMsg.includes('帮助')) {
    return `好的，给你一个提示：\n\n💡 ${question.hint}\n\n试着根据这个提示重新审视一下选项/题目。`;
  }

  // Generic response
  return `关于这道题，我来给你一些思路引导：\n\n💡 ${question.hint}\n\n记住，理解"为什么"比知道答案更重要。你可以问我更具体的问题，但答案还是要靠你自己哦！`;
}

// Mock AI note generation
export function generateReviewNote(courseId: string, curriculum: CurriculumItem[]): string {
  const course = COURSES.find(c => c.id === courseId);
  const completed = curriculum.filter(i => i.completed);
  const inProgress = curriculum.filter(i => i.progress > 0 && !i.completed);
  
  let note = `# 📝 ${course?.name} 学习复盘笔记\n\n`;
  note += `> 生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
  note += `## 📊 整体进度\n\n`;
  note += `- 总章节数：${curriculum.length}\n`;
  note += `- 已完成：${completed.length} 章\n`;
  note += `- 学习中：${inProgress.length} 章\n`;
  note += `- 总体完成度：${Math.round(curriculum.reduce((sum, i) => sum + i.progress, 0) / curriculum.length)}%\n\n`;
  
  if (completed.length > 0) {
    note += `## ✅ 已掌握内容\n\n`;
    completed.forEach(item => {
      note += `### ${item.title}\n`;
      note += `- ${item.description}\n`;
      note += `- 理解程度：${item.understanding === 'advanced' ? '🟢 熟练' : item.understanding === 'intermediate' ? '🟡 中等' : '🟠 基础'}\n\n`;
    });
  }

  if (inProgress.length > 0) {
    note += `## 🔄 正在学习\n\n`;
    inProgress.forEach(item => {
      note += `- **${item.title}** - 进度 ${item.progress}%\n`;
    });
    note += '\n';
  }

  note += `## 💡 学习建议\n\n`;
  note += `1. 对已完成章节定期回顾，加深理解\n`;
  note += `2. 多做练习，将理论转化为实践能力\n`;
  note += `3. 尝试用学到的知识做一个小项目\n`;
  note += `4. 遇到不理解的概念，及时在学习助手中提问\n`;

  return note;
}

// Global agent response
export function generateGlobalAgentResponse(allCurricula: Record<string, Curriculum>, message: string): string {
  const enrolledCourses = Object.keys(allCurricula);
  
  if (enrolledCourses.length === 0) {
    return '你目前还没有报名任何课程哦！去课程列表选择一门感兴趣的课程开始学习吧。';
  }

  let overview = `根据你的学习情况，我来为你做一个全面的分析：\n\n`;
  
  enrolledCourses.forEach(courseId => {
    const course = COURSES.find(c => c.id === courseId);
    const items = allCurricula[courseId].items;
    const completed = items.filter(i => i.completed).length;
    const totalProgress = Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length);
    
    overview += `### ${course?.icon} ${course?.name}\n`;
    overview += `- 进度：${totalProgress}% (${completed}/${items.length} 章完成)\n`;
    
    const weak = items.filter(i => i.progress > 0 && i.understanding === 'beginner');
    if (weak.length > 0) {
      overview += `- ⚠️ 需要加强：${weak.map(w => w.title).join('、')}\n`;
    }
    overview += '\n';
  });

  overview += `**📋 综合建议：**\n`;
  overview += `- 保持学习节奏，每天坚持学习效果最好\n`;
  overview += `- 对薄弱环节重点复习\n`;
  overview += `- 尝试将不同课程的知识结合起来理解\n`;

  return overview;
}

// Storage helpers
const STORAGE_KEYS = {
  profiles: 'lp_profiles',
  curricula: 'lp_curricula',
  notes: 'lp_notes',
  sessions: 'lp_sessions',
};

export function loadData<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

export function saveData(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export { STORAGE_KEYS };