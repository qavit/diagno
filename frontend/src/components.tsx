import type { Attempt, AttemptResponse, Lang, MetadataResponse, Question, StatsResponse, StudentModel } from "./lib/types";
import { conceptLabel, errorLabel, formatAttemptTime, translate } from "./lib/format";
import { MathText } from "./lib/math";

export function HeroHeader(props: {
  metadata: MetadataResponse | null;
  lang: Lang;
  studentId: string;
  onStudentIdChange: (value: string) => void;
  onLangChange: (value: Lang) => void;
}) {
  const { metadata, lang, studentId, onStudentIdChange, onLangChange } = props;
  return (
    <section className="panel hero">
      <div className="hero-copy">
        <p className="eyebrow">{translate(metadata, "hero_eyebrow")}</p>
        <h1>{translate(metadata, "hero_title")}</h1>
        <MathText className="subtle hero-description" text={translate(metadata, "hero_description")} as="p" />
        <div className="hero-ribbons">
          <span className="ribbon">{translate(metadata, "hero_ribbon_rule_based")}</span>
          <span className="ribbon">{translate(metadata, "hero_ribbon_bilingual")}</span>
          <span className="ribbon">{translate(metadata, "hero_ribbon_teacher")}</span>
        </div>
      </div>
      <div className="hero-controls">
        <label className="field">
          <span>{translate(metadata, "language_label")}</span>
          <select value={lang} onChange={(event) => onLangChange(event.target.value as Lang)}>
            <option value="en">English</option>
            <option value="zh-TW">繁體中文</option>
          </select>
        </label>
        <label className="field">
          <span>{translate(metadata, "student_label")}</span>
          <input value={studentId} onChange={(event) => onStudentIdChange(event.target.value)} />
        </label>
      </div>
    </section>
  );
}

export function QuestionWorkspace(props: {
  metadata: MetadataResponse | null;
  question: Question | null;
  selectedAnswer: string | null;
  isSubmitting: boolean;
  onSelectAnswer: (optionId: string) => void;
  onSubmit: () => void;
  onNextQuestion: () => void;
}) {
  const { metadata, question, selectedAnswer, isSubmitting, onSelectAnswer, onSubmit, onNextQuestion } = props;

  return (
    <article className="panel workspace-panel">
      <div className="section-row">
        <p className="eyebrow">
          {translate(metadata, "question_label")} {question?.id.toUpperCase() ?? "--"}
        </p>
        <button className="button ghost" onClick={onNextQuestion}>
          {translate(metadata, "next_question")}
        </button>
      </div>

      <div className="panel-heading">
        <h2>{translate(metadata, "task_panel_title")}</h2>
        <MathText className="subtle" text={translate(metadata, "task_panel_description")} as="p" />
      </div>

      <div className="meta-grid">
        <section className="meta-block">
          <span className="meta-label">{translate(metadata, "concepts_label")}</span>
          <div className="chip-row">
            {question?.concepts.map((conceptId) => (
              <span key={conceptId} className="chip">
                {conceptLabel(metadata, conceptId)}
              </span>
            ))}
          </div>
        </section>
        <section className="meta-block meta-tight">
          <span className="meta-label">{translate(metadata, "difficulty_label")}</span>
          <strong className="difficulty-value">{question?.difficulty ?? "-"}</strong>
        </section>
      </div>

      <div className="question-copy">
        <MathText as="h3" text={question?.statement ?? translate(metadata, "loading")} />
      </div>

      <div className="option-stack">
        {question?.options?.map((option) => {
          const selected = selectedAnswer === option.id;
          return (
            <button
              key={option.id}
              className={`option-card${selected ? " selected" : ""}`}
              onClick={() => onSelectAnswer(option.id)}
            >
              <span className="option-key">{option.id}</span>
              <MathText className="option-text" text={option.text} />
            </button>
          );
        })}
      </div>

      <div className="action-bar">
        <div className="micro-copy">
          {selectedAnswer
            ? `${translate(metadata, "choice_label")} ${selectedAnswer}`
            : translate(metadata, "select_prompt")}
        </div>
        <button className="button primary" disabled={!selectedAnswer || isSubmitting} onClick={onSubmit}>
          {translate(metadata, "submit_answer")}
        </button>
      </div>
    </article>
  );
}

