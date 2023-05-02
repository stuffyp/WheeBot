const { Card, Rarities, StatusEffects, Types, Targets, 
       Events, Stats, damageCalc, typeAdvantage, rollChance, 
       Modifier, Listener } = require('../../imports.js');

const NAME = 'Cindra';
const DESCRIPTION = 'They say that these creatures create small bursts of flame to intimidate predators.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 80;
const ATTACK = 60;
const DEFENSE = 40;
const SPEED = 60;
const MAGIC = 40;
const TYPES = [Types.Fire, Types.Wind];


const FIREBALL_TYPE = Types.Fire;
const FIREBALL_POWER = 0.6;
const fireball = {
  name: 'Fireball', 
  description: 'Deal moderate damage. 60% chance to burn target.',
  level: 1,
  type: FIREBALL_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      FIREBALL_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      FIREBALL_TYPE,
      target.types,
    );
    if (!target.types.includes(Types.Water) && rollChance(0.6)) {
      target.status = StatusEffects.Burn;
      self.log(`${target.name} became burned!`);
    }
    target.doDamage(damage, typeAdvantage(FIREBALL_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};

const GUST_TYPE = Types.Wind;
const GUST_POWER = 0.4;
const gust = {
  name: 'Gust', 
  description: 'Deal light damage. Reduce the speed of target creature by 40% next turn.',
  level: 1,
  type: GUST_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      GUST_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      GUST_TYPE,
      target.types,
    );
    target.modifiers.push(new Modifier({
      stat: Stats.Speed,
      duration: 1,
      modify: (spd, params) => spd * 0.6,
    }));
    target.log(`${target.name}'s speed fell!'`);
    target.doDamage(damage, typeAdvantage(GUST_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};

const ABILITIES = [fireball, gust];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);