// Урок 1+: a / an, множественное число (-s), множественное число (-es).
// Все слова и фразы одобрены заранее. Здесь только данные и сборка упражнений.

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((u, v) => u[0] - v[0]).map((x) => x[1]);
const pick = (arr, n) => shuffle(arr).slice(0, n);
const twice = (s) => s + s;

// ---------- Слова ----------
// Части A и B: 13 слов
export const nouns = [
  { noun: "cat",      plural: "cats",      image: "🐱", pronoun: "It",  article: "a"  },
  { noun: "dog",      plural: "dogs",      image: "🐶", pronoun: "It",  article: "a"  },
  { noun: "boy",      plural: "boys",      image: "👦", pronoun: "He",  article: "a"  },
  { noun: "girl",     plural: "girls",     image: "👧", pronoun: "She", article: "a"  },
  { noun: "bag",      plural: "bags",      image: "🎒", pronoun: "It",  article: "a"  },
  { noun: "book",     plural: "books",     image: "📖", pronoun: "It",  article: "a"  },
  { noun: "hat",      plural: "hats",      image: "🎩", pronoun: "It",  article: "a"  },
  { noun: "apple",    plural: "apples",    image: "🍎", pronoun: "It",  article: "an" },
  { noun: "egg",      plural: "eggs",      image: "🥚", pronoun: "It",  article: "an" },
  { noun: "orange",   plural: "oranges",   image: "🍊", pronoun: "It",  article: "an" },
  { noun: "elephant", plural: "elephants", image: "🐘", pronoun: "It",  article: "an" },
  { noun: "ant",      plural: "ants",      image: "🐜", pronoun: "It",  article: "an" },
  { noun: "umbrella", plural: "umbrellas", image: "☂️", pronoun: "It",  article: "an" }
];

// Часть C: слова с -es
export const esNouns = [
  { noun: "box",   plural: "boxes",   image: "📦", pronoun: "It", article: "a" },
  { noun: "bus",   plural: "buses",   image: "🚌", pronoun: "It", article: "a" },
  { noun: "dish",  plural: "dishes",  image: "🍽️", pronoun: "It", article: "a" },
  { noun: "watch", plural: "watches", image: "⌚", pronoun: "It", article: "a" }
];

const sing = (n) => `${n.pronoun} is ${n.article} ${n.noun}.`;
const plur = (n) => `They are ${n.plural}.`;

export const partMeta = [
  { id: "unit-01plus-a", letter: "A", label: "a / an" },
  { id: "unit-01plus-b", letter: "B", label: "cats, dogs" },
  { id: "unit-01plus-c", letter: "C", label: "boxes, buses" }
];

// ---------- Экраны «Понять» ----------
// pre + hl + post = предложение; hl подсвечивается зелёным.
export const introScreens = [
  [
    { image: "🐱", text: "It is a cat.",    pre: "It is ", hl: "a",  post: " cat." },
    { image: "🍎", text: "It is an apple.", pre: "It is ", hl: "an", post: " apple." }
  ],
  [
    { image: "🐱",   text: "It is a cat.",    pre: "It is a cat.",  hl: "",  post: "" },
    { image: "🐱🐱", text: "They are cats.",  pre: "They are cat",  hl: "s", post: "." }
  ],
  [
    { image: "📦",   text: "It is a box.",     pre: "It is a box.",   hl: "",   post: "" },
    { image: "📦📦", text: "They are boxes.",  pre: "They are box",   hl: "es", post: "." }
  ]
];

// ---------- Экраны «Заметить» (нажать на подсвеченное) ----------
export const noticeItems = [
  [
    { image: "🐶", text: "It is a dog.",    pre: "It is ", hl: "a",  post: ' <u class="first">d</u>og.' },
    { image: "🍎", text: "It is an apple.", pre: "It is ", hl: "an", post: ' <u class="first">a</u>pple.' },
    { image: "🎩", text: "It is a hat.",    pre: "It is ", hl: "a",  post: ' <u class="first">h</u>at.' },
    { image: "🥚", text: "It is an egg.",   pre: "It is ", hl: "an", post: ' <u class="first">e</u>gg.' }
  ],
  [
    { image: "🐶🐶", text: "They are dogs.",   pre: "They are dog",   hl: "s", post: "." },
    { image: "🍎🍎", text: "They are apples.", pre: "They are apple", hl: "s", post: "." },
    { image: "📖📖", text: "They are books.",  pre: "They are book",  hl: "s", post: "." },
    { image: "👧👧", text: "They are girls.",  pre: "They are girl",  hl: "s", post: "." }
  ],
  [
    { image: "📦📦", text: "They are boxes.",   pre: "They are box",   hl: "es", post: "." },
    { image: "🚌🚌", text: "They are buses.",   pre: "They are bus",   hl: "es", post: "." },
    { image: "🐱🐱", text: "They are cats.",    pre: "They are cat",   hl: "s",  post: "." },
    { image: "⌚⌚", text: "They are watches.", pre: "They are watch", hl: "es", post: "." }
  ]
];

