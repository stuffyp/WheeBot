const { EmbedBuilder } = require('discord.js');
const { getCard } = require('../cards/read-cards.js');
const { getItem } = require('../items/read-items.js');
const { StatusEffects, Targets } = require('../util/enums.js');
const { rollChance, randInt } = require('../util/random.js');
const Unit = require('./unit.js');

module.exports = class GameMaster {
  users;
  units;
  activeUnits;
  graveyard;
  log;
  channel;
  winner;
  gameOver;
  commands;
  turn;
  constructor(channel) {
    this.users = [];
    this.units = {};
    this.activeUnits = {};
    this.graveyard = {};
    this.log = [];
    this.channel = channel;
    this.winner = null;
    this.gameOver = false;
    this.commands = [];
    this.turn = 0;
  }

  loadUser(id, name, elo) {
    this.users.push({
      id: id,
      name: name,
      elo: elo,
    });
    this.units[id] = [];
    this.activeUnits[id] = [];
    this.graveyard[id] = [];
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
    const { id, level, exp, fullID, item } = cardFromDb;
    const username = this.users.find(u => u.id === userId).name;
    this.units[userId].push({
      user: userId,
      fullID: fullID,
      level: level,
      exp: exp,
      unit: new Unit(getCard(id))
        .setItem(item ? getItem(item).item : null)
        .setLog((text) => this.log.push(text))
        .setLevel(level)
        .setName(username),
    });
    return this;
  }

  setActiveUnit(userId, fullID) {
    const unit = this.units[userId].find(u => u.fullID === fullID);
    this.activeUnits[userId].push(unit);
    unit.unit.onField = true;
    this.units[userId] = this.units[userId].filter((u) => u.fullID !== fullID);
  }

  substitute(userId, fullID1, fullID2) {
    const unitIndex = this.activeUnits[userId].findIndex(u => u.fullID === fullID1);
    const sub = this.units[userId].find(u => u.fullID === fullID2);
    if (!sub) {
      const intendedSub = [...this.activeUnits[userId], ...this.graveyard[userId]].find(u => u.fullID === fullID2);
      const intendedUnit = this.activeUnits[userId].find(u => u.fullID === fullID1);
      this.log.push(`${intendedUnit.unit.name} tried to swap out with ${intendedSub.unit.name} but failed!`);
      return;
    }
    sub.unit.onField = true;
    this.units[userId] = this.units[userId].filter(u => u.fullID !== fullID2);
    const unit = this.activeUnits[userId].splice(unitIndex, 1, sub)[0];
    unit.unit.onField = false;
    this.units[userId].push(unit);
    this.log.push(`${sub.unit.name} swapped in for ${unit.unit.name}!`);
  }

  #cleanUpKO(userId) {
    // be aware that in JS, const subs = this.units[userId] apparently doesn't update when units is modified???
    const field = this.activeUnits[userId];
    const subs = this.units[userId];
    while (subs.length && field.some((u) => u.unit.knockedOut())) {
      // console.error(subs, field);
      this.substitute(userId, field.find(u => u.unit.knockedOut()).fullID, subs[randInt(subs.length)].fullID);
      this.graveyard[userId].push(this.units[userId].pop()); // relies on assumption that substitute pushes to end
    }
    const leftover = field.filter(u => u.unit.knockedOut());
    this.activeUnits[userId] = field.filter(u => !u.unit.knockedOut());
    this.graveyard[userId].push(...leftover);
  }

  display() {
    const embeds = this.users.map(({ id, name }) => {
      const availableUnits = this.activeUnits[id].length + this.units[id].length;
      const totalUnits = availableUnits + this.graveyard[id].length;
      return new EmbedBuilder()
        .setTitle(`${name} (${availableUnits}/${totalUnits})`)
        .addFields(this.activeUnits[id].map((u) => {
          return ({
            name: u.unit.simpleName,
            value: `❤️: ${u.unit.health}/${u.unit.maxHealth}\n✨: ${u.unit.magic}/100`,
            inline: true,
          });
        }));
    });
    return embeds;
  }

  queueCommand(command) {
    this.commands = this.commands.filter((c) => !(c.agent.fullID === command.agent.fullID && c.agent.user === command.agent.user));
    this.commands.push(command);
  }

  #executeCommand() {
    const command = this.commands.shift();
    if (command.agent.unit.knockedOut()) {
      this.log.push(`${command.agent.unit.name} was knocked out and passes their turn!`);
      return;
    }
    if (command.agent.unit.status === StatusEffects.Stun && rollChance(0.5)) {
      this.log.push(`${command.agent.unit.name} was stunned and passes their turn!`);
      return;
    }
    if (command.agent.unit.magic < command.cost) {
      this.log.push(`${command.agent.unit.name} tried to use ${command.name} but didn't have enough mana!`);
      return;
    }

    switch (command.targetType) {
      case Targets.None:
        this.log.push(`**${command.agent.unit.name}** used **${command.name}**!`);
        break;
      case Targets.Field:
        if (!command.target.unit.onField) {
          this.log.push(`**${command.agent.unit.name}** tried to target **${command.target.unit.name}** with **${command.name}**, but failed due to a change in formation!`);
          return;
        }
        this.log.push(`**${command.agent.unit.name}** targeted **${command.target.unit.name}** with **${command.name}**!`);
        break;
      case Targets.Sub:
        if (command.target.unit.onField) {
          this.log.push(`**${command.agent.unit.name}** tried to target **${command.target.unit.name}** with **${command.name}**, but failed due to a change in formation!`);
          return;
        }
        this.log.push(`**${command.agent.unit.name}** targeted **${command.target.unit.name}** with **${command.name}**!`);
        break;
      default:
        break;
    }

    const user = command.agent.user;
    const otherUser = this.users.find((u) => u.id !== user).id;
    command.agent.unit.magic -= command.cost;
    command.agent.unit.mostRecentCost = command.cost;
    command.execute({
      self: command.agent.unit,
      target: command.target ? command.target.unit : null,
      allies: this.activeUnits[user].map(u => u.unit),
      enemies: this.activeUnits[otherUser].map(u => u.unit),
      sub: () => {
        if (command.agent.unit.status === StatusEffects.Trapped) {
          this.log.push(`${command.agent.unit.name} tried to swap out but was trapped!`);
          return;
        }
        this.substitute(user, command.agent.fullID, command.target.fullID);
      },
    });
    this.#cleanUpKO(user);
    this.#cleanUpKO(otherUser);
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
      this.winner = otherUser;
      return true;
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

    this.turn++;
  }
};