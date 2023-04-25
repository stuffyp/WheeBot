const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Raymond';
const DESCRIPTION = 'Uncatchable.';
const RARITY = Rarities.Mythic;
const HEALTH = 1000;
const ATTACK = 1000;
const DEFENSE = 1000;
const SPEED = 1000;
const MAGIC = 1000;
const TYPES = [Types.None];

const develop = {
  name: 'Develop', 
  description: 'Develops the bot.',
  level: 5,
  type: Types.None,
  priority: 0,
  execute: (self, target, gameState) => {
    // pass
  },
};

const ABILITIES = [develop];

const HEADER = [NAME, DESCRIPTION, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);