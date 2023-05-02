const { Card, Rarities, StatusEffects, Types, Targets, 
       Events, Stats, damageCalc, typeAdvantage, rollChance, 
       Modifier, Listener } = require('../../imports.js');

const NAME = 'Grottoise';
const DESCRIPTION = 'Though normally peaceful, Grottoise are capable of summoning powerful waves in an instant.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Rare;
const HEALTH = 140;
const ATTACK = 40;
const DEFENSE = 60;
const SPEED = 30;
const MAGIC = 50;
const TYPES = [Types.Water, Types.Earth];


const FLOOD_TYPE = Types.Water;
const FLOOD_POWER = 0.8;
const flood = {
  name: 'Flash Flood', 
  description: 'Deal heavy damage to all enemies.',
  level: 1,
  type: FLOOD_TYPE,
  priority: 0,
  target: Targets.None,
  cost: 100,
  execute: (params) => {
    const self = params.self;
    for (const target of params.enemies) {
      const damage = damageCalc(
        FLOOD_POWER * self.getBaseStat(Stats.Attack), 
        self.getStat(Stats.Attack, { self: self }), 
        target.getStat(Stats.Defense, { self: target }),
        FLOOD_TYPE,
        target.types,
      );
      target.doDamage(damage, typeAdvantage(FLOOD_TYPE, target.types));
      self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
      target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    }
  },
};

const EARTHQUAKE_TYPE = Types.Earth;
const EARTHQUAKE_POWER = 0.4;
const earthquake = {
  name: 'Earthquake', 
  description: 'Deal light damage to all enemies.',
  level: 1,
  type: EARTHQUAKE_TYPE,
  priority: 0,
  target: Targets.None,
  execute: (params) => {
    const self = params.self;
    for (const target of params.enemies) {
      const damage = damageCalc(
        EARTHQUAKE_POWER * self.getBaseStat(Stats.Attack), 
        self.getStat(Stats.Attack, { self: self }), 
        target.getStat(Stats.Defense, { self: target }),
        EARTHQUAKE_TYPE,
        target.types,
      );
      target.doDamage(damage, typeAdvantage(EARTHQUAKE_TYPE, target.types));
      self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
      target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
    }
  },
};

const shelter = {
  name: 'Shelter', 
  description: 'Substitute with target creature. Target creature enters with 50% increased defense until the end of their next turn. Acts early.',
  level: 1,
  type: Types.None,
  priority: 1,
  target: Targets.Sub,
  cost: 50,
  execute: (params) => {
    params.sub();
    const target = params.target;
    if (target.onField) {
      target.modifiers.push(new Modifier({
        stat: Stats.Defense,
        duration: 1,
        modify: (def, params) => def * 1.5,
      }));
      target.log(`${target.name}'s defense rose!`);
    }
  },
};

const ABILITIES = [flood, earthquake, shelter];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);