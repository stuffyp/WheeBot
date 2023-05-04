const { Card, Rarities, StatusEffects, Types, Targets, 
       Events, Stats, damageCalc, typeAdvantage, Modifier } = require('../../imports.js');

const NAME = 'Squibbit';
const DESCRIPTION = 'A common sight near rivers and lakes in the summer.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 120;
const ATTACK = 40;
const DEFENSE = 60;
const SPEED = 40;
const MAGIC = 60;
const TYPES = [Types.Water];

const SPLASH_POWER = 0.6;
const SPLASH_TYPE = Types.Water;
const splash = {
  name: 'Splash', 
  description: 'Deal moderate damage to a target.',
  level: 1,
  type: SPLASH_TYPE,
  priority: 0,
  target: Targets.Field,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      SPLASH_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      SPLASH_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(SPLASH_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};

const encouragement = {
  name: 'Encouragement', 
  description: "Raise target's attack and defense by 30% for three turns. Activates early.",
  level: 1,
  type: Types.None,
  priority: 1,
  target: Targets.Field,
  cost: 30,
  execute: (params) => {
    const target = params.target;
    if (!target.knockedOut()) {
      target.modifiers.push(new Modifier({
        stat: Stats.Defense,
        duration: 2,
        modify: (def, params) => def * 1.3,
      }));
      target.modifiers.push(new Modifier({
        stat: Stats.Attack,
        duration: 2,
        modify: (atk, params) => atk * 1.3,
      }));
      target.log(`${target.name}'s attack and defense rose!`);
    }
  },
};

const SLAM_POWER = 0.8;
const SLAM_TYPE = Types.Water;
const slam = {
  name: 'Body Slam', 
  description: 'Deal heavy damage to a target. This move\'s damage scales with the defense of this creature instead of attack.',
  level: 1,
  type: SLAM_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 40,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      SLAM_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Defense, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      SLAM_TYPE,
      target.types,
    );
    target.doDamage(damage, typeAdvantage(SLAM_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};

const ABILITIES = [splash, encouragement, slam];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);