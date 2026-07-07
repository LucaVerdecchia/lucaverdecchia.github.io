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

function weightRef(date) {
  return doc(db, "users", auth.currentUser.uid, "body-weight", date);
}

export async function getLatestEntry() {
  if (!auth.currentUser) return null;
  const entries = await getWeightHistory();
  return entries[0] || { date: "", bodyWeight: "" };
}

export async function getWeightHistory() {
  if (!auth.currentUser) return [];
  const ref = collection(db, "users", auth.currentUser.uid, "body-weight");
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function saveWeightEntry({ date, bodyWeight }) {
  const ref = weightRef(date);
  const snap = await getDoc(ref);

  await setDoc(
    ref,
    {
      date,
      bodyWeight: Number(bodyWeight),
      updatedAt: serverTimestamp(),
      ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

// Migra un eventuale salvataggio precedente da settings/profile
export async function migrateLegacySettings() {
  const legacyRef = doc(db, "users", auth.currentUser.uid, "settings", "profile");
  const snap = await getDoc(legacyRef);
  if (!snap.exists()) return;

  const { date, bodyWeight } = snap.data();
  if (date && bodyWeight != null) {
    await saveWeightEntry({ date, bodyWeight });
  }
}
