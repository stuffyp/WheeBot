const { EmbedBuilder } = require('discord.js');
const { getCard } = require('../cards/read-cards.js');
const { getItem } = require('../items/read-items.js');
const Unit = require('./unit.js');

module.exports = class GameMaster {
  users;
  units;
  activeUnits;
  log;
  channel;
  winner;
  commands;
  constructor(channel) {
    this.users = [];
    this.units = {};
    this.activeUnits = {};
    this.log = [];
    this.channel = channel;
    this.winner = null;
    this.commands = [];
  }

  loadUser(id, name) {
    this.users.push({
      id: id,
      name: name,
    });
    this.units[id] = [];
    this.activeUnits[id] = [];
    return this;
  }

  peekLog() {
    return this.log;
  }

  getLog() {
    const out = this.log;
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
        .setLog((text) => this.log.push(text))
        .setLevel(level),
    });
    return this;
  }

  setActiveUnit(userId, fullID) {
    const unit = this.units[userId].find(u => u.fullID === fullID);
    this.activeUnits[userId].push(unit);
    this.units[userId] = this.units[userId].filter((u) => u.fullID !== fullID);
  }

  display() {
    const embeds = this.users.map(({id, name}) => {
      return new EmbedBuilder()
        .setTitle(name)
        .addFields(this.activeUnits[id].map((u) => {
          return ({
            name: u.unit.name,
            value: `❤️: ${u.unit.health}/${u.unit.maxHealth}`,
            inline: true,
          });
        }))
    });
    return embeds;
  }
}