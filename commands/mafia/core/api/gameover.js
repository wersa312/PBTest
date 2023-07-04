const { getRandomId, Keyboard } = require("vk-io");
const { vkFromDb } = require("../../../../api/acc");
const { clubLink } = require("../../../../api/utils");
const { chats, vkGroup, db, users } = require("../../../../main");
const getShortNick = require("./getShortNick");
const roleToString = require("./roleToString");

module.exports = (id, type) => {
    let { mafia } = chats[id];

    let mafia_us = {
        winners: [],
        lossers: []
    }

    if (type == "mafia_win") {
        for (let i in mafia.users) {
            if (mafia.users[i].role == "don" || mafia.users[i].role == "mafia") {
                mafia_us.winners.push(parseInt(i));
            } else {
                mafia_us.lossers.push(parseInt(i));
            }
        }
        Object.keys(mafia.dead).forEach(i => mafia_us.lossers.push(parseInt(i)));
    } else {
        mafia_us.winners = Object.keys(mafia.users).map(Number);
        mafia_us.lossers = Object.keys(mafia.dead).map(Number);
    }

    vkGroup.api.messages.send({
        peer_id: (2e9 + parseInt(id)),
        message: `🏁 Игра завершена. Победили - ${clubLink(type == "mafia_win" ? 'мафиози' : 'мирные жители')}\n\n` +
            `🏆 Победители:\n` +
            `${mafia_us.winners.map(id => '🔹 ' + getShortNick(id, mafia.users[id]) + ' - ' + roleToString(mafia.users[id].role)).join('\n')}\n\n` +
            `👥 Проигравшие:\n` +
            `${mafia_us.lossers.map(id => '🔸 ' + (mafia.users[id] ? (getShortNick(id, mafia.users[id]) + " - " + roleToString(mafia.users[id].role)) : (getShortNick(id, mafia.dead[id]) + " - " + roleToString(mafia.dead[id].role)))).join('\n')}`,
        disable_mentions: 1,
        random_id: getRandomId()
    });
    delete chats[id].mafia;
    db.collection("mafia").deleteMany({ id: id });

    vkFromDb(mafia_us.winners).then(() => {
        mafia_us.winners.forEach(uid => {
            if (users[uid].mafcoin == null) users[uid].mafcoin = 0;
            users[uid].mafcoin += 20;
        });
        vkGroup.api.messages.send({
            user_ids: mafia_us.winners,
            random_id: getRandomId(),
            message: `🏆 За победу в игре мафия начислено 20 💴`,
            keyboard: Keyboard.keyboard([
                Keyboard.textButton({
                    label: '▶ В магазин',
                    payload: {
                        command: "mshop"
                    },
                    color: Keyboard.POSITIVE_COLOR
                })
            ]).inline()
        });
    });
}