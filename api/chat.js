const { chats, db } = require("../main");

async function chatFromDb(vk) {
    vk = Array.isArray(vk) ? vk.map(Number) : [parseInt(vk)];
    if (vk.length == 1 && chats[vk[0]]) {
        chats[vk[0]].lifeTime = Date.now() + 60 * 1000;
        return { successful: true, error: 1, message: 'Пользователь уже загружен' };
    }
    let userList = await db.collection('chats').find({ chat_id: { $in: vk } }).toArray();
    if (!userList) return { successful: false, error: 2, message: 'Пользователь не найден' };
    userList.forEach(user => {
        if (!chats[user.chat_id]) chats[user.chat_id] = user;
        chats[user.chat_id].lifeTime = Date.now() + 60 * 1000;
        return user.chat_id;
    });
    return { successful: true, vk: userList };
}

exports.chatFromDb = chatFromDb;

async function saveChatsToDb(time) {
    let arr = Object.keys(chats).map(vk => {
        let chat = chats[vk];
        if (chats[vk].lifeTime && chats[vk].lifeTime <= Date.now()) {
            delete chats[vk].lifeTime;
            return;
        }
        if (!chats[vk].lifeTime && Date.now() - chats[vk].lastActivity > time * 1000) {
            delete chats[vk];
            return;
        }
        return { replaceOne: { filter: { _id: chat._id }, replacement: chat } };
    }).filter(x => x);
    if (arr.length) await db.collection('chats').bulkWrite(arr);
}

exports.saveChatsToDb = saveChatsToDb;

async function regChat(id) {
    await chatFromDb(id);
    if (chats[id]) return;
    chats[id] = {
        chat_id: id,
        settings: {
            on: true,
            disable_cmds: [],
            delay: 0,
            games: {
                casino: true,
                gun_game: true,
                bet: true
            }
        },
        members: {},
        stat: 0,
        lastActivity: +new Date()
    };
    return await db.collection("chats").insertOne(chats[id]);
};

exports.regChat = regChat;

setInterval(() => {
    saveChatsToDb();
}, 10000);