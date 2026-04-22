import { useEffect, useMemo, useState, useRef } from "react";
import { getMetadata, getNextQuestion, getQuestion, getStats, submitAttempt } from "./lib/api";
import { translate } from "./lib/format";
import type { AttemptResponse, Lang, MetadataResponse, Question, StatsResponse } from "./lib/types";
import { SettingsSidebar, SettingsModal, ChatMessage, ChatComposer, MasteryPanel } from "./components";
import { MathText } from "./lib/math";


interface Message {
  id: string;
  role: 'tutor' | 'student' | 'diagnosis' | 'header';
  content: string;
  isMath?: boolean;
  timestamp: string;
}

export function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [studentId, setStudentId] = useState("demo-student");
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [previewDiagnosis, setPreviewDiagnosis] = useState<AttemptResponse | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  
  // UI Settings State
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showSettings, setShowSettings] = useState(false);
  
  // Layout State
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(400);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [draggingPane, setDraggingPane] = useState<'left' | 'right' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastQuestionId = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, isThinking, previewDiagnosis]);

  // Handle scroll events to show/hide "Jump to bottom"
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const jumpToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Drag Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingPane === 'left') {
        const newWidth = Math.max(150, Math.min(e.clientX, window.innerWidth / 2));
        setLeftWidth(newWidth);
        if (newWidth > 150 && leftCollapsed) setLeftCollapsed(false);
      } else if (draggingPane === 'right') {
        const newWidth = Math.max(250, Math.min(window.innerWidth - e.clientX, window.innerWidth - leftWidth - 100));
        setRightWidth(newWidth);
        if (newWidth > 250 && rightCollapsed) setRightCollapsed(false);
      }
    };
    const handleMouseUp = () => setDraggingPane(null);

    if (draggingPane) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingPane, leftWidth, leftCollapsed, rightCollapsed]);

  // Apply Theme & Font Settings
  useEffect(() => {
    const root = document.documentElement;
    let computedTheme = theme;
    if (theme === 'system') {
      computedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', computedTheme);
    root.setAttribute('data-font-size', fontSize);
  }, [theme, fontSize]);

  // Real-time Diagnosis Debounce
  useEffect(() => {
    const finalAnswer = selectedAnswer || inputValue;
    if (!finalAnswer || !question) {
      setPreviewDiagnosis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsThinking(true);
      try {
        const res = await import("./lib/api").then(api => api.diagnosePreview({ 
          question_id: question.id, 
          student_id: studentId, 
          answer: finalAnswer 
        }, lang));
        setPreviewDiagnosis(res);
      } finally {
        setIsThinking(false);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [inputValue, selectedAnswer, question, studentId, lang]);

  useEffect(() => {
    // Only load initial question once per session/language change
    void loadInitialData();
  }, [lang]);

  async function loadInitialData() {
    const [metaRes, statsRes] = await Promise.all([getMetadata(lang), getStats()]);
    setMetadata(metaRes);
    setStats(statsRes);

    const q1 = await getQuestion("q1", lang);
    setQuestion(q1);
    lastQuestionId.current = q1.id;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      { id: crypto.randomUUID(), role: 'header', content: q1.id, isMath: false, timestamp: ts },
      { id: crypto.randomUUID(), role: 'tutor', content: q1.statement, isMath: true, timestamp: ts },
    ]);
  }

  function addMessage(role: Message['role'], content: string, isMath = false) {
    const msg: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      isMath,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
  }

  function addTutorMessage(content: string, isMath = false) {
    addMessage('tutor', content, isMath);
  }

  function addStudentMessage(content: string) {
    addMessage('student', content);
  }

  async function handleSubmit() {
    const finalAnswer = selectedAnswer || inputValue;
    if (!finalAnswer || !question) return;

    addStudentMessage(finalAnswer);
    setInputValue("");
    setSelectedAnswer(null);
    setIsThinking(true);

    try {
      const res = await submitAttempt({ question_id: question.id, student_id: studentId, answer: finalAnswer }, lang);
      
      // Tutor feedback
      const feedback = res.attempt.is_correct 
        ? "✓ Correct! Great job." 
        : `✕ Incorrect. Let's look closer.`;
      addTutorMessage(feedback);

      // Error diagnoses & hints
      res.errors.forEach(err => {
        addTutorMessage(`**${err.name}**: ${err.description}`, true);
        err.hint_levels.forEach(hint => addTutorMessage(hint, true));
      });

      // Recommended next question
      if (res.recommended_next_question_id && res.recommended_next_question_id !== lastQuestionId.current) {
        const nextQ = await getQuestion(res.recommended_next_question_id, lang);
        setQuestion(nextQ);
        lastQuestionId.current = nextQ.id;
        setTimeout(() => {
          addMessage('header', nextQ.id);
          addTutorMessage(`Next challenge: ${nextQ.statement}`, true);
        }, 1000);
      }
      
      const latestStats = await getStats();
      setStats(latestStats);
    } finally {
      setIsThinking(false);
    }
  }

  const gridColumns = useMemo(() => {
    const cols = [];
    if (!leftCollapsed) cols.push(`${leftWidth}px`, '4px');
    cols.push('1fr');
    if (!rightCollapsed) cols.push('4px', `${rightWidth}px`);
    return cols.join(' ');
  }, [leftWidth, rightWidth, leftCollapsed, rightCollapsed]);

  return (
    <div 
      className="app-container"
      style={{ gridTemplateColumns: gridColumns }}
    >
      {/* Column 1: Pulse (Nav & Mastery) */}
      {!leftCollapsed && (
        <aside className="column-pulse">
          <SettingsSidebar 
            studentId={studentId}
            onOpenSettings={() => setShowSettings(true)}
          />
          <div style={{ marginTop: 'auto' }}>
             <MasteryPanel metadata={metadata} studentModel={stats?.concept_mastery_by_student[studentId] || null} />
          </div>
        </aside>
      )}

      {/* Left Splitter */}
      {!leftCollapsed && (
        <div 
          className={`splitter ${draggingPane === 'left' ? 'dragging' : ''}`}
          onMouseDown={() => setDraggingPane('left')}
          onDoubleClick={() => setLeftCollapsed(true)}
        />
      )}

      {/* Column 2: The Stage (Persistent Problem) */}
      <main className="column-stage">
        <div className="panel-header">
          <div className="stage-title">Current Challenge</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="toggle-btn" onClick={() => setLeftCollapsed(!leftCollapsed)} title="Toggle Left Sidebar" style={{ padding: '0.25rem 0.5rem', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button>
            <button className="toggle-btn" onClick={() => setRightCollapsed(!rightCollapsed)} title="Toggle Right Sidebar" style={{ padding: '0.25rem 0.5rem', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </button>
          </div>
        </div>

        {question && (
          <div className="problem-card">
            <h2 style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
              Current Challenge
            </h2>
            <div style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              <MathText text={question.statement} />
            </div>
            
            {/* Future placeholder for diagrams */}
            <div style={{ 
              marginTop: '2rem', 
              height: '240px', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed var(--glass-border)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}>
              Interactive Physics Model Area
            </div>
          </div>
        )}
      </main>

      {/* Right Splitter */}
      {!rightCollapsed && (
        <div 
          className={`splitter ${draggingPane === 'right' ? 'dragging' : ''}`}
          onMouseDown={() => setDraggingPane('right')}
          onDoubleClick={() => setRightCollapsed(true)}
        />
      )}

      {/* Column 3: The Tutor (Feedback & Interaction) */}
      {!rightCollapsed && (
        <section className="column-tutor">
          <div className="panel-header">
            <div className="stage-title">AI Tutor</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{messages.length} messages</div>
          </div>

          <div className="tutor-feed" ref={scrollRef} onScroll={handleScroll}>
            {messages.map(m => (
              <ChatMessage key={m.id} role={m.role} content={m.content} isMath={m.isMath} timestamp={m.timestamp} />
            ))}
            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>

          <button 
            className={`scroll-anchor-btn ${showScrollBtn ? 'visible' : ''}`}
            onClick={jumpToBottom}
            title="Jump to Latest"
          >
            ↓
          </button>

          <ChatComposer 
            metadata={metadata}
            question={question}
            selectedAnswer={selectedAnswer}
            inputValue={inputValue}
            isThinking={isThinking}
            previewDiagnosis={previewDiagnosis}
            onInputChange={setInputValue}
            onSelectOption={setSelectedAnswer}
            onSubmit={() => void handleSubmit()}
          />
        </section>
      )}

      {showSettings && (
        <SettingsModal
          metadata={metadata}
          lang={lang}
          theme={theme}
          fontSize={fontSize}
          onClose={() => setShowSettings(false)}
          onLangChange={setLang}
          onThemeChange={setTheme}
          onFontSizeChange={setFontSize}
        />
      )}
    </div>
  );
}

