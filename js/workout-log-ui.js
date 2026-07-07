import { addSet, updateSet, deleteSet, getHistory, formatDate } from "./workout-log.js";
import { renderAuthBar } from "./auth-ui.js";
import { startRestTimer } from "./rest-timer.js";
import { showMotivationToast } from "./toast.js";

function renderSetsList(sets, date) {
  if (!sets?.length) {
    return `<p class="log-empty">Nessuna serie registrata.</p>`;
  }

  return `
    <ul class="log-sets">
      ${sets
        .map(
          (s, i) => `
          <li class="log-set" data-date="${date}" data-index="${i}">
            <span class="log-set-text"><strong>${s.weight} kg</strong> × ${s.reps} rip.</span>
            <span class="log-set-actions">
              <button type="button" class="log-set-edit" data-weight="${s.weight}" data-reps="${s.reps}" aria-label="Modifica serie">Modifica</button>
              <button type="button" class="log-set-delete" aria-label="Elimina serie">Elimina</button>
            </span>
          </li>
        `
        )
        .join("")}
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
            ${renderSetsList(session.sets, session.date)}
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

function openSetEditor(li, slug, historyEl) {
  const editBtn = li.querySelector(".log-set-edit");
  const { weight, reps } = editBtn.dataset;

  li.innerHTML = `
    <form class="log-set-form">
      <input type="number" name="weight" inputmode="decimal" min="0" step="0.5" value="${weight}" required aria-label="Peso (kg)" />
      <span class="log-set-sep">kg ×</span>
      <input type="number" name="reps" inputmode="numeric" min="1" step="1" value="${reps}" required aria-label="Ripetizioni" />
      <span class="log-set-sep">rip.</span>
      <button type="submit" class="log-set-save">Salva</button>
      <button type="button" class="log-set-cancel">Annulla</button>
    </form>
  `;

  const form = li.querySelector(".log-set-form");
  form.weight.focus();

  form.querySelector(".log-set-cancel").addEventListener("click", () => {
    refreshHistory(slug, historyEl);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const saveBtn = form.querySelector(".log-set-save");
    saveBtn.disabled = true;
    saveBtn.textContent = "...";

    try {
      await updateSet(slug, li.dataset.date, Number(li.dataset.index), form.weight.value, form.reps.value);
      await refreshHistory(slug, historyEl);
    } catch (error) {
      console.error(error);
      alert("Errore nel salvataggio della modifica. Riprova.");
      saveBtn.disabled = false;
      saveBtn.textContent = "Salva";
    }
  });
}

export function setupWorkoutLog(slug, user, exerciseName, root = ".") {
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

  historyEl.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".log-set-edit");
    if (editBtn) {
      openSetEditor(editBtn.closest(".log-set"), slug, historyEl);
      return;
    }

    const deleteBtn = e.target.closest(".log-set-delete");
    if (!deleteBtn) return;

    const li = deleteBtn.closest(".log-set");
    if (!confirm("Eliminare questa serie?")) return;

    deleteBtn.disabled = true;

    try {
      await deleteSet(slug, li.dataset.date, Number(li.dataset.index));
      await refreshHistory(slug, historyEl);
    } catch (error) {
      console.error(error);
      alert("Errore nell'eliminazione. Riprova.");
      deleteBtn.disabled = false;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector(".log-submit");
    const weight = form.weight.value;
    const reps = form.reps.value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Salvataggio...";

    try {
      await addSet(slug, weight, reps);
      startRestTimer(slug, exerciseName);
      showMotivationToast(root);
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
