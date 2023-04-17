module.exports = {
  randInt: n => Math.floor(Math.random() * n),
  randRange: (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  },
  rollChance: prob => Math.random() < prob,
  rollTiers: tiers => {
    const roll = Math.random();
    let curSum = 0;
    for (const [index, prob] of tiers.entries()) {
      curSum += prob;
      if (roll < curSum) {
        return index;
      }
    }
    return -1;
  },
}