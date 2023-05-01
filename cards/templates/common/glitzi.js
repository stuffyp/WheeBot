const { Card, Rarities, StatusEffects, Types, Stats, 
       Events, Targets, damageCalc, typeAdvantage, rollChance } = require('../../imports.js');

const NAME = 'Glitzi';
const DESCRIPTION = 'A faint light glows in the dark.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 90;
const ATTACK = 50;
const DEFENSE = 40;
const SPEED = 50;
const MAGIC = 40;
const TYPES = [Types.Shock];

const FLASH_POWER = 0.4;
const FLASH_TYPE = Types.Shock;
const flash = {
  name: 'Flash', 
  description: 'Deal light damage. Strikes early.',
  level: 1,
  type: FLASH_TYPE,
  priority: 1,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      FLASH_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      FLASH_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(FLASH_TYPE, target.types));
    self.emitEvent(Events.didAttack);
    target.emitEvent(Events.gotAttacked);
  },
};

const SHOOTING_POWER = 0.6;
const SHOOTING_TYPE = Types.Shock;
const shootingStar = {
  name: 'Shooting Star', 
  description: 'Deal moderate damage. 50% chance to stun the target.',
  level: 1,
  type: SHOOTING_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      SHOOTING_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      SHOOTING_TYPE,
      target.types,
    );
    if (rollChance(0.5)) {
      target.statusEffect = StatusEffects.Stun;
      self.log(`${target.name} became stunned!`);
    }
    target.doDamage(damage, typeAdvantage(SHOOTING_TYPE, target.types));
    self.emitEvent(Events.didAttack);
    target.emitEvent(Events.gotAttacked);
  },
};

const ABILITIES = [flash, shootingStar];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);