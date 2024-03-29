const fs = require('node:fs');
const path = require('node:path');
const Card = require('./card.js');
const { rollTiers, randInt } = require('../util/random.js');
const { Rarities } = require('../util/enums.js');
const { ROLL_CHANCES } = require('../util/constants.js');

const formatCardID = (name) => name.trim().toLowerCase();

const CARDS = {
  [`${Rarities.Common}`]: [],
  [`${Rarities.Rare}`]: [],
  [`${Rarities.Epic}`]: [],
  [`${Rarities.Legendary}`]: [],
};
const ALL_CARDS = {};
const TIERS = [Rarities.Common, Rarities.Rare, Rarities.Epic, Rarities.Legendary];
const RARITY_TO_INT = {
  [`${Rarities.Common}`]: 0,
  [`${Rarities.Rare}`]: 1,
  [`${Rarities.Epic}`]: 2,
  [`${Rarities.Legendary}`]: 3,
};

const templateFolder = path.join(__dirname, 'templates');
const commonFolder = path.join(templateFolder, 'common');
const rareFolder = path.join(templateFolder, 'rare');
const epicFolder = path.join(templateFolder, 'epic');
const legendaryFolder = path.join(templateFolder, 'legendary');
const rarityToFolder = {
  [`${Rarities.Common}`]: commonFolder,
  [`${Rarities.Rare}`]: rareFolder,
  [`${Rarities.Epic}`]: epicFolder,
  [`${Rarities.Legendary}`]: legendaryFolder,
};

for (const [rarity, folder] of Object.entries(rarityToFolder)) {
  const templateFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
  for (const file of templateFiles) {
    const filePath = path.join(folder, file);
    const card = require(filePath);
    if (!(card instanceof Card)) {
      console.log(`[WARNING] The card at ${filePath} does not inherit from the "Card" class.`);
      continue;
    }
    // console.error(card.abilities);
    if (!card.abilities.every((ability) => {
      return (
        'name' in ability &&
        'description' in ability &&
        'shortDescription' in ability &&
        ability.shortDescription.length < 100 &&
        'level' in ability &&
        'type' in ability &&
        'priority' in ability &&
        'execute' in ability &&
        'target' in ability
      );
    })) {
      console.log(`[WARNING] The card at ${filePath} is missing ability properties.`);
      continue;
    }
    CARDS[rarity].push(formatCardID(card.name));
    ALL_CARDS[formatCardID(card.name)] = card;
  }
}

module.exports = {
  rollCard: () => {
    const tierIndex = rollTiers(ROLL_CHANCES);
    const tier = CARDS[TIERS[tierIndex]];
    const cardNum = randInt(tier.length);
    const cardID = tier[cardNum];
    return [cardID, ALL_CARDS[cardID]];
  },
  getCard: (name) => {
    return ALL_CARDS[formatCardID(name)];
  },
  formatCardID: formatCardID,
  getRarity: (name) => {
    return RARITY_TO_INT[ALL_CARDS[formatCardID(name)].rarity];
  },
};

// console.error(NAME_TO_ID);