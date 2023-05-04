const { Stats, StatusEffects, Events, Types } = require('../util/enums.js');
const { rollChance } = require('../util/random.js');

/*
Class which stores all the combat relevant information about a unit and interfaces with the game loop.

Attributes:
name: string representing the displayable name of the unit
maxHealth: max HP
health: current HP
attack: attack stat
defense: defense stat
speed: speed stat
magic: magic stat
types: array of elemental types the unit belongs to
abilities: array of abilities the unit can use
modifiers: array of effects which modify the unit's stats
listeners: array of effects which are triggered when certain events happen
item: item the unit is holding
log: callback function to log a string describing what the unit does (e.g. "uses item X", "attacks X", "takes X damage from Y status effect")

MUST BE CALLED AFTER INITIALIZATION:
setItem(item): sets item to item
setLog(item): sets log to the new callback function
setLevel(level): sets level to level

knockedOut(): returns whether health <= 0
knockOut(): logs that the unit has been knocked out and performs clean up
consumeItem(): removes the unit's item (indicating that a consumable was used)

getBaseStat(stat: Stats enum): returns the corresponding base stat
getStat(stat: Stats enum, params): returns the stat after applying modifiers

emitEvent(event, params): emits the event to all attached listeners
startTurn(params): starts the turn and performs setup (automatically emits the start turn event)
endTurn(params): ends the turn and performs cleanup (automatically emits the end turn event)

*/

