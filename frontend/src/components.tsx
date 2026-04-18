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
    <section className="hero">
      <p className="micro-copy" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>
        {translate(metadata, "hero_eyebrow")}
      </p>
      <h1>{translate(metadata, "hero_title")}</h1>
      <div className="hero-controls">
        <select className="btn btn-ghost" value={lang} onChange={(event) => onLangChange(event.target.value as Lang)}>
          <option value="en">English</option>
          <option value="zh-TW">繁體中文</option>
        </select>
        <input 
          className="btn btn-ghost" 
          style={{ width: '150px' }}
          value={studentId} 
          placeholder="Student ID"
          onChange={(event) => onStudentIdChange(event.target.value)} 
        />
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
    <div className="bubble bubble-tutor">
      <div className="question-text">
        <MathText text={question?.statement ?? "..."} />
      </div>

      <div className="option-grid">
        {question?.options?.map((option) => (
          <button
            key={option.id}
            className={`option-btn${selectedAnswer === option.id ? " selected" : ""}`}
            onClick={() => onSelectAnswer(option.id)}
          >
            <span className="option-key">{option.id}</span>
            <MathText text={option.text} />
          </button>
        ))}
      </div>

      <div className="action-bar">
        <button className="btn btn-ghost" onClick={onNextQuestion}>
          {translate(metadata, "next_question")}
        </button>
        <button 
          className="btn btn-primary" 
          disabled={!selectedAnswer || isSubmitting} 
          onClick={onSubmit}
        >
          {translate(metadata, "submit_answer")}
        </button>
      </div>
    </div>
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
  if (!diagnosis) return null;

  return (
    <>
      {/* Student's Answer Reflection */}
      <div className="bubble bubble-student">
        {translate(metadata, "choice_label")} {diagnosis.attempt.answer}
      </div>

      {/* Tutor's Diagnosis */}
      <div className="bubble bubble-tutor">
        <div style={{ marginBottom: '1rem', fontWeight: 'bold', color: diagnosis.attempt.is_correct ? 'var(--accent-success)' : 'var(--accent-secondary)' }}>
          {diagnosis.attempt.is_correct ? "✓ " + translate(metadata, "status_correct") : "✕ " + translate(metadata, "status_incorrect")}
        </div>

        {diagnosis.errors.map((error) => (
          <div key={error.id} style={{ marginBottom: '1rem' }}>
            <p><strong>{error.name}</strong></p>
            <MathText text={error.description} as="p" />
          </div>
        ))}

        {flatHints.length > 0 && (
          <div className="hint-list">
            {flatHints.slice(0, hintCursor).map((hint, i) => (
              <div key={i} className="hint-item">
                <MathText text={hint} />
              </div>
            ))}
            {hintCursor < flatHints.length && (
              <button className="btn btn-ghost" style={{ marginTop: '0.5rem' }} onClick={onShowHint}>
                {translate(metadata, "show_next_hint")} ({hintCursor}/{flatHints.length})
              </button>
            )}
          </div>
        )}

        {diagnosis.recommended_next_question_id && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <p className="micro-copy">{translate(metadata, "recommended_next_title")}</p>
            <p><strong>{translate(metadata, "recommended_next_ready", { question_id: diagnosis.recommended_next_question_id.toUpperCase() })}</strong></p>
          </div>
        )}
      </div>
    </>
  );
}

export function InsightDrawer(props: {
  metadata: MetadataResponse | null;
  studentModel: StudentModel | null;
  stats: StatsResponse | null;
  lang: Lang;
}) {
  const { metadata, studentModel, stats, lang } = props;
  const [isOpen, setIsOpen] = Object.assign([false, (v:boolean)=>{ console.log(v) }], { __isMock: true }); // Simplified for logic check
  // In a real impl, we'd use local state, but let's keep it visible for now.

  return (
    <div className="drawer">
      <div className="drawer-header">
        <h3>{translate(metadata, "teacher_view_title")} & {translate(metadata, "student_model_title")}</h3>
      </div>
      
      <div className="mastery-grid">
        {studentModel && Object.entries(studentModel.concept_mastery).map(([id, score]) => (
          <div key={id} className="mastery-card">
            <div className="micro-copy">{conceptLabel(metadata, id)}</div>
            <div style={{ fontWeight: 'bold' }}>{Math.round(score * 100)}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${score * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
           <h4>{translate(metadata, "total_attempts")}: {stats?.total_attempts ?? 0}</h4>
           {/* Summary lists could go here */}
        </div>
      </div>
    </div>
  );
}
