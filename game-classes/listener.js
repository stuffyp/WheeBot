const Timer = require('./timer.js');

module.exports = class Listener {
  static emptyListener = new Listener([], (params) => { return });
  
  triggers;
  doEffect;
  name;
  
  timer;
  constructor(params) {
    this.triggers = params.triggers;
    this.timer = new Timer(params.duration, params.onFinish);
    this.name = params.name;
    this.doEffect = (event, eParams) => {
      if (this.triggers.includes(event)) return params.doEffect(eParams);
      return null;
    }
  }

  time
}