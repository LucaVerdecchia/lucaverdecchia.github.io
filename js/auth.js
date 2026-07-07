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

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export async function initAuth() {
  try {
    await getRedirectResult(auth);
  } catch (error) {
    console.error("Errore login redirect:", error);
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (isMobile()) {
    await signInWithRedirect(auth, provider);
    return null;
  }
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}
