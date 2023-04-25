const { Stats } = require('../util/enums.js');

module.exports = class Modifier {
  static emptyModifier = new Modifier(Stats.None, () => { return; });
  
  stat;
  modify;
  
  duration;
  turnCount;
  constructor(stat, modify, duration) {
    this.stat = stat;
    this.modify = modify;
    this.duration = duration;
    this.turnCount = 0;
  }
}