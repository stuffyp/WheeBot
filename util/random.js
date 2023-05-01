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
  sampleRange: (bucket, numSamples) => {
    const bucketCopy = bucket.slice();
    const result = [];
    for (let i = 0; i < numSamples; i++) {
      result.push(bucketCopy.splice(randInt(bucketCopy.length), 1)[0]);
    }
    return result;
  },
  shuffleArray: (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  },
}


// console.error(module.exports.sampleRange(5, 5));