const randInt = (n) => Math.floor(Math.random() * n);

module.exports = {
  randInt: randInt,
  randRange: (min, max) => {
    return min + randInt(max - min);
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
  sampleRange: (max, numSamples) => {
    const bucket = [...Array(max).keys()];
    const result = [];
    for (let i = 0; i < numSamples; i++) {
      result.push(bucket.splice(randInt(bucket.length), 1)[0]);
    }
    return result;
  }
}


// console.error(module.exports.sampleRange(5, 5));