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

function authErrorMessage(error) {
  const messages = {
    "auth/unauthorized-domain": "Dominio non autorizzato in Firebase.",
    "auth/web-storage-unsupported": "Il browser blocca l'archiviazione. Disattiva navigazione privata o scudi Brave.",
    "auth/operation-not-allowed": "Accesso Google non abilitato in Firebase.",
    "auth/popup-blocked": "Popup bloccato dal browser.",
    "auth/popup-closed-by-user": "Login annullato.",
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

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      throw error;
    }

    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function logOut() {
  await signOut(auth);
  authReadyPromise = null;
}
