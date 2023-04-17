const fs = require('node:fs');
const path = require('node:path');
const Card = require('./card.js');
const { randInt } = require('../util/random.js');

const CARDS = [];
const templateFolder = path.join(__dirname, 'templates');
const templateFiles = fs.readdirSync(templateFolder).filter(file => file.endsWith('.js'));
for (const file of templateFiles) {
  const filePath = path.join(templateFolder, file);
  const card = require(filePath);
  if (!(card instanceof Card)) {
    console.log(`[WARNING] The card at ${filePath} does not inherit from the "Card" class.`);
    continue;
  }
  // console.error(card.abilities);
  if (!Object.values(card.abilities).every((ability) => {
    return (
      'description' in ability && 
      'level'       in ability && 
      'execute'     in ability
    );
  })) {
    console.log(`[WARNING] The card at ${filePath} is missing ability properties.`);
    continue;
  }
  CARDS.push(card);
}

module.exports = {
  rollCard: () => {
    const id = randInt(CARDS.length);
    return [id, CARDS[id]];
  },
  getCard: id => CARDS[id],
}

// console.log(module.exports.rollCard());