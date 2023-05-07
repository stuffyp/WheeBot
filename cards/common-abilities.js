const { Card, Rarities, StatusEffects, Types, Targets, 
    Events, Stats, damageCalc, typeAdvantage, Listener, 
    rollChance, randInt } = require('./imports.js');

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
        const self = params.self;
        const target = params.target;
        target.listeners = [];
        target.modifiers = [];
        target.status = null;
        target.log(`${target.name} was cleansed of all effects and conditions!`);
    },
});

module.exports = {
    tackle,
    cleanseBuilder,
}