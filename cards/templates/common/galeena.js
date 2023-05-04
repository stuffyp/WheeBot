const { Card, Rarities, StatusEffects, Types, Targets, 
    Events, Stats, damageCalc, typeAdvantage, Listener, 
    rollChance, randInt } = require('../../imports.js');

const NAME = 'Galeena';
const DESCRIPTION = 'Though it can be seen taking the form of a bird, its true form is unknown.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 110;
const ATTACK = 50;
const DEFENSE = 40;
const SPEED = 50;
const MAGIC = 70;
const TYPES = [Types.Mystic];

const HEX_POWER = 0.6;
const HEX_TYPE = Types.Mystic;
const hex = {
  name: 'Hex', 
  description: 'Deal moderate damage. 70% chance to curse the target.',
  level: 1,
  type: HEX_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 30,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      HEX_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      HEX_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(HEX_TYPE, target.types));
    if (rollChance(0.7)) target.doCurse();
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};


const GUARDIANS_TYPE = Types.Mystic;
const GUARDIANS_POWER = 0.6;
const GUARDIANS_MANA_COST = 10;
const GUARDIANS_NAME = 'Spirit Guardians';
const guardians = {
    name: GUARDIANS_NAME, 
    description: `Add an effect to target creature. When target creature is attacked, it spends ${GUARDIANS_MANA_COST} mana if possible and deals moderate mystic damage to a random enemy. Acts early.`,
    level: 1,
    type: GUARDIANS_TYPE,
    priority: 1,
    target: Targets.Field,
    cost: 40,
    execute: (params) => {
        const self = params.self;
        const target = params.target;
        const power = GUARDIANS_POWER * self.getBaseStat(Stats.Attack);
        const attack = self.getStat(Stats.Attack, { self: self });
        target.listeners.push(new Listener({
            name: GUARDIANS_NAME,
            triggers: [Events.GotAttacked],
            duration: 0,
            doEffect: (params) => {
                if (!params.self.knockedOut() && params.self.magic >= GUARDIANS_MANA_COST) {
                    const enemies = params.self.utilFuncs.enemies();
                    const target = enemies[randInt(enemies.length)];
                    const damage = damageCalc(
                        power, 
                        attack, 
                        target.getStat(Stats.Defense, { self: target }),
                        GUARDIANS_TYPE,
                        target.types,
                    );
                    params.self.magic -= GUARDIANS_MANA_COST;
                    params.self.manaSpent += GUARDIANS_MANA_COST;
                    params.self.log(`${params.self.name} spent ${GUARDIANS_MANA_COST} mana!`);
                    if (target.knockedOut()) {
                        params.self.log(`${target.name} was hit by ${GUARDIANS_NAME} but had already been knocked out!`);
                        return;
                    }
                    target.doDamage(damage, typeAdvantage(GUARDIANS_TYPE, target.types), GUARDIANS_NAME);
                }
            },
        }));
        target.log(`${target.name} is protected by ${GUARDIANS_NAME}!`);
    },
};



const ABILITIES = [hex, guardians];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);