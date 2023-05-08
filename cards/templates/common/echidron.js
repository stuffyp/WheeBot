const { Card, Rarities, StatusEffects, Types, Targets,
       Events, Stats, damageCalc, typeAdvantage, rollChance,
       Modifier, Listener } = require('../../imports.js');
const { slashBuilder } = require('../../common-abilities.js');

const NAME = 'Echidron';
const DESCRIPTION = 'Possessing the ability to sense vibrations in the earth, they prefer to build their lairs underground.';
const IMAGE_SRC = 'pikachu.png';
const RARITY = Rarities.Common;
const HEALTH = 140;
const ATTACK = 40;
const DEFENSE = 60;
const SPEED = 30;
const MAGIC = 50;
const TYPES = [Types.Earth, Types.Beast];


const slash = slashBuilder(1);

const PIT_TYPE = Types.Earth;
const PIT_POWER = 0.6;
const pit = {
  name: 'Pit Trap', 
  description: 'Deal moderate damage. Target is trapped.',
  shortDescription: 'Deal moderate damage. Target is trapped.',
  level: 1,
  type: PIT_TYPE,
  priority: 0,
  target: Targets.Field,
  cost: 50,
  execute: (params) => {
    const self = params.self;
    const target = params.target;
    const damage = damageCalc(
      PIT_POWER * self.getBaseStat(Stats.Attack), 
      self.getStat(Stats.Attack, { self: self }), 
      target.getStat(Stats.Defense, { self: target }),
      PIT_TYPE,
      target.types,
    );
    target.doTrap();
    target.doDamage(damage, typeAdvantage(PIT_TYPE, target.types));
    self.emitEvent(Events.DidAttack, { self: self, target: target, damage: damage });
    target.emitEvent(Events.GotAttacked, { self: target, agent: self, damage: damage});
  },
};


const burrow = {
  name: 'Burrow', 
  description: 'Increase defense by 50% this turn and attack by 50% until the end of your next turn. Acts early.',
  shortDescription: 'Increase defense and attack by 50% for two turns.',
  level: 1,
  type: Types.Earth,
  priority: 1,
  target: Targets.None,
  execute: (params) => {
    const self = params.self;
    self.modifiers.push(new Modifier({
      stat: Stats.Defense,
      duration: 0,
      modify: (def, params) => def * 1.5,
    }));
    self.modifiers.push(new Modifier({
      stat: Stats.Attack,
      duration: 1,
      modify: (atk, params) => atk * 1.5,
    }));
    self.log(`${self.name}'s attack and defense rose!`);
  },
};

const ABILITIES = [slash, pit, burrow];

const HEADER = [NAME, DESCRIPTION, IMAGE_SRC, RARITY, HEALTH, ATTACK, DEFENSE, SPEED, MAGIC, TYPES, ABILITIES];

module.exports = new Card(...HEADER);