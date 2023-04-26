const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Milkshake';
const DESCRIPTION = 'Tastes good.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Epic;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Water, Types.Plant];

const brainFreeze = {
  name: 'Brain Freeze', 
  description: 'Description',
  level: 5,
  type: Types.Water,
  priority: 0,
  execute: (self, target, gameState) => {
    // pass
  },
};

const foo = {
  name: 'Foo', 
  description: 'foo',
  level: 5,
  type: Types.Shock,
  priority: 0,
  execute: (params) => {
    // pass
  },
};

const ABILITIES = [brainFreeze, foo];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);