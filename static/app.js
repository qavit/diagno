const state = {
  currentQuestionId: "q1",
  selectedAnswer: null,
  diagnosis: null,
  hintCursor: 0,
  flatHints: [],
  metadata: null,
  lang: "en",
};

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadMetadata() {
  state.metadata = await fetchJson(`/metadata?lang=${encodeURIComponent(state.lang)}`);
}

async function loadQuestion(questionId) {
  const question = await fetchJson(`/questions/${questionId}?lang=${encodeURIComponent(state.lang)}`);
  state.currentQuestionId = question.id;
  state.selectedAnswer = null;
  state.diagnosis = null;
  state.hintCursor = 0;
  state.flatHints = [];
  renderQuestion(question);
  renderDiagnosis();
}

function renderQuestion(question) {
  document.documentElement.lang = state.lang;
  document.getElementById("question-tag").textContent = `${t("question_label")} ${question.id.toUpperCase()}`;
  document.getElementById("question-title").textContent = question.statement;
  const optionsContainer = document.getElementById("question-options");
  optionsContainer.innerHTML = "";

  (question.options || []).forEach((option) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = `${option.id}. ${option.text}`;
    button.onclick = () => {
      state.selectedAnswer = option.id;
      [...optionsContainer.children].forEach((node) => node.classList.remove("selected"));
      button.classList.add("selected");
    };
    optionsContainer.appendChild(button);
  });
}

function renderDiagnosis() {
  const resultStatus = document.getElementById("result-status");
  const errorList = document.getElementById("error-list");
  const hintBox = document.getElementById("hint-box");
  const hintButton = document.getElementById("show-hint");

  if (!state.diagnosis) {
    resultStatus.className = "result-card muted";
    resultStatus.textContent = t("diagnosis_idle");
    errorList.innerHTML = "";
    hintBox.innerHTML = "";
    hintButton.disabled = true;
    return;
  }

  const { attempt, errors, student_model } = state.diagnosis;
  resultStatus.className = `result-card ${attempt.is_correct ? "success" : "error"}`;
  resultStatus.textContent = attempt.is_correct
    ? t("status_correct")
    : t("status_incorrect");

  errorList.innerHTML = "";
  if (errors.length === 0) {
    const ok = document.createElement("div");
    ok.className = "pill";
    ok.textContent = t("no_error_types");
    errorList.appendChild(ok);
  } else {
    errors.forEach((error) => {
      const item = document.createElement("div");
      item.className = "stat-card";
      item.innerHTML = `<strong>${error.name}</strong><br>${error.description}<br><small>${t("category")}: ${error.category}</small>`;
      errorList.appendChild(item);
    });
  }

  hintBox.innerHTML = "";
  state.flatHints.slice(0, state.hintCursor).forEach((hint) => {
    const card = document.createElement("div");
    card.className = "hint-card";
    card.textContent = hint;
    hintBox.appendChild(card);
  });
  hintButton.disabled = state.flatHints.length === 0 || state.hintCursor >= state.flatHints.length;

  renderStudentModel(student_model);
  refreshStats();
}

function renderStudentModel(studentModel) {
  const masteryList = document.getElementById("mastery-list");
  masteryList.innerHTML = "";

  Object.entries(studentModel.concept_mastery).forEach(([conceptId, score]) => {
    const row = document.createElement("div");
    row.className = "mastery-row";
    const label = document.createElement("div");
    label.innerHTML = `<strong>${conceptLabel(conceptId)}</strong><br><small>${t("mastery_percent", { percent: Math.round(score * 100) })}</small>`;
    const bar = document.createElement("div");
    bar.className = "mastery-bar";
    const fill = document.createElement("div");
    fill.className = "mastery-fill";
    fill.style.width = `${Math.round(score * 100)}%`;
    bar.appendChild(fill);
    row.appendChild(label);
    row.appendChild(bar);
    masteryList.appendChild(row);
  });
}

function conceptLabel(conceptId) {
  const concept = state.metadata.concepts.find((item) => item.id === conceptId);
  return concept ? concept.name : conceptId;
}

