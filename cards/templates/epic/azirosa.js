const { Card, Rarities, StatusEffects, Types, Targets,
    Events, Stats, damageCalc,
    typeAdvantage, Listener, Modifier, rollChance, randInt } = require('../../imports.js');
const { slashBuilder, fireballBuilder } = require('../../common-abilities.js');

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

const slash = slashBuilder(1);
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
const KNIVES_NAME = 'Fan of Knives';
const knives = {
  name: KNIVES_NAME,
  description: `Deal light damage to a random target until an enemy is knocked out. Does not stop if ${NAME} is knocked out by ${KNIVES_NAME}. Each knife is stronger than the last.`,
  shortDescription: 'Deal light damage to a random target until an enemy is knocked out.',
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
    let count = 0;
    while (true) {
        const enemies = self.utilFuncs.enemies();
        if (enemies.some((e) => e.knockedOut())) return;
        const targets = [...self.utilFuncs.allies().filter(u => !u.knockedOut()), ...enemies];
        const target = targets[randInt(targets.length)];
        const damage = damageCalc(
            basePower + count * dPower,
            attack,
            target.getStat(Stats.Defense, { self: target }),
            KNIVES_TYPE,
            target.types,
        );
        target.doDamage(damage, typeAdvantage(KNIVES_TYPE, target.types), KNIVES_NAME);
        self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
        target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage });
        count++;
    }
  },
};


const ABILITIES = [slash, fireball, roar, knives];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);