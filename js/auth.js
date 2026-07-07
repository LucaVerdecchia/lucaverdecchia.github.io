import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { logAuth } from "./auth-debug.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let authReadyPromise = null;

function authErrorMessage(error) {
  const messages = {
    "auth/unauthorized-domain": "Dominio non autorizzato in Firebase",
    "auth/web-storage-unsupported": "Browser blocca archiviazione (prova senza scudi Brave o navigazione privata)",
    "auth/operation-not-allowed": "Google non abilitato in Firebase",
    "auth/popup-blocked": "Popup bloccato dal browser",
    "auth/popup-closed-by-user": "Login annullato",
  };
  return messages[error?.code] || error?.message || "Errore sconosciuto";
}

export async function ensureAuthReady() {
  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      logAuth("Controllo ritorno da Google");

      try {
        const result = await getRedirectResult(auth);
        logAuth("Ritorno da Google completato", {
          utente: result?.user?.email || "nessuno",
          uid: result?.user?.uid || "—",
        });
        return result?.user ?? auth.currentUser;
      } catch (error) {
        logAuth("Errore dopo redirect", {
          codice: error.code,
          messaggio: authErrorMessage(error),
        });
        return auth.currentUser;
      }
    })();
  }
  return authReadyPromise;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      logAuth("Sei loggato", { email: user.email });
    } else {
      logAuth("Non loggato");
    }
    callback(user);
  });
}

export async function signInWithGoogle() {
  logAuth("Tap su Accedi con Google");

  try {
    const result = await signInWithPopup(auth, provider);
    logAuth("Login popup riuscito", { email: result.user.email });
    return result.user;
  } catch (error) {
    logAuth("Popup fallito", {
      codice: error.code,
      messaggio: authErrorMessage(error),
    });

    if (error.code === "auth/popup-closed-by-user") {
      throw error;
    }

    logAuth("Provo redirect verso Google...");
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function logOut() {
  await signOut(auth);
  authReadyPromise = null;
  logAuth("Logout effettuato");
}
