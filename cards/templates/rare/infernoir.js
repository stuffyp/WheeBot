const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc,
    typeAdvantage, Listener, Modifier, rollChance, randInt } = require('../../imports.js');

const NAME = 'Infernoir';
const DESCRIPTION = 'Despite their reputation, Infernoir are fond of small trinkets and shiny things.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Rare;
const HEALTH = 120;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 50;
const MAGIC = 50;
const TYPES = [Types.Fire];

const RAGE_NAME = 'Furnace';
const rage = {
    name: RAGE_NAME,
    description: 'Add an effect to this creature. When entering combat enraged, increase attack by 100%.',
    shortDescription: 'ADD EFFECT: BATTLECRY (RAGE): Increase attack by 100%.',
    level: 1,
    type: Types.Fire,
    priority: 0,
    target: Targets.None,
    cost: 20,
    execute: (params) => {
        const self = params.self;
        self.listeners.push(new Listener({
            name: RAGE_NAME,
            triggers: [Events.OnSub],
            duration: Infinity,
            doEffect: (params) => {
                if (params.self.rage()) {
                    params.self.modifiers.push(new Modifier({
                        stat: Stats.Attack,
                        duration: Infinity,
                        modify: (atk, params) => atk * 2,
                    }));
                    params.self.log(`${params.self.name}'s attack rose due to ${RAGE_NAME}!`);
                }
            },
        }));
    },
};


const RECKLESS_TYPE = Types.None;
const RECKLESS_POWER = 0.8;
const reckless = {
    name: 'Reckless Charge',
    description: 'Deal heavy damage. This creature takes 25% of the damage dealt.',
    shortDescription: 'Deal heavy damage. This creature takes 25% of the damage dealt.',
    level: 1,
    type: RECKLESS_TYPE,
    priority: 0,
    target: Targets.Field,
    cost: 0,
    execute: (params) => {
        const self = params.self;
        const target = params.target;
        const damage = damageCalc(
            RECKLESS_POWER * self.getBaseStat(Stats.Attack),
            self.getStat(Stats.Attack, { self: self }),
            target.getStat(Stats.Defense, { self: target }),
            RECKLESS_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(RECKLESS_TYPE, target.types));
        self.doDamage(Math.ceil(0.25 * damage));
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    },
};

const DANCE_TYPE = Types.Fire;
const DANCE_POWER = 0.8;
const DANCE_NAME = 'Fire Dance';
const dance = {
  name: DANCE_NAME,
  description: 'Deal heavy damage to a random enemy. If it knocks the creature out, repeat.',
  shortDescription: 'Deal heavy damage to a random enemy. If it knocks the creature out, repeat.',
  level: 1,
  type: DANCE_TYPE,
  priority: 0,
  target: Targets.None,
  cost: 80,
  execute: (params) => {
    const self = params.self;
    while (true) {
        if (self.knockedOut()) return;
        const activeEnemies = self.utilFuncs.enemies().filter((e) => !e.knockedOut());
        if (activeEnemies.length === 0) {
            self.log(`${DANCE_NAME} ended.`);
            return;
        }
        const target = activeEnemies[randInt(activeEnemies.length)];
        const damage = damageCalc(
            DANCE_POWER * self.getBaseStat(Stats.Attack),
            self.getStat(Stats.Attack, { self: self }),
            target.getStat(Stats.Defense, { self: target }),
            DANCE_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(DANCE_TYPE, target.types), DANCE_NAME);
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
        if (!target.knockedOut()) return;
    }
  },
};

const ABILITIES = [rage, reckless, dance];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);