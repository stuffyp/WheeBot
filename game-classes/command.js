module.exports = class Command {
  agent;
  targets;
  execute;
  priority;
  speed;
  constructor() {
    this.agent = null;
    this.targets = [];
    this.execute = () => { return };
  }

  setAgent(agent) {
    this.agent = agent;
    return this;
  }

  addTarget(target) {
    this.targets.push(target);
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