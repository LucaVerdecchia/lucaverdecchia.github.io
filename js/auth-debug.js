const STORAGE_KEY = "authStatusMessages";

function readMessages() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
}

function formatDetail(data) {
  if (!data || typeof data !== "object") return "";
  const parts = Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${value}`);
  return parts.length ? ` (${parts.join(", ")})` : "";
}

export function logAuth(message, data = {}) {
  const line = `${new Date().toLocaleTimeString("it-IT")} — ${message}${formatDetail(data)}`;
  const messages = readMessages();
  messages.push(line);
  saveMessages(messages);
  renderAuthStatus();
}

export function renderAuthStatus() {
  const container = document.getElementById("auth-status-log");
  if (!container) return;

  const messages = readMessages();
  container.innerHTML = messages.length
    ? messages.map((line) => `<p>${line}</p>`).join("")
    : "<p>In attesa di eventi accesso...</p>";
}

export function mountAuthStatus() {
  logAuth("Home caricata", {
    pagina: window.location.pathname || "/",
  });
  renderAuthStatus();
}

export function clearAuthStatus() {
  sessionStorage.removeItem(STORAGE_KEY);
  renderAuthStatus();
}
