import { Component } from "react";
import type { ReactNode } from "react";
import type { AttemptResponse, Lang, MetadataResponse, Question, StudentModel } from "./lib/types";
import { conceptLabel, translate } from "./lib/format";
import { MathText } from "./lib/math";

// --- Error Boundary ---
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: 'var(--color-error, #f87171)', fontFamily: 'sans-serif' }}>
          <strong>Something went wrong.</strong>
          <pre style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Settings Hub (Nav Items) ---
export function SettingsSidebar(props: {
  studentId: string;
  onOpenSettings: () => void;
}) {
  const { studentId, onOpenSettings } = props;
  
  return (
    <>
      <div className="sidebar-header">
        <div className="user-avatar">{studentId.charAt(0).toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{studentId}</div>
          <div className="micro-copy">Learning Mode</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Controls</div>
        <div className="nav-item" onClick={onOpenSettings}>
           ⚙️ System Settings
        </div>
      </div>
    </>
  );
}

export function SettingsModal(props: {
  metadata: MetadataResponse | null;
  lang: Lang;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  onClose: () => void;
  onLangChange: (lang: Lang) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
}) {
  return (
    <div className="modal-overlay" onClick={props.onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Preferences</div>
        
        <div className="sidebar-label">Language</div>
        <div className="modal-row">
          <button className={`toggle-btn ${props.lang === 'zh-TW' ? 'active' : ''}`} onClick={() => props.onLangChange('zh-TW')}>🇹🇼 繁體中文</button>
          <button className={`toggle-btn ${props.lang === 'en' ? 'active' : ''}`} onClick={() => props.onLangChange('en')}>🇺🇸 English</button>
        </div>

        <div className="sidebar-label" style={{ marginTop: '1.5rem' }}>Theme</div>
        <div className="modal-row">
          <button className={`toggle-btn ${props.theme === 'light' ? 'active' : ''}`} onClick={() => props.onThemeChange('light')}>Light</button>
          <button className={`toggle-btn ${props.theme === 'dark' ? 'active' : ''}`} onClick={() => props.onThemeChange('dark')}>Dark</button>
          <button className={`toggle-btn ${props.theme === 'system' ? 'active' : ''}`} onClick={() => props.onThemeChange('system')}>System</button>
        </div>

        <div className="sidebar-label" style={{ marginTop: '1.5rem' }}>Text Size</div>
        <div className="modal-row">
          <button className={`toggle-btn ${props.fontSize === 'small' ? 'active' : ''}`} onClick={() => props.onFontSizeChange('small')}>A</button>
          <button className={`toggle-btn ${props.fontSize === 'medium' ? 'active' : ''}`} onClick={() => props.onFontSizeChange('medium')}>Aa</button>
          <button className={`toggle-btn ${props.fontSize === 'large' ? 'active' : ''}`} onClick={() => props.onFontSizeChange('large')}>Aa+</button>
        </div>
      </div>
    </div>
  );
}


// --- Chat Message Bubble ---
export function ChatMessage(props: {
  role: 'tutor' | 'student' | 'diagnosis' | 'header';
  content: string;
  timestamp?: string;
  isMath?: boolean;
}) {
  const { role, content, timestamp, isMath } = props;
  
  if (role === 'header') {
    return (
      <div className="msg-group-header">
        <span>Challenge: {content}</span>
        <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>{timestamp}</span>
      </div>
    );
  }

  return (
    <div className={`msg msg-${role}`}>
      <div className={`bubble bubble-${role}`}>
        {isMath ? <MathText text={content} /> : content}
      </div>
      {timestamp && <div className="msg-meta">{timestamp}</div>}
    </div>
  );
}

// --- Multi-modal Composer ---
export function ChatComposer(props: {
  metadata: MetadataResponse | null;
  question: Question | null;
  selectedAnswer: string | null;
  inputValue: string;
  onInputChange: (val: string) => void;
  onSelectOption: (id: string) => void;
  onSubmit: () => void;
  isThinking?: boolean;
  previewDiagnosis?: AttemptResponse | null;
}) {
  const { metadata, question, selectedAnswer, inputValue, onInputChange, onSelectOption, onSubmit, isThinking, previewDiagnosis } = props;
  const canSubmit = Boolean(inputValue || selectedAnswer);

  return (
    <div className="composer">
      {/* Real-time Insights */}
      {(isThinking || (previewDiagnosis && !previewDiagnosis.attempt.is_correct)) && (
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
          {isThinking ? (
            <div className="thinking"><div className="dot-flashing"></div> Analyzing your logic...</div>
          ) : previewDiagnosis && !previewDiagnosis.attempt.is_correct && previewDiagnosis.errors.length > 0 ? (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--color-warning)', 
              fontSize: '0.9rem', 
              color: 'var(--color-warning)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
            }}>
              💡 {previewDiagnosis.errors[0].hint_levels[0]}
            </div>
          ) : null}
        </div>
      )}
      
      {question?.options && (
        <div className="options-overlay" style={{ padding: '0 0.5rem' }}>
          {question.options.map(opt => (
            <button 
              key={opt.id} 
              className={`option-pill ${selectedAnswer === opt.id ? 'selected' : ''}`}
              onClick={() => onSelectOption(opt.id)}
            >
              <span style={{ opacity: 0.6, marginRight: '0.5rem' }}>{opt.id}</span>
              <MathText text={opt.text} />
            </button>
          ))}
        </div>
      )}

      <div className="composer-box">
        <button className="icon-btn" title="Resources">📚</button>
        <input 
          className="composer-input"
          placeholder={translate(metadata, "select_prompt")}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSubmit && onSubmit()}
        />
        <button 
          className={`icon-btn ${inputValue || selectedAnswer ? 'icon-btn-primary' : ''}`}
          aria-label={translate(metadata, "submit_answer")}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          ➔
        </button>
      </div>
    </div>
  );
}

export function MasteryPanel(props: {
  metadata: MetadataResponse | null;
  studentModel: StudentModel | null;
}) {
  const { metadata, studentModel } = props;
  if (!studentModel) return null;
  return (
    <div className="sidebar-section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
       <div className="sidebar-label">Your Mastery</div>
       {Object.entries(studentModel.concept_mastery).map(([id, score]) => (
         <div key={id} style={{ marginBottom: '1.25rem' }}>
           <div className="micro-copy" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
             <span style={{ color: 'var(--text-secondary)' }}>
                {conceptLabel(props.metadata, id)}
             </span>
             <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
               {Math.round(score * 100)}%
             </span>
           </div>
           <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.05)', height: '1px', borderRadius: '1px' }}>
             <div className="progress-fill" style={{ 
               width: `${score * 100}%`, 
               height: '2px',
               marginTop: '-0.5px',
               background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
               boxShadow: '0 0 10px var(--accent-glow)'
             }} />
           </div>
         </div>
       ))}
    </div>
  );
}