// ---------- «Вспомнить» (без оценки) ----------
export const rememberItems = [
  { image: "🍊", html: "It is {blank} orange.", blank: "___", choices: ["a", "an"],
    correct: "an", full: "It is an orange.", ask: "It is ... orange." },
  { image: "🐘🐘", html: "They are {blank}.", blank: "___", choices: ["elephant", "elephants"],
    correct: "elephants", full: "They are elephants.", ask: "They are ..." },
  { image: "🍽️🍽️", html: "They are dish{blank}.", blank: "__", choices: ["s", "es"],
    correct: "es", full: "They are dishes.", ask: "They are ..." }
];

// ---------- «Новый контекст» ----------
export const stories = [
  { image: "🐱 🍎",         text: "It is a cat. It is an apple." },
  { image: "🐶🐶<br>🍎🍎",   text: "They are dogs. They are apples." },
  { image: "📦📦<br>⌚⌚",   text: "They are boxes. They are watches." }
];

// ---------- Оцениваемые упражнения (собираются заново при каждом прохождении) ----------
export function makeQuiz(p) {
  if (p === 0) {
    const chosen = shuffle(
      pick(nouns.filter((n) => n.article === "a"), 3)
        .concat(pick(nouns.filter((n) => n.article === "an"), 3))
    );
    return chosen.map((n) => ({
      image: n.image,
      html: `${n.pronoun} is {blank} ${n.noun}.`,
      blank: "___",
      choices: ["a", "an"],
      correct: n.article,
      full: sing(n),
      ask: `${n.pronoun} is ... ${n.noun}.`
    }));
  }

  if (p === 1) {
    const chosen = pick(nouns, 6);
    return shuffle(chosen.map((n, i) => {
      if (i < 3) {
        return {
          image: n.image,
          html: `${n.pronoun} is ${n.article} {blank}.`,
          blank: "___",
          choices: shuffle([n.noun, n.plural]),
          correct: n.noun,
          full: sing(n),
          ask: `${n.pronoun} is ${n.article} ...`
        };
      }
      return {
        image: twice(n.image),
        html: "They are {blank}.",
        blank: "___",
        choices: shuffle([n.noun, n.plural]),
        correct: n.plural,
        full: plur(n),
        ask: "They are ..."
      };
    }));
  }

  // Часть C: 4 слова с -es и 2 слова с -s, нужно выбрать окончание
  const simple = nouns.filter((n) => ["cat", "dog", "book", "hat", "bag", "girl", "boy"].includes(n.noun));
  const chosen = shuffle(esNouns.concat(pick(simple, 2)));
  return chosen.map((n) => {
    const ending = n.plural.slice(n.noun.length);
    return {
      image: twice(n.image),
      html: `They are ${n.noun}{blank}.`,
      blank: "__",
      choices: ["s", "es"],
      correct: ending,
      full: plur(n),
      ask: "They are ..."
    };
  });
}

// ---------- «Сказать» (6 случайных фраз из пула) ----------
function pickWith(pool, n, rules) {
  let chosen = [];
  for (const [pred, min] of rules) {
    chosen = chosen.concat(pick(pool.filter((x) => pred(x) && !chosen.includes(x)), min));
  }
  const rest = shuffle(pool.filter((x) => !chosen.includes(x)));
  return shuffle(chosen.concat(rest.slice(0, n - chosen.length)));
}

export function makeSay(p) {
  if (p === 0) {
    const pool = nouns.map((n) => ({ text: sing(n), image: n.image, kind: n.article }));
    return pickWith(pool, 6, [[(x) => x.kind === "a", 2], [(x) => x.kind === "an", 2]]);
  }
  if (p === 1) {
    const pool = nouns.map((n) => ({ text: plur(n), image: twice(n.image) }));
    return pickWith(pool, 6, []);
  }
  const pool = [];
  for (const n of esNouns) {
    pool.push({ text: sing(n), image: n.image, kind: "one" });
    pool.push({ text: plur(n), image: twice(n.image), kind: "many" });
  }
  return pickWith(pool, 6, [[(x) => x.kind === "one", 2], [(x) => x.kind === "many", 2]]);
}
