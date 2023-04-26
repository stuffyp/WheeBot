const { Stats } = require('../util/enums.js');
const Timer = require('./timer.js');

module.exports = class Modifier {
  static emptyModifier = new Modifier(Stats.None, () => { return });
  
  stat;
  modify;
  
  timer;
  constructor(params) {
    this.stat = params.stat;
    this.modify = params.modify;
    this.timer = new Timer(params.duration, params.onFinish);
  }
}