const { Card, Rarities, StatusEffects, Types, Targets } = require('../../imports.js');

const NAME = 'Water';
const DESCRIPTION = 'A necessity of life.';
const IMAGE_SRC = 'pikachu.png';
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
  level: 1,
  type: Types.Water,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    // pass
  },
};

const ABILITIES = [hydrate];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);