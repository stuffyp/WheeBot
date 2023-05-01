const { Card, Rarities, StatusEffects, Types, Stats, Events, Targets, damageCalc, typeAdvantage } = require('../../imports.js');

const NAME = 'Baguette';
const DESCRIPTION = 'Your standard fare.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Earth];

const HARDEN_POWER = 0.6;
const HARDEN_TYPE = Types.Earth;
const harden = {
  name: 'Harden', 
  description: 'Deal moderate damage.',
  level: 1,
  type: HARDEN_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      HARDEN_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      HARDEN_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(HARDEN_TYPE, target.types));
    self.emitEvent(Events.didAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.gotAttacked, { self: target, agent: self, damage: damage});
  },
};

const SLAM_POWER = 0.6;
const SLAM_TYPE = Types.None;
const slam = {
  name: 'Slam', 
  description: 'Deal moderate damage.',
  level: 1,
  type: SLAM_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      SLAM_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      SLAM_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(SLAM_TYPE, target.types));
    self.emitEvent(Events.didAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.gotAttacked, { self: target, agent: self, damage: damage});
  },
};

const ABILITIES = [harden, slam];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);