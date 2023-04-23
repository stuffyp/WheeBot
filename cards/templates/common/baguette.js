const { Card, Rarities, StatusEffects, Types } = require('../../imports.js');

const NAME = 'Baguette';
const DESCRIPTION = 'Your standard fare.';
const RARITY = Rarities.Common;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Earth];

const harden = {
  name: 'Harden', 
  description: 'Description',
  level: 5,
  type: Types.None,
  execute: (self, target, gameState) => {
    // pass
  },
};

const ABILITIES = [harden];

const HEADER = [NAME, DESCRIPTION, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);