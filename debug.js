const { Rarities } = require('./util/enums.js');
const Database = require("@replit/database");
const db = new Database();

db.get('_u_452528837490638859').then(userData => {
  userData.combatID = null;
  db.set('_u_452528837490638859', userData);
});

db.get('_u_353546933224341505').then(userData => {
  userData.combatID = null;
  db.set('_u_353546933224341505', userData);
});