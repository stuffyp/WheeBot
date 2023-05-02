const Listener = require('./listener.js');
const Modifier = require('./modifier.js');

module.exports = class ItemBuilder {
  listeners;
  modifiers;
  consume;
  name;
  constructor() {
    this.listeners = [];
    this.modifiers = [];
    // should be modified
    this.name = '0xDEADBEEF';
    this.consume = (params) => { return; };
  }

  addListener(params) { this.listeners.push(new Listener(params)); return this; }
  addModifier(params) { this.modifiers.push(new Modifier(params)); return this; }
  setConsume(consume) { this.consume = consume; return this; }
  setName(name) { this.name = name; return this; }
};