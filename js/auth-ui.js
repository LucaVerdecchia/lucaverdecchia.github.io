import { signInWithGoogle, logOut, consumeAuthError } from "./auth.js";

export function mountAuthBar(container) {
  if (!container) return;

  const authError = consumeAuthError();
  if (authError) {
    const notice = document.createElement("p");
    notice.className = "auth-error";
    notice.textContent = authError;
    container.appendChild(notice);
  }

  container.addEventListener("click", async (e) => {
    const signInBtn = e.target.closest("[data-auth-signin]");
    const signOutBtn = e.target.closest("[data-auth-signout]");

    if (signInBtn) {
      signInBtn.disabled = true;
      signInBtn.textContent = "Reindirizzamento...";
      try {
        await signInWithGoogle();
      } catch (error) {
        signInBtn.disabled = false;
        signInBtn.textContent = "Accedi con Google";
      }
    }

    if (signOutBtn) {
      await logOut();
    }
  });
}

export function renderAuthBar(user) {
  if (user) {
    const name = user.displayName || user.email || "Utente";
    return `
      <div class="auth-bar auth-bar--signed-in">
        <span class="auth-bar-label">Accesso come <strong>${name}</strong></span>
        <button type="button" class="auth-bar-btn" data-auth-signout>Esci</button>
      </div>
    `;
  }

  return `
    <div class="auth-bar">
      <span class="auth-bar-label">Accedi per salvare pesi e ripetizioni</span>
      <button type="button" class="auth-bar-btn auth-bar-btn--primary" data-auth-signin>
        Accedi con Google
      </button>
    </div>
  `;
}
