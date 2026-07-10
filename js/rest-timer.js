const STORAGE_KEY = "schedapalestra-rest-timer";

export const REST_DURATIONS = {
  "bench-press": 120,
  "barbell-row": 120,
  "seated-overhead-dumbbell-press": 120,
  "pec-dec": 75,
  "v-bar-lat-pull-down": 90,
  "side-lateral-raise": 60,
  "cable-tricep-extensions": 75,
  "cable-curls": 75,
  "machine-hack-squat": 120,
  "back-extension-45": 90,
  "stiff-leg-deadlift-dumbbell": 120,
  "standing-calf-raise": 75,
  "leg-extensions": 75,
  "leg-curl": 75,
  "seated-calf-raise": 60,
  "cable-crunch": 60,
  "cable-pull-through": 75,
  "incline-dumbbell-bench": 120,
  "chest-supported-row": 120,
  "machine-chest-press": 75,
  "lat-pulldown": 90,
  "reverse-pec-deck": 60,
  "dumbbell-curls": 75,
};

export function getRestDuration(slug) {
  return REST_DURATIONS[slug] ?? null;
}

export function getTimerState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getRemainingSeconds() {
  const state = getTimerState();
  if (!state) return 0;
  return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
}

export function isTimerActive() {
  const state = getTimerState();
  if (!state) return false;
  return state.endsAt > Date.now() || state.finished;
}

export function startRestTimer(slug, exerciseName) {
  const duration = getRestDuration(slug);
  if (!duration) return;

  const state = {
    slug,
    exerciseName,
    duration,
    endsAt: Date.now() + duration * 1000,
    finished: false,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("rest-timer-change"));
}

export function clearRestTimer() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("rest-timer-change"));
}

export function markTimerFinished() {
  const state = getTimerState();
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, finished: true }));
  window.dispatchEvent(new CustomEvent("rest-timer-change"));
}

export function formatRestTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
