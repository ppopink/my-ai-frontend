export const LEGACY_STORAGE_KEYS = {
  curricula: "lp_curricula",
  notes: "lp_notes",
};

export const LEARNING_APP_STORAGE_KEYS = {
  userId: "lp_user_id",
  username: "lp_username",
  displayName: "lp_display_name",
  activeCourseId: "lp_active_course_id",
  interviewSessions: "lp_interview_sessions_v2",
  interviewMessages: "lp_interview_messages_v2",
  interviewResults: "lp_interview_results_v2",
  coursePlans: "lp_course_plans_v2",
  currentPositions: "lp_current_positions_v2",
  tutorMessages: "lp_tutor_messages_v2",
  progressSnapshots: "lp_progress_snapshots_v2",
  profileBackground: "lp_profile_background",
  dailyGoalMinutes: "lp_daily_goal_minutes",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}

export function readStringStorage(key: string, fallback = "") {
  const value = localStorage.getItem(key);
  return value ?? fallback;
}

export function readNumberStorage(key: string, fallback: number) {
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
