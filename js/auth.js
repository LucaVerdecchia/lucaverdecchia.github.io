import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let authReadyPromise = null;

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function authErrorMessage(error) {
  const messages = {
    "auth/unauthorized-domain": "Dominio non autorizzato in Firebase.",
    "auth/web-storage-unsupported": "Il browser blocca l'archiviazione. Disattiva la navigazione privata.",
    "auth/operation-not-allowed": "Accesso Google non abilitato in Firebase.",
  };
  return messages[error?.code] || error?.message || "Errore di accesso sconosciuto.";
}

export async function ensureAuthReady() {
  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      try {
        const result = await getRedirectResult(auth);
        return result?.user ?? auth.currentUser;
      } catch (error) {
        console.error("Errore login redirect:", error);
        sessionStorage.setItem("authError", authErrorMessage(error));
        return auth.currentUser;
      }
    })();
  }
  return authReadyPromise;
}

export function consumeAuthError() {
  const message = sessionStorage.getItem("authError");
  sessionStorage.removeItem("authError");
  return message;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  sessionStorage.removeItem("authError");

  if (isMobile()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
  authReadyPromise = null;
}
