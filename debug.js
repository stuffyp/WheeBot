const { Rarities } = require('./util/enums.js');
const Database = require("@replit/database");
const db = new Database();
const { startBattle } = require('./combat/combat-setup.js');
const { dump } = require('./combat/battle-storage.js');

console.log(dump());