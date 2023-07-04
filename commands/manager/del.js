const { vkId } = require("../../api/acc");
const { vkManager } = require("../../main");
const chats = require("../../vars/manage.json")

module.exports = [
    {
        mr: /^(?:кик|del)(?: ([\S]+)(?: .*)?)$/i,
        async f(msg, user) {
            let id;
            if (msg.hasReplyMessage) id = msg.replyMessage.senderId; else if (msg.hasForwards) id = msg.forwards[0].senderId;

            if (!id && msg.match[1]) {
                id = await vkId(msg.match[1]);
                if (id == -1) return msg.send(`🚫 Игрок не найден`);
            }

            if (!id) return;

            try {
                await vkManager.api.messages.removeChatUser({ user_id: id, chat_id: msg.chatId });
                user.admin_events.kicked++;
                user.cookie += 500;
            } catch (err) {
                msg.send(`🚫 Не найден в беседе`);
            }
        }
    },
    {
        mr: /^(?:s|с)(?:кик|del)(?: ([\S]+)(?: .*)?)$/i,
        async f(msg, user) {
            let id;
            if (msg.hasReplyMessage) id = msg.replyMessage.senderId; else if (msg.hasForwards) id = msg.forwards[0].senderId;

            if (!id && msg.match[1]) {
                id = await vkId(msg.match[1]);
                if (id == -1) return msg.send(`🚫 Игрок не найден`);
            }

            if (!id) return;

            user.admin_events.kicked++;
            user.cookie += 500;
            msg.send('✅ Исключен со всех бесед');

            for (let i in chats) {
                vkManager.api.messages.removeChatUser({ user_id: id, chat_id: i - 2e9 }).catch(() => { });
            }
        }
    }
]