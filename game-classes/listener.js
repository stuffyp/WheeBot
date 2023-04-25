module.exports = class Listener {
  static emptyListener = new Listener([], (params) => { return; });
  
  triggers;
  doEffect; // returns any relevant text output
  name;
  constructor(triggers, doEffect, name=null) {
    this.triggers = triggers;
    this.name = name;
    this.doEffect = (event, params) => {
      if (triggers.includes(event)) return doEffect(params);
      return null;
    }
  }
}