async function submitAnswer() {
  if (!state.selectedAnswer) {
    return;
  }
  const studentId = document.getElementById("student-id").value || "demo-student";
  const payload = {
    question_id: state.currentQuestionId,
    student_id: studentId,
    answer: state.selectedAnswer,
  };
  state.diagnosis = await fetchJson(`/attempt?lang=${encodeURIComponent(state.lang)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  state.flatHints = state.diagnosis.errors.flatMap((error) =>
    error.hint_levels.map((hint, index) => `${error.name} - ${t("hint_label")} ${index + 1}: ${hint}`)
  );
  state.hintCursor = 0;
  renderDiagnosis();
}

function showNextHint() {
  if (state.hintCursor < state.flatHints.length) {
    state.hintCursor += 1;
    renderDiagnosis();
  }
}

async function goToNextQuestion() {
  let questionId = "q1";
  if (state.diagnosis && state.diagnosis.errors.length > 0) {
    const next = await fetchJson(
      `/next-question?error_type=${encodeURIComponent(state.diagnosis.errors[0].id)}&current_question_id=${encodeURIComponent(state.currentQuestionId)}`
      + `&lang=${encodeURIComponent(state.lang)}`
    );
    questionId = next.id;
  } else if (state.diagnosis?.recommended_next_question_id) {
    questionId = state.diagnosis.recommended_next_question_id;
  } else {
    const next = await fetchJson(`/next-question?current_question_id=${encodeURIComponent(state.currentQuestionId)}&lang=${encodeURIComponent(state.lang)}`);
    questionId = next.id;
  }
  await loadQuestion(questionId);
}

async function refreshStats() {
  const stats = await fetchJson("/stats");
  const statsSummary = document.getElementById("stats-summary");
  const statsErrors = document.getElementById("stats-errors");
  statsSummary.innerHTML = `
    <div class="stat-card"><strong>${t("total_attempts")}</strong><br>${stats.total_attempts}</div>
  `;
  statsErrors.innerHTML = "";

  const entries = Object.entries(stats.error_distribution);
  if (entries.length === 0) {
    statsErrors.innerHTML = `<div class="stat-card">${t("no_error_data")}</div>`;
    return;
  }

  entries
    .sort((a, b) => b[1] - a[1])
    .forEach(([errorId, count]) => {
      const error = state.metadata.errors.find((item) => item.id === errorId);
      const card = document.createElement("div");
      card.className = "stat-card";
      card.innerHTML = `<strong>${error ? error.name : errorId}</strong><br>${t("seen_times", { count })}`;
      statsErrors.appendChild(card);
    });
}

function t(key, params = {}) {
  const template = state.metadata?.ui?.[key] ?? key;
  return Object.entries(params).reduce(
    (value, [paramKey, paramValue]) => value.replace(`{${paramKey}}`, String(paramValue)),
    template
  );
}

function applyChromeTranslations() {
  document.title = t("app_title");
  document.getElementById("hero-eyebrow").textContent = t("hero_eyebrow");
  document.getElementById("hero-title").textContent = t("hero_title");
  document.getElementById("hero-description").textContent = t("hero_description");
  document.getElementById("language-label").textContent = t("language_label");
  document.getElementById("student-label").textContent = t("student_label");
  document.getElementById("next-question").textContent = t("next_question");
  document.getElementById("submit-answer").textContent = t("submit_answer");
  document.getElementById("diagnosis-title").textContent = t("diagnosis_title");
  document.getElementById("show-hint").textContent = t("show_next_hint");
  document.getElementById("student-model-title").textContent = t("student_model_title");
  document.getElementById("teacher-view-title").textContent = t("teacher_view_title");
}

async function changeLanguage(lang) {
  state.lang = lang;
  await loadMetadata();
  applyChromeTranslations();
  await loadQuestion(state.currentQuestionId);
  await refreshStats();
}

document.getElementById("submit-answer").addEventListener("click", submitAnswer);
document.getElementById("show-hint").addEventListener("click", showNextHint);
document.getElementById("next-question").addEventListener("click", goToNextQuestion);
document.getElementById("language-select").addEventListener("change", async (event) => {
  await changeLanguage(event.target.value);
});

async function boot() {
  await loadMetadata();
  applyChromeTranslations();
  await loadQuestion("q1");
  await refreshStats();
}

boot();
