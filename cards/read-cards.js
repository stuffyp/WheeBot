const fs = require('node:fs');
const path = require('node:path');
const Card = require('./card.js');
const { rollTiers, randInt } = require('../util/random.js');
const { Rarities } = require('../util/enums.js');
const { ROLL_CHANCES } = require('../util/constants.js');

const CARDS = {
  [`${Rarities.Common}`]: [],
  [`${Rarities.Rare}`]: [],
  [`${Rarities.Epic}`]: [],
  [`${Rarities.Legendary}`]: [],
};
const NAME_TO_ID = {
  
};
const TIERS = [Rarities.Common, Rarities.Rare, Rarities.Epic, Rarities.Legendary];
const ID_GAP = 1000;

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
        'name'        in ability &&
        'description' in ability && 
        'level'       in ability && 
        'type'        in ability &&
        'execute'     in ability
      );
    })) {
      console.log(`[WARNING] The card at ${filePath} is missing ability properties.`);
      continue;
    }
    CARDS[rarity].push(card);
    
    const baseID = TIERS.indexOf(rarity) * ID_GAP;
    NAME_TO_ID[card.name.toLowerCase()] = baseID + CARDS[rarity].length - 1;
  }
}


module.exports = {
  rollCard: () => {
    const tierIndex = rollTiers(ROLL_CHANCES);
    const tier = CARDS[TIERS[tierIndex]];
    const cardNum = randInt(tier.length);
    const id = tierIndex * ID_GAP + cardNum;
    return [id, tier[cardNum]];
  },
  getCard: (id) => {
    const tierIndex = Math.floor(id / ID_GAP);
    const cardNum = id % ID_GAP;
    return CARDS[TIERS[tierIndex]][cardNum];
  },
  getID: (name) => NAME_TO_ID[name.toLowerCase()],
}

// console.error(NAME_TO_ID);