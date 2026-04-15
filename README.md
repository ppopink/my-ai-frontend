# 🧠 AI-Driven Personalized Learning Assistant
> 你的专属“全能 AI 私人学霸顾问” —— 从学习规划、互动教学到复盘沉淀的全链路学习平台。

## ✨ 核心特性 (Features)

1. **🧭 智能学习大纲生成 (AI Syllabus Generation)**
   - 通过类似面试的对话互动收集学习需求（目标、基础、时间安排）。
   - 调用千问大模型 (Qwen-plus) 动态生成高度定制化的学习路线图。
   
2. **💬 启发式互动教学引擎 (Socratic AI Tutor)**
   - 告别填鸭式答案，AI 导师会伴随你的答题过程给出引导性、启发式的流式反馈 (Streaming Response)。
   - **个性化导师风格**：支持根据用户偏好切换“鼓励引导型”、“严厉鞭策型”或“客观分析型”等不同风格。

3. **📝 AI 一键智能复盘 (AI-Powered Study Notes)**
   - 自动总结学习轨迹、掌握情况和薄弱环节，生成专业的 Markdown 笔记。
   - **生产级代码排版**：支持多行代码高亮 (VS Code 风格深色皮肤)、语言标签展示与行内代码区分。
   - **一键思维导图 (Mindmap Extraction)**：集成强大的 Mermaid 渲染引擎，自带“防弹级”语法清洗与自动引号保护，一键将枯燥笔记提炼为直观的紫色系结构化思维导图，并支持智能原地更新覆盖。

4. **✨ 沉浸式高级交互体验 (Immersive UI/UX)**
   - 全局采用了 Tailwind CSS 和 Framer Motion，实现了极其丝滑的组件切换与悬浮动画。
   - **视觉优先的笔记编辑器**：默认开启高保真预览模式，全天候 AI 伴随能力，高颜值工具栏状态切换。

## 🛠️ 技术栈 (Tech Stack)

### 前端 (Frontend)
- **核心框架**：React 18 + TypeScript + Vite
- **状态与路由**：React Router + 自定义状态层 (`localStorage` 数据持久化)
- **UI & 动画**：Tailwind CSS + `lucide-react` (图标) + `motion/react` (高级动效)
- **富文本与可视化**：`react-markdown` + `mermaid.js` (11.x)

### 后端 (Backend)
- **核心框架**：Python 3 + FastAPI + Uvicorn
- **大模型接入**：OpenAI Python SDK (兼容调用阿里通义千问 `qwen-plus` 接口)
- **通信协议**：支持标准的 Server-Sent Events (SSE) 实时流式传输

## 🚀 快速启动 (Getting Started)

### 1. 启动后端服务
```bash
cd Personalizedlearningassistant-backend
# 安装所需的 Python 依赖
pip install -r requirements.txt
# 配置你的千问大模型 API 密钥 (在目录中创建 .env 文件)
echo "QWEN_API_KEY=your_api_key_here" > .env
# 启动 API 服务 (默认运行在 https://personalizedlearningassistant-backend.onrender.com)
python main.py
```

### 2. 启动前端项目
```bash
cd Personalizedlearningassistant
# 安装所有的前端依赖模块
npm install
# 启动本地开发服务器
npm run dev
```

## 📐 核心架构展示

- **`main.py`**：处理所有与大模型通讯的核心 API 路由 (`/api/onboarding/generate-syllabus`, `/api/study/tutor-chat/stream`, `/api/notes/extract-mindmap` 等)。
- **`NotesPage.tsx`**：集成了强大自动清洗与 Mermaid 渲染引擎的 Markdown 高保真编辑器。
- **`LearnPage.tsx`**：负责课程测验、选项交互与实时 AI 导师流式对话的练习终端。
- **`InterviewPage.tsx` / `CurriculumPage.tsx`**：处理用户定制化访谈与动态大纲呈现的引导页。
- **`GlobalAgent.tsx`**：悬浮在应用侧边的全局 AI 引导助手。

## 🤝 结语
本项目不只是一个静态网站，它是一个集成了现代 LLM 能力、拥有极高视觉保真度且核心链路完整的“全栈 AI 产品”。它的设计理念是：让每一次交互都充满温度，让每一份知识都能被具象化。