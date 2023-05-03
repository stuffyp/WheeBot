const { Mutex } = require('async-mutex');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Shop = require('./models/shop.js');

const { SortBy } = require('./util/enums.js');
const { getRarity } = require('./cards/read-cards.js');

const { SHOP_SIZE, SHOP_REFRESH } = require('./util/constants.js');
const { rollItems } = require('./items/read-items.js');

const { generateBattle, getCombatID, setCombatID } = require('./combat/battle-storage.js');

const { MONGO_SRV } = require('./config.json');
const databaseName = 'Cluster0';

const dbConnect = async () => {
    try {
        await mongoose.connect(
            MONGO_SRV, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: databaseName,
            },
        );
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
        throw err;
    }
};

const locks = {};
const shopLock = new Mutex();

const init = async () => {
    try {
        await dbConnect();
        const users = await User.find();
        users.forEach(user => {
            locks[user.userId] = new Mutex();
        });
    } catch (err) {
        console.error(`Error initializing: ${err}`);
        throw err;
    }
};

const getUser = async (id) => {
    // returns null if not found
    try {
        const user = await User.findOne({ userId: id });
        return user;
    } catch (err) {
        console.error(`Error getting user: ${err}`);
        throw err;
    }
};

const makeUser = async (id) => {
    locks[id] = new Mutex();
    const user = await resetUser(id);
    return user;
};

const resetUser = async (id) => {
    try {
        await locks[id].runExclusive(async () => {
            await User.deleteMany({ userId: id });

            // follows the defaults specified in the schema
            const newUser = new User({ userId: id, items: new Map() });
            const user = await newUser.save();
            return user;
        });
    } catch (err) {
        console.error(`Error setting user: ${err}`);
        throw err;
    }
};

// the callback should modify the User object and return it, not create a new one
const updateUser = async (id, callback) => {
    try {
        await locks[id].runExclusive(async () => {
            const user = await User.findOne({ userId: id });
            const update = await callback(user);
            if (update) {
                await update.save();
            }
        });
    } catch (err) {
        console.error(`Error updating user: ${err}`);
    }
};

const sortUser = async (userId, sortBy) => {
    const user = await getUser(userId);
    if (user === null) return;
    await updateUser(userId, (u) => {
        switch (sortBy) {
            case SortBy.ID:
                u.cardCollection = u.cardCollection.sort((a, b) => {
                    const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
                    return aRarity - bRarity || a.id.localeCompare(b.id) || a.level - b.level;
                });
                break;

            case SortBy.ID_r:
                u.cardCollection = u.cardCollection.sort((a, b) => {
                    const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
                    return bRarity - aRarity || b.id.localeCompare(a.id) || b.level - a.level;
                });
                break;

            case SortBy.Level:
                u.cardCollection = u.cardCollection.sort((a, b) => {
                    const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
                    return a.level - b.level || aRarity - bRarity || a.id.localeCompare(b.id);
                });
                break;

            case SortBy.Level_r:
                u.cardCollection = u.cardCollection.sort((a, b) => {
                    const [aRarity, bRarity] = [getRarity(a.id), getRarity(b.id)];
                    return b.level - a.level || bRarity - aRarity || b.id.localeCompare(a.id);
                });
                break;

            default:
                throw new Error(`Invalid sorting parameter: ${sortBy}`);
        }
        return u;
    });
};

const getShop = async () => {
    try {
        let shop = await Shop.findOne();
        if (shop === null) {
            shop = new Shop({
                lastUpdated: 0,
                items: [],
            });
        }
        if (Date.now() > shop.lastUpdated + SHOP_REFRESH) {
            await shopLock.runExclusive(async () => {
                if (Date.now() <= shop.lastUpdated + SHOP_REFRESH) return; // someone else already refreshed
                shop.lastUpdated = Date.now() - (Date.now() % SHOP_REFRESH);
                shop.items = rollItems(SHOP_SIZE);
                await shop.save();
            });
        }
        return shop;

    } catch (err) {
        console.error(`Error getting shop: ${err}`);
        throw err;
    }
};

const syncCombat = async (userId1, userId2) => {
    // deterministic ordering of Mutex requests to avoid deadlock
    const u1 = userId1 < userId2 ? userId1 : userId2;
    const u2 = userId1 < userId2 ? userId2 : userId1;
    let success = null;
    await locks[u1].runExclusive(async () => {
        await locks[u2].runExclusive(async () => {
            if (getCombatID(u1) || getCombatID(u2)) {
                success = 0;
                return;
            }
            const user1 = await getUser(u1);
            const user2 = await getUser(u2);
            if (!(user1.party.length && user2.party.length)) {
                success = -1;
                return;
            }
            const combatID = generateBattle();
            setCombatID(u1, combatID);
            setCombatID(u2, combatID);
            success = 1;
        });
    });
    return success;
};

// the callback should modify the User object and return it, not create a new one
const syncUpdate = async (userId1, userId2, callback) => {
    // deterministic ordering of Mutex requests to avoid deadlock
    const u1 = userId1 < userId2 ? userId1 : userId2;
    const u2 = userId1 < userId2 ? userId2 : userId1;
    await locks[u1].runExclusive(async () => {
        await locks[u2].runExclusive(async () => {
            const user1 = await getUser(u1);
            const user2 = await getUser(u2);
            const update = await callback(user1, user2);
            if (update) {
                const [new1, new2] = update;
                await new1.save();
                await new2.save();
            }
        });
    });
};

module.exports = {
    init,
    getUser,
    makeUser,
    resetUser,
    updateUser,
    sortUser,
    getShop,
    syncCombat,
    syncUpdate,
};