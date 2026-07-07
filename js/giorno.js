import { renderImage } from "./shared.js";
import { mountRestTimer } from "./rest-timer-ui.js";

try {
  mountRestTimer();
} catch (error) {
  console.warn("Rest timer non disponibile:", error);
}

export async function renderGiorno(dayFile) {
  const list = document.getElementById("exercise-list");
  if (!list) throw new Error("Elemento exercise-list non trovato.");

  try {
    const [exercisesRes, giornoRes] = await Promise.all([
      fetch("data/exercises.json"),
      fetch(`data/${dayFile}`),
    ]);

    if (!exercisesRes.ok) throw new Error(`exercises.json non trovato (${exercisesRes.status})`);
    if (!giornoRes.ok) throw new Error(`${dayFile} non trovato (${giornoRes.status})`);

    const [exercises, giorno] = await Promise.all([exercisesRes.json(), giornoRes.json()]);

    document.querySelector(".day-title").textContent = giorno.title;
    document.querySelector(".program-label").textContent = giorno.program;

    list.innerHTML = "";

    giorno.exercises.forEach((entry, index) => {
      const exercise = exercises[entry.slug];
      const name = exercise?.name ?? entry.slug;
      const nameEn = exercise?.nameEn ?? "";

      const card = document.createElement("a");
      card.href = `esercizi/${entry.slug}.html`;
      card.className = "exercise-card";
      card.innerHTML = `
        <div class="exercise-image">
          ${exercise ? renderImage(exercise, name) : `<div class="exercise-placeholder">${name}</div>`}
          <span class="exercise-number">${index + 1}</span>
        </div>
        <div class="exercise-body">
          <h2 class="exercise-name">${name}</h2>
          ${nameEn ? `<p class="exercise-name-en">${nameEn}</p>` : ""}
          <div class="stats">
            <div class="stat">
              <span class="stat-label">Serie</span>
              <span class="stat-value">${entry.sets}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Ripetizioni</span>
              <span class="stat-value accent">${entry.reps}</span>
            </div>
          </div>
        </div>
      `;
      list.appendChild(card);
    });

    document.getElementById("total-exercises").textContent = giorno.exercises.length;
    document.getElementById("total-sets").textContent = giorno.exercises.reduce(
      (sum, e) => sum + e.sets,
      0
    );

    if (list.children.length === 0) {
      list.innerHTML = `<p class="settings-empty">Nessun esercizio in ${dayFile}.</p>`;
    }
  } catch (error) {
    console.error(error);
    list.innerHTML = `<p class="settings-empty">Errore nel caricamento: ${error.message}</p>`;
  }
}
