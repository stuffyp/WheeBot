const { Card, Rarities, StatusEffects, Types } = require('../imports.js');

const NAME = 'Milkshake';
const RARITY = Rarities.Epic;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Dairy, Types.Sweet];

module.exports = new Card(NAME, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, {
    "Freeze": (self, target, gameState) => {
      //pass
    },
  });