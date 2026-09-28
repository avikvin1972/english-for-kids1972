export const unitMeta = {
  id: "unit-01",
  title: "am / is / are"
};

// Stage 1 — ПОНЯТЬ
export const introSentence = {
  text: "He is happy.",
  image: "😊",
  highlight: "is",
  audioFileId: null
};

// Stage 2 — ЗАМЕТИТЬ (просто нажать на подсвеченное слово)
export const noticeExamples = [
  { text: "I am big.", highlight: "am", image: "🐘" },
  { text: "You are sad.", highlight: "are", image: "😢" },
  { text: "They are happy.", highlight: "are", image: "😊" }
];

// Stage 3 — ВСПОМНИТЬ (без оценки, мягкая подсказка)
export const rememberItem = {
  pronoun: "She",
  correct: "is",
  rest: "happy",
  image: "😊"
};

// Stage 4 — СКАЗАТЬ (12 предложений, оцениваются)
export const quizSentences = [
  { pronoun: "I", correct: "am", rest: "happy", image: "😊" },
  { pronoun: "I", correct: "am", rest: "big", image: "🐘" },
  { pronoun: "You", correct: "are", rest: "sad", image: "😢" },
  { pronoun: "You", correct: "are", rest: "small", image: "🐭" },
  { pronoun: "He", correct: "is", rest: "a boy", image: "👦" },
  { pronoun: "He", correct: "is", rest: "happy", image: "😊" },
  { pronoun: "She", correct: "is", rest: "a girl", image: "👧" },
  { pronoun: "She", correct: "is", rest: "small", image: "🐭" },
  { pronoun: "It", correct: "is", rest: "a cat", image: "🐱" },
  { pronoun: "It", correct: "is", rest: "a dog", image: "🐶" },
  { pronoun: "We", correct: "are", rest: "happy", image: "😊" },
  { pronoun: "They", correct: "are", rest: "sad", image: "😢" }
];

// Stage 7 — НОВЫЙ КОНТЕКСТ
export const finalStory = {
  text: "I am a dog. I am happy. You are my friend!",
  image: "🐶"
};

// Stage 4b — СКАЗАТЬ вслух: полный пул фраз (52). Приложение каждый раз
// выбирает из него 6 случайных (минимум по одной с am, is и are).
const adjectives = { happy: "😊", sad: "😢", big: "🐘", small: "🐭" };
const nounEmoji = { boy: "👦", girl: "👧", cat: "🐱", dog: "🐶" };
const pronouns = [
  { word: "I", verb: "am" },
  { word: "You", verb: "are" },
  { word: "He", verb: "is" },
  { word: "She", verb: "is" },
  { word: "It", verb: "is" },
  { word: "We", verb: "are" },
  { word: "They", verb: "are" }
];
// Существительное после глагола — только логичные сочетания, артикль всегда "a"
// (все четыре слова начинаются на согласный звук).
const nounsFor = {
  I: ["boy", "girl"],
  You: ["boy", "girl"],
  He: ["boy"],
  She: ["girl"],
  It: ["cat", "dog"]
};

function buildSayPool() {
  const pool = [];
  // 1. Местоимение + прилагательное (28)
  for (const p of pronouns) {
    for (const [adj, img] of Object.entries(adjectives)) {
      pool.push({ text: `${p.word} ${p.verb} ${adj}.`, verb: p.verb, image: img });
    }
  }
  // 2. Местоимение + a + существительное (8)
  for (const p of pronouns) {
    for (const noun of nounsFor[p.word] || []) {
      pool.push({ text: `${p.word} ${p.verb} a ${noun}.`, verb: p.verb, image: nounEmoji[noun] });
    }
  }
  // 3. A + существительное + is + прилагательное (16)
  for (const [noun, img] of Object.entries(nounEmoji)) {
    for (const adj of Object.keys(adjectives)) {
      pool.push({ text: `A ${noun} is ${adj}.`, verb: "is", image: img });
    }
  }
  return pool;
}

export const sayPool = buildSayPool();
