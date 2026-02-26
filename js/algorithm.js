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