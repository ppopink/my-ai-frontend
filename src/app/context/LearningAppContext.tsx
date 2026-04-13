import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { learningApi } from "../lib/api";
import {
  LEGACY_STORAGE_KEYS,
  LEARNING_APP_STORAGE_KEYS,
  readNumberStorage,
  readStorage,
  removeStorage,
  writeStorage,
} from "../lib/storage";
import { AppTheme, applyTheme, getStoredTheme } from "../lib/theme";
import type { AppChatMessage, CoursePlan, InterviewResult, ProgressRecord } from "../types/learning";

type CoursePosition = {
  chapterId?: string | null;
  chapterTitle?: string | null;
  sectionId?: string | null;
  sectionTitle?: string | null;
};

type TutorSessionMap = Record<string, AppChatMessage[]>;

interface LearningAppContextValue {
  userId: string;
  username: string;
  displayName: string;
  theme: AppTheme;
  activeCourseId: string | null;
  interviewSessionIds: Record<string, string>;
  interviewMessages: Record<string, AppChatMessage[]>;
  interviewResults: Record<string, InterviewResult>;
  coursePlans: Record<string, CoursePlan>;
  currentPositions: Record<string, CoursePosition>;
  tutorMessages: TutorSessionMap;
  progressSnapshots: Record<string, ProgressRecord>;
  setTheme: (theme: AppTheme) => void;
  setDisplayName: (name: string) => void;
  setActiveCourseId: (courseId: string | null) => void;
  saveInterviewSession: (courseId: string, sessionId: string) => void;
  saveInterviewMessages: (courseId: string, messages: AppChatMessage[]) => void;
  saveInterviewResult: (courseId: string, result: InterviewResult) => void;
  saveCoursePlan: (courseId: string, plan: CoursePlan) => void;
  saveCurrentPosition: (courseId: string, position: CoursePosition) => void;
  saveTutorMessages: (courseId: string, sectionId: string | null | undefined, messages: AppChatMessage[]) => void;
  getTutorMessages: (courseId: string, sectionId: string | null | undefined) => AppChatMessage[];
  saveProgressSnapshot: (courseId: string, snapshot: ProgressRecord) => void;
  resetLearningState: () => void;
}

const LearningAppContext = createContext<LearningAppContextValue | undefined>(undefined);

function createStableUserId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `learner_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
  }
  return `learner_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getTutorSessionKey(courseId: string, sectionId?: string | null) {
  return `${courseId}::${sectionId || "global"}`;
}

function buildLegacyCurricula(
  coursePlans: Record<string, CoursePlan>,
  progressSnapshots: Record<string, ProgressRecord>,
) {
  const next: Record<string, unknown> = {};

  for (const [courseId, plan] of Object.entries(coursePlans)) {
    const progress = progressSnapshots[courseId]?.progress;
    const completedSections = new Set(progress?.completed_section_ids || []);
    const currentSectionId = progress?.current_section_id || null;

    next[courseId] = {
      courseId,
      items: plan.chapters.flatMap((chapter) =>
        chapter.sections.map((section) => {
          const completed = completedSections.has(section.id);
          return {
            id: section.id,
            title: section.title,
            description: section.objective,
            completed,
            progress: completed ? 100 : currentSectionId === section.id ? 50 : 0,
            understanding: completed ? "advanced" : currentSectionId === section.id ? "beginner" : "none",
          };
        }),
      ),
      chapters: plan.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        sections: chapter.sections.map((section) => {
          const completed = completedSections.has(section.id);
          return {
            id: section.id,
            title: section.title,
            description: section.objective,
            completed,
            progress: completed ? 100 : currentSectionId === section.id ? 50 : 0,
            understanding: completed ? "advanced" : currentSectionId === section.id ? "beginner" : "none",
          };
        }),
      })),
    };
  }

  return next;
}

