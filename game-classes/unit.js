const { Stats } = require('../util/enums.js');

module.exports = class Unit {
  name;
  maxHealth;
  health;
  attack;
  defense;
  speed;
  magic;
  types;
  abilities;
  modifiers;
  listeners;
  status; // status effect - unique
  item; // item - unique
  constructor(card, item=null) {
    this.name = card.name;
    this.health = card.health;
    this.maxHealth = card.health;
    this.attack = card.attack;
    this.defense = card.defense;
    this.speed = card.speed;
    this.magic = card.magic;
    this.types = card.types;
    this.abilities = card.abilities;
    this.modifiers = [];
    this.listeners = [];
    this.status = null;
    this.item = item;
  }

  getBaseStat(stat) {
    switch (stat) {
      case Stats.Attack:
        return this.attack;
      case Stats.Defense:
        return this.defense;
      case Stats.Speed:
        return this.speed;
      case Stats.Magic:
        return this.magic;
      default:
        return null;
    }
  }

  // with modifiers
  getStat(stat, params) {
    const modifiers = this.item ? [...this.modifiers, this.item.modifier] : this.modifiers;
    return Math.ceil(
      modifiers
      .filter((modifier) => modifier.stat === stat)
      .reduce((curStat, mod) => mod.modify(curStat, params), this.getBaseStat(stat))
    );
  }
}