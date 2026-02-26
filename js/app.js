const API_URL = "https://script.google.com/macros/s/AKfycbxewAVYtjUxZUSBfb0AZbhEzoGTnTF3-ASfiplxU2_eAi3j-jPPTzbTrVmRwyY7N3_m/exec";

let words = [];
let currentWord = null;

const wordElement = document.getElementById("word");
const correctBtn = document.getElementById("correctBtn");
const wrongBtn = document.getElementById("wrongBtn");
const correctCountElement = document.getElementById("correctCount");
const wrongCountElement = document.getElementById("wrongCount");
const levelElement = document.getElementById("level");

async function loadWords() {
  const response = await fetch(API_URL);
  words = await response.json();
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
  correctCountElement.textContent = currentWord.correct;
  wrongCountElement.textContent = currentWord.wrong;
}

async function updateWord(word) {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(word),
  });
}

async function handleAnswer(isCorrect) {
  if (isCorrect) {
    currentWord.correct++;
  } else {
    currentWord.wrong++;
  }

  await updateWord(currentWord);

  // 🔥 SINCRONIZAR DE NUEVO DESDE EL BACKEND
  await loadWords();

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
  showNewWord();
})();