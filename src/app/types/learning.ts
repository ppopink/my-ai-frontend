export type ChatRole = "user" | "assistant" | "system";

export interface AppChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string;
}

export interface QuizOption {
  label: string;
  text: string;
}

export interface PracticeQuestion {
  id: string;
  type: "choice" | "fill" | string;
  question: string;
  options?: QuizOption[];
  answer?: string;
  explanation?: string;
  hint?: string;
}

export interface CourseSection {
  id: string;
  title: string;
  objective: string;
  key_points: string[];
  practice_questions: PracticeQuestion[];
}

export interface CourseChapter {
  id: string;
  title: string;
  description: string;
  learning_goals: string[];
  sections: CourseSection[];
}

export interface CoursePlan {
  title: string;
  description: string;
  course_objectives: string[];
  recommended_start_point?: string;
  learner_profile?: Record<string, unknown>;
  interview_session_id?: string | null;
  metadata?: Record<string, unknown>;
  chapters: CourseChapter[];
}

export type InterviewResult = Record<string, unknown>;

export interface InterviewStartRequest {
  user_id: string;
  course_id: string;
  course_type: "standard" | "custom";
  course_title: string;
  course_summary?: string | null;
  key_topics: string[];
  rag_summary?: null | {
    document_topic?: string | null;
    document_keywords?: string[];
    document_abstract?: string | null;
  };
}

export interface InterviewStartResponse {
  status: string;
  session_id: string;
  agent_reply: string;
  finished: boolean;
  current_slots?: Record<string, string>;
}

export interface InterviewReplyResponse {
  status: string;
  session_id: string;
  agent_reply: string;
  finished: boolean;
  current_slots?: Record<string, string>;
  interview_result?: InterviewResult | null;
}

export interface ArchitectGenerateRequest extends InterviewStartRequest {
  interview_session_id?: string;
  interview_result?: InterviewResult | null;
}

export interface ArchitectGenerateResponse {
  status: string;
  message?: string;
  data: CoursePlan;
  source?: Record<string, unknown>;
}

export interface TutorRequest {
  user_id: string;
  course_id: string;
  chapter_id?: string | null;
  chapter_title?: string | null;
  section_id?: string | null;
  section_title?: string | null;
  difficulty_preference?: string | null;
  tutor_style: string;
  question_context: string;
  user_action: string;
  messages: Array<Pick<AppChatMessage, "role" | "content">>;
}

export interface TutorResponse {
  status: string;
  reply: string;
  context?: Record<string, unknown>;
}

export interface ProfilerAnalyzeRequest {
  user_id: string;
  course_id?: string | null;
  chapter_id?: string | null;
  chapter_title?: string | null;
  section_id?: string | null;
  section_title?: string | null;
  interaction_type: string;
  tutor_style?: string | null;
  question_context: string;
  user_action: string;
  user_message: string;
  tutor_reply: string;
  user_feedback: string;
  messages: Array<Pick<AppChatMessage, "role" | "content">>;
}

export interface GenerateNoteRequest {
  user_id: string;
  course_id: string;
  chapter_id?: string | null;
  chapter_title?: string | null;
  section_id?: string | null;
  section_title?: string | null;
  note_title?: string | null;
  focus_questions: string[];
  messages: Array<Pick<AppChatMessage, "role" | "content">>;
  user_takeaways: string;
  additional_context: string;
  auto_save: boolean;
  include_mindmap: boolean;
}

export interface GeneratedNote {
  title: string;
  content: string;
  saved_note_id?: number | null;
}

export interface NoteListItem {
  id: number | string;
  course_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface SaveNoteRequest {
  user_id: string;
  course_id: string;
  title: string;
  content: string;
}

export interface ProgressUpdateRequest {
  user_id: string;
  course_id: string;
  current_chapter_id?: string | null;
  current_chapter_title?: string | null;
  current_section_id?: string | null;
  current_section_title?: string | null;
  completed_chapter_ids: string[];
  completed_section_ids: string[];
  event_type: string;
  progress_meta: Record<string, unknown>;
}

export interface ProgressMetrics {
  course_title?: string;
  chapter_total: number;
  section_total: number;
  completed_chapter_count: number;
  completed_section_count: number;
  section_progress_percent: number;
  chapter_progress_percent: number;
  completed_chapter_ids: string[];
  completed_section_ids: string[];
  current_chapter_id?: string | null;
  current_chapter_title?: string | null;
  current_section_id?: string | null;
  current_section_title?: string | null;
  last_activity_at?: string | null;
}

export interface ProgressRecord {
  course_id: string;
  progress: ProgressMetrics;
  snapshot?: Record<string, unknown>;
}

export interface ConciergeAction {
  type: "navigate" | "set_theme" | "none" | string;
  payload?: Record<string, unknown>;
}

export interface ConciergeRequest {
  user_id: string;
  message: string;
  current_page?: string | null;
  course_id?: string | null;
  allow_frontend_actions: boolean;
  available_frontend_actions: string[];
  context: Record<string, unknown>;
}

export interface ConciergeResponseData {
  reply: string;
  route?: string;
  frontend_action?: ConciergeAction;
  snapshot?: Record<string, unknown>;
}
