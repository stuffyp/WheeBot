const Database = require("@replit/database");
const db = new Database();

db.list().then(async (keys) => {
  for (key of keys) {
    console.log(key);
    const val = await db.get(key);
    console.log(val);
  }
});
