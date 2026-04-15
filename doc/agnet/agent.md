# 前端 Agent 对接分析

## 文档目的

这份文档面向前端开发视角，梳理当前项目里可以明确识别出的 6 个 Agent 能力，方便你后续拿去和后端 Agent 设计做逐项比照、接口核对和联调拆分。

我这里对“6 个 Agent”的划分，主要依据前端已经定义好的类型与接口能力：

- `src/app/types/learning.ts`
- `src/app/lib/api.ts`

从这两处可以推断出当前前端认知的 6 类 Agent 分别是：

1. `Interview Agent` 访谈官
2. `Architect Agent` 课程架构师
3. `Tutor Agent` 学习导师
4. `Profiler Agent` 学情分析师
5. `Clerk Agent` 笔记整理官
6. `Concierge Agent` 全局导学助手

## 一句话总览

当前前端已经完成了一个“从访谈到学习再到笔记”的基本闭环，但实现上存在两条链路并存：

- 新链路：按 Agent 职责拆分接口，封装在 `learningApi` 中
- 旧链路：直接 `fetch` 到通用接口，如 `/api/agent/chat/stream`、`/api/notes/generate`

这意味着：

- 前端已经具备多 Agent 架构的雏形
- 但还没有完全统一成“一个 Agent 一个明确接口协议”的前后端协作模式

---

## 六个 Agent 总表

| Agent | 前端职责定位 | 当前前端入口 | 后端接口 | 当前状态 |
| --- | --- | --- | --- | --- |
| Interview Agent | 采集学习目标、基础、课程背景 | `InterviewModal.tsx`、`InterviewPage.tsx` | `/api/interview/start`、`/api/interview/reply` | 已接入，新旧两套并存 |
| Architect Agent | 根据访谈结果生成课程蓝图 | `InterviewModal.tsx` | `/api/architect/generate-course-plan` | 已接入 |
| Tutor Agent | 在练习过程中进行启发式辅导 | `LearnPage.tsx` | `/api/tutor/respond`、`/api/study/tutor-chat/stream` | 已接入，但页面仍走旧式 fetch |
| Profiler Agent | 分析一次学习互动并沉淀 learner profile | 仅 API/类型已定义 | `/api/profiler/analyze-interaction` | 前端未落地 |
| Clerk Agent | 生成复盘笔记、整理学习内容 | `NotesPage.tsx` | `/api/clerk/generate-note`、`/api/notes/save` | 部分接入，页面还在走旧接口 |
| Concierge Agent | 全局问答、导航、前端动作编排 | `GlobalAgent.tsx` | `/api/concierge/respond` | 类型已定义，UI 仍走旧通用聊天接口 |

---

## 1. Interview Agent 访谈官

### 前端定位

Interview Agent 是用户进入课程前的第一层交互代理，负责把模糊学习需求转成结构化访谈结果。

### 前端入口

- 新版入口：`/Users/lisijia/Desktop/Personalizedlearningassistant-main/src/app/components/InterviewModal.tsx`
- 旧版入口：`/Users/lisijia/Desktop/Personalizedlearningassistant-main/src/app/components/InterviewPage.tsx`

### 当前对接方式

新版实现已经比较清晰：

- 打开弹窗后调用 `learningApi.startInterview(...)`
- 每次用户回复后调用 `learningApi.replyInterview(sessionId, userMessage.content)`
- 当 `finished === true` 时，拿 `interview_result` 交给 Architect Agent

关键代码：

- `InterviewModal.tsx:51-76`
- `InterviewModal.tsx:112-147`
- `types/learning.ts:53-82`
- `lib/api.ts:86-98`

### 输入输出协议

前端输入字段：

- `user_id`
- `course_id`
- `course_type`
- `course_title`
- `course_summary`
- `key_topics`
- `rag_summary`

前端关心的输出字段：

- `session_id`
- `agent_reply`
- `finished`
- `current_slots`
- `interview_result`

### 前端状态管理

使用 `LearningAppContext` 保存：

- `interviewSessionIds`
- `interviewMessages`
- `interviewResults`

见：

- `LearningAppContext.tsx:31-44`
- `LearningAppContext.tsx:144-152`
- `LearningAppContext.tsx:218-236`

