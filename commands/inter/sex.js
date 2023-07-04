const { randElement, getRandomInt } = require("../../api/utils"),
    { vkGroup, Keyboard } = require("../../main"),
    strings = require("../../vars/strings.json");

module.exports = {
    r: /^sex( .*)?$/i,
    payload: "sex",
    async f(msg) {
        try {
            let { profiles } = await vkGroup.api.messages.getConversationMembers({
                peer_id: msg.peerId,
                fields: "online, first_name_acc, last_name_acc, first_name_dat, last_name_dat"
            });
            if (profiles.length == 1) return msg.send(`🚫 В беседе мало участников для данной функции`);

            profiles = randElement(profiles, 2);
            let f = profiles[0],
                s = profiles[1],
                types = getRandomInt(0, 1),
                params = {
                    keyboard: Keyboard.keyboard([
                        Keyboard.textButton({
                            label: '💞 Повторить',
                            payload: {
                                command: "sex"
                            },
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ]).inline()
                }
            if (types) {
                msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name} ${f.last_name}) ${randElement(["ебёт", "насилует"])} @id${s.id} (${s.first_name_acc} ${s.last_name_acc})`, params)
            } else {
                msg.send(`${msg.prefix}${randElement(["разумеется", "конечно же", "наверное", "инфа сотка", "я думаю", "возможно", "по моей информации"])} @id${f.id} (${f.first_name} ${f.last_name}) сосёт @id${s.id} (${s.first_name_dat} ${s.last_name_dat})`, params);
            }
        } catch (err) {
            msg.send(strings.chats.bot_isnt_admin);
        }
    }
}