function readInitialUserId() {
  const stored = localStorage.getItem(LEARNING_APP_STORAGE_KEYS.userId);
  if (stored) {
    return stored;
  }

  const created = createStableUserId();
  localStorage.setItem(LEARNING_APP_STORAGE_KEYS.userId, created);
  localStorage.setItem(LEARNING_APP_STORAGE_KEYS.username, created);
  return created;
}

export function LearningAppProvider({ children }: { children: ReactNode }) {
  const [userId] = useState(readInitialUserId);
  const [displayName, setDisplayNameState] = useState(() => {
    const migrated = localStorage.getItem(LEARNING_APP_STORAGE_KEYS.displayName) || localStorage.getItem("lp_username");
    if (migrated && !localStorage.getItem(LEARNING_APP_STORAGE_KEYS.displayName)) {
      localStorage.setItem(LEARNING_APP_STORAGE_KEYS.displayName, migrated);
    }
    return migrated || "学习探索者";
  });
  const [theme, setThemeState] = useState<AppTheme>(() => getStoredTheme());
  const [activeCourseId, setActiveCourseIdState] = useState<string | null>(
    () => localStorage.getItem(LEARNING_APP_STORAGE_KEYS.activeCourseId) || null,
  );
  const [interviewSessionIds, setInterviewSessionIds] = useState<Record<string, string>>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.interviewSessions, {}),
  );
  const [interviewMessages, setInterviewMessages] = useState<Record<string, AppChatMessage[]>>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.interviewMessages, {}),
  );
  const [interviewResults, setInterviewResults] = useState<Record<string, InterviewResult>>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.interviewResults, {}),
  );
  const [coursePlans, setCoursePlans] = useState<Record<string, CoursePlan>>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.coursePlans, {}),
  );
  const [currentPositions, setCurrentPositions] = useState<Record<string, CoursePosition>>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.currentPositions, {}),
  );
  const [tutorMessages, setTutorMessagesState] = useState<TutorSessionMap>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.tutorMessages, {}),
  );
  const [progressSnapshots, setProgressSnapshots] = useState<Record<string, ProgressRecord>>(() =>
    readStorage(LEARNING_APP_STORAGE_KEYS.progressSnapshots, {}),
  );

  useEffect(() => {
    localStorage.setItem(LEARNING_APP_STORAGE_KEYS.username, userId);
  }, [userId]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.interviewSessions, interviewSessionIds);
  }, [interviewSessionIds]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.interviewMessages, interviewMessages);
  }, [interviewMessages]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.interviewResults, interviewResults);
  }, [interviewResults]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.coursePlans, coursePlans);
  }, [coursePlans]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.currentPositions, currentPositions);
  }, [currentPositions]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.tutorMessages, tutorMessages);
  }, [tutorMessages]);

  useEffect(() => {
    writeStorage(LEARNING_APP_STORAGE_KEYS.progressSnapshots, progressSnapshots);
    writeStorage(LEGACY_STORAGE_KEYS.curricula, buildLegacyCurricula(coursePlans, progressSnapshots));
  }, [coursePlans, progressSnapshots]);

  useEffect(() => {
    if (activeCourseId) {
      localStorage.setItem(LEARNING_APP_STORAGE_KEYS.activeCourseId, activeCourseId);
    } else {
      localStorage.removeItem(LEARNING_APP_STORAGE_KEYS.activeCourseId);
    }
  }, [activeCourseId]);

  useEffect(() => {
    void learningApi
      .upsertUserProfile({
        username: userId,
        background:
          localStorage.getItem(LEARNING_APP_STORAGE_KEYS.profileBackground) ||
          "我正在使用智能学习平台进行自主学习。",
        daily_goal_minutes: readNumberStorage(LEARNING_APP_STORAGE_KEYS.dailyGoalMinutes, 30),
      })
      .catch((error) => {
        console.error("Failed to sync backend user profile", error);
      });
  }, [userId]);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
    localStorage.setItem(LEARNING_APP_STORAGE_KEYS.displayName, name);
  }, []);

  const setActiveCourseId = useCallback((courseId: string | null) => {
    setActiveCourseIdState(courseId);
  }, []);

  const saveInterviewSession = useCallback((courseId: string, sessionId: string) => {
    setInterviewSessionIds((prev) => ({ ...prev, [courseId]: sessionId }));
  }, []);

  const saveInterviewMessages = useCallback((courseId: string, messages: AppChatMessage[]) => {
    setInterviewMessages((prev) => ({ ...prev, [courseId]: messages }));
  }, []);

  const saveInterviewResult = useCallback((courseId: string, result: InterviewResult) => {
    setInterviewResults((prev) => ({ ...prev, [courseId]: result }));
  }, []);

  const saveCoursePlan = useCallback((courseId: string, plan: CoursePlan) => {
    setCoursePlans((prev) => ({ ...prev, [courseId]: plan }));
  }, []);

  const saveCurrentPosition = useCallback((courseId: string, position: CoursePosition) => {
    setCurrentPositions((prev) => ({ ...prev, [courseId]: { ...prev[courseId], ...position } }));
  }, []);

  const saveTutorMessages = useCallback(
    (courseId: string, sectionId: string | null | undefined, messages: AppChatMessage[]) => {
      setTutorMessagesState((prev) => ({ ...prev, [getTutorSessionKey(courseId, sectionId)]: messages }));
    },
    [],
  );

  const getTutorMessages = useCallback(
    (courseId: string, sectionId: string | null | undefined) =>
      tutorMessages[getTutorSessionKey(courseId, sectionId)] || [],
    [tutorMessages],
  );

  const saveProgressSnapshot = useCallback((courseId: string, snapshot: ProgressRecord) => {
    setProgressSnapshots((prev) => ({ ...prev, [courseId]: snapshot }));
  }, []);

  const resetLearningState = useCallback(() => {
    [
      ...Object.values(LEARNING_APP_STORAGE_KEYS),
      ...Object.values(LEGACY_STORAGE_KEYS),
      "lp_dark_mode",
      "lp_ai_style",
      "lp_difficulty",
      "lp_pace",
      "lp_feedbacks",
      "lp_reminder_enabled",
      "lp_reminder_time",
      "lp_reminder_days",
    ].forEach((key) => removeStorage(key));

    localStorage.removeItem(LEARNING_APP_STORAGE_KEYS.userId);
    localStorage.removeItem(LEARNING_APP_STORAGE_KEYS.username);
    window.location.href = "/";
  }, []);

  const value = useMemo<LearningAppContextValue>(
    () => ({
      userId,
      username: userId,
      displayName,
      theme,
      activeCourseId,
      interviewSessionIds,
      interviewMessages,
      interviewResults,
      coursePlans,
      currentPositions,
      tutorMessages,
      progressSnapshots,
      setTheme,
      setDisplayName,
      setActiveCourseId,
      saveInterviewSession,
      saveInterviewMessages,
      saveInterviewResult,
      saveCoursePlan,
      saveCurrentPosition,
      saveTutorMessages,
      getTutorMessages,
      saveProgressSnapshot,
      resetLearningState,
    }),
    [
      activeCourseId,
      coursePlans,
      currentPositions,
      displayName,
      getTutorMessages,
      interviewMessages,
      interviewResults,
      interviewSessionIds,
      progressSnapshots,
      resetLearningState,
      saveCoursePlan,
      saveCurrentPosition,
      saveInterviewMessages,
      saveInterviewResult,
      saveInterviewSession,
      saveProgressSnapshot,
      saveTutorMessages,
      setActiveCourseId,
      setDisplayName,
      setTheme,
      theme,
      tutorMessages,
      userId,
    ],
  );

  return <LearningAppContext.Provider value={value}>{children}</LearningAppContext.Provider>;
}

export function useLearningApp() {
  const context = useContext(LearningAppContext);
  if (!context) {
    throw new Error("useLearningApp must be used within LearningAppProvider");
  }
  return context;
}