### 与后端联调时的重点

1. `session_id` 是否稳定，前端依赖它持续追问。
2. `finished` 是否只在真正结束时返回 `true`。
3. `interview_result` 是否是结构化对象，而不是自然语言大段文本。
4. `current_slots` 是否可用于前端展示“已采集信息摘要”。

### 当前问题

- `InterviewPage.tsx` 仍在走旧通用接口 `/api/agent/chat/stream`，说明旧版访谈页没有彻底迁移到专用 Agent 协议。
- 新旧两套访谈实现并存，后续容易出现联调口径不一致。

---

## 2. Architect Agent 课程架构师

### 前端定位

Architect Agent 负责把访谈结果转成真正可学习的课程蓝图，也就是课程章节、目标、练习题结构。

### 前端入口

- `InterviewModal.tsx:131-147`

### 当前对接方式

访谈完成后，前端直接调用：

- `POST /api/architect/generate-course-plan`

见：

- `lib/api.ts:100-108`
- `types/learning.ts:84-94`

### 输出结果

前端期待后端返回一个 `CoursePlan`：

- `title`
- `description`
- `course_objectives`
- `recommended_start_point`
- `learner_profile`
- `interview_session_id`
- `metadata`
- `chapters[]`

其中每个章节继续展开为：

- chapter
- section
- practice_questions

### 前端使用方式

Architect 的返回结果会被直接存到本地课程状态中：

- `saveCoursePlan(course.id, planResult.data)`

后续课程页、学习页、进度页都依赖这个结构。

### 与后端联调时的重点

1. `chapters[].sections[]` 的 `id` 必须稳定，前端会把它当成导航和进度主键。
2. `practice_questions` 的题型、答案、解析字段必须完整，否则 LearnPage 无法工作。
3. 如果后端支持自定义课程与标准课程混合生成，`course_type` 的语义要提前约定清楚。

### 当前问题

- 新链路里 Architect 已经是独立 Agent，但旧链路 `InterviewPage.tsx` 仍然使用 `/api/onboarding/generate-syllabus` 与 `/api/onboarding/generate-custom-syllabus`，这说明“课程生成”在历史实现里仍有另一套后端契约。

---

## 3. Tutor Agent 学习导师

### 前端定位

Tutor Agent 是学习过程中的实时陪练，核心任务不是直接给答案，而是围绕题目、答错原因和用户追问做启发式反馈。

### 前端入口

- `LearnPage.tsx`

关键代码：

- 自动触发提示：`LearnPage.tsx:130-147`
- 流式请求：`LearnPage.tsx:170-231`
- 学习页右侧导师面板：`LearnPage.tsx` 下半部分 UI

### 当前对接方式

类型和 SDK 已经定义为：

- `POST /api/tutor/respond`
- `POST /api/study/tutor-chat/stream`

见：

- `types/learning.ts:96-114`
- `lib/api.ts:111-177`

但页面真实使用时，仍然是手写 `fetch` 到：

- `/api/study/tutor-chat/stream`

而且请求体还是旧字段风格：

- `username`
- `current_question`
- `persona`
- `messages`

见：

- `LearnPage.tsx:188-197`

这和新定义的 `TutorRequest` 并不一致。新定义期望的是：

- `user_id`
- `course_id`
- `chapter_id`
- `chapter_title`
- `section_id`
- `section_title`
- `difficulty_preference`
- `tutor_style`
- `question_context`
- `user_action`
- `messages`

### 前端价值

Tutor Agent 当前已经承担两类前端场景：

1. 用户答错后自动介入
2. 用户主动在导师面板提问

这意味着它是前端最强交互 Agent，也是最容易暴露接口不一致问题的 Agent。

### 与后端联调时的重点

1. SSE 是否严格使用 `data: xxx\n\n` 输出。
2. 返回内容是否允许部分 token 流式更新。
3. `TutorRequest` 与实际线上请求体到底采用哪一版字段。
4. 导师风格 `tutor_style` 是否和前端偏好设置一一对应。

### 当前问题

- `learningApi.streamTutorChat(...)` 已实现，但 `LearnPage.tsx` 没有使用它。
- 现在的学习页仍是“类型已升级、页面未升级”的状态。

