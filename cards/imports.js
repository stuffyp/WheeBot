const Card = require('./card.js');
const { Rarities, StatusEffects, Stats, Types, Events, Targets } = require('../util/enums.js');
const { damageCalc, typeAdvantage } = require('../util/math-func.js');
const { rollChance } = require('../util/random.js');

module.exports = {
  Card: Card,
  Rarities: Rarities,
  StatusEffects: StatusEffects,
  Targets: Targets,
  Types: Types,
  Events: Events,
  Stats: Stats,
  damageCalc: damageCalc,
  typeAdvantage: typeAdvantage,
  rollChance: rollChance,
}