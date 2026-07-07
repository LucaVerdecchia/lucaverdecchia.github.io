const ROOT = "..";

async function loadDayStats(dayData) {
  const day = await fetch(`${ROOT}/data/${dayData}`).then((r) => r.json());
  const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
  return { exercises: day.exercises.length, sets: totalSets };
}

export async function renderProgram(slug) {
  const app = document.getElementById("app");
  const programs = await fetch(`${ROOT}/data/programs.json`).then((r) => r.json());
  const program = programs[slug];

  if (!program) {
    app.innerHTML = `<p>Programma non trovato.</p>`;
    return;
  }

  document.title = `${program.name} | Scheda Palestra`;

  const dayItems = await Promise.all(
    program.days.map(async (day) => {
      let meta = day.subtitle;
      if (day.available && day.dayData) {
        const stats = await loadDayStats(day.dayData);
        meta = `${day.subtitle} · ${stats.exercises} esercizi · ${stats.sets} serie`;
      } else if (!day.available) {
        meta = `${day.subtitle} · In arrivo`;
      }

      const href = day.available && day.page ? `${ROOT}/${day.page}` : "#";
      const disabled = day.available ? "" : "disabled";

      return `
        <li>
          <a href="${href}" class="nav-link ${disabled}">
            <span>
              ${day.title}
              <span class="meta">${meta}</span>
            </span>
            <span class="arrow">→</span>
          </a>
        </li>
      `;
    })
  );

  app.innerHTML = `
    <a href="${ROOT}/index.html" class="back-link">← Scheda</a>

    <header class="hero program-header">
      <h1 class="page-title">${program.name}</h1>
      <p class="page-subtitle">${program.subtitle}</p>
    </header>

    <p class="section-label">Giorni di allenamento</p>
    <ul class="nav-list">${dayItems.join("")}</ul>

    ${
      program.description
        ? `<section class="program-section spaced">
            <p class="program-description">${program.description}</p>
          </section>`
        : ""
    }

    ${
      program.tips?.length
        ? `<section class="program-section">
            <h2 class="section-label">Consigli</h2>
            <ul class="program-tips">
              ${program.tips.map((tip) => `<li>${tip}</li>`).join("")}
            </ul>
          </section>`
        : ""
    }
  `;
}
