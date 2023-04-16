const { Card, StatusEffects, Types } = require('../imports.js');

const NAME = 'Baguette';
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Carb];

module.exports = new Card(NAME, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, {
    "Harden": (self, target, gameState) => {
      if (StatusEffects.DefenseUp in self.statusEffects) return;
      self.statusEffects.push(StatusEffects.DefenseUp);
    },
  });