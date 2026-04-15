import {
  COURSES,
  STORAGE_KEYS,
  loadData,
  saveData,
  type Curriculum,
  type CurriculumChapter,
  type CurriculumItem,
  type CurriculumSection,
} from "../store";

const COURSE_REGISTRY_KEY = "lp_course_registry_v1";
const COURSE_ALIAS_KEY = "lp_course_aliases_v1";

interface CourseRegistryRecord {
  actualCourseId: string;
  catalogCourseId?: string | null;
  title: string;
  icon?: string;
  color?: string;
  isCustom: boolean;
}

type CourseRegistry = Record<string, CourseRegistryRecord>;
type CourseAliases = Record<string, string>;

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getExistingSectionState(existing: Curriculum | undefined, sectionId: string) {
  if (!existing) {
    return null;
  }

  const existingSection =
    existing.chapters?.flatMap((chapter) => chapter.sections).find((section) => section.id === sectionId) ||
    existing.items?.find((item) => item.id === sectionId);

  if (!existingSection) {
    return null;
  }

  return {
    progress: existingSection.progress,
    completed: existingSection.completed,
    understanding: existingSection.understanding,
  };
}

export function resolveCourseId(courseId?: string | null) {
  if (!courseId) {
    return null;
  }

  const aliases = readLocalJson<CourseAliases>(COURSE_ALIAS_KEY, {});
  return aliases[courseId] || courseId;
}

export function registerCourseRecord(record: CourseRegistryRecord) {
  const registry = readLocalJson<CourseRegistry>(COURSE_REGISTRY_KEY, {});
  const aliases = readLocalJson<CourseAliases>(COURSE_ALIAS_KEY, {});

  registry[record.actualCourseId] = {
    ...registry[record.actualCourseId],
    ...record,
  };

  if (record.catalogCourseId) {
    aliases[record.catalogCourseId] = record.actualCourseId;
  }

  writeLocalJson(COURSE_REGISTRY_KEY, registry);
  writeLocalJson(COURSE_ALIAS_KEY, aliases);
}

export function getCourseDisplay(courseId?: string | null) {
  const actualCourseId = resolveCourseId(courseId) || courseId || "";
  const registry = readLocalJson<CourseRegistry>(COURSE_REGISTRY_KEY, {});
  const record = actualCourseId ? registry[actualCourseId] : undefined;
  const catalogCourse =
    COURSES.find((course) => course.id === record?.catalogCourseId) ||
    COURSES.find((course) => course.id === courseId) ||
    COURSES.find((course) => course.id === actualCourseId);

  return {
    actualCourseId,
    catalogCourseId: record?.catalogCourseId || catalogCourse?.id || null,
    title: record?.title || catalogCourse?.name || actualCourseId || "课程",
    icon: record?.icon || catalogCourse?.icon || "📚",
    color: record?.color || catalogCourse?.color || "#8b5cf6",
    isCustom: record?.isCustom ?? !catalogCourse,
  };
}

export function buildCurriculumFromSyllabus(
  courseId: string,
  syllabusData: unknown,
  existing?: Curriculum,
): Curriculum {
  const rawChapters = Array.isArray(syllabusData)
    ? syllabusData
    : ((syllabusData as { chapters?: unknown[] } | null | undefined)?.chapters ?? []);

  const chapters: CurriculumChapter[] = rawChapters.map((chapter, chapterIndex) => {
    const chapterData = (chapter || {}) as Record<string, unknown>;
    const rawSections = Array.isArray(chapterData.sections) ? chapterData.sections : [];

    const sections: CurriculumSection[] = rawSections.map((section, sectionIndex) => {
      const sectionData = typeof section === "object" && section ? (section as Record<string, unknown>) : {};
      const sectionId =
        String(sectionData.id || sectionData.section_id || `${chapterIndex + 1}.${sectionIndex + 1}`);
      const existingState = getExistingSectionState(existing, sectionId);
      const sectionTitle =
        typeof section === "string"
          ? section
          : String(sectionData.title || sectionData.section_title || `第 ${chapterIndex + 1}.${sectionIndex + 1} 节`);
      const sectionDescription =
        typeof section === "string"
          ? ""
          : String(sectionData.objective || sectionData.description || "");

      return {
        id: sectionId,
        title: sectionTitle,
        description: sectionDescription,
        completed: existingState?.completed ?? false,
        progress: existingState?.progress ?? 0,
        understanding: existingState?.understanding ?? "none",
      };
    });

    return {
      id: String(chapterData.id || `${chapterIndex + 1}`),
      title: String(chapterData.chapter_title || chapterData.title || `第 ${chapterIndex + 1} 章`),
      description: String(chapterData.description || ""),
      sections,
    };
  });

  const items: CurriculumItem[] = chapters.flatMap((chapter) =>
    chapter.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      completed: section.completed,
      progress: section.progress,
      understanding: section.understanding,
    })),
  );

  return {
    courseId,
    chapters,
    items,
  };
}

export function persistCurriculumFromSyllabus(params: {
  actualCourseId: string;
  syllabusData: unknown;
  previousCourseId?: string | null;
}) {
  const actualCourseId = resolveCourseId(params.actualCourseId) || params.actualCourseId;
  const curricula = loadData<Record<string, Curriculum>>(STORAGE_KEYS.curricula, {});
  const existing =
    curricula[actualCourseId] ||
    (params.previousCourseId ? curricula[params.previousCourseId] : undefined);

  const curriculum = buildCurriculumFromSyllabus(actualCourseId, params.syllabusData, existing);
  curricula[actualCourseId] = curriculum;

  if (params.previousCourseId && params.previousCourseId !== actualCourseId) {
    delete curricula[params.previousCourseId];
  }

  saveData(STORAGE_KEYS.curricula, curricula);
  return curriculum;
}

export function moveProfileCourseId(params: {
  previousCourseId?: string | null;
  actualCourseId: string;
  fallbackAnswers?: string[];
  fallbackSummary?: string;
}) {
  const { previousCourseId, actualCourseId, fallbackAnswers = [], fallbackSummary = "" } = params;
  const profiles = loadData<
    Record<string, { courseId: string; answers: string[]; summary: string }>
  >(STORAGE_KEYS.profiles, {});

  const previousProfile = previousCourseId ? profiles[previousCourseId] : undefined;
  profiles[actualCourseId] = {
    courseId: actualCourseId,
    answers: previousProfile?.answers || fallbackAnswers,
    summary: previousProfile?.summary || fallbackSummary,
  };

  if (previousCourseId && previousCourseId !== actualCourseId) {
    delete profiles[previousCourseId];
  }

  saveData(STORAGE_KEYS.profiles, profiles);
}
