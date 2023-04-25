const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Steak';
const DESCRIPTION = 'Fresh off the grill.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Legendary;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Fire, Types.Beast];

const wellDone = {
  name: 'Well Done', 
  description: 'Description',
  level: 5,
  type: Types.Fire,
  priority: 0,
  execute: (self, target, gameState) => {
    // pass
  },
};

const ABILITIES = [wellDone];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);