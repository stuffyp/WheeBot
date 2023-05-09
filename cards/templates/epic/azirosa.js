const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc,
    typeAdvantage, Listener, Modifier, rollChance, randInt } = require('../../imports.js');
const { fireballBuilder } = require('../../common-abilities.js');

const NAME = 'Azirosa';
const DESCRIPTION = 'Bad omen when seen at dawn.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Epic;
const HEALTH = 120;
const ATTACK = 55;
const DEFENSE = 50;
const SPEED = 50;
const MAGIC = 60;
const TYPES = [Types.Fire, Types.Beast];

const fireball = fireballBuilder(1);

const ROAR_TYPE = Types.Beast;
const ROAR_POWER = 0.6;
const roar = {
  name: 'Roar',
  description: 'Deal moderate damage. 70% chance to frighten target.',
  shortDescription: 'Deal moderate damage. 70% chance to frighten target.',
  level: 1,
  type: ROAR_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 30,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      ROAR_POWER * self.getBaseStat(Stats.Attack),
      self.getStat(Stats.Attack, { self: self }),
      target.getStat(Stats.Defense, { self: target }),
      ROAR_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(ROAR_TYPE, target.types));
    if (rollChance(0.7)) target.doFrighten();
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
  },
};

const KNIVES_TYPE = Types.Beast;
const KNIVES_POWER = 0.4;
const KNIVES_DPOWER = 0.1;
const KNIVES_NAME = 'Stampede';
const knives = {
  name: KNIVES_NAME,
  description: 'Sacrifice this creature. Deal damage to a random target until an enemy is knocked out. Each hit is stronger than the last, starting at light damage.',
  shortDescription: 'Sacrifice this creature. Deal damage to a random target until an enemy is knocked out.',
  level: 1,
  type: KNIVES_TYPE,
  priority: 0,
  target: Targets.None,
  cost: 80,
  execute: (params) => {
    const self = params.self;
    const basePower = KNIVES_POWER * self.getBaseStat(Stats.Attack);
    const dPower = KNIVES_DPOWER * self.getBaseStat(Stats.Attack);
    const attack = self.getStat(Stats.Attack, { self: self });
    self.doDamage(Infinity);
    let count = 0;
    while (true) {
        const enemies = self.utilFuncs.enemies();
        const allies = self.utilFuncs.allies().filter(a => !a.knockedOut());
        if (enemies.some((e) => e.knockedOut())) return;
        const targets = [...allies, ...enemies.filter(u => !u.knockedOut())];
        const target = targets[randInt(targets.length)];
        const damage = damageCalc(
            basePower + count * dPower,
            attack,
            target.getStat(Stats.Defense, { self: target }),
            KNIVES_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(KNIVES_TYPE, target.types), KNIVES_NAME);
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
        count++;
    }
  },
};

const mimicry = {
  name: 'Mimicry',
  description: 'Copy all effects and conditions from a target, replacing this creature\'s current effects and conditions.',
  shortDescription: 'Copy all effects and conditions from a target.',
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
    self.log(`${self.name} copied all effects and conditions from ${target.name}!`);
  },
};


const ABILITIES = [fireball, roar, knives, mimicry];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);