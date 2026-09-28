// Общий движок серии "English for Kids".
// Не знает ничего про конкретные упражнения — только:
// авторизация, сохранение/чтение прогресса, озвучка, фразы обратной связи.

import { firebaseConfig } from "../../firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUid = null;

/** Дожидается анонимного входа, возвращает uid ребёнка на этом устройстве. */
export function ready() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUid = user.uid;
        resolve(currentUid);
      } else {
        const cred = await signInAnonymously(auth);
        currentUid = cred.user.uid;
        resolve(currentUid);
      }
    });
  });
}

/**
 * Сохраняет результат прохождения юнита.
 * Поля box/nextReviewDate для интервальных повторений добавим вторым
 * шагом — Firestore не требует заранее фиксировать схему документа.
 */
export async function saveProgress(unitId, result) {
  if (!currentUid) return;
  const ref = doc(db, "progress", currentUid, "units", unitId);
  const passed = result.correct >= Math.ceil(result.total * 0.7);
  await setDoc(ref, {
    status: passed ? "passed" : "in_progress",
    lastScore: result.correct,
    outOf: result.total,
    lastPlayedAt: new Date().toISOString()
  }, { merge: true });
}

export async function loadProgress(unitId) {
  if (!currentUid) return null;
  const ref = doc(db, "progress", currentUid, "units", unitId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Озвучивает фразу. Если указан audioFileId и файл существует в /audio/ —
 * играет записанный звук. Иначе — голос браузера. Замена происходит
 * фраза за фразой: положили файл в /audio/ — с этого момента звучит он.
 */
export function speak(text, audioFileId) {
  if (audioFileId) {
    const audio = new Audio(`../../audio/${audioFileId}.mp3`);
    audio.play().catch(() => speakBrowser(text));
  } else {
    speakBrowser(text);
  }
}

function speakBrowser(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.9;
  utter.pitch = 1.1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// Пул фраз обратной связи для самого начала серии (минимальный
// накопленный словарь). Позже пул будет расти вместе с пройденными
// юнитами — сюда добавится параметр "уровень"/"известные слова".
const feedbackPool = {
  correct: [
    { text: "Yes! That's right!", audioFileId: null },
    { text: "Well done!", audioFileId: null },
    { text: "Great job!", audioFileId: null }
  ],
  tryAgain: [
    { text: "Let's try again.", audioFileId: null },
    { text: "Almost! Look again.", audioFileId: null }
  ]
};

export function randomFeedback(kind) {
  const pool = feedbackPool[kind];
  return pool[Math.floor(Math.random() * pool.length)];
}