---

## 4. Profiler Agent 学情分析师

### 前端定位

Profiler Agent 负责把一轮真实互动沉淀成学习分析数据，例如：

- 用户在哪类题型上反复卡住
- 哪种导师风格更有效
- 哪些知识点需要回补

### 当前前端现状

前端已经定义了完整请求类型与 API 方法：

- `types/learning.ts:116-131`
- `lib/api.ts:180-185`

接口为：

- `POST /api/profiler/analyze-interaction`

### 目前缺口

我在当前前端代码里没有找到实际调用点，也就是说：

- Profiler Agent 目前停留在“协议层准备好了”
- 还没有真正进入页面业务流

### 推荐接入位置

最适合挂 Profiler 的地方有两个：

1. `LearnPage.tsx`
   在 Tutor 返回后，把本轮题目、用户动作、导师回复、用户反馈发给 Profiler。
2. `InterviewModal.tsx`
   访谈结束后，把访谈结果做一次学习画像归档。

### 与后端联调时的重点

1. 输出结果是否会反哺 `learner_profile`。
2. 分析结果是即时写库，还是仅返回给前端做缓存。
3. 前端是否需要拿 Profiler 结果驱动 Tutor 风格和课程难度。

### 对前端的意义

如果后端的 6 Agent 设计里 Profiler 是核心 Agent，那么前端后续不应该只做聊天和展示，还要加入：

- 学习反馈采集
- 行为埋点
- 分析结果可视化

---

## 5. Clerk Agent 笔记整理官

### 前端定位

Clerk Agent 负责把学习过程转换成结构化复盘笔记，帮助用户沉淀课程总结、知识点、错题思路和导图内容。

### 前端入口

- `NotesPage.tsx`

关键代码：

- AI 复盘笔记：`NotesPage.tsx:150-200`
- 思维导图提炼：`NotesPage.tsx:202-244`
- Markdown + Mermaid 渲染：`NotesPage.tsx:14-91`

### 当前对接方式

类型和 API 封装已经定义为：

- `POST /api/clerk/generate-note`
- `POST /api/notes/save`

见：

- `types/learning.ts:133-168`
- `lib/api.ts:187-202`

但页面当前实际调用的还是旧接口：

- `/api/notes/generate`
- `/api/notes/extract-mindmap`

### 当前问题

`NotesPage.tsx` 的笔记生成逻辑存在明显不一致：

1. 页面里先计算了 `learnedTopics`、`weakPoints`，但请求时并没有真正发给后端。
2. 请求体里 `course_id` 实际上传的是 `openNoteId`，不是课程 id。
3. 页面没有使用已经定义好的 `GenerateNoteRequest`。

也就是说，Clerk Agent 在前端是“界面已完成，协议未收口”的状态。

### 与后端联调时的重点

1. 笔记生成到底是按课程、章节还是小节粒度生成。
2. `focus_questions`、`user_takeaways`、`additional_context` 是否必须。
3. 是否由 Clerk Agent 一次性返回 Markdown + Mermaid，还是只返回正文，导图由单独能力生成。

### 建议

如果后端已经是 Agent 化设计，建议把 NotesPage 彻底改成：

- 先收集学习上下文
- 调 `learningApi.generateNote(payload)`
- 结果返回后再调 `saveNote`

这样 Clerk Agent 才真正成为一个完整、稳定的前端能力节点。

---

## 6. Concierge Agent 全局导学助手

### 前端定位

Concierge Agent 更像“全局编排 Agent”，它不只是聊天，而是应该能：

- 回答全局问题
- 推荐下一步操作
- 驱动路由跳转
- 触发前端动作，例如切换主题、打开某课程、跳到笔记页

### 前端入口

- `GlobalAgent.tsx`

### 现状

`types/learning.ts` 与 `lib/api.ts` 已经定义了比较成熟的 Concierge 协议：

- `ConciergeRequest`
- `ConciergeResponseData`
- `/api/concierge/respond`

见：

- `types/learning.ts:206-225`
- `lib/api.ts:224-229`

其中返回值已经支持：

