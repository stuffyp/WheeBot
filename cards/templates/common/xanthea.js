const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc, typeAdvantage, Listener,
    rollChance, randInt, Modifier } = require('../../imports.js');
const { gustBuilder } = require('../../common-abilities.js');

const NAME = 'Xanthea';
const DESCRIPTION = 'Noisome harbinger of storms.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 120;
const ATTACK = 50;
const DEFENSE = 50;
const SPEED = 70;
const MAGIC = 60;
const TYPES = [Types.Wind];


const theft = {
  name: 'Theft',
  description: 'Steal all effects and conditions from a target, replacing this creature\'s current effects and conditions.',
  shortDescription: 'Steal all effects and conditions from a target.',
  level: 1,
  type: Types.None,
  priority: 0,
  target: Targets.Field,
  cost: 30,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    self.listeners = target.listeners;
    self.modifiers = target.modifiers;
    self.status = target.status;
    target.listeners = [];
    target.modifiers = [];
    target.status = null;
    target.log(`${self.name} stole all effects and conditions from ${target.name}!`);
  },
};

const gust = gustBuilder(1);

const WARNING_TYPE = Types.Wind;
const WARNING_POWER = 1.2;
const WARNING_NAME = 'Hurricane Warning';
const warning = {
    name: WARNING_NAME,
    description: 'Add an effect to target creature. At the end of their third end turn phase, deal colossal damage to all allies of the affected creature. Acts early.',
    shortDescription: 'ADD EFFECT: Deal colossal damage to all allies in three turns.',
    level: 1,
    type: WARNING_TYPE,
    priority: 1,
    target: Targets.Field,
    cost: 70,
    execute: (params) => {
        const target = params.target;
        const power = WARNING_POWER * params.self.getBaseStat(Stats.Attack);
        const attack = params.self.getStat(Stats.Attack, { self: params.self });
        target.listeners.push(new Listener({
            name: WARNING_NAME,
            triggers: [],
            duration: 2,
            onFinish: (params) => {
                const allies = params.self.utilFuncs.allies();
                params.self.log(`${WARNING_NAME} activated!`);
                for (const ally of allies) {
                    const damage = damageCalc(
                        power,
                        attack,
                        ally.getStat(Stats.Defense, { self: ally }),
                        WARNING_TYPE,
                        ally.types,
                    );
                    ally.doDamage(damage, typeAdvantage(WARNING_TYPE, ally.types));
                }
            },
        }));
        target.log(`${target.name} is affected by ${WARNING_NAME}!`);
    },
};


const ABILITIES = [theft, gust, warning];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);