const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Water';
const DESCRIPTION = 'A necessity of life.';
const RARITY = Rarities.Common;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Water];

const hydrate = {
  name: 'Hydrate', 
  description: 'Description',
  level: 5,
  type: Types.Water,
  execute: (self, target, gameState) => {
    // pass
  },
};

const ABILITIES = [hydrate];

const HEADER = [NAME, DESCRIPTION, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);