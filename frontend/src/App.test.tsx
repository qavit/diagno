import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

const metadata = {
  concepts: [{ id: "com_ratio", name: "Center of mass distance relation", description: "desc" }],
  errors: [{ id: "ignore_reference_frame", name: "Ignored the reference frame", description: "desc", category: "reading", hint_levels: ["Hint 1", "Hint 2"] }],
  question_ids: ["q1"],
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
    loading: "Loading...",
    submit_answer: "Submit Answer",
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

const diagnosis = {
  attempt: {
    id: "1",
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
  recommended_next_question_id: "q7",
};

describe("App", () => {
  beforeEach(() => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("/metadata")) {
        return new Response(JSON.stringify(metadata));
      }
      if (url.startsWith("/questions/q1")) {
        return new Response(JSON.stringify(question));
      }
      if (url.startsWith("/stats")) {
        return new Response(JSON.stringify({
          total_attempts: 1,
          error_distribution: { ignore_reference_frame: 1 },
          concept_mastery_by_student: { "demo-student": diagnosis.student_model },
          recent_attempts: [diagnosis.attempt],
        }));
      }
      if (url.startsWith("/attempt")) {
        return new Response(JSON.stringify(diagnosis));
      }
      if (url.startsWith("/questions/q7")) {
        return new Response(JSON.stringify({ ...question, id: "q7" }));
      }
      if (url.startsWith("/next-question")) {
        return new Response(JSON.stringify({ ...question, id: "q7" }));
      }
      return new Response("Not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders question flow and enables submission after selection", async () => {
    render(<App />);

    await screen.findByText("Question body");
    const submit = screen.getByRole("button", { name: "Submit Answer" });
    expect(submit).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /Option B/i }));
    expect(submit).toBeEnabled();

    await userEvent.click(submit);
    await screen.findByText("Next item: Q7");
    expect(screen.getByText("Next item: Q7")).toBeInTheDocument();
  });

  it("reveals hints progressively", async () => {
    render(<App />);
    await screen.findByText("Question body");
    await userEvent.click(screen.getByRole("button", { name: /Option B/i }));
    await userEvent.click(screen.getByRole("button", { name: "Submit Answer" }));

    const hintButton = await screen.findByRole("button", { name: "Show Next Hint" });
    await userEvent.click(hintButton);

    await waitFor(() => {
      expect(screen.getByText("Ignored the reference frame - Hint 1: Hint 1")).toBeInTheDocument();
    });
  });
});
