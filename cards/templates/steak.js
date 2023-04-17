const { Card, Rarities, StatusEffects, Types } = require('../imports.js');

const NAME = 'Steak';
const RARITY = Rarities.Legendary;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Protein];

module.exports = new Card(NAME, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, {
    "Well Done": (self, target, gameState) => {
      //pass
    },
  });