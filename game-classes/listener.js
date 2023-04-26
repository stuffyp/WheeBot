const Timer = require('./timer.js');

module.exports = class Listener {
  static emptyListener = new Listener([], (params) => { return });
  
  triggers;
  doEffect; // returns any relevant text output
  name;
  
  timer;
  constructor(params) {
    this.triggers = params.triggers;
    this.timer = new Timer(params.duration, params.onFinish);
    this.name = params.name;
    this.doEffect = (event, params) => {
      if (triggers.includes(event)) return params.doEffect(params);
      return null;
    }
  }

  time
}