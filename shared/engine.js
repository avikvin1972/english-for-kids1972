// Общий движок серии "English for Kids".
// Не знает ничего про конкретные упражнения — только:
// авторизация, сохранение/чтение прогресса, озвучка, фразы обратной связи.

import { firebaseConfig } from "../firebase-config.js";
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
    spokenCount: result.spokenCount ?? 0,
    speakMode: result.speakMode ?? "unknown",
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
 * opts.queue = true — не прерывать то, что уже звучит, а встать в очередь.
 */
export function speak(text, audioFileId, opts = {}) {
  if (audioFileId) {
    const audio = new Audio(`../../audio/${audioFileId}.mp3`);
    audio.play().catch(() => speakBrowser(text, opts.queue));
  } else {
    speakBrowser(text, opts.queue);
  }
}

/** Озвучивает фразу и ждёт, пока она закончится (перед сменой экрана и перед включением микрофона). */
export function speakWait(text, audioFileId) {
  return new Promise((resolve) => {
    const safety = setTimeout(resolve, 6000); // страховка, если браузер не сообщил об окончании
    const done = () => { clearTimeout(safety); resolve(); };
    if (audioFileId) {
      const audio = new Audio(`../../audio/${audioFileId}.mp3`);
      audio.onended = done;
      audio.play().catch(() => speakBrowser(text, false, done));
    } else {
      speakBrowser(text, false, done);
    }
  });
}

function speakBrowser(text, queue = false, onend) {
  if (!("speechSynthesis" in window)) { if (onend) onend(); return; }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.9;
  utter.pitch = 1.1;
  if (onend) { utter.onend = onend; utter.onerror = onend; }
  if (!queue) speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

// Фразы, которыми приложение комментирует действия ребёнка.
// Каждая всегда и печатается на экране, и озвучивается.
// Меняются в одном месте — здесь.
export const PHRASES = {
  tapWord: "Tap the word!",
  whichWord: "Which word?",
  sayIt: "Say it!",
  go: "Go!",
  together: "Let's say it together!",
  noMic: "Tap the button.",
  great: "Great job!"
};

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

// ---------- Произнесение фраз ----------
// Режим выбирается на экране настроек и хранится на этом устройстве:
// "auto" — распознавание речи в браузере, "self" — ребёнок сам отмечает «Я сказал».
const SPEAK_MODE_KEY = "efk-speak-mode";

export function getSpeakMode() {
  try { return localStorage.getItem(SPEAK_MODE_KEY); } catch { return null; }
}

export function setSpeakMode(mode) {
  try { localStorage.setItem(SPEAK_MODE_KEY, mode); } catch { /* не критично */ }
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function recognitionSupported() {
  return !!SR;
}

function words(s) {
  return s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);
}

/**
 * Слушает одну фразу и сравнивает с целевой.
 * Возвращает { status, heard }, status: "match" | "nomatch" | "denied" | "unsupported" | "error".
 * Проверка мягкая: достаточно, чтобы совпало 75% слов целевой фразы.
 */
export function listenOnce(target) {
  return new Promise((resolve) => {
    if (!SR) return resolve({ status: "unsupported", heard: "" });
    const rec = new SR();
    rec.lang = "en-US";
    rec.maxAlternatives = 5;
    rec.interimResults = false;
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    rec.onresult = (e) => {
      const alts = [...e.results[0]].map((a) => a.transcript);
      const targetWords = words(target);
      let best = 0;
      for (const t of alts) {
        const heard = words(t);
        const hit = targetWords.filter((w) => heard.includes(w)).length;
        best = Math.max(best, hit / targetWords.length);
      }
      finish({ status: best >= 0.75 ? "match" : "nomatch", heard: alts[0] });
    };
    rec.onerror = (e) => {
      const denied = e.error === "not-allowed" || e.error === "service-not-allowed";
      finish({ status: denied ? "denied" : "nomatch", heard: "" });
    };
    rec.onnomatch = () => finish({ status: "nomatch", heard: "" });
    rec.onend = () => finish({ status: "nomatch", heard: "" });
    try { rec.start(); } catch { finish({ status: "error", heard: "" }); }
  });
}
