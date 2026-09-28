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
