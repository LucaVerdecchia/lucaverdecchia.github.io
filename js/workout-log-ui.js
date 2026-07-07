import { addSet, getHistory, formatDate } from "./workout-log.js";
import { renderAuthBar } from "./auth-ui.js";

function renderSetsList(sets) {
  if (!sets?.length) {
    return `<p class="log-empty">Nessuna serie registrata.</p>`;
  }

  return `
    <ul class="log-sets">
      ${sets.map((s) => `<li><strong>${s.weight} kg</strong> × ${s.reps} rip.</li>`).join("")}
    </ul>
  `;
}

function renderHistory(sessions) {
  if (!sessions.length) {
    return `<p class="log-empty">Nessun allenamento salvato.</p>`;
  }

  return `
    <ul class="log-history">
      ${sessions
        .map(
          (session) => `
          <li class="log-session">
            <p class="log-date">${formatDate(session.date)}</p>
            ${renderSetsList(session.sets)}
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}

async function refreshHistory(slug, historyEl) {
  historyEl.innerHTML = `<p class="log-empty">Caricamento...</p>`;
  const sessions = await getHistory(slug);
  historyEl.innerHTML = renderHistory(sessions);
}

export function setupWorkoutLog(slug, user) {
  const section = document.getElementById("workout-log");
  if (!section) return;

  if (!user) {
    section.innerHTML = `
      <h2 class="section-title">Il tuo storico</h2>
      ${renderAuthBar(null)}
    `;
    return;
  }

  section.innerHTML = `
    <h2 class="section-title">Registra serie</h2>
    <form class="log-form" id="log-form">
      <div class="log-form-row">
        <label class="log-field">
          <span class="log-field-label">Peso (kg)</span>
          <input type="number" name="weight" inputmode="decimal" min="0" step="0.5" placeholder="60" required />
        </label>
        <label class="log-field">
          <span class="log-field-label">Ripetizioni</span>
          <input type="number" name="reps" inputmode="numeric" min="1" step="1" placeholder="10" required />
        </label>
      </div>
      <button type="submit" class="log-submit">Aggiungi serie</button>
    </form>

    <h2 class="section-title log-history-title">Il tuo storico</h2>
    <div id="log-history"></div>
  `;

  const form = section.querySelector("#log-form");
  const historyEl = section.querySelector("#log-history");

  refreshHistory(slug, historyEl);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector(".log-submit");
    const weight = form.weight.value;
    const reps = form.reps.value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Salvataggio...";

    try {
      await addSet(slug, weight, reps);
      form.reps.value = "";
      form.weight.focus();
      await refreshHistory(slug, historyEl);
    } catch (error) {
      console.error(error);
      alert("Errore nel salvataggio. Controlla la connessione e riprova.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Aggiungi serie";
    }
  });
}
