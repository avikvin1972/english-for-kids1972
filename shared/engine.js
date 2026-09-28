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

// Голос для озвучки: явно выбираем английский, чтобы движок не читал слова как русские/буквы.
function pickEnglishVoice() {
  const voices = speechSynthesis.getVoices() || [];
  return voices.find((v) => v.lang === "en-US")
      || voices.find((v) => v.lang === "en_US")
      || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en"))
      || null;
}

// Некоторые движки читают "He" как символ гелия, по буквам «эйч-и».
// Строчное "he" читается как местоимение.
function fixForSpeech(text) {
  return text.replace(/\bHe\b/g, "he");
}

function speakBrowser(text, queue = false, onend) {
  if (!("speechSynthesis" in window)) { if (onend) onend(); return; }
  const utter = new SpeechSynthesisUtterance(fixForSpeech(text));
  utter.lang = "en-US";
  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
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

// ---------- Настройки произнесения фраз ----------
// Всё хранится на этом устройстве.
const SPEAK_MODE_KEY = "efk-speak-mode";
const ACCURACY_KEY = "efk-accuracy";
const MAX_TRIES_KEY = "efk-max-tries";

// "auto" — распознавание речи в браузере, "self" — ребёнок сам отмечает «Я сказал».
export function getSpeakMode() {
  try { return localStorage.getItem(SPEAK_MODE_KEY); } catch { return null; }
}

export function setSpeakMode(mode) {
  try { localStorage.setItem(SPEAK_MODE_KEY, mode); } catch { /* не критично */ }
}

// Доля слов фразы, которая должна совпасть, чтобы фраза засчиталась.
// Например, для фразы из трёх слов: мягко и средне — 2 из 3, строго — все 3.
export const ACCURACY_LEVELS = {
  soft:   { label: "Мягко",  threshold: 0.5,  hint: "Засчитывается, если распознана примерно половина слов." },
  medium: { label: "Средне", threshold: 0.66, hint: "Нужно, чтобы распознались две трети слов." },
  strict: { label: "Строго", threshold: 1.0,  hint: "Нужно, чтобы распознались все слова фразы." }
};

export function getAccuracy() {
  try {
    const v = localStorage.getItem(ACCURACY_KEY);
    return ACCURACY_LEVELS[v] ? v : "soft";
  } catch { return "soft"; }
}

export function setAccuracy(level) {
  try { localStorage.setItem(ACCURACY_KEY, level); } catch { /* не критично */ }
}

// Сколько попыток у ребёнка на фразу, прежде чем приложение скажет её само.
export const TRIES_OPTIONS = [1, 2, 3, 5];

export function getMaxTries() {
  try {
    const n = parseInt(localStorage.getItem(MAX_TRIES_KEY), 10);
    return TRIES_OPTIONS.includes(n) ? n : 2;
  } catch { return 2; }
}

export function setMaxTries(n) {
  try { localStorage.setItem(MAX_TRIES_KEY, String(n)); } catch { /* не критично */ }
}

// ---------- Распознавание речи ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function recognitionSupported() {
  return !!SR;
}

// Распознаватель часто возвращает сокращения ("he's", "I'm"), а цель — "he is", "I am".
const CONTRACTIONS = {
  "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is",
  "it's": "it is", "we're": "we are", "they're": "they are",
  "that's": "that is", "what's": "what is", "who's": "who is"
};

function words(s) {
  let t = s.toLowerCase().replace(/[’‘]/g, "'");
  t = t.replace(/\b[a-z]+'(?:m|s|re)\b/g, (m) => CONTRACTIONS[m] || m);
  return t.replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);
}

/**
 * Слушает одну фразу и сравнивает с целевой.
 * threshold — доля слов целевой фразы, которая должна совпасть (0..1).
 * Возвращает { status, heard, score }, status: "match" | "nomatch" | "denied" | "unsupported" | "error".
 */
export function listenOnce(target, threshold = 0.5) {
  return new Promise((resolve) => {
    if (!SR) return resolve({ status: "unsupported", heard: "", score: 0 });
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
      finish({
        status: best >= threshold - 0.001 ? "match" : "nomatch",
        heard: alts[0],
        score: best
      });
    };
    rec.onerror = (e) => {
      const denied = e.error === "not-allowed" || e.error === "service-not-allowed";
      finish({ status: denied ? "denied" : "nomatch", heard: "", score: 0 });
    };
    rec.onnomatch = () => finish({ status: "nomatch", heard: "", score: 0 });
    rec.onend = () => finish({ status: "nomatch", heard: "", score: 0 });
    try { rec.start(); } catch { finish({ status: "error", heard: "", score: 0 }); }
  });
}
