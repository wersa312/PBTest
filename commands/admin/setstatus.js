const { getRandomId } = require("vk-io");
const { vkId, vkFromDb } = require("../../api/acc");
const { getAdmins } = require("../../api/admin_utils");
const { vkGroup, users } = require("../../main");

module.exports = [
    {
        r: /^setstatus ([\S]+) (.*)/i,
        status: 100,
        async f(msg, user) {
            let id = await vkId(msg.match[1]), text = msg.match[2];
            await vkFromDb(id);

            if (!users[id]) return msg.send(`🚫 Игрок не найден`);

            if (text == "clear") {
                delete users[id].customstatus;
            } else {
                users[id].customstatus = text;
            }

            msg.send("✅ Успешно");
            vkGroup.api.messages.send({
                random_id: getRandomId(),
                peer_ids: await getAdmins(),
                message:
                    `@id${msg.senderId} (${user.nick}) изменил фейк-статус игроку @id${id} (${users[id].nick})\n` +
                    `📃 Новый статус: ${text}`
            });
        }
    }
]