const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Mango';
const DESCRIPTION = 'We like fruits.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Rare;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Plant];

const foo = {
  name: 'Foo', 
  description: 'bar',
  level: 5,
  type: Types.Plant,
  priority: 0,
  execute: (self, target, gameState) => {
    // pass
  },
};

const ABILITIES = [foo];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);