export function DiagnosisPanel(props: {
  metadata: MetadataResponse | null;
  diagnosis: AttemptResponse | null;
  hintCursor: number;
  flatHints: string[];
  onShowHint: () => void;
}) {
  const { metadata, diagnosis, hintCursor, flatHints, onShowHint } = props;
  const hintProgress = flatHints.length > 0
    ? translate(metadata, "hint_progress", { shown: hintCursor, total: flatHints.length })
    : translate(metadata, "hint_track_empty");

  return (
    <aside className="panel diagnosis-panel">
      <div className="panel-heading">
        <h2>{translate(metadata, "diagnosis_title")}</h2>
        <MathText className="subtle" text={translate(metadata, "diagnosis_panel_description")} as="p" />
      </div>

      <div className={`status-card${diagnosis?.attempt.is_correct ? " success" : diagnosis ? " error" : ""}`}>
        {diagnosis
          ? diagnosis.attempt.is_correct
            ? translate(metadata, "status_correct")
            : translate(metadata, "status_incorrect")
          : translate(metadata, "diagnosis_idle")}
      </div>

      <SectionHeader title={translate(metadata, "detected_errors_title")} />
      <div className="stack">
        {!diagnosis && <EmptyCard text={translate(metadata, "diagnosis_idle")} />}
        {diagnosis?.errors.length === 0 && <EmptyCard text={translate(metadata, "no_error_types")} />}
        {diagnosis?.errors.map((error) => (
          <article key={error.id} className="diagnosis-card">
            <strong>{error.name}</strong>
            <MathText as="p" text={error.description} />
            <span className="micro-copy">
              {translate(metadata, "category")}: {error.category}
            </span>
          </article>
        ))}
      </div>

      <SectionHeader title={translate(metadata, "hint_track_title")} aside={hintProgress} />
      <div className="stack">
        {flatHints.length === 0 && <EmptyCard text={translate(metadata, "hint_track_empty")} />}
        {flatHints.slice(0, hintCursor).map((hint) => (
          <article key={hint} className="hint-card">
            <MathText text={hint} />
          </article>
        ))}
      </div>
      <button className="button ghost" disabled={flatHints.length === 0 || hintCursor >= flatHints.length} onClick={onShowHint}>
        {translate(metadata, "show_next_hint")}
      </button>

      <SectionHeader title={translate(metadata, "recommended_next_title")} />
      <div className="status-card">
        <MathText
          text={diagnosis?.recommended_next_question_id
            ? translate(metadata, "recommended_next_ready", { question_id: diagnosis.recommended_next_question_id.toUpperCase() })
            : translate(metadata, "recommended_next_empty")}
        />
      </div>
    </aside>
  );
}

