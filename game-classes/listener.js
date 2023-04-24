module.exports = class Listener {
  static emptyListener = new Listener([], (...gameState) => { return; });
  
  triggers;
  doEffect;
  name;
  constructor(triggers, doEffect, name=null) {
    this.triggers = triggers;
    this.name = name;
    this.doEffect = (event, ...gameState) => {
      if (triggers.includes(event)) doEffect(...gameState);
    }
  }
}