const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc, typeAdvantage, rollChance,
    Modifier, Listener } = require('../../imports.js');

const NAME = 'Clay Warrior';
const DESCRIPTION = '---';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 50;
const ATTACK = 40;
const DEFENSE = 40;
const SPEED = 40;
const MAGIC = 0;
const TYPES = [Types.Earth];


const BASH_TYPE = Types.Earth;
const BASH_POWER = 0.6;
const bash = {
    name: 'Bash',
    description: 'Deal moderate damage.',
    shortDescription: 'Deal moderate damage.',
    level: 1,
    type: BASH_TYPE,
    priority: 0,
    target: Targets.Field,
    cost: 25,
    execute: (params) => {
        const self = params.self;
        const target = params.target;
        const damage = damageCalc(
            BASH_POWER * self.getBaseStat(Stats.Attack),
            self.getStat(Stats.Attack, { self: self }),
            target.getStat(Stats.Defense, { self: target }),
            BASH_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(BASH_TYPE, target.types));
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
    },
};


const ABILITIES = [bash];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);