const { Card, Rarities, StatusEffects, Types, Targets, 
       Events, Stats, damageCalc, typeAdvantage, rollChance, 
       Modifier, Listener, randInt } = require('../../imports.js');

const NAME = 'Cindra';
const DESCRIPTION = 'They say that these creatures create small bursts of flame to intimidate predators.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 80;
const ATTACK = 60;
const DEFENSE = 35;
const SPEED = 60;
const MAGIC = 50;
const TYPES = [Types.Fire, Types.Wind];


const FIREBALL_TYPE = Types.Fire;
const FIREBALL_POWER = 0.6;
const fireball = {
  name: 'Fireball', 
  description: 'Deal moderate damage. 50% chance to burn target.',
  level: 1,
  type: FIREBALL_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 50,
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
    target.doDamage(damage, typeAdvantage(FIREBALL_TYPE, target.types));
    if (rollChance(0.7)) target.doBurn();
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
    target.log(`${target.name}'s speed fell!`);
    target.doDamage(damage, typeAdvantage(GUST_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};

const FIREWORK_TYPE = Types.Fire;
const FIREWORK_POWER = 0.4;
const FIREWORK_NAME = 'Fireworks';
const firework = {
  name: FIREWORK_NAME, 
  description: 'For each modifier on this creature (or at least once), deal light damage to a random enemy.',
  level: 1,
  type: FIREWORK_TYPE,
  priority: 0,
  target: Targets.None,
  cost: 100,
  execute: (params) => {
    const self = params.self;
    const numTimes = Math.max(1, self.modifiers.length);
    self.log(`${FIREWORK_NAME} will activate ${numTimes} time(s)!`);
    for (let i = 0; i < numTimes; i++) {
      const enemies = self.utilFuncs.enemies();
      const target = enemies[randInt(enemies.length)];
      if (target.knockedOut()) {
        self.log(`${target.name} was hit by ${FIREWORK_NAME} but ${target.name} had already been knocked out!`);
      }
      const damage = damageCalc(
        FIREWORK_POWER * self.getBaseStat(Stats.Attack), 
        self.getStat(Stats.Attack, { self: self }), 
        target.getStat(Stats.Defense, { self: target }),
        FIREWORK_TYPE,
        target.types,
      );
      target.doDamage(damage, typeAdvantage(FIREWORK_TYPE, target.types), FIREWORK_NAME);
      self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
      target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    }
  },
};


const ABILITIES = [fireball, gust, firework];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);