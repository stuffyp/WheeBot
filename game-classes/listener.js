module.exports = class Listener {
  static emptyListener = new Listener([], (params) => { return; });
  
  triggers;
  doEffect; // returns any relevant text output
  name;
  
  duration;
  turnCount;
  constructor(triggers, doEffect, duration, name=null) {
    this.triggers = triggers;
    this.duration = duration;
    this.turnCount = 0;
    this.name = name;
    this.doEffect = (event, params) => {
      if (triggers.includes(event)) return doEffect(params);
      return null;
    }
  }
}