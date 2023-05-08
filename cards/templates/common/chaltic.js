const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc, typeAdvantage, rollChance,
    Modifier, Listener } = require('../../imports.js');
const ClayWarrior = require('../unsummonable/clay-warrior.js');

const NAME = 'Chaltic';
const DESCRIPTION = 'Adept at camouflage, and has a keen sense of balance.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 120;
const ATTACK = 60;
const DEFENSE = 40;
const SPEED = 30;
const MAGIC = 40;
const TYPES = [Types.Earth];


const ROCKSLIDE_TYPE = Types.Earth;
const ROCKSLIDE_POWER = 0.8;
const rockslide = {
    name: 'Rockslide',
    description: 'Deal heavy damage.',
    shortDescription: 'Deal heavy damage.',
    level: 1,
    type: ROCKSLIDE_TYPE,
    priority: 0,
    target: Targets.Field,
    cost: 20,
    execute: (params) => {
        const self = params.self;
        const target = params.target;
        const damage = damageCalc(
            ROCKSLIDE_POWER * self.getBaseStat(Stats.Attack),
            self.getStat(Stats.Attack, { self: self }),
            target.getStat(Stats.Defense, { self: target }),
            ROCKSLIDE_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(ROCKSLIDE_TYPE, target.types));
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
    },
};

const clay = {
    name: 'Pottery',
    description: 'Summon a clay warrior.',
    shortDescription: 'Summon a clay warrior.',
    level: 1,
    type: Types.Earth,
    priority: 0,
    target: Targets.None,
    cost: 80,
    execute: (params) => {
        const success = params.self.utilFuncs.summonUnit(ClayWarrior, params.self.level);
        if (success) {
            params.self.log(`${params.self.name} summoned a clay warrior!`);
        } else {
            params.self.log('A clay warrior failed to summon!');
        }
    },
};


const ABILITIES = [rockslide, clay];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);