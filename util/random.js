module.exports = {
  randInt: n => Math.floor(Math.random() * n),
  randRange: (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  },
  rollChance: prob => Math.random() < prob,
}