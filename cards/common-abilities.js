const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc, typeAdvantage, Listener,
    Modifier, rollChance, randInt } = require('./imports.js');

const TACKLE_POWER = 0.6;
const TACKLE_TYPE = Types.None;
const tackle = {
    name: 'Tackle',
    description: 'Deal moderate damage.',
    shortDescription: 'Deal moderate damage.',
    level: 1,
    type: TACKLE_TYPE,
    priority: 0,
    target: Targets.Field,
    cost: 0,
    execute: (params) => {
        const self = params.self;
        const target = params.target;
        const damage = damageCalc(
            TACKLE_POWER * self.getBaseStat(Stats.Attack), 
            self.getStat(Stats.Attack, { self: self }), 
            target.getStat(Stats.Defense, { self: target }),
            TACKLE_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(TACKLE_TYPE, target.types));
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    },
};

const cleanseBuilder = (level) => ({
    name: 'Cleanse',
    description: 'Remove all effects and conditions from a target. Acts early.',
    shortDescription: 'Remove all effects and conditions from a target.',
    level: level,
    type: Types.None,
    priority: 1,
    target: Targets.Field,
    cost: 20,
    execute: (params) => {
        const target = params.target;
        target.listeners = [];
        target.modifiers = [];
        target.status = null;
        target.log(`${target.name} was cleansed of all effects and conditions!`);
    },
});

const SLASH_TYPE = Types.Beast;
const SLASH_POWER = 0.4;
const slashBuilder = (level) => ({
  name: 'Slash',
  description: 'Deal light damage. Hits twice.',
  shortDescription: 'Deal light damage. Hits twice.',
  level: level,
  type: SLASH_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      SLASH_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      SLASH_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(SLASH_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage})
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    if (!target.knockedOut() && !self.knockedOut()) {
      target.doDamage(damage, typeAdvantage(SLASH_TYPE, target.types));
      self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
      target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    }
  },
});

const GUST_TYPE = Types.Wind;
const GUST_POWER = 0.4;
const gustBuilder = (level) => ({
  name: 'Gust',
  description: 'Deal light damage. Reduce the speed of target creature by 40% next turn.',
  shortDescription: 'Deal light damage. Reduce the speed of target creature by 40% next turn.',
  level: level,
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
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
  },
});

const FIREBALL_TYPE = Types.Fire;
const FIREBALL_POWER = 0.6;
const fireballBuilder = (level) => ({
  name: 'Fireball',
  description: 'Deal moderate damage. 70% chance to burn target.',
  shortDescription: 'Deal moderate damage. 70% chance to burn target.',
  level: level,
  type: FIREBALL_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 30,
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
});

module.exports = {
    tackle,
    cleanseBuilder,
    slashBuilder,
    gustBuilder,
    fireballBuilder,
};