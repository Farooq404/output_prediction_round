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
  };

  const el = {
    btnStartPrediction: document.getElementById("btn-start-prediction"),
    btnStartProgramming: document.getElementById("btn-start-programming"),

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
    codeCard: document.getElementById("code-card"),
    codeFilename: document.getElementById("code-filename"),
    codeCardHint: document.getElementById("code-card-hint"),
    qCode: document.getElementById("q-code"),
    qAnswer: document.getElementById("q-answer"),
    qExplanation: document.getElementById("q-explanation"),

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
  };

  /* ------------------------------------------------------------------ */
  /* SCREEN SWITCHING                                                   */
  /* ------------------------------------------------------------------ */
  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
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
    renderQuestion();
    showScreen("question");
  }

  el.btnStartPrediction.addEventListener("click", () => startRound("prediction"));
  el.btnStartProgramming.addEventListener("click", () => startRound("programming"));

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
  function renderQuestion() {
    const isProgramming = state.roundType === "programming";
    const questions = activeQuestions();
    const total = questions.length;
    const q = questions[state.questionIndex];

    el.qBrand.textContent = isProgramming ? "Programming Round" : "Output Prediction";
    el.qhCounter.textContent = `Q ${state.questionIndex + 1} / ${total}`;

    // Difficulty badge only exists for the Output Prediction round.
    if (q.difficulty) {
      el.qDifficulty.textContent = q.difficulty;
      el.qDifficulty.className = "badge " + q.difficulty.toLowerCase();
      el.qDifficulty.classList.remove("hidden");
    } else {
      el.qDifficulty.classList.add("hidden");
    }

    // Unit label only exists for the Output Prediction round; the
    // Programming Round shows the problem title in its place instead.
    if (q.unit) {
      el.qUnit.textContent = q.unit;
      el.qUnit.classList.remove("hidden");
    } else if (q.title) {
      el.qUnit.textContent = q.title;
      el.qUnit.classList.remove("hidden");
    } else {
      el.qUnit.classList.add("hidden");
    }

    el.qPrompt.textContent = q.question;
    el.qCode.innerHTML = highlightC(q.code);
    el.codeFilename.textContent = isProgramming ? "solution.c" : "program.c";

    // Programming Round: keep the code (model answer) hidden until the
    // host reveals it, so it doesn't give the solution away up front.
    el.codeCard.classList.toggle("hidden", isProgramming);
    el.codeCardHint.classList.toggle("hidden", !isProgramming);

    // Output Prediction has a short "Correct Output" answer; the
    // Programming Round's answer IS the revealed code, so that block
    // (and any explanation, when present) is only shown for prediction.
    el.answerBlock.classList.toggle("hidden", isProgramming);
    if (!isProgramming) {
      el.qAnswer.textContent = q.answer;
    }
    if (q.explanation) {
      el.qExplanation.textContent = q.explanation;
      el.explainBlock.classList.remove("hidden");
    } else {
      el.explainBlock.classList.add("hidden");
    }

    // Answer always hidden on entering a new question.
    setAnswerVisible(false);

    // Timer resets on every question change.
    resetTimer();

    // Nav button states.
    el.btnPrev.disabled = state.questionIndex === 0;
    el.btnNext.textContent =
      state.questionIndex === total - 1 ? "Finish Quiz" : "Next →";

    renderProgressDots(total);
  }

  function renderProgressDots(total) {
    el.progressDots.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.className = "pd";
      // Small visual break every 3 questions (one Easy/Medium/Hard round each).
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
    el.btnToggleAnswer.textContent = visible ? "Hide Answer" : "Show Answer";

    // Programming Round: the model-answer code card doubles as the
    // answer reveal, so it stays hidden (behind the hint) until now.
    if (state.roundType === "programming") {
      el.codeCard.classList.toggle("hidden", !visible);
      el.codeCardHint.classList.toggle("hidden", visible);
    }
  }

  function toggleAnswer() {
    setAnswerVisible(!state.answerVisible);
  }

  el.btnToggleAnswer.addEventListener("click", toggleAnswer);

  /* ------------------------------------------------------------------ */
  /* NAVIGATION                                                         */
  /* ------------------------------------------------------------------ */
  function goNext() {
    const isLast = state.questionIndex === activeQuestions().length - 1;

    if (isLast) {
      askFinishQuiz();
      return;
    }
    state.questionIndex += 1;
    renderQuestion();
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
