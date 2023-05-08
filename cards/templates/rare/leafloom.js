const { Card, Rarities, StatusEffects, Types, Targets, 
    Events, Stats, damageCalc, 
    typeAdvantage, Listener, rollChance  } = require('../../imports.js');
const { cleanseBuilder } = require('../../common-abilities.js');

const NAME = 'Leafloom';
const DESCRIPTION = 'They build their homes in the forest canopy, hidden by the dense leaves.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Rare;
const HEALTH = 140;
const ATTACK = 30;
const DEFENSE = 60;
const SPEED = 40;
const MAGIC = 50;
const TYPES = [Types.Plant];

const cleanse = cleanseBuilder(1);


const HEAL_NAME = 'Healing Circle';
const heal = {
name: HEAL_NAME, 
description: "Add an effect to this creature. At the start of the next three turns, restore 10% health to all allies. Does not stack.",
shortDescription: "ADD EFFECT: Restore 10% health to all allies at the start of the next three turns.",
level: 1,
type: Types.Plant,
priority: 0,
target: Targets.None,
cost: 40,
execute: (params) => {
    const self = params.self;
    if (self.listeners.some(l => l.name === HEAL_NAME)) {
      self.log(`${self.name} tried to use ${HEAL_NAME} but it was already active!`);
      return;
    }
    self.listeners.push(new Listener({
        name: HEAL_NAME,
        triggers: [Events.TurnStart],
        duration: Infinity,
        doEffect: (params) => {
            const allies = params.self.utilFuncs.allies();
            for (const ally of allies) {
                if (ally.knockedOut()) continue;
                ally.doHeal(Math.ceil(0.1 * ally.maxHealth), HEAL_NAME);
                ally.emitEvent(Events.GotHealed);
            }
        },
    }));
},
};

const DART_POWER = 0.4;
const DART_TYPE = Types.Plant;
const dart = {
  name: 'Poison Dart', 
  description: 'Deal light damage. 70% chance to poison target.',
  shortDescription: 'Deal light damage. 70% chance to poison target.',
  level: 1,
  type: DART_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 0,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      DART_POWER * self.getBaseStat(Stats.Attack),
      self.getStat(Stats.Attack, { self: self }),
      target.getStat(Stats.Defense, { self: target }),
      DART_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(DART_TYPE, target.types));
    if (rollChance(0.7)) target.doPoison();
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};

const ABILITIES = [cleanse, heal, dart];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);