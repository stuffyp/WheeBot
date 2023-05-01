const Card = require('./card.js');
const { Rarities, StatusEffects, Stats, Types, Events, Targets } = require('../util/enums.js');
const { damageCalc } = require('../util/math-func.js');

module.exports = {
  Card: Card,
  Rarities: Rarities,
  StatusEffects: StatusEffects,
  Targets: Targets,
  Types: Types,
  Events: Events,
  Stats: Stats,
  damageCalc: damageCalc,
}