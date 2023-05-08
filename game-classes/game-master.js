const { EmbedBuilder } = require('discord.js');
const { getCard } = require('../cards/read-cards.js');
const { getItem } = require('../items/read-items.js');
const { StatusEffects, Targets, Events } = require('../util/enums.js');
const { TYPE_EMOJI } = require('../util/constants.js');
const { rollChance, randInt } = require('../util/random.js');
const Unit = require('./unit.js');

const H_BAR = '──────────';
const MAX_ACTIVE_UNITS = 6;

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
  totalCommands; // checking for effort before awarding exp
  turn;
  idSeed;
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
    this.totalCommands = 0;
    this.turn = 0;
    this.idSeed = -1;
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
    for (let i = out.length - 1; i > 0; i--) {
      if (out[i] === H_BAR && out[i - 1] === H_BAR) out.splice(i, 1);
    }
    if (out.length === 1) out.splice(0);
    this.log = [];
    return out;
  }

  #flipUser(userId) {
    return this.users.find((u) => u.id !== userId).id;
  }

  loadUnit(cardFromDb, userId) {
    const { id, level, exp, fullID, item } = cardFromDb;
    const username = this.users.find(u => u.id === userId).name;
    const otherUser = this.#flipUser(userId);
    this.units[userId].push({
      user: userId,
      fullID: fullID,
      level: level,
      exp: exp,
      summoned: false,
      unit: new Unit(getCard(id))
        .setItem(item ? getItem(item).item : null)
        .setLog((text) => {
          this.log.push(text);
          // console.error(text);
        })
        .setLevel(level)
        .setName(username)
        .setUtilFuncs({
          enemies: () => this.activeUnits[otherUser].map(u => u.unit),
          allies: () => this.activeUnits[userId].map(u => u.unit),
          summonUnit: (card, summonLevel) => {
            if (this.activeUnits[userId].length >= MAX_ACTIVE_UNITS) return false;
            const summonedUnit = {
              user: userId,
              fullID: this.idSeed,
              level: summonLevel,
              exp: 0,
              summoned: true,
              unit: new Unit(card)
                .setLog((text) => { this.log.push(text); })
                .setLevel(summonLevel)
                .setName(username)
                .setUtilFuncs({
                    enemies: () => this.activeUnits[otherUser].map(u => u.unit),
                    allies: () => this.activeUnits[userId].map(u => u.unit),
                }),
            };
            summonedUnit.unit.onField = true;
            this.activeUnits[userId].push(summonedUnit);
            this.idSeed--;
            return true;
          },
        }),
    });
    return this;
  }


  setActiveUnit(userId, fullID) {
    const unit = this.units[userId].find(u => u.fullID === fullID);
    this.activeUnits[userId].push(unit);
    unit.unit.onField = true;
    this.units[userId] = this.units[userId].filter((u) => u.fullID !== fullID);
  }

  allUnits() {
    const user = this.users[0].id;
    const otherUser = this.users[1].id;
    return [
      ...this.activeUnits[user], ...this.activeUnits[otherUser],
      ...this.units[user], ...this.units[otherUser],
      ...this.graveyard[user], ...this.graveyard[otherUser],
    ].filter(u => !u.summoned);
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
    if (sub.unit.status === StatusEffects.Frighten) sub.unit.status = null;
    sub.unit.emitEvent(Events.OnSub, { self: sub.unit });
  }

  #cleanUpKO(userId) {
    // be aware that in JS, const subs = this.units[userId] apparently doesn't update when units is modified???
    const field = this.activeUnits[userId].filter(u => !(u.summoned && u.unit.knockedOut()));
    let subs = this.units[userId];
    while (subs.length && field.some((u) => u.unit.knockedOut())) {
      subs = this.units[userId];
      const outUnit = field.find(u => u.unit.knockedOut());
      this.substitute(userId, outUnit.fullID, subs[randInt(subs.length)].fullID);
      this.graveyard[userId].push(this.units[userId].pop()); // relies on assumption that substitute pushes to end
    }
    const leftover = field.filter(u => u.unit.knockedOut());
    this.activeUnits[userId] = field.filter(u => !u.unit.knockedOut());
    this.graveyard[userId].push(...leftover);
  }

  display() {
    const embeds = this.users.map(({ id, name }) => {
      const availableUnits = this.activeUnits[id].filter(u => !u.summoned).length + this.units[id].length;
      const totalUnits = availableUnits + this.graveyard[id].length;
      return new EmbedBuilder()
        .setTitle(`${name} (${availableUnits}/${totalUnits})`)
        .addFields(this.activeUnits[id].map((u) => {
          const cardTypes = u.unit.types.map((type) => TYPE_EMOJI[type]).join(' ');
          const healthDisplay = u.unit.rage() ? `**${u.unit.health}/${u.unit.maxHealth}**` : `${u.unit.health}/${u.unit.maxHealth}`;
          return ({
            name: u.unit.simpleName,
            value: `${u.unit.status ?? '❤️'}: ${healthDisplay}\n✨: ${u.unit.magic}/100\n\nTypes: ${cardTypes}`,
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
    if (command.agent.unit.knockedOut()) return; // unit ko before taking turn
    if (command.agent.unit.status === StatusEffects.Stun && rollChance(0.5)) {
      this.log.push(`**${command.agent.unit.name}** was stunned and passes their turn!`);
      return;
    }
    if (command.targetType !== Targets.Sub && command.agent.unit.status === StatusEffects.Frighten && rollChance(0.7)) {
      this.log.push(`**${command.agent.unit.name}** was frightened and passes their turn!`);
      return;
    }
    if (command.agent.unit.status === StatusEffects.Freeze) {
      this.log.push(`**${command.agent.unit.name}** was frozen and passes their turn!`);
      return;
    }
    if (command.agent.unit.magic < command.cost) {
      this.log.push(`**${command.agent.unit.name}** tried to use **${command.name}** but didn't have enough mana!`);
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
    const otherUser = this.#flipUser(user);
    command.agent.unit.magic -= command.cost;
    command.agent.unit.manaSpent += command.cost;
    command.execute({
      self: command.agent.unit,
      target: command.target ? command.target.unit : null,
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
    this.totalCommands += this.commands.length;
    this.log.push(H_BAR);
    const user = this.users[0].id;
    const otherUser = this.users[1].id;
    let activeUnits = [...this.activeUnits[user], ...this.activeUnits[otherUser]];
    activeUnits.sort((a, b) => {
      return b.unit.speed - a.unit.speed || Math.random() - 0.5;
    });
    while (activeUnits.length) {
      const u = activeUnits.shift();
      if (!u.unit.onField) continue;
      u.unit.startTurn({ self: u.unit });
      this.#cleanUpKO(user);
      this.#cleanUpKO(otherUser);
      if (this.#checkWin()) {
        this.log.push(H_BAR);
        return;
      }
    }

    this.log.push(H_BAR);
    this.commands.sort((a, b) => {
      return b.priority - a.priority || b.speed - a.speed || Math.random() - 0.5;
    });
    while (this.commands.length) {
      this.#executeCommand();
      this.log.push(H_BAR);
      if (this.#checkWin()) return;
    }

    activeUnits = [...this.activeUnits[user], ...this.activeUnits[otherUser]];
    activeUnits.sort((a, b) => {
      return b.unit.speed - a.unit.speed || Math.random() - 0.5;
    });
    while (activeUnits.length) {
      const u = activeUnits.shift();
      if (!u.unit.onField) continue;
      u.unit.endTurn({ self: u.unit });
      this.#cleanUpKO(user);
      this.#cleanUpKO(otherUser);
      if (this.#checkWin()) {
        this.log.push(H_BAR);
        return;
      }
    }
    this.log.push(H_BAR);

    this.turn++;
  }
};