const { Card, Rarities, StatusEffects, Types, Targets, Events, Stats, damageCalc, typeAdvantage } = require('../../imports.js');

const NAME = 'Water';
const DESCRIPTION = 'A necessity of life.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 90;
const ATTACK = 60;
const DEFENSE = 40;
const SPEED = 40;
const MAGIC = 40;
const TYPES = [Types.Water];

const HYDRATE_POWER = 0.6;
const HYDRATE_TYPE = Types.Water;
const hydrate = {
  name: 'Hydrate', 
  description: 'Description',
  level: 1,
  type: HYDRATE_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      HYDRATE_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      HYDRATE_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(HYDRATE_TYPE, target.types));
    self.emitEvent(Events.didAttack);
    target.emitEvent(Events.gotAttacked);
  },
};

const ABILITIES = [hydrate];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);