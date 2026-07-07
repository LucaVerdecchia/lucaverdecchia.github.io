import { ensureAuthReady, onAuthChange } from "./auth.js";
import { mountAuthBar, renderAuthBar } from "./auth-ui.js";
import { mountAuthStatus } from "./auth-debug.js";

await ensureAuthReady();

async function loadDayStats(dayData) {
  if (!dayData) return null;
  const day = await fetch(`data/${dayData}`).then((r) => r.json());
  const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
  return { exercises: day.exercises.length, sets: totalSets };
}

function renderHomeContent(programs) {
  const programItems = Object.entries(programs)
    .map(([slug, program]) => {
      const availableDays = program.days.filter((d) => d.available).length;
      return `
        <li>
          <a href="programmi/${slug}.html" class="nav-link">
            <span>
              ${program.name}
              <span class="meta">${program.subtitle} · ${availableDays}/${program.days.length} giorni</span>
            </span>
            <span class="arrow">→</span>
          </a>
        </li>
      `;
    })
    .join("");

  return `
    <header class="hero">
      <h1 class="page-title">SCHEDA PALESTRA</h1>
      <p class="page-subtitle">I tuoi programmi di allenamento</p>
    </header>

    <p class="section-label">Tipologie di allenamento</p>
    <ul class="nav-list">${programItems}</ul>

    <p class="section-label spaced">Database</p>
    <ul class="nav-list">
      <li>
        <a href="esercizi/index.html" class="nav-link database">
          <span>
            Database esercizi
            <span class="meta">Tutte le schede · muscoli · video</span>
          </span>
          <span class="arrow">→</span>
        </a>
      </li>
    </ul>

    <footer>Scheda personale · GitHub Pages</footer>
  `;
}

export async function renderHome() {
  const app = document.getElementById("app");
  const programs = await fetch("data/programs.json").then((r) => r.json());

  app.innerHTML = `
    <div id="auth-bar"></div>
    <section class="auth-status-box">
      <p class="section-label">Stato accesso (debug)</p>
      <div id="auth-status-log" class="auth-status-log"></div>
    </section>
    ${renderHomeContent(programs)}
  `;

  mountAuthStatus();

  const authBar = document.getElementById("auth-bar");
  mountAuthBar(authBar);

  onAuthChange((user) => {
    authBar.innerHTML = renderAuthBar(user);
  });
}
