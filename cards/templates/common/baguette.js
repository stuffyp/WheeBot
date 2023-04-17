const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Baguette';
const RARITY = Rarities.Common;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Carb];

const HEADER = [NAME, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES];

module.exports = new Card(...HEADER, {
  "Harden": {
    description: "foo",
    level: 5,
    execute: (self, target, gameState) => {
      if (StatusEffects.DefenseUp in self.statusEffects) return;
      self.statusEffects.push(StatusEffects.DefenseUp);
    },
  },
});