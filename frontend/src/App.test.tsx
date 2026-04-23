import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

const metadata = {
  concepts: [{ id: "com_ratio", name: "Center of mass distance relation", description: "desc" }],
  errors: [{ id: "ignore_reference_frame", name: "Ignored the reference frame", description: "desc", category: "reading", hint_levels: ["Hint 1", "Hint 2"] }],
  question_ids: ["q1", "q2"],
  ui: {
    app_title: "Diagnostic Physics Tutor MVP",
    hero_eyebrow: "Diagnostic Physics Tutor",
    hero_title: "Angular Momentum + Center of Mass",
    hero_description: "desc",
    hero_ribbon_rule_based: "Rule-based diagnosis",
    hero_ribbon_bilingual: "Bilingual interface",
    hero_ribbon_teacher: "Teacher-facing analytics",
    student_label: "Student",
    question_label: "Question",
    next_question: "Next Question",
    skip_question: "Try Another Question",
    loading: "Loading...",
    submit_answer: "Submit Answer",
    next_challenge_message: "Next challenge: {statement}",
    diagnosis_title: "Diagnosis",
    diagnosis_idle: "Submit an answer to see diagnosis.",
    show_next_hint: "Show Next Hint",
    student_model_title: "Student Model",
    teacher_view_title: "Teacher View",
    task_panel_title: "Current Task",
    task_panel_description: "desc",
    concepts_label: "Concepts",
    difficulty_label: "Difficulty",
    choice_label: "Choice",
    select_prompt: "Select one answer option to activate submission.",
    diagnosis_panel_description: "desc",
    detected_errors_title: "Detected Errors",
    hint_track_title: "Hint Track",
    hint_track_empty: "Hints unlock after the system detects at least one error type.",
    hint_progress: "{shown} of {total} hints revealed",
    recommended_next_title: "Recommended Next Step",
    recommended_next_empty: "Submit an attempt to see the recommended remediation question.",
    recommended_next_ready: "Next item: {question_id}",
    student_model_description: "desc",
    recent_errors_title: "Recent Error Patterns",
    recent_errors_empty: "No recurring error pattern recorded yet.",
    teacher_view_description: "desc",
    active_students: "Active students",
    tracked_concepts: "Tracked concepts",
    recent_attempts_title: "Recent Attempts",
    recent_attempts_empty: "No attempts recorded yet.",
    attempt_correct: "Correct",
    attempt_incorrect: "Incorrect",
    question_short: "Q",
    student_short: "Student",
    status_correct: "Correct. The concept scores increased.",
    status_incorrect: "Incorrect. Review the detected failure points below.",
    no_error_types: "No error types detected.",
    category: "Category",
    hint_label: "Hint",
    total_attempts: "Total attempts",
    no_error_data: "No error data yet.",
    seen_times: "Seen {count} time(s)",
    language_label: "Language",
    mastery_percent: "{percent}%",
  },
};

const question = {
  id: "q1",
  statement: "Question body",
  options: [
    { id: "A", text: "Option A" },
    { id: "B", text: "Option B" },
  ],
  correct_answer: "A",
  concepts: ["com_ratio"],
  error_map: {},
  difficulty: 1,
  next_rules: {},
};

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("/metadata")) {
        return new Response(JSON.stringify(metadata));
      }
      if (url.startsWith("/questions/q1")) {
        return new Response(JSON.stringify(question));
      }
      if (url.startsWith("/questions/q2")) {
        return new Response(JSON.stringify({ ...question, id: "q2", statement: "Second question" }));
      }
      if (url.startsWith("/next-question")) {
        return new Response(JSON.stringify({ ...question, id: "q2", statement: "Second question" }));
      }
      if (url.startsWith("/diagnose-preview")) {
        return new Response(JSON.stringify({
          attempt: {
            id: "preview-1",
            question_id: "q1",
            student_id: "demo-student",
            answer: "B",
            is_correct: false,
            detected_errors: ["ignore_reference_frame"],
            timestamp: "2026-04-19T12:00:00Z",
          },
          question,
          errors: metadata.errors,
          hints: { ignore_reference_frame: ["Hint 1", "Hint 2"] },
          student_model: {
            concept_mastery: { com_ratio: 0.42 },
            recent_errors: { ignore_reference_frame: 1 },
          },
          recommended_next_question_id: "q2",
        }));
      }
      if (url.startsWith("/stats")) {
        return new Response(JSON.stringify({
          total_attempts: 0,
          error_distribution: {},
          concept_mastery_by_student: {},
          recent_attempts: [],
        }));
      }

      return new Response("Not found", { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lets the learner move to another question and clears the draft answer", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findAllByText("Question body")).not.toHaveLength(0);

    const submitButton = screen.getByRole("button", { name: "Submit Answer" });
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Option B/i }));
    expect(submitButton).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Try Another Question" }));

    expect(await screen.findAllByText("Second question")).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "Submit Answer" })).toBeDisabled();
  });
});
