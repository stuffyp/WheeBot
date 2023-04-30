module.exports = class Command {
  agent;
  target;
  execute;
  priority;
  speed;
  constructor() {
    this.agent = null;
    this.target = null;
    this.execute = () => { return };
  }

  setAgent(agent) {
    this.agent = agent;
    return this;
  }

  setTarget(target) {
    this.target = target;
    return this;
  }

  setExecute(execute) {
    this.execute = execute;
    return this;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setPriority(priority) {
    this.priority = priority;
    return this;
  }
}