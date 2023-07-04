const { vkGroup, db, users } = require("../../../../main");
const { sortRandom } = require("../../../../api/utils");
const getShortNick = require("../api/getShortNick");
const { Keyboard, getRandomId } = require("vk-io");
const send = async (obj) => {
    return await vkGroup.api.messages.send(Object.assign({}, obj, { random_id: getRandomId() }));
};

module.exports = async (mafia, md) => {
    md.time = ((+new Date()) + (mafia.settings.timeout.vote * 60 * 1000));
    await db.collection("mafia").updateOne({ id: md.id }, { $set: md });

    mafia.phase = "vote2";

    let game_users = Object.keys(mafia.users);

    send({
        peer_ids: game_users.join(','),
        message: '💀 Время линчевать кого-то',
        keyboard: Keyboard.keyboard(game_users.sort(sortRandom).map(id => {
            return Keyboard.textButton({
                label: getShortNick(id, mafia.users[id], false),
                payload: {
                    command: "mafia_linch_vote",
                    params: {
                        chat_id: md.id,
                        user_id: id
                    }
                }
            })
        })).oneTime()
    });

    send({
        message: '💀 Время линчевать кого-то',
        chat_id: md.id,
        keyboard: Keyboard.keyboard([
            Keyboard.urlButton({
                label: "ЛС ↗",
                url: `https://vk.com/write-151782797`
            })
        ]).inline(),
    });
}