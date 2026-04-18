import type { ErrorType, Lang, MetadataResponse } from "./types";

export function translate(
  metadata: MetadataResponse | null,
  key: string,
  params: Record<string, string | number> = {},
): string {
  const template = metadata?.ui?.[key] ?? key;
  return Object.entries(params).reduce(
    (value, [paramKey, paramValue]) => value.replace(`{${paramKey}}`, String(paramValue)),
    template,
  );
}

export function conceptLabel(metadata: MetadataResponse | null, conceptId: string): string {
  return metadata?.concepts.find((concept) => concept.id === conceptId)?.name ?? conceptId;
}

export function errorLabel(metadata: MetadataResponse | null, errorId: string): string {
  return metadata?.errors.find((error) => error.id === errorId)?.name ?? errorId;
}

export function formatAttemptTime(timestamp: string, lang: Lang): string {
  return new Date(timestamp).toLocaleString(lang === "zh-TW" ? "zh-TW" : "en-US");
}

export function buildHintTrack(errors: ErrorType[], hintLabel: string): string[] {
  return errors.flatMap((error) =>
    error.hint_levels.map((hint, index) => `${error.name} - ${hintLabel} ${index + 1}: ${hint}`),
  );
}
