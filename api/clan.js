const { users, clans, db } = require("../main"),
    { clan_bis } = require("../vars/clan.json"),
    { log, logClan } = require("../api/logs");

function updateClanBank(id) {
    try {
        if (clans[id].boost == null) return;
        if (((+new Date() - clans[id].boost.lastCheck) / 1000) > 3600) {
            let timeClan = (+new Date() - clans[id].boost.lastCheck),
                choursF = timeClan / (3600 * 1000),
                chours = Math.floor(choursF),
                cost = (choursF - chours) * 3600000;
            clans[id].boost.lastCheck = +new Date() - cost;
            for (let i in clans[id].boost.biz) {
                if (clans[id].bpc.indexOf(4) != -1) {
                    clans[id].bank += (clan_bis[clans[id].boost.biz[i]].per_hour * chours) * 1.5;
                } else {
                    clans[id].bank += clan_bis[clans[id].boost.biz[i]].per_hour * chours;
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function clanFromDb(vk) {
    vk = Array.isArray(vk) ? vk.map(Number) : [parseInt(vk)];
    if (vk.length == 1 && clans[vk[0]]) {
        clans[vk[0]].lifeTime = Date.now() + 60 * 1000;
        updateClanBank(vk[0]);
        return { successful: true, error: 1, message: 'Пользователь уже загружен' };
    }
    let userList = await db.collection('clans').find({ id: { $in: vk } }).toArray();
    if (!userList) return { successful: false, error: 2, message: 'Пользователь не найден' };
    userList.forEach(user => {
        if (!clans[user.id]) clans[user.id] = user;
        clans[user.id].lifeTime = Date.now() + 60 * 1000;
        updateClanBank(user.id);
        return user.id;
    });
    return { successful: true, vk: userList };
}

exports.clanFromDb = clanFromDb;

async function saveClansToDb(time) {
    let arr = Object.keys(clans).map(vk => {
        let clan = clans[vk];
        if (clans[vk].lifeTime && clans[vk].lifeTime <= Date.now()) {
            delete clans[vk].lifeTime;
            return;
        } else if (!clans[vk].lifeTime && Date.now() - clans[vk].lastActivity > time * 1000) {
            delete clans[vk];
            return;
        }
        return { replaceOne: { filter: { _id: clan._id }, replacement: clan } };
    }).filter(x => x);
    if (arr.length) await db.collection('clans').bulkWrite(arr);
    return;
}

setInterval(() => {
    saveClansToDb();
}, 10000);

exports.saveClansToDb = saveClansToDb;

async function registerClan(id, text) {
    let lastid = await db.collection('clans').findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
    if (!lastid) lastid = { id: 0 };
    clans[lastid.id + 1] = {
        id: lastid.id + 1,
        name: text,
        creator: id,
        members: {
            [id]: {
                rank: "основатель",
                rate: 0,
                rateweek: 0,
                joindate: +new Date()
            }
        },
        bank: 0,
        level: 1,
        rating: 0,
        wins: [],
        lose: [],
        bpc: [],
        points: 0,
        reg_date: +new Date()
    };
    users[id].clan = lastid.id + 1;
    users[id].money -= 1000000;
    await db.collection("clans").insertOne(clans[lastid.id + 1]);
    log(id, `Создал клан ${text} за $1,000,000`);
    logClan((lastid + 1), { type: "clan_create", name: text, created_by: id });
    return `🛡 Вы основали клан "${text}"`;
}

exports.registerClan = registerClan;