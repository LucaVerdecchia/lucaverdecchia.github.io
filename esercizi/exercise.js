import { renderImage } from "../js/shared.js";
import { initAuth, onAuthChange } from "../js/auth.js";
import { mountAuthBar, renderAuthBar } from "../js/auth-ui.js";
import { setupWorkoutLog } from "../js/workout-log-ui.js";

const ROOT = "..";

await initAuth();

async function loadData() {
  const [exercises, giorno1] = await Promise.all([
    fetch(`${ROOT}/data/exercises.json`).then((r) => r.json()),
    fetch(`${ROOT}/data/giorno1.json`).then((r) => r.json()),
  ]);
  return { exercises, giorno1 };
}

const DEFAULT_VIDEO_START = 15;

function youtubeEmbedUrl(video, start) {
  const id = !video.includes("/") && !video.includes("?") ? video : null;
  const match = id ? null : video.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  const youtubeId = id || (match ? match[1] : null);
  if (!youtubeId) return null;

  const params = new URLSearchParams({
    start: String(start),
    mute: "1",
    playsinline: "1",
    rel: "0",
  });

  return `https://www.youtube.com/embed/${youtubeId}?${params}`;
}

function vimeoEmbedUrl(video, start) {
  const url = video.startsWith("http") ? new URL(video) : new URL(`https://player.vimeo.com/${video}`);
  url.searchParams.set("muted", "1");
  url.hash = `t=${start}s`;
  return url.href;
}

function renderVideo(video, start = DEFAULT_VIDEO_START) {
  if (!video) return "";

  const src = video.includes("vimeo.com")
    ? vimeoEmbedUrl(video, start)
    : youtubeEmbedUrl(video, start);

  if (!src) return "";

  return `
    <section class="section video-section">
      <h2 class="section-title">Video dimostrativo</h2>
      <div class="video-wrapper">
        <iframe
          src="${src}"
          title="Video dimostrativo"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </section>
  `;
}

function findDayContext(giorno1, slug) {
  const index = giorno1.exercises.findIndex((e) => e.slug === slug);
  if (index === -1) return null;
  const current = giorno1.exercises[index];
  const prev = giorno1.exercises[index - 1] || null;
  const next = giorno1.exercises[index + 1] || null;
  return { index, current, prev, next, giorno1 };
}

function setupImageLightbox(src, alt) {
  const trigger = document.querySelector(".image-trigger");
  if (!trigger) return;

  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="image-lightbox-backdrop"></div>
    <button type="button" class="image-lightbox-close" aria-label="Chiudi">×</button>
    <img class="image-lightbox-img" src="${src}" alt="${alt}" />
  `;
  document.body.appendChild(lightbox);

  const open = () => {
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
  };

  trigger.addEventListener("click", open);
  lightbox.querySelector(".image-lightbox-backdrop").addEventListener("click", close);
  lightbox.querySelector(".image-lightbox-close").addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) close();
  });
}

export async function renderExercisePage(slug) {
  const app = document.getElementById("app");
  const { exercises, giorno1 } = await loadData();
  const exercise = exercises[slug];
  const context = findDayContext(giorno1, slug);

  if (!exercise) {
    app.innerHTML = `<p>Esercizio non trovato.</p>`;
    return;
  }

  document.title = `${exercise.name} | Scheda Palestra`;

  const sets = context?.current.sets ?? "—";
  const reps = context?.current.reps ?? "—";

  const exerciseWithPath = { ...exercise, image: `${ROOT}/${exercise.image}` };

  const imageSrc = `${ROOT}/${exercise.image}`;

  const heroHtml = exercise.image
    ? `<button type="button" class="hero-image image-trigger" aria-label="Apri immagine a schermo intero">
        <div class="exercise-image">
          ${renderImage(exerciseWithPath, exercise.name)}
        </div>
      </button>`
    : `<div class="hero-image">
        <div class="exercise-image">
          ${renderImage(exerciseWithPath, exercise.name)}
        </div>
      </div>`;

  app.innerHTML = `
    <a href="${ROOT}/giorno1.html" class="back-link">← Giorno 1</a>
    <div id="auth-bar"></div>

    ${context ? `<p class="day-context">${giorno1.title} · Esercizio ${context.index + 1} di ${giorno1.exercises.length}</p>` : ""}

    ${heroHtml}

    <h1 class="exercise-title">${exercise.name}</h1>
    ${exercise.nameEn ? `<p class="exercise-title-en">${exercise.nameEn}</p>` : ""}

    <div class="meta-row">
      <span class="meta-chip">Attrezzo <strong>${exercise.equipment}</strong></span>
      ${context ? `<span class="meta-chip">Serie <strong>${sets}</strong></span>` : ""}
      ${context ? `<span class="meta-chip">Ripetizioni <strong>${reps}</strong></span>` : ""}
    </div>

    <div class="stats" style="margin-bottom: 20px;">
      <div class="stat">
        <span class="stat-label">Serie</span>
        <span class="stat-value">${sets}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Ripetizioni</span>
        <span class="stat-value accent">${reps}</span>
      </div>
    </div>

    <section class="section workout-log-section" id="workout-log">
      <p class="log-empty">Caricamento...</p>
    </section>

    ${renderVideo(exercise.video, exercise.videoStart)}

    <section class="section">
      <h2 class="section-title">Muscoli coinvolti</h2>
      <ul class="muscle-list">
        ${exercise.muscles.map((m) => `<li>${m}</li>`).join("")}
      </ul>
    </section>

    ${
      exercise.importantNote
        ? `<section class="section section-important">
            <h2 class="section-title">Nota importante</h2>
            <p class="important-note">${exercise.importantNote}</p>
          </section>`
        : ""
    }

    ${
      exercise.notes
        ? `<section class="section">
            <h2 class="section-title">Note</h2>
            <p class="notes">${exercise.notes}</p>
          </section>`
        : ""
    }

    ${
      context
        ? `<nav class="nav-exercises">
            <a href="${context.prev ? `${context.prev.slug}.html` : "#"}" class="nav-exercise-btn ${context.prev ? "" : "disabled"}">← Prec.</a>
            <a href="${context.next ? `${context.next.slug}.html` : "#"}" class="nav-exercise-btn accent ${context.next ? "" : "disabled"}">Succ. →</a>
          </nav>`
        : ""
    }
  `;

  if (exercise.image) {
    setupImageLightbox(imageSrc, exercise.name);
  }

  const authBar = document.getElementById("auth-bar");
  mountAuthBar(authBar);

  onAuthChange((user) => {
    if (authBar) authBar.innerHTML = renderAuthBar(user);
    setupWorkoutLog(slug, user);
  });
}

export async function renderCatalog() {
  const app = document.getElementById("app");
  const { exercises } = await loadData();

  const items = Object.entries(exercises)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(
      ([slug, ex]) => `
        <li>
          <a href="${slug}.html" class="catalog-link">
            <span>${ex.name}</span>
            <span class="arrow">→</span>
          </a>
        </li>
      `
    )
    .join("");

  app.innerHTML = `
    <a href="${ROOT}/index.html" class="back-link">← Scheda</a>
    <h1 class="page-title">ESERCIZI</h1>
    <p class="page-subtitle">Database · ${Object.keys(exercises).length} esercizi</p>
    <ul class="catalog-list">${items}</ul>
  `;
}
