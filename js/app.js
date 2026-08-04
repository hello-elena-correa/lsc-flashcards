const API_URL = "https://script.google.com/macros/s/AKfycbyjfMlSzROFIx14LM15R24DN0ro80xRzuAWPb8-pcWk7VDG4tR5rqLXeR9kfyhU54XN/exec";

console.log("APP VERSION 2026-09-03 00:20");

let words = [];
let currentWord = null;
let totalCorrect = 0;
let totalWrong = 0;

const wordElement = document.getElementById("word");
const correctBtn = document.getElementById("correctBtn");
const wrongBtn = document.getElementById("wrongBtn");
const correctCountElement = document.getElementById("correctCount");
const wrongCountElement = document.getElementById("wrongCount");
const levelElement = document.getElementById("level");

async function loadWords() {
  const response = await fetch(API_URL);
  const data = await response.json();

  words = data.words;

  totalCorrect = data.stats.correct;
  totalWrong = data.stats.wrong;

  correctCountElement.textContent = totalCorrect;
  wrongCountElement.textContent = totalWrong;
}
function getWeightedRandom(words) {
  const weights = words.map(word => {
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
  currentWord = getWeightedRandom(words);

  wordElement.textContent = capitalizeFirstLetter(currentWord.text);
  levelElement.textContent = `Nivel: ${currentWord.level}`;

  updateStats();
}

function updateStats() {
  correctCountElement.textContent = totalCorrect;
  wrongCountElement.textContent = totalWrong;
}

async function updateWord(word) {

  console.log("Enviando:", word);

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(word)
  });

  const result = await response.json();
  console.log(result);
}

async function handleAnswer(isCorrect) {
  if (isCorrect) {
  currentWord.correct++;
  totalCorrect++;
} else {
  currentWord.wrong++;
  totalWrong++;
}

correctCountElement.textContent = totalCorrect;
wrongCountElement.textContent = totalWrong;

  await updateWord(currentWord);

  await loadWords();

  console.log(words.find(w => w.text === currentWord.text));

  showNewWord();
}

function capitalizeFirstLetter(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

correctBtn.addEventListener("click", () => handleAnswer(true));
wrongBtn.addEventListener("click", () => handleAnswer(false));

(async function init() {
  await loadWords();
  console.log(words);
  showNewWord();
})();
