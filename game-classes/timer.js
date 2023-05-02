module.exports = class Timer {
  duration;
  turnCount;
  onFinish;

  constructor(duration, onFinish = null) {
    this.duration = duration;
    this.turnCount = 0;
    this.onFinish = onFinish ?? ((params) => { return; });
  }

  tick() { this.turnCount++; }
  // activates only on the turn the timer finishes
  done() { return this.turnCount === this.duration; }
};