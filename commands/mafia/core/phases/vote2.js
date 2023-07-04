const { vkGroup, db } = require("../../../../main");
const getShortNick = require("../api/getShortNick");
const { Keyboard, getRandomId } = require("vk-io");
const send = async (obj) => {
    return await vkGroup.api.messages.send(Object.assign({}, obj, { random_id: getRandomId() }));
};
const mafia_default = require("../../mafia_default.json")

module.exports = async (mafia, md) => {
    md.time = ((+new Date()) + (mafia.settings.timeout.vote * 60 * 1000));
    await db.collection("mafia").updateOne({ id: md.id }, { $set: md });

    mafia.phase = "day";

    let votes = {};

    for (let i in mafia.linchvote) {
        let id = mafia.linchvote[i];
        if (!votes[id]) votes[id] = 0;
        votes[id]++;
    }

    let [id1, id2] = Object.keys(votes).sort((a, b) => votes[b] - votes[a]);

    if (votes[id1] == votes[id2]) {
        send({ peer_id: 2000000000 + md.id, message: "💀 Голоса разошлись. Сегодня никто не был повешан." });
        md.time = 0;
        mafia.linchvote = JSON.parse(JSON.stringify(mafia_default.linchvote));
        await db.collection("mafia").updateOne({ id: md.id }, { $set: md });
    } else {
        let toSend = Object.keys(mafia.users);
        toSend.splice(toSend.indexOf(id1 + ""), 1);
        mafia.votetokill.id = id1;
        mafia.votetokill.text = `💀 Голосование окончено. Линчуем ${getShortNick(id1, mafia.users[id1])}?`;
        vkGroup.api.messages.send({
            chat_id: md.id,
            message: mafia.votetokill.text,
            keyboard: Keyboard.keyboard([
                Keyboard.urlButton({
                    label: "ЛС ↗",
                    url: `https://vk.com/write-151782797`
                })
            ]).inline(),
            random_id: getRandomId()
        });
        vkGroup.api.messages.send({
            random_id: getRandomId(),
            peer_ids: toSend.join(','),
            message: mafia.votetokill.text,
            keyboard: Keyboard.keyboard([[
                Keyboard.callbackButton({
                    label: "👍🏻",
                    payload: {
                        command: "mafia_linch_final_vote",
                        params: {
                            chat_id: md.id,
                            kill: true
                        }
                    },
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.callbackButton({
                    label: "👎🏻",
                    payload: {
                        command: "mafia_linch_final_vote",
                        params: {
                            chat_id: md.id,
                            kill: false
                        }
                    },
                    color: Keyboard.NEGATIVE_COLOR
                })
            ]]).inline().oneTime()
        });

    }
}