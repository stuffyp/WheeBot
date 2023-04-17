const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Milkshake';
const RARITY = Rarities.Epic;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Dairy, Types.Sweet];

const HEADER = [NAME, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES];

module.exports = new Card(...HEADER, {
  "Brain Freeze": {
    description: "foo",
    level: 5,
    execute: (self, target, gameState) => {
      //pass
    },
  },
  "Foo": {
    description: "foo",
    level: 10,
    execute: (self, target, gameState) => {
      //pass
    },
  },
});