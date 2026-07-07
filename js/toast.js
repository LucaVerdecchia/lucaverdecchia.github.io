let phrasesCache = null;

async function loadPhrases(root) {
  if (phrasesCache) return phrasesCache;
  try {
    const data = await fetch(`${root}/data/motivation.json`).then((r) => r.json());
    phrasesCache = data.phrases || [];
  } catch {
    phrasesCache = [];
  }
  return phrasesCache;
}

function ensureContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, duration = 4000) {
  const container = ensureContainer();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  const remove = () => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  };

  setTimeout(remove, duration);
}

export async function showMotivationToast(root = ".") {
  const phrases = await loadPhrases(root);
  if (!phrases.length) return;
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  showToast(phrase);
}
