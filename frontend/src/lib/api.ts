import type { AttemptResponse, Lang, MetadataResponse, Question, StatsResponse } from "./types";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getMetadata(lang: Lang): Promise<MetadataResponse> {
  return requestJson(`/metadata?lang=${encodeURIComponent(lang)}`);
}

export function getQuestion(questionId: string, lang: Lang): Promise<Question> {
  return requestJson(`/questions/${questionId}?lang=${encodeURIComponent(lang)}`);
}

export function submitAttempt(payload: {
  question_id: string;
  student_id: string;
  answer: string;
}, lang: Lang): Promise<AttemptResponse> {
  return requestJson(`/attempt?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function diagnosePreview(payload: {
  question_id: string;
  student_id: string;
  answer: string;
}, lang: Lang): Promise<AttemptResponse> {
  return requestJson(`/diagnose-preview?lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getNextQuestion(params: {
  currentQuestionId: string;
  lang: Lang;
  errorType?: string;
}): Promise<Question> {
  const search = new URLSearchParams({
    current_question_id: params.currentQuestionId,
    lang: params.lang,
  });
  if (params.errorType) {
    search.set("error_type", params.errorType);
  }
  return requestJson(`/next-question?${search.toString()}`);
}

export function getStats(): Promise<StatsResponse> {
  return requestJson("/stats");
}
