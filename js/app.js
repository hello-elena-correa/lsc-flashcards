const API_URL =
  "https://script.google.com/macros/s/AKfycbyjfMlSzROFIx14LM15R24DN0ro80xRzuAWPb8-pcWk7VDG4tR5rqLXeR9kfyhU54XN/exec";

let words = [];
let availableWords = [];
let currentWord = null;
let totalCorrect = 0;
let totalWrong = 0;
let selectedLevel = "ALL";
let forgottenWords = [];

const wordElement = document.getElementById("word");
const correctBtn = document.getElementById("correctBtn");
const wrongBtn = document.getElementById("wrongBtn");
const correctCountElement = document.getElementById("correctCount");
const wrongCountElement = document.getElementById("wrongCount");
const levelElement = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");

const allLevelsBtn = document.getElementById("allLevelsBtn");
const level1Btn = document.getElementById("level1Btn");
const level2Btn = document.getElementById("level2Btn");
const level3Btn = document.getElementById("level3Btn");

const reviewSection = document.getElementById("reviewSection");
const reviewToggle = document.getElementById("reviewToggle");
const reviewCount = document.getElementById("reviewCount");
const reviewList = document.getElementById("reviewList");

function updateReviewList() {

  reviewCount.textContent = forgottenWords.length;

  if (forgottenWords.length === 0) {
    reviewSection.style.display = "none";
    return;
  }

  reviewSection.style.display = "block";

  reviewList.innerHTML = forgottenWords
    .map((word) => `<div>• ${capitalizeFirstLetter(word.text)}</div>`)
    .join("");
}

const levelButtons = [
  allLevelsBtn,
  level1Btn,
  level2Btn,
  level3Btn,
];

levelButtons.forEach((button) => {
  button.disabled = true;
});


async function loadWords() {
  const response = await fetch(API_URL);
  const data = await response.json();

  words = data.words;

  levelButtons.forEach((button) => {
    button.disabled = false;
  });
}


function resetSessionStats() {
  totalCorrect = 0;
  totalWrong = 0;

  updateStats();
}


function getWeightedRandom(words) {
  const weights = words.map((word) => {
    return (word.wrong + 1) / (word.correct + 1);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < words.length; i++) {
    if (random < weights[i]) {
      return words[i];
    }

    random -= weights[i];
  }
}


function showNewWord() {
  currentWord = getWeightedRandom(availableWords);

  wordElement.textContent = capitalizeFirstLetter(currentWord.text);

  if (selectedLevel === "ALL") {
    levelElement.textContent = "Todos los niveles";
  } else {
    levelElement.textContent = `Nivel ${selectedLevel.replace("Level", "")}`;
  }

  updateStats();
}


function updateStats() {
  correctCountElement.textContent = totalCorrect;
  wrongCountElement.textContent = totalWrong;
}


async function updateWord(word, isCorrect) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      text: word.text,
      level: word.level,
      isCorrect: isCorrect,
    }),
  });

  await response.json();
}


async function handleAnswer(isCorrect) {

  if (isCorrect) {

    currentWord.correct++;
    totalCorrect++;

    // Quitar la palabra de la sesión
    availableWords = availableWords.filter(
      (word) => word.text !== currentWord.text
    );

  } else {

    currentWord.wrong++;
    totalWrong++;

    if (!forgottenWords.some((word) => word.text === currentWord.text)) {
      forgottenWords.push(currentWord);
    }

    updateReviewList();
  }

  updateStats();

  await updateWord(currentWord, isCorrect);

  await loadWords();

  showNewWord();
}


function selectLevel(level) {

  selectedLevel = level;

  if (level === "ALL") {
    availableWords = words;
  } else {
    availableWords = words.filter(
      (word) => word.level === level
    );
  }

  startScreen.style.display = "none";
  gameScreen.style.display = "block";

  showNewWord();
}


function capitalizeFirstLetter(text) {

  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);
}


/* Answer buttons */

correctBtn.addEventListener("click", () => {
  handleAnswer(true);
});

wrongBtn.addEventListener("click", () => {
  handleAnswer(false);
});


/* Level buttons */

allLevelsBtn.addEventListener("click", () => {
  selectLevel("ALL");
});

level1Btn.addEventListener("click", () => {
  selectLevel("Level1");
});

level2Btn.addEventListener("click", () => {
  selectLevel("Level2");
});

level3Btn.addEventListener("click", () => {
  selectLevel("Level3");
});

/* Review list toggle */
reviewToggle.addEventListener("click", () => {
  if (reviewList.style.display === "block") {
    reviewList.style.display = "none";
  } else {
    reviewList.style.display = "block";
  }
});


/* Initialize */

(async function init() {
  await loadWords();
  resetSessionStats();
})();