export function StudentModelPanel(props: {
  metadata: MetadataResponse | null;
  studentModel: StudentModel | null;
}) {
  const { metadata, studentModel } = props;
  const recentErrors = studentModel ? Object.entries(studentModel.recent_errors).sort((a, b) => b[1] - a[1]) : [];

  return (
    <article className="panel">
      <div className="panel-heading">
        <h2>{translate(metadata, "student_model_title")}</h2>
        <MathText className="subtle" text={translate(metadata, "student_model_description")} as="p" />
      </div>

      <div className="stack">
        {studentModel ? (
          Object.entries(studentModel.concept_mastery).map(([conceptId, score]) => (
            <article key={conceptId} className="mastery-card">
              <div className="mastery-header">
                <div>
                  <strong>{conceptLabel(metadata, conceptId)}</strong>
                  <div className="micro-copy">{translate(metadata, "mastery_percent", { percent: Math.round(score * 100) })}</div>
                </div>
                <div className="progress-shell">
                  <div className="progress-fill" style={{ width: `${Math.round(score * 100)}%` }} />
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyCard text={translate(metadata, "diagnosis_idle")} />
        )}
      </div>

      <SectionHeader title={translate(metadata, "recent_errors_title")} />
      <div className="stack">
        {recentErrors.length === 0 && <EmptyCard text={translate(metadata, "recent_errors_empty")} />}
        {recentErrors.map(([errorId, count]) => (
          <article key={errorId} className="metric-card">
            <strong>{errorLabel(metadata, errorId)}</strong>
            <div className="micro-copy">{translate(metadata, "seen_times", { count })}</div>
          </article>
        ))}
      </div>
    </article>
  );
}

export function TeacherSnapshot(props: {
  metadata: MetadataResponse | null;
  stats: StatsResponse | null;
  lang: Lang;
}) {
  const { metadata, stats, lang } = props;
  const activeStudents = stats ? Object.keys(stats.concept_mastery_by_student).length : 0;
  const trackedConcepts = metadata?.concepts.length ?? 0;
  const errorEntries = stats ? Object.entries(stats.error_distribution).sort((a, b) => b[1] - a[1]) : [];
  const recentAttempts = stats?.recent_attempts ? [...stats.recent_attempts].reverse() : [];

  return (
    <article className="panel">
      <div className="panel-heading">
        <h2>{translate(metadata, "teacher_view_title")}</h2>
        <MathText className="subtle" text={translate(metadata, "teacher_view_description")} as="p" />
      </div>

      <div className="summary-grid">
        <SummaryCard label={translate(metadata, "total_attempts")} value={stats?.total_attempts ?? 0} />
        <SummaryCard label={translate(metadata, "active_students")} value={activeStudents} />
        <SummaryCard label={translate(metadata, "tracked_concepts")} value={trackedConcepts} />
      </div>

      <div className="stack">
        {errorEntries.length === 0 && <EmptyCard text={translate(metadata, "no_error_data")} />}
        {errorEntries.map(([errorId, count]) => (
          <article key={errorId} className="metric-card">
            <strong>{errorLabel(metadata, errorId)}</strong>
            <div className="micro-copy">{translate(metadata, "seen_times", { count })}</div>
          </article>
        ))}
      </div>

      <SectionHeader title={translate(metadata, "recent_attempts_title")} />
      <div className="stack">
        {recentAttempts.length === 0 && <EmptyCard text={translate(metadata, "recent_attempts_empty")} />}
        {recentAttempts.map((attempt) => (
          <AttemptCard key={attempt.id} attempt={attempt} metadata={metadata} lang={lang} />
        ))}
      </div>
    </article>
  );
}

function SectionHeader(props: { title: string; aside?: string }) {
  return (
    <div className="section-header">
      <h3>{props.title}</h3>
      {props.aside ? <span className="micro-copy">{props.aside}</span> : null}
    </div>
  );
}

function SummaryCard(props: { label: string; value: number }) {
  return (
    <article className="summary-card">
      <span className="micro-copy">{props.label}</span>
      <strong>{props.value}</strong>
    </article>
  );
}

function AttemptCard(props: { attempt: Attempt; metadata: MetadataResponse | null; lang: Lang }) {
  const { attempt, metadata, lang } = props;
  const errorSummary = attempt.detected_errors.length > 0
    ? attempt.detected_errors.map((errorId) => errorLabel(metadata, errorId)).join(", ")
    : translate(metadata, "no_error_types");

  return (
    <article className="attempt-card">
      <div className="attempt-head">
        <strong>{translate(metadata, "question_short")} {attempt.question_id.toUpperCase()}</strong>
        <span className={`badge ${attempt.is_correct ? "success" : "error"}`}>
          {attempt.is_correct ? translate(metadata, "attempt_correct") : translate(metadata, "attempt_incorrect")}
        </span>
      </div>
      <div className="micro-copy">
        {translate(metadata, "student_short")}: {attempt.student_id} · {formatAttemptTime(attempt.timestamp, lang)}
      </div>
      <div>{errorSummary}</div>
    </article>
  );
}

function EmptyCard(props: { text: string }) {
  return (
    <article className="empty-card">
      <MathText text={props.text} />
    </article>
  );
}
