const { Card, Rarities, StatusEffects, Types, Targets, 
    Events, Stats, damageCalc, 
    typeAdvantage, Listener, Modifier, rollChance, randInt  } = require('../../imports.js');

const NAME = 'Glaciese';
const DESCRIPTION = 'Violation of thermodynamics.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 100;
const ATTACK = 40;
const DEFENSE = 50;
const SPEED = 40;
const MAGIC = 60;
const TYPES = [Types.Water];


const WIND_POWER = 0.6;
const WIND_TYPE = Types.Water;
const wind = {
  name: 'Arctic Wind', 
  description: 'Deal moderate damage. If the target has a status effect, freeze it.',
  shortDescription: 'Deal moderate damage. If the target has a status effect, freeze it.',
  level: 1,
  type: WIND_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 0,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      WIND_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      WIND_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(WIND_TYPE, target.types));
    if (target.status) target.doFreeze();
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};


const BULWARK_NAME = 'Bulwark';
const bulwark = {
    name: BULWARK_NAME, 
    description: "Add an effect to this creature. At the start of the turn, increase the defense of all allies by 10%.",
    shortDescription: "ADD EFFECT: Increase defense of all allies by 10% each turn.",
    level: 1,
    type: Types.Water,
    priority: 0,
    target: Targets.None,
    cost: 40,
    execute: (params) => {
        const self = params.self;
        self.listeners.push(new Listener({
            name: BULWARK_NAME,
            triggers: [Events.TurnStart],
            duration: Infinity,
            doEffect: (params) => {
                const allies = params.self.utilFuncs.allies();
                for (const ally of allies) {
                    if (ally.knockedOut()) continue;
                    ally.modifiers.push(new Modifier({
                        stat: Stats.Defense,
                        duration: Infinity,
                        modify: (def, params) => def * 1.1,
                    }));
                    ally.log(`${ally.name}'s defense rose due to ${BULWARK_NAME}!`);
                }
            },
        }));
    },
};


const ICEBREAKER_POWER = 0.8;
const ICEBREAKER_FULL_POWER = 1.2;
const ICEBREAKER_TYPE = Types.Water;
const ICEBREAKER_NAME = 'Icebreaker';
const icebreaker = {
    name: ICEBREAKER_NAME, 
    description: 'Deal heavy damage. If the target is frozen, unfreeze them and do colossal damage.',
    shortDescription: 'Deal heavy damage. Unfreeze and do colossal damage instead if target frozen.',
    level: 1,
    type: ICEBREAKER_TYPE,
    priority: 0,
    target: Targets.Field,
    cost: 40,
    execute: (params) => {
        const self = params.self;
        const target = params.target;
        const power = (target.status === StatusEffects.Freeze) ? ICEBREAKER_FULL_POWER : ICEBREAKER_POWER;
        if (target.status === StatusEffects.Freeze) {
            target.status = null;
            target.log(`${target.name} unfroze due to ${ICEBREAKER_NAME}!`);
        }
        const damage = damageCalc(
            power * self.getBaseStat(Stats.Attack), 
            self.getStat(Stats.Attack, { self: self }), 
            target.getStat(Stats.Defense, { self: target }),
            ICEBREAKER_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(ICEBREAKER_TYPE, target.types));
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    },
};

const ABILITIES = [wind, bulwark, icebreaker];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);