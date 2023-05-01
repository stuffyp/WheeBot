const { EmbedBuilder } = require('discord.js');
const { getCard } = require('../cards/read-cards.js');
const { getItem } = require('../items/read-items.js');
const { Stats } = require('../util/enums.js');
const Unit = require('./unit.js');

module.exports = class GameMaster {
  users;
  units;
  activeUnits;
  log;
  channel;
  winner;
  gameOver;
  commands;
  constructor(channel) {
    this.users = [];
    this.units = {};
    this.activeUnits = {};
    this.log = [];
    this.channel = channel;
    this.winner = null;
    this.gameOver = false;
    this.commands = [];
  }

  loadUser(id, name, elo) {
    this.users.push({
      id: id,
      name: name,
      elo: elo,
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

  queueCommand(command) {
    this.commands = this.commands.filter((c) => c.agent.fullID !== command.agent.fullID);
    this.commands.push(command);
  }

  #executeCommand() {
    const command = this.commands.shift();
    if (command.agent.unit.knockedOut()) {
      this.log.push(`${command.agent.unit.name} was knocked out and passes their turn!`);
      return;
    }
    this.log.push(`**${command.agent.unit.name}** targeted **${command.target.unit.name}** with **${command.name}**!`);
    const user = command.agent.user;
    const otherUser = this.users.find((u) => u.id !== user).id;
    command.execute({
      self: command.agent.unit,
      target: command.target.unit,
      allies: this.activeUnits[user].map(u => u.unit),
      enemies: this.activeUnits[otherUser].map(u => u.unit),
    });
  }

  #checkWin() {
    const user = this.users[0].id;
    const otherUser = this.users[1].id;
    const userKO = this.activeUnits[user].every(u => u.unit.knockedOut());
    const otherUserKO = this.activeUnits[otherUser].every(u => u.unit.knockedOut());
    if (userKO && otherUserKO) {
      this.gameOver = true;
      return true;
    } else if (userKO) {
      this.gameOver = true;
      return true;
      this.winner = otherUser;
    } else if (otherUserKO) {
      this.gameOver = true;
      this.winner = user;
      return true;
    }
    return false;
    // pass
  }

  executeCommands() {
    const user = this.users[0].id;
    const otherUser = this.users[1].id;
    let activeUnits = [...this.activeUnits[user], ...this.activeUnits[otherUser]];
    activeUnits.sort((a, b) => {
      return b.unit.speed - a.unit.speed || Math.random() - 0.5;
    });
    while (activeUnits.length) {
      const u = activeUnits.shift();
      if (u.unit.knockedOut()) continue;
      u.unit.startTurn({ self: u.unit });
      if (this.#checkWin()) return;
    }
    
    this.commands.sort((a, b) => {
      return b.priority - a.priority || b.speed - a.speed || Math.random() - 0.5;
    });
    while (this.commands.length) {
      this.#executeCommand();
      if (this.#checkWin()) return;
    }

    activeUnits = [...this.activeUnits[user], ...this.activeUnits[otherUser]];
    activeUnits.sort((a, b) => {
      return b.unit.speed - a.unit.speed || Math.random() - 0.5;
    });
    while (activeUnits.length) {
      const u = activeUnits.shift();
      if (u.unit.knockedOut()) continue;
      u.unit.endTurn({ self: u.unit });
      if (this.#checkWin()) return;
    }
  }
}