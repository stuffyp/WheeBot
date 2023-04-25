const Database = require("@replit/database")
const db = new Database()

db.list().then((keys) => {
  const promises = [];
  let count = 0;
  for (const key of keys) {
    if (key.startsWith('_u_')) {
      promises.push(db.delete(key));
      count++;
    }
  }
  Promise.all(promises).then(
    console.log(`Database cleared of ${count} item(s).`)
  );
});