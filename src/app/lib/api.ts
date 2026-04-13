import type {
  ArchitectGenerateRequest,
  ArchitectGenerateResponse,
  ConciergeRequest,
  ConciergeResponseData,
  GenerateNoteRequest,
  GeneratedNote,
  InterviewReplyResponse,
  InterviewStartRequest,
  InterviewStartResponse,
  NoteListItem,
  ProfilerAnalyzeRequest,
  ProgressRecord,
  ProgressUpdateRequest,
  SaveNoteRequest,
  TutorRequest,
  TutorResponse,
} from "../types/learning";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

interface ApiEnvelope<T> {
  status: string;
  message?: string;
  data?: T;
  detail?: string;
  reply?: string;
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || `请求失败（${response.status}）`;
  } catch {
    return `请求失败（${response.status}）`;
  }
}

async function requestJson<T>(path: string, init?: RequestInit & { body?: unknown }) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as T;
}

function flushSseBuffer(buffer: string) {
  const events: string[] = [];
  let rest = buffer;

  while (rest.includes("\n\n")) {
    const index = rest.indexOf("\n\n");
    const rawEvent = rest.slice(0, index);
    rest = rest.slice(index + 2);
    const data = rawEvent
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s?/, ""))
      .join("\n");

    if (data) {
      events.push(data);
    }
  }

  return { events, rest };
}

export const learningApi = {
  upsertUserProfile(payload: { username: string; background: string; daily_goal_minutes: number }) {
    return requestJson<ApiEnvelope<undefined>>("/api/user/profile", {
      method: "POST",
      body: payload,
    });
  },

  startInterview(payload: InterviewStartRequest) {
    return requestJson<InterviewStartResponse>("/api/interview/start", {
      method: "POST",
      body: payload,
    });
  },

  replyInterview(session_id: string, user_message: string) {
    return requestJson<InterviewReplyResponse>("/api/interview/reply", {
      method: "POST",
      body: { session_id, user_message },
    });
  },

  generateCoursePlan(payload: ArchitectGenerateRequest) {
    return requestJson<ArchitectGenerateResponse>("/api/architect/generate-course-plan", {
      method: "POST",
      body: payload,
    });
  },

  getCoursePlan(userId: string, courseId: string) {
    return requestJson<ApiEnvelope<ArchitectGenerateResponse["data"]>>(`/api/curriculum/${userId}/${courseId}`);
  },

  tutorRespond(payload: TutorRequest) {
    return requestJson<TutorResponse>("/api/tutor/respond", {
      method: "POST",
      body: payload,
    });
  },

  async streamTutorChat(
    payload: TutorRequest,
    options: {
      signal?: AbortSignal;
      onChunk: (nextText: string, delta: string) => void;
    },
  ) {
    const response = await fetch(`${API_BASE_URL}/api/study/tutor-chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    if (!response.body) {
      throw new Error("导师流式接口没有返回可读流");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = flushSseBuffer(buffer);
      buffer = rest;

      for (const event of events) {
        if (event.startsWith("[Error]") || event.startsWith("Error:")) {
          throw new Error(event.replace(/^\[Error\]\s*/, ""));
        }
        fullText += event;
        options.onChunk(fullText, event);
      }
    }

    if (buffer.trim()) {
      const { events } = flushSseBuffer(`${buffer}\n\n`);
      for (const event of events) {
        if (event.startsWith("[Error]") || event.startsWith("Error:")) {
          throw new Error(event.replace(/^\[Error\]\s*/, ""));
        }
        fullText += event;
        options.onChunk(fullText, event);
      }
    }

    return fullText;
  },

  analyzeInteraction(payload: ProfilerAnalyzeRequest) {
    return requestJson<ApiEnvelope<Record<string, unknown>>>("/api/profiler/analyze-interaction", {
      method: "POST",
      body: payload,
    });
  },

  generateNote(payload: GenerateNoteRequest) {
    return requestJson<ApiEnvelope<GeneratedNote>>("/api/clerk/generate-note", {
      method: "POST",
      body: payload,
    });
  },

  getNotesList(userId: string) {
    return requestJson<ApiEnvelope<NoteListItem[]>>(`/api/notes/list/${userId}`);
  },

  saveNote(payload: SaveNoteRequest) {
    return requestJson<ApiEnvelope<undefined>>("/api/notes/save", {
      method: "POST",
      body: payload,
    });
  },

  updateProgress(payload: ProgressUpdateRequest) {
    return requestJson<ApiEnvelope<ProgressRecord>>("/api/progress/update", {
      method: "POST",
      body: payload,
    });
  },

  getProgress(userId: string, courseId: string) {
    const url = new URL(`${API_BASE_URL}/api/progress/${userId}`);
    url.searchParams.set("course_id", courseId);

    return fetch(url.toString()).then(async (response) => {
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      return (await response.json()) as ApiEnvelope<ProgressRecord>;
    });
  },

  conciergeRespond(payload: ConciergeRequest) {
    return requestJson<ApiEnvelope<ConciergeResponseData>>("/api/concierge/respond", {
      method: "POST",
      body: payload,
    });
  },
};
