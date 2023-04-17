const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Mango';
const RARITY = Rarities.Rare;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Fruit, Types.Sweet];

const HEADER = [NAME, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES];

module.exports = new Card(...HEADER, {
  "Foo": {
    description: "foo",
    level: 5,
    execute: (self, target, gameState) => {
      //pass
    },
  },
});