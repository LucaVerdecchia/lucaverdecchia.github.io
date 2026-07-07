import {
  clearRestTimer,
  formatRestTime,
  getRemainingSeconds,
  getTimerState,
  isTimerActive,
  markTimerFinished,
} from "./rest-timer.js";

let tickInterval = null;
let autoDismissTimeout = null;
let hasNotified = false;

function notifyFinished() {
  if (hasNotified) return;
  hasNotified = true;
  navigator.vibrate?.([200, 100, 200, 100, 200]);
}

function renderWidget(el) {
  const state = getTimerState();
  if (!state || !isTimerActive()) {
    el.hidden = true;
    document.body.classList.remove("has-rest-timer");
    return;
  }

  const remaining = getRemainingSeconds();
  const finished = state.finished || remaining === 0;
  const progress = finished ? 0 : (remaining / state.duration) * 100;

  el.hidden = false;
  el.classList.toggle("rest-timer--done", finished);
  document.body.classList.add("has-rest-timer");

  el.innerHTML = `
    <div class="rest-timer-bar" style="width: ${progress}%"></div>
    <div class="rest-timer-content">
      <div class="rest-timer-info">
        <span class="rest-timer-label">${finished ? "Recupero finito" : "Recupero"}</span>
        <span class="rest-timer-exercise">${state.exerciseName}</span>
      </div>
      <span class="rest-timer-time" aria-live="polite">${finished ? "✓" : formatRestTime(remaining)}</span>
      <button type="button" class="rest-timer-dismiss" aria-label="${finished ? "Chiudi" : "Salta recupero"}">
        ${finished ? "OK" : "Salta"}
      </button>
    </div>
  `;

  el.querySelector(".rest-timer-dismiss").addEventListener("click", () => {
    clearRestTimer();
    hasNotified = false;
    clearTimeout(autoDismissTimeout);
  });

  if (finished) {
    notifyFinished();
    clearTimeout(autoDismissTimeout);
    autoDismissTimeout = setTimeout(() => {
      clearRestTimer();
      hasNotified = false;
    }, 8000);
    return;
  }

  hasNotified = false;
}

function tick(el) {
  const state = getTimerState();
  if (!state) {
    el.hidden = true;
    document.body.classList.remove("has-rest-timer");
    return;
  }

  const remaining = getRemainingSeconds();
  if (remaining <= 0 && !state.finished) {
    markTimerFinished();
  }

  renderWidget(el);
}

export function mountRestTimer() {
  if (document.getElementById("rest-timer")) return;

  const el = document.createElement("aside");
  el.id = "rest-timer";
  el.className = "rest-timer";
  el.hidden = true;
  document.body.appendChild(el);

  const onChange = () => tick(el);
  window.addEventListener("rest-timer-change", onChange);
  window.addEventListener("storage", (e) => {
    if (e.key === "schedapalestra-rest-timer") onChange();
  });

  tick(el);
  clearInterval(tickInterval);
  tickInterval = setInterval(() => tick(el), 250);
}
