const { Card, Rarities, StatusEffects, Types } = require('../imports.js');

const NAME = 'Mango';
const RARITY = Rarities.Rare;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Fruit, Types.Sweet];

module.exports = new Card(NAME, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, {
    "Foo": (self, target, gameState) => {
      //pass
    },
  });