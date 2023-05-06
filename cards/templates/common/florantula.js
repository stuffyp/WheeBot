const { Card, Rarities, StatusEffects, Types, Targets, 
       Events, Stats, damageCalc, typeAdvantage, Listener } = require('../../imports.js');

const NAME = 'Florantula';
const DESCRIPTION = 'Neither flower nor bug, but something in between.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 100;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 50;
const MAGIC = 40;
const TYPES = [Types.Plant];

const cleanse = {
  name: 'Cleanse', 
  description: 'Remove all effects and conditions from a target. Acts early.',
  shortDescription: 'Remove all effects and conditions from a target.',
  level: 1,
  type: Types.None,
  priority: 1,
  target: Targets.Field,
  cost: 20,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    target.listeners = [];
    target.modifiers = [];
    target.status = null;
    target.log(`${target.name} was cleansed of all effects and conditions!`);
  },
};

const PARASITE_TYPE = Types.Plant;
const PARASITE_POWER = 0.3;
const PARASITE_NAME = 'Parasitic Touch';
const parasite = {
  name: PARASITE_NAME, 
  description: "Deal light damage. Add an effect that drains 10% health from the target at the start of their turn.",
  shortDescription: "Deal light damage. ADD EFFECT: Drain 10% health from target each turn.",
  level: 1,
  type: PARASITE_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 30,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      PARASITE_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      PARASITE_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(PARASITE_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
    if (!target.knockedOut()) {
      target.listeners.push(new Listener({
        name: 'Parasitic Touch',
        triggers: [Events.TurnStart],
        duration: Infinity,
        doEffect: (params) => {
          if (!self.knockedOut() && self.onField) {
            const damage = Math.min(target.health, Math.ceil(target.maxHealth * 0.1));
            target.doDamage(damage, 1, PARASITE_NAME);
            self.doHeal(damage, PARASITE_NAME);
          }
        },
      }));
      target.log(`${target.name} is affected by ${PARASITE_NAME}!`);
    }
  },
};

const TOXIN_NAME = 'Neurotoxin';
const toxin = {
  name: TOXIN_NAME, 
  description: "When Florantula survives an attack this turn, the attacker becomes poisoned.",
  shortDescription: "ADD EFFECT: When attacked this turn, poison the attacker.",
  level: 1,
  type: Types.Plant,
  priority: 2,
  target: Targets.None,
  execute: (params) => {
    const self = params.self;
    self.listeners.push(new Listener({
      name: TOXIN_NAME,
      triggers: [Events.GotAttacked],
      duration: 0,
      doEffect: (params) => {
        params.agent.doPoison(TOXIN_NAME);
      },
    }));
  },
};

const ABILITIES = [cleanse, parasite, toxin];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);