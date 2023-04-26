const { Stats, Events } = require('../util/enums.js');

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
  log; // string output of what this unit does in a turn
  constructor(card) {
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
    this.item = null;
    this.log = (text) => { console.error(`${this.name} logging into the void!`) };
  }

  setItem(item) { this.item = item }
  setLog(log) { this.log = log }

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
      .reduce((curStat, mod) => mod.modify(curStat, params), this.getBaseStat(stat))
    );
  }

  emitEvent(event, params) {
    const listeners = this.item ? [...this.listeners, ...this.item.listeners] : this.listeners;
    listeners.forEach(listener => { 
      const out = listener.doEffect(event, params);
      if (out) this.log(out);
      if (this.knockedOut()) { 
        this.knockOut(); 
        return; 
      }
    });
  }

  startTurn(params) {
    this.listeners.forEach(listener => { listener.timer.tick() }); // cleanup is done in endTurn()
    this.modifiers.forEach(modifier => { modifier.timer.tick() });
    if (this.item) {
      this.item.listeners.forEach(listener => { listener.timer.tick() });
      this.item.modifiers.forEach(modifier => { modifier.timer.tick() });
    }
    this.emitEvent(Events.StartTurn, params);
  }

  #cleanUpTimers(arr, params) {
    arr.forEach((effect) => {
      if (effect.timer.done()) {
        const out = effect.timer.onFinish(params);
        if (out) this.log(out);
        if (this.knockedOut()) { 
          this.knockOut(); 
          return;
        }
      }
    });

    //scuffed hack to modify original array without redefining the reference
    arr.splice(0, arr.length, ...arr.filter((element) => !element.timer.done()));
  }

  endTurn(params) {
    this.emitEvent(Events.EndTurn, params);
    this.cleanUpTimers(this.listeners, params);
    this.cleanUpTimers(this.modifiers, params);
    if (this.item) {
      this.cleanUpTimers(this.item.listeners, params);
      this.cleanUpTimers(this.item.modifiers, params);
    }
  }
}