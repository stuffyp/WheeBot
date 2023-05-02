module.exports = class Command {
  agent;
  target;
  targetType;
  name;
  execute;
  priority;
  speed;
  constructor() {
    this.agent = null;
    this.target = null;
    this.name = '0xDEADBEEF';
    this.execute = () => { return; };
  }

  setAgent(agent) {
    this.agent = agent;
    return this;
  }

  setTarget(target) {
    this.target = target;
    return this;
  }

  setTargetType(targetType) {
    this.targetType = targetType;
    // field, none, or sub
    return this;
  }

  setName(name) {
    this.name = name;
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
};