/**
 * script.js
 * -----------------------------------------------------------------------
 * Live event display logic only. There is no scoring, no answer checking,
 * and no participant data stored anywhere. The scorer evaluates answers
 * in person; this app just presents questions, code, and (on request)
 * the reference answer.
 * -----------------------------------------------------------------------
 */

(function () {
  "use strict";

  const TIMER_DEFAULT = 120; // seconds (2:00) — fallback shown in the homepage input
  const TIMER_MIN_SECONDS = 10;
  const TIMER_MAX_SECONDS = 20 * 60;
  const PREDICTION_ROUND_SECONDS = 420; // 7:00 per pair for Output Prediction round
  const CLOCK_RADIUS = 50;
  const CLOCK_CIRCUMFERENCE = 2 * Math.PI * CLOCK_RADIUS;

  // Configurable per-question timer length, set on the homepage before
  // starting the quiz. Defaults to TIMER_DEFAULT, overridden by whatever
  // the host last saved (see loadStoredTimerDuration below).
  let timerDuration = TIMER_DEFAULT;

  /* ------------------------------------------------------------------ */
  /* STATE                                                              */
  /* ------------------------------------------------------------------ */
  const state = {
    screen: "home",
    roundType: "prediction", // "prediction" | "programming" — set when a round is started
    questionIndex: 0, // 0-based index into the active question set
    answerVisible: false,
    timer: {
      remaining: timerDuration,
      running: false,
      intervalId: null,
    },
  };

  // Returns the question array for whichever round is currently active.
  function activeQuestions() {
    return state.roundType === "programming" ? programmingQuestions : predictionQuestions;
  }

  /* ------------------------------------------------------------------ */
  /* DOM REFERENCES                                                     */
  /* ------------------------------------------------------------------ */
  const screens = {
    home: document.getElementById("screen-home"),
    question: document.getElementById("screen-question"),
    quizComplete: document.getElementById("screen-quiz-complete"),
    aiSprint: document.getElementById("screen-aisprint"),
  };

  const el = {
    btnStartPrediction: document.getElementById("btn-start-prediction"),
    btnStartProgramming: document.getElementById("btn-start-programming"),
    btnStartAiSprint: document.getElementById("btn-start-aisprint"),
    btnAiSprintBack: document.getElementById("btn-aisprint-back"),

    inputTimerMin: document.getElementById("input-timer-min"),
    inputTimerSec: document.getElementById("input-timer-sec"),

    btnThemeToggle: document.getElementById("btn-theme-toggle"),
    themeIconMoon: document.getElementById("theme-icon-moon"),
    themeIconSun: document.getElementById("theme-icon-sun"),

    qBrand: document.getElementById("q-brand"),
    qhCounter: document.getElementById("qh-counter"),
    qDifficulty: document.getElementById("q-difficulty"),
    qUnit: document.getElementById("q-unit"),
    qPrompt: document.getElementById("q-prompt"),
    qNavBar: document.getElementById("q-nav-bar"),
    codeCard: document.getElementById("code-card"),
    codeFilename: document.getElementById("code-filename"),
    codeCardHint: document.getElementById("code-card-hint"),
    qCode: document.getElementById("q-code"),
    qAnswer: document.getElementById("q-answer"),
    qExplanation: document.getElementById("q-explanation"),

    rulesModal: document.getElementById("rules-modal"),
    rulesModalTitle: document.getElementById("rules-modal-title"),
    rulesModalBody: document.getElementById("rules-modal-body"),
    rulesModalCloseX: document.getElementById("rules-modal-close-x"),
    rulesModalClose: document.getElementById("rules-modal-close"),
    rulesModalStart: document.getElementById("rules-modal-start"),

    btnToggleAnswer: document.getElementById("btn-toggle-answer"),
    answerPanel: document.getElementById("answer-panel"),
    answerBlock: document.getElementById("answer-block"),
    explainBlock: document.getElementById("explain-block"),

    timerWidget: document.getElementById("timer-widget"),
    clockProgress: document.getElementById("clock-progress"),
    clockTicks: document.getElementById("clock-ticks"),
    timerDisplay: document.getElementById("timer-display"),
    timeUpFlag: document.getElementById("time-up-flag"),
    btnTimerToggle: document.getElementById("btn-timer-toggle"),
    btnTimerReset: document.getElementById("btn-timer-reset"),

    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    progressDots: document.getElementById("progress-dots"),

    btnRestart: document.getElementById("btn-restart"),
    completeSub: document.getElementById("complete-sub"),

    btnFullscreen: document.getElementById("btn-fullscreen"),
    kbdHint: document.getElementById("kbd-hint"),

    modalOverlay: document.getElementById("confirm-modal"),
    confirmText: document.getElementById("confirm-text"),
    confirmCancel: document.getElementById("confirm-cancel"),
    confirmContinue: document.getElementById("confirm-continue"),

    qBody: document.getElementById("q-body"),
    singleQuestionView: document.getElementById("single-question-view"),
    pairQuestionView: document.getElementById("pair-question-view"),

    p1Difficulty: document.getElementById("p1-difficulty"),
    p1Unit: document.getElementById("p1-unit"),
    p1Number: document.getElementById("p1-number"),
    p1Prompt: document.getElementById("p1-prompt"),
    p1Filename: document.getElementById("p1-filename"),
    p1Code: document.getElementById("p1-code"),
    p1BtnAnswer: document.getElementById("p1-btn-answer"),
    p1AnswerPanel: document.getElementById("p1-answer-panel"),
    p1Answer: document.getElementById("p1-answer"),
    p1Explanation: document.getElementById("p1-explanation"),
    p1ExplainBlock: document.getElementById("p1-explain-block"),

    p2Difficulty: document.getElementById("p2-difficulty"),
    p2Unit: document.getElementById("p2-unit"),
    p2Number: document.getElementById("p2-number"),
    p2Prompt: document.getElementById("p2-prompt"),
    p2Filename: document.getElementById("p2-filename"),
    p2Code: document.getElementById("p2-code"),
    p2BtnAnswer: document.getElementById("p2-btn-answer"),
    p2AnswerPanel: document.getElementById("p2-answer-panel"),
    p2Answer: document.getElementById("p2-answer"),
    p2Explanation: document.getElementById("p2-explanation"),
    p2ExplainBlock: document.getElementById("p2-explain-block"),
  };

  let pendingRoundType = "prediction";

  /* ------------------------------------------------------------------ */
  /* RULES MODAL POPUP                                                  */
  /* ------------------------------------------------------------------ */
  function openRulesModal(roundType) {
    pendingRoundType = roundType;
    if (roundType === "prediction") {
      if (el.inputTimerMin) el.inputTimerMin.disabled = true;
      if (el.inputTimerSec) el.inputTimerSec.disabled = true;
      el.rulesModalTitle.textContent = "Output Prediction Scoring System";
      el.rulesModalBody.innerHTML = `
        <p class="scoring-sub"><strong>Round 1 — Medium Pair (Q1, Q2)</strong> &bull; Max 7:00 total</p>
        <div class="scoring-table">
          <div class="scoring-row scoring-head">
            <span>Condition</span>
            <span>Points Awarded</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Both correct within first 3 minutes</strong>
              <span>(2 + 2 + 2 bonus)</span>
            </div>
            <span class="scoring-points">6 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Both correct within 3 to 7 minutes</strong>
              <span>(2 + 2)</span>
            </div>
            <span class="scoring-points">4 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Only one correct (any time within 7 min)</strong>
              <span>(2 + 0)</span>
            </div>
            <span class="scoring-points">2 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Otherwise / None correct</strong>
            </div>
            <span class="scoring-points">0 points</span>
          </div>
        </div>

        <p class="scoring-sub" style="margin-top: 1.25rem;"><strong>Round 2 — Hard Pair (Q3, Q4)</strong> &bull; Max 7:00 total</p>
        <div class="scoring-table">
          <div class="scoring-row scoring-head">
            <span>Condition</span>
            <span>Points Awarded</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Both correct within first 3 minutes</strong>
              <span>(3 + 3 + 4 bonus)</span>
            </div>
            <span class="scoring-points">10 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Both correct within 3 to 7 minutes</strong>
              <span>(3 + 3)</span>
            </div>
            <span class="scoring-points">6 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Only one correct (any time within 7 min)</strong>
              <span>(3 + 0)</span>
            </div>
            <span class="scoring-points">3 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Otherwise / None correct</strong>
            </div>
            <span class="scoring-points">0 points</span>
          </div>
        </div>
      `;
    } else {
      if (el.inputTimerMin) el.inputTimerMin.disabled = false;
      if (el.inputTimerSec) el.inputTimerSec.disabled = false;
      el.rulesModalTitle.textContent = "Programming Round Scoring System";
      el.rulesModalBody.innerHTML = `
        <p class="scoring-sub">Maximum score for each programming question is 10 points.</p>
        <div class="scoring-table">
          <div class="scoring-row scoring-head">
            <span>Category &amp; Criteria</span>
            <span>Points Awarded</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Correctness and Test Case Passing</strong>
              <span>Logic correctly solves standard inputs: 3 points<br>Correctly handles edge cases: 2 points</span>
            </div>
            <span class="scoring-points">5 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Time Management</strong>
              <span>Finished within 0–5 minutes: 3 points<br>Finished within 5–8 minutes: 2 points<br>Finished within 8–10 minutes: 1 point</span>
            </div>
            <span class="scoring-points">3 points</span>
          </div>
          <div class="scoring-row">
            <div class="scoring-condition">
              <strong>Code Quality and Readability</strong>
              <span>Good variable/naming conventions: 1 point<br>Clean structure, indentation, and formatting: 1 point</span>
            </div>
            <span class="scoring-points">2 points</span>
          </div>
        </div>
      `;
    }
    el.rulesModal.classList.remove("hidden");
  }

  function closeRulesModal() {
    el.rulesModal.classList.add("hidden");
  }

  el.btnStartPrediction.addEventListener("click", () => openRulesModal("prediction"));
  el.btnStartProgramming.addEventListener("click", () => openRulesModal("programming"));
  if (el.btnStartAiSprint) el.btnStartAiSprint.addEventListener("click", () => startRound("aisprint"));
  if (el.btnAiSprintBack) el.btnAiSprintBack.addEventListener("click", goHome);
  if (el.rulesModalCloseX) el.rulesModalCloseX.addEventListener("click", closeRulesModal);
  if (el.rulesModalClose) el.rulesModalClose.addEventListener("click", closeRulesModal);
  if (el.rulesModalStart) {
    el.rulesModalStart.addEventListener("click", () => {
      closeRulesModal();
      startRound(pendingRoundType);
    });
  }
  if (el.rulesModal) {
    el.rulesModal.addEventListener("click", (e) => {
      if (e.target === el.rulesModal) closeRulesModal();
    });
  }

  /* ------------------------------------------------------------------ */
  /* SCREEN SWITCHING                                                   */
  /* ------------------------------------------------------------------ */
  function showScreen(name) {
    Object.values(screens).forEach((s) => {
      if (s) s.classList.remove("active");
    });
    if (screens[name]) screens[name].classList.add("active");
    state.screen = name;

    const onQuestion = name === "question";
    el.kbdHint.classList.toggle("visible", onQuestion);
    el.timerWidget.classList.toggle("visible", onQuestion);
  }

  /* ------------------------------------------------------------------ */
  /* HOME → QUESTIONS                                                   */
  /* ------------------------------------------------------------------ */
  function goHome() {
    state.questionIndex = 0;
    showScreen("home");
  }

  function startRound(roundType) {
    state.roundType = roundType;
    state.questionIndex = 0;

    if (roundType === "aisprint") {
      showScreen("aiSprint");
      return;
    }

    if (roundType === "prediction") {
      timerDuration = PREDICTION_ROUND_SECONDS;
    } else if (roundType === "programming") {
      timerDuration = 600; // 10-minute time limit for programming questions
    }

    renderQuestion();
    showScreen("question");
  }

  /* ------------------------------------------------------------------ */
  /* LIGHTWEIGHT C SYNTAX HIGHLIGHTING                                  */
  /* (visual only — never changes the underlying code/text)             */
  /* ------------------------------------------------------------------ */
  const KEYWORDS = new Set([
    "if", "else", "for", "while", "do", "switch", "case", "break",
    "continue", "return", "struct", "typedef", "sizeof", "default",
    "goto", "static", "const", "void",
  ]);
  const TYPES = new Set([
    "int", "char", "float", "double", "long", "short", "unsigned",
    "signed", "FILE",
  ]);

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightC(code) {
    const escaped = escapeHtml(code);
    const tokenPattern =
      /(#include\s*<[^>]*>|#\w+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\/\/[^\n]*)|(\b\d+\.?\d*\b)|(\b[A-Za-z_]\w*\b)(?=\s*\()|(\b[A-Za-z_]\w*\b)/g;

    return escaped.replace(
      tokenPattern,
      (match, preproc, str, comment, num, fnCall, word) => {
        if (preproc) return `<span class="tok-pre">${preproc}</span>`;
        if (str) return `<span class="tok-str">${str}</span>`;
        if (comment) return `<span class="tok-com">${comment}</span>`;
        if (num) return `<span class="tok-num">${num}</span>`;
        if (fnCall) return `<span class="tok-fn">${fnCall}</span>`;
        if (word) {
          if (KEYWORDS.has(word)) return `<span class="tok-kw">${word}</span>`;
          if (TYPES.has(word)) return `<span class="tok-type">${word}</span>`;
          return word;
        }
        return match;
      }
    );
  }

  /* ------------------------------------------------------------------ */
  /* QUESTION RENDERING                                                 */
  /* ------------------------------------------------------------------ */
  let p1AnswerVisible = false;
  let p2AnswerVisible = false;

  function setP1AnswerVisible(vis) {
    p1AnswerVisible = vis;
    if (el.p1AnswerPanel) el.p1AnswerPanel.classList.toggle("hidden", !vis);
    if (el.p1BtnAnswer) el.p1BtnAnswer.textContent = vis ? "Hide Answer" : "Show Answer";
  }

  function setP2AnswerVisible(vis) {
    p2AnswerVisible = vis;
    if (el.p2AnswerPanel) el.p2AnswerPanel.classList.toggle("hidden", !vis);
    if (el.p2BtnAnswer) el.p2BtnAnswer.textContent = vis ? "Hide Answer" : "Show Answer";
  }

  function toggleP1Answer() {
    setP1AnswerVisible(!p1AnswerVisible);
  }

  function toggleP2Answer() {
    setP2AnswerVisible(!p2AnswerVisible);
  }

  if (el.p1BtnAnswer) el.p1BtnAnswer.addEventListener("click", toggleP1Answer);
  if (el.p2BtnAnswer) el.p2BtnAnswer.addEventListener("click", toggleP2Answer);

  function renderPredictionPair() {
    const pairIdx = state.questionIndex; // 0 or 1
    const totalPairs = 2;
    const qA = predictionQuestions[pairIdx * 2];
    const qB = predictionQuestions[pairIdx * 2 + 1];
    const qANum = pairIdx * 2 + 1;
    const qBNum = pairIdx * 2 + 2;

    timerDuration = PREDICTION_ROUND_SECONDS; // 420 (7:00)

    el.qBrand.textContent = "Output Prediction";
    el.qhCounter.textContent = `Round ${pairIdx + 1} / ${totalPairs} (Q ${qANum} & ${qBNum})`;

    if (el.qBody) el.qBody.classList.add("paired-view");
    if (el.singleQuestionView) el.singleQuestionView.classList.add("hidden");
    if (el.pairQuestionView) el.pairQuestionView.classList.remove("hidden");

    // Populate Card 1
    if (el.p1Difficulty && qA) {
      el.p1Difficulty.textContent = qA.difficulty;
      el.p1Difficulty.className = "badge " + qA.difficulty.toLowerCase().replace(/[^a-z]/g, "");
    }
    if (el.p1Unit && qA) el.p1Unit.textContent = qA.unit;
    if (el.p1Number) el.p1Number.textContent = `Question ${qANum}`;
    if (el.p1Prompt && qA) el.p1Prompt.innerHTML = qA.question;
    if (el.p1Filename) el.p1Filename.textContent = `program_${qANum}.c`;
    if (el.p1Code && qA) el.p1Code.innerHTML = highlightC(qA.code);
    if (el.p1Answer && qA) el.p1Answer.textContent = qA.answer;
    if (el.p1Explanation && qA) {
      el.p1Explanation.textContent = qA.explanation;
      if (el.p1ExplainBlock) el.p1ExplainBlock.classList.remove("hidden");
    } else if (el.p1ExplainBlock) {
      el.p1ExplainBlock.classList.add("hidden");
    }

    // Populate Card 2
    if (el.p2Difficulty && qB) {
      el.p2Difficulty.textContent = qB.difficulty;
      el.p2Difficulty.className = "badge " + qB.difficulty.toLowerCase().replace(/[^a-z]/g, "");
    }
    if (el.p2Unit && qB) el.p2Unit.textContent = qB.unit;
    if (el.p2Number) el.p2Number.textContent = `Question ${qBNum}`;
    if (el.p2Prompt && qB) el.p2Prompt.innerHTML = qB.question;
    if (el.p2Filename) el.p2Filename.textContent = `program_${qBNum}.c`;
    if (el.p2Code && qB) el.p2Code.innerHTML = highlightC(qB.code);
    if (el.p2Answer && qB) el.p2Answer.textContent = qB.answer;
    if (el.p2Explanation && qB) {
      el.p2Explanation.textContent = qB.explanation;
      if (el.p2ExplainBlock) el.p2ExplainBlock.classList.remove("hidden");
    } else if (el.p2ExplainBlock) {
      el.p2ExplainBlock.classList.add("hidden");
    }

    // Reset answer visibility
    setP1AnswerVisible(false);
    setP2AnswerVisible(false);

    // Reset 7-minute timer for this pair
    resetTimer();

    // Nav bar & dots
    renderPredictionNavBar();
    renderPredictionDots(totalPairs);

    el.btnPrev.disabled = pairIdx === 0;
    el.btnNext.textContent = pairIdx === totalPairs - 1 ? "Finish Quiz" : "Next →";
  }

  function renderPredictionNavBar() {
    if (!el.qNavBar) return;
    el.qNavBar.innerHTML = "";

    const pairs = [
      { name: "Round 1 (Q1 & Q2)", index: 0 },
      { name: "Round 2 (Q3 & Q4)", index: 1 },
    ];

    pairs.forEach((pair, idx) => {
      if (idx > 0) {
        const sep = document.createElement("span");
        sep.className = "q-nav-sep";
        sep.textContent = "|";
        el.qNavBar.appendChild(sep);
      }

      const btn = document.createElement("button");
      btn.className = "q-nav-btn";
      if (idx === state.questionIndex) {
        btn.classList.add("active");
      }
      btn.textContent = pair.name;
      btn.addEventListener("click", () => {
        state.questionIndex = idx;
        renderQuestion();
      });
      el.qNavBar.appendChild(btn);
    });
  }

  function renderPredictionDots(total) {
    el.progressDots.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.className = "pd";
      if (i < state.questionIndex) dot.classList.add("done");
      if (i === state.questionIndex) dot.classList.add("current");
      el.progressDots.appendChild(dot);
    }
  }

  function renderQuestion() {
    if (state.roundType === "prediction") {
      renderPredictionPair();
      return;
    }

    if (el.qBody) el.qBody.classList.remove("paired-view");
    if (el.pairQuestionView) el.pairQuestionView.classList.add("hidden");
    if (el.singleQuestionView) el.singleQuestionView.classList.remove("hidden");

    const isProgramming = state.roundType === "programming";
    const questions = activeQuestions();
    const total = questions.length;
    const q = questions[state.questionIndex];

    timerDuration = 600; // Ensure 10-minute limit per programming question

    el.qBrand.textContent = "Programming Round";
    el.qhCounter.textContent = `Q ${state.questionIndex + 1} / ${total}`;

    // Difficulty badge.
    if (q.difficulty) {
      el.qDifficulty.textContent = q.difficulty;
      el.qDifficulty.className = "badge " + q.difficulty.toLowerCase().replace(/[^a-z]/g, "");
      el.qDifficulty.classList.remove("hidden");
    } else {
      el.qDifficulty.classList.add("hidden");
    }

    // Unit label / Problem title.
    if (q.unit) {
      el.qUnit.textContent = q.unit;
      el.qUnit.classList.remove("hidden");
    } else if (q.title) {
      el.qUnit.textContent = q.title;
      el.qUnit.classList.remove("hidden");
    } else {
      el.qUnit.classList.add("hidden");
    }

    el.qPrompt.innerHTML = q.question;
    el.qCode.innerHTML = highlightC(q.code);
    el.codeFilename.textContent = "solution.c";

    // Programming Round: keep the solution code hidden until "Reveal Answer" is clicked.
    el.codeCard.classList.toggle("hidden", isProgramming);
    el.codeCardHint.classList.toggle("hidden", !isProgramming);
    if (isProgramming) {
      el.codeCardHint.textContent = "Solve the question — click Reveal Answer to display the model C solution.";
    }

    el.answerBlock.classList.toggle("hidden", isProgramming);
    if (q.explanation) {
      el.qExplanation.textContent = q.explanation;
      el.explainBlock.classList.remove("hidden");
    } else {
      el.explainBlock.classList.add("hidden");
    }

    // Question number navigation.
    renderQuestionNumberNav();

    // Answer always hidden on entering a new question.
    setAnswerVisible(false);

    // Timer resets every question for programming round
    resetTimer();

    // Nav button states.
    el.btnPrev.disabled = state.questionIndex === 0;
    el.btnNext.textContent =
      state.questionIndex === total - 1 ? "Finish Quiz" : "Next →";

    renderProgressDots(total);
  }

  function renderQuestionNumberNav() {
    if (!el.qNavBar) return;
    const questions = activeQuestions();
    const total = questions.length;
    el.qNavBar.innerHTML = "";

    for (let i = 0; i < total; i++) {
      if (i > 0) {
        const sep = document.createElement("span");
        sep.className = "q-nav-sep";
        sep.textContent = "|";
        el.qNavBar.appendChild(sep);
      }

      const btn = document.createElement("button");
      btn.className = "q-nav-btn";
      if (i === state.questionIndex) {
        btn.classList.add("active");
      }
      btn.textContent = `Question ${i + 1}`;
      btn.addEventListener("click", () => {
        state.questionIndex = i;
        renderQuestion();
      });
      el.qNavBar.appendChild(btn);
    }
  }

  function renderProgressDots(total) {
    el.progressDots.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.className = "pd";
      if (i > 0 && i % 3 === 0) dot.classList.add("group-start");
      if (i < state.questionIndex) dot.classList.add("done");
      if (i === state.questionIndex) dot.classList.add("current");
      el.progressDots.appendChild(dot);
    }
  }

  /* ------------------------------------------------------------------ */
  /* ANSWER REVEAL (display only — never scored, never stored)          */
  /* ------------------------------------------------------------------ */
  function setAnswerVisible(visible) {
    state.answerVisible = visible;
    el.answerPanel.classList.toggle("hidden", !visible);
    const defaultText = state.roundType === "programming" ? "Reveal Answer" : "Show Answer";
    el.btnToggleAnswer.textContent = visible ? "Hide Answer" : defaultText;

    // Programming Round: the model-answer code card doubles as the answer reveal.
    if (state.roundType === "programming") {
      el.codeCard.classList.toggle("hidden", !visible);
      el.codeCardHint.classList.toggle("hidden", visible);
    }
  }

  function toggleAnswer() {
    if (state.roundType === "prediction") {
      const anyVisible = p1AnswerVisible || p2AnswerVisible;
      setP1AnswerVisible(!anyVisible);
      setP2AnswerVisible(!anyVisible);
    } else {
      setAnswerVisible(!state.answerVisible);
    }
  }

  el.btnToggleAnswer.addEventListener("click", toggleAnswer);

  /* ------------------------------------------------------------------ */
  /* NAVIGATION                                                         */
  /* ------------------------------------------------------------------ */
  function goNext() {
    if (state.roundType === "prediction") {
      const totalPairs = 2;
      const isLast = state.questionIndex === totalPairs - 1;
      if (isLast) {
        askFinishQuiz();
        return;
      }
      state.questionIndex += 1;
      renderQuestion();
    } else {
      const isLast = state.questionIndex === activeQuestions().length - 1;
      if (isLast) {
        askFinishQuiz();
        return;
      }
      state.questionIndex += 1;
      renderQuestion();
    }
  }

  function goPrev() {
    if (state.questionIndex === 0) return;
    state.questionIndex -= 1;
    renderQuestion();
  }

  el.btnNext.addEventListener("click", goNext);
  el.btnPrev.addEventListener("click", goPrev);

  /* ------------------------------------------------------------------ */
  /* FINISH QUIZ                                                        */
  /* ------------------------------------------------------------------ */
  function askFinishQuiz() {
    el.confirmText.textContent = "Finish the quiz?";
    openModal();
  }

  function completeQuiz() {
    pauseTimer();
    const total = activeQuestions().length;
    const roundName = state.roundType === "programming" ? "Programming Round" : "Output Prediction";
    el.completeSub.textContent = `All ${total} ${roundName} questions have been presented. Scoring is handled by the scorer.`;
    showScreen("quizComplete");
  }

  el.btnRestart.addEventListener("click", goHome);

  /* ------------------------------------------------------------------ */
  /* CONFIRM MODAL                                                      */
  /* ------------------------------------------------------------------ */
  function openModal() {
    el.modalOverlay.classList.remove("hidden");
  }
  function closeModal() {
    el.modalOverlay.classList.add("hidden");
  }
  el.confirmCancel.addEventListener("click", closeModal);
  el.confirmContinue.addEventListener("click", () => {
    closeModal();
    completeQuiz();
  });
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) closeModal();
  });

  /* ------------------------------------------------------------------ */
  /* CLOCK TIMER — visual countdown only. Never navigates, scores, or   */
  /* submits anything. Positioned on the right side of the screen as a  */
  /* clock face with a depleting progress ring.                        */
  /* ------------------------------------------------------------------ */
  function buildClockTicks() {
    // 12 tick marks, like a clock face, drawn once at startup.
    const ns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const isMajor = i % 3 === 0;
      const rOuter = 50;
      const rInner = isMajor ? 43 : 46;
      const x1 = 60 + rOuter * Math.sin(angle);
      const y1 = 60 - rOuter * Math.cos(angle);
      const x2 = 60 + rInner * Math.sin(angle);
      const y2 = 60 - rInner * Math.cos(angle);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", x1.toFixed(2));
      line.setAttribute("y1", y1.toFixed(2));
      line.setAttribute("x2", x2.toFixed(2));
      line.setAttribute("y2", y2.toFixed(2));
      line.setAttribute("class", isMajor ? "tick tick-major" : "tick");
      el.clockTicks.appendChild(line);
    }
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function renderTimer() {
    el.timerDisplay.textContent = formatTime(state.timer.remaining);

    const fraction = state.timer.remaining / timerDuration;
    const offset = CLOCK_CIRCUMFERENCE * (1 - fraction);
    el.clockProgress.style.strokeDashoffset = offset.toFixed(2);

    const low = state.timer.remaining <= 10 && state.timer.remaining > 0;
    const done = state.timer.remaining <= 0;
    el.timerDisplay.classList.toggle("low", low);
    el.clockProgress.classList.toggle("low", low || done);
    el.timeUpFlag.classList.toggle("hidden", !done);
    el.btnTimerToggle.textContent = state.timer.running ? "Pause" : "Start";
    el.btnTimerToggle.disabled = done;
  }

  function startTimer() {
    if (state.timer.running || state.timer.remaining <= 0) return;
    state.timer.running = true;
    state.timer.intervalId = setInterval(() => {
      if (state.timer.remaining > 0) {
        state.timer.remaining -= 1;
        renderTimer();
      }
      if (state.timer.remaining <= 0) {
        pauseTimer(); // stop ticking at 00:00 — host decides what happens next
      }
    }, 1000);
    renderTimer();
  }

  function pauseTimer() {
    state.timer.running = false;
    if (state.timer.intervalId) {
      clearInterval(state.timer.intervalId);
      state.timer.intervalId = null;
    }
    renderTimer();
  }

  function toggleTimer() {
    if (state.timer.running) pauseTimer();
    else startTimer();
  }

  function resetTimer() {
    pauseTimer();
    state.timer.remaining = timerDuration;
    renderTimer();
  }

  el.btnTimerToggle.addEventListener("click", toggleTimer);
  el.btnTimerReset.addEventListener("click", resetTimer);

  /* ------------------------------------------------------------------ */
  /* HOMEPAGE — EDITABLE TIMER DURATION                                 */
  /* Sets how long the per-question countdown starts at. Saved to       */
  /* localStorage so it's remembered next time the host opens the page. */
  /* ------------------------------------------------------------------ */
  function clampTimerDuration(seconds) {
    if (Number.isNaN(seconds)) return timerDuration;
    return Math.min(TIMER_MAX_SECONDS, Math.max(TIMER_MIN_SECONDS, seconds));
  }

  function applyTimerDurationToInputs() {
    el.inputTimerMin.value = Math.floor(timerDuration / 60);
    el.inputTimerSec.value = timerDuration % 60;
  }

  function setTimerDurationFromInputs() {
    const min = parseInt(el.inputTimerMin.value, 10) || 0;
    const sec = parseInt(el.inputTimerSec.value, 10) || 0;
    timerDuration = clampTimerDuration(min * 60 + sec);
    applyTimerDurationToInputs(); // normalize (e.g. 90s typed into seconds -> 1:30)
    try {
      localStorage.setItem("quiz-timer-duration", String(timerDuration));
    } catch (e) {}
  }

  function loadStoredTimerDuration() {
    try {
      const stored = localStorage.getItem("quiz-timer-duration");
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed)) timerDuration = clampTimerDuration(parsed);
      }
    } catch (e) {}
  }

  el.inputTimerMin.addEventListener("change", setTimerDurationFromInputs);
  el.inputTimerSec.addEventListener("change", setTimerDurationFromInputs);

  /* ------------------------------------------------------------------ */
  /* NIGHT MODE TOGGLE                                                  */
  /* ------------------------------------------------------------------ */
  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", theme === "light" ? "#F4F6FB" : "#0A0E17");
    el.themeIconMoon.style.display = theme === "light" ? "none" : "block";
    el.themeIconSun.style.display = theme === "light" ? "block" : "none";
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("quiz-theme", next);
    } catch (e) {}
  }

  el.btnThemeToggle.addEventListener("click", toggleTheme);

  /* ------------------------------------------------------------------ */
  /* FULLSCREEN                                                         */
  /* ------------------------------------------------------------------ */
  function toggleFullscreen() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFs) {
      const req = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
      if (req) req.call(document.documentElement);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  }
  el.btnFullscreen.addEventListener("click", toggleFullscreen);

  // Track fullscreen state via a body class rather than relying purely on
  // the :fullscreen pseudo-class, since the element that actually goes
  // fullscreen (<html>) is not the element most CSS here needs to target.
  function syncFullscreenClass() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.body.classList.toggle("is-fullscreen", isFs);
  }
  document.addEventListener("fullscreenchange", syncFullscreenClass);
  document.addEventListener("webkitfullscreenchange", syncFullscreenClass);

  /* ------------------------------------------------------------------ */
  /* KEYBOARD CONTROLS (question screen only)                           */
  /* ------------------------------------------------------------------ */
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
    if (state.screen !== "question") return;
    if (!el.modalOverlay.classList.contains("hidden")) return; // modal open: don't navigate underneath

    switch (e.key) {
      case "ArrowRight":
      case " ":
        e.preventDefault();
        goNext();
        break;
      case "ArrowLeft":
        e.preventDefault();
        goPrev();
        break;
      case "a":
      case "A":
        toggleAnswer();
        break;
      case "t":
      case "T":
        toggleTimer();
        break;
      case "r":
      case "R":
        resetTimer();
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        break;
    }
  });

  /* ------------------------------------------------------------------ */
  /* CONSOLE CREDIT                                                     */
  /* ------------------------------------------------------------------ */
  console.log(
    "%cMade by Farooq",
    "color:#4FD8C4; font-size:20px; font-weight:700; font-family:ui-sans-serif,sans-serif; padding:4px 0;"
  );
  console.log(
    "%cTechnical Quiz — Output Prediction Challenge",
    "color:#93A0B8; font-size:12px; font-family:ui-sans-serif,sans-serif;"
  );

  /* ------------------------------------------------------------------ */
  /* INIT — always starts fresh at Home. No data is persisted across    */
  /* refreshes because no scores or participant answers are ever saved. */
  /* ------------------------------------------------------------------ */
  el.clockProgress.style.strokeDasharray = CLOCK_CIRCUMFERENCE.toFixed(2);
  buildClockTicks();
  loadStoredTimerDuration();
  applyTimerDurationToInputs();
  resetTimer(); // seeds state.timer.remaining from the loaded/default duration
  applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  showScreen("home");
})();