module.exports = class Unit {
  simpleName;
  name;

  maxHealth;
  health;
  attack;
  defense;
  speed;
  magicRegen;
  magic;

  types;
  abilities;
  modifiers;
  listeners;

  status; // status effect - unique
  item; // item - unique
  log; // string output of what this unit does in a turn
  onField; // whether unit is on field
  manaSpent; // how much mana spent this turn
  utilFuncs; // passed down from game master
  constructor(card) {
    this.simpleName = card.name;
    this.health = card.health;
    this.maxHealth = card.health;
    this.attack = card.attack;
    this.defense = card.defense;
    this.speed = card.speed;
    this.magicRegen = card.magic;
    this.magic = 100;
    this.types = card.types;
    this.abilities = card.abilities;
    this.modifiers = [];
    this.listeners = [];
    this.status = null;
    this.item = null;
    this.log = (t) => { console.error(`${this.name} logging into the void!`); };
    this.onField = false;
    this.manaSpent = 0;
  }

  setItem(item) { this.item = item; return this; }
  setLog(log) { this.log = log; return this; }
  setLevel(level) {
    this.abilities = this.abilities.filter((ability) => ability.level <= level);
    return this;
  }
  setName(username) {
    this.name = `${username}'s ${this.simpleName}`;
    return this;
  }
  setUtilFuncs(utilFuncs) {
    this.utilFuncs = utilFuncs;
    return this;
  }

  knockedOut() { return this.health <= 0; }
  knockOut() {
    this.log(`${this.name} was knocked out!`);
    this.modifiers = [];
    this.listeners = [];
    this.status = null;
  }

  consumeItem() {
    this.item = null;
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
    const modifiers = this.item ? [...this.modifiers, ...this.item.modifiers] : this.modifiers;
    return Math.ceil(
      modifiers
      .filter((modifier) => modifier.stat === stat)
      .reduce((curStat, mod) => mod.modify(curStat, params), this.getBaseStat(stat)),
    );
  }

  emitEvent(event, params) {
    if (this.knockedOut()) return;
    const listeners = this.item ? [...this.listeners, ...this.item.listeners] : this.listeners;
    listeners.forEach(listener => {
      listener.doEffect(event, params);
    });
  }

  startTurn(params) {
    this.listeners.forEach(listener => { listener.timer.tick(); }); // cleanup is done in endTurn()
    this.modifiers.forEach(modifier => { modifier.timer.tick(); });
    if (this.item) {
      this.item.listeners.forEach(listener => { listener.timer.tick(); });
      this.item.modifiers.forEach(modifier => { modifier.timer.tick(); });
    }
    if (this.status === StatusEffects.Poison) {
      this.doDamage(Math.ceil(this.maxHealth / 5), 1, 'poison');
    }
    if (this.status === StatusEffects.Freeze && rollChance(0.3)) {
      this.status === null;
      this.log(`${this.name} unfroze!`);
    }
    if (!this.knockedOut()) this.emitEvent(Events.TurnStart, params);
  }

  #cleanUpTimers(arr, params) {
    arr.forEach((effect) => {
      if (effect.timer.done()) {
        const out = effect.timer.onFinish(params);
        if (out) this.log(out);
      }
    });

    // scuffed hack to modify original array without redefining the reference
    arr.splice(0, arr.length, ...arr.filter((element) => !element.timer.done()));
  }

  endTurn(params) {
    this.emitEvent(Events.TurnEnd, params);
    this.#cleanUpTimers(this.listeners, params);
    this.#cleanUpTimers(this.modifiers, params);
    if (this.item) {
      this.#cleanUpTimers(this.item.listeners, params);
      this.#cleanUpTimers(this.item.modifiers, params);
    }
    if (!this.knockedOut() && this.manaSpent === 0) {
      if (this.status === StatusEffects.Curse && this.magic < 100) {
        this.log(`${this.name} was cursed and could not regenerate mana!`);
      } else {
        this.magic = Math.min(100, this.magic + this.magicRegen);
      }
    }
    this.manaSpent = 0;
  }

  doDamage(damage, effective = 1, reason = '') {
    if (this.knockedOut()) return;
    const actualDamage = this.status === StatusEffects.Freeze ? Math.ceil(damage / 2) : damage;
    this.health = Math.max(0, this.health - actualDamage);
    let effectiveText = '';
    if (effective < 1) effectiveText = ' It was not very effective...';
    if (effective > 1) effectiveText = ' It was super effective!';
    const reasonText = (reason.length) ? ` due to ${reason}` : '';
    this.log(`${this.name} took ${actualDamage} damage${reasonText}!${effectiveText}`);
    if (this.status === StatusEffects.Burn) {
      const burnDamage = Math.ceil(actualDamage / 2);
      this.health = Math.max(0, this.health - burnDamage);
      this.log(`${this.name} took ${burnDamage} additional damage from being on fire!`);
    }
    if (this.knockedOut()) this.knockOut();
  }

  doHeal(heal, reason = '') {
    if (this.knockedOut()) return;
    this.health = Math.min(this.maxHealth, this.health + heal);
    const reasonText = (reason.length) ? ` due to ${reason}` : '';
    this.log(`${this.name} recovered ${heal} health${reasonText}!`);
  }

  doStun() {
    if (this.knockedOut()) return;
    this.status = StatusEffects.Stun;
    this.log(`${this.name} became stunned!`);
  }

  doBurn() {
    if (this.knockedOut()) return;
    if (this.status === StatusEffects.Freeze) {
      this.status = null;
      this.log(`${this.name} unfroze!`);
    } else {
      if (this.types.includes(Types.Water)) return;
      this.status = StatusEffects.Burn;
      this.log(`${this.name} became burned!`);
    }
  }

  doPoison() {
    if (this.knockedOut()) return;
    this.status = StatusEffects.Poison;
    this.log(`${this.name} became poisoned!`);
  }

  doTrap() {
    if (this.knockedOut()) return;
    this.status = StatusEffects.Trapped;
    this.log(`${this.name} became trapped!`);
  }

  doCurse() {
    if (this.knockedOut()) return;
    this.status = StatusEffects.Curse;
    this.log(`${this.name} became cursed!`);
  }

  doFreeze() {
    if (this.knockedOut()) return;
    if (this.status === StatusEffects.Burn) {
      this.status = null;
      this.log(`${this.name} is no longer burned!`);
    } else {
      if (this.types.includes(Types.Fire)) return;
      this.status = StatusEffects.Freeze;
      this.log(`${this.name} became frozen!`);
    }
  }
};