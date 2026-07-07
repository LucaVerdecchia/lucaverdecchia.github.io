import { renderImage } from "./shared.js";

export async function renderGiorno1() {
  const [exercises, giorno1] = await Promise.all([
    fetch("data/exercises.json").then((r) => r.json()),
    fetch("data/giorno1.json").then((r) => r.json()),
  ]);

  document.querySelector(".day-title").textContent = giorno1.title;
  document.querySelector(".program-label").textContent = giorno1.program;

  const list = document.getElementById("exercise-list");
  list.innerHTML = "";

  giorno1.exercises.forEach((entry, index) => {
    const exercise = exercises[entry.slug];
    if (!exercise) return;

    const card = document.createElement("a");
    card.href = `esercizi/${entry.slug}.html`;
    card.className = "exercise-card";
    card.innerHTML = `
      <div class="exercise-image">
        ${renderImage(exercise, exercise.name)}
        <span class="exercise-number">${index + 1}</span>
      </div>
      <div class="exercise-body">
        <h2 class="exercise-name">${exercise.name}</h2>
        ${exercise.nameEn ? `<p class="exercise-name-en">${exercise.nameEn}</p>` : ""}
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

  document.getElementById("total-exercises").textContent = giorno1.exercises.length;
  document.getElementById("total-sets").textContent = giorno1.exercises.reduce(
    (sum, e) => sum + e.sets,
    0
  );
}
