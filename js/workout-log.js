import { auth, db } from "./firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function sessionRef(slug, date) {
  const uid = auth.currentUser.uid;
  return doc(db, "users", uid, "exercises", slug, "sessions", date);
}

export async function addSet(slug, weight, reps) {
  const date = todayISO();
  const ref = sessionRef(slug, date);
  const snap = await getDoc(ref);
  const entry = { weight: Number(weight), reps: Number(reps) };

  const sets = snap.exists() ? [...snap.data().sets, entry] : [entry];

  await setDoc(
    ref,
    {
      date,
      sets,
      updatedAt: serverTimestamp(),
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

export async function getHistory(slug) {
  const uid = auth.currentUser.uid;
  const sessionsRef = collection(db, "users", uid, "exercises", slug, "sessions");
  const q = query(sessionsRef, orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export function formatDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
