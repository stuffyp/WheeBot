const Listener = require('./listener.js');
const Modifier = require('./modifier.js');

module.exports = class ItemBuilder {
  listener;
  modifier;
  constructor() {
    this.listener = Listener.emptyListener;
    this.modifier = Modifier.emptyModifier;
  }

  setListener(listener) { this.listener = listener; }
  setModifier(modifier) { this.modifier = modifier; }
}