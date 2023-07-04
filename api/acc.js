const { users, db } = require("../main");
const { VK } = require('vk-io'),
    vkApi = new VK({
        token: ""
    });

function bankUpdate(id) {
    if (users[id].bank.last == null) users[id].bank.last = 0;
    if (users[id].bank.last + 86400000 >= Date.now() || users[id].bank.money >= 50000000000) return;
    users[id].bank.last = Date.now();
    users[id].bank.money += Math.floor(users[id].bank.money / 100 / 2);
}

async function vkFromDb(vk) {
    vk = Array.isArray(vk) ? vk.map(Number) : [parseInt(vk)];
    if (vk.length == 1 && users[vk[0]]) {
        users[vk[0]].lifeTime = Date.now() + 60 * 1000;
        bankUpdate(vk[0]);
        return { successful: true, error: 1, message: 'Пользователь уже загружен' };
    }
    let userList = await db.collection('users').find({ vk: { $in: vk } }).toArray();
    if (!userList) return { successful: false, error: 2, message: 'Пользователь не найден' };
    userList.forEach(user => {
        if (!users[user.vk]) users[user.vk] = user;
        users[user.vk].lifeTime = Date.now() + 60 * 1000;
        bankUpdate(user.vk);
        if (Array.isArray(users[user.vk].guns)) fixGun(user.vk);
        return user.vk;
    });
    return { successful: true, vk: userList };
}
exports.vkFromDb = vkFromDb;

async function saveUsersToDb(time) {
    let arr = Object.keys(users).map(vk => {
        let user = users[vk];
        if (users[vk].lifeTime && users[vk].lifeTime <= Date.now()) {
            delete users[vk].lifeTime;
            return;
        } else if (!users[vk].lifeTime && Date.now() - users[vk].lastActivity > time * 1000) {
            delete users[vk];
            return;
        }
        return { replaceOne: { filter: { _id: user._id }, replacement: user } };
    }).filter(x => x);
    if (arr.length) await db.collection('users').bulkWrite(arr);
}

exports.saveUsersToDb = saveUsersToDb;

setInterval(() => {
    saveUsersToDb(30);
}, 10000);

async function regAcc(id) {
    await vkFromDb(id);
    if (users[id]) return;
    let [infovk] = await vkApi.api.users.get({ user_ids: id });
    let lastid = await db.collection('users').findOne({}, { sort: { fake_id: -1 }, projection: { fake_id: 1 } });
    if (!lastid) lastid = { fake_id: 0 };
    users[id] = {
        vk: id,
        fake_id: lastid.fake_id + 1,
        nick: infovk.first_name,
        status: {
            type: 0,
            donatetime: {
                buyed: 0,
                days: 0
            }
        },
        money: 5000,
        vkcoin: 0,
        lvl: 1,
        exp: 0,
        coins: 0,
        cars: [],
        car: null,
        items: [],
        reg_date: Date.now(),
        fgun_id: null,
        guns: {},
        pistol_patrons: 10,
        snipe_patrons: 0,
        shotgun_patrons: 0,
        automatic_patrons: 0,
        pistol_automatic_patrons: 0,
        machine_gun_patrons: 0,
        other: {},
        business: {},
        bank: {
            money: 0
        },
        stat: {
            msg: 0,
            killed: 0,
            died: 0,
            win: 0,
            lose: 0,
            business: {
                profit: 0,
                lose: 0
            },
            bank: {
                money: 0
            }
        },
        captcha: {
            value: null,
            tried: 0,
            to: 0
        },
        skill: [{
            pistol: 1,
            automatic: 1,
            snipe: 1,
            pistol_automatic: 1,
            shotgun: 1,
            machine_gun: 1
        }],
        quests: {},
        doneq: {},
        gold: 0,
        lastActivity: Date.now(),
        limit: 0,
        limtime: 0
    };
    return await db.collection("users").insertOne(users[id]);
}

function fixGun(id) {
    try {
        let buffer = Object.assign(users[id].guns, {});
        users[id].fgun_id = buffer[users[id].fgun_id].name;
        users[id].guns = {};
        for (let i in buffer) {
            if (users[id].guns[buffer[i].name]) {
                users[id].guns[buffer[i].name].count++;
            } else {
                buffer[i].count = 1;
                users[id].guns[buffer[i].name] = buffer[i];
            }
        }
        return;
    } catch (err) {
        delete users[id].fgun_id;
    }
}

exports.regAcc = regAcc;

/**
 * 
 * @param {any} str 
 * @returns {Promise<Number>}
 */
function vkId(str) {
    str = str + "";
    return new Promise((r) => {
        if (str == "undefined") return r(-1);
        if (str.startsWith("[id")) {
            str = str.match(/id([0-9]+)/)[0].replace(/id/gi, "");
            r(str);
        } else if (str.split("/").length >= 2) {
            let s = str.split("/").length - 1;
            let linked = str.split("/")[s];
            vkApi.api.call("users.get", {
                user_ids: linked
            }).then(s => {
                r(s[0].id);
            }).catch(() => {
                r(-1);
            });
        } else {
            if (parseInt(str) > 10000000) {
                r(str);
                vkFromDb(str);
            } else {
                if (isNaN(parseInt(str))) {
                    db.collection("users").find({ shortnick: str }).limit(1).toArray((err, s) => {
                        if (s[0] == null) {
                            vkApi.api.call("users.get", {
                                user_ids: str
                            }).then(v => {
                                r(v[0].id);
                            }).catch(() => {
                                r(-1);
                            });
                        } else {
                            r(s[0].vk);
                        }
                    });
                } else {
                    db.collection("users").find({ fake_id: parseInt(str) }).limit(1).toArray((err, s) => {
                        if (s[0] == null) return r(-1);
                        r(s[0].vk);
                    });
                }
            }
        }
    });
}

exports.vkId = vkId;
