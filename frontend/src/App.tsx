import { useEffect, useMemo, useState } from "react";
import { getMetadata, getNextQuestion, getQuestion, getStats, submitAttempt } from "./lib/api";
import { buildHintTrack, translate } from "./lib/format";
import type { AttemptResponse, Lang, MetadataResponse, Question, StatsResponse } from "./lib/types";
import { DiagnosisPanel, HeroHeader, QuestionWorkspace, StudentModelPanel, TeacherSnapshot } from "./components";

export function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [studentId, setStudentId] = useState("demo-student");
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<AttemptResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [hintCursor, setHintCursor] = useState(0);
  const [loadingState, setLoadingState] = useState({ metadata: false, question: false, submit: false });

  const hintTrack = useMemo(
    () => diagnosis ? buildHintTrack(diagnosis.errors, translate(metadata, "hint_label")) : [],
    [diagnosis, metadata],
  );

  useEffect(() => {
    void loadMetadataAndStats(lang);
    void loadQuestion("q1", lang);
  }, [lang]);

  async function loadMetadataAndStats(nextLang: Lang) {
    setLoadingState((current) => ({ ...current, metadata: true }));
    try {
      const [metadataResponse, statsResponse] = await Promise.all([getMetadata(nextLang), getStats()]);
      setMetadata(metadataResponse);
      setStats(statsResponse);
      document.documentElement.lang = nextLang;
      document.title = metadataResponse.ui.app_title ?? "diagno";
    } finally {
      setLoadingState((current) => ({ ...current, metadata: false }));
    }
  }

  async function loadQuestion(questionId: string, nextLang: Lang) {
    setLoadingState((current) => ({ ...current, question: true }));
    try {
      const response = await getQuestion(questionId, nextLang);
      setQuestion(response);
      setSelectedAnswer(null);
      setDiagnosis(null);
      setHintCursor(0);
    } finally {
      setLoadingState((current) => ({ ...current, question: false }));
    }
  }

  async function handleSubmit() {
    if (!selectedAnswer || !question) {
      return;
    }
    setLoadingState((current) => ({ ...current, submit: true }));
    try {
      const response = await submitAttempt(
        { question_id: question.id, student_id: studentId || "demo-student", answer: selectedAnswer },
        lang,
      );
      setDiagnosis(response);
      setHintCursor(0);
      const latestStats = await getStats();
      setStats(latestStats);
    } finally {
      setLoadingState((current) => ({ ...current, submit: false }));
    }
  }

  async function handleNextQuestion() {
    if (!question) {
      return;
    }
    const nextQuestion = diagnosis?.errors[0]
      ? await getNextQuestion({ currentQuestionId: question.id, lang, errorType: diagnosis.errors[0].id })
      : diagnosis?.recommended_next_question_id
        ? await getQuestion(diagnosis.recommended_next_question_id, lang)
        : await getNextQuestion({ currentQuestionId: question.id, lang });
    setQuestion(nextQuestion);
    setSelectedAnswer(null);
    setDiagnosis(null);
    setHintCursor(0);
  }

  return (
    <main className="app-shell">
      <HeroHeader
        metadata={metadata}
        lang={lang}
        studentId={studentId}
        onStudentIdChange={setStudentId}
        onLangChange={setLang}
      />

      <section className="workspace-grid">
        <QuestionWorkspace
          metadata={metadata}
          question={question}
          selectedAnswer={selectedAnswer}
          isSubmitting={loadingState.submit || loadingState.question}
          onSelectAnswer={setSelectedAnswer}
          onSubmit={() => void handleSubmit()}
          onNextQuestion={() => void handleNextQuestion()}
        />
        <DiagnosisPanel
          metadata={metadata}
          diagnosis={diagnosis}
          hintCursor={hintCursor}
          flatHints={hintTrack}
          onShowHint={() => setHintCursor((current) => Math.min(current + 1, hintTrack.length))}
        />
      </section>

      <section className="insight-grid">
        <StudentModelPanel metadata={metadata} studentModel={diagnosis?.student_model ?? null} />
        <TeacherSnapshot metadata={metadata} stats={stats} lang={lang} />
      </section>

      {(loadingState.metadata || loadingState.question) && (
        <div className="loading-banner">{translate(metadata, "loading")}</div>
      )}
    </main>
  );
}
