const { getCard } = require('../cards/read-cards.js');
const { getItem } = require('../items/read-items.js');
const Unit = require('./unit.js');

module.exports = class GameMaster {
  users;
  units;
  log;
  constructor() {
    this.users = [];
    this.units = {};
    this.log = [];
  }

  loadUser(id, name) {
    this.users.push({
      id: id,
      name: name,
    });
    this.units[id] = [];
    return this;
  }

  peekLog() {
    return this.log;
  }

  getLog() {
    const out = this.log.join('\n');
    this.log = [];
    return out;
  }

  loadUnit(cardFromDb, userId) {
    const {id, level, exp, fullID, item} = cardFromDb;
    this.units[userId].push({
      user: userId,
      fullID: fullID,
      level: level,
      exp: exp,
      unit: new Unit(getCard(id))
        .setItem(item ? getItem(item).item : null)
        .setLog((text) => this.log.push(text)),
    });
    return this;
  }
}