- `reply`
- `route`
- `frontend_action`
- `snapshot`

这说明后端设计里，Concierge 很可能不是普通聊天机器人，而是“能驱动前端动作的 Agent”。

### 但是当前页面还没有真正用上

`GlobalAgent.tsx` 仍在请求：

- `/api/agent/chat/stream`

并传入旧字段：

- `username`
- `current_question`
- `persona`
- `messages`

见：

- `GlobalAgent.tsx:147-201`

### 对前端的意义

如果后端真的要做多 Agent 编排，Concierge 会是前端最关键的总入口，因为它天然适合承接：

- 全局悬浮助手
- 页面跳转
- 课程推荐
- 跨课程学习建议
- “告诉我下一步该做什么”

### 与后端联调时的重点

1. `frontend_action.type` 的枚举要前后端统一。
2. `route` 是否总是可信，是否需要前端白名单校验。
3. `allow_frontend_actions` 和 `available_frontend_actions` 如何配置，避免越权动作。

---

## 新旧架构对比

### 旧架构特征

旧实现更像“一个通用聊天大模型 + 若干业务接口”：

- `/api/agent/chat/stream`
- `/api/notes/generate`
- `/api/onboarding/generate-syllabus`

优点：

- 上线快
- 页面容易先跑起来

问题：

- Agent 角色边界不清
- 前后端联调时协议容易漂移
- 页面里会混入很多后端语义判断

### 新架构特征

新实现更像“按 Agent 职责切分的接口层”：

- Interview
- Architect
- Tutor
- Profiler
- Clerk
- Concierge

优点：

- 职责清晰
- 更利于前后端并行开发
- 更方便后续做 agent 编排、观测和调试

问题：

- 当前前端还没完全迁移
- 一部分页面仍然直连旧接口

---

## 当前前端成熟度评估

### 已较完整

- Interview Agent
- Architect Agent
- Tutor Agent 的 UI 交互链路

### 已有协议但未彻底落地

- Clerk Agent
- Concierge Agent

### 仅完成类型设计

- Profiler Agent

---

## 推荐的前后端对接顺序

如果你要拿这份文档和后端做详细比照，我建议按下面顺序推进：

1. 先统一 6 个 Agent 的正式命名和职责边界。
2. 再统一每个 Agent 的请求体与响应体字段。
3. 再清理前端旧接口，避免同一角色两套协议并存。
4. 最后补上 Profiler 与 Concierge 的真实业务闭环。

原因很简单：

- Interview、Architect、Tutor 是主链路
- Clerk 是沉淀链路
- Concierge 是全局编排入口
- Profiler 是智能优化层

这个顺序最适合前后端分阶段联调。

---

## 建议你和后端核对的清单

### Agent 级别

- 后端定义的 6 个 Agent 是否就是这 6 类
- 是否还有上层 orchestrator 或 router agent
- 每个 Agent 是独立 prompt 还是统一入口路由

### 接口级别

- 每个 Agent 的唯一接口路径
- 是否支持 SSE
- 是否支持 session
- 错误码和兜底格式是否统一

### 数据级别

- 用户主键是 `user_id` 还是 `username`
- 课程主键是 `course_id` 还是动态生成 id
- 章节、节、题目 id 是否稳定可复用

### 前端动作级别

- Concierge 能否直接控制路由
- Tutor/Profiler 是否会反向影响 UI 配置
- Clerk 是否要分正文生成与导图生成两步

---

## 结论

从前端代码现状看，这个项目已经非常接近“多 Agent 学习系统”的结构，但现在仍处于“新协议已设计、旧实现未完全退出”的过渡期。

如果你要把它和后端 Agent 开发做详细对照，可以把当前前端理解总结成一句话：

> 前端已经识别并预留了 6 个 Agent 的职责边界，但真正完整落地的主要是 Interview、Architect、Tutor，Clerk 与 Concierge 还在迁移中，Profiler 还停留在协议准备阶段。

如果你愿意，我下一步可以继续帮你补一份“后端对接比照模板”，直接按 `Agent / 接口 / 请求字段 / 响应字段 / 前端页面 / 联调状态 / 待办项` 的表格格式整理出来，方便你和后端逐条打勾。
