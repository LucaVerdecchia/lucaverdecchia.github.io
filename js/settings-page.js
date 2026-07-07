import { ensureAuthReady, onAuthChange } from "./auth.js";
import { mountAuthBar, renderAuthBar } from "./auth-ui.js";
import { mountRestTimer } from "./rest-timer-ui.js";
import { formatDate } from "./workout-log.js";
import {
  getLatestEntry,
  getWeightHistory,
  migrateLegacySettings,
  saveWeightEntry,
} from "./settings.js";

mountRestTimer();
await ensureAuthReady();

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function renderWeightHistory(entries) {
  if (!entries.length) {
    return `<p class="log-empty">Nessun peso registrato.</p>`;
  }

  return `
    <ul class="weight-history">
      ${entries
        .map(
          (entry) => `
          <li class="weight-entry">
            <span class="weight-entry-date">${formatDate(entry.date)}</span>
            <span class="weight-entry-value"><strong>${entry.bodyWeight}</strong> kg</span>
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}

function renderSettingsForm(latest) {
  const dateValue = latest.date || todayISO();

  return `
    <form class="settings-form" id="settings-form">
      <label class="log-field">
        <span class="log-field-label">Data</span>
        <input
          type="date"
          name="date"
          class="settings-date"
          value="${dateValue}"
          required
        />
      </label>

      <label class="log-field">
        <span class="log-field-label">Peso corporeo (kg)</span>
        <input
          type="number"
          name="bodyWeight"
          inputmode="decimal"
          min="30"
          max="300"
          step="0.1"
          placeholder="es. 75.5"
          value="${latest.bodyWeight !== "" && latest.bodyWeight != null ? latest.bodyWeight : ""}"
          required
        />
      </label>

      <button type="submit" class="log-submit">Salva</button>
    </form>
  `;
}

function renderContent(latest, entries) {
  return `
    ${renderSettingsForm(latest)}
    <h2 class="section-label settings-history-title">Storico</h2>
    <div id="weight-history">${renderWeightHistory(entries)}</div>
  `;
}

async function refreshHistory() {
  const historyEl = document.getElementById("weight-history");
  if (!historyEl) return;
  const entries = await getWeightHistory();
  historyEl.innerHTML = renderWeightHistory(entries);
}

function setupForm() {
  const form = document.getElementById("settings-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector(".log-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Salvataggio...";

    try {
      await saveWeightEntry({
        date: form.date.value,
        bodyWeight: form.bodyWeight.value,
      });
      submitBtn.textContent = "Salvato!";
      await refreshHistory();
      setTimeout(() => {
        submitBtn.textContent = "Salva";
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Errore nel salvataggio. Controlla la connessione e riprova.");
      submitBtn.textContent = "Salva";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function renderForUser(user) {
  const content = document.getElementById("settings-content");
  if (!user) {
    content.innerHTML = `
      <p class="log-empty">Accedi per salvare le tue impostazioni.</p>
      ${renderAuthBar(null)}
    `;
    return;
  }

  content.innerHTML = `<p class="log-empty">Caricamento...</p>`;
  await migrateLegacySettings();
  const [latest, entries] = await Promise.all([getLatestEntry(), getWeightHistory()]);
  content.innerHTML = renderContent(latest, entries);
  setupForm();
}

export async function renderSettings() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <a href="index.html" class="back-link">← Scheda</a>
    <div id="auth-bar"></div>

    <header class="hero">
      <h1 class="page-title">IMPOSTAZIONI</h1>
      <p class="page-subtitle">Data e peso corporeo</p>
    </header>

    <section class="settings-section" id="settings-content">
      <p class="log-empty">Caricamento...</p>
    </section>
  `;

  const authBar = document.getElementById("auth-bar");
  mountAuthBar(authBar);

  onAuthChange(async (user) => {
    authBar.innerHTML = renderAuthBar(user);
    await renderForUser(user);
  });
}
