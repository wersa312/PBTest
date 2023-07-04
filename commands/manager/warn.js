const { getRandomId } = require("vk-io");
const { vkFromDb, vkId } = require("../../api/acc");
const { getAdmins } = require("../../api/admin_utils");
const { users, vkManager, vkGroup } = require("../../main");

module.exports = [
    {
        mr: /^(?:пред(?:упреждение)?|warn)(?: (.*))?$/i,
        /**
         * 
         * @param {import("vk-io").MessageContext} msg 
         */
        async f(msg, user) {
            let id;
            if (msg.hasReplyMessage) id = msg.replyMessage.senderId; else if (msg.hasForwards) id = msg.forwards[0].senderId;
            if (!id) return;

            await vkFromDb(id);
            if (!users[id]) {
                await msg.send(`🚫 Исключен из беседы, так как не зарегистрирован в боте`);
                return vkManager.api.messages.removeChatUser({ user_id: id, chat_id: msg.chatId });
            }

            if (!users[id].warn) users[id].warn = 0;
            users[id].warn++;

            if (users[id].warn < 3) {
                msg.send(
                    `⚠ Игроку @id${id} (${users[id].nick}) выдано предупреждение [${users[id].warn}/3]\n` +
                    `#warn${id}`
                );

                user.cookie += 300;
                user.admin_events.warn_gived++;
            } else {
                await msg.send(
                    `⚠ Игрок @id${id} (${users[id].nick}) был исключен из беседы\n` +
                    `#warn${id} #kick${id}`
                );
                vkManager.api.messages.removeChatUser({ user_id: id, chat_id: msg.chatId });
                user.cookie += 500;
                user.admin_events.kicked++;
            }
        }
    },
    {
        r: /^unwarn(?: ([\S]+))$/i,
        status: 100,
        async f(msg, user) {
            let id = await vkId(msg.match[1]);
            await vkFromDb(id);

            if (!users[id]) return;
            if (!users[id].warn) return msg.send(`🚫 У данного пользователя нет варнов`);

            users[id].warn = 0;
            msg.send(`✅ Игроку @id${id} (${users[id].nick}) сняты варны`);
            vkManager.api.messages.send({
                user_ids: await getAdmins(),
                message: `⚠ Администратор @id${msg.senderId} (${user.nick}) снял варны игроку @id${id} (${users[id].nick})\n#warns`,
                random_id: getRandomId()
            });
        }
    }
]